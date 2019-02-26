<template lang="pug">
    .other-info
        .other-info__item
            LabelInput(name="Company Name" :value="vendor.companyName" :isReadonly="isReadonly")
        .other-info__item
            LabelInput(name="Website" :value="vendor.website" :isReadonly="isReadonly")
        .other-info__item
            LabelInput(name="Skype" :value="vendor.skype" :isReadonly="isReadonly")
        .other-info__item
            LabelInput(name="Linkedin" :value="vendor.linkedin" :isReadonly="isReadonly")
        .other-info__item
            LabelInput(name="WhatsApp" :value="vendor.whatsapp" :isReadonly="isReadonly")
        .other-info__item
            LabelInput(name="Status" :value="vendor.status" :isReadonly="isReadonly")
        .other-info__drop
            .other-info__name Idustries
            .other-info__list
                MultiVendorIndustrySelect(:selectedInd="vendorIndustries" :filteredIndustries="industriesNames")
</template>

<script>
import LabelInput from "./LabelInput";
import MultiVendorIndustrySelect from "~/components/dropdowns/MultiVendorIndustrySelect";
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
        },
        vendorIndustries() {
            return this.vendor.industries ? this.vendor.industries : [];
        },
        industriesNames() {
            let result= [];
            if(this.vendor.industries) {
                result = this.vendor.industries.map(item => item.name)
            }
            return result;
        }
    },
    components: {
        LabelInput,
        MultiVendorIndustrySelect
    }    
}
</script>

<style lang="scss" scoped>

.other-info {
    &__item {
        margin-bottom: 20px;
    }
    &__drop {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    &__name {
        font-size: 14px;
    }
    &__list {
        position: relative;
        width: 191px;
        height: 28px;;
    }
}

</style>
