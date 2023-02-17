import { TransactionResponse } from '@ethersproject/providers'
import { ONE } from '@kyberswap/ks-sdk-classic'
import { Currency, CurrencyAmount, WETH } from '@kyberswap/ks-sdk-core'
import { FeeAmount, NonfungiblePositionManager } from '@kyberswap/ks-sdk-elastic'
import { Trans, t } from '@lingui/macro'
import JSBI from 'jsbi'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle } from 'react-feather'
import { RouteComponentProps, useHistory } from 'react-router-dom'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'
import { ButtonError, ButtonLight, ButtonPrimary, ButtonWarning } from 'components/Button'
import { OutlineCard, WarningCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
//import FeeSelector from 'components/FeeSelector'
import HoverInlineText from 'components/HoverInlineText'
import InfoHelper from 'components/InfoHelper'
import LiquidityChartRangeInput from 'components/LiquidityChartRangeInput'
import { LiquidityAction } from 'components/NavigationTabs'
import ProAmmPoolInfo from 'components/ProAmm/ProAmmPoolInfo'
import ProAmmPooledTokens from 'components/ProAmm/ProAmmPooledTokens'
import ProAmmPriceRange from 'components/ProAmm/ProAmmPriceRange'
import RangeSelector from 'components/RangeSelector'
import PresetsButtons from 'components/RangeSelector/PresetsButtons'
import Row, { RowBetween, RowFixed } from 'components/Row'
import TransactionConfirmationModal, { ConfirmationModalContent } from 'components/TransactionConfirmationModal'
import { TutorialType } from 'components/Tutorial'
import { ArrowWrapper as ArrowWrapperVertical, Dots } from 'components/swapv2/styleds'
import { NETWORKS_INFO } from 'constants/networks'
import { nativeOnChain } from 'constants/tokens'
import { VERSION, FARM_CONTRACTS as PROMM_FARM_CONTRACTS } from 'constants/v2'
import { useActiveWeb3React } from 'hooks'
import { useCurrency } from 'hooks/Tokens'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useProAmmNFTPositionManagerContract } from 'hooks/useContract'
import useProAmmPoolInfo from 'hooks/useProAmmPoolInfo'
import useProAmmPreviousTicks from 'hooks/useProAmmPreviousTicks'
import useTheme from 'hooks/useTheme'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { useTokensPrice, useWalletModalToggle } from 'state/application/hooks'
import { Bound, Field } from 'state/mint/proamm/actions'
import {
  useProAmmDerivedMintInfo,
  useProAmmMintActionHandlers,
  useProAmmMintState,
  useRangeHopCallbacks,
} from 'state/mint/proamm/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useIsExpertMode } from 'state/user/hooks'
import { TYPE } from 'theme'
import { basisPointsToPercent, calculateGasMargin, formattedNum, isAddress } from 'utils'
import { currencyId } from 'utils/currencyId'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { unwrappedToken } from 'utils/wrappedCurrency'

import { useUserSlippageTolerance } from '../../state/user/hooks'
import {
  DynamicSection,
  FlexLeft,
  ResponsiveTwoColumns,
  RightContainer,
  StackedContainer,
  StackedItem,
  StyledInput,
} from './styled'
import CustomSelect from './CustomSelect'
import CustomDatePicker from './CustomDatePicker'
import { useMedia } from 'react-use'
import { HeaderTabs } from './HeaderTabs'
import { usePoolDatas, useTopPoolAddresses } from 'state/prommPools/hooks'
import { useFarmAction } from 'state/farms/promm/hooks'
import { ethers } from 'ethers'


export const Container = styled.div`
  width: 100%;
  border-radius: 0.75rem;
  background: ${({ theme }) => theme.background};

  padding: 4px 20px 28px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0 16px 24px;
  `};
`


const AddressBox: any = styled.div`
  border-radius: 8px;
  background: ${({ theme }) => theme.buttonBlack};
  padding: 12px;
  overflow: hidden;
  margin-bottom:5px;
`
const AddressBoxFull = styled.div`
  width: 100%;
  border-radius: 8px;
  background: ${({ theme }) => theme.buttonBlack};
  padding: 12px;
  overflow: hidden;
  margin-bottom: 0px;
`

const AddressInput = styled.input`
  font-size: 16px;
  line-height: 20px;
  color: ${({ theme }) => theme.text};
  background: transparent;
  border: none;
  outline: none;
  width: 100%;
  border-bottom: 1px solid;
`

const PageWrapper = styled.div`
  width: 100%;
  padding: 28px;
  min-width: 343px;
`

const BodyWrapper = styled.div`
  max-width: 1016px;
  background: ${({ theme }) => theme.background};
  border-radius: 8px;
  padding: 20px;
  margin: auto;
`
const BlockDiv = styled.div`
  display: block;
  width: 100%;
`

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.red};
  font-size: 12px;
  margin-top: 8px;
`


export const ButtonAddInput = styled.div`
  background: none;
  border:1px solid #f01d64;
  color: #fff;
  border-radius: 40px;
  width: 15%;
  text-align: center;
  padding: 10px;
  cursor: pointer;
  margin-bottom:auto;
  &:hover {
    background-color: ${({ theme }) => theme.primary};
  }
`

const Span = styled.span`
color: #f01d64;
`



// const DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE = new Percent(50, 10_000)

export const ArrowWrapper = styled(ArrowWrapperVertical) <{ rotated?: boolean }>`
  transform: rotate(${({ rotated }) => (rotated ? '270deg' : '90deg')});
  width: 40px;
  height: 40px;
`
export default function AddFarmV2({
  match: {
    params: { currencyIdA, currencyIdB, feeAmount: feeAmountFromUrl },
  },
  history,
}: RouteComponentProps<{ currencyIdA?: string; currencyIdB?: string; feeAmount?: string; tokenId?: string }>) {
  const routeHistory = useHistory();
  const { account, chainId, library } = useActiveWeb3React()
  const theme = useTheme()
  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected
  const expertMode = useIsExpertMode()
  const addTransactionWithType = useTransactionAdder()
  const positionManager = useProAmmNFTPositionManagerContract()
  const addr: any = PROMM_FARM_CONTRACTS[chainId ? chainId : 1];

  const { createFarm, checkRole } = useFarmAction(addr[0])

  const [vestingDuration, setVestingDuration] = useState('')
  const [startDateTime, setStartDateTime] = useState('')
  const [endDateTime, setEndDateTime] = useState('')
  const [selectPool, setSelectPool] = useState('')
  const [feeTraget, setFeeTraget] = useState('')
  const [touched, setTouched] = useState(false)
  const [poolErr, setPoolErr] = useState('')
  const [addRewardTokenValue, setAddRewardTokenValue] = useState('')
  const [addRewardTokenErr, setAddRewardTokenErr] = useState('')
  const [addRewardTokenValueErr, setAddRewardTokenValueErr] = useState('')
  const [vestingDurationError, setVestingDurationError] = useState('')
  const [startTimeError, setStartTimeError] = useState('')
  const [endTimeError, setEndTimeError] = useState('')
  const [currentTime, setCurrentTime] = useState('')
  const above1000 = useMedia('(min-width: 1000px)')

  const isValidAddress = isAddress(vestingDuration)

  const { loading, addresses } = useTopPoolAddresses()
  const { loading: poolDataLoading, data: poolDatas } = usePoolDatas(addresses || [])

  const pairDatas: any = useMemo(() => {
    const searchValue = "";

    const filteredPools = Object.values(poolDatas || []).filter(
      pool =>
        pool.address.toLowerCase() === searchValue ||
        pool.token0.name.toLowerCase().includes(searchValue) ||
        pool.token0.symbol.toLowerCase().includes(searchValue) ||
        pool.token1.name.toLowerCase().includes(searchValue) ||
        pool.token1.symbol.toLowerCase().includes(searchValue),
    )

    return Object.values(filteredPools)
  }, [
    poolDatas,
  ])

  const [roleCheck, setRoleCheck] = useState(false);
  const checkAuth = async () => {

    if (!account) {
      routeHistory.push('/farms')
    }

    const response = await checkRole()
    setRoleCheck(response)

    if (!response) {
      routeHistory.push('/farms')
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const handleSubmit = async () => {
    try {

      const startDate: any = new Date(startDateTime);
      const epochStartDate = (startDate.getTime() / 1000.0);

      const endDate: any = new Date(endDateTime);
      const epochEndDate = (endDate.getTime() / 1000.0);

      const data = { vestingDuration, selectPool, epochStartDate, epochEndDate, currencyIdA, addRewardTokenValue };

      const err = validate(data);
      setPoolErr(err.pool!);
      setAddRewardTokenErr(err.addRewardToken!);
      setAddRewardTokenValueErr(err.addRewardTokenValue!);
      setVestingDurationError(err.addVestingDuration!);
      setStartTimeError(err.addStartDate!);
      setEndTimeError(err.addEndDate!);

      if (!touched) {
        setTouched(true)
      }

      if (
        roleCheck &&
        !err.addVestingDuration &&
        !err.addStartDate &&
        !err.addEndDate &&
        !err.pool &&
        !err.addRewardToken &&
        !err.addRewardTokenValue
      ) {

        if (data) {

          const reqData = {
            poolAddress: selectPool,
            startTime: epochStartDate,
            endTime: epochEndDate,
            vestingDuration: vestingDuration,
            rewardTokens: currencyIdA,
            rewardAmounts: ethers.utils.parseUnits(String(addRewardTokenValue), "ether").toString(),
            feeTarget: (selectPool != "" ? ((pairDatas.find((o: any) => o.address == selectPool))?.feeTier) : 0)
          }

          await createFarm(reqData)
            .then(res => {
              routeHistory.push('/farms')
            })
            .catch(e => {
              console.log(e)
            })
        }
      }
    }
    catch (e) {
      console.log(e)
    }
  }

  // Input Fields Validations
  const validate = (valu: any) => {
    type obj = {
      addVestingDuration?: string
      addStartDate?: string
      addEndDate?: string
      pool?: string;
      addRewardToken?: string;
      addRewardTokenValue?: string;
    };

    const errors: obj = {};

    if (!valu.selectPool) {
      errors.pool = "Selecting pool is required !";
    }
    if (valu.currencyIdA == undefined) {
      errors.addRewardToken = "Selecting token is required !";
    }
    if (!valu.addRewardTokenValue) {
      errors.addRewardTokenValue = "Selecting token value is required !";
    }
    if ((valu.vestingDuration).length === 0) {
      errors.addVestingDuration = "Vesting duration is required !";
    }
    if ((startDateTime).length === 0) {
      errors.addStartDate = "Selecting start time is required !";
    }
    if ((endDateTime).length === 0) {
      errors.addEndDate = "Selecting end time is required !";
    }

    return errors;
  };

  // Prevent minus, plus and e from input type number
  const onKeyDownDecimal = (event: any) => {
    if (
      event.keyCode === 189 || // (-)
      event.keyCode === 187 || // (+)
      event.keyCode === 69     // (e)
    ) {
      event.preventDefault()
    }
  }

  const numberInputFilter = (val: any, maxValue = 0) => {
    const format = /[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;

    if (Number(maxValue) === 0) {
      if (Number(val) >= 0 || !format.test(String(val))) {
        return (val);
      }
    }
    else if (Number(maxValue) > 0) {

      if (Number(val) < Number(maxValue)) {
        if (Number(val) >= 0 || !format.test(String(val))) {
          return (val);
        }
      }
      else if (Number(val) > Number(maxValue)) {
        return (maxValue);
      }
    }
  }


  // For Add Multiple dynamic inputs for token
  // const handleOnAdd = () => {
  //   setAddInputField([...addInputField, { rewardToken: '', addRewardToken: '', rewardTokenErrs: '', addRewardTokenErrs: '' }]);
  // }


  // For Removing Multiple dynamic inputs for token
  // const handleOnRemove = (i: any) => {
  //   const newInputList = [...addInputField]
  //   newInputList.splice(i, 1)
  //   setAddInputField(newInputList);
  // }


  // For Adding Data in Inputs 
  // interface newInputList {
  //   rewardToken: string,
  //   addRewardToken: string,
  // }

  // const onHandleChange = (e: any, i: any) => {
  //   const { name, value } = e.target;
  //   const newInputList = [...addInputField];
  //   newInputList[i][e.currentTarget.name as keyof newInputList] = value;
  //   setAddInputField(newInputList);
  // }

  // check for existing position if tokenId in url
  // const { position: existingPositionDetails, loading: positionLoading } = useProAmmPositionsFromTokenId(
  //   tokenId ? BigNumber.from(tokenId) : undefined
  // )
  // const hasExistingPosition = !!existingPositionDetails && !positionLoading

  // fee selection from url
  const feeAmount: FeeAmount | undefined =
    feeAmountFromUrl && Object.values(FeeAmount).includes(parseFloat(feeAmountFromUrl))
      ? parseFloat(feeAmountFromUrl)
      : FeeAmount.MEDIUM
  const baseCurrency = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)
  // prevent an error if they input ETH/WETH
  const quoteCurrency =
    baseCurrency && currencyB && baseCurrency.wrapped.equals(currencyB.wrapped) ? undefined : currencyB

  const baseCurrencyIsETHER = !!(chainId && baseCurrency && baseCurrency.isNative)
  const baseCurrencyIsWETH = !!(chainId && baseCurrency && baseCurrency.equals(WETH[chainId]))
  const quoteCurrencyIsETHER = !!(chainId && quoteCurrency && quoteCurrency.isNative)
  const quoteCurrencyIsWETH = !!(chainId && quoteCurrency && quoteCurrency.equals(WETH[chainId]))

  const tokenA = (baseCurrency ?? undefined)?.wrapped
  const tokenB = (quoteCurrency ?? undefined)?.wrapped
  const isSorted = tokenA && tokenB && tokenA.sortsBefore(tokenB)

  // mint state
  const { independentField, typedValue, startPriceTypedValue } = useProAmmMintState()

  const {
    pool,
    ticks,
    dependentField,
    price,
    pricesAtTicks,
    parsedAmounts,
    currencyBalances,
    position,
    noLiquidity,
    currencies,
    errorMessage,
    invalidPool,
    invalidRange,
    outOfRange,
    depositADisabled,
    depositBDisabled,
    invertPrice,
    ticksAtLimit,
    amount0Unlock,
    amount1Unlock,
  } = useProAmmDerivedMintInfo(
    baseCurrency ?? undefined,
    quoteCurrency ?? undefined,
    feeAmount,
    baseCurrency ?? undefined,
  )
  const poolAddress = useProAmmPoolInfo(baseCurrency, currencyB, feeAmount)
  const previousTicks =
    // : number[] = []
    useProAmmPreviousTicks(pool, position)
  const { onFieldAInput, onFieldBInput, onLeftRangeInput, onRightRangeInput, onStartPriceInput } =
    useProAmmMintActionHandlers(noLiquidity)

  const isValid = !errorMessage && !invalidRange

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

  // capital efficiency warning
  const [showCapitalEfficiencyWarning, setShowCapitalEfficiencyWarning] = useState(false)

  useEffect(() => { setShowCapitalEfficiencyWarning(false); currentTimeFormatted(); }, [baseCurrency, quoteCurrency, feeAmount])

  // txn values
  const deadline = useTransactionDeadline() // custom from users settings

  const [txHash, setTxHash] = useState<string>('')

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toExact() ?? '',
  }

  // const [amount0Unlock, amount1Unlock] = useMemo(() => {
  //   if (price && noLiquidity) {
  //     return [
  //       FullMath.mulDiv(
  //         SqrtPriceMath.getAmount0Unlock(encodeSqrtRatioX96(price.numerator, price.denominator)),
  //         JSBI.BigInt('105'),
  //         JSBI.BigInt('100'),
  //       ),
  //       FullMath.mulDiv(
  //         SqrtPriceMath.getAmount1Unlock(encodeSqrtRatioX96(price.numerator, price.denominator)),
  //         JSBI.BigInt('105'),
  //         JSBI.BigInt('100'),
  //       ),
  //     ]
  //   }
  //   return [JSBI.BigInt('0'), JSBI.BigInt('0')]
  // }, [noLiquidity, price])
  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      let maxAmount = maxAmountSpend(currencyBalances[field])
      let amountUnlock = JSBI.BigInt('0')
      if (maxAmount && currencies[field] && noLiquidity && tokenA && tokenB) {
        if (
          (!invertPrice && tokenA.equals(currencies[field] as Currency)) ||
          (invertPrice && tokenB.equals(currencies[field] as Currency))
        ) {
          amountUnlock = amount0Unlock
        } else {
          amountUnlock = amount1Unlock
        }
        maxAmount = maxAmount?.subtract(CurrencyAmount.fromRawAmount(currencies[field] as Currency, amountUnlock))
      }
      return {
        ...accumulator,
        [field]: maxAmount,
      }
    },
    {},
  )

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(
    !!currencies[Field.CURRENCY_A] && depositADisabled && noLiquidity
      ? CurrencyAmount.fromFractionalAmount(currencies[Field.CURRENCY_A] as Currency, ONE, ONE)
      : parsedAmounts[Field.CURRENCY_A],
    chainId ? NETWORKS_INFO[chainId].elastic.nonfungiblePositionManager : undefined,
  )

  const [approvalB, approveBCallback] = useApproveCallback(
    !!currencies[Field.CURRENCY_B] && depositBDisabled && noLiquidity
      ? CurrencyAmount.fromFractionalAmount(currencies[Field.CURRENCY_B] as Currency, ONE, ONE)
      : parsedAmounts[Field.CURRENCY_B],
    chainId ? NETWORKS_INFO[chainId].elastic.nonfungiblePositionManager : undefined,
  )

  const tokens = useMemo(
    () => [currencies[Field.CURRENCY_A], currencies[Field.CURRENCY_B]].map(currency => currency?.wrapped),
    [currencies],
  )
  const usdPrices = useTokensPrice(tokens, VERSION.ELASTIC)
  const estimatedUsdCurrencyA =
    parsedAmounts[Field.CURRENCY_A] && usdPrices[0]
      ? parseFloat((parsedAmounts[Field.CURRENCY_A] as CurrencyAmount<Currency>).toExact()) * usdPrices[0]
      : 0

  const estimatedUsdCurrencyB =
    parsedAmounts[Field.CURRENCY_B] && usdPrices[1]
      ? parseFloat((parsedAmounts[Field.CURRENCY_B] as CurrencyAmount<Currency>).toExact()) * usdPrices[1]
      : 0

  const allowedSlippage = useUserSlippageTolerance()

  async function onAdd() {
    if (!chainId || !library || !account) return

    if (!positionManager || !baseCurrency || !quoteCurrency) {
      return
    }

    if (!previousTicks || previousTicks.length !== 2) {
      return
    }
    if (position && account && deadline) {
      const useNative = baseCurrency.isNative ? baseCurrency : quoteCurrency.isNative ? quoteCurrency : undefined



      const { calldata, value } = NonfungiblePositionManager.addCallParameters(position, previousTicks, {
        slippageTolerance: basisPointsToPercent(allowedSlippage[0]),
        recipient: account,
        deadline: deadline.toString(),
        useNative,
        createPool: noLiquidity,
      })


      //0.00283161
      const txn: { to: string; data: string; value: string } = {
        to: NETWORKS_INFO[chainId].elastic.nonfungiblePositionManager,
        data: calldata,
        value,
      }

      setAttemptingTxn(true)
      library
        .getSigner()
        .estimateGas(txn)
        .then(estimate => {
          const newTxn = {
            ...txn,
            gasLimit: calculateGasMargin(estimate),
          }
          //calculateGasMargin = 0x0827f6

          return library
            .getSigner()
            .sendTransaction(newTxn)
            .then((response: TransactionResponse) => {
              setAttemptingTxn(false)
              if (noLiquidity) {
                addTransactionWithType(response, {
                  type: 'Elastic Create pool',
                  summary: `${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '0'} ${baseCurrency.symbol} and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? '0'
                    } ${quoteCurrency.symbol} `,
                  arbitrary: {
                    token_1: baseCurrency.symbol,
                    token_2: quoteCurrency.symbol,
                  },
                })
              } else {
                addTransactionWithType(response, {
                  type: 'Elastic Add liquidity',
                  summary: `${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '0'} ${baseCurrency.symbol} and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? '0'
                    } ${quoteCurrency.symbol} `,
                  arbitrary: {
                    poolAddress: poolAddress,
                    token_1: baseCurrency.symbol,
                    token_2: quoteCurrency.symbol,
                  },
                })
              }

              setTxHash(response.hash)
            })
        })
        .catch(error => {
          console.error('Failed to send transaction', error)
          setAttemptingTxn(false)
          // we only care if the error is something _other_ than the user rejected the tx
          if (error?.code !== 4001) {
            console.error(error)
          }
        })
    } else {
      return
    }
  }

  // "YYYY-MM-DDTHH:mm"
  const currentTimeFormatted = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1);
    const day = date.getDate();
    const hour = date.getHours();
    const min = date.getMinutes();

    const formattedDate = String(year + "-" + (month < 10 ? ("0" + month) : month) + "-" + (day < 10 ? ("0" + day) : day) + "T" + (hour < 10 ? ("0" + hour) : hour) + ":" + (min < 10 ? ("0" + min) : min));
    setCurrentTime(formattedDate);
  }

  const handleCurrencySelect = useCallback(
    (currencyNew: Currency, currencyIdOther?: string): (string | undefined)[] => {
      const currencyIdNew = currencyId(currencyNew, chainId)

      if (currencyIdNew === currencyIdOther) {
        // not ideal, but for now clobber the other if the currency ids are equal
        return [currencyIdNew, undefined]
      } else {
        // prevent weth + eth
        const isETHOrWETHNew = currencyNew.isNative || (chainId && currencyIdNew === WETH[chainId]?.address)
        const isETHOrWETHOther =
          !!currencyIdOther &&
          ((chainId && currencyIdOther === nativeOnChain(chainId).symbol) ||
            (chainId && currencyIdOther === WETH[chainId]?.address))

        if (isETHOrWETHNew && isETHOrWETHOther) {
          return [currencyIdNew, undefined]
        } else {
          return [currencyIdNew, currencyIdOther]
        }
      }
    },
    [chainId],
  )

  const handleCurrencyASelect = useCallback(
    (currencyANew: Currency) => {
      const [idA, idB] = handleCurrencySelect(currencyANew, currencyIdB)
      if (idB === undefined) {
        history.push(`/farms/add/${idA}`)
      } else {
        history.push(`/farms/add/${idA}/${idB}`)
      }
    },
    [handleCurrencySelect, currencyIdB, history],
  )

  const handleCurrencyBSelect = useCallback(
    (currencyBNew: Currency) => {
      const [idB, idA] = handleCurrencySelect(currencyBNew, currencyIdA)
      if (idA === undefined) {
        history.push(`/farms/add/${idB}`)
      } else {
        history.push(`/farms/add/${idA}/${idB}`)
      }
    },
    [handleCurrencySelect, currencyIdA, history],
  )

  const handleFeePoolSelect = useCallback(
    (newFeeAmount: FeeAmount) => {
      onLeftRangeInput('')
      onRightRangeInput('')
      history.push(`/farms/add/${currencyIdA}/${currencyIdB}/${newFeeAmount}`)
    },
    [currencyIdA, currencyIdB, history, onLeftRangeInput, onRightRangeInput],
  )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('')
      // dont jump to pool page if creating
      history.push('/myPools')
    }
    setTxHash('')
  }, [history, onFieldAInput, txHash])

  const addIsUnsupported = false

  // const clearAll = useCallback(() => {
  //   onFieldAInput('')
  //   onFieldBInput('')
  //   onLeftRangeInput('')
  //   onRightRangeInput('')
  //   history.push(`/add`)
  // }, [history, onFieldAInput, onFieldBInput, onLeftRangeInput, onRightRangeInput])

  // get value and prices at ticks
  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks
  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = pricesAtTicks

  const leftPrice = isSorted ? priceLower : priceUpper?.invert()
  const rightPrice = isSorted ? priceUpper : priceLower?.invert()

  const { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper, getSetFullRange } =
    useRangeHopCallbacks(
      baseCurrency ?? undefined,
      quoteCurrency ?? undefined,
      feeAmount,
      tickLower,
      tickUpper,
      pool,
      price,
    )
  // we need an existence check on parsed amounts for single-asset deposits
  const showApprovalA = approvalA !== ApprovalState.APPROVED && (noLiquidity ? true : !!parsedAmounts[Field.CURRENCY_A])
  const showApprovalB = approvalB !== ApprovalState.APPROVED && (noLiquidity ? true : !!parsedAmounts[Field.CURRENCY_B])

  const pendingText = `Supplying ${!depositADisabled ? parsedAmounts[Field.CURRENCY_A]?.toSignificant(10) : ''} ${!depositADisabled ? currencies[Field.CURRENCY_A]?.symbol : ''
    } ${!depositADisabled && !depositBDisabled ? 'and' : ''} ${!depositBDisabled ? parsedAmounts[Field.CURRENCY_B]?.toSignificant(10) : ''
    } ${!depositBDisabled ? currencies[Field.CURRENCY_B]?.symbol : ''}`

  const Buttons = () =>
    addIsUnsupported ? (
      <ButtonPrimary disabled={true}>
        <Trans>Unsupported Asset</Trans>
      </ButtonPrimary>
    ) : !account ? (
      <ButtonLight onClick={toggleWalletModal}>
        <Trans>Connect Wallet</Trans>
      </ButtonLight>
    ) : (
      <Flex sx={{ gap: '16px' }} flexDirection={isValid && showApprovalA && showApprovalB ? 'column' : 'row'}>
        {(approvalA === ApprovalState.NOT_APPROVED ||
          approvalA === ApprovalState.PENDING ||
          approvalB === ApprovalState.NOT_APPROVED ||
          approvalB === ApprovalState.PENDING) &&
          isValid && (
            <RowBetween>
              {showApprovalA && (
                <ButtonPrimary
                  onClick={approveACallback}
                  disabled={approvalA === ApprovalState.PENDING}
                  width={showApprovalB ? '48%' : '100%'}
                >
                  {approvalA === ApprovalState.PENDING ? (
                    <Dots>
                      <Trans>Approving {currencies[Field.CURRENCY_A]?.symbol}</Trans>
                    </Dots>
                  ) : (
                    <Trans>Approve {currencies[Field.CURRENCY_A]?.symbol}</Trans>
                  )}
                </ButtonPrimary>
              )}
              {showApprovalB && (
                <ButtonPrimary
                  onClick={approveBCallback}
                  disabled={approvalB === ApprovalState.PENDING}
                  width={showApprovalA ? '48%' : '100%'}
                >
                  {approvalB === ApprovalState.PENDING ? (
                    <Dots>
                      <Trans>Approving {currencies[Field.CURRENCY_B]?.symbol}</Trans>
                    </Dots>
                  ) : (
                    <Trans>Approve {currencies[Field.CURRENCY_B]?.symbol}</Trans>
                  )}
                </ButtonPrimary>
              )}
            </RowBetween>
          )}
        <ButtonError
          onClick={() => {
            expertMode ? onAdd() : setShowConfirm(true)
          }}
          disabled={
            !isValid ||
            (approvalA !== ApprovalState.APPROVED && (!depositADisabled || noLiquidity)) ||
            (approvalB !== ApprovalState.APPROVED && (!depositBDisabled || noLiquidity))
          }
          error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B] && false}
        >
          <Text fontWeight={500}>{errorMessage ? errorMessage : <Trans>Preview</Trans>}</Text>
        </ButtonError>
      </Flex>
    )

  const chart = (
    <>
      <DynamicSection gap="md" disabled={!feeAmount || invalidPool}>
        {!noLiquidity ? (
          <>
            <Text fontWeight="500" style={{ display: 'flex' }}>
              <Trans>Set Your Price Range</Trans>
              <InfoHelper
                size={14}
                text={t`Represents the range where all your liquidity is concentrated. When market price of your token pair is no longer between your selected price range, your liquidity becomes inactive and you stop earning fees`}
              />
            </Text>

            {price && baseCurrency && quoteCurrency && !noLiquidity && (
              <Flex justifyContent="center" marginTop="0.5rem" sx={{ gap: '0.25rem' }}>
                <Text fontWeight={500} textAlign="center" color={theme.subText} fontSize={12}>
                  <Trans>Current Price</Trans>
                </Text>
                <Text fontWeight={500} textAlign="center" fontSize={12}>
                  <HoverInlineText
                    maxCharacters={20}
                    text={invertPrice ? price.invert().toSignificant(6) : price.toSignificant(6)}
                  />
                </Text>
                <Text fontSize={12}>
                  {quoteCurrency?.symbol} per {baseCurrency.symbol}
                </Text>
              </Flex>
            )}

            <LiquidityChartRangeInput
              currencyA={baseCurrency ?? undefined}
              currencyB={quoteCurrency ?? undefined}
              feeAmount={feeAmount}
              ticksAtLimit={ticksAtLimit}
              price={price ? parseFloat((invertPrice ? price.invert() : price).toSignificant(8)) : undefined}
              priceLower={priceLower}
              priceUpper={priceUpper}
              onLeftRangeInput={onLeftRangeInput}
              onRightRangeInput={onRightRangeInput}
              interactive
            />
          </>
        ) : (
          <AutoColumn gap="1rem">
            <RowBetween>
              <Text fontWeight="500">
                <Trans>Set Starting Price</Trans>
              </Text>
            </RowBetween>
            {noLiquidity && (
              <Flex
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: '1rem 0',
                  borderTop: `1px solid ${theme.border}`,
                  borderBottom: `1px solid ${theme.border}`,
                }}
              >
                <TYPE.body fontSize={12} textAlign="left" color={theme.subText} lineHeight="16px">
                  <Trans>
                    To initialize this pool, select a starting price for the pool then enter your liquidity price range.
                    Gas fees will be higher than usual due to initialization of the pool.
                  </Trans>
                </TYPE.body>
              </Flex>
            )}
            <OutlineCard
              padding="12px 16px"
              style={{ borderRadius: '999px', backgroundColor: theme.buttonBlack, border: 'none' }}
            >
              <StyledInput className="start-price-input" value={startPriceTypedValue} onUserInput={onStartPriceInput} />
            </OutlineCard>
            <RowBetween>
              <Text fontWeight="500" color={theme.subText} style={{ textTransform: 'uppercase' }} fontSize="12px">
                <Trans>Current Price</Trans>
              </Text>
              <TYPE.main>
                {price ? (
                  <TYPE.main>
                    <RowFixed>
                      <HoverInlineText
                        maxCharacters={20}
                        text={`1 ${baseCurrency?.symbol} = ${invertPrice ? price.invert().toSignificant(6) : price.toSignificant(6)
                          } ${quoteCurrency?.symbol}`}
                      />
                    </RowFixed>
                  </TYPE.main>
                ) : (
                  '-'
                )}
              </TYPE.main>
            </RowBetween>
          </AutoColumn>
        )}
        <DynamicSection gap="md" disabled={!feeAmount || invalidPool || (noLiquidity && !startPriceTypedValue)}>
          <StackedContainer>
            <StackedItem style={{ opacity: showCapitalEfficiencyWarning ? '0.05' : 1 }}>
              <AutoColumn gap="md">
                {noLiquidity && (
                  <RowBetween>
                    <Text fontWeight="500" style={{ display: 'flex' }}>
                      <Trans>Set Your Price Range</Trans>
                      <InfoHelper
                        text={t`Represents the range where all your liquidity is concentrated. When market price of your token pair is no longer between your selected price range, your liquidity becomes inactive and you stop earning fees`}
                        placement={'right'}
                      />
                    </Text>
                  </RowBetween>
                )}
                <RangeSelector
                  priceLower={priceLower}
                  priceUpper={priceUpper}
                  getDecrementLower={getDecrementLower}
                  getIncrementLower={getIncrementLower}
                  getDecrementUpper={getDecrementUpper}
                  getIncrementUpper={getIncrementUpper}
                  onLeftRangeInput={onLeftRangeInput}
                  onRightRangeInput={onRightRangeInput}
                  currencyA={baseCurrency}
                  currencyB={quoteCurrency}
                  feeAmount={feeAmount}
                  ticksAtLimit={ticksAtLimit}
                />
                {!noLiquidity && (
                  <PresetsButtons
                    setFullRange={() => {
                      setShowCapitalEfficiencyWarning(true)
                    }}
                  />
                )}
              </AutoColumn>
            </StackedItem>

            {showCapitalEfficiencyWarning && (
              <StackedItem zIndex={1}>
                <WarningCard padding="15px">
                  <AutoColumn gap="8px" style={{ height: '100%' }}>
                    <RowFixed>
                      <AlertTriangle stroke={theme.warning} size="16px" />
                      <TYPE.warning ml="12px" fontSize="15px">
                        <Trans>Efficiency Comparison</Trans>
                      </TYPE.warning>
                    </RowFixed>
                    <RowFixed>
                      <TYPE.warning ml="12px" fontSize="13px" margin={0} fontWeight={400}>
                        <Trans>Full range positions may earn less fees than concentrated positions.</Trans>
                      </TYPE.warning>
                    </RowFixed>
                    <Row>
                      <ButtonWarning
                        padding="8px"
                        marginRight="8px"
                        width="100%"
                        onClick={() => {
                          setShowCapitalEfficiencyWarning(false)
                          getSetFullRange()
                        }}
                      >
                        <TYPE.black fontSize={13}>
                          <Trans>I understand</Trans>
                        </TYPE.black>
                      </ButtonWarning>
                    </Row>
                  </AutoColumn>
                </WarningCard>
              </StackedItem>
            )}
          </StackedContainer>

          {outOfRange ? (
            <WarningCard padding="10px 16px">
              <Flex alignItems="center">
                <AlertTriangle stroke={theme.warning} size="16px" />
                <TYPE.warning ml="12px" fontSize="12px" flex={1}>
                  <Trans>
                    Your position will not earn fees until the market price of the pool moves into your price range.
                  </Trans>
                </TYPE.warning>
              </Flex>
            </WarningCard>
          ) : null}

          {invalidRange ? (
            <WarningCard padding="10px 16px">
              <Flex alignItems="center">
                <AlertTriangle stroke={theme.warning} size="16px" />
                <TYPE.warning ml="12px" fontSize="12px" flex={1}>
                  <Trans>Invalid range selected. The min price must be lower than the max price.</Trans>
                </TYPE.warning>
              </Flex>
            </WarningCard>
          ) : null}
        </DynamicSection>
      </DynamicSection>
    </>
  )

  return (
    <>
      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={handleDismissConfirmation}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={() => (
          <ConfirmationModalContent
            title={!!noLiquidity ? t`Create a new pool` : t`Add Liquidity`}
            onDismiss={handleDismissConfirmation}
            topContent={() =>
              position && (
                // <PositionPreview
                //   position={position}
                //   title={<Trans>Selected Range</Trans>}
                //   inRange={!outOfRange}
                //   ticksAtLimit={ticksAtLimit}
                // />
                <div style={{ marginTop: '1rem' }}>
                  <ProAmmPoolInfo position={position} />
                  <ProAmmPooledTokens
                    liquidityValue0={CurrencyAmount.fromRawAmount(
                      unwrappedToken(position.pool.token0),
                      position.amount0.quotient,
                    )}
                    liquidityValue1={CurrencyAmount.fromRawAmount(
                      unwrappedToken(position.pool.token1),
                      position.amount1.quotient,
                    )}
                    title={'New Liquidity Amount'}
                  />
                  <ProAmmPriceRange position={position} ticksAtLimit={ticksAtLimit} />
                </div>
              )
            }
            bottomContent={() => (
              <ButtonPrimary onClick={onAdd}>
                <Text fontWeight={500}>
                  <Trans>Supply</Trans>
                </Text>
              </ButtonPrimary>
            )}
          />
        )}
        pendingText={pendingText}
      />
      <PageWrapper>
        <BodyWrapper>
          <Container>
            <HeaderTabs
              hideShare
              action={!!noLiquidity ? LiquidityAction.CREATE : LiquidityAction.ADD}
              showTooltip={true}
              onCleared={() => {
                onFieldAInput('0')
                onFieldBInput('0')
                history.push('/farms/add')
              }}
              onBack={() => {
                history.replace('/farms')
              }}
              tutorialType={TutorialType.ELASTIC_ADD_LIQUIDITY}
            />
            <ResponsiveTwoColumns>
              <FlexLeft>
                <RowBetween style={{ gap: '12px' }}>
                  <BlockDiv >
                    <Text fontSize={12} color={"#bfbfbf" /*theme.disableText*/} textAlign="right" marginBottom="2px" fontStyle="italic">
                      <Trans>*Required</Trans>
                    </Text>
                    <AddressBoxFull style={{
                      marginBottom: !above1000 ? '24px' : '',
                      border: poolErr && touched ? `1px solid ${theme.red}` : undefined,
                    }}>
                      <Text fontSize={12} color={theme.subText} marginBottom="3px">
                        <Trans>Select Pool <Span>*</Span></Trans>
                      </Text>

                      {(loading || poolDataLoading)
                        ?
                        <Text fontSize={18} color={"#FFF"} marginBottom="6px" marginTop="10px">
                          <Trans>Loading...</Trans>
                        </Text>
                        :
                        <CustomSelect data={pairDatas} selectedValue={selectPool} pool={(val: any) => { setSelectPool(val) }} />
                      }

                      {poolErr && touched && (
                        <ErrorMessage>
                          <Trans>{poolErr}</Trans>
                        </ErrorMessage>
                      )}
                    </AddressBoxFull>


                    <Text fontSize={12} color={"#bfbfbf" /*theme.disableText*/} textAlign="right" marginBottom="2px" marginTop="5px" fontStyle="italic">
                      <Trans>*Required</Trans>
                    </Text>
                    <AddressBoxFull
                      style={{
                        marginBottom: !above1000 ? '24px' : '',
                        border: startTimeError && touched ? `1px solid ${theme.red}` : undefined,
                      }}
                    >
                      <Text fontSize={12} color={theme.subText} >
                        <Trans>Start Time <Span>*</Span></Trans>
                      </Text>
                      <CustomDatePicker min={currentTime} max={endDateTime} dateTime={(val: any) => { setStartDateTime(val) }} />

                      {startTimeError && touched && (
                        <ErrorMessage>
                          <Trans>{startTimeError}</Trans>
                        </ErrorMessage>
                      )}
                    </AddressBoxFull>

                    <Text fontSize={12} color={"#bfbfbf" /*theme.disableText*/} textAlign="right" marginTop="5px" marginBottom="2px" fontStyle="italic">
                      <Trans>*Required</Trans>
                    </Text>
                    <AddressBox style={{
                      marginBottom: !above1000 ? '24px' : '',
                      border: addRewardTokenErr && touched ? `1px solid ${theme.red}` : undefined,
                    }}>
                      <Text fontSize={12} color={theme.subText} marginBottom="8px">
                        <Trans>Reward Tokens <Span>*</Span></Trans>
                      </Text>
                      <CurrencyInputPanel
                        hideBalance
                        value={formattedAmounts[Field.CURRENCY_A]}
                        onUserInput={onFieldAInput}
                        hideInput={true}
                        showMaxButton={false}
                        onCurrencySelect={handleCurrencyASelect}
                        currency={currencies[Field.CURRENCY_A] ?? null}
                        id="add-input-tokena"
                        showCommonBases
                        estimatedUsd={formattedNum(estimatedUsdCurrencyA.toString(), true) || undefined}
                        maxCurrencySymbolLength={6}
                      />
                      {addRewardTokenErr && touched && (
                        <ErrorMessage>
                          <Trans>{addRewardTokenErr}</Trans>
                        </ErrorMessage>
                      )}
                    </AddressBox>

                    {/* {addInputField.map((item, i) => (
                      <>
                        <Text fontSize={12} color={theme.disableText} textAlign="right" marginBottom="2px" fontStyle="italic">
                          <Trans>*Required</Trans>
                        </Text>
                        <AddressBox style={{
                          marginBottom: !above1000 ? '24px' : '',
                          border: item.rewardTokenErrs && touched ? `1px solid ${theme.red}` : undefined,
                        }}>
                          <Text style={{ paddingBottom: item.addRewardTokenErrs ? '20px' : '' }} fontSize={12} color={theme.subText} marginBottom="8px">
                            <Trans>Reward Tokens <Span>*</Span></Trans>
                          </Text>
                          <Text fontSize={20} lineHeight={'24px'} color={theme.text}>
                            <AddressInput
                              type="text"
                              name="rewardToken"
                              value={item.rewardToken}
                              onChange={(e) => onHandleChange(e, i)}
                            />
                          </Text>
                          {item.rewardTokenErrs && touched && (
                            <ErrorMessage>
                              <Trans>{item.rewardTokenErrs}</Trans>
                            </ErrorMessage>
                          )}
                        </AddressBox>
                      </>
                    ))} */}
                  </BlockDiv>

                </RowBetween>
              </FlexLeft>
              <RightContainer >
                <Text fontSize={12} color={"#bfbfbf" /*theme.disableText*/} textAlign="right" marginBottom="2px" fontStyle="italic">
                  <Trans>*Required</Trans>
                </Text>
                <AddressBox
                  style={{
                    marginBottom: !above1000 ? '24px' : '',
                    border: vestingDurationError && touched ? `1px solid ${theme.red}` : undefined,
                  }}
                >
                  <Text /*style={{ paddingBottom: poolErr ? '20px' : '' }}*/ fontSize={12} color={theme.subText} marginBottom="2px">
                    <Trans >Vesting Duration in Seconds</Trans> <Span>*</Span>
                  </Text>
                  <Text fontSize={20} lineHeight={'24px'} color={theme.text}>
                    <AddressInput
                      type="number"
                      style={{ padding: "0px", borderTop: "none", borderLeft: "none", borderRight: "none", borderRadius: "0px" }}
                      onKeyDown={onKeyDownDecimal}
                      min={0}
                      value={numberInputFilter(vestingDuration)}
                      onChange={(e: any) => {
                        setVestingDuration(e.target.value)
                      }}
                    />
                  </Text>
                  {vestingDurationError && touched && (
                    <ErrorMessage>
                      <Trans>{vestingDurationError}</Trans>
                    </ErrorMessage>
                  )}
                </AddressBox>

                <Text fontSize={12} color={"#bfbfbf" /*theme.disableText*/} textAlign="right" marginBottom="2px" fontStyle="italic">
                  <Trans>*Required</Trans>
                </Text>
                <AddressBoxFull
                  style={{
                    marginBottom: !above1000 ? '24px' : '',
                    border: endTimeError && touched ? `1px solid ${theme.red}` : undefined,
                  }}
                >
                  <Text fontSize={12} color={theme.subText} >
                    <Trans>End Time</Trans> <Span>*</Span>
                  </Text>
                  <CustomDatePicker min={startDateTime ? startDateTime : currentTime} dateTime={(val: any) => { setEndDateTime(val) }} />
                  {endTimeError && touched && (
                    <ErrorMessage>
                      <Trans>{endTimeError}</Trans>
                    </ErrorMessage>
                  )}
                </AddressBoxFull>

                <Text fontSize={12} color={"#bfbfbf" /*theme.disableText*/} textAlign="right" marginTop="5px" marginBottom="2px" fontStyle="italic">
                  <Trans>*Required</Trans>
                </Text>
                <AddressBox style={{
                  marginBottom: !above1000 ? '24px' : '',
                  border: addRewardTokenValueErr && touched ? `1px solid ${theme.red}` : undefined,
                }}>

                  <Text fontSize={12} color={theme.subText} marginBottom="11px">
                    <Trans>Add Reward Tokens Value <Span>*</Span></Trans>
                  </Text>

                  <Text fontSize={20} lineHeight={'24px'} color={theme.text}>
                    <AddressInput
                      type="number"
                      style={{ padding: "0px", borderTop: "none", borderLeft: "none", borderRight: "none", borderRadius: "0px" }}
                      onKeyDown={onKeyDownDecimal}
                      min={0}
                      value={numberInputFilter(addRewardTokenValue)}
                      name="addRewardToken"
                      onChange={(e: any) => {
                        setAddRewardTokenValue(e.target.value)
                      }}
                    />
                  </Text>
                  {addRewardTokenValueErr && touched && (
                    <ErrorMessage>
                      <Trans>{addRewardTokenValueErr}</Trans>
                    </ErrorMessage>
                  )}
                </AddressBox>


                {/* {addInputField.map((item, i) => (
                  <>
                    <Text fontSize={12} color={theme.disableText} textAlign="right" marginBottom="2px" fontStyle="italic">
                      <Trans>*Required</Trans>
                    </Text>
                    <Flex style={{ justifyContent: 'space-between' }}>
                      <AddressBox style={{
                        marginBottom: !above1000 ? '24px' : '',
                        border: item.addRewardTokenErrs && touched ? `1px solid ${theme.red}` : undefined, width: '80%',
                      }}>
                        <Text fontSize={12} style={{ paddingBottom: item.rewardTokenErrs ? '20px' : '' }} color={theme.subText} marginBottom="8px">
                          <Trans>Add Reward Tokens Value <Span>*</Span></Trans>
                        </Text>
                        <Text fontSize={20} lineHeight={'24px'} color={theme.text}>
                          <AddressInput
                            type="text"
                            name="addRewardToken"
                            value={item.addRewardToken}
                            onChange={(e) => onHandleChange(e, i)}
                          />
                        </Text>
                        {item.addRewardTokenErrs && touched && (
                          <ErrorMessage>
                            <Trans>{item.addRewardTokenErrs}</Trans>
                          </ErrorMessage>
                        )}
                      </AddressBox>
                      {
                        i !== 0 ? "" :
                          <ButtonAddInput onClick={handleOnAdd} style={{ marginTop: 'auto' }}>
                            <Trans>+</Trans>
                          </ButtonAddInput>
                      }
                      {
                        i == 0 ? "" :
                          <ButtonAddInput onClick={() => handleOnRemove(i)} style={{ marginTop: 'auto' }}>
                            <Trans>-</Trans>
                          </ButtonAddInput>
                      }
                    </Flex>
                  </>
                ))} */}

                {/* <AddressInput
                  type="hidden"
                  value={feeTraget}
                  onChange={(e: any) => {
                    setFeeTraget(e.target.value)
                  }} /> */}

              </RightContainer>
            </ResponsiveTwoColumns>
            <ButtonPrimary onClick={handleSubmit} style={{ marginTop: 'auto' }}>
              <Trans>Create</Trans>
            </ButtonPrimary>
          </Container>
        </BodyWrapper>
      </PageWrapper>
    </>
  )
}