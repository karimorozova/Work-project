<template lang="pug">
    .dropSelect(v-click-outside="outClick")
        .select
            span.selected {{ selectedInd.name }}
            .arrowButton(@click="showInds")
                img(src="../assets/images/open-close-arrow-brown.png" :class="{reverseIcon: droppedInd}")
        .drop(v-if="droppedInd")
            span.drop__item(v-for="(industry, index) in industries" @click="changeInd(index)") {{ industry.name }}
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
    props: {
        selectedInd: {
            type: Object
        },
        parentIndex: {
            type: Number,
            default: 0
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
        showInds() {
            this.droppedInd = !this.droppedInd;
        },
        async getIndustries() {
            await this.$http.get('api/industries')
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
        },
        outClick() {
            this.droppedInd = false;
        },
        changeInd(index) {
            this.$emit("chosenInd", {data: this.industries[index], index: this.parentIndex})
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
    }
    .arrowButton {
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
        .innerComponent & {
            background-color: white;
            box-shadow: inset -1px 0 5px #bfb09d;
        }
    }
    .innerComponent & {
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
.dropSelect {
    position: relative;
    .drop {
        position: absolute;
        width: 100%;
        border: 1px solid #BFB09D;
        max-height: 150px;
        overflow-y: scroll;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        background-color: white;
        &__item {
            padding: 2px;
            border-bottom: .5px solid #BFB09D;
            cursor: pointer;
            transition: all 0.4s;
            &:last-child {
                border: none;
            }
            &:hover {
                padding-left: 5px;
                background-color: rgba(191, 176, 157, 0.5);
            }
        }
        .innerComponent & {
            height: 130px;
        }
    }
    .innerComponent & {
        height: 100%;
    }
}
</style>
