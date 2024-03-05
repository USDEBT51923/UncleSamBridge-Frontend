<template>
    <div class="confirm-box">
        <CommBoxHeader
            :back="closerButton"
            :style="isMobile ? '' : 'margin-bottom:30px;'"
            >Confirm</CommBoxHeader
        >
        <div
            v-for="item in confirmData"
            :key="item.title"
            class="confirm-item"
            :style="{ marginBottom: '22px' }"
        >
            <div class="item-left">
                <SvgIconThemed :icon="item.icon" />
                <span class="left-txt">{{ item.title }}</span>
                <o-tooltip placement="topLeft">
                    <template v-slot:titleDesc>
                        <span class="o-tip">{{ item.notice }}</span>
                    </template>
                    <HelpIcon v-if="item.notice" size="sm" />
                </o-tooltip>
            </div>
            <div class="item-right">
                <span v-if="item.desc">{{ item.desc }}</span>
            </div>
            <div
                v-if="item.descInfo && item.descInfo.length > 0"
                class="descBottom"
            >
             <div
                    v-for="(desc, index) in item.descInfo"
                    :key="desc.no"
                    style="margin-bottom: 1rem"
                >
                    <span
                        style="
                            width: 40px;
                            display: -moz-inline-box;
                            display: inline-block;
                        "
                    >
                        {{ index === 0 ? 'Send' : '' }}
                    </span>
                    <o-tooltip v-if="desc.fromTip" placement="topLeft">
                        <template v-slot:titleDesc>
                            <span class="o-tip">{{ desc.fromTip }}</span>
                        </template>
                        <span
                            style="
                                margin-left: 0.7rem;
                                margin-right: 0.7rem;
                                color: #920000;
                                width: 90px;
                                display: -moz-inline-box;
                                display: inline-block;
                                text-align: center;
                            "
                        >
                            {{ desc.from }}
                        </span>
                    </o-tooltip>
                    <span
                        v-else
                        style="
                            margin-left: 0.7rem;
                            margin-right: 0.7rem;
                            color: #920000;
                            width: 90px;
                            display: -moz-inline-box;
                            display: inline-block;
                            text-align: center;
                        "
                    >
                    {{ formatValue(desc.from) }}
                    </span>
                    To
                    <o-tooltip placement="topLeft">
                        <template v-slot:titleDesc>
                            <span class="o-tip">{{ desc.toTip }}</span>
                        </template>
                        <span
                            style="
                                margin-left: 0.7rem;
                                color: #920000;
                                width: 90px;
                                display: -moz-inline-box;
                                display: inline-block;
                                text-align: center;
                            "
                        >
                            {{ desc.to }}
                        </span>
                    </o-tooltip>
                    <!-- <span style="margin-left: 0.3rem; vertical-align: -25%">
                        <SvgIconThemed :icon="desc.icon" />
                    </span> -->
                </div>
            </div>
            <div
                v-if="item.haveSep"
                style="
                    border-bottom: 2px dashed rgba(0, 0, 0, 0.2);
                    height: 43px;
                "
            ></div>
        </div>

        <CommBtn @click="RealTransfer" class="select-wallet-dialog">
            <span
                v-if="!transferLoading"
                class="wbold s16"
                style="letter-spacing: 0.1rem"
                >CONFIRM AND SEND</span
            >
            <CommLoading
                v-else
                style="margin: auto"
                loadingColor="white"
                width="2rem"
                height="2rem"
            />
        </CommBtn>
    </div>
</template>

<script>
import {
    SvgIconThemed,
    CommBoxHeader,
    CommBtn,
    HelpIcon,
} from '../../components'
import BigNumber from 'bignumber.js'
import getProceeding from '../../util/proceeding/getProceeding'
import {
    getTransferContract,
    getTransferGasLimit,
} from '../../util/constants/contract/getContract.js'
import transferCalculate from '../../util/transfer/transferCalculate'
import orbiterCore from '../../orbiterCore'
import util from '../../util/util'
import Middle from '../../util/middle/middle'
import { utils } from 'zksync'
import { submitSignedTransactionsBatch } from 'zksync/build/wallet'
import Web3 from 'web3'
import { WALLETCONNECT, TOKEN_POCKET_APP } from '../../util/walletsDispatchers/constants'



import { CrossAddress } from '../../util/cross_address'
import * as ethers from 'ethers'

import walletDispatchers, {
    METAMASK
} from '../../util/walletsDispatchers/index'
import {
    walletIsLogin,
    compatibleGlobalWalletConf,
} from '../../composition/walletsResponsiveData'
import { isMobile, transferDataState, web3State } from '../../composition/hooks'
import { Coin_ABI} from '../../util/constants/contract/contract.js'
import { providers } from 'ethers'

const {
    walletDispatchersOnSignature,
    walletDispatchersOnSwitchChain,
    walletConnectSendTransaction,
} = walletDispatchers
const numberShorter = (x) => {
    if (x === 0) {
      return "0.0"
    }
    if (x / 1000000000000 >= 1) {
      return `${(x / 1000000000000).toFixed(1)}T`;
    } else if (x / 1000000000 >= 1) {
      return `${(x / 1000000000).toFixed(1)}B`;
    } else if (x / 1000000 >= 1) {
      return `${(x / 1000000).toFixed(1)}M`;
    } else if (x / 1000 >= 1) {
      return `${(x / 1000).toFixed(1)}K`;
    } else {
      return `${x?.toFixed(1)}`;
    }
  };
export default {
    name: 'Confirm',
    components: { SvgIconThemed, CommBoxHeader, CommBtn, HelpIcon },
    data() {
        return {
            transferLoading: false,
            expectValue: '',
        }
    },
    computed: {
        isMobile() {
            return isMobile.value
        },
        confirmData() {
            const { selectMakerConfig } = transferDataState
            // 0.000120000000009022 to 0.000120...09022
            let realTransferAmount = transferCalculate
                .realTransferAmount()
                .toString()
            // realTransferAmount = realTransferAmount.replace(
            //     /(.*?0)0{4,}(0.*?)/,
            //     '$1...$2'
            // )
            const comm = [
                // {
                //     icon: 'withholding',
                //     title: 'Withholding Fee',
                //     notice: 'The ‘Maker’ charges the ‘Sender’ a fixed fee to cover the fluctuating gas fees that incur when sending funds to the destination network.',
                //     desc:
                //         selectMakerConfig.tradingFee +
                //         ' ' +
                //         selectMakerConfig.fromChain.symbol,
                // },
                // {
                //     icon: 'security',
                //     title: 'Identification Code',
                //     notice: 'In UncleSamBridge, each transaction has a four digit identification code. The identification code can be seen at the end of the total amount being transferred as a way to identify the transaction. The identification code will be the evidence in the case that the ‘Maker’ does not send the assets to the target network. This will act as an evidence to claim your funds from the margin contract.',
                //     desc: transferCalculate.realTransferOPID(),
                //     haveSep: true,
                // },
                {
                    icon: 'send',
                    title: 'Total Send',
                    // notice: 'Total amount sent by the ‘Sender’ including the withholding fee.',
                    desc:
                        realTransferAmount +
                        ' ' +
                        selectMakerConfig.fromChain.symbol,
                    textBold: true,
                },
                {
                    icon: 'received',
                    title: 'Received',
                    desc: this.expectValue,
                    textBold: true,
                },
{
                    icon: 'exchange',
                    title: 'Bridge Routes',
                    // notice: 'After the ‘Sender’ submits the transaction, the assets are transferred to the ‘Maker’s’ address who will provide the liquidity. UncleSamBridge’s contract will ensure the safety of the assets and will make sure that the ‘Sender’ receives the assets to the target network.',
                    descInfo: this.$store.state.confirmData.routeDescInfo,
                },
            ]
            return [...comm]
        },
    },
    methods: {
        async RealTransfer() {
            if (!walletIsLogin.value) {
                Middle.$emit('connectWallet', true)
                return
            }
            if (!await util.isLegalAddress()) {
                this.$notify.error({
                    title: `Contract address is not supported, please use EVM address.`,
                    duration: 3000,
                });
                return;
            }
            const { fromChainID, toChainID, selectMakerConfig } =
                transferDataState
            
            if (
                compatibleGlobalWalletConf.value.walletPayload.networkId.toString() !==
                util.getMetaMaskNetworkId(fromChainID).toString()
            ) {
                if (
                    [METAMASK, WALLETCONNECT, TOKEN_POCKET_APP].includes(compatibleGlobalWalletConf.value.walletType)
                ) {
                    try {
                        if (
                            !(await util.ensureWalletNetwork(fromChainID))
                        ) {
                            return
                        }
                    } catch (err) {
                        util.showMessage(err.message, 'error')
                        return
                    }
                } else {
                    const matchAddChainDispatcher =
                        walletDispatchersOnSwitchChain[
                            compatibleGlobalWalletConf.value.walletType
                        ]
                    if (matchAddChainDispatcher) {
                        matchAddChainDispatcher(
                            compatibleGlobalWalletConf.value.walletPayload
                                .provider
                        )
                        return
                    }
                }
            }
        

            // Only one
            // if (this.transferLoading) {
            //     return
            // }

            this.transferLoading = true
            const tokenAddress = selectMakerConfig.fromChain.tokenAddress
            const to = selectMakerConfig.recipient
            const tValue = transferCalculate.getTransferTValue()
            if (!tValue.state) {
                this.$notify.error({
                    title: tValue.error,
                    duration: 3000,
                })
                this.transferLoading = false
                return
            }

            const account = compatibleGlobalWalletConf.value.walletPayload.walletAddress
            const adapterParams = ethers.utils.solidityPack(["uint16", "uint256"], [1, 200000]) // default adapterParams example
            
            const amount = new BigNumber(tValue.tAmount)


            // const balance = await util.requestWeb3(chainId, 'getBalance', userAddress)
            //const adapterParams = ethers.utils.solidityPack(["uint16", "uint256"], [1, 200000]) // default adapterParams example
            //  const fees = await tokenContract.methods.estimateSendFee(10160, account, 333, false, adapterParams).call();
            const fees = await util.getZeroFee(fromChainID, toChainID, account, tValue.tAmount, adapterParams)
            
           
            let transferContract = getTransferContract(
                util.GetZeroContractAddress(fromChainID), 0
            )
            if (fromChainID === 21) {
                transferContract = getTransferContract(
                    util.GetZeroContractAddress(fromChainID), 3 )
            }
            
            if (!transferContract) {
                this.$notify.error({
                    title: 'Failed to obtain contract information, please refresh and try again',
                    duration: 3000,
                })
                return
            }

            if(tokenAddress == "0x0000000000000000000000000000000000000000"){
                
                transferContract = getTransferContract(
                    util.GetZeroNativeContractAddress(fromChainID), 1
                )
                
   
                const nativeFee = new BigNumber(await util.getZeroNativeFee(fromChainID, toChainID, account, tValue.tAmount, adapterParams))
                const increasedNativeFee = nativeFee.times(5).dividedBy(4).integerValue()// 20% increase
                const gasPrice = new BigNumber(await transferCalculate.getGasPrice(fromChainID))
                const finalGasPrice = gasPrice.times(2)
                

                
                const finalAmount = amount.plus(increasedNativeFee)
                
                if (!transferContract) {
                    this.$notify.error({
                        title: 'Failed to obtain contract information, please refresh and try again',
                        duration: 3000,
                    })
                    return
                }

                transferContract.methods
                .bridge(amount, util.GetZeroChainId(toChainID), account, account, ethers.constants.AddressZero, "0x" )
                .send({ from: account, value: finalAmount, gasPrice: finalGasPrice}, (error, transactionHash)=>{
                        this.transferLoading = false
                        if (!error) {
                            this.onTransferSucceed(
                                account,
                                tValue.tAmount,
                                fromChainID,
                                transactionHash
                            )
                        } else {
                            this.$notify.error({
                                title: error.message,
                                duration: 3000,
                            })
                        }
                    }
                );
            } else {
                const provider = new ethers.providers.Web3Provider(
                    compatibleGlobalWalletConf.value.walletPayload.provider
                )
                
                if(fromChainID === 1 || fromChainID === 5 ) {
                    const crossAddress = new CrossAddress(provider, fromChainID, provider.getSigner(),util.GetZeroERC20TokenAddress(fromChainID))
                    await crossAddress.contractApprove(
                        util.GetZeroERC20TokenAddress(fromChainID),
                        util.GetZeroContractAddress(fromChainID),
                        ethers.BigNumber.from(tValue.tAmount)
                    )
                }
                
                transferContract.methods
                .sendFrom(account, util.GetZeroChainId(toChainID), account, tValue.tAmount, account,ethers.constants.AddressZero, "0x" )
                .send({ from: account, value: fees[0] }, (error, transactionHash)=>{
                        this.transferLoading = false
                        if (!error) {
                            this.onTransferSucceed(
                                account,
                                tValue.tAmount,
                                fromChainID,
                                transactionHash
                            )
                        } else {
                            this.$notify.error({
                                title: error.message,
                                duration: 3000,
                            })
                        }
                    }
                );
            }


            },
        onTransferSucceed(from, amount, fromChainID, transactionHash) {
            const { selectMakerConfig } = transferDataState
            // Immutablex's identifier is not a hash
            let title = transactionHash

            getProceeding.UserTransferReady(
                from,
                selectMakerConfig.recipient,
                amount,
                fromChainID,
                transactionHash,
                !!selectMakerConfig.ebcId
            )
            
            this.$notify.success({
                title,
                duration: 3000,
            })

            this.$emit('stateChanged', '3')

        },
        closerButton() {
            this.$emit('stateChanged', '1')
        },
        formatValue(value) {
            const numericPart = parseFloat(value);
            const suffix = value.replace(/[\d.-]/g, '');
            if (!isNaN(numericPart)) {
            const formattedNumber = numberShorter(numericPart);
            return `${formattedNumber}`;
            }
            // return value; // Return the original value if it can't be parsed
            return numericPart
        },

    },
    async mounted() {
        const { selectMakerConfig, transferValue } = transferDataState
        const amount = orbiterCore.getToAmountFromUserAmount(
            new BigNumber(transferValue),
            selectMakerConfig,
            false
        )

        this.expectValue = `${amount} ${selectMakerConfig.fromChain.symbol}`
        

    },
}
</script>

<style scoped lang="scss">
.app {
    .confirm-box {
        width: 480px;
        padding-bottom: 20px;
        .confirm-item {
            margin: 22px 0;
        }
    }
    .select-wallet-dialog {
        width: 420px;
    }
}
.app-mobile {
    .confirm-box {
        width: 100%;
        // height: calc(100% - );
        height: 100%;
        padding: 0 20px;
        .confirm-item {
            margin: 12px 0;
        }
    }
    .select-wallet-dialog {
        width: 100%;
    }
}
.confirm-box {
    font-family: 'Inter Regular';
    border-radius: 5px;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    .confirm-item {
        overflow: hidden;
        padding: 0 30px;
        .item-left {
            float: left;
            display: flex;
            align-items: center;
            .left-txt {
                margin: 0 10px 0 8px;
            }
        }
        .item-right {
            float: right;
            font-weight: 400;
            font-size: 14px;
            line-height: 24px;
            text-align: right;
            .textBold {
                font-weight: 600;
            }
        }

        .descBottom {
            max-height: 9.2rem;
            // overflow-y: scroll;
            text-align: center;
            clear: both;
            padding-top: 20px;
        }
    }
    .select-wallet-dialog {
        font-family: 'Inter Bold';
        margin-top: 20px;
        height: 50px;
        line-height: 34px;
        background: linear-gradient(90.46deg, #920000 4.07%, #bc3035 98.55%);
    }
}
.o-tip {
    padding-right: 15px;
}
</style>
