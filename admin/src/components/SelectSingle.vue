<template lang="pug">
    .drop-select(v-click-outside="outOptions" :class="{'z-index': isDropped}")
        .select(@click="toggleOptions")
            span.selected(v-if="selectedOption") {{ selectedOption }}
            span.selected.no-choice(v-if="!selectedOption") {{ placeholder }}
            .arrow-button
                img(src="../assets/images/arrow_open.png" :class="{'reverse-icon': isDropped}")
        .drop(v-if="isDropped")
            .drop__item(v-for="(option, index) in options" @click="chooseOption(index)" :class="{active: activeClass(option)}")
                span {{ showOption(option) }}
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
    props: {
        selectedOption: {
            type: [String, Object]
        },
        options: {
            type: Array
        },
        placeholder: {
            type: String
        },
        refersTo: {
            type: String
        }
    },
    data() {
        return {
            isDropped: false
        }
    },
    methods: {
        showOption(opt) {
            return (typeof opt === "string") ? opt: opt.name;
        },
        outOptions() {
            this.isDropped = false;
        },
        toggleOptions() {
            this.isDropped = !this.isDropped;
        },
        chooseOption(index) {
            this.$emit("chooseOption", {option: this.options[index], refersTo: this.refersTo});
            this.outOptions();
        },
        activeClass(elem) {
            if(this.selectedOption == elem && elem != "Yes") return true;
            if(elem == "Yes" && this.selectedOption && 
            this.options.indexOf(this.selectedOption) === -1) return true;
            return false;
        }
    },
    computed: {
        isObject() {
            return typeof this.selectedOption === "object"
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
    width: 191px;
    border: 1px solid #67573E;
    border-radius: 5px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .drop {
        width: 100%;
        max-height: 100px;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        background-color: #FFF;
        border-top: 1px solid #67573E;    
        z-index: 10;
        &__item {
            padding: 7px;
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
        .project-info__tasks & {
            max-height: 170px;
        }
        .filters & {
            max-height: 220px;
        }
    }
    .filters &, .project-finance__drop-menu & {
        width: 100%;
    }
}

.z-index {
    z-index: 1;
}

.select {
    border-radius: 15px;
    width: 100%;
    height: 28px;
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
        .filters_short-menu & {
            width: 72%;
        }
    }
    .no-choice {
        opacity: 0.5;
    }
    .arrow-button {
        width: 20%;
        display: flex;
        justify-content: center;
        align-items: center;
        border-left: 0.5px solid #68573E;
        img {
            padding-right: 2px;
        }
        .reverse-icon {
            transform: rotate(180deg);
        }
        .filters_short-menu & {
            width: 28%;
        }
    }
}

</style>
