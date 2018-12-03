<template lang="pug">
    .drop-select(v-click-outside="outClick")
        .select
            template(v-if="selectedStatus")
                .selected
                    span {{ selectedStatus }}
            template(v-if="!selectedStatus") 
                span.selected.no-industry Options
            .arrow-button(@click.stop="showStatuses")
                img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseIcon: dropped}")
        .drop(v-if="dropped")
            .drop__item(v-for="(status, index) in allStatuses" @click.stop="changeStatus(index)" :class="{chosen: status == selectedStatus}")
                span {{ status }}
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
    props: {
        selectedStatus: {
            type: String
        },
        isAllExist: {
            type: Boolean
        }
    },
    data() {
        return {
            statuses: ["Active", "Inactive", "Potential"],
            dropped: false,
            errors: []
        }
    },
    methods: {
        showStatuses() {
            this.dropped = !this.dropped;
        },
        outClick() {
            this.dropped = false;
        },
        changeStatus(index) {
            const option = this.allStatuses[index] === "All" ? "": this.allStatuses[index];
            this.$emit("chosenStatus", {status: option});
            this.outClick();
        }
    },
    directives: {
        ClickOutside
    },
    computed: {
        allStatuses() {
            let result = this.statuses;
            if(this.isAllExist) {
                result.unshift("All");
            }
            return result;
        }
    }
}
</script>

<style lang="scss" scoped>
.select {
    width: 191px;
    height: 28px;
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    box-sizing: border-box;
    .clients-table__drop-menu & {
        width: 100%;
        height: 30px;
        border: none;
    }
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
        .clients-table__drop-menu & {
            width: 77%;
            max-height: 30px;
        }
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
        cursor: pointer;
        img {
            padding-right: 2px;
        }
        .reverseIcon {
            transform: rotate(180deg);
        }
        .clients-table__drop-menu & {
            width: 23%;
        }
    }
}
.drop-select {
    position: absolute;
    box-sizing: border-box;
    width: 100%;
    border: 1px solid #67573E;
    border-radius: 5px;
    z-index: 6;
    overflow: hidden;
    .drop {
        box-sizing: border-box;
        width: 100%;
        max-height: 150px;
        overflow-y: auto;
        overflow-x: hidden;
        background-color: white;
        border-top: 1px solid #BFB09D;
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
        .clients-table__drop-menu & {
            border: 1px solid #BFB09D;
        }
    }
    .clients-table__drop-menu & {
        border: none;
        z-index: 1;
    }
}

</style>
