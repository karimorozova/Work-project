<template lang="pug">
.language-pairs
    .language-pairs__row(v-for="(pair, main) in selectedLangPairs")
        .language-pairs__item
            SelectLanguage(
                refersTo="source"
                :parentIndex="main"
                placeholder="Source language"
                :selectedLang="pair.source"
                @chooseLang="setPairLanguage"
            )
        .language-pairs__image
            img(src="../../../assets/images/arrow_open.png")
        .language-pairs__item
            SelectLanguage(
                refersTo="target"
                :parentIndex="main"
                placeholder="Target language"
                :selectedLang="pair.target"
                @chooseLang="setPairLanguage"
            )
        .language-pairs__delete
            .language-pairs__button_rotated
                Add(
                    @makeAction="(e) => deleteElement(e, main)"
                )
            span.language-pairs__button-label_opacity Delete
    transition(name="slide-fade")
        .language-pairs__button(v-if="showAddButton")
            Add(
                @makeAction="addLanguagePair"
                )
            .language-pairs__button-label Add Language pair
</template>

<script>
import SelectLanguage from "./SelectLanguage";
import Add from "@/components/buttons/Add"

export default {
    data() {
        return {
            selectedLangPairs: [{ source: {}, target: {} }],
        }
    },
    methods: {
        setPairLanguage({lang, index, refersTo}) {
            this.selectedLangPairs[index][refersTo] = lang;
            const { source, target } = this.selectedLangPairs[index];
            if(source._id && target._id) {
                const langPairs = this.selectedLangPairs.map(item => {
                    return {source: item.source._id, target: item.target._id}
                })
                this.$emit("setLangPair", {langPairs: langPairs})
            }
        },
        addLanguagePair() {
            this.selectedLangPairs.push({
                source: {}, target: {}
            })
        },
        deleteElement(data, index) {
            if(this.selectedLangPairs.length > 1) {
                this.selectedLangPairs.splice(index, 1);
                const langPairs = this.selectedLangPairs.map(item => {
                    return {source: item.source._id, target: item.target._id}
                })
                this.$emit("setLangPair", {langPairs: langPairs})
            } else {
                this.selectedLangPairs = [{ source: {}, target: {} }];
                this.$emit("setLangPair", {langPairs: []})
            }
        }
    },
    computed: {
        showAddButton() {
            const pairs = this.selectedLangPairs;
            for(const pair of pairs) {
                if(!pair.source._id || !pair.target._id) {
                    return false
                }
            }
            return true
        }
    },
    components: {
        SelectLanguage,
        Add
    }
}
</script>

<style lang="scss" scoped>

.slide-fade-enter-active {
  transition: all .3s;
}
.slide-fade-enter, .slide-fade-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
.language-pairs {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    width: 100%;
    border: 1px solid #66563D;
    border-radius: 15px;
    justify-content: center;
    padding: 10px 0;
    &__row {
        box-sizing: border-box;
        display: flex;
        justify-content: space-around;
        padding: 0 10px 0 10px;
        width: 100%;
        @media (max-width: 450px) {
            flex-direction: column;
            margin-bottom: 10px;
        }
    }
    &__button {
        margin-top: 15px;
        display: flex;
        align-items: center;
        margin-left: 20px;
        opacity: 0.7;
        font-size: 12px;
        &_rotated {
            transform: rotate(45deg);
        }
    }
    &__item {
        box-sizing: border-box;
        width: 42%;
        margin-bottom: 40px;
        position: relative;
        transition: all 0.3s;
        @media (max-width: 450px) {
            width: 89%;
        }
    }
    &__image {
        transform: rotate(-90deg);
        width: 3%;
        display: flex;
        justify-content: center;
        align-items: center;
        @media (max-width: 450px) {
            width: 89%;
            transform: rotate(0);
            margin-top: 10px;
        }
    }
    &__button-label {
        margin-left: 5px;
    }
    &__button-label_opacity {
        opacity: 0;
        transition: all 0.2s;
        @media (max-width: 450px) {
            display: none;
        }
    }
    &__delete {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 3%;
        font-size: 12px;
        opacity: 0.7;
        &:hover {
            .language-pairs__button-label_opacity {
                opacity: 0.7;
            }
        }
    }
}

</style>
