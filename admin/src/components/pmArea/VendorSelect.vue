<template lang="pug">
.drop-select(v-click-outside="outClick")
    .select
        template(v-if="selectedVendor")
            span.selected {{ selectedVendor }}
        template(v-if="!selectedVendor") 
            span.selected.no-industry Select
        .arrow-button(@click="showVends")
            img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseIcon: droppedVend}")
    .drop(v-if="droppedVend")
        .drop__item(v-for="(vendor, index) in vendors" @click="changeVend(index)" :class="{chosen: selectedVendor === vendor.firstName + ' ' + vendor.surname}")
            span {{ vendor.firstName }} {{ vendor.surname }}
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
    props: {
        selectedVendor: {
            type: String
        },
        vendors: {
            type: Array
        }
    },
    data() {
        return {
            droppedVend: false,
            errors: []
        }
    },
    methods: {
        showVends() {
            this.droppedVend = !this.droppedVend;
        },
        outClick() {
            this.droppedVend = false;
        },
        changeVend(ind) {
            this.droppedVend = false;
            this.$emit('changeVend', {vendor: this.vendors[ind]})
        },
    },
    directives: {
        ClickOutside
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.select {
    border: 1px solid $main-color;
    border-radius: 5px;
    width: 100%;
    height: 28px;
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    .selected {
        border-right: 1px solid $light-brown;
        width: 82%;
        padding: 0 5px;
        font-size: 14px;
        max-height: 28px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        overflow: auto;
        position: relative;
        .steps__table & {
            padding-top: 3px;
        }
    }
    .steps__table & {
        border: none;
        border-radius: 0;
        height: 29px;
    }
    .step-vendor & {
        border: 1px solid $light-brown;
        border-radius: 5px;
    }
    .no-industry {
        opacity: 0.5;
    }
    .arrow-button {
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
        .steps__table & {
            padding-top: 3px;
        }
    }
}
.drop-select {
    position: relative;
    width: 100%;
    .drop {
        font-size: 14px;
        position: absolute;
        width: 100%;
        box-sizing: border-box;
        border: 1px solid $light-brown;
        max-height: 150px;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        background-color: $white;
        z-index: 6;
        &__item {
            display: flex;
            align-items: center;
            padding: 5px 6px;
            border-bottom: .5px solid $light-brown;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.4s;
            &:last-child {
                border: none;
            }
            &:hover {
                background-color: $active-background;
            }
        }
        .chosen {
            background-color: $active-background;
        }
    }
}

</style>
