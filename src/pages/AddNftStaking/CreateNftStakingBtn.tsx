import { t, Trans } from '@lingui/macro'
import React from 'react'
import { Plus, X } from 'react-feather'
import styled, { DefaultTheme, keyframes } from 'styled-components'

import { ButtonEmpty, ButtonPrimary } from 'components/Button'
import SearchIcon from 'components/Icons/Search'
import useTheme from 'hooks/useTheme'
import { ToolbarWrapper } from 'pages/Pools/styleds'
import { Text } from 'rebass'
import { NavLink } from "react-router-dom";



const highlight = (theme: DefaultTheme) => keyframes`
  0%{
    box-shadow: 0 0 0px 0px ${theme.primary};
  }
  100%{
    box-shadow: 0 0 8px 4px ${theme.primary};
  }
`

const ButtonPrimaryWithHighlight = styled(ButtonPrimary)`
  padding: 10px 12px;
  float: right;
  border-radius: 40px;
  font-size: 14px;

  &[data-highlight='true'] {
    animation: ${({ theme }) => highlight(theme)} 0.8s 8 alternate ease-in-out;
  }
`


export const CreateNftStakingBtn = () => {
  const theme = useTheme()
  return (
    <ToolbarWrapper style={{ marginBottom: '0px' }}>
      <ButtonPrimaryWithHighlight
        // onClick={handleClickCreatePoolButton}
        // data-highlight={shouldHighlightCreatePoolButton}
        style={{
          height: '38px',
          padding: '0px 12px',
        }}
      >
        <Plus width="22" height="22" />
        <Text as="span" sx={{ marginLeft: '4px' }}>
          <NavLink to="/nft-staking/add" style={{ textDecoration: "none", color: "white" }}><Trans>Create Nft Staking</Trans></NavLink>
        </Text>
      </ButtonPrimaryWithHighlight>
    </ToolbarWrapper>
  )
}

export default CreateNftStakingBtn
