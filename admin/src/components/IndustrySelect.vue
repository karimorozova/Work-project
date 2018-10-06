<template lang="pug">
    .drop-select(v-click-outside="outClick")
        .select
            template(v-if="selectedInd.length && selectedInd[0].name != 'All' && selectedInd[0].name != 'Select'")
                .selected
                    img(v-for="name in selectedInd" :src="name.icon") 
            template(v-if="!selectedInd.length || selectedInd[0].name == 'All' || selectedInd[0].name == 'Select'") 
                span.selected {{ selectedInd[0].name }}
            .arrow-button(@click="showInds")
                img(src="../assets/images/open-close-arrow-brown.png" :class="{reverseIcon: droppedInd}")
        .drop(v-if="droppedInd")
            .drop__item(v-for="(industry, index) in industries" @click="changeInd(index)")
                .checkbox
                    .checkbox__check(:class="{checked: filteredIndustries.indexOf(industry.name) != -1}")
                span {{ industry.name }}
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
        parentIndex: {
            type: Number,
            default: 0
        },
        who: {
            type: Object
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
            this.droppedInd = !this.droppedInd;
            this.$emit('scrollDrop', {drop: this.droppedInd, index: this.parentIndex, offsetTop: top, offsetHeight: height})
        },
        async getIndustries() {
            if(!this.who) {
                await this.$http.get('/api/industries')
                .then(response => {
                    let sortedArray = response.data.filter(item => {
                        if (item.name != 'More') {
                            return item
                        }
                    });
                    sortedArray.sort( (a,b) => {
                        if(a.name < b.name) return -1;
                        if(a.name > b.name) return 1;
                    });
                    this.industries = sortedArray;
                    this.industries.unshift({name: "All"})
                })
                .catch(e => {
                    this.errors.push(e)
                })
            } else {
                let industries = JSON.stringify(this.who.industry);
                industries = JSON.parse(industries);
                this.industries = industries;
                this.industries.unshift({name: "All"})
            }
        },
        outClick() {
            this.droppedInd = false;
        },
        changeInd(index) {
            this.$emit("chosenInd", {industry: this.industries[index], index: this.parentIndex})
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
    border: 1px solid #BFB09D;
    border-radius: 5px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    .selected {
        border-right: 1px solid #BFB09D;
        width: 82%;
        padding: 3px 5px;
        font-size: 14px;
        opacity: 0.7;
        height: 31px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        overflow: auto;
        img {
            max-width: 21px;
            max-height: 21px;
        }
    }
    .arrow-button {
        width: 18%;
        display: flex;
        justify-content: center;
        align-items: center;
        img {
            padding-right: 2px;
        }
        .reverseIcon {
            transform: rotate(180deg);
        }
        .inner-component & {
            background-color: white;
            box-shadow: inset -1px 0 5px #bfb09d;
        }
    }
    .inner-component & {
        border: none;
        border-radius: 0;
        box-shadow: inset 0 0 8px rgba(191, 176, 157, 1);
        height: 100%;
        .selected {
            padding-top: 5px;
            opacity: 1;
        }
    }
}
.drop-select {
    position: relative;
    .drop {
        font-size: 14px;
        position: absolute;
        width: 100%;
        border: 1px solid #BFB09D;
        max-height: 150px;
        overflow-y: scroll;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        background-color: white;
        z-index: 6;
        &__item {
            display: flex;
            align-items: center;
            padding: 2px;
            border-bottom: .5px solid #BFB09D;
            cursor: pointer;
            transition: all 0.4s;
            &:last-child {
                border: none;
            }
            &:hover {
                background-color: rgba(191, 176, 157, 0.5);
            }
        }
        .inner-component & {
            max-height: 130px;
        }
    }
    .inner-component & {
        height: 100%;
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
