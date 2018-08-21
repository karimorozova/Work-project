<template lang="pug">
    .dropSelect(v-click-outside="outClick")
        .select
            template(v-if="selectedStatus")
                .selected
                    span {{ selectedStatus }}
            template(v-if="!selectedStatus") 
                span.selected.no-status Options
            .arrowButton(@click="showStatuses")
                img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseIcon: dropped}")
        .drop(v-if="dropped")
            .drop__item(v-for="(status, index) in statuses" @click="changeStatus(index)" :class="{chosen: status == selectedStatus}")
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
            this.$emit("chosenStatus", {status: this.statuses[index], index: this.parentInd})
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
.select {
    border: 1px solid #67573E;
    border-radius: 5px;
    width: 191px;
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
    }
    .arrowButton {
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
    .innerComponent & {
        max-height: 24px;
        width: 132px;
        border: none;
        border-radius: 0;
        box-shadow: inset 0 0 8px rgba(191, 176, 157, 1);
        .selected {
            opacity: 1;
            padding: 2px 5px;
        }
    }
    .no-status {
        opacity: 0.5;
    }
}
.dropSelect {
    position: relative;
    .drop {
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
    .innerComponent & {
        height: 100%;
    }
}

</style>
