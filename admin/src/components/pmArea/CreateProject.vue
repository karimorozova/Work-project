<template lang="pug">
.create-project
    .create-project__project-template
        SelectSingle(
            :selectedOption="selectedTemplate"
            :options="templates"
            placeholder="Project Template"
            refersTo="selectedTemplate"
            @chooseOption="setValue"
        )
    .create-project__all-info
        .create-project__info-row
            input.create-project__name(type="text" v-model="projectName" placeholder="Project Name")
            .create-project__date
                LabelValue(label="Start Date and Time")
                    Datepicker(inputClass="datepicker-custom" ref="start")
                img.create-project__calendar-icon(src="../../assets/images/calendar.png" @click="startOpen")
            .create-project__date
                LabelValue(label="Deadline")
                    Datepicker(inputClass="datepicker-custom" ref="deadline")
                img.create-project__calendar-icon(src="../../assets/images/calendar.png" @click="deadlineOpen")                
        .create-project__info-row
            .create-project__client
                LabelValue(label="Client Name")
                    .create-project__drop-menu
                        SelectSingle(
                            :selectedOption="selectedClient.name"
                            :options="allClients"
                            placeholder="Name"
                            refersTo="selectedClient"
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
            .create-project__projectId
                LabelValue(label="Project ID")
                    input.create-project__input-text(type="text" v-model="projectId" placeholder="Project ID")
        .create-project__info-row
            .create-project__textarea
                LabelValue(label="Project Brief")
                    textarea.create-project__brief(type="text" rows="10" v-model="brief")
            .create-project__textarea
                LabelValue(label="Internal Notes")
                    textarea.create-project__notes(type="text" rows="10" v-model="notes")
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
import { mapGetters } from "vuex";

export default {
    data() {
        return {
            selectedTemplate: "",
            templates: [
                "template 1",
                "template 2",
                "template 3",
            ],
            projectName: "",
            selectedClient: {name: ""},
            selectedIndustries: [],
            brief: "",
            notes: "",
            industries: []
        }
    },
    methods: {
        setValue({option, refersTo}) {
            this[refersTo] = option;
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
        createProject() {
            console.log("Project created!")
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
            return this.selectedClient.name ? this.selectedClient.industry : this.industries
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
    &__projectId {
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
    &__brief, &__notes {
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
