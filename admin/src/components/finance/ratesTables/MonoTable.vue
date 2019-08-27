<template lang="pug">
    .mono-table
        .mono-table__table
            RatesTable(
                :fields="tableFields"
                :tableData="fullInfo"
                :areErrors="areErrors"
                :errors="errors"
                @closeErrors="closeErrors"
                :bodyClass="ratesBodyClass"
            )
                .mono-table__header(slot="headerCheck" slot-scope="{ field }")
                    CheckBox(:isChecked="isAllChecked" @check="(e) => toggleAllChecks(e, true)" @uncheck="(e) => toggleAllChecks(e, false)" :isWhite="true")
                .mono-table__header(slot="headerLanguage" slot-scope="{ field }") {{ field.label }}
                .mono-table__header(slot="headerPackage" slot-scope="{ field }") {{ field.label }}
                .mono-table__header(slot="headerIndustry" slot-scope="{ field }") {{ field.label }}
                template(v-for="(step, stepIndex) in selectedSteps" :slot="'headerStep'+(stepIndex+1)" slot-scope="{ field }")
                    .mono-table__header {{ field.label }}
                .mono-table__header(slot="headerIcons" slot-scope="{ field }") {{ field.label }}
                .mono-table__data(slot="check" slot-scope="{ row, index }")
                    CheckBox(:isChecked="row.isChecked" @check="(e) => toggleCheck(e, index, true)" @uncheck="(e) => toggleCheck(e, index, false)")
                template(slot="language" slot-scope="{ row, index }")
                    .mono-table__data(v-if="currentActive !== index") {{ row.target.lang }}
                    .mono-table__drop-menu(v-else)
                        LanguagesSelect(
                            @scrollDrop="scrollDrop" 
                            :selectedLangs="[currentInfo.target.symbol]" 
                            :addAll="false"
                            customClass="table-drop"
                            @chosenLang="setTarget")
                template(slot="package" slot-scope="{ row, index }")
                    .mono-table__data(v-if="currentActive !== index") {{ row.packageSize }}
                    .mono-table__drop-menu(v-else)
                        SelectSingle(
                            @scrollDrop="scrollDrop"
                            :options="packages"
                            :selectedOption="currentInfo.packageSize" 
                            customClass="table-drop-menu rates-table"
                            @chooseOption="setPackage")
                template(slot="industry" slot-scope="{ row, index }")
                    template(v-if="currentActive !== index")
                        .mono-table__data(v-if="isAllIndusties(row.industries)") All
                        .mono-table__data(v-else)
                            img.mono-table__image(v-for="elem of row.industries" :src="domain + elem.icon")
                    template(v-if="currentActive === index")
                        .mono-table__drop-menu
                            IndustrySelect(
                                :entity="entity"
                                @scrollDrop="scrollDrop"
                                :selectedInd="currentInfo.industries" 
                                :filteredIndustries="industriesNames"
                                customClass="table-drop"
                                @chosenInd="setIndustry")
                template(v-for="step in selectedSteps" :slot="step.symbol" slot-scope="{ row, index }")
                    .mono-table__data.mono-table_space-between
                        span.mono-table__text.mono-table_width-33(v-if="currentActive !== index") {{ row.rates[step._id].value }}
                        input.mono-table__input(v-else v-model="currentInfo.rates[step._id].value" maxlength="6")
                        span.mono-table__minimum.mono-table_width-33
                            span.mono-table__text min -&nbsp
                            span.mono-table__text(v-if="currentActive !== index") {{ row.rates[step._id].min }}
                            input.mono-table__input.mono-table_width-40(v-else v-model="currentInfo.rates[step._id].min" maxlength="5")
                        Toggler(:isActive="isTogglerActive(row.rates, step._id, index)" :isDisabled="currentActive !== index" :customClass="{'toggler_opacity-07': currentActive !== index}" @toggle="toggleActive(step._id)")
                .mono-table__icons(slot="icons" slot-scope="{ row, index }")
                    img.mono-table__icon(v-for="(icon, key) in icons" :src="icon.icon" :class="{'mono-table_opacity': isActive(key, index)}" @click="makeAction(key, index)")
        .mono-table__add
            Add(@add="addNewRow")
</template>

<script>
import LanguagesSelect from "@/components/LanguagesSelect";
import IndustrySelect from "@/components/IndustrySelect";
import SelectSingle from "@/components/SelectSingle";
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
        entity: { type: Object },
        isClient: { type: Boolean, default: false },
        isVendor: { type: Boolean, default: false },
        industries: { type: Array, default: () => [] },
        selectedSteps: { type: Array, default: () => [] },
        packages: { type: Array, default: () => [] }
    },
    data() {
        return {
            fields: [
                {label: "", headerKey: "headerCheck", key: "check", width: 28, padding: "0"},
                {label: "Language", headerKey: "headerLanguage", key: "language", width: 212, padding: "0"},
                {label: "Package", headerKey: "headerPackage", key: "package", width: 159, padding: "0"},
                {label: "Industry", headerKey: "headerIndustry", key: "industry", width: 194, padding: "0"},
                {label: "", headerKey: "headerStep1", key: "copywriting", width: 233, padding: "0", isStepTitle: true},
                {label: "", headerKey: "headerIcons", key: "icons", width: 129, padding: "0"},
            ],
            defaultStepSymbol: "copywriting",
            rateForm: 'monoRates',
            ratesBodyClass: 'mono-rates-table'
        }
    },
    methods: {
        ...mapActions([
            'getSteps',
            'alertToggle',
            'toggleRateCheck',
            'toggleAllRatesCheck',
            'savePricelistRates',
            'saveClientRates',
            'saveVendorRates',
            'deletePriceRate',
            'deleteClientRate',
            'deleteVendorRate'
        ]),
        async checkErrors() {
            this.errors = [];
            if(!this.currentInfo.target.lang) this.errors.push("Please, set the language");
            if(!this.currentInfo.packageSize) this.errors.push("Please, set the package size");
            if(this.notValidRates()) this.errors.push("Please, enter valid rates values");
            if(this.errors.length) {
                return this.areErrors = true;
            }
            await this.save();
        },
        
    },
    computed: {
        ...mapGetters({
            steps: "getVuexSteps",
            fullInfo: "getMonoRates",
            currentPrice: "getCurrentPrice"
        })
    },
    components: {
        LanguagesSelect,
        IndustrySelect,
        SelectSingle,
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

.mono-table {
    box-sizing: border-box;
    width: 100%;
    &__table {
        max-width: 972px;
        overflow-x: auto;
        position: relative;
    }
    &__add {
        margin: 15px 0 10px 0;
    }
    &__drop-menu {
        position: relative;
        height: 100%;
    }
    &__data {
        @extend %table-data;
        height: 34px;
        flex-wrap: wrap;
        overflow-y: auto;
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
        align-items: center;
        box-sizing: border-box;
    }
    &__input {
        box-sizing: border-box;
        padding-left: 2px;
        width: 50px;
        border: 1px solid $light-brown;
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
    &_width-40 {
        width: 40px;
    }
    &_width-33 {
        width: 33%;
    }
    &_space-between {
        justify-content: space-between;
    }
    &_opacity {
        opacity: 1;
    }
}

</style>
