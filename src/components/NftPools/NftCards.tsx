import {  useEffect, useState } from 'react'
import { useHistory, useLocation} from 'react-router-dom'
import { Flex, Text } from 'rebass'
import useTheme from 'hooks/useTheme'
import { useBlockNumber} from 'state/application/hooks'
import {useFarmAction} from 'state/nfts/promm/hooks'
import { useIsTransactionPending } from 'state/transactions/hooks'
import styled from 'styled-components'
import { ButtonPrimary } from 'components/Button'
import { useActiveWeb3React } from 'hooks'
import axios from 'axios';


export const NftCard= styled.div`
    background: #1C1C1C;
    height: auto;
    border-radius: 12px;
    padding: 15px 15px 20px 15px;
    position: relative;
    width:320px;
    margin-right:5px;
`
function NftCards({stakingAddress,nftAddress}: { stakingAddress:string,nftAddress:string } ) {
   const theme = useTheme()

   const { chainId,account } = useActiveWeb3React()


  const { approve,deposit,isApprovedContract } = useFarmAction(stakingAddress,nftAddress)
  const [approvalTx, setApprovalTx] = useState('')
  const [isApprovedForAll, setApprovedForAll] = useState<boolean>(false)

  const isApprovalTxPending = useIsTransactionPending(approvalTx)
  

  const handleApprove = async (nftId:string) => {
    if (!isApprovedForAll) {
      const tx = await approve()
      setApprovalTx(tx)
    }else{
     
     const tx = await deposit(nftId)
      setApprovalTx(tx)
    }
  }

 

  const [nfts, setNfts] = useState<any[]>([])
  const getProMMFarms = async()=>{
     setApprovedForAll(await isApprovedContract());
      const options = {
      method: 'GET',
      url: `https://deep-index.moralis.io/api/v2/${account}/nft`,
      params: {chain: 'goerli', format: 'decimal',limit: '100',token_addresses: nftAddress},
      headers: {accept: 'application/json', 'X-API-Key': '0w8Ivx0tOflZTjQIb9ITjW2LFU1U243aiNXc6Ccqf9eu9qNajB4F4OSYb9xsxEQZ'}
    };

    axios
      .request(options)
      .then(function (response) {
        setNfts(response?.data?.result);
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  const blockNumber = useBlockNumber()

  useEffect(() => {
    getProMMFarms()
  }, [getProMMFarms,approvalTx,isApprovedForAll])

  const history = useHistory()
  const location = useLocation()


  return (
    <>
     <Flex>
     {!nfts.length && <div> No NFTs owned. Please mint some. </div>}
     {nfts &&
          nfts?.map((item, key) => (
          <NftCard key={key}>
                  
                    <div className="product-card-body">
                      <h4 className="capitalize">
                        {item.name}
                      </h4>
                      <p>Token Id: #{item.token_id}</p>
                    </div>
                    <div className="product-card-footer">
                   
                   <ButtonPrimary style={{ margin: '4px 0 0 0', padding: '16px' }} onClick={() =>handleApprove(item.token_id.toString())}>
                    <Text fontWeight={500} fontSize={18}>
                    {isApprovedForAll ? "Stake Your NFT" :"Approve Contract"
                    }  
                    </Text>
                  </ButtonPrimary>
                    </div>
         </NftCard>
 

          ))
     }
</Flex>
    </>
  )
}

export default NftCards
