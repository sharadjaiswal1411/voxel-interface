import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import ProMMFarms from 'components/NftPools/ProMMFarms'
import ClassicElasticTab from 'components/ClassicElasticTab'
import NftStakingGuide from 'components/NftPools/NftStakingGuide'
import styled from 'styled-components'

import {
  PageWrapper,
  TopBar,
} from 'components/NftPools/styleds'
import CreateNftStakingBtn from 'pages/AddNftStaking/CreateNftStakingBtn'


export const HeadingRight = styled.div`

  position: absolute;
    justify-self: right;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `}

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: flex;
    flex-direction: column-reverse;
    gap: 0;
  `}
`

const NftStaking = () => {

  return (
    <>
      <PageWrapper gap="24px">

        <TopBar>
          <ClassicElasticTab />
        </TopBar>

        <HeadingRight >
          <CreateNftStakingBtn />
        </HeadingRight>

        <NftStakingGuide />
        <div>
          <ProMMFarms active />
        </div>
      </PageWrapper>
      <SwitchLocaleLink />
    </>
  )
}

export default NftStaking
