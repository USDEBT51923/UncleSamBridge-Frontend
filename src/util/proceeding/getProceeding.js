import orbiterCore from '../../orbiterCore'
import { store } from '../../store'

import util from '../util'

const storeUpdateProceedState = (state) => {
  store.commit('updateProceedState', state)
}

let cron;

function confirmUserTransaction(hash) {
  setTimeout(() => storeUpdateProceedState(2), 5000); 
  setTimeout(() => storeUpdateProceedState(3), 15000);
  setTimeout(() => storeUpdateProceedState(4), 30000); 
  setTimeout(() => storeUpdateProceedState(5), 45000); 
  
}

export default {
  UserTransferReady(user, maker, amount, localChainID, txHash) {
    store.commit('updateProceedTxID', txHash)
    store.commit('updateProceedingUserTransferFrom', user)
    store.commit('updateProceedingUserTransferTo', maker)
    let realAmount = orbiterCore.getRAmountFromTAmount(localChainID, amount)

    if (realAmount.state) {
      realAmount = realAmount.rAmount
    } else {
      throw new Error(`UserTransferReady error: ${realAmount.error}`)
    }
    store.commit('updateProceedingUserTransferAmount', realAmount)
    store.commit('updateProceedingUserTransferLocalChainID', localChainID)
    store.commit('updateProceedingUserTransferTxid', txHash)
    confirmUserTransaction(txHash)
  },
}
