import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import ProMMFarms from 'components/NftPools/ProMMFarms'
import ClassicElasticTab from 'components/ClassicElasticTab'
import NftStakingGuide from 'components/NftPools/NftStakingGuide'

import {
  PageWrapper,
  PoolTitleContainer,
  TopBar,
} from 'components/NftPools/styleds'

const NftStaking = () => {
 
  return (
    <>
      <PageWrapper gap="24px">
  
       <TopBar>
          <ClassicElasticTab />          
       </TopBar>
        <NftStakingGuide />

        <div>


          <ProMMFarms active  />
        </div>
      </PageWrapper>
      <SwitchLocaleLink />
    </>
  )
}

export default NftStaking
