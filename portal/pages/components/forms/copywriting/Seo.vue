<template lang="pug">
    .copywriting-seo
        .main
            .main__title
                TitleInput(title="SEO")
            BigToggler(:isOn="isSeo" @toggle="toggle")
            .main__item(v-if="isSeo")
                CheckBox(:isChecked="isMeta" @check="(e)=>toggleOption(e, true)" @uncheck="(e)=>toggleOption(e, false)")
                .main__name Include META tags
        .options(v-if="isSeo")
            .option(v-for="(item, key) in seo")
                TextInput(:label="key" customClass="row-flexed" @setInputVal="(e) => setInputVal(e, key)")

</template>

<script>
import TitleInput from "../TitleInput";
import CheckBox from "@/components/CheckBox";
import BigToggler from "@/components/BigToggler";
import TextInput from "./brief/TextInput";
import { mapActions } from "vuex";

export default {
    data() {
        return {
            isSeo: false,
            isMeta: true,
            seo: {
                "Keywords": "",
                "Keyword density": "",
                "Other": ""
            }
        }
    },
    methods: {
        ...mapActions(["setOrderDetail"]),
        toggle() {
            this.isSeo = !this.isSeo;
            this.setOrderDetail({prop: "isSeo", value: this.isSeo});
            this.setOrderDetail({prop: "isMeta", value: this.isSeo});            
        },
        toggleOption(e, val) {
            this.isMeta = val;
            this.setOrderDetail({prop: "isMeta", value: this.isMeta});            
        },
        setInputVal({ value }, key) {
            this.seo[key] = value;
            this.setOrderDetail({prop: `seo-${key}`, value});            
        }
    },
    components: {
        TitleInput,
        CheckBox,
        BigToggler,
        TextInput
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.main {
    display: flex;
    align-items: center;
    color: $main-color;
    &__title {
        margin-right: 20px;
        width: 70px;
    }
    &__item {
        display: flex;
        align-items: center;
        margin-left: 30px;
    }
    &__name {
        margin-left: 10px;
    }
}

.options {
    color: $main-color;
    margin-top: 30px;
    box-sizing: border-box;
    padding-left: 12px;
}

</style>
