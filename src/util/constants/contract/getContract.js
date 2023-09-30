import Web3 from 'web3'
import { Coin_ABI, ZERO_ABI_ETH, ZERO_ABI_BASE, NATIVE_ABI, NATIVE_OFT_ABI } from './contract.js'
import util from '../../util'
import {
  compatibleGlobalWalletConf,
  walletIsLogin,
} from '../../../composition/walletsResponsiveData'
import { web3State } from '../../../composition/hooks'
// Get a token contract on the L2 network

// To obtain the token contract on the current network, use metamask as a provider to initiate a transaction
function getTransferContract(contractAddress, index) {
  // if localChain = 3 || 33
 
  if (walletIsLogin.value) {
    const web3 = new Web3(
      compatibleGlobalWalletConf.value.walletPayload.provider
    )
    let ecourseContractInstance = new web3.eth.Contract(
      ZERO_ABI_ETH,
      contractAddress
    )
    
    if (index == 1) {
      ecourseContractInstance = new web3.eth.Contract(
        NATIVE_ABI,
        contractAddress
      )
    }
    if (index == 2) {
      ecourseContractInstance = new web3.eth.Contract(
        NATIVE_OFT_ABI,
        contractAddress
      )
    }
    if (index == 3) {
      ecourseContractInstance = new web3.eth.Contract(
        ZERO_ABI_BASE,
        contractAddress
      )
    }
    if (!ecourseContractInstance) {
      return null
    }
    return ecourseContractInstance
  } else {
    return null
  }
}

async function getTransferGasLimit(
  localChainID,
  selectMakerConfig,
  from,
  to,
  value,
  provider = null
) {
  // !walletIsLogin.value
  if (web3State.isInstallMeta || provider) {
    const web3 = new Web3(provider || window.ethereum)
    const tokenAddress = selectMakerConfig.fromChain.tokenAddress
    let gasLimit = 55000
    try {
      if (util.isEthTokenAddress(localChainID, tokenAddress)) {
        gasLimit = await web3.eth.estimateGas({
          from,
          to: selectMakerConfig.recipient,
          value,
        })
        return gasLimit
      } else {
        const ABI = Coin_ABI
        const ecourseContractInstance = new web3.eth.Contract(ABI, tokenAddress)
        if (!ecourseContractInstance) {
          return gasLimit
        }

        gasLimit = await ecourseContractInstance.methods
          .transfer(to, value)
          .estimateGas({
            from,
          })
        return gasLimit
      }
    } catch (err) {
      console.warn('getTransferGasLimit error: ', err)
    }

    return gasLimit
  }
}

export { getTransferContract, getTransferGasLimit }
