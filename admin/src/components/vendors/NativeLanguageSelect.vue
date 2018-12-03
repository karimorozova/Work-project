<template lang="pug">
    .drop-select(v-click-outside="outClick")
        .select
            span.selected(v-if="selectedLang") {{ selectedLang.lang }}
            span.selected(v-else) Options
            .arrow-button(@click.stop="showLangs")
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
        outClick() {
            this.droppedLang = false;
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
    border: 1px solid $main-color;
    border-radius: 5px;
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
        width: 82%;
        padding: 3px 5px;
        font-size: 14px;
        opacity: 0.7;
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
        width: 18%;
        display: flex;
        justify-content: center;
        align-items: center;
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
            opacity: 1;
            padding: 2px 5px;
        }
    }
}
.drop-select {
    position: relative;
    .drop {
        font-size: 14px;
        position: absolute;
        width: 100%;
        border: 1px solid $light-brown;
        max-height: 150px;
        overflow-y: scroll;
        overflow-x: hidden;
        background-color: $white;
        z-index: 15;
        padding-top: 29px;
        box-sizing: border-box;
        &__item {
            display: flex;
            align-items: center;
            padding: 5px 2px;
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
            padding-top: 28px;
            span {
                width: 88%;
            }
        }
    }
    .inner-component & {
        height: 100%;
    }
    .search {
        position: absolute;
        z-index: 50;
        width: 100%;
        padding: 5px 3px;
        color: $main-color;
        outline: none;
        box-shadow: inset 0 0 5px $brown-shadow;
        border: 1px solid $light-brown;
        box-sizing: border-box;
        .inner-component & {
            width: 88%;
        }
    }
}

</style>
