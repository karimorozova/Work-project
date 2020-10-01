<template lang="pug">
    .copywriting-language
        TitleInput(title="SELECT LANGUAGE:" :isAsterisk="true")
            .drop-menu
                SingleLangsMenu(
                    :languages="languages"
                    :selectedLang="selectedTarget"
                    @selectLanguage="selectLanguage"
                    )
</template>

<script>
import TitleInput from "../TitleInput";
import SingleLangsMenu from "../SingleLangsMenu";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
      languages: {
        type: Array
      }
    },
    data() {
        return {
            selectedTarget: {lang: "Select"},
        }
    },
    methods: {
        ...mapActions([
            "setOrderDetail"
        ]),
        selectLanguage({language}) {
            this.selectedTarget = language;
            this.setOrderDetail({prop: 'targets',value: [language]});
        }
    },
    computed: {
        ...mapGetters({
            clientLanguages: "getCombinations",
            orderDetails: "getOrderDetails"
        }),
        targets() {
            let result = [];
            if(this.orderDetails.targets && this.orderDetails.targets.length) {
                result = this.selectedTargets.map(item => item.symbol)
            }
            return result;
        },
    },
    components: {
        SingleLangsMenu,
        TitleInput
    }
}
</script>

<style lang="scss" scoped>

.drop-menu {
    position: relative;
    width: calc(100% - 12px);
    height: 34px;
    padding-left: 12px;
    margin-top: 10px;
    box-sizing: border-box;
}

</style>
