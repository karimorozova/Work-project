<template lang="pug">
    .drop-select(v-click-outside="outClick" :class="customClass")
        .select
            span.selected(v-if="selectedLangs.length === 1" :class="{'no-opacity': selectedLangs.length}" @click="showLangs") {{ selectedLangs[0] }}
            span.selected(v-if="!selectedLangs.length") {{ placeholder }}
            .selected(v-if="selectedLangs.length > 1" :class="{'no-opacity': selectedLangs.length}")
                span(v-for="lang in selectedLangs") {{ lang }}; &nbsp;
            .arrow-button(@click="showLangs")
                img(src="../assets/images/open-close-arrow-brown.png" :class="{'reverse-Icon': isOpened}")
        input.search(v-if="isOpened" v-model="searchLang" placeholder="Search")
        .drop(v-if="isOpened")
            .drop__item( v-for="(language, index) in filteredLangs" @click="changeLang(index)")
                .checkbox
                    .checkbox__check(:class="{checked: selectedLangs.indexOf(language.symbol) != -1}")
                span.drop__name(:class="{'left-pad': !isCheckboxShown}") {{ language.lang }}
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
    props: {
        selectedLangs: {
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
        },
        customClass: {
            type: String
        },
        externalLanguages: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            languages: [],
            isOpened: false,
            searchLang: ''
        }
    },
    methods: {
        showLangs(event) {
            let elementsObj = event.composedPath();
            const classNames = ["table__tbody-row", "table__body-row"];
            let tr = elementsObj.find(item => {
                if(item.localName === "tr" || classNames.indexOf(item.className) !== -1) {
                    return item;
                }
            });
            let top = 0;
            let height = 0;
            if(tr) {
                top = tr.offsetTop;
                height = tr.offsetHeight;
            }
            this.isOpened = !this.isOpened;
            this.$emit('scrollDrop', {drop: this.isOpened, offsetTop: top, offsetHeight: height});
            this.searchLang = "";
            if(this.isOpened) {
                setTimeout(() => {
                    this.setTheFocusOnSearch();
                }, 0);
            }
        },
        setTheFocusOnSearch() {
            document.querySelector(".search").focus();
            document.querySelector(".search").select();
        },
        async getLanguages() {
            try {
                const result = await this.$http.get('/api/languages');
                let sortedArray = result.body;
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
            } catch(e) {
                console.log(e);
            }
        },
        outClick() {
            this.isOpened = false;
            this.searchLang = "";
        },
        changeLang(index) {
            this.$emit("chosenLang", {lang: this.filteredLangs[index], index: this.parentIndex});
            if(this.single) {
                this.isOpened = false;
                this.searchLang = "";
            }
        }
    },
    computed: {
        filteredLangs() {
            let result = this.externalLanguages.length ? this.externalLanguages : this.languages;
            if(this.langFilter.length) {
                result = result.filter(item => this.langFilter.indexOf(item._id) !== -1);
            }
            if(result.length) {
                result = result.filter(item => {
                    if(item.lang.toLowerCase().indexOf(this.searchLang.toLowerCase()) != -1) {
                        return item
                    }
                })
            }
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
    height: 32px;
    .all-projects__filters & {
        height: 28px;
    }
    .selected {
        border-right: 1px solid #67573E;
        width: 82%;
        padding: 0 5px;
        font-size: 14px;
        opacity: 0.7;
        height: 100%;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        overflow: auto;
        .all-projects__filters & {
            border-right: none;
            width: 76%;
        }
        .inner-component & {
            border-right: 1px solid #bfb09d;
        }
    }
    .arrow-button {
        width: 18%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        .all-projects__filters & {
            border-left: 1px solid #68573E;
            width: 24%;
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
    .no-opacity {
        opacity: 1;
    }
}
.drop-select {
    position: absolute;
    width: 100%;
    background-color: white;
    z-index: 5;
    box-sizing: border-box;
    border: 1px solid #67573E;
    border-radius: 5px;
    .drop {
        font-size: 14px;
        width: 100%;
        border-top: 1px solid #BFB09D;
        max-height: 150px;
        overflow-y: overlay;
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
            border: 1px solid #BFB09D;
            border-top: none;
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
    .all-projects__filters & {
        border: 1px solid #67573E;
        overflow: hidden;
    }
    .search {
        width: 100%;
        box-sizing: border-box;
        padding: 5px 0 5px 5px;
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
            left: 4px;
            transform: rotate(-58deg);
        }
    }
}

.tasks-data__langs {
  overflow: hidden;
  .select {
    height: 28px;
    cursor: pointer;
    .selected {
      width: 80%;
    }
    .arrow-button {
      width: 20%;
    }
  }
}

.tasks-data__langs-mod {
  overflow: hidden;
  box-shadow: 0 2px 15px rgba(104, 87, 62, .5);
  border-radius: 10px;
  border: none;
  .select {
    height: 36px;
    .selected {
      width: 90%;
      border-right: none;
      padding-left: 10px; 
    }
    .arrow-button {
      width: 10%;
    }
  }
}

.vendors-filter {
    .select {
        height: 28px;
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
        height: 100%;
        box-shadow: inset 0 0 7px rgba(104, 87, 62, 0.5);
    }
}

</style>
