<template>
    <div class="bridage-page">
        <div class="transfer-box">
            <div class="top-area" >
                <h1  class="title">Uncle Sam Bridge</h1> 
                <span  class="title">USDEBT is a multi-chain meme coin.  <br/>This smart contract allows the transfer of USDEBT between Ethereum and Base Chain. <br/><br/></span>
            </div>
        </div>
        <template>
            <div
                v-show="!isMobile && status === '1' && !showDetail"
                class="sub-tabs"
            >
        
            </div>
            <div
                v-show="isSenderTab && status === '1' && !showDetail"
                class="sender-box"
            >
                <keep-alive>
                    <Transfer @stateChanged="changeState" />
                </keep-alive>
            </div>
            
        </template>
        <div
            v-show="status !== '1' || showDetail"
            style="width: 100%; height: 100%"
            class="center"
        >
            <Proceed
                v-if="showDetail"
                :detailData="detailData"
                @stateChanged="changeState"
            />
            <template v-else>
                <Confirm v-if="status === '2'" @stateChanged="changeState" />
                <Proceed v-if="status === '3'" @stateChanged="changeState" />
            </template>
        </div>
    </div>
</template>

<script>
import { Transfer, Confirm, Proceed } from './'
import { CommBtn, SvgIconThemed } from '../../components'
import {
    isMobile,
    curPageTabState,
    togglePageTab,
    curPageStatus,
    changeCurPageStatus,
    historyPanelState,
} from '../../composition/hooks'

export default {
    name: 'Bridge',
    components: {
        Transfer,
        Confirm,
        Proceed,
        SvgIconThemed,
        CommBtn,
    },
    computed: {
        isLightMode() {
            return this.$store.state.themeMode === 'light'
        },
        isMobile() {
            return isMobile.value
        },
        isSenderTab() {
            return curPageTabState.value === 'Sender'
        },
        status() {
            return curPageStatus.value
        },
        showDetail() {
            return historyPanelState.isShowHistory
        },
        detailData() {
            return historyPanelState.historyInfo
        },
    },
    methods: {
        toggleTab() {
            changeCurPageStatus('1')
            togglePageTab()
        },
        openUrl(type) {
            // if (type === 1) {
            //     window.open(
            //         'https://docs.orbiter.finance/makersystem',
            //         '_blank'
            //     )
            // } else if (type === 2) {
            //     window.open('https://discord.com/invite/hJJvXP7C73', '_blank')
            // } else if (type === 99) {
            //     window.open('https://testmaker.orbiter.finance/', '_blank')
            // }
        },
        changeState(e) {
            if (e !== '1' && e !== '2' && e !== '3') {
                historyPanelState.isShowHistory = false
            } else {
                if (this.status !== e) {
                    changeCurPageStatus(e)
                }
            }
        },
    },
}
</script>

<style scoped lang="scss">

.app {
    .bridage-page {
        .maker-box {
            width: 480px;
            height: 380px;
            .maker-content {
                .maker-foot-btn {
                    width: 400px;
                }
            }
        }
        .sender-box {
            width: 480px;
            /*height: 540px;*/
            padding: 24px 20px;
        }
    }
}
.app-mobile {
    .bridage-page {
        // height: 100%;
        .maker-box {
            height: 100%;
            width: 100%;
        }
        .sender-box {
            width: 100%;
            height: 100%;
            padding: 24px 20px;
        }
    }
}
.bridage-page {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    .sub-tabs {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 24px;
        margin-top: 0px;
        .tab-toggle-btn {
            width: 229px;
            height: 40px;
            border-radius: 5px;
            .tab-btn-item {
                display: inline-block;
                width: 50%;
                text-align: center;
                font-weight: 700;
                font-size: 16px;
                height: 100%;
                line-height: 40px;
                border-radius: 5px;
                cursor: pointer;
            }
            .tab-btn-item.selected {
                background: #920000;
                color: #ffffff;
                // box-shadow: inset 0px -6px 0px rgba(0, 0, 0, 0.16);
            }
        }
    }
    .sender-box {
        border-radius: 5px;
    }
    .maker-box {
        position: relative;
        border-radius: 5px;
        padding: 34px 20px;
        text-align: left;

        .new {
            position: absolute;
            right: 10px;
            top: 10px;

            .img {
                width: 70px;
            }
        }
        .maker-title {
            font-weight: 700;
            font-size: 20px;
            line-height: 20px;
        }
        .maker-content {
            font-family: 'Inter Regular';
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
            margin-top: 30px;

            .bottom-box {
                width: 100%;
                display: flex;
                justify-content: center;
                margin-top: 30px;

                .bottom-btn {
                    width: 100%;
                    height: 50px;
                    display: inline-block;
                    line-height: 34px;
                    margin-bottom: 20px;
                    background: linear-gradient(
                        90.46deg,
                        #920000 4.07%,
                        #bc3035 98.55%
                    );
                    border-radius: 5px;
                }
            }

            .maker-desc {
                margin-bottom: 8px;
                display: flex;
                font-family: 'Inter Regular';

                .point {
                    border-radius: 5px;
                    background-color: #7bc2ba;
                    color: #e9ece2;
                    width: 16px;
                    height: 16px;
                    line-height: 16px;
                    text-align: center;
                    margin-right: 8px;
                    font-size: 13px;
                }
            }

            .maker-line {
                display: flex;
                align-items: center;
                margin-bottom: 8px;

                .maker-icon {
                    margin-right: 8px;
                }
                .maker-link {
                    text-decoration: underline;
                    color: #3d3d3e;
                }
                .maker-link-dark {
                    text-decoration: underline;
                    color: #ffffff;
                }
            }

            .maker-link:hover {
                text-decoration: underline;
                cursor: pointer;
            }
            .maker-foot-btn {
                height: 50px;
                // box-shadow: inset 0px -8px 0px rgba(0, 0, 0, 0.16);
                border-radius: 5px;
                font-weight: 700;
                font-size: 20px;
                line-height: 20px;
                color: #fff;
                margin-top: 40px;
                text-align: center;
                line-height: 50px;
                font-family: 'Inter Bold';
            }
        }
    }
}
</style>
