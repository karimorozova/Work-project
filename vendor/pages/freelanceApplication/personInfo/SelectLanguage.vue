<template lang="pug">
    .native-language
        .native-language__title {{ label }}
        .drop-select(v-click-outside="outClick")
            .select(@click="toggleLangs")
                span.selected.chosen-lang(v-if="selectedLang.lang") {{ selectedLang.lang }}
                span.selected(v-else) {{ placeholder }}
                .arrow-button
                    img(src="../../../assets/images/arrow_open.png" :class="{'reverse-icon': droppedLang}")
            input.search(v-if="droppedLang" v-model="searchLang" placeholder="Search")        
            .drop(v-if="droppedLang")
                .drop__item(v-for="(language, index) in filteredLangs" @click="chooseLang(index)" :class="{'active-lang': selectedLang.lang == language.lang}")
                    span {{ language.lang }}
</template>

<script>
import ClickOutside from "vue-click-outside";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        selectedLang: {
            type: Object
        },
        refersTo: {
            type: String,
            default: ""
        },
        label: {
            type: String,
            default: ""
        },
        placeholder: {
            type: String,
            default: ""
        },
        parentIndex: {
            type: Number
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
        ...mapActions({
            getAllLanguages: 'getAllLanguages'
        }),
        toggleLangs(event) {
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
            this.$emit('scrollDrop', {drop: this.droppedLang, offsetTop: top, offsetHeight: height})
        },
        outClick() {
            this.droppedLang = false;
            this.searchLang = "";
        },
        chooseLang(index) {
            this.$emit("chooseLang", {lang: this.filteredLangs[index], index: this.parentIndex, refersTo: this.refersTo});
            this.outClick();
        }
    },
    computed: {
        ...mapGetters({
            allLanguages: 'getLangs',
        }),
        filteredLangs() {
            let result = this.allLanguages.filter(item => {
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
    created() {
        this.getAllLanguages();
    },
    mounted() {
    }
}
</script>

<style lang="scss" scoped>

.native-language__title {
    font-size: 12px;
    margin-bottom: 5px;
}

.drop-select {
    position: absolute;
    left: 0;
    width: 268px;
    border: 1px solid #67573E;
    border-radius: 15px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 3px 8px rgba(103, 87, 62, 0.7);
    .language-pairs & {
        width: 255px;
    }
    .drop {
        font-size: 14px;
        width: 100%;
        max-height: 100px;
        overflow-y: scroll;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        background-color: white;
        z-index: 6;
        &__item {
            display: flex;
            align-items: center;
            padding: 12px 4px;
            border-bottom: .5px solid #BFB09D;
            cursor: pointer;
            transition: all 0.4s;
            &:last-child {
                border: none;
            }
            &:hover {
                background-color: rgba(191, 176, 157, 0.363);
            }
        }
        .active-lang {
            background-color: rgba(102, 86, 61, 0.7);
            color: #FFF;
        }
    }
    .search {
        z-index: 50;
        width: 100%;
        padding: 5px 3px;
        color: #67573E;
        outline: none;
        box-shadow: inset 0 0 5px rgba(125, 138, 180, 0.623);
        border: 1px solid rgba(125, 138, 180, 0.466);
        border-right: none;
    }
}

.select {
    border-radius: 15px;
    width: 100%;
    height: 40px;
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    .selected {
        width: 80%;
        padding: 3px 10px;
        font-size: 14px;
        opacity: 0.7;
        max-height: 40px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        overflow: auto;
    }
    .chosen-lang {
        opacity: 1;
    }
    .arrow-button {
        width: 20%;
        display: flex;
        justify-content: center;
        align-items: center;
        img {
            padding-right: 2px;
        }
        .reverse-icon {
            transform: rotate(180deg);
        }
    }
}

</style>
