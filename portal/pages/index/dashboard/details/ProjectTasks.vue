<template lang="pug">
  .tasks-table
    DataTable(
      :fields="fields"
      :tableData="projectTasks"
      bodyRowClass="cursor-default"
      :bodyClass="[{ 'tbody_visible-overflow': projectTasks.length < 6 }]",
      :tableheadRowClass="[{ 'tbody_visible-overflow':projectTasks.length < 6 }]",
      :rowClass="'withoutCursor'"
    )
      .tasks-table__header(slot="headerPair" slot-scope="{ field }") {{ field.label }}
      .tasks-table__header(slot="headerStatus" slot-scope="{ field }") {{ field.label }}
      .tasks-table__header(slot="headerProgress" slot-scope="{ field }") {{ field.label }}
      .tasks-table__header(slot="headerWordcount" slot-scope="{ field }") {{ field.label }}
      .tasks-table__header(slot="headerCost" slot-scope="{ field }") {{ field.label }}
      .tasks-table__header(slot="headerDownload" slot-scope="{ field }") {{ field.label }}
      .tasks-table__data(slot="pair" slot-scope="{ row }") {{ getLanguagePair(row) }}
      .tasks-table__status(slot="status" slot-scope="{ row }") {{ row.status }}
        .tasks-table__timestamp(v-if="row.isDelivered && row.status === 'Delivered'")
          img.tasks-table__time-icon(src="../../../../assets/images/time_icon.png")
          .tasks-table__time-data {{ getDeliveredTime(row.deliveredTime) }}
      .tasks-table__data.tasks-table__progress(slot="progress" slot-scope="{ row, index }")
        ProgressLine(:progress="getProgress(row, index)")
      .tasks-table__data(slot="wordcount" slot-scope="{ row }") {{ taskFinance[row.taskId].worldCount}}
      template(slot="cost" slot-scope="{ row }")
        .tasks-table__data(v-if="!isCancelledHalfway(row)") {{ taskFinance[row.taskId].receivables }}
          .tasks-table__currency(v-if="taskFinance[row.taskId].receivables")
            span(v-html="currencyIconDetected(project.projectCurrency)")
        .tasks-table__data(v-if="isCancelledHalfway(row)") {{ taskFinance[row.taskId].halfReceivables }}
          .tasks-table__currency(v-if="taskFinance[row.taskId].halfReceivables")
            span(v-html="currencyIconDetected(project.projectCurrency)")
      .tasks-table__data.tasks-table_centered(slot="icons" slot-scope="{ row }")
        .tasks-table__icons(v-if="isApproveReject(row)")
          img.tasks-table__icon(v-for="(icon, key) in icons" :src="icon.src" @click="makeDecision(row, key)")
        .tasks-table__icons(v-else) -

    div(v-if="!projectTasks.length") No information available...


</template>

<script>
	import DataTable from "~/components/Tables/DataTable"
	import ProgressLine from "~/components/ProgressLine"
	import moment from "moment"
	import { mapGetters, mapActions } from "vuex"
  import currencyIconDetected from "../../../../mixins/currencyIconDetected"

	export default {
		mixins: [ currencyIconDetected],
		data() {
			return {
				fields: [
					{ label: "Langauge Pair", headerKey: "headerPair", key: "pair", width: "28%", padding: "0" },
					{ label: "Status", headerKey: "headerStatus", key: "status", width: "15%", padding: "0" },
					{ label: "Progress", headerKey: "headerProgress", key: "progress", width: "15%", padding: "0" },
					// { label: "Wordcount", headerKey: "headerWordcount", key: "wordcount", width: "12%", padding: "0" },
					{ label: "Cost", headerKey: "headerCost", key: "cost", width: "15%", padding: "0" },
					{ label: "Quote Action", headerKey: "headerDownload", key: "icons", width: "15%", padding: "0" }
				],
				domain: "",
				icons: {
					approve: { src: require("../../../../assets/images/Approve-icon.png") },
					reject: { src: require("../../../../assets/images/Reject-icon.png") }
				}
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle",
				updateTaskStatus: "updateTaskStatus",
			}),
      getLanguagePair(){
        return `foo bar`
      },
			// getWordcount(row) {
      //   console.log({ row })
      //   // return row.finance.Wordcount.receivables
      //   return 0
			// },
			isCancelledHalfway(task) {
				return task.status === 'Cancelled Halfway'
			},
			getDeliveredTime(date) {
				return date ? moment(date).format("YYYY-MM-DD, HH:mm Z") : ""
			},
			isApproveReject(task) {
				return task.status === 'Quote sent'
			},
			// isDownload(task) {
			// 	return task.status === 'Ready for Delivery' || task.status === 'Delivered'
			// },
			async makeDecision(task, key) {
				const status = key === 'approve' ? 'Approved' : 'Rejected'
				try {
					await this.updateTaskStatus({ task, status })
				} catch (err) {
				}
			},
			// async download(task) {
			// 	try {
			// 		let href = task.deliverables
			// 		if (!href) {
			// 			const result = await this.$axios.get(`/portal/deliverables?taskId=${ task.taskId }`)
			// 			href = result.data.link
			// 		}
			// 		let link = document.createElement('a')
			// 		link.href = this.domain + href
			// 		link.target = "_blank"
			// 		link.click()
			// 		if (task.status === "Ready for Delivery") {
			// 			await this.updateTaskStatus({ task, status: 'Delivered' })
			// 		}
			// 	} catch (err) {
			// 		this.alertToggle({ message: err.message, isShow: true, type: "error" })
			// 	}
			// },
			getProgress(task, index) {
				if (this.project.hasOwnProperty('fromXTRF')) {
					return this.project.tasks[index].progress
				} else {
					const { steps } = this.project
					let total = 0
					const taskSteps = steps.filter(item => task.taskId === item.taskId)
					for (let step of taskSteps) {
						const progress = isNaN(step.progress) ? +(step.progress.wordsDone / step.progress.totalWordCount * 100).toFixed(2) : step.progress
						total += progress
					}
					return (total / taskSteps.length).toFixed(2)
				}

			}
		},
		computed: {
			...mapGetters({
				project: "getSelectedProject",
				clientLanguages: "getCombinations",
        languages: "allLanguages",
			}),
			projectTasks() {
				return this.project.tasks.filter(({ status }) => status !== 'Created')
			},
			taskFinance() {
        return this.project.steps.reduce((acc, step) => {
          if(!acc.hasOwnProperty(step.taskId) ) {
            acc[step.taskId] = {receivables: step.finance.Price.receivables}
          } else {
            acc[step.taskId].receivables += step.finance.Price.receivables
          }
          return acc
        }, {})
			},
		},
		mounted() {
			this.domain = process.env.domain
		},
		components: {
			DataTable,
			ProgressLine
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../../assets/scss/colors.scss";

  .tasks-table {
    &__data, &__status {
      height: 30px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      padding: 0 5px;
    }

    &__currency {
      margin-left: 3px;
    }

    &__icons {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &__icon {
      height: 20px;
      transition: all 0.2s;
      margin: 0 6px;

      &:hover {
        cursor: pointer;
        transform: scale(1.1);
      }
    }

    &__download {
      cursor: pointer;
    }

    &__progress, &__status {
      position: relative;
    }

    &__timestamp {
      cursor: pointer;
      position: absolute;
      right: 3px;
      top: 6px;

      &:hover {
        .tasks-table__time-data {
          opacity: 1;
          z-index: 5;
        }
      }
    }

    &__time-data {
      position: absolute;
      top: -2px;
      width: 150px;
      background-color: $white;
      padding: 3px;
      border-radius: 4px;
      margin-left: 22px;
      box-shadow: 0 2px 4px 0 rgba(103,87,62,.3), 0 2px 16px 0 rgba(103,87,62,.2);
      opacity: 0;
      z-index: -2;
      transition: all 0.2s;
    }

    &_centered {
      justify-content: center;
    }
  }

</style>
