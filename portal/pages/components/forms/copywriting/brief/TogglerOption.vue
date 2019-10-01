<template lang="pug">
    .toggler-option
        .main
            .main__title {{ title }}
            BigToggler(
                :isOn="isOn"
                @toggle="toggle"
            )
        .text(v-if="isOn && label" :class="{'margin-10': isTip}")
            TextInput( :label="label" :isInfo="isTip" @setInputVal="setValue" :tip="tip")
</template>

<script>
import TextInput from "./TextInput";
import BigToggler from "@/components/BigToggler";

export default {
    props: {
        title: {type: String},
        label: {type: String},
        tip: {type: String},
        isTip: {type: Boolean},
        isOn: {type: Boolean}
    },
    methods: {
        toggle() {
            this.$emit('toggle')
        },
        setValue({value}) {
            this.$emit('setValue', {value});
        }
    },
    components: {
        TextInput,
        BigToggler
    }
}
</script>

<style lang="scss" scoped>

.main {
    width: 170px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    &__title {
        font-size: 14px;
    }
}

.text {
    margin-top: 20px;
}

.margin-10 {
    margin-top: 10px;
}

</style>