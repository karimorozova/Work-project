<template lang="pug">
.project
    .project__all-info
        .project__info-row
            input.project__name(v-if="!project._id" type="text" v-model="project.projectName" placeholder="Project Name")
            input.project__name(v-else type="text" :value="nameOfProject" placeholder="Project Name" disabled)
            .project__date
                LabelValue(label="Start Date & Time" :isRequired="isRequiredField" customClass="project_margin")
                    Datepicker(v-model="project.startDate" @selected="(e) => updateProjectDate(e, 'startDate')" :highlighted="highlighted" monday-first=true inputClass="datepicker-custom" calendarClass="calendar-custom" :format="customFormatter" :disabled="disabled" ref="start" :disabledPicker="disabledPicker")
                img.project__calendar-icon(src="../../assets/images/calendar.png" @click="startOpen")
            .project__date
                LabelValue(label="Deadline" :isRequired="isRequiredField" customClass="project_margin")
                    Datepicker(v-model="project.deadline" @selected="(e) => updateProjectDate(e, 'deadline')" :highlighted="highlighted" monday-first=true inputClass="datepicker-custom" calendarClass="calendar-custom" :format="customFormatter" :disabled="disabled" ref="deadline")
                img.project__calendar-icon(src="../../assets/images/calendar.png" @click="deadlineOpen")
        .project__info-row
            .project__client
                LabelValue(label="Client Name" :isRequired="isRequiredField" customClass="project_margin")
                    .project__client-link(v-if="project._id")
                        .project__link(@click="goToClientInfo") {{ project.customer.name }}
                    .project__drop-menu(v-else)
                        SelectSingle(
                            :selectedOption="project.customer.name"
                            :options="allClients"
                            :hasSearch="isSearchClient"
                            placeholder="Name"
                            refersTo="customer"
                            @chooseOption="setValue"
                        )
            .project__industry
                LabelValue(label="Industry" :isRequired="isRequiredField" customClass="project_margin")
                    .project__selected-industry(v-if="project.tasks && project.tasks.length") {{ project.industry.name }}
                    .project__drop-menu(v-else)
                        SelectSingle(
                            :selectedOption="selectedIndustry.name || project.industry.name"
                            :options="industriesList"
                            @chooseOption="setIndustry"
                            placeholder="Industry"
                        )
            .project__number
                LabelValue(label="Client Project Number" customClass="project_margin")
                    input.project__input-text(type="text" v-model="project.projectId" placeholder="Project Number")
        .project__info-row.project_no-margin
            .project__textarea
                LabelValue(label="Project Brief" customClass="project_textarea")
                    textarea.project__text(type="text" rows="10" v-model="project.brief")
            .project__textarea
                LabelValue(label="Internal Notes" customClass="project_textarea")
                    textarea.project__text(type="text" rows="10" v-model="project.notes")
        .project__button(v-if="!project.projectId")
            Button(
                value="Create Project"
                @clicked="checkForErrors"
            )
    ValidationErrors(v-if="areErrorsExist"
        :errors="errors"
        @closeErrors="closeErrors")
</template>

<script>
import SelectSingle from "../SelectSingle";
import SelectMulti from "../SelectMulti";
import ValidationErrors from "../ValidationErrors";
import Datepicker from "../Datepicker";
import LabelValue from "./LabelValue";
import Button from "../Button";
import moment from "moment";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        project: {
            type: Object,
        }
    },
    data() {
        return {
            selectedIndustry: "",
            industries: [],
            disabled: {
                to: moment().add(-1, 'day').endOf('day').toDate()
            },
            highlighted: {
                days: [6, 0]
            },
            startDate: new Date(),
            deadline: "",
            isSearchClient: true,
            isRequiredField: true,
            errors: [],
            areErrorsExist: false
        }
    },
    methods: {
        ...mapActions([
            "alertToggle",
            "customersGetting",
            "setProjectDate"
        ]),
        customFormatter(date) {
            return moment(date).format('DD-MM-YYYY, HH:mm');
        },
        async updateProjectDate(e, prop) {
            if(this.project._id) {
                const date = {[prop]: e};
                await this.setDate(prop, date);
            }
        },
        async setDate(prop, date) {
            if(prop === 'startDate' && this.project.tasks.length) return;
            await this.setProjectDate({date, projectId: this.project._id});
        },
        setValue({option, refersTo}) {
            this.$emit('setValue', {option: option, refersTo: refersTo});
            if(refersTo === 'customer' && this.project.customer.industries.length == 1) {
                this.selectedIndustry = this.project.customer.industries[0];
            }
        },
        setIndustry({option}) {
            this.selectedIndustry = option;
        },
        closeErrors() {
            this.areErrorsExist = false;
        },
        checkProjectName() {
            const regex = /^[A-Za-z][A-Za-z0-9\-\_ ]+((([A-Za-z0-9])+([\-\_])?)* *)*$/;
            return regex.test(this.project.projectName);
        },
        async checkForErrors() {
            this.errors = [];
            if(!this.project.projectName || (this.project.projectName && !this.checkProjectName())) this.errors.push("Please, enter valid Project name.");
            if(!this.project.startDate) this.errors.push("Please, set the start date.");
            if(!this.project.deadline) this.errors.push("Please, set the deadline date.");
            if(!this.project.customer.name) this.errors.push("Please, select a Client.");
            if(!this.selectedIndustry) this.errors.push("Please, choose an industry.");
            if(this.errors.length) {
                this.areErrorsExist = true;
                return
            }
            try {
                await this.createProject();
            } catch(err) {
                this.alertToggle({message: "Server error on creating a new Project", isShow: true, type: "error"});
            }
        },
        async createProject() {
            this.project.dateFormatted = moment(this.project.startDate).format('YYYY MM DD');
            this.project.industry = this.selectedIndustry._id;
            const customer = {...this.project.customer};
            this.project.customer = customer._id;
            try {
                const newProject = await this.$http.post("/pm-manage/new-project", this.project);
                this.$emit('projectCreated', {project: newProject.body, customer: customer});
                this.alertToggle({message: "New Project has been created", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: "Server error on creating a new Project", isShow: true, type: "error"});
            }
        },
        async getIndustries() {
            const industries = await this.$http.get('/api/industries');
            this.industries = industries.body;
        },
        startOpen() {
            this.$refs.start.showCalendar();
        },
        deadlineOpen() {
            this.$refs.deadline.showCalendar();
        },
        goToClientInfo() {
            this.$router.push(`/clients/details/${this.project.customer._id}`)
        },
        async getCustomers() {
            try {
                if(!this.allClients.length) {
                    let result = await this.$http.get('/all-clients');
                    this.customersGetting(result.body);
                }
            } catch(err) {
                this.alertToggle({message: "Error on getting customers", isShow: true, type: "error"});
            }
        },
    },
    computed: {
        ...mapGetters({
            allClients: "getClients"
        }),
        industriesList() {
            let result = this.industries;
            if(this.project.customer.name) {
                const industries = this.project.customer.industries;
                if(industries[0].name) {
                    return result = industries;
                }
                return result = result.filter(item => industries.indexOf(item._id) !== -1);
            }
            return result;
        },
        nameOfProject() {
            return this.project.isUrgent ? this.project.projectName + " URGENT" : this.project.projectName;
        },
        disabledPicker() {
            return !!(this.project._id && this.project.tasks.length);
        }
    },
    components: {
        SelectSingle,
        SelectMulti,
        Datepicker,
        LabelValue,
        Button,
        ValidationErrors
    },
    created() {
        this.getCustomers();
        this.getIndustries();
    }
}
</script>

<style lang="scss" scoped>
.project {
    padding: 20px;
    width: 67%;
    display: flex;
    flex-direction: column;
    @media (max-width: 1600px) {
        width: 70%;
    }
    &__project-template {
        position: relative;
        width: 191px;
        margin-bottom: 60px;
    }
    &__all-info {
        padding: 20px;
        box-shadow: 0 3px 20px rgba(104, 87, 62, 0.5);
    }
    &__info-row {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 40px;
        ::-webkit-input-placeholder {
            color: #68573E;
            opacity: 0.47;
        }
    }
    &__name {
        font-size: 29px;
        padding: 0 5px;
        height: 44px;
        width: 33%;
        border-radius: 5px;
        color: #68573E;
        border: 1px solid #68573E;
        outline: none;
        &:focus {
            box-shadow: 0 0 5px #68573E;
        }
    }
    &__date {
        width: fit-content;
        position: relative;
    }
    &__client, &__industry, &__number {
        width: fit-content;
    }
    &__drop-menu {
        position: relative;
        height: 28px;
        width: 191px;
    }
    &__client-link {
        width: 191px;
        display: flex;
        justify-content: flex-start;
    }
    &__link {
        border-bottom: 1px solid #68573E;
        cursor: pointer;
    }
    &__input-text {
        width: 151px;
        height: 28px;
        border: 1px solid #68573E;
        border-radius: 5px;
        padding: 0 5px;
        color: #68573E;
        font-size: 14px;
        outline: none;
        &:focus {
            box-shadow: 0 0 5px #68573E;
        }
    }
    &__textarea {
        width: 43%;
    }
    &__text {
        width: 100%;
        margin-top: 10px;
        border-radius: 10px;
        border: 1px solid #68573E;
        padding: 5px;
        color: #68573E;
        resize: none;
        outline: none;
        box-sizing: border-box;
        &:focus {
            box-shadow: 0 0 5px #68573E;
        }
    }
    &__calendar-icon {
        position: absolute;
        top: 5px;
        right: 5px;
        width: 18px;
        cursor: pointer;
    }
    &__button {
        text-align: center;
        margin-top: 30px;
    }
    &_no-margin {
        margin-bottom: 0;
    }
}

</style>
