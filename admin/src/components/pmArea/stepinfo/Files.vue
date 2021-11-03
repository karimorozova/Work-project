<template lang="pug">
  .files
    .files__title Files
    .files__close(@click.stop="close") &#215;
    .files__descriptions
      div {{ task.taskId }}
      .split /
      div {{ task.service.title }}
      .split /
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
</template>

<script>
import StepInfoTitle from "./finance/StepInfoTitle"
import { mapGetters, mapActions } from 'vuex'
import GeneralTable from "../../GeneralTable"

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
        { label: "Stage", headerKey: "headerStage", key: "stage", style: { width: "25%" } },
        { label: "Category", headerKey: "headerCategory", key: "category", style: { width: "18%" } },
        { label: "Link", headerKey: "headerLink", key: "link", style: { width: "10%" } }
      ]
    }
  },
  methods: {
    ...mapActions({
      storeProject: "setCurrentProject",
      alertToggle: "alertToggle"
    }),
    close() {
      this.$emit('close')
    }
  },
  computed: {
    ...mapGetters({
      currentProject: "getCurrentProject"
    }),
    fileList() {
      const files = []
      if (Object.keys(this.task).length && this.currentProject) {
        const { steps } = this.currentProject
        const neededSteps = steps.filter(item => item.taskId === this.task.taskId).filter(({ status }) => status !== 'Cancelled Halfway')
        if (this.task.refFiles) {
          this.task.refFiles.forEach(elem => {
            files.push({ fileName: `${ elem.split('/').pop() }`, path: `${ elem.split('./dist').pop() }`, stage: `Uploaded by manager`, category: 'Reference' })
          })
        }
        if (this.task.sourceFiles) {
          this.task.sourceFiles.forEach(elem => {
            files.push({ fileName: `${ elem.split('/').pop() }`, path: `${ elem.split('./dist').pop() }`, stage: `Uploaded by manager`, category: 'Source' })
          })
        }
        if (this.task.targetFilesStage1) {
          this.task.targetFilesStage1.forEach(elem => {
            files.push({ ...elem, stage: `${ neededSteps[0].name } finished`, category: 'Target' })
          })
        }
        if (this.task.targetFilesStage2) {
          this.task.targetFilesStage2.forEach(elem => {
            files.push({ ...elem, stage: `${ neededSteps[1].name } finished`, category: 'Target' })
          })
        }
      }
      return files
    }
  },
  components: {
    GeneralTable,
    StepInfoTitle
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.split {
  margin: 0px 10px;
}

.files {
  width: 800px;

  &__descriptions {
    padding: 15px 10px 13px 10px;
    background: $table-list;
    display: flex;
    font-family: 'Myriad300';
  }

  &__title {
    font-size: 19px;
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
