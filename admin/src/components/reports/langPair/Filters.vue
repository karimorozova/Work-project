<template lang="pug">
    .tier-filters
        .tier-filters__item
            LabelVal(text="Tier:" customClass="new-chart-label")
                .tier-filters__drop
                    SelectSingle(
                        customClass="height-32"
                        :options="tierNames"
                        :selectedOption="selectedTier"
                        @chooseOption="setTierFilter"
                    )
        .tier-filters__item
            LabelVal(text="Target Language:" customClass="new-chart-label")
                .tier-filters__drop
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
import SelectSingle from "@/components/SelectSingle";
import SelectMulti from "@/components/SelectMulti";
import { mapActions } from "vuex";

export default {
    props: {
        targetFilter: {type: Array, default: () => []},
        languages: {type: Array, default: () => []}
    },
    data() {
        return {
            tiers: {'All': 'All', 'Tier 1': '1', 'Tier 2': '2', 'Tier 3': '3'},
            selectedTier: "All",
        }
    },
    methods: {
        ...mapActions(['alertToggle']),
        setTierFilter({option}) {
            this.selectedTier = option;
            this.$emit('setTierFilter', {filter: this.tiers[option]});
        },
        setTargetFilter({option}) {
            this.$emit("setTargetFilter", { lang: option });
        },
    },
    computed: {
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
