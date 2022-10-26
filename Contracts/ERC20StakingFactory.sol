// SPDX-License-Identifier: MIT LICENSE

pragma solidity 0.8.10;

import "./ERC20Staking.sol";

contract ERC20StakingFactory is Ownable {

  struct vaultInfo {
        address stakedToken;
        address rewardToken;
        address stakingContract;
  }

  vaultInfo[] public VaultInfo;
  
  ERC20Staking stakingContract;

 function addVault(
        address _stakedToken,address _rewardToken, uint256 _lockPeriod, uint256 _minStakeRequired, uint256 _apy, uint256 _closingIn
    ) public onlyOwner{

        stakingContract = new ERC20Staking(_stakedToken,_rewardToken,_lockPeriod,_minStakeRequired,_apy,_closingIn);
      
        VaultInfo.push(
            vaultInfo({
                stakedToken: _stakedToken,
                rewardToken:_rewardToken,
                stakingContract: address(stakingContract)
            })
        );

        stakingContract.transferOwnership(msg.sender);

    }
  function listVaults() public view returns ( vaultInfo[] memory) {
            return VaultInfo;   
  }
  
}