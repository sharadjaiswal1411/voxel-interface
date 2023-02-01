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
import { useStakingAction } from 'state/nfts/promm/hooks'
import { useEffect, useState } from 'react'


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

  const { checkRole } = useStakingAction();

  const [roleCheck, setRoleCheck] = useState(false);
  const checkAuth = async () => {
    const response = await checkRole()
    setRoleCheck(response)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <>
      <PageWrapper gap="24px">

        <TopBar>
          <ClassicElasticTab />
        </TopBar>

        <HeadingRight >
          {roleCheck && <CreateNftStakingBtn />}
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
