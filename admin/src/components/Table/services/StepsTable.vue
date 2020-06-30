<template lang="pug">
    .steps
        .steps__table
            SettingsTable(
                :fields="tableFields"
                :tableData="steps"
                :errors="errors"
                :areErrors="areErrors"
                @closeErrors="closeErrors"
            )
                .steps__header(slot="headerTitle" slot-scope="{ field }") {{ field.label }}
                .steps__header(slot="headerUnit" slot-scope="{ field }") {{ field.label }}
                .steps__header(slot="headerStage1" slot-scope="{ field }") {{ field.label }}
                .steps__header(slot="headerStage2" slot-scope="{ field }") {{ field.label }}
                .steps__header(slot="headerEditor" slot-scope="{ field }") {{ field.label }}
                .steps__header(slot="headerActive" slot-scope="{ field }") {{ field.label }}
                .steps__header(slot="headerIcons" slot-scope="{ field }") {{ field.label }}
                template(slot="title" slot-scope="{ row, index }")
                    .steps__data(v-if="currentActive !== index") {{ row.title }}
                    .steps__editing-data(v-else)
                        input.steps__input(type="text" v-model="currentStep.title")
  
                template(slot="calculationUnit" slot-scope="{ row, index }")
                    .steps__data(v-if="currentActive !== index") {{ presentUnits(row.calculationUnit) }}
                    .steps__drop-menu(v-else)
                        SelectMulti(
                            :isTableDropMenu="true"
                            placeholder="Select"
                            :hasSearch="true"
                            :options="unitData" 
                            :selectedOptions="selectedUnits" 
                            @chooseOptions="setUnits"
                        )
                        
                .steps__data.steps_centered(slot="stage1" slot-scope="{ row, index }" :class="{'steps_active': currentActive === index}")
                    img.steps__checkbox(v-if="isSelected('isStage1', index)" src="../../../assets/images/selected-checkbox.png" @click="toggleActive(index, 'isStage1')" :class="{'steps_opacity': currentActive === index}")
                    img.steps__checkbox(v-else src="../../../assets/images/unselected-checkbox.png" @click="toggleActive(index, 'isStage1')" :class="{'steps_opacity': currentActive === index}")
                .steps__data.steps_centered(slot="stage2" slot-scope="{ row, index }" :class="{'steps_active': currentActive === index}")
                    img.steps__checkbox(v-if="isSelected('isStage2', index)" src="../../../assets/images/selected-checkbox.png" @click="toggleActive(index, 'isStage2')" :class="{'steps_opacity': currentActive === index}")
                    img.steps__checkbox(v-else src="../../../assets/images/unselected-checkbox.png" @click="toggleActive(index,'isStage2')" :class="{'steps_opacity': currentActive === index}")
                .steps__data.steps_centered(slot="active" slot-scope="{ row, index }" :class="{'steps_active': currentActive === index}")
                    img.steps__checkbox(v-if="isSelected('isActive', index)" src="../../../assets/images/selected-checkbox.png" @click="toggleActive(index, 'isActive')" :class="{'steps_opacity': currentActive === index}")
                    img.steps__checkbox(v-else src="../../../assets/images/unselected-checkbox.png" @click="toggleActive(index, 'isActive')" :class="{'steps_opacity': currentActive === index}")
                .steps__icons(slot="icons" slot-scope="{ row, index }")
                    img.steps__icon(v-for="(icon, key) in manageIcons" :src="icon.icon" @click="makeAction(index, key)" :class="{'steps_opacity': isActive(key, index)}")
        Add(@add="addStep")
</template>

<script>
import SelectMulti from "../../SelectMulti";
import SettingsTable from "../SettingsTable";
import SelectSingle from "@/components/SelectSingle";
import Add from "@/components/Add";
import tableFields from "@/mixins/tableFields";
import crudIcons from "@/mixins/crudIcons";
import scrollDrop from "@/mixins/scrollDrop";
import { mapActions } from "vuex";

export default {
    mixins: [tableFields, crudIcons, scrollDrop],
    props: {
        steps: { type: Array }
    },
    data() {
        return {
            fields: [
                {label: "Title", headerKey: "headerTitle", key: "title", width: Math.floor(850*0.20), padding: "0"},
                {label: "Calculation Unit", headerKey: "headerUnit", key: "calculationUnit", width: Math.floor(850*0.28), padding: "0"},
                {label: "Stage 1", headerKey: "headerStage1", key: "stage1", width: Math.floor(850*0.12), padding: "0"},
                {label: "Stage 2", headerKey: "headerStage2", key: "stage2", width: Math.floor(850*0.12), padding: "0"},
                {label: "Active", headerKey: "headerActive", key: "active", width: Math.floor(850*0.12), padding: "0"},
                {label: "", headerKey: "headerIcons", key: "icons", width: 0, padding: "0"},
            ],
            units: [],
            errors: [],
            areErrors: false,
            currentActive: -1,
            currentStep: "",
            tableWidth: 850,
            currentUnits: [],
        }
    },
    methods: {
        ...mapActions({
            alertToggle: "alertToggle"
        }),
        presentUnits(units) {
            if (!units.length) return "";
            return units.reduce((acc, cur) => acc + `${cur.type}; `, "");
            // return units.filter(item => item.active).reduce((acc, cur) => acc + `${cur.type}; `, "");
        },
        setUnits({ option }) {
            const position = this.selectedUnits.indexOf(option);
            if (position !== -1) {
                this.currentUnits.splice(position, 1);
            } else {
                const title = this.units.find(item => item.type === option);
                this.currentUnits.push(title);
            }
        },
        async getUnits(){
            try {
                const result  = await this.$http.get('/api/units');
                this.units = result.body;
            } catch (err) {
                this.alertToggle({message: "Erorr on getting Units", isShow: true, type: "error"});
            }
        },
        closeErrors() {
            this.areErrors = false;
        },
        cancel() {
            this.currentActive = -1;
            this.currentStep = "";
        },
        setUnit({option}) {
            this.currentStep.calculationUnit = option;
        },
        addStep() {
            if(this.currentActive !== -1) {
                return this.isEditing();
            }
            this.currentUnits = [];
            this.currentStep = {
                title: "",
                calculationUnit: [],
                isStage1: false,
                isStage2: false,
                isEditor: false,
                isActive: true,
                symbol: ""
            }
            this.steps.push(this.currentStep);
            this.currentActive = this.steps.length - 1; 
        },
        isSelected(rowProp, index) {
            if(this.currentActive === index) {
                return this.currentStep[rowProp];
            }
            return this.steps[index][rowProp];
        },
        toggleActive(index, prop) {
            if(this.currentActive === -1 || this.currentActive !== index) return;
            this.currentStep[prop] = !this.currentStep[prop];
        },
        async makeAction(index, key) {
            if(this.currentActive !== -1 && this.currentActive !== index) {
                return this.isEditing();
            }
            switch(key) {
                case 'edit':
                    this.currentActive = index;
                    this.currentStep = {...this.steps[index]};
                    this.currentUnits = Array.from(this.steps[index].calculationUnit);
                    break;
                case 'cancel':
                    this.currentActive = -1;
                    this.$emit("setStepsWithId");
                    break;
                case 'save':
                    await this.checkErrors(index);
                    break;
            }
        },
        async checkErrors(index) {
            if(this.currentActive === -1) return;
            this.errors = [];
            const isNotUnique = this.steps.find((item, ind) => ind !== index && item.title === this.currentStep.title.trim());
            if(!this.currentStep.title || isNotUnique) this.errors.push("Step title should be unique and not empty");
            if(!this.currentUnits.length) this.errors.push("Please, select calculation unit.");
            if(!this.currentStep.isStage1 && !this.currentStep.isStage2) this.errors.push("Please, set at least one stage.");
            if(this.errors.length) {
                return this.areErrors = true;
            }
            await this.saveChanges(index);
            this.cancel();
        },
        async saveChanges(index) {
            try {
                let oldStep = this.steps[index];
                this.currentStep.symbol = this.currentStep.title.toLowerCase().trim().replace(/ /g,"_");
                this.currentStep.calculationUnit = this.currentUnits;
                const result = await this.$http.post("/api/step", { step: this.currentStep });
                this.$emit("updateSteps");
                if(result.data !== "Updated"){
                    await this.$http.post('/pricelists/add-new-multiplier', {
                        key: 'Step',
                        id: result.data,
                    });
                }else{
                    await this.$http.post('/pricelists/update-multiplier', {
                        key: 'Step',
                        oldMultiplier: oldStep,
                    });
                }
                this.alertToggle({message: "Information saved", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: "Error on savind step", isShow: true, type: "error"});
            } finally {
                this.cancel();
            }
        }
    },
    computed: {
        manageIcons() {
            const { "delete": del, ...result } = this.icons;
            return result;
        },
        unitData() {
            return this.units.map(item => item.type);
        },
        selectedUnits() {
            return this.currentUnits.length
            ? this.currentUnits.map(item => item.type)
            : [];
    }
    },
    created(){
        this.getUnits();
    },
    components: {
        SettingsTable,
        SelectSingle,
        Add,
        SelectMulti
    },
    beforeDestroy() {
        this.$emit("setStepsWithId");
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";
@import "../../../assets/styles/settingsTable";

.steps {
    width: 850px;
    &__data {
        @extend %table-data;
    }
    &__editing-data {
        @extend %table-data;
        box-shadow: inset 0 0 7px $brown-shadow;
    }
    &__input {
        @extend %table-text-input;
    }
    &__icons {
        @extend %table-icons;
    }
    &__icon {
        @extend %table-icon;
    }
    &__drop-menu {
        position: relative;
        box-shadow: inset 0 0 7px $brown-shadow;
    }
    &__checkbox {
        width: 22px;
        height: 22px;
        cursor: pointer;
        opacity: 0.5;
    }
    &_centered {
        justify-content: center;
    }
    &_opacity {
        opacity: 1;
    }
    &_active {
        box-shadow: inset 0 0 8px $brown-shadow;
    }
}

</style>
