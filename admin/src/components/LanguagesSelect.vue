<template lang="pug">
    .drop-select(v-click-outside="outClick")
        .select
            span.selected(v-if="selectedLang.length == 1" :class="{'no-opacity': selectedLang.length}") {{ selectedLang[0] }}
            span.selected(v-if="!selectedLang.length") {{ placeholder }}
            .selected(v-if="selectedLang.length > 1" :class="{'no-opacity': selectedLang.length}") 
                span(v-for="lang in selectedLang") {{ lang }}; &nbsp;
            .arrow-button(@click="showLangs")
                img(src="../assets/images/open-close-arrow-brown.png" :class="{'reverse-Icon': droppedLang}")
        input.search(v-if="droppedLang" v-model="searchLang" placeholder="Search")        
        .drop(v-if="droppedLang")
            .drop__item( v-for="(language, index) in filteredLangs" @click="changeLang(index)")
                .checkbox
                    .checkbox__check(:class="{checked: selectedLang.indexOf(language.symbol) != -1}")
                span.drop__name(:class="{'left-pad': !isCheckboxShown}") {{ language.lang }}
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
        },
        placeholder: {
            type: String,
            default: 'Select'
        },
        single: {
            type: Boolean,
            default: false
        },
        langFilter: {
            type: Array,
            default: () => []
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
            this.$emit('scrollDrop', {drop: this.droppedLang, index: this.parentIndex, offsetTop: top, offsetHeight: height});
            this.searchLang = "";
        },
        async getLanguages() {
            await this.$http.get('/api/languages')
            .then(response => {
                let sortedArray = response.body;
                this.languages = sortedArray.sort( (a,b) => {
                    if(a.lang < b.lang) return -1;
                    if(a.lang > b.lang) return 1;
                });
                if(this.langFilter.length) {
                    this.languages = this.languages.filter(item => this.langFilter.indexOf(item._id) !== -1);
                }
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
            this.searchLang = "";
        },
        changeLang(index) {
            this.$emit("chosenLang", {lang: this.filteredLangs[index], index: this.parentIndex});
            if(this.single) {
                this.droppedLang = false;
                this.searchLang = "";
            }
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
    width: 100%;
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    .all-projects__filters &, .project-info__drop-menu & {
        height: 28px;
    }
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
        .all-projects__filters & {
            border-right: none;
            width: 76%;
            height: 23px;
        }
        .project-info__drop-menu & {
            width: 80%;
            height: 23px;
            border-right: none;
            padding: 3px 10px;
            opacity: 0.5;
        }
    }
    .arrow-button {
        width: 18%;
        display: flex;
        justify-content: center;
        align-items: center;
        .all-projects__filters & {
            border-left: 1px solid #68573E;
            width: 24%;
        }
        .project-info__drop-menu & {
            width: 20%;
            border-left: 1px solid #68573E;
        }
        img {
            padding-right: 2px;
        }
        .reverse-Icon {
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
            opacity: 1;
            padding: 2px 5px;
        }
    }
    .project-info__drop-menu & {
        .no-opacity {
            opacity: 1;
        }
    }
}
.drop-select {
    position: absolute;
    width: 100%;
    background-color: white;
    z-index: 5;
    border: 1px solid #BFB09D;
    border-radius: 5px;
    .drop {
        font-size: 14px;
        width: 100%;
        border-top: 1px solid #BFB09D;
        max-height: 150px;
        overflow-y: overlay;
        overflow-x: hidden;
        background-color: white;
        &__item {
            display: flex;
            align-items: center;
            padding: 5px 2px;
            border-bottom: .5px solid #BFB09D;
            cursor: pointer;
            transition: all 0.4s;
            &:last-child {
                border: none;
            }
            &:hover {
                background-color: rgba(191, 176, 157, 0.363);
            }
            .all-projects__filters & {
                font-size: 12px;
            }
        }
        &__name {
            max-width: 90%;
        }
        .inner-component & {
            max-height: 118px;
            border-bottom: 1px solid #BFB09D;
            span {
                width: 88%;
            }
        }
    }
    .inner-component & {
        border: none;
        border-radius: 0;
        height: 100%;
        z-index: 4;
    }
    .all-projects__filters &, .project-info__drop-menu & {
        border: 1px solid #67573E;
        overflow: hidden;
    }
    .search {
        width: 100%;
        box-sizing: border-box;
        padding: 5px 3px;
        color: #67573E;
        outline: none;
        box-shadow: inset 0 0 5px rgba(104, 87, 62, 0.5);
        border: 1px solid rgba(104, 87, 62, 0.3);
        border-right: none;
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
