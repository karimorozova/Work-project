<template lang="pug">
  .files-wrapper
    .table(v-if="jobFilesOffline.length" )
      ProjectReferenceFiles(:job="job" v-if="job.refFiles.length")
      GeneralTable(
        :fields="jobFilesOffline_fields"
        :tableData="jobFilesOffline"
      )
        template(v-for="field in jobFilesOffline_fields" :slot="field.headerKey" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="fileName" slot-scope="{ row, index }")
          .table__data
            .short {{ row.fileName }}
        template(slot="option" slot-scope="{ row, index }")
          .table__data {{ row.option }}
        template(slot="path" slot-scope="{ row, index }")
          .table__icons(v-if="row.path")
            .icon( @click="download(row.path)")
              i(class="fa-solid fa-download")

    .table(v-if="jobFilesOnlineCat.length" )
      ProjectReferenceFiles(:job="job" v-if="job.refFiles.length")
      GeneralTable(
        :fields="jobFilesOnlineCat_fields"
        :tableData="jobFilesOnlineCat"
      )
        template(v-for="field in jobFilesOnlineCat_fields" :slot="field.headerKey" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="fileName" slot-scope="{ row, index }")
          .table__data
            .short {{ row.fileName }}
        template(slot="option" slot-scope="{ row, index }")
          .table__data {{ row.option }}
        template(slot="progress" slot-scope="{ row, index }")
          .table__data
            span {{ getProgress(row.fullName) }}
            span.symbol %
        template(slot="path" slot-scope="{ row, index }")
          .table__icons(v-if="row.path" @click="download(row.path)")
            .icon
              i(class="fa-solid fa-download")
        template(slot="editor" slot-scope="{ row, index }")
          .table__icons(v-if="row.path")
            .icon(@click="goToMemoqEditor(row.fullName)")
              i(class="fa-solid fa-arrow-right-to-bracket")


    .table(v-if="jobFilesOnlineCatFake.length" )
      GeneralTable(
        :fields="jobFilesOnlineCatFake_fields"
        :tableData="jobFilesOnlineCatFake"
      )
        template(v-for="field in jobFilesOnlineCatFake_fields" :slot="field.headerKey" slot-scope="{ field }")
          .table__header {{ field.label }}

        template(slot="fileName" slot-scope="{ row, index }")
          .table__data
            .short {{ row.fileName }}
        template(slot="option" slot-scope="{ row, index }")
          .table__data {{ row.option }}
        template(slot="progress" slot-scope="{ row, index }")
          .table__data
            span {{ getProgress(row.fullName) }}
            span.symbol %
        template(slot="editor" slot-scope="{ row, index }")
          .table__icons
            .icon(@click="goToMemoqEditor(row.fullName)")
              i(class="fa-solid fa-arrow-right-to-bracket")


</template>

<script>
import GeneralTable from "../../general/GeneralTable"
import ProjectReferenceFiles from "./ProjectReferenceFiles"

export default {
  name: "ProjectFiles",
  components: { ProjectReferenceFiles, GeneralTable },
  props: {
    job: {
      type: Object
    }
  },
  data() {
    return {
      domain: '',
      jobFilesOffline: [],
      jobFilesOnlineCat: [],
      jobFilesOnlineCatFake: [],

      jobFilesOffline_fields: [
        { label: "Source File", headerKey: "h1", key: "fileName", style: { width: "42%" } },
        { label: "Option", headerKey: "h2", key: "option", style: { width: "42%" } },
        { label: "", headerKey: "h3", key: "path", style: { width: "16%" } }
      ],
      jobFilesOnlineCat_fields: [
        { label: "Source File", headerKey: "h1", key: "fileName", style: { width: "34%" } },
        { label: "Option", headerKey: "h2", key: "option", style: { width: "34%" } },
        { label: "Progress", headerKey: "h3", key: "progress", style: { width: "11%" } },
        { label: "", headerKey: "h4", key: "path", style: { width: "10%" } },
        { label: "Editor", headerKey: "h5", key: "editor", style: { width: "11%" } }
      ],
      jobFilesOnlineCatFake_fields: [
        { label: "Source File", headerKey: "h1", key: "fileName", style: { width: "39%" } },
        { label: "Option", headerKey: "h2", key: "option", style: { width: "39%" } },
        { label: "Progress", headerKey: "h3", key: "progress", style: { width: "11%" } },
        { label: "Editor", headerKey: "h4", key: "editor", style: { width: "11%" } }
      ]
    }
  },
  methods: {
    getProgress(fileName) {
      const docId = this.job.memoqDocs.find(item => item.DocumentName === fileName).DocumentGuid
      const value = (100 * this.job.progress[docId].wordsDone / this.job.progress[docId].totalWordCount).toFixed(2)
      return +value
    },
    goToMemoqEditor(fileName) {
      console.log(fileName)
      const { TotalWordCount, Reviewer1ConfirmedWordCount, WorkflowStatus, WebTransUrl, DocumentGuid } =
          this.job.memoqDocs.find(item => item.DocumentName === fileName && item.TargetLangCode === this.job.memoqTarget)

      // if ((TotalWordCount !== Reviewer1ConfirmedWordCount) && WorkflowStatus === 'Completed' && this.job.name === 'Revising') {
      // this.projectGuid = this.job.memoqProjectId
      // this.documentGuid = DocumentGuid
      // this.backStepModal = true
      // } else {
      // const newUrl = !WebTransUrl.includes('memoqweb') ? WebTransUrl.replace('/webtrans', 'memoqweb/webtrans') : WebTransUrl
      const newUrl = `${ 'https://memoq.pangea.global/memoqwebLegacy/webtrans/' + WebTransUrl.split('/webtrans/').pop() }`
      let link = document.createElement("a")
      link.target = "_blank"
      link.href = newUrl
      link.click()
      // }
    },
    download(path) {
      let link = document.createElement('a')
      link.href = path
      link.target = "_blank"
      link.click()
    },
    listOfSourceFiles() {
      const { prevStep, stepNumber, sourceFiles, targetFiles, memoqDocs } = this.job
      if (this.isCAT) {
        if (stepNumber === 1) {
          sourceFiles.length
              ? this.generateSourceFilesCat(sourceFiles)
              : this.generateSourceFilesFakeCat(memoqDocs)
        } else {
          sourceFiles.length
              ? (prevStep.hasOwnProperty("status") && prevStep.status === "Completed")
                  ? this.generateSourceFilesCat(targetFiles, true)
                  : this.generateSourceFilesCat(sourceFiles)
              : this.generateSourceFilesFakeCat(memoqDocs)
        }
      } else {
        if (!sourceFiles.length) return
        if (stepNumber === 1) {
          this.generateSourceFilesNonCat(sourceFiles)
        } else {
          if (prevStep.hasOwnProperty("status") && prevStep.status === "Completed") {
            this.generateSourceFilesNonCat(targetFiles.map(i => './dist' + i.path))
          }
        }
      }
    },
    generateSourceFilesNonCat(files) {
      for (let file of files) {
        let fileName = file.split('/').pop()
        this.jobFilesOffline.push({
          fileName,
          path: this.domain + file.split('./dist')[1],
          option: 'Offline workflow, download file to change.'
        })
      }
    },
    generateSourceFilesCat(files, isTargetFiles) {
      if (isTargetFiles) {
        const { sourceFiles } = this.job
        for (let file of sourceFiles) {
          let fileName = file.split('/').pop()
          this.jobFilesOnlineCat.push({
            fileName,
            path: this.domain + files.find(i => i.path.includes(fileName)).path,
            fullName: fileName,
            option: 'Memoq system workflow, enter editor to change.'
          })
        }
      } else {
        for (let file of files) {
          let fileName = file.split('/').pop()
          this.jobFilesOnlineCat.push({
            fileName,
            path: this.domain + file.split('./dist')[1],
            fullName: fileName,
            option: 'Memoq system workflow, enter editor to change.'
          })
        }
      }
    },
    generateSourceFilesFakeCat(memoqDocs) {
      memoqDocs.forEach(elem => {
        const fileName = elem.DocumentName
        this.jobFilesOnlineCatFake.push({
          fileName,
          option: 'Memoq system workflow, enter editor to change.',
          fullName: elem.DocumentName
        })
      })
    }
  },
  computed: {
    isCAT() {
      return this.job.payablesUnit.type === 'CAT Wordcount'
    }
  },
  mounted() {
    this.domain = process.env.domain
    this.listOfSourceFiles()
  }
}
</script>

<style lang="scss" scoped>
@import "assets/scss/colors";

.short {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 200px;
}

.symbol {
  color: $dark-border;
  margin-left: 4px;
}

.table {
  width: 740px;
  background-color: white;
  padding: 25px;
  border-radius: 4px;
  background-color: white;
  box-shadow: $box-shadow;
  margin-bottom: 25px;

  &__header {
    padding: 0 0 0 7px;
  }

  &__icons {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 8px;
  }

  &__data {
    padding: 0 7px;
  }
}

.icon {
  font-size: 15px;
  cursor: pointer;
}
</style>