<template lang="pug">
.languages
    .languages__list(v-if="languages.length" :tabIndex="tabIndex" @keydown="(e) => findLanguage(e)")
        .languages__item(v-for="(language, i) in languages" 
            @mousedown="(e)=>preventShift(e, i)" 
            :class="{chosen: language.check}"
            @dblclick="forceMove(i)") {{ language.lang }}
    .languages__empty(v-if="!languages.length") No languages
</template>

<script>
export default {
    props: {
        languages: {
            type: Array,
            default: () => []
        },
        langSearchValue: {
            type: String
        },
        tabIndex: {
            type: String
        }
    },
    data() {
        return {

        }
    },
    methods: {
        choose(i) {
            this.languages[i].check = !this.languages[i].check; 
            this.languages.forEach((item, index) => {
                if(i !== index) item.check = false;
            });
        },
        preventShift(e, i) {
            if(e.shiftKey) {
                e.preventDefault();
                return this.selectMany(i);
            };
            if(e.ctrlKey) {
                this.languages[i].check = !this.languages[i].check;
            } else {
                this.choose(i);
            }
        },
        selectMany(i) {
            const checkedIndex = this.languages.findIndex(item => item.check);
            if(checkedIndex === -1) return this.choose(i);
            if(i < checkedIndex) return this.checkAllBefore(i, checkedIndex);
            if(i >= checkedIndex) return this.checkAllAfter(i, checkedIndex);
        },
        checkAllBefore(i, checkedIndex) {
            for(let index = i; index < checkedIndex; index++) {
                this.languages[index].check = true;
            }
        },
        checkAllAfter(i, checkedIndex) {
            for(let index = i; index >= checkedIndex; index--) {
                this.languages[index].check = true;
            }
        },
        forceMove(i) {
            this.$emit("forceMove", { index: i });
        },
        clearLangSearch() {
            this.$emit("clearLangSearch");
        },
        findLanguage(e) {
            this.$emit("searching");
            if(e.keyCode === 27) {
                this.$emit("clearSearch");
            } 
            if(e.keyCode <= 90 && e.keyCode >= 65) {
                this.$emit("searchValue", {value: e.key});
            }
            if(e.keyCode === 8) {
                this.$emit("slice");
            }
            if(!this.langSearchValue) {
                this.$emit("sortLangs");
            } 
            this.$emit("sortBySearch", {value: this.langSearchValue});            
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.languages {
    height: 187px;
    width: 191px;
    border: 1px solid #67573E;
    border-radius: 10px;
    overflow: hidden;
    box-sizing: border-box;
    &__empty {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0.5;
    }
    &__list {
        width: 100%;
        height: 95%;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        padding: 5px 0;
    }
    &__item {
        font-size: 14px;
        padding: 3px 10px;
        cursor: pointer;
        transition: all 0.3s;
        &:hover {
            background-color: rgb(245, 238, 229);
        }
        user-select: none;
    }
    .chosen {
        background-color: #DFD7CD;
    }
}

</style>
