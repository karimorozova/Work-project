<template lang="pug">
    .drop-select(v-click-outside="outOptions")
        .select(@click="toggleOptions")
            span.selected(v-if="selectedOptions.length") {{ selectedOptions.join('; ') }}
            span.selected.no-choice(v-if="!selectedOptions.length") {{ placeholder }}
            .arrow-button
                img(src="../assets/images/arrow_open.png" :class="{'reverse-icon': isDropped}")
        .drop(v-if="isDropped")
            .drop__item(v-for="(option, index) in options" @click="chooseOptions(index)")
                .checkbox
                    .checkbox__check(:class="{checked: activeClass(option)}")
                span {{ showOption(option) }}
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
        },
        placeholder: {
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
        showOption(opt) {
            return (typeof opt === "string") ? opt: opt.name;
        },
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
                this.selectedOptions.indexOf(elem.name) != -1 ||
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
        background-color: white;
        z-index: 10;
        border-top: 1px solid #67573E; 
        box-sizing: border-box; 
        &__item {
            display: flex;
            align-items: center;
            height: 27px;
            padding: 7px;
            border-bottom: .5px solid #BFB09D;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.4s;
            &:first-child {
                border-top: .5px solid #BFB09D;
            }
            &:last-child {
                border-bottom: none;
            }
            &:hover {
                background-color: rgba(191, 176, 157, 0.5);
            }
            .project & {
                padding: 5px;
            }
            .project-info__tasks &, .filters & {
                padding: 12px 0;
            }
            .filters & {
                font-size: 12px;
            }
        }
        .domain__options & {
            max-height: 170px;
        }
        .project & {
            max-height: 180px;
        }
        .project-info__tasks & {
            max-height: 170px;
        }
        .filters & {
            max-height: 200px;
        }
    }
    .filters & {
        width: 100%;
    }
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
        .filters & {
            width: 76%;
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
        .filters & {
            width: 24%;
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
    .filters & {
        margin-left: 3px;
    }
}

</style>
