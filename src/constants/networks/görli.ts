import { ChainId } from '@kyberswap/ks-sdk-core'

import EthereumLogo from 'assets/images/ethereum-logo.png'
import Mainnet from 'assets/networks/mainnet-network.svg'
import { KS_SETTING_API } from 'constants/env'
import { createClient } from 'utils/client'

import { NetworkInfo } from '../type'

const EMPTY = ''
const EMPTY_ARRAY: any[] = []
const NOT_SUPPORT = null

const görliInfo: NetworkInfo = {
  chainId: ChainId.GÖRLI,
  route: 'goerli',
  name: 'Görli',
  icon: Mainnet,
  classicClient: createClient(
    'https://ethereum-graph.dev.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-classic-goerli',
  ),
  elasticClient: createClient(
    'https://api.thegraph.com/subgraphs/name/sharadjaiswal1411/voxelswap-elastic-gorli',
  ),
  blockClient: createClient('https://api.thegraph.com/subgraphs/name/blocklytics/goerli-blocks'),
  etherscanUrl: 'https://goerli.etherscan.io',
  etherscanName: 'Goerli Explorer',
  tokenListUrl: `${KS_SETTING_API}/v1/tokens?chainIds=${ChainId.GÖRLI}&isWhitelisted=${true}`,
  bridgeURL: EMPTY,
  nativeToken: {
    symbol: 'ETH',
    name: 'ETH (Wrapped)',
    address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
    logo: EthereumLogo,
    decimal: 18,
  },
  rpcUrl: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  routerUri: EMPTY,
  nftStaker:EMPTY_ARRAY,
  classic: {
    static: {
      zap: EMPTY,
      router: '0x4F4994415B72FE87E01345f522D0A62A584D19b4',
      factory: '0xE612668FbE2CfDb71A4b6cD422d611E63585D33A',
    },
    oldStatic: NOT_SUPPORT,
    dynamic: NOT_SUPPORT,
    claimReward: EMPTY,
    fairlaunch: EMPTY_ARRAY,
    fairlaunchV2: EMPTY_ARRAY,
  },
  // elastic: {
  //   coreFactory: '0x1a91f5ADc7cB5763d35A26e98A18520CB9b67e70',
  //   nonfungiblePositionManager: '0x8B76f8e008570686aD5933e5669045c5B01DB7bE',
  //   tickReader: '0x24F40B8a021d5442B97459A336D1363E4D0f1388',
  //   initCodeHash: '0xc597aba1bb02db42ba24a8878837965718c032f8b46be94a6e46452a9f89ca01',
  //   quoter: '0x032c677619f72c670e4DA64126B48d906dfa952F',
  //   routers: '0x45a5B8Cf524EC574b40e80274F0F3856A679C5c4',
  //   descriptor: '0x671654F28F9ef9F3B289F53d6ECb29992a82b9E9',
  //   weth:'0x48f6D7dAE56623Dde5a0D56B283165cAE1753D70',
  //   rewardLocker:'0x871bE7bCFC545F4e99fc8aA1EAF8187aB7313547',
  //farming:'0xcBeb32E9AeDCa7F82913F21003Ac2C44Ad3f2385',
  // multicall: '0xD9bfE9979e9CA4b2fe84bA5d4Cf963bBcB376974'
  // },
  elastic: {
    coreFactory: '0x46A58CC7a42Ae904Ec4a2F570f22C747af2a4EAF',
    nonfungiblePositionManager: '0x35753899B91d097A2099CA7Df6C15BDca56aa02A',
    tickReader: '0x28Df5Ddb71f66961649b5c787f26Dc5D1727Da20',
    initCodeHash: '0xa601255443f06ae8c87366539598fa1297034126c3e8575f1eebb7f3cad64e8d',
    quoter: '0x28d72f111027283a2e7a9A99EAad7154AD957936',
    routers: '0x0d8b67C67Dc8009EeC00Cc44520099F8Ee159Dc5',
  },
  staking: {
    nftFactory: '0x5C0F2B2d1e5B9c88FFCf02CDd79Eb4d50DB1a6cf',
    tokenFactory:'0xdBA1E8d2d9B81db4ad5Da5Bb790EffCe7b1620C2'
  },
  averageBlockTimeInSeconds: 13.13,
  coingeckoNetworkId: EMPTY,
  coingeckoNativeTokenId: EMPTY,
  deBankSlug: EMPTY,
}

export default görliInfo
