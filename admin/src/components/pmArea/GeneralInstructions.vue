<template lang="pug">
    .gen-instructions
        .checks-block
            .checks-block__title General Instructions
            .checks-block__item
                CheckCircle
                .checks-block__label Setup
                .checks-block__text Lorem ipsum dolor sit amet, consectetur adipiscing elit
            .checks-block__item
                CheckCircle
                .checks-block__label Delivery
                .checks-block__text Lorem ipsum dolor sit amet, consectetur adipiscing elit
            .checks-block__item
                CheckCircle
                .checks-block__label Invoicing
                .checks-block__text Lorem ipsum dolor sit amet, consectetur adipiscing elit
            .checks-block__title Specific Instructions
            .checks-block__item
                CheckCircle
                .checks-block__label Specific 1
                .checks-block__text Lorem ipsum dolor sit amet, consectetur adipiscing elit
        .drops
            .drops__item
                .drops__label Account Manager:
                    img.drops__assigned-icon(v-if="!project.isAssigned && project.requestId" src="../../assets/images/Other/assigned_status.png")
                .drops__menu
                    SelectSingle(
                        :options="accManagers" 
                        :selectedOption="selectedAccManager" 
                        @chooseOption="(e) => setManager(e, 'accountManager')")
            .drops__item
                .drops__label Project Manager:
                    img.drops__assigned-icon(v-if="project.isAssigned && project.requestId" src="../../assets/images/Other/assigned_status.png")
                .drops__menu
                    SelectSingle(
                        :options="projManagers" 
                        :selectedOption="selectedProjManager"
                        @chooseOption="(e) => setManager(e, 'projectManager')")
            slot
</template>

<script>
import { mapActions } from 'vuex';
import CheckCircle from '@/components/CheckCircle';
import SelectSingle from '@/components/SelectSingle';

export default {
    props: {
        project: {type: Object}
    },
    data() {
        return {
            managers: [],
        }
    },
    methods: {
        ...mapActions([
            "alertToggle",
            "setRequestValue",
            "setProjectValue"
        ]),
        async setManager({option}, prop) {
            const manager = this.managers.find(item => `${item.firstName} ${item.lastName}` === option);
            if(manager._id === this.project[prop]._id) return;
            try {
                if(this.type === 'project') {
                    await this.setProjectValue({id: this.project._id, prop, value: manager});
                } else {
                    this.$emit('reassignManager', {prop, manager});
                }
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
            let result = [];
            if(this.managers.length) {
                result = this.managers.filter(item => item.group.name === "Account Managers");
                result = result.map(item => `${item.firstName} ${item.lastName}`)
            }
            return result;
        },
        projManagers() {
            let result = [];
            if(this.managers.length) {
                result = this.managers.filter(item => item.group.name === "Project Managers");
                result = result.map(item => `${item.firstName} ${item.lastName}`)
            }
            return result;
        },
        selectedAccManager() {
            return this.project.accountManager ? this.project.accountManager.firstName + " " + this.project.accountManager.lastName : "";
        },
        selectedProjManager() {
            return this.project.projectManager ? this.project.projectManager.firstName + " " + this.project.projectManager.lastName : "";
        },
        type() {
            return this.project.projectId ? "project" : "request";
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

.gen-instructions {
    box-sizing: border-box;
    width: 20%;
    margin-top: 20px;
    padding: 25px;
    box-shadow: 0 0 10px #67573e9d;
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
    &__title {
        margin-bottom: 10px;
        font-weight: bolder; 
    }
    &__item {
        @extend %item-style;
    }
    &__label {
        width: 30%;
        font-size: 14px;
        font-weight: bolder;
        margin-left: 10px;
    }
    &__text {
        display: inline-block;
        width: 70%;
        font-size: 14px;
    }
}

.drops {
    width: 100%;
    padding-top: 25px;
    position: relative;
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
    &__label {
        position: relative;
    }
    &__assigned-icon {
        position: absolute;
        left: -18px;
        width: 15px;
    }
}

</style>
