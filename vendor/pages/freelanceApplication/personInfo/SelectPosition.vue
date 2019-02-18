<template lang="pug">
.position
    .position__label Position:
    .drop-select(v-click-outside="outPositions")
        .select(@click="togglePositions")
            span.selected(v-if="selectedPositions.length") {{ selectedPositions.join('; ') }}
            span.selected.no-position(v-if="!selectedPositions.length") Select
            .arrow-button
                img(src="../../../assets/images/arrow_open.png" :class="{'reverse-icon': posDropped}")
        .drop(v-if="posDropped")
            .drop__item(v-for="(position, index) in positions" @click="choosePosition(index)")
                .checkbox
                    .checkbox__check(:class="{checked: activeClass(position)}")
                span {{ position }}

</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
    props: {
        selectedPositions: {
            type: Array,
            default: () => []
        },
        otherChoice: {
            type: String,
            default: ""
        }
    },
    data() {
        return {
            posDropped: false,
            positions: ["Copywriter", "Translator", "Other"]
        }
    },
    methods: {
        outPositions() {
            this.posDropped = false;
        },
        togglePositions() {
            this.posDropped = !this.posDropped;
        },
        choosePosition(index) {
            this.$emit('choosePosition', {position: this.positions[index]})
        },
        activeClass(elem) {
            return (this.selectedPositions.indexOf(elem) != -1 || 
                this.otherChoice.indexOf(elem) != -1)
        }
    },
    directives: {
        ClickOutside
    },
}
</script>

<style lang="scss" scoped>

.position__label {
    font-size: 12px;
    position: absolute;
    top: -45px;
}

.drop-select {
    position: absolute;
    top: -25px;;
    width: 268px;
    border: 1px solid #67573E;
    border-radius: 15px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 3px 8px rgba(103, 87, 62, 0.7);
    @media (max-width: 1600px) {
        width: 100%;
    }
    .drop {
        width: 100%;
        max-height: 100px;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        background-color: white;
        z-index: 6;
        &__item {
            display: flex;
            align-items: center;
            height: 37px;
            padding: 5px 2px;
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
        width: 80%;
        padding: 3px 10px;
        font-size: 14px;
        max-height: 40px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        overflow: auto;
        position: relative;
    }
    .no-position {
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
