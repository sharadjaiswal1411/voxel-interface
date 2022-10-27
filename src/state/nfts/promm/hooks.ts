import { defaultAbiCoder } from "@ethersproject/abi";
import { BigNumber, utils } from "ethers";
import moment from 'moment';
import { useCallback } from "react";
import { CONTRACT_NOT_FOUND_MSG } from "constants/messages";
import { useActiveWeb3React } from "hooks";
import {
  useNFTStakingContract,
  useERC721Contract,
  useTokenContract,
  useNFTStakingFactoryContract,
  useTokenStakingFactoryContract,
  useTokenStakingContract,
} from "hooks/useContract";

import { useTransactionAdder } from "state/transactions/hooks";
import { calculateGasMargin } from "utils";
import axios from "axios";


export const useStakingAction = () => {
  const { chainId, account } = useActiveWeb3React();
  const stakingFactory = useNFTStakingFactoryContract();


  const fetchPools = useCallback(async () => {
    if (!stakingFactory) {
      throw new Error(CONTRACT_NOT_FOUND_MSG);
    }
    const allVaults = await stakingFactory.listVaults();

    return allVaults;
  }, [stakingFactory, chainId]);

  return { fetchPools };
};

export const useTokenStakingAction = () => {
  const { chainId, account } = useActiveWeb3React();
  const stakingFactory = useTokenStakingFactoryContract();

  const fetchPools = useCallback(async () => {
    if (!stakingFactory) {
      throw new Error(CONTRACT_NOT_FOUND_MSG);
    }
    const allVaults = await stakingFactory.listVaults();
    console.log("allVaults", allVaults);

    return allVaults;
  }, [stakingFactory, chainId]);

  return { fetchPools };
};


function toMonthDaysMinutesSeconds(seconds: any) {

  const date1 = new Date();

  const b = moment(date1),
    a = moment(b).add(seconds, 'seconds'),
    intervals = ['years', 'months', 'weeks', 'days'],
    out = [];
  for (let i = 0; i < intervals.length; i++) {
    let unit: any = intervals[i];
    const diff = a.diff(b, unit);
    b.add(diff, unit);
    if (diff > 0) {
      if (diff == 1) {
        unit = unit.slice("s", -1);
      }
      out.push(diff + ' ' + unit);
    }

  }
  return out.join(', ');
};



export const useTokenStakingDetailsAction = (stakingAddress: string, stakedToken: string) => {
  const { chainId, account } = useActiveWeb3React();
  const addTransactionWithType = useTransactionAdder();
  const contract = useTokenStakingContract(stakingAddress);
  const tokenContract = useTokenContract(stakedToken);

  const fetchPoolInfo = useCallback(async () => {
    if (!contract || !tokenContract) {
      throw new Error(CONTRACT_NOT_FOUND_MSG);
    }
    const data = await contract.getPoolInfo();
    const tokenStaked = await contract.minStakeRequiredOf(account);
    const { apy, closingIn, lockPeriod, minStakeRequired, rewardToken, stakedToken, totalStaked } = data[0];
    const isApproved = await tokenContract.allowance(account, stakingAddress);
    const balance = await tokenContract.balanceOf(account);
    const now = Date.now() / 1000
    const isClosed = (now > closingIn.toNumber())
    const denom = BigNumber.from(10).pow(16)
    const rewardEarned = data[1];
    const poolInfo = {
      apr: apy.toNumber() / 100,
      closingIn: closingIn.toNumber(),
      lockPeriod: toMonthDaysMinutesSeconds(lockPeriod.toNumber()),
      minStakeRequired: Number(utils.formatEther(minStakeRequired)),
      rewardToken,
      stakedToken,
      totalStaked: Number(utils.formatEther(totalStaked)),
      rewardEarned: Number(utils.formatEther(rewardEarned)),
      tokenStaked: Number(utils.formatEther(tokenStaked)),
      availableTokens: balance.div(denom).toNumber(),
      isClosed: isClosed,
      isApproved: isApproved.div(denom).toNumber(),
    };

    return poolInfo;
  }, [contract, chainId]);

  const approve = useCallback(async () => {
    if (!tokenContract) {
      throw new Error(CONTRACT_NOT_FOUND_MSG);
    }
    const balance = await tokenContract.balanceOf(account);
    const estimateGas = await tokenContract.estimateGas.approve(
      stakingAddress,
      balance.toString()
    );
    const tx = await tokenContract.approve(stakingAddress, balance.toString(), {
      gasLimit: calculateGasMargin(estimateGas),
    });
    addTransactionWithType(tx, {
      type: "Approve",
      summary: `Staking contract approved`,
    });

    return tx.hash;
  }, [addTransactionWithType, tokenContract]);

  // Deposit
  const stake = useCallback(
    async (tokens: string) => {
      if (!contract) {
        throw new Error(CONTRACT_NOT_FOUND_MSG);
      }

      tokens = utils.parseUnits(tokens.toString(), 18).toString()

      const estimateGas = await contract.estimateGas.stake(tokens);
      const tx = await contract.stake(tokens, {
        gasLimit: calculateGasMargin(estimateGas),
      });
      addTransactionWithType(tx, { type: "Stake", summary: `Tokens Staked` });

      return tx.hash;
    },
    [addTransactionWithType, contract, chainId]
  );

  const unStake = useCallback(
    async () => {
      if (!contract) {
        throw new Error(CONTRACT_NOT_FOUND_MSG);
      }

      const estimateGas = await contract.estimateGas.unstake();
      const tx = await contract.unstake({
        gasLimit: calculateGasMargin(estimateGas),
      });
      addTransactionWithType(tx, { type: "Withdraw", summary: `Tokens unstaked` });

      return tx.hash;
    },
    [addTransactionWithType, contract]
  );

  const harvest = useCallback(
    async () => {
      if (!contract) {
        throw new Error(CONTRACT_NOT_FOUND_MSG);
      }

      const estimateGas = await contract.estimateGas.withdrawAvailableReward();
      const tx = await contract.withdrawAvailableReward({
        gasLimit: calculateGasMargin(estimateGas),
      });
      addTransactionWithType(tx, { type: "Withdraw", summary: `Harvest Rewards` });

      return tx.hash;
    },
    [addTransactionWithType, contract]
  );

  return { fetchPoolInfo, stake, unStake, approve, harvest };

}

export const useFarmAction = (stakingAddress: string, nftAddress: string) => {
  const { chainId, account } = useActiveWeb3React();
  const addTransactionWithType = useTransactionAdder();
  const contract = useNFTStakingContract(stakingAddress);
  const stakingFactory = useNFTStakingFactoryContract();
  const posManager = useERC721Contract(nftAddress);

  const approve = useCallback(async () => {
    if (!posManager) {
      throw new Error(CONTRACT_NOT_FOUND_MSG);
    }
    const estimateGas = await posManager.estimateGas.setApprovalForAll(
      stakingAddress,
      true
    );
    const tx = await posManager.setApprovalForAll(stakingAddress, true, {
      gasLimit: calculateGasMargin(estimateGas),
    });
    addTransactionWithType(tx, {
      type: "Approve",
      summary: `Staking contract approved`,
    });

    return tx.hash;
  }, [addTransactionWithType, nftAddress, posManager]);

  const isApprovedContract = useCallback(async () => {
    if (!contract || !posManager) {
      throw new Error(CONTRACT_NOT_FOUND_MSG);
    }

    const tx = await posManager.isApprovedForAll(account, stakingAddress);
    console.log(tx);
    return tx;
  }, [nftAddress, posManager]);

  const fetchNfts = useCallback(async () => {
    if (!contract || !posManager) {
      throw new Error(CONTRACT_NOT_FOUND_MSG);
    }

    const nfts = await contract.getStakedTokens(account);
    const data: any=[];

    const promises: any[] = await Promise.all(
      nfts.map(async (nft:any)  => {
        const tokenUri = await posManager.tokenURI(nft.toString());
        const nftData = await getLinkData(tokenUri)

        return {
          'tokenId': nft.toString(),
          'name': nftData.name,
          'image': nftData.image
        }
        
   
      }));

      const allNfts = await Promise.all(promises)
      return allNfts;

  }, [contract, nftAddress, chainId]);

  const getLinkData = async (link: any) => {

    try {
      const res = await axios.get(link)
      if (res) {
        return (res.data)
      } else {
        return null;
      }
    }
    catch (e) {
      console.log("Error in fetching nft data.", { e });
    }

  }

  const fetchBalance = useCallback(async () => {
    if (!contract) {
      throw new Error(CONTRACT_NOT_FOUND_MSG);
    }

    const tx = await contract.stakers(account);

    return tx?.balance;
  }, [contract, nftAddress, chainId]);

  // Deposit
  const deposit = useCallback(
    async (nftId: string) => {
      if (!contract) {
        throw new Error(CONTRACT_NOT_FOUND_MSG);
      }

      const estimateGas = await contract.estimateGas.stake(nftId);
      const tx = await contract.stake(nftId, {
        gasLimit: calculateGasMargin(estimateGas),
      });
      addTransactionWithType(tx, { type: "Stake", summary: `NFT Staked` });

      return tx.hash;
    },
    [addTransactionWithType, contract, chainId]
  );

  const withdraw = useCallback(
    async (nftId: string) => {
      if (!contract) {
        throw new Error(CONTRACT_NOT_FOUND_MSG);
      }

      const estimateGas = await contract.estimateGas.unstake(nftId);
      const tx = await contract.unstake(nftId, {
        gasLimit: calculateGasMargin(estimateGas),
      });
      addTransactionWithType(tx, { type: "Withdraw", summary: `Nft unstaked` });

      return tx.hash;
    },
    [addTransactionWithType, contract]
  );

  const emergencyWithdraw = useCallback(
    async (nftIds: BigNumber[]) => {
      if (!contract) {
        throw new Error(CONTRACT_NOT_FOUND_MSG);
      }
      const estimateGas = await contract.estimateGas.emergencyWithdraw(nftIds);
      const tx = await contract.emergencyWithdraw(nftIds, {
        gasLimit: calculateGasMargin(estimateGas),
      });
      addTransactionWithType(tx, { type: "ForceWithdraw" });

      return tx.hash;
    },
    [addTransactionWithType, contract]
  );

  const stake = useCallback(
    async (pid: BigNumber, nftIds: BigNumber[], liqs: BigNumber[]) => {
      if (!contract) {
        throw new Error(CONTRACT_NOT_FOUND_MSG);
      }

      const estimateGas = await contract.estimateGas.join(pid, nftIds, liqs);
      const tx = await contract.join(pid, nftIds, liqs, {
        gasLimit: calculateGasMargin(estimateGas),
      });
      addTransactionWithType(tx, {
        type: "Stake",
        summary: `liquidity into farm`,
      });

      return tx.hash;
    },
    [addTransactionWithType, contract]
  );

  const unstake = useCallback(
    async (pid: BigNumber, nftIds: BigNumber[], liqs: BigNumber[]) => {
      if (!contract) {
        throw new Error(CONTRACT_NOT_FOUND_MSG);
      }
      try {
        const estimateGas = await contract.estimateGas.exit(pid, nftIds, liqs);
        const tx = await contract.exit(pid, nftIds, liqs, {
          gasLimit: calculateGasMargin(estimateGas),
        });
        addTransactionWithType(tx, {
          type: "Unstake",
          summary: `liquidity from farm`,
        });

        return tx.hash;
      } catch (e) {
        console.log(e);
      }
    },
    [addTransactionWithType, contract]
  );

  const harvest = useCallback(
    async (nftIds: BigNumber[], poolIds: BigNumber[]) => {
      if (!contract) return;

      const encodeData = poolIds.map((id) =>
        defaultAbiCoder.encode(["tupple(uint256[] pIds)"], [{ pIds: [id] }])
      );

      try {
        const estimateGas = await contract.estimateGas.harvestMultiplePools(
          nftIds,
          encodeData
        );
        const tx = await contract.harvestMultiplePools(nftIds, encodeData, {
          gasLimit: calculateGasMargin(estimateGas),
        });
        addTransactionWithType(tx, { type: "Harvest" });
        return tx;
      } catch (e) {
        console.log(e);
      }
    },
    [addTransactionWithType, contract]
  );

  return {
    deposit,
    withdraw,
    approve,
    stake,
    unstake,
    harvest,
    emergencyWithdraw,
    fetchNfts,
    isApprovedContract,
    fetchBalance,
  };
};
