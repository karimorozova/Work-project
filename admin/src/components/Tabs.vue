<template lang="pug">
.tabs
    .tabs__option(v-for="(tab, index) in tabs" @click="setTab(index)" :class="{'tabs_active': tab === selectedTab}") {{ tab }}
</template>

<script>
export default {
    props: {
        tabs: {
            type: Array
        },
        selectedTab: {
            type: String
        }
    },
    methods: {
        setTab(index) {
            this.$emit('setTab', { index });
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors.scss";

.tabs {
    display: flex;
    margin-top: 10px;
    &__option {
        padding: 5px;
        width: 10%;
        min-width: 107px;
        font-size: 14px;
        border: 1px solid $brown-border;
        border-bottom: none;
        border-top-right-radius: 10px;
        border-top-left-radius: 3px;
        background-color: $table-row-zebra-background;
        box-shadow: inset 0 0 3px $brown-shadow;
        cursor: pointer;
        opacity: 0.6;
        z-index: 0;
    }
    &_active {
        background-color: $white;
        opacity: 1;
    }
}
</style>
