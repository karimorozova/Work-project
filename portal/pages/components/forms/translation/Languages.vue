<template lang="pug">
    .languages
        TitleInput(title="SELECT LANGUAGES" :isAsterisk="true")
            .languages__menus
                .languages__source
                    .languages__label Source Language
                    .languages__drop-menu
                        SingleLangsMenu(:languages="sourceLangs" :selectedLang="selectedSource" @selectLanguage="setSource")
                .languages__target
                    .languages__label Target Language(s)
                    .languages__drop-menu
                        MultiLangsMenu(:languages="targetLangs" :selectedLangs="selectedTargets" @selectLanguage="setTargets")
</template>

<script>
import TitleInput from "../TitleInput";
import SingleLangsMenu from "../SingleLangsMenu";
import MultiLangsMenu from "../MultiLangsMenu";
import { mapGetters, mapActions } from "vuex";
import { lang } from 'moment';

export default {
    data() {
        return {
            selectedSource: {lang: "Select"},
            selectedTargets: []
        }
    },
    methods: {
        setDefaultSource() {
            if(this.sourceLangs.length) {
                this.selectedSource = this.sourceLangs.find(item => item.symbol === "EN-GB");
            }
        },
        setSource({ language }) {
            this.selectedSource = language;
        },
        setTargets({ language }) {
            const position = this.targets.indexOf(language.symbol);
            if(position !== -1) {
                return this.selectedTargets.splice(position, 1);
            }
            this.selectedTargets.push(language);
        }
    },
    computed: {
        ...mapGetters({
            clientLanguages: "getCombinations"
        }),
        sourceLangs() {
            return this.clientLanguages.map(item => item.source)
                .filter((item, index, arr) => {
                    return arr.map(lang => lang.symbol).indexOf(item.symbol) === index;
                });
        },
        targetLangs() {
            let result = this.clientLanguages.map(item => item.target)
                .filter((item, index, arr) => {
                    return arr.map(lang => lang.symbol).indexOf(item.symbol) === index;
                });
            if(this.selectedSource && this.selectedSource.lang !== "Select") {
                result = result.filter(item => item.symbol !== this.selectedSource.symbol);
            }
            return result;
        },
        targets() {
            return this.selectedTargets.length ? this.selectedTargets.map(item => item.symbol) : [];
        }
    },
    components: {
        TitleInput,
        SingleLangsMenu,
        MultiLangsMenu
    },
    mounted() {
        this.setDefaultSource();
    }
}
</script>

<style lang="scss" scoped>

.languages {
    width: 100%;
    &__label {
        margin-bottom: 5px;
        font-size: 12px;
    }
    &__menus {
        display: flex;
        justify-content: space-between;
        padding-left: 12px;
        margin-top: 10px;
    }
    &__source, &__target {
        width: 45%;
    }
    &__drop-menu {
        position: relative;
    }
}

</style>
