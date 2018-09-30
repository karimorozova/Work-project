<template lang="pug">
.project-info
    .project-info__title Project Details
    .project-info__all-info
        Project(:project="currentProject")
        ProjectShortDetails(:project="currentProject" @setStatus="setStatus")
    .project-info__tasks
        .project-info__tasks-title Tasks and Steps
        .project-info__tasks-row
            .project-info__drop-menu
                SelectSingle(:selectedOption="sourceLanguage" :options="languages")
            .project-info__drop-menu            
                SelectMulti(:selectedOptions="targetLanguages" :options="languages")
            .project-info__drop-menu           
                SelectSingle(:selectedOption="service" :options="services")
        .project-info__tasks-row
            .project-info__drop-menu
                SelectSingle(
                    :selectedOption="currentProject.template"
                    :options="templates"
                    placeholder="Project Template"
                    refersTo="template"
                    @chooseOption="setValue"
                )
            .project-info__upload-file
                UploadFileButton(text="Source Files" @uploadFiles="uploadFiles")
            .project-info__upload-file
                UploadFileButton(text="Reference Files" @uploadFiles="uploadFiles")
        Tasks(
            :allTasks="currentProject.jobs"
        )
</template>

<script>
import SelectSingle from "../SelectSingle";
import SelectMulti from "../SelectMulti";
import UploadFileButton from "../UploadFileButton";
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
                "template 1",
                "template 2",
                "template 3",
            ],
            sourceLanguage: "",
            targetLanguages: [],
            service: "",
            statuses: ["Accepted", "Draft", "Open", "Ready"]
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
            this.setProjectValue({value: option, prop: refersTo})
        },
        uploadFiles({files}) {
            console.log(files);
        }
    },
    computed: {
        ...mapGetters({
            currentProject: 'getCurrentProject',
            languages: "getAllLanguages",
            services: "getVuexServices"
        })
    },
    components: {
        SelectSingle,
        SelectMulti,
        UploadFileButton,
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
    &__tasks-row {
        margin-bottom: 20px;
        width: 70%;
        display: flex;
        justify-content: space-between;
    }
}
</style>
