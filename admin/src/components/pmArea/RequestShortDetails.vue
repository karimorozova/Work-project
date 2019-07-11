<template lang="pug">
    .request-details
        .checks-block
            .checks-block__item
                CheckCircle(:isChecked="request.isDeadlineApproved")
                span.checks-block__text Approve Deadline
            .checks-block__item
                CheckCircle(:isChecked="!isUnapprovedFile")
                .checks-block__text Check Files
            .checks-block__item
                CheckCircle(:isChecked="request.isBriefApproved")
                .checks-block__text Rewrite Brief
        .drops
            .drops__item
                .drops__text Account Manager:
                .drops__menu
                    SelectSingle(
                        :options="accManagers" 
                        :selectedOption="selectedAccManager" 
                        @chooseOption="(e) => setManager(e, 'accountManager')")
            .drops__item
                .drops__text Project Manager:
                .drops__menu
                    SelectSingle(
                        :options="projManagers" 
                        :selectedOption="selectedProjManager"
                        @chooseOption="(e) => setManager(e, 'projectManager')")
</template>

<script>
import { mapActions } from 'vuex';
import CheckCircle from '@/components/CheckCircle';
import SelectSingle from '@/components/SelectSingle';

export default {
    props: {
        request: {type: Object}
    },
    data() {
        return {
            managers: [],
        }
    },
    methods: {
        ...mapActions({
            alertToggle: "alertToggle",
            setRequestValue: "setRequestValue"
        }),
        async setManager({option}, prop) {
            const manager = this.managers.find(item => `${item.firstName} ${item.lastName}` === option);
            try {
                await this.setRequestValue({id: this.request._id, prop, value: manager});
            } catch(err) { }
        },
        async getManagers() {
            try {
                const result = await this.$http.get('/users')
                this.managers = result.data;
            } catch(err) {
                this.alertToggle({message: "Error on getting managers", isShow: true, type: "error"});
            }
        }
    },
    computed: {
        accManagers() {
            const result = this.managers.filter(item => item.group.name === "Sales" || item.group.name === "Account Managers");
            return result.map(item => `${item.firstName} ${item.lastName}`)
        },
        projManagers() {
            const result = this.managers.filter(item => item.group.name === "Project Managers");
            return result.map(item => `${item.firstName} ${item.lastName}`)
        },
        isUnapprovedFile() {
            if(this.request.sourceFiles && this.request.refFiles) {
                const allFiles = [...this.request.sourceFiles, ...this.request.refFiles];
                return allFiles.find(item => !item.isApproved);
            }
            return true;
        },
        selectedAccManager() {
            return this.request.accountManager ? this.request.accountManager.firstName + " " + this.request.accountManager.lastName : "";
        },
        selectedProjManager() {
            return this.request.projectManager ? this.request.projectManager.firstName + " " + this.request.projectManager.lastName : "";
        }
    },
    components: {
        CheckCircle,
        SelectSingle
    },
    created() {
        this.getManagers();
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

%item-style {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.request-details {
    box-sizing: border-box;
    width: 20%;
    margin-top: 20px;
    padding: 25px;
    box-shadow: 0 3px 20px $brown-shadow;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    @media (max-width: 1600px) {
        width: 23%;
    }
}

.checks-block {
    width: 100%;
    padding-bottom: 15px;
    border-bottom: 2px solid $light-brown;
    &__item {
        @extend %item-style;
    }
    &__text {
        display: inline-block;
        width: 70%;
        margin-left: 10px;
        font-size: 14px;
        font-weight: bolder;
        border-bottom: 1px solid $light-brown;
    }
}

.drops {
    width: 100%;
    padding-top: 25px;
    &__menu {
        position: relative;
        width: 165px;
        height: 30px;
    }
    &__item {
        @extend %item-style;
        width: 100%;
        justify-content: space-between;
    }
    &__text {
        font-size: 14px;
        font-weight: bolder;
    }
}

</style>
