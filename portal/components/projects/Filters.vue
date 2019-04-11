<template lang="pug">
    .filters
        .filters__item
            span.filters__label Project ID
            input.filters__filter(type="text" @input="(e) => setFilter(e, 'projectIdFilter')")
        .filters__item
            span.filters__label Project Name
            input.filters__filter(type="text" @input="(e) => setFilter(e, 'projectNameFilter')")
        .filters__item(v-click-outside="(e) => closePickers(e, 'isRequestOnFilter')")
            span.filters__label Request On
            input.filters__filter(type="text" readonly :value="formatDateFilter('requestFilter')")
            img.filters__icon(src="../../assets/images/calendar.png" @click="(e) => togglePickers(e, 'isRequestOnFilter')")
            QuotesCalendarDetailed(v-if="isRequestOnFilter" 
                :datesFilter="requestFilter"
                @close="(e) => closePickers(e, 'isRequestOnFilter')"
                @setDate="(e) => setDateFilter(e, 'requestFilter')"
                @fromAny="(e) => setFromAnyFilter(e, 'requestFilter')"
                @toAny="(e) => setToAnyFilter(e, 'requestFilter')"
            )
        .filters__item
            span.filters__label Source Langs
            .filters__drop-menu
                SelectSingle(:options="sourceLangs" :selectedOption="sourceFilter" @chooseOption="(e) => setLangFilter(e, 'source')" customClass="filters_height-30" :isSearch="true")
        .filters__item
            span.filters__label Target Langs
            .filters__drop-menu
                SelectSingle(:options="targetLangs" :selectedOption="targetFilter" @chooseOption="(e) => setLangFilter(e, 'target')" customClass="filters_height-30" :isSearch="true")
        .filters__item(v-click-outside="(e) => closePickers(e, 'isDeadlineFilter')")
            span.filters__label Deadline
            input.filters__filter(type="text" readonly :value="formatDateFilter('deadlineFilter')")
            img.filters__icon(src="../../assets/images/calendar.png" @click="(e) => togglePickers(e, 'isDeadlineFilter')")
            QuotesCalendarDetailed(v-if="isDeadlineFilter"
                :datesFilter="deadlineFilter"
                @close="(e) => closePickers(e, 'isDeadlineFilter')"
                @setDate="(e) => setDateFilter(e, 'deadlineFilter')"
                @fromAny="(e) => setFromAnyFilter(e, 'deadlineFilter')"
                @toAny="(e) => setToAnyFilter(e, 'deadlineFilter')"
            )
</template>

<script>
import ClickOutside from "vue-click-outside";
import moment from 'moment';
import { mapGetters } from "vuex";
import SelectSingle from "../dropdowns/SelectSingle";
import QuotesCalendarDetailed from "../quotes/QuotesCalendarDetailed";

export default {
    props: {
        sourceFilter: {type: String},
        targetFilter: {type: String},
        requestFilter: {type: Object},
        deadlineFilter: {type: Object}
    },
    data() {
        return {
            isRequestOnFilter: false,
            isDeadlineFilter: false
        }
    },
    methods: {
        setFilter(e, filter) {
            this.$emit('setFilter', { filter, value: e.target.value.toLowerCase() });
        },
        setLangFilter({option}, prop) {
            const lang = this.combinations.find(item => item[prop].lang === option);
            const filter = prop === 'source' ? 'sourceFilter' : 'targetFilter';
            this.$emit("setLangFilter", {value: lang[prop].symbol, filter})
        },
        setDateFilter({date, prop}, filter) {
            this.$emit('setDateFilter', {filter, prop , date})
        },
        setFromAnyFilter({ from }, filter) {
            this.$emit('setFromAnyFilter', { filter, from })
        },
        setToAnyFilter({ to }, filter) {
            this.$emit('setToAnyFilter', { filter, to })
        },
        togglePickers(e, prop) {
            this[prop] = !this[prop];
        },
        closePickers(e, prop) {
            this[prop] = false;
        },
        closeRequestPicker() {

        },
        formatDateFilter(prop) {
            const from = this[prop].from ? moment(this[prop].from).format("DD-MM-YYYY") : "";
            const to = this[prop].to ? moment(this[prop].to).format("DD-MM-YYYY") : "";
            return `${from} / ${to}`;
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
        SelectSingle,
        QuotesCalendarDetailed
    },
    directives: {
        ClickOutside
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
        position: relative;
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
    &__icon {
        position: absolute;
        width: 22px;
        right: 5px;
        cursor: pointer;
    }
}

</style>
