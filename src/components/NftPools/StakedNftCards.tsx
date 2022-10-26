import { useEffect, useState } from 'react'
import { Flex, Text } from 'rebass'
import useTheme from 'hooks/useTheme'
import { useBlockNumber } from 'state/application/hooks'
import {useFarmAction } from 'state/nfts/promm/hooks'
import { useIsTransactionPending } from 'state/transactions/hooks'
import styled from 'styled-components'
import { ButtonPrimary } from 'components/Button'

const stakeTo= (nftContract: string)=>{
  console.log(nftContract);
}

export const NftCard= styled.div`
    background: #1C1C1C;
    height: auto;
    border-radius: 12px;
    padding: 15px 15px 20px 15px;
    position: relative;
    width:320px;
    margin-right:5px;
`
function StakedNftCards({stakingAddress,nftAddress}: { stakingAddress:string,nftAddress:string } ) {
  const theme = useTheme()

  const { approve,withdraw,fetchNfts } = useFarmAction(stakingAddress,nftAddress)

  const [approvalTx, setApprovalTx] = useState('')

  const isApprovalTxPending = useIsTransactionPending(approvalTx)
  
  const isApprovedForAll=true;
  const [nfts, setNfts] = useState<any[]>([])
  const handleApprove = async (nftId:string) => {
    if (!isApprovedForAll) {
      const tx = await approve()
      setApprovalTx(tx)
    }else{
     
     const tx = await withdraw(nftId)
      setApprovalTx(tx)
    }
  }
    
  const blockNumber = useBlockNumber()
  const getNfts = async () => {
      setNfts(await fetchNfts());
  };

  useEffect( () => {
    
    getNfts();

  }, [nfts])



  return (
    <>
     <Flex>
     {!nfts.length && <div> No NFTs Staked. Please stake some. </div>}
     {nfts &&
          nfts?.map((item, key) => (
          <NftCard key={key}>
                  
                    <div className="product-card-body">
                      <h4 className="capitalize">
                        {item?.name}
                      </h4>
                      <p>Token Id: #{item.toString()}</p>
                    </div>
                    <div className="product-card-footer">
                   
                   <ButtonPrimary style={{ margin: '4px 0 0 0', padding: '16px' }} onClick={() =>handleApprove(item.toString())}>
                    <Text fontWeight={500} fontSize={18}>
                      Unstake
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

export default StakedNftCards
