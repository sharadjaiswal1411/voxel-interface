import React, { Suspense,lazy} from 'react'
import { GelatoLimitOrderPanel, GelatoLimitOrdersHistoryPanel, GelatoProvider,useGelatoLimitOrders } from '@gelatonetwork/limit-orders-react'
import { RouteComponentProps, useParams } from 'react-router-dom'
import Skeleton from 'react-loading-skeleton'
import { AutoRow, RowBetween } from 'components/Row'
import { Box, Flex, Text } from 'rebass'
import { useActiveWeb3React } from 'hooks'
import { Trans, t } from '@lingui/macro'
import styled, { DefaultTheme, keyframes } from 'styled-components'
import { BodyWrapper } from 'pages/AppBody'
import { Z_INDEXS } from 'constants/styles'
import useTheme from 'hooks/useTheme'


import {
  ArrowWrapper,
  BottomGrouping,
  Container,
  Dots,
  InfoComponentsWrapper,
  KyberTag,
  LiveChartWrapper,
  PageWrapper,
  PriceImpactHigh,
  StyledActionButtonSwapForm,
  SwapCallbackError,
  SwapFormActions,
  SwapFormWrapper,
  Tab,
  TabContainer,
  TabWrapper,
  Wrapper,
} from 'components/swapv2/styleds'


function Gelato({ children }: { children?: React.ReactNode }) {
  const { library, chainId, account } = useActiveWeb3React();
  return (
    <GelatoProvider
      library={library}
      chainId={chainId}
      account={account ?? undefined}

    >
      {children}
    </GelatoProvider>
  );
}

const LiveChart = lazy(() => import('components/LiveChart'))
export default function LimitOrder({ history }: RouteComponentProps) {
  const {
    handlers: {
      handleInput,
      handleRateType,
      handleCurrencySelection,
      handleSwitchTokens,
      handleLimitOrderSubmission,
      handleLimitOrderCancellation
    },
    derivedOrderInfo: {
      parsedAmounts,
      currencies,
      currencyBalances,
      trade,
      formattedAmounts,
      inputError,
    },
    orderState: { independentField, rateType, typedValue },
  } = useGelatoLimitOrders();

  console.log("currencies",currencies);

  const theme = useTheme()

  return (
      <PageWrapper>
        <Container>
         <SwapFormWrapper isShowTutorial={false}>
            <Gelato>
                   <GelatoLimitOrderPanel />       
             </Gelato>
         </SwapFormWrapper> 
          <InfoComponentsWrapper>   
           <Gelato>
            <GelatoLimitOrdersHistoryPanel />
           </Gelato>
          </InfoComponentsWrapper>
          

        </Container>
      </PageWrapper>

  )

}