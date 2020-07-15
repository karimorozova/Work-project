<template lang="pug">
    .drop-select(v-click-outside="outClick")
        .select
            span.selected(v-if="selectedLang") {{ selectedLang.lang }}
            span.selected.no-choice(v-else) Options
            .arrow-button(@click="showLangs")
                img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseIcon: droppedLang}")
        input.search(v-if="droppedLang" v-model="searchLang" placeholder="Search" @click.stop="stopPropagation")        
        .drop(v-if="droppedLang")
            .drop__item( v-for="(language, index) in filteredLangs" @click.stop="changeLang(index)")
                span {{ language.lang }}
</template>

<script>
import ClickOutside from "vue-click-outside";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        selectedLang: {
            type: [ Object, String ]
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
            droppedLang: false,
            errors: [],
            searchLang: ''
        }
    },
    methods: {
        showLangs(event) {
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
            this.droppedLang = !this.droppedLang;
            this.$emit('scrollDrop', {drop: this.droppedLang, index: this.parentIndex, offsetTop: top, offsetHeight: height})
        },
        outClick() {
            this.droppedLang = false;
            this.$emit('scrollDrop', {drop: this.droppedLang, offsetTop: 0, offsetHeight: 0})
        },
        changeLang(index) {
            this.$emit("chosenLang", {lang: this.filteredLangs[index], index: this.parentIndex});
            this.outClick();
        },
        stopPropagation() {
            return
        },
        ...mapActions({
            alertToggle: "alertToggle",
        })
    },
    computed: {
        ...mapGetters({
            languages: "getAllLanguages"
        }),
        filteredLangs() {
            let result = this.languages;
            if(this.addAll) {
                result.unshift({lang: "All", symbol: "All"})
            }
            result = result.filter(item => {
                if(item.lang.toLowerCase().indexOf(this.searchLang.toLowerCase()) != -1) {
                    return item
                }
            })
            return result;
        }
    },
    directives: {
        ClickOutside
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
    .vendors-table__drop-menu & {
        width: 100%;
        border: none;
        height: 30px;
    }
    .selected {
        border-right: 1px solid $light-brown;
        width: 80%;
        padding: 3px 5px;
        font-size: 14px;
        max-height: 28px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        overflow: auto;
        .vendors-table__drop-menu & {
            width: 80%;
            max-height: 30px;
        }
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
    .inner-component & {
        border: none;
        border-radius: 0;
        box-shadow: inset 0 0 8px $brown-shadow;
        height: 26px;
        border: 1px solid #BFB09D;
        .selected {
            padding: 2px 5px;
        }
    }
    .no-choice {
        opacity: 0.5;
    }
}
.drop-select {
    position: absolute;
    border: 1px solid $main-color;
    border-radius: 5px;
    width: 100%;
    overflow: hidden;
    z-index: 6;
    box-sizing: border-box;
    .drop {
        font-size: 14px;        
        border-top: 1px solid $light-brown;
        max-height: 150px;
        overflow-y: scroll;
        overflow-x: hidden;
        background-color: $white;
        box-sizing: border-box;
        &__item {
            display: flex;
            align-items: center;
            padding: 5px 0 5px 5px;
            border-bottom: .5px solid $light-brown;
            cursor: pointer;
            transition: all 0.4s;
            &:last-child {
                border: none;
            }
            &:hover {
                background-color: $active-background;
            }
        }
        .inner-component & {
            max-height: 118px;
            border: 1px solid #BFB09D;
            span {
                width: 88%;
            }
        }
        .vendors-table__drop-menu & {
            border: 1px solid $light-brown;
        }
    }
    .inner-component & {
        height: 100%;
    }
    .vendors-table__drop-menu & {
        border: none;
        border-radius: 0;
        z-index: 0;
    }
    .search {
        width: 100%;
        outline: none;
        border: none;
        padding: 5px 0 5px 5px;
        color: $main-color;
        box-sizing: border-box;
        box-shadow: inset 0 0 5px $main-color;
        .inner-component & {
            width: 88%;
        }
    }
}

</style>
