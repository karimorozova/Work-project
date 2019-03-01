<template lang="pug">
    .drop-select(v-click-outside="outClick")
        .select
            template(v-if="selectedInd")
                .selected {{ selectedInd.type }}
            template(v-if="!selectedInd")
                span.selected.no-industry Options
            .arrow-button(@click="showInds")
                img(src="../../../../../assets/images/open-close-arrow-brown.png" :class="{reverseIcon: droppedInd}")
        .drop(v-if="droppedInd")
            .drop__item(v-for="(job, index) in uniqJobTypes" @click="changeInd(index)" :class="{chosen: job.type === selectedInd.type}")
                span {{ job.type }}
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
    props: {
        selectedInd: {
            type: [String, Object]
        },
        selectedJobType: {
            type: [String, Object]
        },
        parentInd: {
            type: Number
        },
        jobs: {
          type: [ Object, Array]
      },
    },
    data() {
        return {
            industries: [],
            uniqJobTypes: [],
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
        async getJobTypes() {
          this.uniqJobTypes = _.uniqBy(this.jobs,'type');
          this.uniqJobTypes.unshift({type: "All"})
            // try {
            //     const allIndustries = await this.$http.get('/api/industries')
            //     let sortedArray = allIndustries.data.filter(item => {
            //         if (item.name != 'More') {
            //             return item
            //         }
            //     });
            //     sortedArray.sort( (a,b) => {
            //         if(a.name < b.name) return -1;
            //         if(a.name > b.name) return 1;
            //     });
            //     if(this.isAllExist) {
            //         sortedArray.unshift({name: "All"});
            //     }
            //     this.industries = sortedArray;
            // } catch(err) {
            //     this.errors.push(err)
            // }
        },
        outClick() {
            this.droppedInd = false;
            this.$emit('scrollDrop', {drop: this.droppedInd, offsetTop: 0, offsetHeight: 0})
        },
        changeInd(index) {
            this.$emit("setJobTypeFilter", { option: this.uniqJobTypes[index]});
            this.outClick();
        }
    },
    directives: {
        ClickOutside
    },
    mounted () {
        this.getJobTypes()
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
        width: 174px;
        border: none;
        border-radius: 0;
        box-shadow: inset 0 0 6px rgba(103, 87, 62, 0.75);
    }
    .selected {
        width: 82%;
        padding: 0 5px;
        font-size: 14px;
        max-height: 28px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        overflow: auto;
        position: relative;
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
        border-left: 1px solid #68573E;
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
    border-radius: 5px;
    border: 1px solid #67573E;
    overflow: hidden;
    width: 100%;
    box-sizing: border-box;
    .drop {
        border-top: 1px solid #67573E;
        font-size: 14px;
        width: 100%;
        max-height: 150px;
        overflow-y: overlay;
        overflow-x: hidden;
        background-color: white;
        z-index: 6;
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
        .chosen {
            background-color: rgba(191, 176, 157, 0.5);
        }
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
