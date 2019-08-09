<template lang="pug">
    .duo-table
        .duo-table__table
            RatesTable(
                :fields="tableFields"
                :tableData="fullInfo"
                :areErrors="areErrors"
                :errors="errors"
                @closeErrors="closeErrors"
            )
                .duo-table__header(slot="headerCheck" slot-scope="{ field }")
                    CheckBox(:isChecked="isAllChecked" @check="(e) => toggleAllChecks(e, true)" @uncheck="(e) => toggleAllChecks(e, false)" :isWhite="true")
                .duo-table__header(slot="headerSource" slot-scope="{ field }") {{ field.label }}
                .duo-table__header(slot="headerTarget" slot-scope="{ field }") {{ field.label }}
                .duo-table__header(slot="headerIndustry" slot-scope="{ field }") {{ field.label }}
                template(v-for="(step, stepIndex) in selectedSteps" :slot="'headerStep'+(stepIndex+1)" slot-scope="{ field }")
                    .duo-table__header {{ field.label }}
                .duo-table__header(slot="headerIcons" slot-scope="{ field }") {{ field.label }}
                .duo-table__data(slot="check" slot-scope="{ row, index }")
                    CheckBox(:isChecked="row.isChecked" @check="(e) => toggleCheck(e, index, true)" @uncheck="(e) => toggleCheck(e, index, false)")
                template(slot="source" slot-scope="{ row, index }")
                    .duo-table__data(v-if="currentActive !== index") {{ row.source.lang }}
                    .duo-table__drop-menu(v-else)
                        LanguagesSelect(
                            @scrollDrop="scrollDrop" 
                            :selectedLangs="[currentInfo.target.symbol]" 
                            :addAll="false"
                            customClass="table-drop"
                            @chosenLang="setTarget")
                template(slot="target" slot-scope="{ row, index }")
                    .duo-table__data(v-if="currentActive !== index") {{ row.target.lang }}
                    .duo-table__drop-menu(v-else)
                        LanguagesSelect(
                            @scrollDrop="scrollDrop" 
                            :selectedLangs="[currentInfo.source.symbol]" 
                            :addAll="false"
                            customClass="table-drop"
                            @chosenLang="setSource")
                template(slot="industry" slot-scope="{ row, index }")
                    template(v-if="currentActive !== index")
                        .duo-table__data(v-if="isAllIndusties(row.industries)") All
                        .duo-table__data(v-else)
                            img.duo-table__image(v-for="elem of row.industries" :src="domain + elem.icon")
                    template(v-if="currentActive === index")
                        .duo-table__drop-menu
                            IndustrySelect(
                                @scrollDrop="scrollDrop"
                                :selectedInd="currentInfo.industries" 
                                :filteredIndustries="industriesNames"
                                customClass="table-drop"
                                @chosenInd="setIndustry")
                template(v-for="step in selectedSteps" :slot="step.symbol" slot-scope="{ row, index }")
                    .duo-table__data.duo-table_space-between
                        span.duo-table__text(v-if="currentActive !== index") {{ row.rates[step._id].value }}
                        input.duo-table__input(v-else v-model="currentInfo.rates[step._id].value")
                        span.duo-table__minimum
                            span.duo-table__text min -&nbsp
                            span.duo-table__text(v-if="currentActive !== index") {{ row.rates[step._id].min }}
                            input.duo-table__input.duo-table_width-50(v-else v-model="currentInfo.rates[step._id].min")
                        Toggler(:isActive="row.rates[step._id].active" :isDisabled="currentActive !== index" :customClass="{'toggler_opacity-07': currentActive !== index}" @toggle="toggleActive(step._id)")
                .duo-table__icons(slot="icons" slot-scope="{ row, index }")
                    img.duo-table__icon(v-for="(icon, key) in icons" :src="icon.icon" :class="{'duo-table_opacity': isActive(key, index)}" @click="makeAction(key, index)")
        .duo-table__add
            Add(@add="addNewRow")
</template>

<script>
import LanguagesSelect from "@/components/LanguagesSelect";
import IndustrySelect from "@/components/IndustrySelect";
import CheckBox from "@/components/CheckBox";
import RatesTable from './RatesTable';
import Toggler from '@/components/Toggler';
import Add from '@/components/Add';
import crudIcons from '@/mixins/crudIcons';
import scrollDrop from "@/mixins/scrollDrop";
import ratesTable from "@/mixins/ratesTable";
import { mapGetters, mapActions } from "vuex";

export default {
    mixins: [crudIcons, scrollDrop, ratesTable],
    props: {
        fullInfo: { type: Array, default: () => [] },
        industries: { type: Array, default: () => [] },
        selectedSteps: { type: Array, default: () => [] },
    },
    data() {
        return {
            fields: [
                {label: "", headerKey: "headerCheck", key: "check", width: 28, padding: "0"},
                {label: "Source Language", headerKey: "headerSource", key: "source", width: 212, padding: "0"},
                {label: "Target Language", headerKey: "headerTarget", key: "target", width: 159, padding: "0"},
                {label: "Industry", headerKey: "headerIndustry", key: "industry", width: 194, padding: "0"},
                {label: "", headerKey: "headerStep1", key: "copywriting", width: 233, padding: "0", isStepTitle: true},
                {label: "", headerKey: "headerIcons", key: "icons", width: 145, padding: "0"},
            ],
            defaultStepSymbol: "translation"
        }
    },
    methods: {
        ...mapActions({
            getSteps: "getSteps",
            alertToggle: "alertToggle",
            toggleRateCheck: "toggleRateCheck",
            toggleAllRatesCheck: "toggleAllRatesCheck",
            savePricelistRates: "savePricelistRates",
            deletePriceRate: "deletePriceRate"
        }),
        async checkErrors() {
            this.errors = [];
            if(!this.currentInfo.source.lang) this.errors.push("Please, set the source language");
            if(!this.currentInfo.target.lang) this.errors.push("Please, set the target language");
            if(this.notValidRates()) this.errors.push("Please, enter valid rates values");
            if(this.errors.length) {
                return this.areErrors = true;
            }
            await this.save();
        }
    },
    computed: {
        ...mapGetters({
            steps: "getVuexSteps",
            currentPrice: "getCurrentPrice"
        })
    },
    components: {
        LanguagesSelect,
        IndustrySelect,
        CheckBox,
        RatesTable,
        Toggler,
        Add
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";
@import "../../../assets/styles/settingsTable.scss";

.duo-table {
    box-sizing: border-box;
    width: 100%;
    &__table {
        max-width: 972px;
        overflow-x: overlay;
        position: relative;
    }
    &__add {
        margin: 5px 0 10px 0;
    }
    &__drop-menu {
        position: relative;
        height: 100%;
    }
    &__data {
        @extend %table-data;
        height: 34px;
        flex-wrap: wrap;
        overflow-y: overlay;
    }
    &__editing-data {
        @extend %table-data;
        height: 34px;
        box-shadow: inset 0 0 7px $brown-shadow;
    }
    &__minimum {
        width: fit-content;
        max-width: 35%;
        display: flex;
        box-sizing: border-box;
    }
    &__input {
        box-sizing: border-box;
        width: 25%;
        border: none;
        outline: none;
        color: $main-color;
        background: transparent;
    }
    &__icons {
        @extend %table-icons;
    }
    &__icon {
        @extend %table-icon;
    }
    &__image {
        width: 18px;
        height: 18px;
        margin-right: 5px;
    }
    &_width-50 {
        width: 50%
    }
    &_space-between {
        justify-content: space-between;
    }
    &_opacity {
        opacity: 1;
    }
}

</style>
