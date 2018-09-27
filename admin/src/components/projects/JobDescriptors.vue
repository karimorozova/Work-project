<template lang="pug">
.descriptors
    .descriptors__service
        LabelValue(
            label="Service"
            :value="project.service"
        )
    .descriptors__industry
        LabelValue(
            label="Industry"
            :value="project.industry"
        )
    .descriptors__request-date
        LabelValue(
            label="Requested On"
            :value="project.createdAt.split('T')[0].split('-').reverse().join('-')"
        )
    .descriptors__deadline
        LabelValue(
            label="Suggested Deadline"
            :value="project.date.split('T')[0].split('-').reverse().join('-')"
        )
</template>

<script>
import LabelValue from "./LabelValue";

export default {
    props: {
        project: {
            type: Object
        }
    },
    components: {
        LabelValue
    }
}
</script>

<style lang="scss" scoped>
.descriptors {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
</style>
