// SPDX-License-Identifier: MIT LICENSE

pragma solidity 0.8.10;

import "./NftStaking.sol";

contract NftStakingFactory is Ownable {

  struct vaultInfo {
        address  nft;
        address rewardToken;
        address stakingContract;
        uint256  poolId;
        string  name;
        string logoURI;
  }

  vaultInfo[] public VaultInfo;
  
  NftStaking stakingContract;

 function addVault(
        IERC721 _nft,
        IRewardToken _token,
        uint256 _rewardPerDay,
        uint256 _lockTime,
        string calldata _name,
        string calldata _logoURI

    ) public onlyOwner{

        stakingContract = new NftStaking(_nft,_token,_rewardPerDay,_lockTime);
      
        VaultInfo.push(
            vaultInfo({
                nft: address(_nft),
                stakingContract:address(stakingContract),
                rewardToken: address(_token),
                poolId:VaultInfo.length,
                name:_name,
                logoURI:_logoURI        
            })
        );

        stakingContract.transferOwnership(msg.sender);


    }
 function listVaults() public view returns ( vaultInfo[] memory) {
            return VaultInfo;   
  }

  function removeVault(uint256 index) public onlyOwner{
       if (index >= VaultInfo.length) return;
        for (uint i = index; i<VaultInfo.length-1; i++){
            VaultInfo[i] = VaultInfo[i+1];
            
        }
        delete VaultInfo[VaultInfo.length-1];
       
  }
  
}