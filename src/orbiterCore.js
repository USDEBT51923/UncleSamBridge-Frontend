import util from './util/util'

const BigNumber = require('bignumber.js')

const MAX_BITS = {
  eth: 256,
  base: 256,
}

const CHAIN_INDEX = {
  1: 'eth',
  5: 'eth',
  21: 'base',
  521: 'base',
}

const SIZE_OP = {
  P_NUMBER: 4,
}


function getToAmountFromUserAmount(userAmount, selectMakerConfig, isWei) {
  
   return new BigNumber(userAmount)
}

function getTAmountFromRAmount(chain, amount) {
  if (!isChainSupport(chain)) {
    return {
      state: false,
      error: 'The chain did not support',
    }
  }
  if (amount < 1) {
    return {
      state: false,
      error: "the token doesn't support that many decimal digits",
    }
  }


  var amountLength = amount.toString().length
  if (amountLength < SIZE_OP.P_NUMBER) {
    return {
      state: false,
      error: 'Amount size must be greater than pNumberSize',
    }
  }
 
  let tAmount =
    amount.toString().slice(0, amountLength) 
  return {
    state: true,
    tAmount,
  }

}

function getToChainIDFromAmount(chain, amount) {
  let pText = getPTextFromTAmount(chain, amount)
  let toChainID
  if (pText.state) {
    toChainID = pText.pText
  } else {
    return null
  }
  if (toChainID > 9000) {
    return toChainID - 9000
  } else {
    return null
  }
}

function getPTextFromTAmount(chain, amount) {
  if (!isChainSupport(chain)) {
    return {
      state: false,
      error: 'The chain did not support',
    }
  }
  if (amount < 1) {
    return {
      state: false,
      error: "the token doesn't support that many decimal digits",
    }
  }

  let validDigit = AmountValidDigits(chain, amount) // 10 11
  var amountLength = amount.toString().length
  if (amountLength < SIZE_OP.P_NUMBER) {
    return {
      state: false,
      error: 'Amount size must be greater than pNumberSize',
    }
  }
  
  let op_text = amount.toString().slice(-SIZE_OP.P_NUMBER)
  return {
    state: true,
    pText: op_text,
  }

}

function getRAmountFromTAmount(chain, amount) {
  let pText = ''
  for (let index = 0; index < SIZE_OP.P_NUMBER; index++) {
    pText = pText + '0'
  }
  if (!isChainSupport(chain)) {
    return {
      state: false,
      error: 'The chain did not support',
    }
  }
  if (amount < 1) {
    return {
      state: false,
      error: "the token doesn't support that many decimal digits",
    }
  }

  let validDigit = AmountValidDigits(chain, amount) // 10 11
  var amountLength = amount.toString().length
  if (amountLength < SIZE_OP.P_NUMBER) {
    return {
      state: false,
      error: 'Amount size must be greater than pNumberSize',
    }
  }
  
  let rAmount =
    amount.toString().slice(0, amountLength - SIZE_OP.P_NUMBER) + pText
  return {
    state: true,
    rAmount,
  }

}

function isChainSupport(chain) {
  return !!util.getChainInfoByChainId(chain)
}

// 0 ~ (2 ** N - 1)
function AmountRegion(chain) {
  if (!isChainSupport(chain)) {
    return {
      error: 'The chain did not support',
    }
  }
  if (typeof chain === 'number') {
    let max = BigNumber(2 ** (MAX_BITS[CHAIN_INDEX[chain]] || 256) - 1)
    return {
      min: BigNumber(0),
      max,
    }
  } else if (typeof chain === 'string') {
    let max = BigNumber(2 ** (MAX_BITS[chain.toLowerCase()] || 256) - 1)
    return {
      min: BigNumber(0),
      max,
    }
  }
}

function AmountMaxDigits(chain) {
  let amountRegion = AmountRegion(chain)
  if (amountRegion.error) {
    return amountRegion
  }
  return amountRegion.max.toFixed().length
}

function AmountValidDigits(chain, amount) {
  let amountMaxDigits = AmountMaxDigits(chain)
  if (amountMaxDigits.error) {
    return amountMaxDigits.error
  }
  let amountRegion = AmountRegion(chain)

  let ramount = removeSidesZero(amount.toString())

  if (ramount.length > amountMaxDigits) {
    return 'amount is inValid'
  }
  if (ramount > amountRegion.max.toFixed()) {
    return amountMaxDigits - 1
  } else {
    return amountMaxDigits
  }
}

function removeSidesZero(param) {
  if (typeof param !== 'string') {
    return 'param must be string'
  }
  return param.replace(/^0+(\d)|(\d)0+$/gm, '$1$2')
}

function isAmountInRegion(amount, chain) {
  if (!isChainSupport(chain)) {
    return {
      state: false,
      error: 'The chain did not support',
    }
  }
  let amountRegion = AmountRegion(chain)
  if (amountRegion.error) {
    return false
  }
  if (
    BigNumber(amount).gte(amountRegion.min) &&
    BigNumber(amount).lte(amountRegion.max)
  ) {
    return true
  }
  return false
}

function pTextFormatZero(num) {
  if (String(num).length > SIZE_OP.P_NUMBER) return num
  return (Array(SIZE_OP.P_NUMBER).join(0) + num).slice(-SIZE_OP.P_NUMBER)
}

function isAmountValid(chain, amount) {
  if (!isChainSupport(chain)) {
    return {
      state: false,
      error: 'The chain did not support',
    }
  }
  if (amount < 1) {
    return {
      state: false,
      error: "the token doesn't support that many decimal digits",
    }
  }

  let validDigit = AmountValidDigits(chain, amount) // 10 11
  var amountLength = amount.toString().length
  if (amountLength < SIZE_OP.P_NUMBER) {
    return {
      state: false,
      error: 'Amount size must be greater than pNumberSize',
    }
  }

  let rAmount = amount

  if (!isAmountInRegion(rAmount, chain)) {
    return {
      state: false,
      error: 'Amount exceeds the spending range',
    }
  }

  let op_text = amount.toString().slice(-SIZE_OP.P_NUMBER)
  if (Number(op_text) === 0) {
    return {
      state: true,
    }
  }
  return {
    state: false,
    error: 'Insufficient number of flag bits',
  }

}

/**
 * @param {number} precision
 */
function getDigitByPrecision(precision) {
  return precision === 18 ? 6 : 2
}

export default {
  getPTextFromTAmount,
  getToChainIDFromAmount,
  isAmountValid,
  getTAmountFromRAmount,
  getRAmountFromTAmount,
  pTextFormatZero,
  getToAmountFromUserAmount,
  getDigitByPrecision,
}
