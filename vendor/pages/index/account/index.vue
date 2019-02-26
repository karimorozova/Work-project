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
    ValidationErrors(v-if="areErorrs" 
        :errors="errors" 
        :isAbsolute="isAbsolute" 
        @closeErrors="closeErrors")
</template>

<script>
import Buttons from "../../components/account/Buttons";
import GeneralInfo from "../../components/account/GeneralInfo";
import Password from "../../components/account/Password";
import ValidationErrors from "~/components/Table/ValidationErrors"
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
            saveVendorInfo: "saveVendorInfo",
            alertToggle: "alertToggle"
        }),
        closeErrors() {
            this.areErorrs = false;
        },
        async checkErrors() {
            this.errors = [];
            const { password, confirmedPassword } = this.newPassword;
            if(password && password !== confirmedPassword) this.errors.push("Use the same password in both fields");
            if(this.errors.length) {
                return this.areErorrs = true;
            }
            await this.saveInfo();
        },
        async saveInfo() {
            const { password } = this.newPassword;
            try {
                await this.saveVendorInfo({ id: this.vendor._id, password});
            } catch(err) {
                this.alertToggle({message: "Cannot save info", isShow: true, type: "error"});
            }
        }
    },
    computed: {
        ...mapGetters({
            vendor: "getVendor",
            newPassword: "getNewPassword"
        })
    },
    components: {
        Buttons,
        GeneralInfo,
        Password,
        ValidationErrors
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
        font-size: 24px;
    }
    &__errors {
        width: 900px;
        position: relative;
    }
}
</style>
