<template lang="pug">
    .drop-select(v-click-outside="outOptions" :class="{'z-index': isDropped}")
        .select
            span.selected(v-if="selectedOption") {{ selectedOption }}
            span.selected.no-choice(v-if="!selectedOption") {{ placeholder }}
            .arrow-button(@click="toggleOptions")
                img(src="../assets/images/arrow_open.png" :class="{'reverse-icon': isDropped}")
        .drop(v-if="isDropped")
            input.drop__search(v-if="hasSearch" type="text" @input="(e) => search(e)" placeholder="Search")
            .drop__item(v-for="(option, index) in filteredOptions" @click="chooseOption(index)" :class="{active: activeClass(option)}")
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
        },
        hasSearch: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            isDropped: false,
            searchValue: ""
        }
    },
    methods: {
        showOptions(event) {
            let elementsObj = event.composedPath();
            let tr = elementsObj.find(item => {
                if(item.localName == "tr") {
                    return item;
                }
            });
            let top = 0;
            let height = 0;
            if(tr) {
                top = tr.offsetTop;
                height = tr.offsetHeight;
            }
            this.droppedLang = !this.droppedLang;
            this.$emit('scrollDrop', {drop: this.isDropped, offsetTop: top, offsetHeight: height});
        },
        showOption(opt) {
            return (typeof opt === "string") ? opt: opt.name;
        },
        outOptions() {
            this.isDropped = false;
        },
        toggleOptions(event) {
            this.isDropped = !this.isDropped;
            this.showOptions(event);
        },
        chooseOption(index) {
            this.$emit("chooseOption", {option: this.filteredOptions[index], refersTo: this.refersTo});
            this.outOptions();
        },
        activeClass(elem) {
            if(this.selectedOption == elem && elem != "Yes") return true;
            if(elem == "Yes" && this.selectedOption && 
            this.options.indexOf(this.selectedOption) === -1) return true;
            return false;
        },
        search(e) {
            this.searchValue = e.target.value;
        }
    },
    computed: {
        isObject() {
            return typeof this.selectedOption === "object"
        },
        filteredOptions() {
            let result = this.options;
            if(this.searchValue) {
                if(typeof opt === "string") {
                    return result.filter(item => item.toLowerCase().indexOf(this.searchValue.toLowerCase()) !== -1);
                }
                return result.filter(item => item.name.toLowerCase().indexOf(this.searchValue.toLowerCase()) !== -1);
            }
            return result;
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
    border: 1px solid #67573E;
    border-radius: 5px;
    overflow: hidden;
    flex-direction: column;
    .drop {
        width: 100%;
        max-height: 100px;
        overflow-y: overlay;
        overflow-x: hidden;
        background-color: #FFF;
        border-top: 1px solid #67573E;    
        z-index: 10;
        &__search {
            color: #67573E;
            padding-left: 3px;
        }
        &__item {
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
        .project-info__tasks & {
            max-height: 170px;
        }
        .filters & {
            max-height: 220px;
        }
        .inner-component & {
            max-height: 135px;
            border-top: none;
            border-bottom: 1px solid #BFB09D;
        }
    }
    .filters &, .project-finance__drop-menu & {
        width: 100%;
    }
    .inner-component & {
        border: none;
        border-radius: 0;
        height: 100%;
        overflow: visible;
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
        .inner-component & {
            background-color: white;
            box-shadow: inset -1px 0 5px #bfb09d;
            border-left: 1px solid #bfb09d;
        }
    }
    .inner-component & {
        border: none;
        border-radius: 0;
        box-shadow: inset 0 0 8px rgba(191, 176, 157, 1);
        height: 100%;
        .selected {
            padding: 2px 5px;
        }
    }
}

</style>
