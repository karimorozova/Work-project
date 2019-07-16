<template lang="pug">
    .drop-select(v-click-outside="outClick")
        .select
            template(v-if="selectedInd.length && selectedInd[0].name != 'All'")
                .selected
                    .industry-tooltip(v-for="item in selectedInd")
                        img(:src="item.icon")
            template(v-if="selectedInd.length && selectedInd[0].name === 'All'")
                .selected {{ selectedInd[0].name }}
            template(v-if="!selectedInd.length") 
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
            type: Array,
            default: () => []
        },
        filteredIndustries: {
            type: Array,
            default: () => []
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
            let sortedArray = result.data.filter(item => {
                if (item.name != 'More') {
                    return item
                }
            });
                sortedArray.sort( (a,b) => {
                    if(a.name < b.name) return -1;
                    if(a.name > b.name) return 1;
                });
                this.industries = sortedArray;
            } catch(e) {
                this.errors.push(e)
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
.select {
    width: 100%;
    height: 28px;
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    .inner-component & {
        width: 182px;
        border: none;
        border-radius: 0;
        box-shadow: inset 0 0 6px rgba(103, 87, 62, 0.75);
    }
    .clients-table__drop-menu & {
        width: 100%;
        border: none;
        height: 30px;
        border: none;
    }
    .selected {
        border-right: 1px solid #BFB09D;
        width: 82%;
        padding: 0 5px;
        font-size: 14px;
        max-height: 28px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        overflow: auto;
        position: relative;
        .clients-table__drop-menu & {
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
                color: #D15F45;
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
        width: 18%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
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
    border: 1px solid #67573E;
    border-radius: 5px;
    width: 100%;
    overflow: hidden;
    box-sizing: border-box;
    z-index: 6;
    .drop {
        font-size: 14px;
        box-sizing: border-box;
        width: 100%;
        border-top: 1px solid #BFB09D;
        max-height: 150px;
        overflow-y: auto;
        overflow-x: hidden;
        background-color: white;
        &__item {
            display: flex;
            align-items: center;
            padding: 5px 0 5px 5px;
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
        &__name {
            max-width: 89%;
        }
        .chosen {
            background-color: rgba(191, 176, 157, 0.5);
        }
        .clients-table__drop-menu & {
            border: 1px solid #BFB09D;
        }
    }
    .clients-table__drop-menu & {
        border: none;
        z-index: 1;
        border-radius: 0;
    }
}
.checkbox {
    width: 13px;
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
</style>
