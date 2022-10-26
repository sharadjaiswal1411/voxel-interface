import styled from 'styled-components'
import ClassicElasticTab from 'components/ClassicElasticTab'
import { AutoColumn } from 'components/Column'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { VERSION } from 'constants/v2'
import useParsedQueryString from 'hooks/useParsedQueryString'
import TokenAmmPool from '../TokenAmmPool'

export const Tab = styled.div<{ active: boolean }>`
  padding: 4px 0;
  color: ${({ active, theme }) => (active ? theme.primary : theme.subText)};
  font-weight: 500;
  cursor: pointer;
  :hover {
    color: ${props => props.theme.primary};
  }
`
export const PageWrapper = styled.div`
  padding: 32px 24px 50px;
  width: 100%;
  max-width: 1500px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 24px 16px 100px;
  `}

  display: flex;
  flex-direction: column;
  gap: 20px;
`

export default function PoolCombination() {
  const qs = useParsedQueryString()
  const tab = (qs.tab as string) || VERSION.ELASTIC

  return (
    <>
      <PageWrapper>
        <AutoColumn>
          <ClassicElasticTab />
        </AutoColumn>
       <TokenAmmPool />
      </PageWrapper>
      <SwitchLocaleLink />
    </>
  )
}


