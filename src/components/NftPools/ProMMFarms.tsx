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


export const NftCard= styled.div`
    background: #1C1C1C;
    height: auto;
    border-radius: 12px;
    padding: 15px 15px 20px 15px;
    position: relative;
    max-width:320px;
    margin-right:5px;
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

  


  const filteredFarms = useMemo(() => {
    const now = Date.now() / 1000
    return Object.keys(farms).reduce((acc: { [key: string]: any[] }, address) => {

      const currentFarms = farms.filter(farm => {
        const filterActive = active ? farm.openedTill.toNumber() >= now : farm.openedTill.toNumber() < now
        return filterActive
      })

      if (currentFarms.length) acc["data"] = currentFarms
      return acc
    }, {})
  }, [farms, active, activeTab])

  const noFarms = !Object.keys(filteredFarms).length
 
  const allActiveFarms= filteredFarms.data;

  return (
    <>
     <Flex>
     {noFarms && <div> No Nft Contract available for Staking. </div>}
{!noFarms &&
    allActiveFarms?.map((item, key) => (
  <NftCard key={key}>
  <div className="product-card-img" style={{height:"320px"}}>
     <Link to={`nft-staking/${item.stakingContract}/${item.nft}`}>
      <img src={item.logoURI} alt={item.name} width="100%"  />
     </Link>
  </div>
  <div className="product-card-body">
    <h4 className="capitalize">
      {item.name} 
    </h4>
   <small> Rewards {getFullDisplayBalance(BigNumber.from(item.rewardPerDay.toString()))} <TokenInfo address={item.token} logo={false} /> / Day </small>
  </div>
  <div className="product-card-footer">
 
  </div>
</NftCard>
 ))
}
     </Flex>
    </>
  )
}

export default ProMMFarms
