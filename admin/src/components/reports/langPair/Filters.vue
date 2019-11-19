<template lang="pug">
    .tier-filters
        .tier-filters__item
            LabelVal(text="Tier:" customClass="new-chart-label")
                .tier-filters__drop
                    SelectSingle(
                        customClass="height-32"
                        :options="tierNames"
                        :selectedOption="tierFilter"
                        @chooseOption="setTierFilter"
                    )
        .tier-filters__item
            LabelVal(text="Target Language:" customClass="new-chart-label")
                .tier-filters__drop
                    LanguagesSelect(
                        :addAll="true"
                        :selectedLangs="selectedLangs"
                        @chosenLang="setTargetFilter"
                    )
</template>

<script>
import LabelVal from "@/components/LabelVal";
import LanguagesSelect from "@/components/LanguagesSelect";
import SelectSingle from "@/components/SelectSingle";

export default {
    data() {
        return {
            targetFilter: [{symbol: "All"}],
            tierFilter: "All",
            tiers: {'Tier 1': 1, 'Tier 2': 2, 'Tier 3': 3}
        }
    },
    methods: {
        setTierFilter({option}) {
            this.tierFilter = option;
            this.$emit('setTierFilter', {tier: this.tiers[option]});
        },
        setTargetFilter({lang}) {
            if(lang.symbol !== 'All') {
                this.targetFilter = this.targetFilter.filter(item => item.symbol !== 'All');
                const position = this.selectedLangs.indexOf(lang.symbol);
                if(position === -1) {
                    return this.targetFilter.push(lang);
                }
                this.targetFilter.splice(position, 1);
            }
            this.targetFilter = !this.targetFilter.length || lang.symbol === 'All' ? [{symbol: "All"}] : this.targetFilter;
            this.$emit("setTargetFilter", { targets: this.selectedLangs });
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
        LanguagesSelect
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.tier-filters {
    max-width: 1030px;
    display: flex;
    align-items: center;
    &__item {
        margin-right: 40px;
    }
    &__drop {
        position: relative;
        height: 34px;
        width: 191px;
        margin-left: 5px;
    }
}

input::placeholder {
    color: $main-color;
    opacity: 0.7;
}
</style>
