<template lang="pug">
    .filters
        .filters__item
            span.filters__label Project ID
            input.filters__filter(type="text" @input="(e) => setFilter(e, 'projectId')")
        .filters__item
            span.filters__label Project Name
            input.filters__filter(type="text" @input="(e) => setFilter(e, 'projectName')")
        .filters__item
            span.filters__label Request On
            input.filters__filter(type="text")
        .filters__item
            span.filters__label Source Langs
            .filters__drop-menu
                SelectSingle(:options="sourceLangs" :selectedOption="sourceFilter" @chooseOption="(e) => setLangFilter(e, 'source')" customClass="filters_height-30")
        .filters__item
            span.filters__label Target Langs
            .filters__drop-menu
                SelectSingle(:options="targetLangs" :selectedOption="targetFilter" @chooseOption="(e) => setLangFilter(e, 'target')" customClass="filters_height-30")
        .filters__item
            span.filters__label Deadline
            input.filters__filter(type="text")
</template>

<script>
import { mapGetters } from "vuex";
import SelectSingle from "../dropdowns/SelectSingle";

export default {
    props: {
        sourceFilter: {type: String},
        targetFilter: {type: String}
    },
    methods: {
        setFilter(e, filter) {
            this.$emit('setFilter', { filter });
        },
        setLangFilter({option}, prop) {
            const lang = this.combinations.find(item => item[prop].lang === option);
            const filter = prop === 'source' ? 'sourceFilter' : 'targetFilter';
            this.$emit("setLangFilter", {value: lang[prop].symbol, filter})
        }
    },
    computed: {
        ...mapGetters({
            combinations: "getCombinations"
        }),
        sourceLangs() {
            return this.combinations.map(item => item.source.lang).filter((item, index,arr) => {
                return arr.indexOf(item) === index
            })
        },
        targetLangs() {
            return this.combinations.map(item => item.target.lang).filter((item, index,arr) => {
                return arr.indexOf(item) === index
            })
        }
    },
    components: {
        SelectSingle
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.filters {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    justify-content: space-between;
    &__item {
        width: 31%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }
    &__filter {
        box-sizing: border-box;
        height: 30px;
        padding: 0 5px;
        border: 1px solid $cell-border;
        outline: none;
        width: 65%;
    }
    &__drop-menu {
        position: relative;
        height: 30px;
        width: 65%;
    }
}

</style>
