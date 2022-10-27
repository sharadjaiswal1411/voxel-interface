// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "hardhat/console.sol";

interface IRewardToken is IERC20 {
    
}

contract NftStaking is Ownable, ERC721Holder, Pausable {
    struct poolInfo {
        IERC721  nft;
        IRewardToken rewardToken;
        uint256 stakedTotal;
        uint256  lockTime;
        uint256  rewardsPerDay;
   }

   poolInfo public PoolInfo;
  
   struct Staker {
        uint256[] tokenIds;
        mapping(uint256 => uint256) tokenStakingCoolDown;
        uint256 balance;
        uint256 rewardsReleased;
    }

    /// @notice mapping of a staker to its wallet
    mapping(address => Staker) public stakers;

    /// @notice Mapping from token ID to owner address

    mapping(uint256 => address) public tokenOwner;


    /// @notice event emitted when a user has staked a nft

    event Staked(address owner, uint256 amount);

    /// @notice event emitted when a user has unstaked a nft
    event Unstaked(address owner, uint256 amount);

    /// @notice event emitted when a user claims reward
    event RewardPaid(address indexed user, uint256 reward);

    /// @notice Allows reward tokens to be claimed
    event ClaimableStatusUpdated(bool status);

    /// @notice Emergency unstake tokens without rewards
    event EmergencyUnstake(address indexed user, uint256 tokenId);

    constructor(IERC721 _nft, IRewardToken _rewardToken, uint256 _rewardPerDay, uint256 _lockTime ) {
   
     PoolInfo= poolInfo({
      nft:_nft,
      rewardToken:_rewardToken,
      stakedTotal:0,
      rewardsPerDay:_rewardPerDay,
      lockTime:_lockTime
    });

    }

  /***
   * @dev Updates nft min lock time in seconds.
   * @param _locktime Locktime value.
   */
  function updateNftMinLockTime(uint256 _locktime) external onlyOwner {
    PoolInfo.lockTime = _locktime;
  }

   /***
   * @dev Updates nft min lock time in seconds.
   * @param _locktime Locktime value.
   */
  function UpdateRewardsPerDay(uint256 _rewardsPerDay) external onlyOwner {
    PoolInfo.rewardsPerDay = _rewardsPerDay;
  }

    function getStakedTokens(address _user)
        public
        view
        returns (uint256[] memory tokenIds)
    {
        return stakers[_user].tokenIds;
    }

    function stake(uint256 tokenId) public whenNotPaused{
        _stake(msg.sender, tokenId);
    }

    function stakeBatch(uint256[] memory tokenIds) public whenNotPaused{
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _stake(msg.sender, tokenIds[i]);
        }
    }

    function _stake(address _user, uint256 _tokenId) internal {
   
        require(
            PoolInfo.nft.ownerOf(_tokenId) == _user,
            "user must be the owner of the token"
        );
        Staker storage staker = stakers[_user];

        staker.tokenIds.push(_tokenId);
        staker.tokenStakingCoolDown[_tokenId] = block.timestamp;
        tokenOwner[_tokenId] = _user;
        PoolInfo.nft.approve(address(this), _tokenId);
        PoolInfo.nft.safeTransferFrom(_user, address(this), _tokenId);
        updateReward(msg.sender);
        emit Staked(_user, _tokenId);
        PoolInfo.stakedTotal++;
    }

    function unstake(uint256 _tokenId) public whenNotPaused{
        if(stakers[msg.sender].balance > 0)
         claimReward(msg.sender);
         
        _unstake(msg.sender, _tokenId);
    }

    function unstakeBatch(uint256[] memory tokenIds) public whenNotPaused{
        claimReward(msg.sender);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (tokenOwner[tokenIds[i]] == msg.sender) {
                _unstake(msg.sender, tokenIds[i]);
            }
        }
    }

    // Unstake without caring about rewards. EMERGENCY ONLY.
    function emergencyUnstake(uint256 _tokenId) public whenNotPaused {
        require(
            tokenOwner[_tokenId] == msg.sender,
            "nft._unstake: Sender must have staked tokenID"
        );
        _unstake(msg.sender, _tokenId);
        emit EmergencyUnstake(msg.sender, _tokenId);
    }

    function _unstake(address _user, uint256 _tokenId) internal {
        require(
            tokenOwner[_tokenId] == _user,
            "Must be the owner of the staked nft"
        );
        Staker storage staker = stakers[_user];
        
        if (staker.tokenIds.length > 0) {
            staker.tokenIds.pop();
        }
        staker.tokenStakingCoolDown[_tokenId] = 0;
        delete tokenOwner[_tokenId];

        PoolInfo.nft.safeTransferFrom(address(this), _user, _tokenId);
        updateReward(msg.sender);
        emit Unstaked(_user, _tokenId);
        PoolInfo.stakedTotal--;
    }

    function updateReward(address _user) public {
        
        Staker storage staker = stakers[_user];
        uint256[] storage ids = staker.tokenIds;
        for (uint256 i = 0; i < ids.length; i++) {
            if (
                staker.tokenStakingCoolDown[ids[i]] <
                block.timestamp + PoolInfo.lockTime &&
                staker.tokenStakingCoolDown[ids[i]] > 0
            ) {
            
                uint256 stakedDays = ((block.timestamp - uint(staker.tokenStakingCoolDown[ids[i]]))) / PoolInfo.lockTime;
                uint256 partialTime = ((block.timestamp - uint(staker.tokenStakingCoolDown[ids[i]]))) % PoolInfo.lockTime;  
                staker.balance +=  PoolInfo.rewardsPerDay * stakedDays;
                staker.tokenStakingCoolDown[ids[i]] = block.timestamp + partialTime;
                //console.logUint(staker.tokenStakingCoolDown[ids[i]]);
                //console.logUint(staker.balance);
            }
        }
    }

    function viewRewards(address _user) public view returns (uint256){
        Staker storage staker = stakers[_user];
        uint256[] storage ids = staker.tokenIds;
        uint256 balance=staker.balance;
        for (uint256 i = 0; i < ids.length; i++) {
            if (
                staker.tokenStakingCoolDown[ids[i]] <
                block.timestamp + PoolInfo.lockTime &&
                staker.tokenStakingCoolDown[ids[i]] > 0
            ) {
            
                uint256 stakedDays = ((block.timestamp - uint(staker.tokenStakingCoolDown[ids[i]]))) / PoolInfo.lockTime;
        
                balance += PoolInfo.rewardsPerDay * stakedDays;
                
            }
        }
        return balance;
    }
 
    function claimReward(address _user) public whenNotPaused{
        require(stakers[_user].balance > 0 , "0 rewards yet");
        updateReward(msg.sender);
        stakers[_user].rewardsReleased += stakers[_user].balance;
        PoolInfo.rewardToken.transfer(_user, stakers[_user].balance);
        stakers[_user].balance = 0;
        emit RewardPaid(_user, stakers[_user].balance);
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