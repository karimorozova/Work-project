<template lang="pug">
.project
    .project__project-template(v-if="!project.projectId")
        SelectSingle(
            :selectedOption="project.template"
            :options="templates"
            placeholder="Project Template"
            refersTo="template"
            @chooseOption="setValue"
        )
    .project__all-info
        .project__info-row
            input.project__name(v-if="!project._id" type="text" v-model="project.projectName" placeholder="Project Name")
            input.project__name(v-else type="text" :value="nameOfProject" placeholder="Project Name")
            .project__date
                LabelValue(label="Start Date and Time")
                    Datepicker(v-model="project.createdAt" :highlighted="highlighted" monday-first=true inputClass="datepicker-custom" calendarClass="calendar-custom" :format="customFormatter" :disabled="disabled" ref="start")
                img.project__calendar-icon(src="../../assets/images/calendar.png" @click="startOpen")
            .project__date
                LabelValue(label="Deadline")
                    Datepicker(v-model="project.deadline" :highlighted="highlighted" monday-first=true inputClass="datepicker-custom" calendarClass="calendar-custom" :format="customFormatter" :disabled="disabled" ref="deadline")
                img.project__calendar-icon(src="../../assets/images/calendar.png" @click="deadlineOpen")                
        .project__info-row
            .project__client
                LabelValue(label="Client Name")
                    .project__drop-menu
                        SelectSingle(
                            :selectedOption="project.customer.name"
                            :options="allClients"
                            placeholder="Name"
                            refersTo="customer"
                            @chooseOption="setValue"
                        )
            .project__industry
                LabelValue(label="Industry")
                    .project__drop-menu
                        SelectSingle(
                            :selectedOption="selectedIndustry.name || project.industry.name"
                            :options="industriesList"
                            @chooseOptions="setIndustry"
                            placeholder="Industry"
                        )
            .project__id
                LabelValue(label="Project ID")
                    input.project__input-text(type="text" v-model="project.projectId" placeholder="Project ID")
        .project__info-row.project_no-margin
            .project__textarea
                LabelValue(label="Project Brief")
                    textarea.project__text(type="text" rows="10" v-model="project.brief")
            .project__textarea
                LabelValue(label="Internal Notes")
                    textarea.project__text(type="text" rows="10" v-model="project.notes")
        .project__button(v-if="!project.projectId")
            Button(
                value="Create Project"
                @clicked="createProject"
            )
</template>

<script>
import SelectSingle from "../SelectSingle";
import SelectMulti from "../SelectMulti";
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
            templates: [
                "template 1",
                "template 2",
                "template 3",
            ],
            selectedIndustry: "",
            industries: [],
            disabled: {
                to: moment().add(-1, 'day').endOf('day').toDate()
            },
            highlighted: {
                days: [6, 0]
            },
            createdAt: new Date(),
            deadline: "",
        }
    },
    methods: {
        ...mapActions({
            loadingToggle: "loadingToggle"
        }),
        customFormatter(date) {
            return moment(date).format('DD-MM-YYYY, h:mm:ss');
        },
        setValue({option, refersTo}) {
            this.$emit('setValue', {option: option, refersTo: refersTo});
            if(refersTo === 'customer' && this.project.customer.industry.length == 1) {
                this.selectedIndustry = this.project.customer.industry[0];
            }
        },
        setIndustry({option}) {
            this.selectedIndustry = option;
        },
        async createProject() {
            this.project.dateFormatted = moment(this.project.createdAt).format('YYYY MM DD');
            this.project.industry = this.selectedIndustry._id;
            const customer = {...this.project.customer};
            this.project.customer = customer._id;
            const newProject = await this.$http.post("/pm-manage/new-project", this.project);
            this.$emit('projectCreated', {project: newProject.body, customer: customer});
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
        }
    },
    computed: {
        ...mapGetters({
            allClients: "getClients"
        }),
        industriesList() {
            return this.project.customer.name ? this.project.customer.industry : this.industries
        },
        nameOfProject() {
            return this.project.isUrgent ? this.project.projectName + " URGENT" : this.project.projectName;
        }
    },
    components: {
        SelectSingle,
        SelectMulti,
        Datepicker,
        LabelValue,
        Button
    },
    mounted() {
        this.getIndustries();
    }
}
</script>

<style lang="scss" scoped>
.project {
    padding: 20px;
    width: 60%;
    display: flex;
    flex-direction: column;
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
        width: 33.5%;
        position: relative;
        &:last-child {
            width: 26%;
        }
    }
    &__client {
        width: 30%;
    }
    &__industry {
        width: 27%;
    }
    &__id {
        width: 25%;
    }
    &__drop-menu {
        position: relative;
        height: 28px;
        width: 191px;
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
