<template lang="pug">
.drop-select(v-click-outside="outClick")
    .select
        template(v-if="selectedVendors.length && selectedVendors[0].name != 'All'")
            .selected
                .industry-tooltip(v-for="item in selectedVendors")
                    span {{ item.firstName }}; 
        template(v-if="!selectedVendors.length || selectedVendors[0].name == 'All' ") 
            span.selected.no-industry Options
        .arrow-button(@click="showVends")
            img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseIcon: droppedVend}")
    .drop(v-if="droppedVend")
        .drop__item(v-for="(vendor, index) in vendors" @click="changeVend(index)")
            .checkbox
                .checkbox__check(:class="{checked: filteredVendors.indexOf(vendor._id) != -1}")
            span {{ vendor.firstName }} {{ vendor.surname }}
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
    props: {
        selectedVendors: {
            type: Array
        },
        filteredVendors: {
            type: Array
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
            this.$emit('changeVend', {vendor: this.vendors[ind]})
        },
    },
    mounted() {
    },
    directives: {
        ClickOutside
    }
}
</script>

<style lang="scss" scoped>

.select {
    border: 1px solid #67573E;
    border-radius: 5px;
    width: 100%;
    height: 28px;
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    .selected {
        border-right: 1px solid #BFB09D;
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
                color: #D15F45;
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
    .no-industry {
        opacity: 0.5;
    }
    .arrow-button {
        width: 18%;
        display: flex;
        justify-content: center;
        align-items: center;
        img {
            padding-right: 2px;
        }
        .reverseIcon {
            transform: rotate(180deg);
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
        border: 1px solid #BFB09D;
        max-height: 150px;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        background-color: white;
        z-index: 6;
        &__item {
            display: flex;
            align-items: center;
            padding: 5px 2px;
            border-bottom: .5px solid #BFB09D;
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
.checkbox {
    width: 13px;
    height: 13px;
    border: 1px solid #67573E;
    margin-right: 3px;
    .checked {
        width: 100%;
        height: 100%;
        position: relative;
        &::before {
            content: '';
            position: absolute;
            width: 5px;
            border: 1px solid #67573E;
            top: 6px;
            left: 1px;
            transform: rotate(45deg);
        }
        &::after {
            content: '';
            position: absolute;
            width: 6px;
            border: 1px solid #67573E;
            top: 5px;
            left: 3px;
            transform: rotate(-58deg);
        }
    }
}

</style>
