<template lang="pug">
    .copywriting-design
        .main
            .main__title
                TitleInput(title="DESIGN")
            BigToggler(:isOn="isDesign" @toggle="toggle")
        .options(v-if="isDesign")
            .option(v-for="(option, index) in options")
                CheckBox(:isChecked="option.isChecked" @check="(e)=>toggleOption(e, index, true)" @uncheck="(e)=>toggleOption(e, index, false)")
                .option__name {{ option.name }}
</template>

<script>
import TitleInput from "../TitleInput";
import CheckBox from "@/components/CheckBox";
import BigToggler from "@/components/BigToggler";

export default {
    data() {
        return {
            isDesign: false,
            options: [
                {name: "Images", isChecked: true},
                {name: "Charts", isChecked: false},
                {name: "Other", isChecked: false}
            ]
        }
    },
    methods: {
        toggle() {
            this.isDesign = !this.isDesign;
            if(this.isDesign) {
                this.options[0].isChecked = true;
            }
        },
        toggleOption(e, index, val) {
            this.options[index].isChecked = val;
            if(!this.isAnyChecked()) {
                this.isDesign = false;
            }
        },
        isAnyChecked() {
            return this.options.find(item => item.isChecked);
        }
    },
    components: {
        TitleInput,
        CheckBox,
        BigToggler
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.main {
    display: flex;
    align-items: center;
    &__title {
        margin-right: 20px;
    }
}

.options {
    margin-top: 20px;
    box-sizing: border-box;
    padding-left: 12px;
    display: flex;
    justify-content: space-around;
    color: $main-color;
}

.option {
    display: flex;
    align-items: center;
    &__name {
        margin-left: 10px;
    }
}

</style>
