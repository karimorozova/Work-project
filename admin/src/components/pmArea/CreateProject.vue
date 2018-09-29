<template lang="pug">
.create-project
    .create-project__project-template
        SelectSingle(
            :selectedOption="newProject.template"
            :options="templates"
            placeholder="Project Template"
            refersTo="template"
            @chooseOption="setValue"
        )
    .create-project__all-info
        .create-project__info-row
            input.create-project__name(type="text" v-model="newProject.projectName" placeholder="Project Name")
            .create-project__date
                LabelValue(label="Start Date and Time")
                    Datepicker(v-model="newProject.createdAt" :highlighted="highlighted" monday-first=true inputClass="datepicker-custom" calendarClass="calendar-custom" :format="customFormatter" :disabled="disabled" ref="start")
                img.create-project__calendar-icon(src="../../assets/images/calendar.png" @click="startOpen")
            .create-project__date
                LabelValue(label="Deadline")
                    Datepicker(v-model="newProject.date" :highlighted="highlighted" monday-first=true inputClass="datepicker-custom" calendarClass="calendar-custom" :format="customFormatter" :disabled="disabled" ref="deadline")
                img.create-project__calendar-icon(src="../../assets/images/calendar.png" @click="deadlineOpen")                
        .create-project__info-row
            .create-project__client
                LabelValue(label="Client Name")
                    .create-project__drop-menu
                        SelectSingle(
                            :selectedOption="newProject.customer.name"
                            :options="allClients"
                            placeholder="Name"
                            refersTo="customer"
                            @chooseOption="setValue"
                        )
            .create-project__industry
                LabelValue(label="Industry")
                    .create-project__drop-menu
                        SelectMulti(
                            :selectedOptions="industryNames"
                            :options="industriesList"
                            @chooseOptions="addIndustry"
                        )
            .create-project__id
                LabelValue(label="Project ID")
                    input.create-project__input-text(type="text" v-model="newProject.projectId" placeholder="Project ID")
        .create-project__info-row
            .create-project__textarea
                LabelValue(label="Project Brief")
                    textarea.create-project__text(type="text" rows="10" v-model="newProject.brief")
            .create-project__textarea
                LabelValue(label="Internal Notes")
                    textarea.create-project__text(type="text" rows="10" v-model="newProject.notes")
        .create-project__button
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
import { mapGetters } from "vuex";

export default {
    data() {
        return {
            newProject: {
                projectId: "",
                template: "",
                projectName: "",
                customer: {name: ""},
                brief: "",
                notes: "",
                industry: [],
                createdAt: "",
                date: "",
            },
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
            this.newProject[refersTo] = option;
            if(refersTo === 'customer' && this.newProject.customer.industry.length == 1) {
                this.selectedIndustries = [this.newProject.customer.industry[0]];
                this.newProject.industry = this.newProject.customer.industry[0];
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
            this.newProject.industry = this.selectedIndustries.map(item => {
                return item._id
            })
        },
        async createProject() {
            this.newProject.dateFormatted = moment(this.newProject.createdAt).format('YYYY MM DD');
            const project = await this.$http.post("/pm-manage/new-project", this.newProject);
            this.newProject = project.body;
            this.newProject.customer = this.allClients.find(item => {
                return item._id === this.newProject.customer;
            });
        },
        async getIndusrties() {
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
            return this.newProject.customer.name ? this.newProject.customer.industry : this.industries
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
        this.getIndusrties();
    }
}
</script>

<style lang="scss" scoped>
.create-project {
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
