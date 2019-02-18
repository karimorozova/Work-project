<template lang="pug">
    .drop-select(v-click-outside="outOptions")
        .select(@click="toggleOptions")
            span.selected(v-if="selectedOptions.length") {{ selectedOptions.join('; ') }}
            span.selected.no-choice(v-if="!selectedOptions.length") Select
            .arrow-button
                img(src="../../assets/images/arrow_open.png" :class="{'reverse-icon': isDropped}")
        .drop(v-if="isDropped")
            .drop__item(v-for="(option, index) in options" @click="chooseOptions(index)")
                .checkbox
                    .checkbox__check(:class="{checked: activeClass(option)}")
                span {{ option }}
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
    props: {
        selectedOptions: {
            type: Array
        },
        options: {
            type: Array
        },
        refersTo: {
            type: String
        },
        otherChoice: {
            type: String,
            default: ""
        },
        otherDtpChoice: {
            type: String,
            default: ""
        },
        otherSoftwareChoice: {
            type: String,
            default: ""
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
        chooseOptions(index) {
            this.$emit("chooseOptions", {option: this.options[index], refersTo: this.refersTo})
        },
        activeClass(elem) {
            return (this.selectedOptions.indexOf(elem) != -1 ||
                this.otherChoice.indexOf(elem) != -1 ||
                this.otherDtpChoice.indexOf(elem) != -1 || 
                this.otherSoftwareChoice.indexOf(elem) != -1)
        }
    },
    directives: {
        ClickOutside
    },
}
</script>

<style lang="scss" scoped>

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
        flex-direction: column;
        background-color: white;
        z-index: 6;
        &__item {
            display: flex;
            align-items: center;
            height: 32px;
            padding: 0 5px;
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
        .domain__options & {
            max-height: 170px;
        }
    }
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

.checkbox {
    width: 13px;
    height: 13px;
    border: 1px solid #67573E;
    margin-right: 3px;
    margin-left: 5px;
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
