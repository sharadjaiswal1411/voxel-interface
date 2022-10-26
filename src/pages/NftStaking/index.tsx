import { Trans } from '@lingui/macro'
import { stringify } from 'qs'
import { useHistory } from 'react-router-dom'
import { useMedia } from 'react-use'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import ProMMFarms from 'components/NftPools/ProMMFarms'
import ClassicElasticTab from 'components/ClassicElasticTab'
import NftStakingGuide from 'components/NftPools/NftStakingGuide'

import {
  PageWrapper,
  PoolTitleContainer,
  Tab,
  TabContainer,
  TabWrapper,
  TopBar,
} from 'components/NftPools/styleds'
import { VERSION } from 'constants/v2'
import useMixpanel, { MIXPANEL_TYPE } from 'hooks/useMixpanel'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { useBlockNumber } from 'state/application/hooks'
import { isInEnum } from 'utils/string'


const NftStaking = () => {
 
  const qs = useParsedQueryString()
  const type = qs.type || 'active'
  const farmType = qs.tab && typeof qs.tab === 'string' && isInEnum(qs.tab, VERSION) ? qs.tab : VERSION.ELASTIC
  const history = useHistory()

  const renderTabContent = () => {
    switch (type) {
      case 'active':
        return <ProMMFarms active  />
      case 'ended':
         return <ProMMFarms active={false}  />
      default:
        return <ProMMFarms active />
    }
  }
  const { mixpanelHandler } = useMixpanel()

  const below768 = useMedia('(max-width: 768px)')
  const below1500 = useMedia('(max-width: 1500px)')

  const blockNumber = useBlockNumber()


  return (
    <>
      <PageWrapper gap="24px">
  
       <TopBar>
          <ClassicElasticTab />          
       </TopBar>
        <NftStakingGuide />

       

        <div>
          <TabContainer>
            <TabWrapper>
              <Tab
                onClick={() => {
                  if (type && type !== 'active') {
                    mixpanelHandler(MIXPANEL_TYPE.FARMS_ACTIVE_VIEWED)
                  }
                  const newQs = { ...qs, type: 'active' }
                  history.push({
                    search: stringify(newQs),
                  })
                }}
                isActive={!type || type === 'active'}
              >
                <PoolTitleContainer>
                  <span>
                    <Trans>Active</Trans>
                  </span>
                </PoolTitleContainer>
              </Tab>
              <Tab
                onClick={() => {
                  if (type !== 'ended') {
                    mixpanelHandler(MIXPANEL_TYPE.FARMS_ENDING_VIEWED)
                  }
                  const newQs = { ...qs, type: 'ended' }
                  history.push({
                    search: stringify(newQs),
                  })
                }}
                isActive={type === 'ended'}
              >
                <PoolTitleContainer>
                  <span>
                    <Trans>Ended</Trans>
                  </span>
                </PoolTitleContainer>
              </Tab>
            </TabWrapper>
          </TabContainer>

          {renderTabContent()}
        </div>
      </PageWrapper>
      <SwitchLocaleLink />
    </>
  )
}

export default NftStaking
