import { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { Text } from 'rebass'
import { AutoColumn } from 'components/Column'
import useTheme from 'hooks/useTheme'
import { useBlockNumber } from 'state/application/hooks'
import { useFarmAction } from 'state/nfts/promm/hooks'
import { useIsTransactionPending } from 'state/transactions/hooks'
import styled from 'styled-components'
import { ButtonPrimary } from 'components/Button'
import { useActiveWeb3React } from 'hooks'
import axios from 'axios';
import { LightCard } from 'components/Card'
import defaultNftImage from '../../assets/images/default-nft-image.jpg';
import ContentLoader from 'pages/TokenAmmPool/ContentLoader'
import { Trans } from '@lingui/macro'
import { TYPE } from 'theme'

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
function NftCards({ stakingAddress, nftAddress }: { stakingAddress: string, nftAddress: string }) {
  const theme = useTheme()
  const { chainId, account } = useActiveWeb3React()
  const { approve, deposit, isApprovedContract } = useFarmAction(stakingAddress, nftAddress)
  const [approvalTx, setApprovalTx] = useState('')
  const [isApprovedForAll, setApprovedForAll] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const isApprovalTxPending = useIsTransactionPending(approvalTx)

  const handleApprove = async (nftId: string) => {
    if (!isApprovedForAll) {
      const tx = await approve()
      setApprovalTx(tx)
    } else {
      const tx = await deposit(nftId)
      setApprovalTx(tx)
    }
  }

  const [nfts, setNfts] = useState<any[]>([])
  const getProMMFarms = async () => {
    setApprovedForAll(await isApprovedContract());
    const options = {
      method: 'GET',
      url: `https://deep-index.moralis.io/api/v2/${account}/nft`,
      params: { chain: 'goerli', format: 'decimal', limit: '100', token_addresses: nftAddress },
      headers: { accept: 'application/json', 'X-API-Key': '0w8Ivx0tOflZTjQIb9ITjW2LFU1U243aiNXc6Ccqf9eu9qNajB4F4OSYb9xsxEQZ' }
    };

    axios
      .request(options)
      .then(async function (response) {

        const res = response.data.result;

        const newItems: any = await Promise.all(
          res.map(async (data: any) => {

            if (data.metadata) {
              data.image = JSON.parse(data.metadata).image;
            }
            else {
              data.image = defaultNftImage
            }

            return data;
          })
        ).catch((err) => {
          console.log("error1", err);
        });

        setNfts(newItems);
        setLoading(false);
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  const blockNumber = useBlockNumber()

  useEffect(() => {
    getProMMFarms()
  }, [getProMMFarms, approvalTx, isApprovedForAll])

  const history = useHistory()
  const location = useLocation()


  return (
    <>
      <AutoColumn gap="lg" style={{ width: '100%' }}>
        <PositionCardGrid>

          {!account
            ?
            <TYPE.body color={theme.text3} textAlign="center">
              <Trans>Connect to a wallet to view staking Pools.</Trans>
            </TYPE.body>
            :
            <>

              {(nfts.length == 0 && !loading) && <div> No NFTs owned. Please mint some. </div>}

              {loading && <>
                <ContentLoader />
                <ContentLoader />
                <ContentLoader />
                <ContentLoader />
              </>}

              {(nfts.length > 0 && !loading)
                &&
                nfts.map((item, key) => (
                  <StyledPositionCard key={key}>

                    <div className="product-card-body">
                      <div className='d-flex justify-content-center align-items-center'>
                        <img height={300} width={300} src={item.image} className="nft-image" />
                      </div>
                      <h4 className="capitalize">
                        {item.name}
                      </h4>
                      <p>Token Id: #{item.token_id}</p>
                    </div>
                    <div className="product-card-footer">
                      <ButtonPrimary style={{ margin: '4px 0 0 0', padding: '16px' }} onClick={() => handleApprove(item.token_id.toString())}>
                        <Text fontWeight={500} fontSize={18}>
                          {isApprovedForAll ? "Stake" : "Approve Contract"
                          }
                        </Text>
                      </ButtonPrimary>

                    </div>
                  </StyledPositionCard>
                ))}
            </>
          }
        </PositionCardGrid>
      </AutoColumn>
    </>
  )
}

export default NftCards
