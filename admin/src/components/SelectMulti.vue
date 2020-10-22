<template lang="pug">
    .drop-select(v-click-outside="outOptions" :class="[{'z-index': isDropped, 'table-drop-menu': isTableDropMenu}, customClass]")
        .select(@click="toggleOptions")
            span.selected(v-if="selectedOptions.length") {{ selectedOptions.join('; ') }}
            span.selected.no-choice(v-if="!selectedOptions.length") {{ placeholder }}
            .arrow-button
                img(src="../assets/images/arrow_open.png" :class="{'reverse-icon': isDropped}")
        .drop(v-if="isDropped")
            .drop__buttonRow(v-if="allOptionsButtons")
                .buttonRow__button(@click="setOrUnsetAllOptions('set')")
                    i.fa.fa-check-square-o(aria-hidden='true')
                    span Select All
                .buttonRow__button(@click="setOrUnsetAllOptions('unset')")
                    i.fa.fa-square-o(aria-hidden='true')
                    span Clear All
            input.drop__search(v-if="hasSearch" type="text" @input="(e) => search(e)" ref="search" placeholder="Search")
            .drop__item(v-for="(option, index) in filteredOptions" @click="chooseOptions(index)")
                .checkbox
                    .checkbox__check(:class="{checked: activeClass(option)}")
                span {{ showOption(option) }}
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
    props: {
        customClass: {
            type: String
        },
        isTableDropMenu: {
            type: Boolean,
            default: false
        },
        selectedOptions: {
            type: Array
        },
        options: {
            type: Array
        },
        hasSearch: {
            type: Boolean,
            default: false
        },
        placeholder: {
            type: String,
            default: ""
        },
        allOptionsButtons: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            isDropped: false,
            searchValue: ""
        }
    },
    methods: {
        showOption(opt) {
            return (typeof opt === "string") ? opt: opt.name;
        },
        outOptions() {
            this.isDropped = false;
            this.searchValue = "";
        },
        searchFocus(){
            this.$nextTick(() => this.$refs.search.focus());
        },
        toggleOptions() {
            this.isDropped = !this.isDropped;
            this.searchValue = "";
            if(this.isDropped && this.hasSearch) {
                this.searchFocus();
            } 
        },
        chooseOptions(index) {
            this.$emit("chooseOptions", {option: this.filteredOptions[index]})
            // this.searchFocus();
        },
        activeClass(elem) {
            return (this.selectedOptions.indexOf(elem) !== -1 ||
                this.selectedOptions.indexOf(elem.name) !== -1)
        },
        search(e) {
            this.searchValue = e.target.value;
        },
        setOrUnsetAllOptions(key){
            switch(key) {
                case "set":
                    const arrayForSet = this.filteredOptions.filter((a) => !this.selectedOptions.includes(a))
                    for (let index = 0; index < arrayForSet.length; index++) {
                        this.$emit("chooseOptions", { option: arrayForSet[index] })
                    }
                    break;
                case "unset":
                    for (let index = 0; index < this.selectedOptions.length; index++) {
                        this.$emit("chooseOptions", { option: this.selectedOptions[index] })
                    }
                    break;
            }
        },
    },
    computed: {
        filteredOptions() {
            let result = this.options;
            if(this.searchValue) {
                return result.filter(item => item.toLowerCase().indexOf(this.searchValue.toLowerCase()) !== -1);
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
.fa-check-square-o,
.fa-square-o {
    padding-right: 5px;
}
.drop-select {
    position: absolute;
    width: 100%;
    border: 1px solid #67573E;
    border-radius: 5px;
    overflow: hidden;
    box-sizing: border-box;

    .drop {
        width: 100%;
        max-height: 186px;
        overflow-y: auto;
        overflow-x: hidden;
        background-color: white;
        z-index: 10;
        border-top: 1px solid #67573E; 
        box-sizing: border-box; 
        z-index: 10;
        &__item {
            display: flex;
            align-items: center;
            padding: 5px 0 5px 5px;
            border-bottom: .5px solid #BFB09D;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.4s;
            &:last-child {
                border-bottom: none;
            }
            &:hover {
                background-color: rgba(191, 176, 157, 0.5);
            }
        }
        &__buttonRow{
            height: 31px;
            display: flex;
            .buttonRow{
                &__button{
                    width: 50%;
                    height: 31px;
                    background: #938676;
                    color: white;
                    cursor: pointer;
                    font-size: 12px;
                    line-height: 33px;
                    text-align: center;
                    &:hover{
                        background: #84786a;
                    }
                }
            }
            .buttonRow__button:last-child{
                border-left: .5px solid white;
            }
        }
        &__search {
            width: 100%;
            box-sizing: border-box;
            padding: 5px 0 5px 5px;
            color: #67573E;
            outline: none;
            box-shadow: inset 0 0 5px rgba(104, 87, 62, 0.5);
            border: 1px solid rgba(104, 87, 62, 0.3);
            border-right: none;
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
        padding: 3px 5px;
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
        border-left: 0.5px solid #bfb09d;
        img {
            padding-right: 2px;
        }
        .reverse-icon {
            transform: rotate(180deg);
        }
        .filters & {
            width: 24%;
        }
        .rates-filters__item & {
            width: 20%;
        }
    }
    .rates-filters__item & {
        height: 32px;
    }
}

.checkbox {
    min-width: 13px;
    height: 13px;
    border: 1px solid #67573E;
    margin-right: 3px;
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

.height-32 {
    .select {
        height: 32px;
    }
    .drop {
        max-height: 160px;
    }
}

.table-drop-menu {
    border: none;
    border-radius: 0;
    height: 100%;
    overflow: visible;
    .drop {
        border: 1px solid #BFB09D;
    }
    .select {
        height: 32px;
        border-radius: 0px;
        box-shadow: inset 0 0 7px rgba(104, 87, 62, 0.5);
    }
}

</style>
