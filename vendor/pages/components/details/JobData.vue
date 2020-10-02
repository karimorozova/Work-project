<template lang="pug">
  .job-data
    .data-block
      .data-block__item
        LabelValue(title="Project Name" :isColon="true" :value="job.projectName")
      .data-block__item
        LabelValue(title="Job ID" :isColon="true" :value="job.stepId")
      .data-block__item(v-if="isWordcount")
        LabelValue(v-if="job.finance" title="Total Wordcount" :isColon="true" :value="job.finance.Wordcount.receivables")
    .data-block
      .data-block__item
        LabelValue(title="Status" :isColon="true" :value="job.status | stepStatusFilter")
      .data-block__item(v-if="job.status !== 'Cancelled Halfway'")
        LabelValue(v-if="job.finance" title="Total Cost" :isColon="true" :value="job.finance.Price.payables")
          span.job-data__currency(v-if="job.finance && job.finance.Price.payables") &euro;
      .data-block__item(v-else)
        LabelValue(title="Total Cost" :isColon="true" :value="job.finance.Price.halfPayables")
          span.job-data__currency(v-if="job.finance && job.finance.Price.payables") &euro;
      .data-block__item(v-if="isWordcount")
        LabelValue(v-if="job.finance" title="Weighted Wordcount" :isColon="true" :value="job.finance.Wordcount.payables")
    .data-block
      .data-block__progress
        Progress(:percent="progress")
</template>

<script>
	import LabelValue from "../jobs/LabelValue";
	import Progress from "~/components/Progress";
	import { mapGetters } from "vuex";

	export default {
		props: {
			job: { type: Object }
		},
		computed: {
			...mapGetters({
        units: "getOriginallyUnits",
      }),
			progress() {
				if(this.job.progress) {
					return this.job.progress.totalWordCount ? +(this.job.progress.wordsDone / this.job.progress.totalWordCount * 100).toFixed(2) : this.job.progress;
				}
			},
			isWordcount() {
				if(this.units){
				  const { type } = 	this.units.find(i => i._id.toString() === this.job.serviceStep.unit)
				  return type === "CAT Wordcount";
        }
			}
		},
		filters: {
			stepStatusFilter: (status) => status === "Started" ? "In progress" : status
		},
		components: {
			LabelValue,
			Progress
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .job-data {
    border-bottom: 1px solid $light-brown;
    display: flex;
    justify-content: space-between;
    height: 125px;
    padding: 10px 0 10px 8px;

    &__currency {
      margin-left: 5px;
    }
  }

  .data-block {
    height: 100%;
    width: 30%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    position: relative;

    &:first-child {
      width: 35%;
    }

    &:last-child {
      width: 20%;
      display: flex;
      align-items: flex-start;
    }
  }

</style>
