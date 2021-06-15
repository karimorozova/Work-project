<template lang="pug">
    .drop-select(v-click-outside="outClick" :class="customClass")
        .select
            .selected(v-if="selectedInd.length")
                template(v-if="selectedInd[0].name !== 'All'")
                    img(v-for="name in selectedInd" :src="name.icon") 
                template(v-if="selectedInd[0].name === 'All'") All
            .selected.select_opacity-07(v-if="!selectedInd.length") Select
            .arrow-button(@click="showInds")
                img(src="../assets/images/open-close-arrow-brown.png" :class="{reverseIcon: droppedInd}")
        .drop(v-if="droppedInd")
            .drop__item(v-for="(industry, index) in industries" @click="changeInd(index)")
                .checkbox
                    .checkbox__check(:class="{checked: filteredIndustries.indexOf(industry.name) !== -1}")
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
        parentIndex: {
            type: Number,
            default: 0
        },
        entity: {
            type: Object
        },
        customClass: {
            type: String
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
            const classNames = ["table__tbody-row", "table__body-row"];
            let tr = elementsObj.find(item => {
                if(item.localName == "tr"|| classNames.indexOf(item.className) !== -1) {
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
            if(!this.entity) {
                try {
                const result = await this.$http.get('/api/industries');
                this.industries = result.data;
                // this.industries = result.data.filter(item => {
                //     if (item.name !== 'More' && item.name !== 'Other') {
                //         return item
                //     }
                // });
                this.industries.unshift({name: "All"})
                } catch(err) {
                    this.errors.push(err)
                }
            } else {
                let industries = JSON.stringify(this.entity.industries);
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
    created () {
        this.getIndustries()
    }
}
</script>

<style lang="scss" scoped>
.select {
    width: 100%;
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    .selected {
        border-right: 1px solid #bfb09d;
        width: 80%;
        padding: 0 5px;
        font-size: 14px;
        height: 32px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        overflow: auto;
        img {
            max-width: 21px;
            max-height: 21px;
            margin-right: 3px;
        }
        .inner-component & {
            border-right: 1px solid #bfb09d;
            padding: 2px 5px;
        }
        .industries__drop-menu {
            height: 28px;
        }
    }
    .arrow-button {
        width: 20%;
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
    }
    &_opacity-07 {
        opacity: 0.7;
    }
}
.drop-select {
    position: absolute;
    width: 100%;
    background-color: white;
    z-index: 5;
    border: 1px solid #c1bbb1;
    border-radius: 4px;
    box-sizing: border-box;
    .drop {
        font-size: 14px;
        width: 100%;
        border-top: 1px solid #BFB09D;
        max-height: 186px;
        overflow-y: auto;
        overflow-x: hidden;
        background-color: white;
        box-sizing: border-box;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
        &__item {
            display: flex;
            align-items: center;
            padding: 5px 0 5px 5px;
            border-bottom: .5px solid #BFB09D;
            cursor: pointer;
            transition: ease 0.2s;
            &:last-child {
                border: none;
            }
            &:hover {
                background-color: rgba(191, 176, 157, 0.5);
            }
        }
        &__name {
            max-width: 90%;
        }
        .inner-component & {
            max-height: 130px;
            border: 1px solid #BFB09D;
            border-top: none;
        }
    }
    .inner-component & {
        border: none;
        border-radius: 0;
        height: 100%;
        z-index: 4;
    }
}
.checkbox {
    width: 13px;
    height: 13px;
    border: 1px solid #c1bbb1;
    margin-right: 3px;
    .checked {
        width: 100%;
        height: 100%;
        position: relative;
        &::before {
            content: '';
            position: absolute;
            width: 5px;
            border: 1px solid #c1bbb1;
            top: 6px;
            left: 1px;
            transform: rotate(45deg);
        }
        &::after {
            content: '';
            position: absolute;
            width: 6px;
            border: 1px solid #c1bbb1;
            top: 5px;
            left: 4px;
            transform: rotate(-58deg);
        }
    }
}

.table-drop {
    border: none;
    border-radius: 0;
    height: 100%;
    .drop {
        border: 1px solid #BFB09D;
        max-height: 118px;
    }
    .select {
        box-shadow: inset 0 0 7px rgba(104, 87, 62, 0.5);
        height: 100%;
        .selected {
            height: 100%;
        }
    }
}

</style>
