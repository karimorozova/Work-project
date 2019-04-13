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
            selectedTargets: []
        }
    },
    methods: {
        ...mapActions({
            setOrderDetail: "setOrderDetail"
        }),
        setSource({ language }) {
            this.setOrderDetail({prop: 'source', value: language});
        },
        setTargets({ language }) {
            const position = this.targets.indexOf(language.symbol);
            if(position !== -1) {
                this.selectedTargets.splice(position, 1);
            } else {
                this.selectedTargets.push(language);
            }
            this.setOrderDetail({prop: 'targets', value: this.selectedTargets});
        }
    },
    computed: {
        ...mapGetters({
            clientLanguages: "getCombinations",
            orderDetails: "getOrderDetails"
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
            let result = [];
            if(this.orderDetails.targets && this.orderDetails.targets.length) {
                result = this.selectedTargets.map(item => item.symbol)
            }
            return result;
        },
        selectedSource() {
            return this.orderDetails.source || {lang: 'Select'};
        }
    },
    components: {
        TitleInput,
        SingleLangsMenu,
        MultiLangsMenu
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
        box-sizing: border-box;
    }
    &__source, &__target {
        width: 45%;
    }
    &__drop-menu {
        position: relative;
    }
}

</style>
