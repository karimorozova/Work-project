<template lang="pug">
    .report-filters
        .report-filters__row(:class="{'report-filters_spaced': isLqa}")
            .report-filters__item.report-filters_width-300(:class="{'report-filters_right-margin-80': !isLqa}")
                LabelVal(text="Target Language:" customClass="new-chart-label")
                    .report-filters__drop
                        SelectMulti(
                            placeholder="Select"
                            :hasSearch="true"
                            customClass="height-32"
                            :options="languages"
                            :selectedOptions="targetFilter"
                            @chooseOptions="setTargetFilter"
                        )
            .report-filters__item(v-if="isLqa")
                LabelVal(text="Industry:" customClass="new-chart-label")
                    .report-filters__drop
                        SelectSingle(
                            customClass="height-32"
                            :options="industries"
                            :selectedOption="industryFilter"
                            @chooseOption="setIndustryFilter"
                        )
            .report-filters__item
                LabelVal(text="Tier:" customClass="new-chart-label")
                    .report-filters__drop
                        SelectSingle(
                            customClass="height-32"
                            :options="tierNames"
                            :selectedOption="tierFilter"
                            @chooseOption="setTierFilter"
                        )                
        .report-filters__row(v-if="isLqa")
            .report-filters__item.report-filters_width-300
                LabelVal(text="Vendor Name:" customClass="new-chart-label")
                    input.report-filters__text(type="text" :value="nameFilter" placeholder="Vendor Name" @keyup="filterByName")
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
        languages: {type: Array, default: () => []},
        tierFilter: {type: String},
        isLqa: {type: Boolean, default: true}
    },
    data() {
        return {
            typingTimer: "",
            doneTypingInterval: 800,
            industries: ["All", "Finance", "iGaming"],
            tiers: {'All': 'All', 'Tier 1': '1', 'Tier 2': '2', 'Tier 3': '3'}
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
        setTierFilter({option}) {
            this.$emit('setTierFilter', {value: this.tiers[option]});
        },
        setTargetFilter({option}) {
            this.$emit("setTargetFilter", { lang: option });
        },
        setIndustryFilter({option}) {
            this.$emit("setIndustryFilter", { value: option})
        }
    },
    computed: {
        selectedLangs() {
            return this.targetFilter.map(item => item.symbol);
        },
        tierNames() {
            return Object.keys(this.tiers);
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
@import "../../assets/scss/colors.scss";

.report-filters {
    width: 70%;
    max-width: 1030px;
    &__row {
        width: 100%;
        display: flex;
        align-items: center;
        margin-bottom: 30px;
        box-sizing: border-box;
    }
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
        margin-left: 8px;
    }
    &_spaced {
        justify-content: space-between;
    }
    &_right-margin-80 {
        margin-right: 80px; 
    }
    &_width-300 {
        width: 300px;
    }
}

input::placeholder {
    color: $main-color;
    opacity: 0.7;
}
</style>
