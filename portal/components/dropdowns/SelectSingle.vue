<template lang="pug">
    .drop-select(v-click-outside="outOptions" :class="[{'z-index': isDropped}, customClass]")
        .select(@click="toggleOptions")
            span.selected(v-if="selectedOption") {{ selectedOption }}
            span.selected.no-choice(v-if="!selectedOption") Select
            .arrow-button
                img(src="../../assets/images/arrow_open.png" :class="{'reverse-icon': isDropped}")
        .drop(v-if="isDropped")
            .drop__item(v-for="(option, index) in options" @click="chooseOption(index)" :class="{active: activeClass(option)}")
                span {{ option }}
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
    props: {
        selectedOption: {
            type: String
        },
        options: {
            type: Array
        },
        customClass: {
            type: String
        }
    },
    data() {
        return {
            isDropped: false
        }
    },
    methods: {
        outOptions() {
            this.isDropped = false;
        },
        toggleOptions() {
            this.isDropped = !this.isDropped;
        },
        chooseOption(index) {
            this.$emit("chooseOption", {option: this.options[index]});
            this.outOptions();
        },
        activeClass(elem) {
            if(this.selectedOption == elem && elem != "Yes") return true;
            if(elem == "Yes" && this.selectedOption && 
            this.options.indexOf(this.selectedOption) === -1) return true;
            return false;
        }
    },
    directives: {
        ClickOutside
    },
}
</script>

<style lang="scss" scoped>

.select-comp {
    width: 100%;
    &__label {
        font-size: 12px;
    }
}

.drop-select {
    position: absolute;
    width: 100%;
    border: 1px solid #938676;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    .drop {
        width: 100%;
        max-height: 100px;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        background-color: white;
        border-top: 1px solid #938676;
        z-index: 6;
        &__item {
            align-items: center;
            padding: 5px;
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
        .active {
            background-color: rgba(102, 86, 61, 0.7);
            color: #FFF;
        }
        .test-options & {
            max-height: 60px;
        }
    }
}

.z-index {
    z-index: 1;
}

.select {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    cursor: pointer;
    .selected {
        width: 80%;
        height: 100%;
        padding: 0 5px;
        font-size: 14px;
        max-height: 40px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        overflow: auto;
        position: relative;
        border-right: 1px solid #938676;
        box-sizing: border-box;
    }
    .no-choice {
        opacity: 0.5;
    }
    .arrow-button {
        width: 20%;
        display: flex;
        justify-content: center;
        align-items: center;
        img {
            padding-right: 2px;
        }
        .reverse-icon {
            transform: rotate(180deg);
        }
    }
}

.filters_height-30 {
    .select {
        height: 30px;
    }
}

</style>
