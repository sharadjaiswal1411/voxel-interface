import { Trans, t } from '@lingui/macro'
import { darken, lighten } from 'polished'
import styled from 'styled-components'
import { useToken } from 'hooks/Tokens'
import { unwrappedToken } from 'utils/wrappedCurrency'
import useTokenInfo from 'hooks/useTokenInfo'
import { ButtonSecondary } from '../Button'
import Loader from '../Loader'
import { NETWORKS_INFO } from 'constants/networks'
import { useCurrencyConvertedToNative } from 'utils/dmm'
import { Flex } from 'rebass'
import CurrencyLogo from 'components/CurrencyLogo'
import { formattedNum } from 'utils'
import { ChainId } from '@kyberswap/ks-sdk-core'

const Web3StatusGeneric = styled(ButtonSecondary)`
  ${({ theme }) => theme.flexRowNoWrap}
  height: 42px;
  width: 100%;
  align-items: center;
  padding: 10px 12px;
  border-radius: 999px;
  cursor: pointer;
  user-select: none;
  :focus {
    outline: none;
  }
`

const Web3StatusConnected = styled(Web3StatusGeneric) <{ pending?: boolean }>`
  background-color: ${({ pending, theme }) => (pending ? theme.primary : theme.buttonGray)};
  border: 1px solid ${({ pending, theme }) => (pending ? theme.primary : theme.buttonGray)};
  color: ${({ pending, theme }) => (pending ? theme.white : theme.subText)};
  font-weight: 500;
  :hover,
  :focus {
    background-color: ${({ pending, theme }) =>
    pending ? darken(0.05, theme.primary) : lighten(0.05, theme.buttonGray)};

    :focus {
      border: 1px solid
        ${({ pending, theme }) => (pending ? darken(0.1, theme.primary) : darken(0.1, theme.buttonGray))};
    }
  }
`

export default function ExchangeRateInfo() {

  const networkInfo = NETWORKS_INFO[ChainId.MAINNET].marketToken.address;
  const logoToken = useToken(networkInfo)
  const currency = logoToken ? unwrappedToken(logoToken) : undefined

  const marketCurrency = useCurrencyConvertedToNative(currency)
  const inputToken = marketCurrency?.wrapped



  const { data: tokenInfo, loading } = useTokenInfo(inputToken)


  // console.log({networkInfo, logoToken, currency, marketCurrency, inputToken })
  return (
    <>
      <Web3StatusConnected>
        <Flex justifyContent='space-between' alignItems='center' flexDirection='row'>
          {!currency
            ?
            <><Loader /></>
            :
            <>{currency && <CurrencyLogo currency={currency} />}&nbsp;{formattedNum((tokenInfo?.price).toString(), true)}</>
          }
        </Flex>
      </Web3StatusConnected>
    </>
  )
}
