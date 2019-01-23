<template lang="pug">
.langs-manage
    .langs-manage__title
        span {{ title }}        
    .langs-manage__clear-all(v-if="hasCheckedAll" @click="clearChecks('all')") Clear
    span.langs-manage__all-search-value(v-model="langSearchValue" v-if="isSearching && langSearchValue") {{ langSearchValue }}
    .langs-manage__languages(v-click-outside="clearAll")
        Languages(
            tabIndex=0
            :languages="all"
            :langSearchValue="langSearchValue"
            @forceMove="(e) => forceMove(e, 'to')"
            @searching="searching"
            @searchValue="(e) => searchValue(e, 'all')"
            @slice="slice"
            @sortBySearch="(e) => sortBySearch(e, 'all')"
            @sortLangs="(e) => sortLangs(e, 'all')"
            @clearSearch="(e) => clearSearch(e, 'all')")
        Arrows(@forward="toChosen" @back="toAll")
        .langs-manage__clear-chosen(v-if="hasCheckedChosen" @click="clearChecks('chosen')") Clear
        Languages(
            tabIndex=3
            :languages="chosen" 
            @forceMove="(e) => forceMove(e, 'back')")
</template>

<script>
import Languages from "./Languages";
import Arrows from "./Arrows";
import ClickOutside from "vue-click-outside";

export default {
    props: {
        title: {
            type: String
        },
        all: {
            type: Array,
            default: () => []
        },
        chosen: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            langSearchValue: "",
            isSearching: false
        }
    },
    methods: {
        toChosen() {
            this.$emit('toChosen');
            this.clearAll();
        },
        toAll() {
            this.$emit('toAll');
            this.clearAll();
        },
        clearAll() {
            this.isSearching = false;
            this.clearSearch("", 'all');
            this.clearSearch("", 'chosen');
        },
        clearChecks(prop) {
            this[prop].forEach(item => item.check = false);
            this.langSearchValue = "";
        },
        clearSearch(e, prop) {
            this.clearChecks(prop);
            this.$emit("sortLangs", { prop });
        },
        forceMove({index}, direction) {
            if(direction === 'to') return this.$emit("forceMoveTo", { index });
            if(direction === 'back') return this.$emit("forceMoveBack", { index });
        },
        searching() {
            this.isSearching = true;
        },
        searchValue({ value }, prop) {
            this.langSearchValue += value;
            this.$emit("sortBySearch", { value: this.langSearchValue, prop });
        },
        slice() {
            this.langSearchValue = this.langSearchValue.slice(0, -1);
        },
        sortBySearch(e, prop) {
            this.$emit("sortBySearch", { value: this.langSearchValue, prop });
        },
        sortLangs(e, prop) {
            this.$emit("sortLangs", { prop });
        }
    },
    computed: {
        hasCheckedAll() {
            return this.all.find(item => item.check);
        },
        hasCheckedChosen() {
            return this.chosen.find(item => item.check);
        }
    },
    components: {
        Languages,
        Arrows
    },
    directives: {
        ClickOutside
    }
}
</script>

<style lang="scss" scoped>

.langs-manage {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30px;
    position: relative;
    &__languages {
        width: 78%;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    &__clear-all, &__clear-chosen {
        position: absolute;
        top: -5px;
        cursor: pointer;
        padding: 1px 5px;
        border: 1px solid #67573E;
        border-radius: 8px;
        transition: all 0.2s;
        &:hover {
            background-color: #67573E;
            color: #FFF;
        }
    }
    &__clear-all {
        left: 105px;
    }
    &__clear-chosen {
        right: 200px;
    }
    &__all-search-value {
        position: absolute;
        top: -17px;
        left: 55%;
        background: #FFF;
        z-index: 20;
    }
}
    
</style>
