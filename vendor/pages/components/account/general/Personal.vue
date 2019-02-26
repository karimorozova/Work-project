<template lang="pug">
    .personal
        .personal__item
            LabelInput(name="First Name" :value="vendor.firstName" :isReadonly="isReadonly")
        .personal__item
            LabelInput(name="Surame" :value="vendor.surname" :isReadonly="isReadonly")
        .personal__item
            LabelInput(name="Email" :value="vendor.email" :isReadonly="isReadonly")
        .personal__item
            LabelInput(name="Phone" :value="vendor.phone" :isReadonly="isReadonly")
        .personal__item
            LabelInput(name="Time Zone" :value="vendor.timezone" :isReadonly="isReadonly")
        .personal__item
            LabelInput(name="Native Language" :value="nativeLang" :isReadonly="isReadonly")
        .personal__item
            LabelInput(name="Gender" :value="vendor.gender" :isReadonly="isReadonly")
</template>

<script>
import LabelInput from "./LabelInput";
import { mapGetters } from "vuex";

export default {
    data() {
        return {
            isReadonly: true,
            isNotReadonly: false
        }
    },
    computed: {
        ...mapGetters({
            vendor: "getVendor"
        }),
        nativeLang() {
            return this.vendor.native ? this.vendor.native.lang : ""
        }
    },
    components: {
        LabelInput
    }    
}
</script>

<style lang="scss" scoped>

.personal {
    &__item {
        margin-bottom: 20px;
    }
}

</style>
