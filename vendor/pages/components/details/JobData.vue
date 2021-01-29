<template lang="pug">
  .job-data
    .data-block
      .data-block__item
        LabelValue(title="Start Date" :isColon="true" :value="outputData.start")
      .data-block__item
        LabelValue(title="Job Type" :isColon="true" :value="outputData.name")
      .data-block__item
        LabelValue(title="Source Language" :isColon="true" :value="outputData.source")
      .data-block__item(v-if="isWordcount")
        LabelValue(title="Total Wordcount" :isColon="true" :value="outputData.quantity")
      .data-block__item(v-if="isPackageUnit")
        LabelValue(title="Quantity" :isColon="true" :value="outputData.quantity")
      .data-block__item(v-if="!isPackageUnit && !isWordcount")
        LabelValue(:title="customUnit" :isColon="true" :value="this.job.hours")
    .data-block
      .data-block__item
        LabelValue(title="Deadline" :isColon="true" :value="outputData.deadline")
      .data-block__item
        LabelValue(title="Industry" :isColon="true" :value="outputData.industry")
      .data-block__item
        LabelValue(title="Target Language" :isColon="true" :value="outputData.target")
      .data-block__item(v-if="isWordcount")
        LabelValue(title="Weighted Wordcount" :isColon="true" :value="outputData.payables")
    .data-block
      .data-block__progress
        Progress(:percent="progress")

</template>

<script>
	import LabelValue from "../jobs/LabelValue"
	import Progress from "~/components/Progress"
	import { mapGetters } from "vuex"
	import moment from "moment"

	export default {
		props: {
			job: { type: Object }
		},
		computed: {
			...mapGetters({
				units: "getOriginallyUnits"
			}),
			outputData() {
				const { start, quantity, deadline, name, industry, fullSourceLanguage, fullTargetLanguage, finance: { Wordcount: { payables } } } = this.job
				return {
					start: moment(start).format('DD-MM-YYYY HH:mm'),
					deadline: moment(deadline).format('DD-MM-YYYY HH:mm'),
					name,
					industry: industry.name,
					source: fullSourceLanguage.lang,
					target: fullTargetLanguage.lang,
					payables,
					quantity
				}
			},
			progress() {
				if (this.job.progress) {
					return this.job.progress.totalWordCount ? +(this.job.progress.wordsDone / this.job.progress.totalWordCount * 100).toFixed(2) : this.job.progress
				}
			},
			currentUnit() {
				if (this.units) {
					return this.units.find(i => i._id.toString() === this.job.serviceStep.unit)
				}
			},
			customUnit() {
				const { type } = this.currentUnit
				return type
			},
			isPackageUnit() {
				if (this.units) {
					const { type } = this.currentUnit
					return type === "Packages"
				}
			},
			isWordcount() {
				if (this.units) {
					const { type } = this.currentUnit
					return type === "CAT Wordcount"
				}
			}
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
    border-bottom: 1px solid rgb(197, 191, 181);
    display: flex;
    justify-content: space-between;
    padding: 20px 20px 0 20px;

    &__currency {
      margin-left: 5px;
    }
  }

  .data-block {
    height: 100%;
    width: 42%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    position: relative;

    &__item {
      margin-bottom: 20px;
    }

    &:last-child {
      width: 16%;
      height: 130px;
    }
  }

</style>
