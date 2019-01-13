<template lang="pug">
    .drop-select(v-click-outside="outClick")
        .select
            template(v-if="selectedLeadsource")
                .selected
                    span {{ selectedLeadsource }}
            template(v-if="!selectedLeadsource") 
                span.selected.no-lead Options
            .arrow-button(@click="showLeadsources")
                img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseIcon: dropped}")
        .drop(v-if="dropped")
            .drop__item(v-for="(leadsource, index) in leadsources" @click="changeLeadsource(index)" :class="{chosen: leadsource == selectedLeadsource}")
                span {{ leadsource }}
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
    props: {
        selectedLeadsource: {
            type: String
        }
    },
    data() {
        return {
            leadsources: ["All", "Internet", "Website", "Advertising", "Landing Pages", "Social Media", "Friend"],
            dropped: false,
            errors: []
        }
    },
    methods: {
        showLeadsources() {
            this.dropped = !this.dropped;
        },
        outClick() {
            this.dropped = false;
        },
        changeLeadsource(index) {
            const option = this.leadsources[index] === 'All' ? "" : this.leadsources[index];
            this.$emit("chosenLeadsource", { option });
            this.outClick();
        }
    },
    directives: {
        ClickOutside
    },
    mounted () {

    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.select {
    width: 100%;
    height: 28px;
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    .selected {
        width: 82%;
        padding: 0 5px;
        font-size: 14px;
        max-height: 28px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        overflow: auto;
        position: relative;
        .industry-tooltip {
            width: 40px;
            max-height: 28px;
            display: flex;
            .toolTip {
                position: absolute;
                color: $orange;
                font-size: 12px;
                display: none;
                left: 36px;
                top: 8px;
            }
            &:hover {
                .toolTip {
                    display: inline-block;
                }
            }
        }
    }
    .no-lead {
        opacity: 0.5;
    }
    .arrow-button {
        border-left: 1px solid $main-color;
        width: 18%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        img {
            padding-right: 2px;
        }
        .reverseIcon {
            transform: rotate(180deg);
        }
    }
}
.drop-select {
    position: absolute;
    border-radius: 5px;
    border: 1px solid $main-color;
    overflow: hidden;
    width: 100%;
    .drop {
        border-top: 1px solid $main-color;
        font-size: 14px;
        width: 100%;
        max-height: 150px;
        overflow-y: overlay;
        overflow-x: hidden;
        background-color: $white;
        z-index: 6;
        &__item {
            display: flex;
            align-items: center;
            padding: 5px 0 5px 5px;
            border-bottom: .5px solid $light-brown;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.4s;
            &:last-child {
                border: none;
            }
            &:hover {
                background-color: rgba(191, 176, 157, 0.5);
            }
        }
        .chosen {
            background-color: rgba(191, 176, 157, 0.5);
        }
    }
}

</style>
