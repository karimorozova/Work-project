<template lang="pug">
.step-info
    .step-info__vendor-block
        Vendor(
            :vendors="vendors"
            :vendor="step.vendor"
        )
</template>

<script>
import Vendor from "./stepinfo/Vendor";

export default {
    props: {
        vendors: {
            type: Array
        },
        step: {
            type: Object
        }
    },
    data() {
        return {

        }
    },
    methods: {

    },
    components: {
        Vendor
    }
}
</script>

<style lang="scss" scoped>
.step-info {
    padding: 25px;
}
</style>
