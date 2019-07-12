<template lang="pug">
.request-info
    .request-info__title Request Details : {{currentProject.requestId}}
    .request-info__all-info
        Request(:request="currentProject")
        RequestShortDetails(:request="currentProject")
    .request-info__all-info
        RequestTasksData(
            @setDate="setDate"
            @showErrors="showErrors"
            :isRequest="isRequest")
            ValidationErrors(v-if="areErrorsExist"
                :errors="errors"
                :isAbsolute="isBlockAbsoulte"
                @closeErrors="closeErrorsBlock"
            )
</template>

<script>
const ValidationErrors = () => import("../ValidationErrors");
import Request from "./Request";
import RequestShortDetails from "./RequestShortDetails";
import RequestTasksData from "./RequestTasksData";
import { mapGetters, mapActions } from 'vuex';

export default {
    data() {
        return {
            errors: [],
            areErrorsExist: false,
            isBlockAbsoulte: true,
            isEditAndSend: false,
            message: "",
            mailSubject: "",
            isRequest: true
        }
    },
    methods: {
        ...mapActions({
            setProjectValue: "setProjectValue",
            storeProject: "setCurrentProject",
            alertToggle: 'alertToggle',
            updateCurrentProject: "updateCurrentProject"
        }),
        async toggleProjectOption({key}) {
            try {
                const result = await this.$http.put("/pm-manage/project-option", {projectId: this.currentProject._id, property: key});
                await this.storeProject(result.body);
            } catch(err) {
                this.alertToggle({message: "Internal Server Error / Cannot update Project", isShow: true, type: "error"})
            }
        },
        async setDate({date, prop, index}) {
            try {
                await this.setStepDate({value: date, prop, index});
                await this.updateCurrentProject({...this.currentProject, id: this.currentProject._id});
            } catch(err) { }
        },
        async refreshCustomerInfo() {
            const client = await this.$http.get(`/clientsapi/client?id=${this.currentProject.customer._id}`);
            await this.setProjectValue({prop: 'customer', value: client.body});
        },
        showErrors({errors}) {
            this.errors = [...errors];
            this.areErrorsExist = true;
        },
        closeErrorsBlock() {
            this.areErrorsExist = false;
            this.errors = [];
        },
        editAndSend({message, subject}) {
            this.isEditAndSend = true;
            this.message = message.data.message;
            this.mailSubject = subject;
        },
        async getRequest() {
            const { id } = this.$route.params;
            try {
                if(!this.currentProject._id) {
                    const curProject = await this.$http.get(`/pm-manage/request?id=${id}`);
                    await this.storeProject(curProject.body);
                }
            } catch(err) {

            }
        }
    },
    computed: {
        ...mapGetters({
            currentProject: 'getCurrentProject'
        })
    },
    components: {
        ValidationErrors,
        Request,
        RequestShortDetails,
        RequestTasksData,
    },
    created() {
        this.getRequest();
    },
    beforeRouteEnter (to, from, next) {
        next(async (vm) => {
            if(from.name === "client-details") {
                await vm.refreshCustomerInfo();
            }
        })
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.request-info {
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
        box-sizing: border-box;
        padding-left: 20px;
    }
    &__action {
        width: 20%;
        @media (max-width: 1600px) {
            width: 23%;
        }
    }
}
</style>
