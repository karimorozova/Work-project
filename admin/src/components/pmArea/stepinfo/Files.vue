<template lang="pug">
  .files
    .files__title Files
    .files__close(@click.stop="close") &#215;
    .files__descriptions
      div {{ task.taskId }}
      .split |
      div {{ task.service.title }}
      .split |
      div {{ task.sourceLanguage === task.targetLanguage ? task.fullTargetLanguage.lang : task.fullSourceLanguage.lang + ' to ' + task.fullTargetLanguage.lang }}

    .files__table
      .table
        GeneralTable(
          :fields="fields"
          :tableData="fileList"
        )

          template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
            .table__header {{ field.label }}

          template(slot="fileName" slot-scope="{ row, index }")
            .table__data {{ row.fileName }}
          template(slot="stage" slot-scope="{ row, index }")
            .table__data {{ row.stage }}
          template(slot="category" slot-scope="{ row, index }")
            .table__data {{ row.category }}
          template(slot="link" slot-scope="{ row, index }")
            .table__data
              a.table__icon(:target="'_blank'" :href='row.path')
                img.files__image(src="../../../assets/images/latest-version/download-file.png")

    .files__buttons
      .button(v-if="isAvailableReimportFile")
        Button(value="Reimport Targets" :outline="true" @clicked="reImportFinalFilesFromMemoq")

</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import GeneralTable from "../../GeneralTable"
import Button from "../../Button"

export default {
  props: {
    task: {
      type: Object
    }
  },
  data() {
    return {
      isFilesShown: false,
      isAllChecked: false,
      fields: [
        { label: "File Name", headerKey: "headerFileName", key: "fileName", style: { width: "47%" } },
        { label: "Stage", headerKey: "headerStage", key: "stage", style: { width: "28%" } },
        { label: "Category", headerKey: "headerCategory", key: "category", style: { width: "16%" } },
        { label: "Link", headerKey: "headerLink", key: "link", style: { width: "9%" } }
      ]
    }
  },
  methods: {
    ...mapActions({
      storeProject: "setCurrentProject",
      alertToggle: "alertToggle"
    }),
    reImportFinalFilesFromMemoq() {
      this.$emit('reImportFinalFilesFromMemoq', [ this.task._id ])
    },
    close() {
      this.$emit('close')
    }
  },
  computed: {
    ...mapGetters({
      currentProject: "getCurrentProject"
    }),
    isAvailableReimportFile() {
      const { memoqFiles, status } = this.task
      return status === 'Pending Approval [DR1]' && memoqFiles.length
    },
    fileList() {
      const files = []
      if (Object.keys(this.task).length && this.currentProject) {
        const { steps } = this.currentProject
        if (this.task.refFiles) {
          this.task.refFiles.forEach(elem => {
            files.push({ fileName: `${ elem.split('/').pop() }`, path: `${ elem.split('./dist').pop() }`, stage: `Original file`, category: 'Reference' })
          })
        }
        if (this.task.sourceFiles) {
          this.task.sourceFiles.forEach(elem => {
            files.push({ fileName: `${ elem.split('/').pop() }`, path: `${ elem.split('./dist').pop() }`, stage: `Original file`, category: 'Source' })
          })
        }
        if (this.task.targetFilesStages.length) {
          this.task.targetFilesStages.forEach(elem => {
            const neededSteps = steps.find(item => item._id.toString() === elem.stepId.toString())
            if (elem.files.length) {
              elem.files.forEach(file => {
                files.push({ fileName: `${ file.fileName }`, path: `${ file.path }`, stage: `[S${ neededSteps.stepNumber }] ${ neededSteps.step.title }`, category: 'Target' })
              })
            }
          })
        }
        if (this.task.targetFilesFinalStage && this.task.targetFilesFinalStage.length) {
          this.task.targetFilesFinalStage.forEach(elem => {
            files.push({ fileName: `${ elem.fileName }`, path: `${ elem.path }`, stage: `Final`, category: 'Target' })
          })
        }
      }
      return files
    }
  },
  components: {
    Button,
    GeneralTable
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.split {
  margin: 0px 10px;
  color: $dark-border;
}

.button {
  margin-top: 15px;
}

.files {
  width: 800px;

  &__descriptions {
    margin-bottom: 15px;
    display: flex;
    justify-content: center;
  }

  &__title {
    font-size: 18px;
    font-family: Myriad600;
    margin-bottom: 10px;
  }

  &__close {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 22px;
    cursor: pointer;
    height: 22px;
    width: 22px;
    justify-content: center;
    display: flex;
    align-items: center;
    font-family: Myriad900;
    opacity: 0.8;
    transition: ease 0.2s;

    &:hover {
      opacity: 1
    }
  }
}

.table {
  &__header,
  &__data {
    padding: 0 7px;
    width: 100%;
    text-align: left;
  }

  &__icon {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

</style>
