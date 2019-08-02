<template lang="pug">
    .mono-table
        .mono-table__table
            RatesTable(
                :fields="tableFields"
                :tableData="fullInfo"
                :areErrors="areErrors"
                :errors="errors"
                @closeErrors="closeErrors"
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
                                @scrollDrop="scrollDrop"
                                :selectedInd="currentInfo.industries" 
                                :filteredIndustries="industriesNames"
                                customClass="table-drop"
                                @chosenInd="setIndustry")
                template(v-for="step in selectedSteps" :slot="step.symbol" slot-scope="{ row, index }")
                    .mono-table__data.mono-table_space-between
                        span.mono-table__text(v-if="currentActive !== index") {{ row.rates[step._id].value }}
                        input.mono-table__input(v-else v-model="currentInfo.rates[step._id].value")
                        span.mono-table__minimum
                            span.mono-table__text min -&nbsp
                            span.mono-table__text(v-if="currentActive !== index") {{ row.rates[step._id].min }}
                            input.mono-table__input.mono-table_width-50(v-else v-model="currentInfo.rates[step._id].min")
                        Toggler(:isActive="row.rates[step._id].active" :isDisabled="currentActive !== index" :customClass="{'toggler_opacity-07': currentActive !== index}")
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
import { mapGetters, mapActions } from "vuex";

export default {
    mixins: [crudIcons, scrollDrop],
    props: {
        industries: { type: Array, default: () => [] },
        selectedSteps: { type: Array, default: () => [] }
    },
    data() {
        return {
            fields: [
                {label: "", headerKey: "headerCheck", key: "check", width: 28, padding: "0"},
                {label: "Language", headerKey: "headerLanguage", key: "language", width: 212, padding: "0"},
                {label: "Package", headerKey: "headerPackage", key: "package", width: 159, padding: "0"},
                {label: "Industry", headerKey: "headerIndustry", key: "industry", width: 194, padding: "0"},
                {label: "", headerKey: "headerStep1", key: "copywriting", width: 233, padding: "0", isStepTitle: true},
                {label: "", headerKey: "headerIcons", key: "icons", width: 145, padding: "0"},
            ],
            packages: [],
            domain: "localhost:3001",
            defaultStep: {},
            defaultStepSymbol: "copywriting",
            currentActive: -1,
            currentInfo: null,
            currentMin: "",
            areErrors: false,
            errors: []
        }
    },
    methods: {
        ...mapActions({
            getSteps: "getSteps",
            alertToggle: "alertToggle",
            toggleRateCheck: "toggleRateCheck",
            toggleAllRatesCheck: "toggleAllRatesCheck",
            saveMonoRates: "saveMonoRates"
        }),
        isScrollDrop(drop, elem) {
            return drop && this.fullInfo.length >= 4;
        },
        handleScroll() {
            let element = document.querySelector('.table__tbody');
            element.scrollTop = element.scrollHeight;
        },
        toggleCheck(e, index, bool) {
            const id = this.fullInfo[index]._id;
            this.toggleRateCheck({prop: 'monoRates', id, isChecked: bool});
        },
        toggleAllChecks(e, bool) {
            this.toggleAllRatesCheck({prop: 'monoRates', isChecked: bool});
        },
        addNewRow() {
            this.$emit("addNewRow");
            this.setEditingData(this.fullInfo.length-1);
            setTimeout(() => {
                this.handleScroll();
            }, 0)
        },
        async makeAction(key, index) {
            if(this.currentActive !== -1 && this.currentActive !== index) {
                return this.isEditing();
            }
            switch(key) {
                case "edit": 
                    this.setEditingData(index);
                    break;
                case "cancel": 
                    this.cancelEdition(index);
                    break;
                case "save":
                    await this.save();
                    break;
            }
        },
        async save() {
            const rates = Object.keys(this.currentInfo.rates).reduce((prev, cur) => {
                const value = +this.currentInfo.rates[cur].value;
                const min = +this.currentInfo.rates[cur].min;
                prev[cur] = {...this.currentInfo.rates[cur], value, min};
                return {...prev};
            }, {})
            await this.saveMonoRates({...this.currentInfo, rates});
            this.$emit("refreshRates");
            this.cancelEdition();
        },
        cancelEdition(index) {
            this.currentActive = -1;
            if(index && !this.fullInfo[index]._id) {
                this.fullInfo.pop();
            }
            this.currentInfo = null;
        },
        setTarget({lang}) {
            this.currentInfo.target = lang;
        },
        setPackage({option}) {
            this.currentInfo.packageSize = option;
        },
        setIndustry({industry}) {
            if(industry.name !== 'All') {
                this.currentInfo.industries = this.currentInfo.industries.filter(item => item.name !== 'All');
            } else {
                return this.currentInfo.industries = [{name: "All"}];
            }
            const position = this.industriesNames.indexOf(industry.name);
            if(position === -1) {
                this.currentInfo.industries.push(industry);
            } else {
                this.currentInfo.industries.splice(position, 1);
                if(!this.currentInfo.industries.length) {
                    this.currentInfo.industries = [{name: "All"}];
                }
            }
        },
        setEditingData(index) {
            this.currentActive = index;
            const stringifiedCopy = JSON.stringify(this.fullInfo[index]);
            this.currentInfo = JSON.parse(stringifiedCopy);
            if(this.isAllIndusties(this.currentInfo.industries)) {
                this.currentInfo.industries = [{name: "All"}]
            }
        },
        isAllIndusties(rateIndustries) {
            const rateIndustriesIds = rateIndustries.map(item => item._id).sort();
            return JSON.stringify(rateIndustriesIds) === JSON.stringify(this.industries);
        },
        presentFirstRate(rates) {
            const keys = Object.keys(rates).sort();

            const { value, min, active } = rates[keys[0]];
            return { value, min, active }
        },
        closeErrors() {
            this.areErrors = false;
            this.errors = [];
        },
        async getPackages() {
            try {
                const result = await this.$http.get("/api/packages");
                this.packages = result.body.map(item => item.size);
            } catch(err) {
                this.alertToggle({message: "Error on getting packages", isShow: true, type: "error"});
            }
        }
    },
    computed: {
        ...mapGetters({
            steps: "getVuexSteps",
            fullInfo: "getMonoRates",
            currentPrice: "getCurrentPrice"
        }),
        tableFields() {
            let fields = this.fields.map(item => item);
            fields = fields.filter(item => !item.isStepTitle);
            for(let i = 0; i < this.selectedSteps.length; i++) {
                fields.splice(-1, 0,{
                    label: this.selectedSteps[i].title, 
                    headerKey: `headerStep${i+1}`, 
                    key: this.selectedSteps[i].symbol, 
                    width: 233, 
                    padding: "0", 
                    isStepTitle: true
                })
            }
            return fields;
        },
        stepsIds() {
            return this.selectedSteps.map(item => item._id);
        },
        industriesNames() {
            return this.currentInfo.industries.map(item => item.name);
        },
        isAllChecked() {
            const unChecked = this.fullInfo.find(item => !item.isChecked);
            return !unChecked;
        }
    },
    components: {
        LanguagesSelect,
        IndustrySelect,
        SelectSingle,
        CheckBox,
        RatesTable,
        Toggler,
        Add
    },
    created() {
        this.getPackages()
    },
    mounted() {
        this.domain = __WEBPACK__API_URL__;
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
