<template lang="pug">
    .drop-select(v-click-outside="outClick")
        .select
            template(v-if="selectedStatus")
                .selected
                    span {{ selectedStatus }}
            template(v-if="!selectedStatus") 
                span.selected.no-status Options
            .arrow-button(@click="showStatuses")
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
        parentInd: {
            type: Number
        },
        isAllExist: {
            type: String
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
        showStatuses(event) {
            let elementsObj = event.composedPath();
            let tr = elementsObj.find(item => {
                if(item.localName == "tr" || (item.className && item.className.indexOf("table__body-row") !== -1)) {
                    return item;
                }
            });
            let top = 0;
            let height = 0;
            if(tr) {
                top = tr.offsetTop;
                height = tr.offsetHeight;
            }
            this.dropped = !this.dropped;
            this.$emit('scrollDrop', {drop: this.dropped, offsetTop: top, offsetHeight: height})
        },
        outClick() {
            this.dropped = false;
        },
        changeStatus(index) {
            const option = this.allStatuses[index];
            this.$emit("chosenStatus", { option, index: this.parentInd});
            this.outClick();
        }
    },
    computed: {
        allStatuses() {
            let result = this.statuses;
            if(this.isAllExist !== "no") {
                result.unshift("All");
            }
            return result;
        }
    },
    directives: {
        ClickOutside
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
    .vendors-table__drop-menu & {
        width: 100%;
        height: 30px;
    }
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
        .vendors-table__drop-menu & {
            width: 75%;
            max-height: 30px;
        }
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
        .vendors-table__drop-menu & {
            width: 25%;
        }
    }
    .inner-component & {
        width: 132px;
        border: none;
        border-radius: 0;
        box-shadow: inset 0 0 8px $brown-shadow;
        .selected {
            opacity: 1;
            padding: 2px 5px;
        }
    }
    .no-status {
        opacity: 0.5;
    }
}
.drop-select {
    width: 100%;
    position: absolute;
    border-radius: 5px;
    border: 1px solid $main-color;
    overflow: hidden;
    z-index: 6;
    box-sizing: border-box;
    .drop {
        border-top: 1px solid $light-brown;
        max-height: 150px;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        background-color: $white;
        .filters__drop-menu & {
            border-top: 1px solid $main-color;
        }
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
                background-color: $active-background;
            }
        }
        .chosen {
            background-color: $active-background;
        }
        .vendors-table__drop-menu & {
            border: 1px solid $light-brown;
        }
    }
    .inner-component & {
        height: 100%;
    }
    .vendors-table__drop-menu & {
        border: none;
        border-radius: 0;
    }
}

</style>
