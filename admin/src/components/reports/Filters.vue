<template lang="pug">
    .report-filters
        .report-filters__row(:class="{'report-filters_no-space': !isLqa}")
            .report-filters__item.report-filters_width-300(v-if="isTarget" :class="{'report-filters_right-margin-80': !isLqa}")
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
            .report-filters__item(v-if="isLqa" :class="{'report-filters_width-280': !isTarget}")
                LabelVal(text="Industry:" customClass="new-chart-label")
                    .report-filters__drop
                        SelectSingle(
                            customClass="height-32"
                            :options="industries"
                            :selectedOption="industryFilter"
                            @chooseOption="setIndustryFilter"
                        )
            .report-filters__item(v-if="!isTarget")
                LabelVal(text="LQA:" customClass="new-chart-label")
                    .report-filters__drop
                        SelectSingle(
                            customClass="height-32"
                            :options="lqas"
                            :selectedOption="lqaFilter"
                            @chooseOption="setLqaFilter"
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
            .report-filters__item.report-filters_width-300(:class="{'report-filters_width-280': !isTarget}")
                LabelVal(text="Vendor Name:" customClass="new-chart-label")
                    input.report-filters__text(type="text" :value="nameFilter" placeholder="Vendor Name" @keyup="filterByName")
            //- .report-filters__item(v-if="isAddVendor")
            //-     Button(value="Add new XTRF Vendor" customClass="width-191" @clicked="showForm")
</template>

<script>
import LabelVal from "@/components/LabelVal";
import SelectMulti from "@/components/SelectMulti";
import SelectSingle from "@/components/SelectSingle";
import Button from "@/components/Button";

export default {
    props: {
        nameFilter: {type: String},
        industryFilter: {type: String},
        targetFilter: {type: Array, default: () => []},
        languages: {type: Array, default: () => []},
        tierFilter: {type: String},
        lqaFilter: {type: String},
        isLqa: {type: Boolean, default: true},
        isTarget: {type: Boolean, default: true},
        isAddVendor: {type: Boolean, default: true}
    },
    data() {
        return {
            typingTimer: "",
            doneTypingInterval: 800,
            industries: ["All", "Finance", "iGaming", "Other"],
            tiers: {"All": "All", "Tier 1": "1", "Tier 2": "2", "Tier 3": "3"},
            lqas: ["All", "1", "2", "3"]
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
        setLqaFilter({option}) {
            this.$emit('setLqaFilter', {value: option});
        },
        setTargetFilter({option}) {
            this.$emit("setTargetFilter", { lang: option });
        },
        setIndustryFilter({option}) {
            this.$emit("setIndustryFilter", { value: option})
        },
        showForm() {
            this.$emit("showNewVendorForm");
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
        SelectMulti,
        Button
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.report-filters {
    //width: 70%;
    //max-width: 1030px;
    &__row {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        box-sizing: border-box;
    }
    &__text {
        box-sizing: border-box;
        color: $main-color;
        width: 220px;
        height: 32px;
        padding: 0 5px;
        outline: none;
        border: 1px solid $border;
        border-radius: 2px;
        margin-left: 5px;
    }
    &__drop {
        position: relative;
        height: 32px;
        width: 220px;
        margin-left: 8px;
    }
    &_no-space {
        justify-content: flex-start;
    }
    &_right-margin-80 {
        margin-right: 80px;
    }
    &_width-300 {
        width: 300px;
    }
    &_width-280 {
        width: 280px;
    }
}

input::placeholder {
    color: $main-color;
    opacity: 0.7;
}
</style>
