import { Trans } from '@lingui/macro'
import React, { useState } from 'react'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import Loader from 'components/Loader'
import { useGlobalData } from 'state/about/hooks'
import { formatBigLiquidity } from 'utils/formatBalance'
import moment from 'moment'

const Wrapper = styled.div`
  gap: 12px;
  display: flex;

  @media only screen and (max-width: 880px) {
    display: none;
  }
`

const ShowDetailBtn = styled.button<{ isOpen?: boolean }>`
  border: none;
  outline: none;
  line-height: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
  transition: transform 0.2s;
  transform: rotate(${({ isOpen }) => (isOpen ? '-180deg' : 0)});
  color: ${({ theme }) => theme.text};
`

const DetailWrapper = styled.div<{ isOpen?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 24px;
  margin-top: ${({ isOpen }) => (isOpen ? '16px' : 0)};
  height: ${({ isOpen }) => (isOpen ? 'auto' : 0)};
  max-height: ${({ isOpen }) => (isOpen ? '1000px' : 0)};
  transition: margin-top 200ms ease, height 200ms ease;
  overflow: hidden;

  ${({ theme }) => theme.mediaWidth.upToMedium`
      grid-template-columns: 1fr;
  `}
`

const DetailWrapperClassic = styled(DetailWrapper)`
  grid-template-columns: 1fr 1fr 1fr;

  ${({ theme }) => theme.mediaWidth.upToMedium`
      grid-template-columns: 1fr;
  `}
`
const DetailItem = styled.div`
  border-radius: 20px;
  padding: 16px;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.subText};
  font-size: 12px;
  display: flex;
  gap: 8px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
      background: transparent;
      grid-template-columns: 1fr;
      align-items: center;
      padding: 0;
      gap: 12px;
  `}
`
const GlobalDataItem = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.background};
  padding: 6px 12px;
  border-radius: 999px;
`

const GlobalDataItemTitle = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.subText};
`

const GlobalDataItemValue = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
`

const InstructionItem = styled.div`
  padding: 1rem 0;
  font-size: 12px;
  color: ${({ theme }) => theme.subText};
  line-height: 1.5;
  border-top: 1px solid ${({ theme }) => theme.border};
  border-bottom: 1px solid ${({ theme }) => theme.border};
`

export const NftStakingInfo = (params: any) => {
  const data = useGlobalData()
  const poolInfo = params.poolInfo;

  const dateForm = (arg: any) => {
    return moment.unix(arg).utc().format('H [h,] m [m and] s [s]');
  }

  return (
    <Wrapper>

      <GlobalDataItem>
        <GlobalDataItemTitle>
          <Trans>Min Lock Duration:</Trans>&nbsp;
        </GlobalDataItemTitle>
        <GlobalDataItemValue>
          {poolInfo ? dateForm(poolInfo.lockTime) : <Loader />}
        </GlobalDataItemValue>
      </GlobalDataItem>

      <GlobalDataItem>
        <GlobalDataItemTitle>
          <Trans>Rewards / Day:</Trans>&nbsp;
        </GlobalDataItemTitle>
        <GlobalDataItemValue>
          {poolInfo ? poolInfo.rewardsPerDay : <Loader />}
        </GlobalDataItemValue>
      </GlobalDataItem>

      <GlobalDataItem>
        <GlobalDataItemTitle>
          <Trans>Total Tokens Staked:</Trans>&nbsp;
        </GlobalDataItemTitle>
        <GlobalDataItemValue>
          {poolInfo ? poolInfo.stakedTotal : <Loader />}
        </GlobalDataItemValue>
      </GlobalDataItem>

      <GlobalDataItem>
        <GlobalDataItemTitle>
          <Trans>Available Rewards:</Trans>&nbsp;
        </GlobalDataItemTitle>
        <GlobalDataItemValue>
          {poolInfo ? poolInfo.totalRewards : <Loader />}
        </GlobalDataItemValue>
      </GlobalDataItem>

    </Wrapper>
  )
}