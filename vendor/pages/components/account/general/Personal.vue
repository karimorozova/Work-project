<template lang="pug">
    .personal
        .personal__item
            LabelInput(name="First Name" :value="accountInfo.firstName" @input="(e) => setInputValue(e, 'firstName')")
        .personal__item
            LabelInput(name="Surname" :value="accountInfo.surname" @input="(e) => setInputValue(e, 'surname')")
        .personal__item
            LabelInput(name="Email" :value="accountInfo.email" @input="(e) => setInputValue(e, 'email')")
        .personal__item
            LabelInput(name="Phone" :value="accountInfo.phone" @input="(e) => setInputValue(e, 'phone')")
        .personal__item
            LabelDrop(name="Time Zone:")
                SelectSingle(
                    :selectedOption="accountInfo.timezone"
                    :options="zones"
                    customClass="account"
                    @chooseOption="(e) => setProperty(e, 'timezone')")
        .personal__item
            LabelDrop(name="Native Language:")
                SelectSingle(
                    :selectedOption="nativeLang"
                    :options="removeEnglishLang(langs)"
                    fieldName="lang"
                    customClass="account"
                    @chooseOption="(e) => setProperty(e, 'native')")
        .personal__item
            LabelDrop(name="Gender:")
                SelectSingle(
                    :selectedOption="accountInfo.gender"
                    :options="genders"
                    customClass="account"
                    @chooseOption="(e) => setProperty(e, 'gender')")
</template>

<script>
import LabelInput from "./LabelInput";
import LabelDrop from "./LabelDrop";
import SelectSingle from "../../../../components/overall/SelectSingle";
import { mapGetters, mapActions } from "vuex";
import removeLang from "../../../../mixins/removeLang";

export default {
  mixins: [removeLang],
    data() {
        return {
            isReadonly: true,
            isNotReadonly: false,
            genders: ["Male", "Female"]
        }
    },
    methods: {
        ...mapActions({
            getAllTimezones: "getAllTimezones",
            // getAllLanguages: "getAllLanguages",
            setAccountProp: "setAccountProp"
        }),
        setInputValue({value}, prop) {
            this.setAccountProp({prop, value});
        },
        setProperty({option}, prop) {
            this.setAccountProp({ prop, value: option});
        }
    },
    computed: {
        ...mapGetters({
            vendor: "getVendor",
            accountInfo: "getAccountInfo",
            timezones: "getTimezones",
            allLanguages: "getLangs"
        }),
        nativeLang() {
            return this.accountInfo.native ? this.accountInfo.native.lang : ""
        },
        zones() {
            return this.timezones.map(item => item.zone);
        },
        langs() {
            return this.allLanguages;
        }
    },
    components: {
        LabelInput,
        LabelDrop,
        SelectSingle
    },
    mounted() {
        this.getAllTimezones();
        // this.getAllLanguages();
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
