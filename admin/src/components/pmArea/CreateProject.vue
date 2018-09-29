<template lang="pug">
.project-info
    .project-info__project-template
        SelectSingle(
            :selectedOption="project.template"
            :options="templates"
            placeholder="Project Template"
            refersTo="template"
            @chooseOption="setValue"
        )
    .project-info__all-info
        .project-info__info-row
            input.project-info__name(type="text" v-model="project.projectName" placeholder="Project Name")
            .project-info__date
                LabelValue(label="Start Date and Time")
                    Datepicker(v-model="project.createdAt" :highlighted="highlighted" monday-first=true inputClass="datepicker-custom" calendarClass="calendar-custom" :format="customFormatter" :disabled="disabled" ref="start")
                img.project-info__calendar-icon(src="../../assets/images/calendar.png" @click="startOpen")
            .project-info__date
                LabelValue(label="Deadline")
                    Datepicker(v-model="project.date" :highlighted="highlighted" monday-first=true inputClass="datepicker-custom" calendarClass="calendar-custom" :format="customFormatter" :disabled="disabled" ref="deadline")
                img.project-info__calendar-icon(src="../../assets/images/calendar.png" @click="deadlineOpen")                
        .project-info__info-row
            .project-info__client
                LabelValue(label="Client Name")
                    .project-info__drop-menu
                        SelectSingle(
                            :selectedOption="project.customer.name"
                            :options="allClients"
                            placeholder="Name"
                            refersTo="customer"
                            @chooseOption="setValue"
                        )
            .project-info__industry
                LabelValue(label="Industry")
                    .project-info__drop-menu
                        SelectMulti(
                            :selectedOptions="industryNames"
                            :options="industriesList"
                            @chooseOptions="addIndustry"
                        )
            .project-info__id
                LabelValue(label="Project ID")
                    input.project-info__input-text(type="text" v-model="project.projectId" placeholder="Project ID")
        .project-info__info-row
            .project-info__textarea
                LabelValue(label="Project Brief")
                    textarea.project-info__text(type="text" rows="10" v-model="project.brief")
            .project-info__textarea
                LabelValue(label="Internal Notes")
                    textarea.project-info__text(type="text" rows="10" v-model="project.notes")
        .project-info__button
            Button(v-if="!project.projectId"
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
import { mapGetters } from "vuex";

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
            selectedIndustries: [],
            industries: [],
            disabled: {
                to: moment().add(-1, 'day').endOf('day').toDate()
            },
            highlighted: {
                days: [6, 0]
            },
            startDate: "",
            deadline: "",
        }
    },
    methods: {
        customFormatter(date) {
            return moment(date).format('DD MM YYYY, h:mm:ss');
        },
        setValue({option, refersTo}) {
            this.$emit('setValue', {option: option, refersTo: refersTo});
            if(refersTo === 'customer' && this.project.customer.industry.length == 1) {
                this.selectedIndustries = [this.project.customer.industry[0]]
            }
        },
        projectCreating() {
            this.$emit("projectCreating");
        },
        addIndustry({option}) {
            const position = this.industryNames.indexOf(option.name);
            if(position === -1) {
                this.selectedIndustries.push(option);
            } else {
                this.selectedIndustries.splice(position, 1)
            }
        },
        async createProject() {
            this.project.dateFormatted = moment(this.project.createdAt).format('YYYY MM DD');
            this.project.industry = this.selectedIndustries.map(item => {
                return item._id
            });
            const newProject = await this.$http.post("/pm-manage/new-project", this.project);
            const customer = this.project.customer;
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
        industryNames() {
            return this.selectedIndustries.map(item => {
                return item.name;
            })
        },
        industriesList() {
            return this.project.customer.name ? this.project.customer.industry : this.industries
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
        this.projectCreating();
        this.getIndustries();
    },
    destroyed() {
        this.$emit('projectDetailsClosed')
    }
}
</script>

<style lang="scss" scoped>
.project-info {
    padding: 40px;
    width: 60%;
    display: flex;
    flex-direction: column;
    &__project-template {
        position: relative;
        width: 191px;
        margin-bottom: 40px;
    }
    &__all-info {
        margin-top: 20px;
        padding: 40px;
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
        width: 33%;
        position: relative;
        &:last-child {
            width: 25.5%;
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
    }
}

</style>
