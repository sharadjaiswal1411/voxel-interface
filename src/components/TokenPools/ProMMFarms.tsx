import { Trans, t } from '@lingui/macro'
import { Fraction } from '@kyberswap/ks-sdk-core'
import { stringify } from 'querystring'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'react-feather'
import { useHistory, useLocation,Link} from 'react-router-dom'
import { Flex, Text } from 'rebass'
import LocalLoader from 'components/LocalLoader'
import { NETWORKS_INFO } from 'constants/networks'
import { VERSION } from 'constants/v2'
import { useActiveWeb3React } from 'hooks'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import useParsedQueryString from 'hooks/useParsedQueryString'
import useTheme from 'hooks/useTheme'
import { ApplicationModal } from 'state/application/actions'
import { useBlockNumber, useModalOpen, useOpenModal } from 'state/application/hooks'
import { useTokenStakingAction} from 'state/nfts/promm/hooks'
import styled from 'styled-components'
import { StyledInternalLink } from 'theme'
import { ButtonPrimary } from 'components/Button'
import TokenInfo from 'components/TokenPools'
import { BigNumber } from 'ethers'
import JSBI from 'jsbi'

import {
  HeadingContainer,
  HeadingRight,
  SearchContainer,
  SearchInput,
  StakedOnlyToggleText,
  StakedOnlyToggleWrapper,
} from './styleds'


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
   const { fetchPools } = useTokenStakingAction();
   const activeTab = active ? 'active' : 'ended'
   const [farms, setFarms] = useState<any[]>([])
   const [loading, setLoading] = useState<boolean>(false)


   const getPools = async () => {
      setLoading(true);
      const allPools:any[]= await fetchPools();
      console.log("allPoolsallPools",allPools);
      setFarms(allPools);  
      setLoading(false);    
   };

  useEffect( () => {
      getPools();
  }, ["farms","loading"])

  
  

  return (
    <>
     <Flex>
    
     {(!loading && !farms.length) && <div> No Nft Contract available for Staking. </div>}

    {loading &&  <LocalLoader />} 
    {(!loading &&farms.length >0) &&
        farms?.map((item, key) => (
        <> 
        <TokenInfo rewardToken={item.rewardToken} />
       
        </>
     ))
    }
    
     </Flex>
    </>
  )
}

export default ProMMFarms
