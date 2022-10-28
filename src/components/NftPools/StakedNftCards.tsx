import { useEffect, useState } from 'react'
import { Text } from 'rebass'
import useTheme from 'hooks/useTheme'
import { useBlockNumber } from 'state/application/hooks'
import { useFarmAction } from 'state/nfts/promm/hooks'
import { useIsTransactionPending } from 'state/transactions/hooks'
import styled from 'styled-components'
import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import ContentLoader from 'pages/TokenAmmPool/ContentLoader'
import { Trans } from '@lingui/macro'
import { TYPE } from 'theme'
import { LightCard } from 'components/Card'
import { useActiveWeb3React } from 'hooks'


export const PositionCardGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(320px,auto) minmax(320px,auto) minmax(320px,auto) minmax(320px,auto);
  gap: 24px;
  max-width: 1392px;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    grid-template-columns: 1fr 1fr;
    max-width: 832px;
  `}
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 1fr;
    max-width: 392px;
  `};
`
const StyledPositionCard = styled(LightCard)`
  border: none;
  background: ${({ theme }) => theme.background};
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 16px;
  `}
`
function StakedNftCards({ stakingAddress, nftAddress }: { stakingAddress: string, nftAddress: string }) {
  const theme = useTheme()

  const { approve, withdraw, fetchNfts } = useFarmAction(stakingAddress, nftAddress)
  const [approvalTx, setApprovalTx] = useState('')
  const isApprovalTxPending = useIsTransactionPending(approvalTx)
  const { chainId, account } = useActiveWeb3React()
  const isApprovedForAll = true;
  const [nfts, setNfts] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const handleApprove = async (nftId: string) => {
    if (!isApprovedForAll) {
      const tx = await approve()
      setApprovalTx(tx)
    } else {

      const tx = await withdraw(nftId)
      setApprovalTx(tx)
    }
  }

  const blockNumber = useBlockNumber()

  const getNfts = async () => {
    const nftList = await fetchNfts();
    setNfts(nftList);
    setLoading(false);
  };

  useEffect(() => {

    getNfts();

  }, [loading])



  return (
    <AutoColumn gap="lg" style={{ width: '100%' }}>
      <PositionCardGrid>

        {!account
          ?
          <TYPE.body color={theme.text3} textAlign="center">
            <Trans>Connect to a wallet to view staking Pools.</Trans>
          </TYPE.body>
          :
          <>
            {loading && <>
              <ContentLoader />
              <ContentLoader />
              <ContentLoader />
              <ContentLoader />
            </>}
            {(!loading && nfts.length == 0) && <>
              No NFTs Staked. Please stake one.
            </>}
            {!loading &&
              nfts?.map((item, key) => (
                <StyledPositionCard key={key}>

                  <div className="product-card-body">
                    <div className='d-flex justify-content-center align-items-center'>
                      <img height={300} width={300} src={item.image} className="nft-image" />
                    </div>
                    <h4 className="capitalize">
                      {item?.name}
                    </h4>
                    <p>Token Id: #{item?.tokenId}</p>
                  </div>
                  <div className="product-card-footer">

                    <ButtonPrimary style={{ margin: '4px 0 0 0', padding: '16px' }} onClick={() => handleApprove(item.tokenId)}>
                      <Text fontWeight={500} fontSize={18}>
                        Unstake
                      </Text>
                    </ButtonPrimary>
                  </div>
                </StyledPositionCard>


              ))
            }
          </>
        }
      </PositionCardGrid>
    </AutoColumn>
  )
}

export default StakedNftCards
