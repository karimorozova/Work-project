<template lang="pug">
    .dropSelect(v-click-outside="outClick")
        .select
            span.selected {{ selectedLang.lang }}
            .arrowButton(@click="showLangs")
                img(src="../assets/images/open-close-arrow-brown.png" :class="{reverseIcon: droppedLang}")
        .drop(v-if="droppedLang")
            span.drop__item(v-for="(language, index) in languages" @click="changeLang(index)") {{ language.lang }}
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
    props: {
        selectedLang: {
            type: Object
        },
        parentIndex: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            languages: [],
            droppedLang: false,
            errors: []
        }
    },
    methods: {
        showLangs() {
            this.droppedLang = !this.droppedLang;
            this.$emit('scrollDrop', {drop: this.droppedLang, index: this.parentIndex})
        },
        async getLanguages() {
            await this.$http.get('api/languages')
            .then(response => {
                let sortedArray = response.body;
                var dialectArr = [];
                for (let i = 0; i < sortedArray.length; i++) {
                    if (sortedArray[i].dialects.length) {
                        for (let j = 0; j < sortedArray[i].dialects.length; j++) {
                            dialectArr.push(sortedArray[i].dialects[j]);
                        }
                    }
                }
                dialectArr.forEach(item => {
                    sortedArray.push(item);
                });
                sortedArray.sort( (a,b) => {
                    if(a.lang < b.lang) return -1;
                    if(a.lang > b.lang) return 1;
                });
                this.languages = sortedArray;
                if(this.selectedLang.lang == "All") {
                    this.languages.unshift({lang: "All"})
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
            this.$emit("chosenLang", {data: this.languages[index], index: this.parentIndex})
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
    border: 1px solid #BFB09D;
    border-radius: 5px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    .selected {
        border-right: 1px solid #BFB09D;
        width: 82%;
        padding: 3px 5px;
        font-size: 14px;
        opacity: 0.7;
        height: 31px;
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
        z-index: 15;
        &__item {
            padding: 2px;
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
            max-height: 130px;
        }
    }
    .innerComponent & {
        height: 100%;
    }
}
</style>
