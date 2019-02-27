<template lang="pug">
.account-info
    .account-info__buttons
        Buttons(@save="checkErrors")
    .account-info__general
        .account-info__title General Information
        GeneralInfo
    .account-info__password
        Password
    .account-info__rates
        .account-info__title Rates
        Rates
    ValidationErrors(v-if="areErorrs"
        :errors="errors"
        :isAbsolute="isAbsolute"
        @closeErrors="closeErrors")
</template>

<script>
import Buttons from "../../components/account/Buttons";
import GeneralInfo from "../../components/account/GeneralInfo";
import Password from "../../components/account/Password";
import Rates from "../../components/account/Rates";
import ValidationErrors from "@/components/ValidationErrors"
import { mapActions, mapGetters } from "vuex";

export default {
    data() {
        return {
            areErorrs: false,
            errors: [],
            isAbsolute: true,
            customStyles: {left: "0"}
        }
    },
    methods: {
        ...mapActions({
            setAccountInfo: "setAccountInfo",
            saveVendorInfo: "saveVendorInfo",
            alertToggle: "alertToggle"
        }),
        closeErrors() {
            this.areErorrs = false;
        },
        checkEmail() {
            const emailValidRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            return !this.accountInfo.email || !emailValidRegex.test(this.accountInfo.email.toLowerCase());
        },
        async checkErrors() {
            this.errors = [];
            const { password, confirmedPassword } = this.newPassword;
            if(!this.accountInfo.firstName) this.errors.push("Please, enter you first name.");
            if(this.checkEmail()) this.errors.push('Please provide a valid email.');
            if(password && password !== confirmedPassword) this.errors.push("Use the same password in both fields.");
            if(this.errors.length) {
                return this.areErorrs = true;
            }
            await this.saveInfo();
        },
        async saveInfo() {
            try {
                await this.saveVendorInfo();
            } catch(err) {
                this.alertToggle({message: "Cannot save info", isShow: true, type: "error"});
            }
        }
    },
    computed: {
        ...mapGetters({
            vendor: "getVendor",
            accountInfo: "getAccountInfo",
            newPassword: "getNewPassword"
        })
    },
    components: {
        Buttons,
        GeneralInfo,
        Password,
        Rates,
        ValidationErrors
    },
    mounted() {
        this.setAccountInfo();
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.account-info {
    width: 100%;
    box-sizing: border-box;
    padding: 20px;
    color: $main-color;
    &__buttons {
        display: flex;
        justify-content: flex-end;
        width: 900px;
        margin-left: 10px;
    }
    &__title {
        font-size: 22px;
    }
    &__errors {
        width: 900px;
        position: relative;
    }
}
</style>
