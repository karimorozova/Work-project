<template lang="pug">
    .drop-select(v-click-outside="outClick")
        .select
            template(v-if="selectedInd.length && selectedInd[0].name != 'All'")
                .selected
                    .industry-tooltip(v-for="item in selectedInd")
                        img(:src="item.icon")
            template(v-if="!selectedInd.length || selectedInd[0].name == 'All' ") 
                span.selected.no-industry Options
            .arrow-button(@click="showInds")
                img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseIcon: droppedInd}")
        .drop(v-if="droppedInd")
            .drop__item(v-for="(industry, index) in industries" @click.stop="changeInd(index)" :class="{chosen: industry.name == selectedInd.name}")
                .checkbox
                    .checkbox__check(:class="{checked: filteredIndustries.indexOf(industry.name) != -1}")
                span.drop__name {{ industry.name }}
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
    props: {
        selectedInd: {
            type: Array
        },
        filteredIndustries: {
            type: Array,
        },
        parentInd: {
            type: Number
        }
    },
    data() {
        return {
            industries: [],
            droppedInd: false,
            errors: []
        }
    },
    methods: {
        showInds(event) {
            let elementsObj = event.composedPath();
            let tr = elementsObj.find(item => {
                if(item.localName == "tr" || (item.className && item.className.indexOf("table__body-row") !== -1)) {
                    return item;
                }
            });
            let top = 0;
            let height = 0;
            if(tr) {
                top = tr.offsetTop;
                height = tr.offsetHeight;
            }
            this.droppedInd = !this.droppedInd;
            this.$emit('scrollDrop', {drop: this.droppedInd, index: this.parentIndex, offsetTop: top, offsetHeight: height})
        },
        async getIndustries() {
            try {
                const result = await this.$http.get('/api/industries')
                this.industries = result.data.filter(item => item.active);
            } catch(err) {
                this.errors.push(err)             
            }
        },
        outClick() {
            this.droppedInd = false;
        },
        changeInd(index) {
            this.$emit("chosenInd", {industry: this.industries[index], index: this.parentInd})
        }
    },
    directives: {
        ClickOutside
    },
    mounted () {
        this.getIndustries()
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.select {
    width: 100%;
    height: 28px;
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    .inner-component & {
        width: 174px;
        border-radius: 0;
        box-shadow: inset 0 0 6px $brown-shadow;
    }
    .vendors-table__drop-menu & {
        width: 100%;
        height: 30px;
    }
    .selected {
        border-right: 1px solid $light-brown;
        width: 80%;
        padding: 0 5px;
        font-size: 14px;
        max-height: 28px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        overflow: auto;
        position: relative;
        .vendors-table__drop-menu & {
            width: 80%;
            max-height: 30px;
        }
        .industry-tooltip {
            width: 40px;
            max-height: 28px;
            display: flex;
            img {
                max-width: 21px;
                max-height: 21px;
            }
            .toolTip {
                position: absolute;
                color: $orange;
                font-size: 12px;
                display: none;
                left: 36px;
                top: 8px;
            }
            &:hover {
                .toolTip {
                    display: inline-block;
                }
            }
        }
    }
    .no-industry {
        opacity: 0.5;
    }
    .arrow-button {
        width: 20%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        .vendors-table__drop-menu & {
            width: 20%;
        }
        img {
            padding-right: 2px;
        }
        .reverseIcon {
            transform: rotate(180deg);
        }
    }
}
.drop-select {
    position: absolute;    
    border: 1px solid $main-color;
    border-radius: 5px;
    width: 100%;
    overflow-x: hidden;
    z-index: 6;
    box-sizing: border-box;
    .drop {
        font-size: 14px;
        border-top: 1px solid $light-brown;
        max-height: 186px;
        overflow-y: auto;
        overflow-x: hidden;
        background-color: white;
        box-sizing: border-box;
        &__item {
            display: flex;
            align-items: center;
            padding: 5px 0 5px 5px;
            border-bottom: .5px solid $light-brown;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.4s;
            &:last-child {
                border: none;
            }
            &:hover {
                background-color: $active-background;
            }
        }
        .chosen {
            background-color: $active-background;
        }
        .vendors-table__drop-menu & {
            border: 1px solid $light-brown;
        }
        &__name {
            max-width: 90%;
            .vendors-table__drop-menu & {
                max-width: 85%;
            }
        }
    }
    .vendors-table__drop-menu & {
        border: none;
        border-radius: 0;
    }
}
.checkbox {
    width: 13px;
    height: 13px;
    border: 1px solid $main-color;
    margin-right: 3px;
    .checked {
        width: 100%;
        height: 100%;
        position: relative;
        &::before {
            content: '';
            position: absolute;
            width: 5px;
            border: 1px solid $main-color;
            top: 6px;
            left: 1px;
            transform: rotate(45deg);
        }
        &::after {
            content: '';
            position: absolute;
            width: 6px;
            border: 1px solid $main-color;
            top: 5px;
            left: 3px;
            transform: rotate(-58deg);
        }
    }
}
</style>
