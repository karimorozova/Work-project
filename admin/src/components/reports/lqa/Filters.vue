<template lang="pug">
    .lqa-filters
        .lqa-filters__item
            LabelVal(text="Vendor Name:" customClass="new-chart-label")
                input.lqa-filters__text(type="text" :value="nameFilter" placeholder="Vendor Name")
        .lqa-filters__item
            LabelVal(text="Industry:" customClass="new-chart-label")
                .lqa-filters__drop
                    IndustrySelect
        .lqa-filters__item
            LabelVal(text="Target Language:" customClass="new-chart-label")
                .lqa-filters__drop
                    LanguagesSelect(
                        :addAll="true"
                    )
</template>

<script>
import LabelVal from "@/components/LabelVal";
import LanguagesSelect from "@/components/LanguagesSelect";
import IndustrySelect from "@/components/IndustrySelect";

export default {
    props: {
        nameFilter: {type: String},
        industryFilter: {type: String},
        targetFilter: {type: String}
    },
    components: {
        LabelVal,
        IndustrySelect,
        LanguagesSelect
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.lqa-filters {
    width: 70%;
    max-width: 1030px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    &__text {
        box-sizing: border-box;
        color: $main-color;
        width: 191px;
        height: 32px;
        padding: 0 5px;
        outline: none;
        border: 1px solid $main-color;
        border-radius: 5px;
        margin-left: 5px;
    }
    &__drop {
        position: relative;
        height: 32px;
        width: 191px;
        margin-left: 5px;
    }
}

input::placeholder {
    color: $main-color;
    opacity: 0.7;
}
</style>
