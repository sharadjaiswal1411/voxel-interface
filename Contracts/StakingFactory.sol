// SPDX-License-Identifier: MIT LICENSE

pragma solidity 0.8.4;

import "./NftStaking.sol";

contract StakingFactory is Ownable {

  struct vaultInfo {
        address nft;
        address token;
        address stakingContract;
        string  name;
        string logoURI;
        uint256 rewardPerDay;
        uint256 openedAt;
        uint256 openedTill; 
  }

  vaultInfo[] public VaultInfo;
  
  NftStaking stakingContract;

 function addVault(
        IERC721 _nft,
        IRewardToken _token,
        string calldata _name,
        string calldata _logoURI,
        uint256 _rewardPerDay,
        uint256 _openedAt,
        uint256 _openedTill
    ) public onlyOwner{

        stakingContract = new NftStaking(_nft,_token,_openedAt,_openedTill,_rewardPerDay);
      
        VaultInfo.push(
            vaultInfo({
                nft: address(_nft),
                stakingContract:address(stakingContract),
                token: address(_token),
                name: _name,
                logoURI:_logoURI,
                rewardPerDay:_rewardPerDay,
                openedAt:_openedAt,
                openedTill:_openedTill
            })
        );

        stakingContract.transferOwnership(msg.sender);


    }
  function listVaults() public view returns ( vaultInfo[] memory) {
            return VaultInfo;   
  }
  
}