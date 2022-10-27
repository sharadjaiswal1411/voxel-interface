import { Fraction } from '@kyberswap/ks-sdk-core'
import { useEffect, useMemo, useState } from 'react'
import { Link} from 'react-router-dom'
import { Flex } from 'rebass'
import TokenInfo from 'components/TokenInfo'
import { useActiveWeb3React } from 'hooks'
import useTheme from 'hooks/useTheme'
import { useStakingAction} from 'state/nfts/promm/hooks'
import styled from 'styled-components'
import { BigNumber } from 'ethers'
import JSBI from 'jsbi'
import { AutoColumn } from 'components/Column'
import { LightCard} from 'components/Card'

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
const getFullDisplayBalance = (balance: BigNumber, decimals = 18, significant = 6): string => {
  const amount = new Fraction(balance.toString(), JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals)))
  if (amount.lessThan(new Fraction('1'))) {
    return amount.toSignificant(significant)
  }

  return amount.toFixed(0)
}

function ProMMFarms({ active }: { active: boolean } ) {

   const theme = useTheme()
   const { chainId,account } = useActiveWeb3React()
   const { fetchPools } = useStakingAction();
   const activeTab = active ? 'active' : 'ended'
  const [farms, setFarms] = useState<any[]>([])

   const getPools = async () => {
      const allPools:any[]= await fetchPools();

      setFarms(allPools);
      
   };

  useEffect( () => {
      getPools();


  }, ["farms"])



  return (
<AutoColumn gap="lg" style={{ width: '100%' }}>
<PositionCardGrid>
{!farms.length && <div> No Nft Contract available for Staking. </div>}
{farms.length &&
    farms?.map((item, key) => (
  <StyledPositionCard key={key}>
  <div >
     <Link to={`nft-staking/${item.stakingContract}/${item.nft}`}>
      <img src={item.logoURI} alt={item.name} width="300px" height="320px" />
     </Link>
      
  </div>
  <h4 className="capitalize">
      {item.name} 
    </h4>
 
</StyledPositionCard>
 ))
}
     </PositionCardGrid>
    </AutoColumn>
  )
}

export default ProMMFarms
