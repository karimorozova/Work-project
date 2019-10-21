<template lang="pug">
    .drop-select(v-click-outside="outOptions" :class="{'z-index': isDropped}")
        .select
            span.selected(v-if="selectedOption") {{ selectedOption }}
            span.selected.no-choice(v-if="!selectedOption") Select
            .arrow-button(@click="toggleOptions")
                img(src="../../../assets/images/arrow_open.png" :class="{'reverse-icon': isDropped}")
        .drop(v-if="isDropped")
            .drop__item(v-for="(option, index) in options" @click="chooseOption(index)" :class="{active: selectedOption == option}")
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
        activeObject: {
            type: Object
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
            this.$emit("toggleDropMenu", {isDropped: this.isDropped});
        },
        toggleOptions() {
            this.isDropped = !this.isDropped;
            this.$emit("toggleDropMenu", {isDropped: this.isDropped});
        },
        chooseOption(index) {
            this.$emit("chooseOption", {option: this.options[index], activeObject: this.activeObject});
            this.outOptions();
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
    top: 0;
    left: 0;
    width: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .drop {
        box-sizing: border-box;
        max-height: 100px;
        overflow-y: auto;
        overflow-x: hidden;
        flex-direction: column;
        background-color: white;
        border: 1px solid #67573E;
        border-top: none;
        z-index: 6;
        &__item {
            align-items: center;
            padding: 3px;
            border-bottom: .5px solid #BFB09D;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.4s;
            &:first-child {
                border-top: .5px solid #BFB09D;
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
    border-radius: 15px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    height: 26px;
    .selected {
        width: 77%;
        padding: 3px 5px;
        border-right: 0.5px solid #67573E;
        font-size: 14px;
        max-height: 40px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        overflow: auto;
        position: relative;
    }
    .no-choice {
        opacity: 0.5;
    }
    .arrow-button {
        width: 23%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        img {
            padding-right: 2px;
        }
        .reverse-icon {
            transform: rotate(180deg);
        }
    }
}

</style>
