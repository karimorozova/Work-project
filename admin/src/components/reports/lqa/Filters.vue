<template lang="pug">
    .lqa-filters
        .lqa-filters__item
            LabelVal(text="Vendor Name:" customClass="new-chart-label")
                input.lqa-filters__text(type="text" :value="nameFilter" placeholder="Vendor Name" @keyup="filterByName")
        .lqa-filters__item
            LabelVal(text="Industry:" customClass="new-chart-label")
                .lqa-filters__drop
                    SelectSingle(
                        customClass="height-32"
                        :options="industries"
                        :selectedOption="industryFilter"
                        @chooseOption="setIndustryFilter"
                    )
        .lqa-filters__item
            LabelVal(text="Target Language:" customClass="new-chart-label")
                .lqa-filters__drop
                    SelectMulti(
                        placeholder="Select"
                        :hasSearch="true"
                        customClass="height-32"
                        :options="languages"
                        :selectedOptions="targetFilter"
                        @chooseOptions="setTargetFilter"
                    )
</template>

<script>
import LabelVal from "@/components/LabelVal";
import SelectMulti from "@/components/SelectMulti";
import SelectSingle from "@/components/SelectSingle";

export default {
    props: {
        nameFilter: {type: String},
        industryFilter: {type: String},
        targetFilter: {type: Array, default: () => []},
        languages: {type: Array, default: () => []}
    },
    data() {
        return {
            typingTimer: "",
            doneTypingInterval: 800,
            industries: ["All", "Finance", "iGaming"]
        }
    },
    methods: {
        filterByName(e) {
            const { value } = e.target;
            clearTimeout(this.typingTimer);
            this.typingTimer = setTimeout(doneTyping, this.doneTypingInterval);
            const vm = this;
            function doneTyping () {
                vm.$emit("setNameFilter", { value })
            }
        },
        setTargetFilter({option}) {
            this.$emit("setTargetFilter", { lang: option });
        },
        setIndustryFilter({option}) {
            this.$emit("setIndustryFilter", { industry: option})
        }
    },
    computed: {
        selectedLangs() {
            return this.targetFilter.map(item => item.symbol);
        }
    },
    components: {
        LabelVal,
        SelectSingle,
        SelectMulti
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
