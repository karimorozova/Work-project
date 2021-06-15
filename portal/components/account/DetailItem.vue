<template lang="pug">
    .detail-item
        .label {{ label }}
        input.text(v-if="!isPassword" type="text" :value="value" :class="{bordered: isBorder, short: isShort}" @change="setValue" @focus="isInvalid = false")
        input.text(v-else type="password" :value="value" :class="{bordered: isBorder}" placeholder="************" @change="setPassword")
</template>

<script>
export default {
    props: {
        label: {type: String},
        isPassword: {type: Boolean, default: false},
        value: {type: String},
        isBorder: {type: Boolean, default: false},
        isShort: {type: Boolean, default: false}
    },
    methods: {
        setPassword(e) {
            this.$emit("setPassword", {value: e.target.value})
        },
        setValue(e) {
            const { value } = e.target;
            this.$emit("setValue", { value });
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.detail-item {
    margin-bottom: 40px;
    position: relative;
}

.label {
    font-size: 12px;
    margin-bottom: 10px;
}

.text {
    padding: 10px 5px;
    box-sizing: border-box;
    color: $main-color;
    border-radius: 4px;
    border: none;
    outline: none;
    width: 270px;
}

.error {
    color: $red;
    position: absolute;
    bottom: -20px;
    font-size: 14px;
    left: 10px;
}

.bordered {
    border: 2px solid $light-brown;
}

.short {
    width: 130px;
}

</style>
