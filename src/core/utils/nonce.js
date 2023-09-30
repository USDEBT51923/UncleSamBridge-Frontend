
import util from '../../util/util'

export default {
  getNonce: async function (
    localChainID,

    userAddress
  ) {

    try {
      const nonce = await util.requestWeb3(
        localChainID,
        'getTransactionCount',
        userAddress
      )
      return nonce
    } catch (err) {
      console.warn('getWeb3NonceError =', err)
      return 0
    }
    
  },
}
