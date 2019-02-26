<template lang="pug">
    .other-info
        .other-info__item
            LabelInput(name="Company Name" :value="accountInfo.companyName" @input="(e) => setInputValue(e, 'companyName')")
        .other-info__item
            LabelInput(name="Website" :value="accountInfo.website" @input="(e) => setInputValue(e, 'website')")
        .other-info__item
            LabelInput(name="Skype" :value="accountInfo.skype" @input="(e) => setInputValue(e, 'skype')")
        .other-info__item
            LabelInput(name="Linkedin" :value="accountInfo.linkedin" @input="(e) => setInputValue(e, 'linkedin')")
        .other-info__item
            LabelInput(name="WhatsApp" :value="accountInfo.whatsapp" @input="(e) => setInputValue(e, 'whatsapp')")
        .other-info__item
            LabelInput(name="Status" :value="accountInfo.status"  :isReadonly="isReadonly")
        .other-info__item
            LabelDrop(name="Industries")
                MultiVendorIndustrySelect(:selectedInd="vendorIndustries" :filteredIndustries="industriesNames" @chosenInd="setIndutries")
</template>

<script>
import LabelInput from "./LabelInput";
import LabelDrop from "./LabelDrop";
import MultiVendorIndustrySelect from "~/components/dropdowns/MultiVendorIndustrySelect";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            isReadonly: true,
            isNotReadonly: false
        }
    },
    methods: {
        ...mapActions({
            setAccountProp: "setAccountProp"
        }),
        setInputValue({value}, prop) {
            this.setAccountProp({prop, value});
        },
        setIndutries({industry}) {
            let industries = [...this.accountInfo.industries];
            const position = this.industriesNames.indexOf(industry.name);
            if(position !== -1) {
                industries.splice(position, 1);
            } else {
                industries.push(industry);
            }
            this.setAccountProp({prop: "industries", value: [...industries]});
        }
    },
    computed: {
        ...mapGetters({
            accountInfo: "getAccountInfo"
        }),
        vendorIndustries() {
            return this.accountInfo.industries ? this.accountInfo.industries : [];
        },
        industriesNames() {
            let result= [];
            if(this.accountInfo.industries) {
                result = this.accountInfo.industries.map(item => item.name)
            }
            return result;
        }
    },
    components: {
        LabelInput,
        LabelDrop,
        MultiVendorIndustrySelect
    }    
}
</script>

<style lang="scss" scoped>

.other-info {
    &__item {
        margin-bottom: 20px;
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
