<template lang="pug">
.password
    .password__item
        .password__title New Password
        input.password__input(type="password" :value="newPassword.password" @input="setPassword" ref="pass")
        .password__hint Change your password
        .password__show-text(v-if="newPassword.password")
            input.password__check(type="checkBox" @change="(e) => togglePassType(e, 'pass')")
            .password__title.password_opacity-07 Show text
    .password__item
        .password__title Confirm Password
        input.password__input(type="password" :value="newPassword.confirmedPassword" @input="setConfirmedPassword" ref="confirmedPass")
        .password__show-text(v-if="newPassword.confirmedPassword")
            input.password__check(type="checkBox" @change="(e) => togglePassType(e, 'confirmedPass')")
            .password__title.password_opacity-07 Show text
</template>

<script>
import { mapGetters } from "vuex";

export default {
    methods: {
        setPassword(e) {
            this.$store.dispatch("setNewPassword", e.target.value);
        },
        setConfirmedPassword(e) {
            this.$store.dispatch("setConfirmedPassword", e.target.value);
        },
        togglePassType(e, ref) {
            if(e.target.checked) {
                return this.$refs[ref].type = "text";
            }
            return this.$refs[ref].type = "password";
        }
    },
    computed: {
        ...mapGetters({
            vendor: "getVendor",
            newPassword: "getNewPassword"
        })
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.password {
    display: flex;
    justify-content: space-around;
    width: 1040px;
    box-shadow: 0 0 15px $brown-shadow;
    margin: 0 0 40px 10px;
    padding: 40px 20px;
    box-sizing: border-box;
    &__title, &__hint {
        font-size: 14px;
    }
    &__item {
        position: relative;
        width: 30%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    &__hint {
        position: absolute;
        top: 50px;
        width: 100%;
        opacity: 0.5;
        text-align: center;
    }
    &__input {
        outline: none;
        box-sizing: border-box;
        width: 191px;
        height: 28px;
        border: 1px solid $main-color;
        border-radius: 5px;
        padding: 0 5px;
    }
    &__show-text {
        position: absolute;
        top: 50%;
        right: -50px;
        display: flex;
    }
    &__check {
        margin-right: 5px;
    }
    &_opacity-07 {
        opacity: 0.7;
    }
}

</style>
