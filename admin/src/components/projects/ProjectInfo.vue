<template lang="pug">
.project-info
    .project-info__title Project Details
    .project-info__all-info
        .project-info__project-details
            .project-info__details
                .project-info__data-item
                    LabelValue(label="Project Name" :value="project.projectName")
                    LabelValue(label="Project ID" :value="project.projectId")
                .project-info__data-item
                    LabelValue(label="Status" :value="project.status")
                    LabelValue(label="Total Cost" :value="project.totalCost")
            .project-info__jobs
                Jobs(
                    :allJobs="project.jobs"
                )
        .project-info__descriptors
            JobDescriptors(
                :project="project"
            )
</template>

<script>
import DataTable from "../DataTable";
import Vendorselect from "./Vendorselect";
import LabelValue from "./LabelValue";
import Jobs from "./Jobs"
import JobDescriptors from "./JobDescriptors"

export default {
    props: {
        project: {
            type: Object
        }
    },
    data() {
        return {

        }
    },
    components: {
        Vendorselect,
        DataTable,
        LabelValue,
        Jobs,
        JobDescriptors
    }
}
</script>

<style lang="scss" scoped>
.project-info {
    position: relative;
    display: flex;
    flex-direction: column;
    border: 1px solid #938676;
    &__title {
        padding: 20px;
        border-bottom: 1px solid #938676;
        font-size: 20px;
    }
    &__all-info {
        display: flex;
    }
    &__project-details {
        width: 70%;
        padding: 20px;
    }
    &__details {
        width: 100%;
        display: flex;
        justify-content: space-around;
    }
    &__data-item {
        display: flex;
        flex-direction: column;
    }
    &__descriptors {
        display: flex;
        justify-content: center;
        align-items: center;
        border-left: 1px solid #938676;
        background-color: #F4F0ee;
        width: 30%;
    }
}
</style>
