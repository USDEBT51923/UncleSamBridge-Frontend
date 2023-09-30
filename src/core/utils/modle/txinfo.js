export default {
  getTxInfoWithEtherScan: function (etherScanInfo) {
    const txInfo = {
      from: etherScanInfo.from.toLowerCase(),
      to: etherScanInfo.to.toLowerCase(),
      tokenAddress: etherScanInfo.contractAddress.toLowerCase(),
      timeStamp: etherScanInfo.timeStamp,
      tokenName: etherScanInfo.tokenSymbol,
      value: etherScanInfo.value,
      tokenDecimal: etherScanInfo.tokenDecimal,
      hash: etherScanInfo.hash,
      nonce: etherScanInfo.nonce,
      dataFrom: 'etherscan',
    }
    return txInfo
  },
}
