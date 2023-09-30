import { getContractFactory, predeploys } from '@eth-optimism/contracts'
import axios from 'axios'
import BigNumber from 'bignumber.js'
import { ethers, providers } from 'ethers'
import orbiterCore from '../../orbiterCore'
import { store } from '../../store'
import { exchangeToUsd } from '../coinbase'


import util from '../util'


import Web3 from 'web3'
import { compatibleGlobalWalletConf } from '../../composition/walletsResponsiveData'
import { transferDataState, web3State } from '../../composition/hooks'

// zk deposit
const ZK_ERC20_DEPOSIT_APPROVEL_ONL1 = 45135
const ZK_ERC20_DEPOSIT_DEPOSIT_ONL1 = 103937
const ZK_ETH_DEPOSIT_DEPOSIT_ONL1 = 62599

// zkspace deposit
const ZKSPACE_ETH_DEPOSIT_DEPOSIT_ONL1 = 160000
// https://rinkeby.etherscan.io/tx/0x6b6c2eacf0cdc5ff70b7923d6225456b8f6d26008de12beec611f7ab81eb2775
const ZKSPACE_ERC20_DEPOSIT_DEPOSIT_ONL1 = 100325
// ar deposit
const AR_ERC20_DEPOSIT_DEPOSIT_ONL1 = 218291
const AR_ETH_DEPOSIT_DEPOSIT_ONL1 = 92000

// ar withdraw
const AR_ERC20_WITHDRAW_ONAR = 801420
const AR_ERC20_WITHDRAW_ONL1 = 234552
const AR_ETH_WITHDRAW_ONAR = 666721
const AR_ETH_WITHDRAW_ONL1 = 161063

// polygon deposit
const PG_ERC20_DEPOSIT_DEPOSIT_ONL1 = 77257

// polygon withdraw
const PG_ERC20_WITHDRAW_ONPG = 32000
const PG_ERC20_WITHDRAW_ONL1 = 480000

// metis deposit
const MT_ERC20_DEPOSIT_DEPOSIT_ONL1 = 170617

// metis withdraw
const MT_ERC20_WITHDRAW_ONMT = 685768
const MT_ERC20_WITHDRAW_ONL1 = 21000

// optimistic deposit
const OP_ETH_DEPOSIT_DEPOSIT_ONL1 = 151000
const OP_ETH_WITHDRAW_ONOP_L2 = 137000
const OP_ETH_WITHDRAW_ONL1 = 820000

// https://ropsten.etherscan.io/tx/0x6182c35a69951a8443d6b7670ecccd7c8327d95faea95d7e949fc96ab6e7e0d7
const OP_ERC20_DEPOSIT_DEPOSIT_ONL1 = 77921
// optimistic withdraw
// https://kovan-optimistic.etherscan.io/tx/0x1df81e482369067c63c20f40d9ce1b8b75813f11957ff90c2fa967feef66e7a7
const OP_ERC20_WITHDRAW_ONOP_L2 = 115340
const OP_ERC20_WITHDRAW_ONL1 = 820000 // not get wanted

// loopring depost
const LP_ETH_DEPOSIT_DEPOSIT_ONL1 = 75000
// https://goerli.etherscan.io/tx/0x2571fa4a6ef7b69e143a9055877319014a770e30f22caec13bb540e0c9daee1e
const LP_ERC20_DEPOSIT_DEPOSIT_ONL1 = 91795
// immutablex deposit
// Testnet deposit contract: 0x6C21EC8DE44AE44D0992ec3e2d9f1aBb6207D864
const IMX_ETH_DEPOSIT_DEPOSIT_ONL1 = 126000
// https://ropsten.etherscan.io/tx/0x3e197cf0122e70aeccc7f7acbdc5418024f2e1e6161ed4f635a2c17e427f52c5
const IMX_ERC20_DEPOSIT_DEPOSIT_ONL1 = 116893
// immutablex withdraw
// Testnet withdraw contract: 0x4527BE8f31E2ebFbEF4fCADDb5a17447B27d2aef
const IMX_ETH_WITHDRAW_ONL1 = 510000
// https://ropsten.etherscan.io/tx/0x791dfb4ed33a12dd0e58febd7de4f00ec3ca396dedc5d7f6ac3fd5291cd706c4
const IMX_ERC20_WITHDRAW_ONL1 = 91304
// dydx deposit
// Mainnet deposit contract: 0x8e8bd01b5A9eb272CC3892a2E40E64A716aa2A40
const DYDX_ETH_DEPOSIT_DEPOSIT_ONL1 = 260000

// boba
const BOBA_TRANSFER_OUT_LIMIT = 10123935
const BOBA_TRANSFER_IN_LIMIT = 1787707

// polygon zkEVM
const PG_EVM_ETH_DEPOSIT_DEPOSIT_ONL1 = 122939
const PG_EVM_ETH_WITHDRAW_ONPG = 94708

// zksync2 deposit
const ZK2_ETH_DEPOSIT_DEPOSIT_ONL1 = 142000
const ZK2_ERC20_DEPOSIT_DEPOSIT_ONL1 = 142000
// zksync2 withdraw
const ZK2_ETH_WITHDRAW_ONZK2 = 1111693
const ZK2_ERC20_WITHDRAW_ONZK2 = 1111693 // same with eth
// starkNet
const STARKNET_ETH_DEPOSIT_ONL1 = 110000
const STARKNET_ETH_WITHDRAW_ONL1 = 60000

// wi
const BASE_ERC20_WITHDRAW_ONAR = 801420
const BASE_ERC20_WITHDRAW_ONL1 = 234552
const BASE_ETH_WITHDRAW_ONAR = 666721
const BASE_ETH_WITHDRAW_ONL1 = 161063
// depo
const BASE_ERC20_DEPOSIT_DEPOSIT_ONL1 = 48485
const BASE_ETH_DEPOSIT_DEPOSIT_ONL1 = 48485


// scroll
const SCROLL_ETH_DEPOSIT = 21000
const SCROLL_ETH_WITHDRAW = 21000

export default {
  // min ~ max
  async getTransferGasLimit(fromChainID, makerAddress, fromTokenAddress) {
    
 if (util.isEthTokenAddress(fromChainID, fromTokenAddress)) {

      const rpcList = util.getRpcList(fromChainID)
      if (!rpcList.length) {
        return 0
      }
      let estimateGas = await util.requestWeb3(fromChainID, 'estimateGas', {
        from: web3State.coinbase,
        to: makerAddress,
      })
      let gasPrice = await util.requestWeb3(fromChainID, 'getGasPrice')
      // EIP1559
      if (fromChainID === 21 || fromChainID === 521) {
        const provider = new providers.JsonRpcProvider({
          url: util.stableRpc(fromChainID)
        });
        const fee = await provider.getFeeData();
        gasPrice = fee.maxPriorityFeePerGas.toString();
        estimateGas = 55000;
      }

      let gas = new BigNumber(gasPrice).multipliedBy(estimateGas)
      return gas.dividedBy(10 ** 18).toString()
    }
    return 0
  },

  // gasCost-> savingValue
  async transferSpentGas(fromChainID, gasPriceMap, gasLimitMap) {
    const { selectMakerConfig } = transferDataState
    const gasPrice = await this.getGasPrice(fromChainID.toString())
    if (!gasPrice) {
      const gas =
        ((gasPriceMap[fromChainID.toString()] || 1) *
          (gasLimitMap[fromChainID.toString()] || 21000)) /
        10 ** 9
      return gas.toFixed(6).toString()
    } else {
      let gas = gasPrice * (gasLimitMap[fromChainID.toString()] || 21000)
      gas = gas / 10 ** 18
      return gas.toFixed(6).toString()
    }
  },

  transferSpentTime(fromChainID, toChainID) {
    let timeSpent = 0
    if (fromChainID === 1 || fromChainID === 4 || fromChainID === 5) {
      timeSpent = 30
    }
    if (fromChainID === 2 || fromChainID === 22) {
      timeSpent = 15
    }
    if (fromChainID === 10 || fromChainID === 510) {
      timeSpent = 15
    }
    if (fromChainID === 21 || fromChainID === 521) {
      timeSpent = 15
    }
    if (fromChainID === 25 || fromChainID === 525) {
      timeSpent = 15
    }
    if (fromChainID === 30 || fromChainID === 530) {
      timeSpent = 15
    }
    if (
      fromChainID === 3 ||
      fromChainID === 33 ||
      fromChainID === 12 ||
      fromChainID === 512
    ) {
      timeSpent = 5
    }
    if (fromChainID === 6 || fromChainID === 66) {
      timeSpent = 15
    }
    if (fromChainID === 7 || fromChainID === 77) {
      timeSpent = 15
    }
    if (fromChainID === 8 || fromChainID === 88) {
      timeSpent = 5
    }
    if (fromChainID === 9 || fromChainID === 99) {
      timeSpent = 15
    }
    if (fromChainID === 13 || fromChainID === 513) {
      timeSpent = 20
    }
    if (fromChainID === 16 || fromChainID === 516) {
      timeSpent = 30
    }
    if (fromChainID === 4 || fromChainID === 44) {
      timeSpent = 180
    }
    if (fromChainID === 518) {
      timeSpent = 15
    }
    if (fromChainID === 519) {
      timeSpent = 6.828
    }
    if (toChainID === 4 || toChainID === 44) {
      timeSpent = 180
    }
    if (toChainID === 1 || toChainID === 5) {
      timeSpent += 30
    }
    if (toChainID === 16 || toChainID === 516) {
      timeSpent += 30
    }
    if (toChainID === 2 || toChainID === 22) {
      timeSpent += 15
    }
    if (
      toChainID === 3 ||
      toChainID === 33 ||
      toChainID === 12 ||
      toChainID === 512
    ) {
      timeSpent += 5
    }
    if (toChainID === 6 || toChainID === 66) {
      timeSpent += 15
    }
    if (toChainID === 7 || toChainID === 77) {
      timeSpent += 15
    }
    if (toChainID === 8 || toChainID === 88) {
      timeSpent += 5
    }
    if (toChainID === 9 || toChainID === 99) {
      timeSpent += 15
    }
    if (toChainID === 10 || toChainID === 510) {
      timeSpent += 15
    }
    if (toChainID === 11 || toChainID === 511) {
      timeSpent += 5
    }
    if (toChainID === 13 || toChainID === 513) {
      timeSpent += 20
    }
    if (toChainID === 14 || toChainID === 514) {
      timeSpent += 15
    }
    if (toChainID === 518) {
      timeSpent += 15
    }
    if (toChainID === 519) {
      timeSpent += 6.828
    }
    if (toChainID === 21 || toChainID === 521) {
      timeSpent += 15
    }
    if (toChainID === 25 || toChainID === 525) {
      timeSpent += 15
    }
    if (toChainID === 30 || toChainID === 530) {
      timeSpent += 15
    }
    if (toChainID === 523 || toChainID === 23) {
      timeSpent += 30
    }
    if (toChainID === 517 || toChainID === 17) {
      timeSpent += 30
    }

    const timeSpentStr = timeSpent + 's'
    return timeSpentStr
  },

  transferOrginTime(fromChainID, toChainID) {

    if (fromChainID === 21 || fromChainID === 521) {
      return '~10 mins'
    }
    
    if (fromChainID === 1 || fromChainID === 5) {
      if (toChainID === 21 || toChainID === 521) {
        return '~10 mins'
      }
    
    }
  },

  transferSavingTime(fromChainID, toChainID) {
    if (fromChainID === 21 || fromChainID === 521) {
      return ' 10 mins'
    }
    if (fromChainID === 1 || fromChainID === 5) {

      if (toChainID === 21 || toChainID === 521) {
        return '10min'
      }
    }
  },

  async transferOrginGasUsd(fromChainID, toChainID, isErc20 = true) {
    let ethGas = 0
    let maticGas = 0
    let metisGas = 0
    let bscGas = 0
    const { selectMakerConfig } = transferDataState


    if (fromChainID === 21 || fromChainID === 521) {
      // base w
      const fromGasPrice = await this.getGasPrice(fromChainID)
      const l2Fee = fromGasPrice * (isErc20  ? BASE_ERC20_WITHDRAW_ONAR : BASE_ETH_WITHDRAW_ONAR);
      // l1 w
      const L1ChainID = fromChainID === 21 ? 1 : 5
      const L1GasPrice = await this.getGasPrice(L1ChainID)
      const l1Fee = L1GasPrice * (isErc20  ? BASE_ERC20_WITHDRAW_ONL1 : BASE_ETH_WITHDRAW_ONL1);
      ethGas = l2Fee + l1Fee

    }


    if (toChainID ==21 || toChainID == 521) {
      const toGasPrice = await this.getGasPrice(toChainID === 2 ? 1 : 5)
      const arDepositGas =
        toGasPrice *
        (isErc20
          ? BASE_ERC20_DEPOSIT_DEPOSIT_ONL1
          : BASE_ETH_DEPOSIT_DEPOSIT_ONL1)
      ethGas += arDepositGas

    }

    let usd = new BigNumber(0)
    if (ethGas > 0) {
      usd = usd.plus(
        await exchangeToUsd(new BigNumber(ethGas).dividedBy(10 ** 18))
      )
    }
    if (maticGas > 0) {
      usd = usd.plus(
        await exchangeToUsd(
          new BigNumber(maticGas).dividedBy(10 ** 18),
          'MATIC'
        )
      )
    }
    if (bscGas > 0) {
      usd = usd.plus(
        await exchangeToUsd(new BigNumber(bscGas).dividedBy(10 ** 18), 'BNB')
      )
    }
    if (metisGas > 0) {
      usd = usd.plus(
        await exchangeToUsd(
          new BigNumber(metisGas).dividedBy(10 ** 18),
          'METIS'
        )
      )
    }
    return usd.toNumber()
  },

  async getTransferBalance(
    localChainID,
    tokenAddress,
    tokenName,
    userAddress,
    isMaker = false
  ) {
      return this.getBalanceByRPC(localChainID, userAddress, tokenAddress)
    
  },
  async getBalanceByRPC(chainId, userAddress, tokenAddress) {
    
    if (util.isEthTokenAddress(chainId, tokenAddress)) {
      // When is ETH
      const balance = await util.requestWeb3(chainId, 'getBalance', userAddress)
      return Number(balance) || 0
    } else {
      // When is ERC20
      const tokenBalance = await util.getWeb3TokenBalance(
        chainId,
        userAddress,
        tokenAddress
      )
      return Number(tokenBalance)
    }
  },
  async getGasPrice(fromChainID) {
    
    const rpcList = util.getRpcList(fromChainID)
    for (const rpc of rpcList) {
      try {
        const response = await axios.post(rpc, {
          jsonrpc: '2.0',
          method: 'eth_gasPrice',
          params: [],
          id: 0,
        })
        if (response.status === 200) {
          util.setStableRpc(fromChainID, rpc, 'eth_gasPrice')
          return parseInt(response.data.result)
        }
      } catch (e) {
        util.setStableRpc(fromChainID, '', 'eth_gasPrice')
      }
    }
    util.setStableRpc(fromChainID, '', 'eth_gasPrice')
    return null
  },

  async getTokenConvertUsd(tokenName) {
    try {
      return (await exchangeToUsd(1, tokenName)).toNumber()
    } catch (error) {
      throw error.message
    }
  },

  realTransferOPID() {
    const toChainID = transferDataState.toChainID
    return 9000 + Number(toChainID) + ''
  },

  getTransferTValue() {
    const { selectMakerConfig, transferValue, fromChainID, toChainID } =
      transferDataState
    const rAmount = new BigNumber(transferValue)
      .plus(new BigNumber(selectMakerConfig.tradingFee))
      .multipliedBy(new BigNumber(10 ** selectMakerConfig.fromChain.decimals))
    const rAmountValue = rAmount.toFixed()
    const p_text = 9000 + Number(toChainID) + ''
    return orbiterCore.getTAmountFromRAmount(fromChainID, rAmountValue, p_text)
  },
  realTransferAmount() {
    const { selectMakerConfig, transferValue, fromChainID, toChainID } =
      transferDataState
    const userValue = new BigNumber(transferValue).plus(
      new BigNumber(selectMakerConfig.tradingFee)
    )
    if (!fromChainID || !userValue) {
      return 0
    }
    const rAmount = new BigNumber(userValue).multipliedBy(
      new BigNumber(10 ** selectMakerConfig.fromChain.decimals)
    )
    const rAmountValue = rAmount.toFixed()
    const p_text = 9000 + Number(toChainID) + ''
    const tValue = orbiterCore.getTAmountFromRAmount(
      fromChainID,
      rAmountValue,
      p_text
    )
    if (!tValue.state) {
      return userValue
    } else {
      return new BigNumber(tValue.tAmount).dividedBy(
        new BigNumber(10 ** selectMakerConfig.fromChain.decimals)
      )
    }
  },
}
