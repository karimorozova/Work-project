<template lang="pug">
  .job-files

    .job-files__modal(v-if="backStepModal")
      ApproveModal(
        text="Our system has detected that you have closed a task before it is complete.  Do you want to continue and make it to the end ?"
        :isCentered="true"
        approveValue="Yes"
        notApproveValue="Cancel"
        @approve="reopenStep"
        @notApprove="closeModal"
        @close="closeModal"
      )

    .job-files__table(v-if="jobFiles.length")
      DataTable(
        :fields="fields"
        :tableData="jobFiles"
        :bodyClass="[{ 'tbody_visible-overflow': jobFiles.length < 6 }]",
        :tableheadRowClass="[{ 'tbody_visible-overflow': jobFiles.length < 6 }]",
        bodyRowClass="cursor-default"
      )
        template(slot="headerFileName" slot-scope="{ field }")
          span.job-files__label {{ field.label }}
        template(slot="headerCategory" slot-scope="{ field }")
          span.job-files__label {{ field.label }}
        template(slot="headerProgress" slot-scope="{ field }")
          span.job-files__label {{ field.label }}
        template(slot="headerSource" slot-scope="{ field }")
          span.job-files__label {{ field.label }}
        template(slot="headerTarget" slot-scope="{ field }")
          span.job-files__label {{ field.label }}
        template(slot="headerEditor" slot-scope="{ field }")
          span.job-files__label {{ field.label }}
        template(slot="fileName" slot-scope="{ row, index }")
          span.job-files__name(:class="{'job-files_break-word': row.fileName.length > 40}") {{ row.fileName }}
        template(slot="category" slot-scope="{ row, index }")
          span.job-files__data {{ row.category }}
        template(slot="progress" slot-scope="{ row, index }")
          .job-files__progress(v-if="row.category === 'Source file' && isCAT")
            ProgressLine(:progress="getProgress(row)")
        //template(slot="source" slot-scope="{ row, index }")
          .job-files_flex-centered
            a.job-files__link(:href='row.source')
              img.job-files__image(src="../../../assets/images/download.png")

        template(slot="target" slot-scope="{ row, index }")
          .job-files_flex-centered(v-if="row.category === 'Source file'")
            .job-files__link(v-if="isTargetLink(row)")
              img.job-files__image(src="../../../assets/images/download.png" @click="downloadTarget(row)")

        template(slot="editor" slot-scope="{ row, index }")
          .job-files__editor(v-if="isEditor && row.category === 'Source file'")
            span.icon-editor(@click="goToMemoqEditor(row)")
              i.fas.fa-external-link-alt
            //img.job-files__icon(src="../../../assets/images/goto-editor.png" @click="goToMemoqEditor(row)")

</template>

<script>
	import DataTable from "../../../components/overall/DataTable"
	import ProgressLine from "~/components/ProgressLine"
	import { mapGetters, mapActions } from 'vuex'
	import ApproveModal from "../../../components/ApproveModal"

	export default {
		data() {
			return {
				jobFiles: [],
				fields: [
					{ label: "File Name", headerKey: "headerFileName", key: "fileName", width: "35.8%", padding: 0 },
					{ label: "Category", headerKey: "headerCategory", key: "category", width: "17.5%", padding: 0 },
					{ label: "Progress", headerKey: "headerProgress", key: "progress", width: "17.5%", padding: 0 },
					{ label: "Source", headerKey: "headerSource", key: "source", width: "10.1%", padding: 0 },
					{ label: "Target", headerKey: "headerTarget", key: "target", width: "10.1%", padding: 0 },
					{ label: "Editor", headerKey: "headerEditor", key: "editor", width: "9%", padding: 0 }
				],
				domain: "",
				backStepModal: false,
				projectGuid: null,
				documentGuid: null
			}
		},
		methods: {
			...mapActions({
				setJob: "selectJob",
				getJobs: "getJobs",
				alertToggle: "alertToggle"
			}),
			closeModal() {
				this.backStepModal = false
			},
			async reopenStep() {
				try {
					await this.$axios.post('/vendor/reopen-task-workFlowStatus', {
						token: this.getToken,
						projectGuid: this.projectGuid,
						documentGuid: this.documentGuid,
						workFlowStatus: 'Review1InProgress'
					})
					this.alertToggle({ message: "Work can be continued", isShow: false, type: "error" })
				} catch (err) {
					this.alertToggle({ message: "Error in Reopen Task", isShow: false, type: "error" })
				} finally {
					this.closeModal()
					location.reload()
				}
			},
			isTargetLink(file) {
				return this.job.status === 'Completed' || this.job.status === 'Cancelled Halfway'
			},
			getProgress(file) {
				return this.getMemoqFilesProgress(file.fileName)
				//MAX
				// return !this.job.memoqProjectId ? +this.job.progress : this.getMemoqFilesProgress(file.fileName);
			},
			getMemoqFilesProgress(fileName) {
				if (this.job.status !== 'Completed') {
					const docId = this.job.memoqDocIds.find(item => this.job.progress[item].fileName === fileName)
					const value = (100 * this.job.progress[docId].wordsDone / this.job.progress[docId].totalWordCount).toFixed(2)
					return +value
				} else if (this.job.status === 'Completed') {
					return 100
				} else {
					this.job.progress
				}
			},
			toggleFilesShow() {
				this.isFilesShown = !this.isFilesShown
			},
			fillJobFiles() {
				if (this.job.sourceFiles) {
					this.jobFiles.push(...this.jobFilesFiller(this.job.sourceFiles, "Source file"))
				}
				if (this.job.refFiles) {
					this.jobFiles.push(...this.jobFilesFiller(this.job.refFiles, "Reference file"))
				}
			},
			jobFilesFiller(arr, category) {
				let files = []
				for (let file of arr) {
					const nameArr = file.split('/')
					const filePath = this.domain + file.split('./dist')[1]
					const fileName = nameArr[nameArr.length - 1]
					const targetFile = this.job.taskTargetFiles ? this.job.taskTargetFiles.find(item => item.fileName === fileName) : ""
					files.push({
						fileName,
						category: category,
						source: filePath,
						target: targetFile ? targetFile.path : ""
					})
				}
				return files
			},
			async goToMemoqEditor(file) {
				const { TotalWordCount, Reviewer1ConfirmedWordCount, WorkflowStatus, WebTransUrl, DocumentGuid } =
						this.job.memocDocs.find(item => item.DocumentName === file.fileName && item.TargetLangCode === this.job.memoqTarget)

				if ((TotalWordCount !== Reviewer1ConfirmedWordCount) && WorkflowStatus === 'Completed' && this.job.name === 'Revising') {
					this.projectGuid = this.job.memoqProjectId
					this.documentGuid = DocumentGuid
					this.backStepModal = true
				} else {
					const newUrl = !WebTransUrl.includes('memoqweb') ? WebTransUrl.replace('/webtrans', 'memoqweb/webtrans') : WebTransUrl
					let link = document.createElement("a")
					link.target = "_blank"
					link.href = newUrl
					link.click()
				}
			},
			async downloadTarget(file) {
				const { type } = this.originallyUnits.find(item => item._id.toString() === this.job.serviceStep.unit.toString())
				if (type !== 'CAT Wordcount') {
					return this.createLinkAndDownolad(this.job.targetFile.split('./dist')[1])
				}
				this.createLinkAndDownolad(file.target)
			},
			createLinkAndDownolad(href) {
				let link = document.createElement('a')
				link.href = this.domain + href
				link.target = "_blank"
				link.click()
			},
			isCATWordcount(unitId) {
				return this.originallyUnits.find(item => item._id.toString() === unitId).type === 'CAT Wordcount'
			}
		},
		computed: {
			...mapGetters({
				job: "getSelectedJob",
				originallyUnits: "getOriginallyUnits",
				getToken: "getToken"
			}),
			isEditor() {
				if (this.job) {
					const { status, serviceStep } = this.job
					return status === "Started" && this.isCATWordcount(serviceStep.unit)
				}
			},
			isCAT() {
				return this.isCATWordcount(this.job.serviceStep.unit)
			}
		},
		components: {
			ApproveModal,
			DataTable,
			ProgressLine
		},
		mounted() {
			this.domain = process.env.domain
			this.fillJobFiles()
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  %flex {
    display: flex;
    align-items: center;
    padding-left: 5px;
    height: 30px;
  }

  .job-files {
    border-top: 1px solid rgb(197, 191, 181);
    padding: 20px;
    width: 100%;
    box-sizing: border-box;

    &__modal {
      top: 56%;
      position: absolute;
      left: 33%;
      z-index: 500;
    }

    &__image {
      height: 18px;
      width: 18px;
      cursor: pointer;
    }

    &__data, &__checkbox, &__name {
      @extend %flex;
    }

    &__link {
      @extend %flex;
      padding-left: 0;
    }

    &__progress {
      @extend %flex;
      padding: 0 7px;
    }

    &__editor {
      @extend %flex;
      padding: 0;
      justify-content: center;
    }

    &_break-word {
      word-break: break-word;
      align-items: baseline;
      overflow-y: auto;
    }

    &_flex-centered {
      display: flex;
      justify-content: center;
    }
  }
  .icon-editor{
    font-size: 18px;
    cursor: pointer;
    margin-top: 3px;
  }

</style>
