<template lang="pug">
.project-info
    .project-info__title Project Details
    .project-info__all-info
        Project(:project="currentProject")
        ProjectShortDetails(:project="currentProject" @setStatus="setStatus")
    .project-info__tasks
        .project-info__tasks-title Tasks and Steps
        .project-info__input-data-row
            .project-info__tasks-col
                .project-info__drop-menu
                    SelectSingle(
                        :selectedOption="sourceLanguage" 
                        :options="allLangs" 
                        placeholder="Source Language"
                        refersTo="sourceLanguage"
                        @chooseOption="setValue"
                    )
                .project-info__drop-menu
                    SelectSingle(
                        :selectedOption="template"
                        :options="allTemplates"
                        placeholder="Template"
                        refersTo="template"
                        @chooseOption="setValue"
                    )
            .project-info__tasks-col
                .project-info__drop-menu            
                    SelectMulti(
                        :selectedOptions="targetLangs"
                        :options="allLangs" 
                        placeholder="Target Language"
                        @chooseOptions="setTargets"
                    )
                .project-info__drop-menu           
                    SelectSingle(
                        :selectedOption="service" 
                        :options="allServices" 
                        placeholder="Service"
                        refersTo="service"
                        @chooseOption="setValue"
                    )     
            .project-info__tasks-col
                .project-info__upload-file
                    UploadFileButton(text="Source Files" @uploadFiles="uploadDetailFiles")
                .project-info__upload-file
                    UploadFileButton(text="Reference Files" @uploadFiles="uploadRefFiles")
            .project-info__tasks-col       
                .project-info__add-tasks
                    Button(value="Add tasks" @clicked="addTasks")
        Tasks(
            :allTasks="currentProject.jobs"
        )
</template>

<script>
import SelectSingle from "../SelectSingle";
import SelectMulti from "../SelectMulti";
import UploadFileButton from "../UploadFileButton";
import Button from "../Button";
import LabelValue from "./LabelValue";
import Project from "./Project";
import ProjectShortDetails from "./ProjectShortDetails";
import Tasks from "./Tasks";
import { mapGetters, mapActions } from 'vuex';

export default {
    props: {
        
    },
    data() {
        return {
            templates: [
                {name: 'Excel segment limit', id: 'XLSwithLimit'},
                {name: 'Multilingual Excel', id: 'multiexcel'},
                {name: 'Standard processing', id: '247336FD'},        
            ],
            template: "",
            sourceLanguage: "",
            targetLanguages: [],
            service: "",
            statuses: ["Accepted", "Draft", "Open", "Ready"],
            detailFiles: [],
            refFiles: [] 
        }
    },
    methods: {
        ...mapActions({
            setProjectValue: "setProjectValue",
            storeProject: "setCurrentProject"
        }),
        setStatus({option}) {
           this.setProjectValue({value: option, prop: "status"}) 
        },
        setValue({option, refersTo}) {
            this[refersTo] = option;
        },
        setTargets({option}) {
            const lang = this.languages.find(item => {
                return item.lang === option;
            }) 
            const position = this.targetLangs.indexOf(lang.lang);
            if(position != -1) {
                this.targetLanguages.splice(position, 1)
            } else {
                this.targetLanguages.push(lang);
            }
        },
        uploadDetailFiles({files}) {
            this.detailFiles = files;
        },
        uploadRefFiles({files}) {
            this.refFiles = files;
        }
    },
    computed: {
        ...mapGetters({
            currentProject: 'getCurrentProject',
            languages: "getAllLanguages",
            services: "getVuexServices"
        }),
        allLangs() {
            return this.languages.map(item => {
                return item.lang
            })
        },
        allServices() {
            return this.services.map(item => {
                return item.title
            })
        },
        allTemplates() {
            return this.templates.map(item => {
                return item.name
            })
        },
        targetLangs() {
            return this.targetLanguages.map(item => {
                return item.lang
            })
        }
    },
    components: {
        SelectSingle,
        SelectMulti,
        UploadFileButton,
        Button,
        LabelValue,
        Project,
        ProjectShortDetails,
        Tasks
    },
    mounted() {
        if(!this.currentProject._id) {
            this.$router.replace({name: "pm-projects"})
        }
    }
}
</script>

<style lang="scss" scoped>
.project-info {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    &__title {
        padding: 20px 0 0 40px;
        font-size: 20px;
    }
    &__all-info {
        width: 100%;
        display: flex;
        align-items: flex-start;
    }    
    &__drop-menu {
        position: relative;
        height: 28px;
        width: 191px;
    }
    &__tasks {
        box-sizing: border-box;
        width: 60%;
        padding: 20px;
        margin-left: 20px;
        box-shadow: 0 3px 20px rgba(104, 87, 62, 0.5);
    }
    &__tasks-title {
        font-size: 18px; 
        margin-bottom: 15px;
    }
    &__input-data-row {
        margin-bottom: 20px;
        width: 100%;
        display: flex;
        justify-content: space-between;
    }
    &__tasks-col {
        width: 25%;
        height: 78px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;
    }
    &__add-tasks {
        display: flex;
        height: 78px;
        align-items: flex-end;
    }
}
</style>
