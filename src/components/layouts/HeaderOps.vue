<template>
    <div
        class="header-ops"
        :style="`flex-direction: ${verical ? 'column' : 'row'};`"
    >
        <CommBtn
            ref="connectBtn"
            v-if="!isLogin && !isMobile"
            @click="connectAWallet"
            class="ops-item not-mode"
            style="margin-right: 10px"
            >Connect</CommBtn
        >
        <template v-if="isLogin">
            <div
                ref="connectedBtn"
                @click="connectAWallet"
                class="ops-item center"
                style="display: inline-flex"
            >
                <svg-icon
                    style="width: 2rem; height: 2rem"
                    :iconName="
                        globalSelectWalletConf.walletType &&
                        globalSelectWalletConf.walletType.toLowerCase()
                    "
                ></svg-icon>
                <span class="address">{{ showAddress }}</span>
            </div>
        </template>
        <div @click="toggleThemeMode" class="ops-mode">
            <SvgIconThemed class="mode-icon" icon="mode" />
        </div>
    </div>
</template>

<script>
import { mapMutations } from 'vuex'
import { CommBtn, SvgIconThemed } from '../'
import {
    transferDataState,
    isMobile,
    setSelectWalletDialogVisible,
    showAddress,
    saveSenderPageWorkingState,
} from '../../composition/hooks'
import {
    compatibleGlobalWalletConf,
    walletIsLogin,
} from '../../composition/walletsResponsiveData'

export default {
    name: 'HeaderOps',
    components: { CommBtn, SvgIconThemed },
    props: {
        verical: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    computed: {
        isMobile() {
            return isMobile.value
        },
        globalSelectWalletConf() {
            return compatibleGlobalWalletConf.value
        },
        isLogin() {
            return walletIsLogin.value
        },
        
        showAddress() {
            return showAddress()
        },
    },
    data() {
        const selectedWallet = JSON.parse(
            localStorage.getItem('selectedWallet') || '{}'
        )
        return {
            selectedWallet,
        }
    },
    methods: {
        ...mapMutations(['toggleThemeMode']),
        
        connectAWallet() {
            setSelectWalletDialogVisible(true)
            this.$emit('closeDrawer')
        },
        showHistory() {
            this.$emit('closeDrawer')

            const route = this.$route
            route.path !== '/history' &&
                localStorage.setItem(
                    'last_page_before_history',
                    JSON.stringify({
                        path: route.path,
                        params: route.params,
                        query: route.query,
                    })
                )
            if (route.path === '/') {
                saveSenderPageWorkingState()
            }
            route.path !== '/history' &&
                this.$router.push({
                    path: '/history',
                })
        },
    },
}
</script>

<style scoped lang="scss">
.header-ops {
    margin-right: 16px;
    display: flex;
    align-items: center;
    .ops-mode {
        width: 40px;
        height: 40px;
        border-radius: 5px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        .mode-icon {
            width: 16px;
            height: 16px;
        }
    }
    .ops-item {
        padding: 8px 18px;
        border-radius: 5px;
        font-weight: 700;
        font-size: 16px;
        line-height: 24px;
        margin-right: 10px;
        cursor: pointer;
        .address {
            margin-left: 4px;
            font-weight: 700;
            font-size: 16px;
            line-height: 24px;
        }
    }
}
.app {
    .header-ops {
        height: 40px;
    }
}
.app-mobile {
    .header-ops {
        margin-top: 19px;
        .ops-item {
            width: 100%;
            margin-bottom: 30px;
        }
    }
}
</style>
