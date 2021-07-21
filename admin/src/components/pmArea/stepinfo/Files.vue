<template lang="pug">
  .step-files
    StepInfoTitle(title="Files" :isIconReversed="isFilesShown" @titleClick="toggleFilesShow")
    .step-files__table(v-if="isFilesShown")
      DataTable(
        :fields="fields"
        :tableData="stepFiles"
        :bodyClass="stepFiles.length < 5 ? 'tbody_visible-overflow' : ''"
        :tableheadRowClass="stepFiles.length < 5 ? 'tbody_visible-overflow' : ''"
      )

        template(slot="headerFileName" slot-scope="{ field }")
          span.step-files__label {{ field.label }}
        template(slot="headerCategory" slot-scope="{ field }")
          span.step-files__label {{ field.label }}
        template(slot="headerLink" slot-scope="{ field }")
          span.step-files__label {{ field.label }}

        template(slot="fileName" slot-scope="{ row, index }")
          span.step-files__name(:class="{'step-files_break-word': row.fileName.length > 60}") {{ row.fileName }}
        template(slot="category" slot-scope="{ row, index }")
          span.step-files__data {{ row.category }}
        template(slot="link" slot-scope="{ row, index }")
          span(v-if="row.category !== 'Target'")
            a.step-files__link(:target="'_blank'" :href='row.link')
              img.step-files__image(src="../../../assets/images/download-big-b.png")
          span(v-else)
            a.step-files__link(v-if="isDownloadIcon(row)" :target="'_blank'" :href='row.link')
              img.step-files__image(src="../../../assets/images/download-big-b.png")
</template>

<script>
	import StepInfoTitle from "./finance/StepInfoTitle"
	import DataTable from "../../DataTable"
	import { mapGetters, mapActions } from 'vuex'

	export default {
		props: {
			stepFiles: {
				type: Array
			},
			step: {
				type: Object
			},
			projectId: {
				type: [ Number, String ]
			},
			originallyUnits: {
				type: Array
			}
		},
		data() {
			return {
				isFilesShown: false,
				isAllChecked: false,
				fields: [
					{ label: "File Name", headerKey: "headerFileName", key: "fileName", width: "60%", padding: 0 },
					{ label: "Category", headerKey: "headerCategory", key: "category", width: "20%", padding: 0 },
					{ label: "Link", headerKey: "headerLink", key: "link", width: "20%", padding: 0, cellClass: "step-files_centered" }
				]
			}
		},
		methods: {
			...mapActions({
				storeProject: "setCurrentProject",
				alertToggle: "alertToggle"
			}),
			toggleFilesShow() {
				this.isFilesShown = !this.isFilesShown
			},
			isDownloadIcon() {
				return this.isCompleted
			}
		},
		computed: {
			...mapGetters({
				currentProject: "getCurrentProject"
			}),
			getUnitTypeByUnitId() {
				return this.originallyUnits
						.find(unit => unit._id.toString() === this.step.serviceStep.unit).type
			},
			isCompleted() {
				const { progress, status } = this.step
				if (this.getUnitTypeByUnitId === 'CAT Wordcount') {
					return (progress.wordsDone / progress.totalWordCount * 100 >= 100 && status === 'Completed') || status === 'Cancelled Halfway'
				}
				return progress === 100
			}
		},
		components: {
			StepInfoTitle,
			DataTable
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

  .step-files {
    box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
    padding: 20px;
    border-radius: 4px;

    &__table {
      margin-top: 20px;
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

    &_break-word {
      word-break: break-word;
      align-items: baseline;
      overflow-y: auto;
    }
  }

</style>
