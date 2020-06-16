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
    top: 20px;
    width: 100%;
    border: 1px solid #67573E;
    border-radius: 15px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 3px 8px rgba(103, 87, 62, 0.7);
    .drop {
        width: 100%;
        max-height: 100px;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        background-color: white;
        z-index: 60;
        &__item {
            align-items: center;
            padding: 5px;
            border-bottom: .5px solid #BFB09D;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.4s;
            &:first-child {
                border-top: .5px solid #BFB09D;
            }
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
    border-radius: 15px;
    width: 100%;
    height: 40px;
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    .selected {
        width: 90%;
        padding: 3px 10px;
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
        width: 10%;
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

.account {
    border-radius: 5px;
    top: 0;
    box-shadow: none;
    box-sizing: border-box;
    .select {
        height: 28px;
        .selected {
            width: 82%;
            border-right: 1px solid #bfb09d;
            padding: 0 5px;
        }
        .arrow-button {
            width: 18%;
        }
    }
    .drop {
        border-top: 1px solid #bfb09d;
        max-height: 150px;
    }
}

</style>
