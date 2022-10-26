import { Trans } from '@lingui/macro'
import React from 'react'
import QuestionHelper from 'components/QuestionHelper'
import { Flex, Text } from 'rebass'
import { ButtonLight } from 'components/Button'
import { OutlineCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/CurrencyLogo'
import { RowBetween, RowFixed } from 'components/Row'
import useTheme from 'hooks/useTheme'
import { unwrappedToken } from 'utils/wrappedCurrency'
import { formatBalance } from 'utils/formatBalance'

export default function ProAmmStakeTokens({
  poolInfo,
  stakedToken,
  rewardToken
}: {
  poolInfo?: any
  stakedToken?: any
  rewardToken?: any
}) {
  const theme = useTheme()
  const currency0 = unwrappedToken(stakedToken)
  const currency1 = unwrappedToken(rewardToken)



  const render =
    (
      <>

      </>
    )
  return render
}
