<template lang="pug">
.request-info(v-if="currentProject._id")
    .request-info__title Request Details : {{currentProject.requestId}}
    .request-info__all-info
        Request(:request="currentProject")
        GeneralInstructions(:project="currentProject")
        .request-info__disabled(v-if="isDisabled")
    .request-info__all-info
        RequestTasksData(
            @setDate="setDate"
            @showErrors="showErrors"
            )
            ValidationErrors(v-if="areErrorsExist"
                :errors="errors"
                :isAbsolute="isBlockAbsoulte"
                @closeErrors="closeErrorsBlock"
            )
        .request-info__disabled(v-if="isDisabled")
</template>

<script>
const ValidationErrors = () => import("../ValidationErrors");
import Request from "./Request";
import GeneralInstructions from "./GeneralInstructions";
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
            currentProject: 'getCurrentProject',
            user: 'getUser'
        }),
        isDisabled() {
            if(this.user.group.name === 'Administrators' || this.user.group.name === 'Developers') return false;
            if(this.currentProject.isAssigned) {
                return this.currentProject.projectManager._id !== this.user._id;
            } else {
                return this.currentProject.accountManager._id !== this.user._id;
            }
        }
    },
    components: {
        ValidationErrors,
        Request,
        GeneralInstructions,
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
        position: relative;
    }
    &__disabled {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        opacity: 0;
        z-index: 10;
    }
    &__action {
        width: 20%;
        @media (max-width: 1600px) {
            width: 23%;
        }
    }
}
</style>
