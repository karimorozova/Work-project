<template lang="pug">
    .copywriting-style
        TitleInput(title="STYLE")
        .options
            .option(v-for="(option, index) in options")
                CustomRadio(:isChecked="option.isChecked" @toggleRadio="toggle(index)")
                .option__name {{ option.name }}
                img.option__flag(:src="option.icon")
</template>

<script>
import TitleInput from "../TitleInput";
import CustomRadio from "@/components/CustomRadio";

export default {
    data() {
        return {
            options: [
                {name: "US", icon: require("../../../../assets/images/US-icon.png"), isChecked: true},
                {name: "UK", icon: require("../../../../assets/images/UK-icon.png"), isChecked: false}
            ]
        }
    },
    methods: {
        toggle(index) {
            this.options = this.options.map((item,ind) => {
                item.isChecked = ind === index;
                return item;
            })
        }
    },
    components: {
        TitleInput,
        CustomRadio
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.options {
    box-sizing: border-box;
    padding-left: 12px;
    margin-top: 20px;
    display: flex;
    justify-content: space-around;
    align-items: center;
}

.option {
    color: $main-color;
    display: flex;
    flex-direction: column;
    align-items: center;
    &__name {
        margin-top: 10px;
    }
}

</style>
