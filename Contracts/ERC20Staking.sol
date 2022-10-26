// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @notice Keep Reward Token allowance of owner for this Smart Contract enough to pay rewards.
 * @dev Staking Smart Contract for VXLLaunchpool.
 */
contract ERC20Staking is Ownable, Pausable {
  struct Stake {
    uint256 timeAt; //  stake made at
    uint256 lockPeriodUntil;  //  timeAt + lockPeriod. Rewars will be calculated until this time.
  }

  uint256 constant SECONDS_IN_YEAR = 31536000;

  struct poolInfo {
        address stakedToken;
        address rewardToken;
        uint256 lockPeriod;
        uint256 minStakeRequired; //  stake amount required to be made
        uint256 apy;
        uint256 closingIn;
        uint256 totalStaked;

  }

  poolInfo public PoolInfo;
  mapping(address => Stake) public stakeOf;
  mapping(address => uint256) public minStakeRequiredOf; //  stake made by address
  event StakeMade(address indexed _from);
  event UnstakeMade(address indexed _from);
  event RewardWithdrawn(address indexed _to, uint256 indexed _amount);


  /***
   * @dev Constructor.
   * @param _versusToken VersusToken address.
   * @param _lockPeriod Lock period in seconds, during which stake cannt be unstaken.
   * @param _minStakeRequired Stake amount to be made.
   */
  constructor(address _stakedToken,address _rewardToken, uint256 _lockPeriod, uint256 _minStakeRequired, uint256 _apy,uint256 _closingIn) {
    PoolInfo= poolInfo({
      stakedToken:_stakedToken,
      rewardToken:_rewardToken,
      lockPeriod:_lockPeriod,
      minStakeRequired:_minStakeRequired,
      apy:_apy,
      closingIn:_closingIn+block.timestamp,
      totalStaked:0
    });

  }

  /***
   * @dev Updates APY.
   * @param _apy APY value.
   */
  function updateAPY(uint256 _apy) external onlyOwner {
    PoolInfo.apy = _apy;
  }

  
  /***
   * @dev Updates minStakeRequired.
   * @param _minStakeRequired Stake amount to be updated to.
   */
  function updateminStakeRequired(uint256 _minStakeRequired) external onlyOwner {
    PoolInfo.minStakeRequired = _minStakeRequired;
  }

  /***
   * @dev Updates lockPeriod in seconds.
   * @param _lockPeriod Lock period in seconds.
   */
  function updateLockPeriod(uint256 _lockPeriod) external onlyOwner {
    PoolInfo.lockPeriod = _lockPeriod;
  }

  /***
   * @dev Gets Reward Token balance for this Smart Contract.
   * @return Reward Token balance.
   */
  function getRewardBalance() external view returns (uint256) {
    return IERC20(PoolInfo.rewardToken).balanceOf(address(this));
  }

  /***
   * @dev Makes stake.
   */
  function stake(uint256 _amount) external whenNotPaused {
    require(_amount > PoolInfo.minStakeRequired, "Minimum stake required");
    require(PoolInfo.closingIn>block.timestamp,"Staking is closed");
    require(IERC20(PoolInfo.stakedToken).transferFrom(msg.sender, address(this), _amount), "Transfer failed");
    uint256 rewards = calculateAvailableReward();
    
    if(rewards>0)
     withdrawAvailableReward();
    stakeOf[msg.sender] = Stake(block.timestamp, block.timestamp + PoolInfo.lockPeriod);
    minStakeRequiredOf[msg.sender] = minStakeRequiredOf[msg.sender]+_amount;
    PoolInfo.totalStaked=PoolInfo.totalStaked+_amount;
    emit StakeMade(msg.sender);
  }


  /***
   * @dev Get pool details for this Smart Contract.
   * @return Pool with totalStaked & user Rewards.
   */
  function getPoolInfo() external view returns (poolInfo memory, uint256) {
    uint256 rewards =_calculateAvailableReward(msg.sender);
    return (PoolInfo, rewards);
  
  }


  function _calculateAvailableReward(address _sender) internal view returns (uint256){
      if (stakeOf[_sender].timeAt == 0) {
        return 0;
      }

      if (stakeOf[_sender].timeAt >= stakeOf[_sender].lockPeriodUntil) {
        return 0;
      }
      uint256 rewardPeriod;
      if (block.timestamp < stakeOf[_sender].lockPeriodUntil) {
        rewardPeriod = block.timestamp - stakeOf[_sender].timeAt;
      } else {
        rewardPeriod = stakeOf[_sender].lockPeriodUntil - stakeOf[_sender].timeAt;
      }
      
      uint256 percentagePerSec = (PoolInfo.apy * 1 ether) / (SECONDS_IN_YEAR*100);
      uint256 amount = ((minStakeRequiredOf[_sender] * percentagePerSec) * rewardPeriod) / 100 ether;   //  ((2*10^18 * 9512937595129) * 12345) / (100 * 10^18) = 2348744292237350 wei == 0.2348744292237350 VERSUS. 100 ether = 1 ether & 100%
      return amount;
    }


  /***
   * @dev Calculates available VERSUS reward since stake made to date.
   * @return Available reward.
   */
  function calculateAvailableReward() public view returns (uint256) {
    return _calculateAvailableReward(msg.sender);
  }

  /***
   * @dev Withdraws available reward.
   */
  function withdrawAvailableReward() public whenNotPaused {
    uint256 rewards = calculateAvailableReward();
    require(rewards > 0, "No reward");
    require(IERC20(PoolInfo.rewardToken).balanceOf(address(this)) >= rewards, "Withdraw is paused");

    IERC20(PoolInfo.rewardToken).transferFrom(owner(), msg.sender, rewards);
    
    stakeOf[msg.sender].timeAt = block.timestamp;

    emit RewardWithdrawn(msg.sender, rewards);
  }

  /**
   * @dev Makes unstake.
   */
  function unstake() external whenNotPaused {
    require(stakeOf[msg.sender].timeAt > 0, "no stake");
    require(stakeOf[msg.sender].lockPeriodUntil < block.timestamp, "too early");

    if (calculateAvailableReward() > 0) {
      withdrawAvailableReward();
    }
    delete stakeOf[msg.sender];
    
    IERC20(PoolInfo.stakedToken).transfer(msg.sender, minStakeRequiredOf[msg.sender]);

    PoolInfo.totalStaked=PoolInfo.totalStaked-minStakeRequiredOf[msg.sender];
    
    emit UnstakeMade(msg.sender);
  }

  /**
   * Pausable
   */

  /***
   * @dev Pauses or unpauses.
   * @param _isPause Whether should pause or unpause.
   */
  function pause(bool _isPause) external onlyOwner {
    _isPause ? _pause() : _unpause();
  }
}
