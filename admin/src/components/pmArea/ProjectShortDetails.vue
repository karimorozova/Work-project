<template lang="pug">
.project-details
    .project-details__project-id {{ project.projectId }}
    .project-details__status
        LabelValue(label="Project Status")
            .project-details__drop-menu
                SelectSingle(
                    :selectedOption="project.status"
                    :options="statuses"
                    @chooseOption="setStatus"
                )
    .project-details__contacts
        .project-details__contact-title Client Contact
        .project-details__contact-name {{ project.customer.contactName }}
</template>

<script>
import SelectSingle from "../SelectSingle";
import LabelValue from "./LabelValue";

export default {
    props: {
        project: {
            type: Object
        }
    },
    data() {
        return {
            statuses: ["Accepted", "Draft", "Open", "Ready"]
        }
    },
    methods: {
        setStatus({option}) {
            this.$emit('setStatus', {option: option})
        }
    },
    components: {
        SelectSingle,
        LabelValue
    },
}
</script>

<style lang="scss" scoped>
.project-details {
    box-sizing: border-box;
    width: 20%;
    margin-top: 20px;
    padding: 10px 20px;
    box-shadow: 0 3px 20px rgba(104, 87, 62, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    &__project-id {
        font-size: 26px;
        display: flex;
        justify-content: center;
        margin-bottom: 15px;
    }
    &__status {
        width: 100%;
        margin-bottom: 15px;
    }
    &__contacts {
        width: 100%;
    }
    &__contact-title {
        font-weight: 700;
        font-size: 20px;
    }
    &__drop-menu {
        position: relative;
        height: 28px;
        width: 191px;
    }
}
</style>
