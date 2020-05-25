<template lang="pug">
    .services
        .services__table
            SettingsTable(
                :fields="tableFields"
                :tableData="services"
                :errors="errors"
                :areErrors="areErrors"
                @closeErrors="closeErrors"
            )
                template(slot="headerIcon" slot-scope="{ field }")
                    .services__header {{ field.label }}
                template(slot="headerTitle" slot-scope="{ field }")
                    .services__header {{ field.label }}
                template(slot="headerLangForm" slot-scope="{ field }")
                    .services__header {{ field.label }}
                //- template(slot="headerUnit" slot-scope="{ field }")
                //-     .services__header {{ field.label }}
                template(slot="headerStep1" slot-scope="{ field }")
                    .services__header {{ field.label }}
                template(slot="headerStep2" slot-scope="{ field }")
                    .services__header {{ field.label }}
                template(slot="headerActive" slot-scope="{ field }")
                    .services__header {{ field.label }}
                template(slot="headerIcons" slot-scope="{ field }")
                    .services__header {{ field.label }}

                template(slot="icon" slot-scope="{ row, index }")
                    .services__data.services_centered(:class="activeClasses(index)")
                        img.services__main-icon(v-if="row.icon" :src="row.icon")
                        .services__upload(v-if="currentActive === index" :class="{'services_no-back': imageData}")
                            input.services__load-file(type="file" @change="uploadIcon")
                            img.services__file-preview(v-if="imageData" :src="imageData")
                template(slot="title" slot-scope="{ row, index }")
                    .services__data(v-if="currentActive !== index") {{ row.title }}
                    .services__editing-data(v-else)
                        input.services__input(type="text" v-model="currentTitle")
                template(slot="languageForm" slot-scope="{ row, index }")
                    .services__data(v-if="currentActive !== index") {{ row.languageForm }}
                    .services__drop-menu(v-else)
                        SelectSingle(
                            :selectedOption="currentLangForm"
                            :options="langForms"
                            @chooseOption="setLangForm"
                            @scrollDrop="scrollDrop"
                        )
                //- template(slot="calculationUnit" slot-scope="{ row, index }")
                //-     .services__data(v-if="currentActive !== index") {{ row.calculationUnit }}
                //-     .services__drop-menu(v-else)
                //-         SelectSingle(
                //-             :selectedOption="currentUnit"
                //-             :options="units"
                //-             @chooseOption="setUnit"
                //-             @scrollDrop="scrollDrop"
                //-         )
                template(slot="step1" slot-scope="{ row, index }")
                    .services__data(v-if="currentActive !== index") {{ presentStep(row.steps, 'stage1') }}
                    .services__drop-menu(v-else)
                        SelectSingle(
                            :selectedOption="currentStep1"
                            :options="firstStageSteps"
                            @chooseOption="(e) => setStep(e, 'currentStep1')"
                            @scrollDrop="scrollDrop"
                        )
                template(slot="step2" slot-scope="{ row, index }")
                    .services__data(v-if="currentActive !== index") {{ presentStep(row.steps, 'stage2') }}
                    .services__drop-menu(v-else)
                        SelectSingle(
                            :selectedOption="currentStep2"
                            :options="secondStageSteps"
                            @chooseOption="(e) => setStep(e, 'currentStep2')"
                            @scrollDrop="scrollDrop"
                        )
                template(slot="active" slot-scope="{ row, index }")
                    .services__data.services_centered(:class="{'services_active': currentActive === index}")
                        img.services__checkbox(v-if="row.active" src="../../../assets/images/selected-checkbox.png" @click="toggleActive(index)" :class="{'services_opacity': currentActive === index}")
                        img.services__checkbox(v-else src="../../../assets/images/unselected-checkbox.png" @click="toggleActive(index)" :class="{'services_opacity': currentActive === index}")
                template(slot="icons" slot-scope="{ row, index }")
                    .services__icons
                        img.services__icon(v-for="(icon, key) in manageIcons" :src="icon.icon" @click="makeAction(index, key)" :class="{'services_opacity': isActive(key, index)}")
        Add(@add="addService")
</template>

<script>
import SettingsTable from "../SettingsTable";
import SelectSingle from "@/components/SelectSingle";
import Add from "@/components/Add";
import scrollDrop from "@/mixins/scrollDrop";
import { mapActions } from "vuex";
import tableFields from "@/mixins/tableFields";
import crudIcons from "@/mixins/crudIcons";

export default {
    mixins: [scrollDrop, tableFields, crudIcons],
    props: {
        allSteps: {type: Array},
        firstStageSteps: {type: Array},
        secondStageSteps: {type: Array}
    },
    data() {
        return {
            fields: [
                {label: "Icon", headerKey: "headerIcon", key: "icon", width: Math.floor(920*0.10), padding: "0"},
                {label: "Title", headerKey: "headerTitle", key: "title", width: Math.floor(920*0.18), padding: "0"},
                {label: "Language Form", headerKey: "headerLangForm", key: "languageForm", width: Math.floor(920*0.14), padding: "0"},
                // {label: "Calculation Unit", headerKey: "headerUnit", key: "calculationUnit", width: Math.floor(920*0.14), padding: "0"},
                {label: "Step 1", headerKey: "headerStep1", key: "step1", width: Math.floor(920*0.19), padding: "0"},
                {label: "Step 2", headerKey: "headerStep2", key: "step2", width: Math.floor(920*0.19), padding: "0"},
                {label: "Active", headerKey: "headerActive", key: "active", width: Math.floor(920*0.08), padding: "0"},
                {label: "", headerKey: "headerIcons", key: "icons", width: 0, padding: "0"},
            ],
            services: [],
            langForms: ["Mono", "Duo"],
            // units: ["Hours", "Packages", "Words"],
            currentActive: -1,
            currentTitle: "",
            currentLangForm: "",
            // currentUnit: "",
            currentStep1: "",
            currentStep2: "",
            iconFile: [],
            imageData: "",
            steps: [],
            areErrors: false,
            errors: [],
            tableWidth: 920
        }
    },
    methods: {
        isScrollDrop(drop, elem) {
            return drop && this.services.length >= 20;
        },
        presentStep(steps, title) {
            if(steps && steps.length) {
                const stage = steps.find(item => item.stage === title);
                return stage ? stage.step.title : "";
            }
            return "";
        },
        uploadIcon(event) {
            this.iconFile.push(event.target.files[0]);
            const input = event.target;
            if (input.files && input.files[0]) {
                let reader = new FileReader();
                reader.onload = (e) => {
                this.imageData = e.target.result;
                }
                reader.readAsDataURL(input.files[0]);
            }
        },
        toggleActive(index) {
            if(this.currentActive !== index) return;
            this.services[index].active = !this.services[index].active;
        },
        async makeAction(index, key) {
            if(this.currentActive !== -1 && this.currentActive !== index) {
                return this.isEditing();
            }
            if(key === "save") {
                await this.checkErrors(index);
            }
            if(key === "edit") {
                this.setEditionData(index);
            }
            if(key === "cancel") {
                if(this.currentActive === -1) return;
                this.cancel();
                await this.getAllServices();
            }
        },
        async checkErrors(index) {
            if(this.currentActive === -1) return;
            this.errors = [];
            if(!this.currentTitle || !this.isTitleUnique(index)) this.errors.push("Title should not be empty and be unique!");
            if(!this.currentLangForm) this.errors.push("Please, select language form.");
            // if(!this.currentUnit) this.errors.push("Please, select calculation unit.");
            if(!this.currentStep1) this.errors.push("Please, select Step 1.");
            if(this.errors.length) {
                this.areErrors = true;
                return
            }
            await this.saveChanges(index);
            this.cancel();
        },
        isTitleUnique(index) {
            const duplicateIndex = this.services.findIndex((item, ind) => {
                if(index !== ind && item.title === this.services[index].title) {
                    return item;
                }
            })
            return duplicateIndex === -1;
        },
        closeErrors() {
            this.areErrors = false;
        },
        async saveChanges(index) {
            if(this.currentActive === -1) return;
            const id = this.services[index]._id;
            const newData = this.collectData(index);
            try {
                if(!id) {
                    await this.createNew(newData);
                } else {
                    await this.updateService(id, newData)
                }
                await this.getAllServices();
                this.alertToggle({message: "Saved", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: "Erorr on saving Service", isShow: true, type: "error"});
            }
        },
        async createNew(newData) {
            try {
                await this.$http.post('/service/service/new', newData);
            } catch(err) {
                this.alertToggle({message: "Erorr on saving Service info", isShow: true, type: "error"});
            }
        },
        async updateService(id, newData) {
            try {
                await this.$http.post(`/service/service/${id}`, newData)
            } catch(err) {
                this.alertToggle({message: "Erorr on saving Service info", isShow: true, type: "error"});
            }
        },
        collectData(index) {
            const symbol = this.services[index]._id ? this.services[index].symbol : this.currentTitle.slice(0, 3).toLowerCase();
            const steps = this.getStepsInfo();
            const newData = new FormData();
            newData.append("title", this.currentTitle);
            newData.append("active", this.services[index].active);
            newData.append("icon", this.iconFile[0]);
            newData.append("languageForm", this.currentLangForm);
            // newData.append("calculationUnit", this.currentUnit);
            newData.append("steps", JSON.stringify(steps));
            newData.append("symbol", symbol);
            newData.append("projectType", this.services[index].projectType);
            newData.append("sortIndex", this.services[index].sortIndex);
            return newData;
        },
        getStepsInfo() {
            let steps = [];
            const stage1 = this.allSteps.find(item => item.title === this.currentStep1);
            const stage2 = this.allSteps.find(item => item.title === this.currentStep2);
            if(stage1) steps.push({stage: 'stage1', step: stage1._id});
            if(stage2) steps.push({stage: 'stage2', step: stage2._id});
            return steps;
        },
        setEditionData(index) {
            this.currentActive = index;
            this.currentTitle= this.services[index].title;
            this.currentLangForm = this.services[index].languageForm;
            // this.currentUnit = this.services[index].calculationUnit;
            // this.$emit("setUnitFilter", {unit: this.currentUnit});
            this.setCurrentEditableSteps(index);
        },
        setCurrentEditableSteps(index) {
            const { steps } = this.services[index];
            if(steps && steps.length) {
                const stage1 = steps.find(item => item.stage === 'stage1');
                const stage2 = steps.find(item => item.stage === 'stage2');
                this.currentStep1 = stage1 ? stage1.step.title : "";
                this.currentStep2 = stage2 ? stage2.step.title: "";
            } else {
                this.currentStep1 = "";
                this.currentStep2 = "";
            }
        },
        cancel() {
            this.currentActive = -1;
            this.currentTitle = "";
            this.currentLangForm = "",
            // this.currentUnit = "";
            this.currentStep1 = "";
            this.currentStep2 = "";
            this.imageData = "";
            this.iconFile = [];
            this.$emit("setUnitFilter", {unit: ""});
        },
        setLangForm({option}) {
            this.currentLangForm = option;
        },
        // setUnit({option}) {
        //     this.currentUnit = option;
        //     this.currentStep1 = "";
        //     this.currentStep2 = "";
        //     this.$emit("setUnitFilter", {unit: option});
        // },
        setStep({option}, prop) {
            this[prop] = option;
        },
        addService() {
            if(this.currentActive !== -1) {
                return this.isEditing();
            }
            this.services.push({
                icon: "",
                title: "",
                languageForm: "",
                calculationUnit: "",
                active: false,
                sortIndex: this.services.length + 1,
                symbol: "",
                projectType: "regular",
            });
            this.setEditionData(this.services.length - 1);
        },
        async getAllServices() {
            try {
                const services = await this.$http.get("/api/services");
                this.services = services.body.sort((x, y) => {
                    if (x.title > y.title) return 1;
                    if (x.title < y.title) return -1;
                });
                await this.servicesGetting(this.services);
            } catch(err) {
                this.alertToggle({message: "Erorr on getting Services", isShow: true, type: "error"});
            }
        },
        activeClasses(index) {
            return this.currentActive === index ? 'services_active services_flex' : "";
        },
        ...mapActions(["alertToggle", "servicesGetting"]),
    },
    computed: {
        manageIcons() {
            const { "delete": del, ...result } = this.icons;
            return result;
        }
    },
    components: {
        SettingsTable,
        SelectSingle,
        Add
    },
    created() {
        this.getAllServices();
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";
@import "../../../assets/styles/settingsTable";

.services {
    width: 920;
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
    &_flex {
        display: flex;
        justify-content: space-around;
    }
    &__main-icon, &__file-preview {
        width: 22px;
        height: 22px;
    }
    &__link {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 22px;
    }
    &__download {
        cursor: pointer;
        width: 40%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    &_opacity {
        opacity: 1;
    }
    &__upload {
        position: relative;
        background: url("../../../assets/images/Other/upload-icon.png");
        background-position-x: center;
        background-repeat: no-repeat;
        width: 40%;
        height: 22px;
        overflow: hidden;
    }
    &__load-file {
        width: 100%;
        height: 22px;
        border: none;
        outline: none;
        opacity: 0;
        z-index: 2;
        position: absolute;
        left: 6px;
        cursor: pointer;
        font-size: 0;
    }
    &__no-file {
        opacity: 0.5;
    }
    &_no-back {
        background: none;
    }
    &__file-preview {
        margin-left: 10px;
    }
    &_active {
        box-shadow: inset 0 0 8px $brown-shadow;
    }
}

</style>
