<template lang="pug">
.preview
    .preview__title Quote Details
    .preview__details
        .preview__item {{ project.projectId }}
        .preview__item {{ project.projectName }}
        .preview__item {{ project.service }}
        .preview__item {{ project.deadline }}
        .preview__item {{ projectLanguages }}
        .preview__item {{  }}
        .preview__item
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
    computed: {
        ...mapGetters({
            project: "getCurrentProject"
        }),
        projectLanguages() {
            let result = this.project.tasks.reduce((init, cur) => {
                return `${init}${cur.sourceLanguage}${cur.targetLanguage}; `
            }, "")
        }
    }    
}
</script>

<style lang="scss" scoped>

</style>
