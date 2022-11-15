// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "@openzeppelin/contracts/access/Ownable.sol";

contract OwnerWallets is Ownable{
   
    address[] public owners;
    mapping(address => bool) public isOwner;

    modifier onlyOwners() {
        require(isOwner[msg.sender], "not owner");
        _;
    }
   
    constructor(address[] memory _owners) {
        require(_owners.length > 0, "owners required");
        
        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];

            require(owner != address(0), "invalid owner");
            require(!isOwner[owner], "owner not unique");

            isOwner[owner] = true;
            owners.push(owner);
        }
    }

    function getOwners() public view returns (address[] memory) {
        return owners;
    }

   function removeOwners(address[] memory _owners) onlyOwner {
        for (uint i = 0; i < _owners.length; i++) {

            address owner = _owners[i];

            require(owner != address(0), "invalid owner");
            require(isOwner[owner], "not in owner");

            delete isOwner[owner];
            bool found=false;
            for(uint96 j=0; j < owners.length; j++){
             
                 if(owners[i]==owner){
                   delete owners[j];
                   found=true;
                 }

                 if(found){
                   owners[j]=owners[j+1];
                 }


            }

            if(found)
             owners.pop();

      }

     

    }

   function addOwners(address[] memory _owners) onlyOwner {

        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];

            require(owner != address(0), "invalid owner");
            require(!isOwner[owner], "owner not unique");

            isOwner[owner] = true;
            owners.push(owner);
        }
    }
}
