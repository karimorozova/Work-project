<template lang="pug">
    .dropSelect(v-click-outside="outClick")
        .select
            span.selected(v-if="selectedLang.length == 1 && selectedLang[0].length") {{ selectedLang[0] }}
            .selected(v-if="selectedLang.length > 1") 
                span(v-for="lang in selectedLang") {{ lang }};
            span.selected(v-if="!selectedLang[0].length") Options
            .arrowButton(@click="showLangs")
                img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseIcon: droppedLang}")
        input.search(v-if="droppedLang" v-model="searchLang" placeholder="Search")        
        .drop(v-if="droppedLang")
            .drop__item( v-for="(language, index) in filteredLangs" @click="changeLang(index)")
                span {{ language.lang }}
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
    props: {
        selectedLang: {
            type: Array
        },
        parentIndex: {
            type: Number,
            default: 0
        },
        addAll: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            languages: [],
            droppedLang: false,
            errors: [],
            searchLang: ''
        }
    },
    methods: {
        showLangs(event) {
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
            this.$emit('scrollDrop', {drop: this.droppedLang, index: this.parentIndex, offsetTop: top, offsetHeight: height})
        },
        async getLanguages() {
            await this.$http.get('api/languages')
            .then(response => {
                let sortedArray = response.body;
                this.languages = sortedArray.sort( (a,b) => {
                    if(a.lang < b.lang) return -1;
                    if(a.lang > b.lang) return 1;
                });
                if(this.addAll) {
                    this.languages.unshift({lang: "All", symbol: "All"})
                }
            })
            .catch(e => {
                this.errors.push(e)
            })
        },
        outClick() {
            this.droppedLang = false;
        },
        changeLang(index) {
            this.$emit("chosenLang", {lang: this.filteredLangs[index], index: this.parentIndex})
        }
    },
    computed: {
        filteredLangs() {
            let result = this.languages.filter(item => {
                if(item.lang.toLowerCase().indexOf(this.searchLang.toLowerCase()) != -1) {
                    return item
                }
            })
            return result;
        }
    },
    directives: {
        ClickOutside
    },
    mounted () {
        this.getLanguages()
    }
}
</script>

<style lang="scss" scoped>

.select {
    border: 1px solid #67573E;
    border-radius: 5px;
    width: 100%;
    height: 28px;
    display: flex;
    justify-content: space-between;
    .selected {
        border-right: 1px solid #BFB09D;
        width: 82%;
        padding: 3px 5px;
        font-size: 14px;
        opacity: 0.7;
        max-height: 28px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        overflow: auto;
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
    }
    .innerComponent & {
        border: none;
        border-radius: 0;
        box-shadow: inset 0 0 8px rgba(191, 176, 157, 1);
        height: 26px;
        border: 1px solid #BFB09D;
        .selected {
            opacity: 1;
            padding: 2px 5px;
        }
    }
}
.dropSelect {
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
        z-index: 15;
        padding-top: 29px;
        &__item {
            display: flex;
            align-items: center;
            padding: 12px 2px;
            border-bottom: .5px solid #BFB09D;
            cursor: pointer;
            transition: all 0.4s;
            &:last-child {
                border: none;
            }
            &:hover {
                // padding-left: 5px;
                background-color: rgba(191, 176, 157, 0.363);
            }
        }
        .innerComponent & {
            max-height: 118px;
            padding-top: 28px;
            span {
                width: 88%;
            }
        }
    }
    .innerComponent & {
        height: 100%;
    }
    .search {
        position: absolute;
        z-index: 50;
        width: 90%;
        padding: 5px 3px;
        color: #67573E;
        outline: none;
        box-shadow: inset 0 0 5px rgba(125, 138, 180, 0.623);
        border: 1px solid rgba(125, 138, 180, 0.466);
        border-right: none;
        .innerComponent & {
            width: 88%;
        }
    }
}

</style>
