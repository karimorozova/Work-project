<template lang="pug">
  .job-files
    .job-files__table
      DataTable(
        :fields="fields"
        :tableData="jobFiles"
        :bodyClass="jobFiles.length < 7 ? 'table_no-body-bottom-margin tbody_visible-overflow' : 'table_no-body-bottom-margin'"
        :tableHeadRowClass="jobFiles.length < 7 ? 'tbody_visible-overflow' : ''"
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
          .job-files__progress(v-if="row.category === 'Source file' && isTranslation")
            ProgressLine(:progress="getProgress(row)")
        template(slot="source" slot-scope="{ row, index }")
          .job-files_flex-centered
            a.job-files__link(:href='row.source')
              img.job-files__image(src="../../../assets/images/download.png")
        template(slot="target" slot-scope="{ row, index }")
          .job-files_flex-centered
            .job-files__link(v-if="isTargetLink(row)")
              img.job-files__image(src="../../../assets/images/download.png" @click="downloadTarget(row)")
        template(slot="editor" slot-scope="{ row, index }")
          .job-files__editor(v-if="isEditor && row.category === 'Source file'")
            img.job-files__icon(src="../../../assets/images/goto-editor.png" @click="goToMemoqEditor(row)")
</template>

<script>
	import DataTable from "~/components/Tables/DataTable";
	import ProgressLine from "~/components/ProgressLine";
	import { mapGetters, mapActions } from 'vuex';

	export default {
		data() {
			return {
				jobFiles: [],
				fields: [
					{ label: "File Name", headerKey: "headerFileName", key: "fileName", width: "35%", padding: 0 },
					{ label: "Category", headerKey: "headerCategory", key: "category", width: "20%", padding: 0 },
					{ label: "Progress", headerKey: "headerProgress", key: "progress", width: "15%", padding: 0 },
					{ label: "Source", headerKey: "headerSource", key: "source", width: "10%", padding: 0 },
					{ label: "Target", headerKey: "headerTarget", key: "target", width: "10%", padding: 0 },
					{ label: "Editor", headerKey: "headerEditor", key: "editor", width: "10%", padding: 0 }
				],
				domain: ""
			}
		},
		methods: {
			...mapActions({
				setJob: "selectJob",
				getJobs: "getJobs",
				alertToggle: "alertToggle"
			}),
			isTargetLink(file) {
				return this.job.status === 'Completed' || this.job.status === 'Cancelled Halfway';
			},
			getProgress(file) {
        return this.getMemoqFilesProgress(file.fileName)
        //MAX
				// return !this.job.memoqProjectId ? +this.job.progress : this.getMemoqFilesProgress(file.fileName);
			},
			getMemoqFilesProgress(fileName) {
				if(this.job.status !== 'Completed'){
					const docId = this.job.memoqDocIds.find(item => this.job.progress[item].fileName === fileName);
					const value = (100*this.job.progress[docId].wordsDone / this.job.progress[docId].totalWordCount).toFixed(2)
          return +value
        }else if(this.job.status === 'Completed'){
					return 100;
        } else{
					this.job.progress;
        }
			},
			toggleFilesShow() {
				this.isFilesShown = !this.isFilesShown;
			},
			fillJobFiles() {
				if(this.job.sourceFiles) {
					this.jobFiles.push(...this.jobFilesFiller(this.job.sourceFiles, "Source file"));
				}
				if(this.job.refFiles) {
					this.jobFiles.push(...this.jobFilesFiller(this.job.refFiles, "Reference file"));
				}
			},
			jobFilesFiller(arr, category) {
				let files = [];
				for (let file of arr) {
					const nameArr = file.split('/');
					const filePath = this.domain + file.split('./dist')[1];
					const fileName = nameArr[nameArr.length - 1];
					const targetFile = this.job.taskTargetFiles ? this.job.taskTargetFiles.find(item => item.fileName === fileName) : "";
					files.push({
						fileName,
						category: category,
						source: filePath,
						target: targetFile ? targetFile.path : ""
					})
				}
				return files;
			},
			async goToMemoqEditor(file) {
				const { WebTransUrl } = this.job.memocDocs.find(item => item.DocumentName === file.fileName && item.TargetLangCode === this.job.memoqTarget);
				let link = document.createElement("a");
				link.target = "_blank";
				link.href = WebTransUrl;
				link.click();
			},
			async downloadTarget(file) {
				const {type} = this.originallyUnits.find(item => item._id.toString() === this.job.serviceStep.unit.toString())
				if( type !== 'CAT Wordcount') {
					return this.createLinkAndDownolad(this.job.targetFile.split('./dist')[1]);
				}
				this.createLinkAndDownolad(file.target);
			},
			createLinkAndDownolad(href) {
				let link = document.createElement('a');
				link.href = this.domain + href;
				link.target = "_blank";
				link.click();
			}
		},
		computed: {
			...mapGetters({
				job: "getSelectedJob",
				originallyUnits: "getOriginallyUnits"
			}),
			isEditor() {
				if(this.job) {
					const { status, name } = this.job;
					return status === "Started" && name === "Translation";
				}
			},
      isTranslation(){
				return this.job.name === "Translation";
      },
		},
		components: {
			DataTable,
			ProgressLine
		},
		mounted() {
			this.domain = process.env.domain;
			this.fillJobFiles();
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
    box-shadow: 0 0 5px $brown-shadow;
    padding: 10px;
    width: 100%;
    box-sizing: border-box;

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
      padding: 0 3px;
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

</style>