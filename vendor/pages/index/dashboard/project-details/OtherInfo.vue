<template lang="pug">
  .other-info
    .other-info__header
      .other-info__photo
        img.other-info__image(v-if="job.manager && job.manager.photo" :src="domain+job.manager.photo")
        img.other-info__image.other-info_no-photo(v-else src="../../../../assets/images/man.png")
      .other__info__item
        LabelValue(title="Project Manager" :value="fullManagerName" customClass="pair_column-flex")

    .other-info__items
      .other-info__item
        LabelValue(title="Job ID" id="jobId" :value="job.stepId" customClass="pair_column-flex")
          span.copy-icon(@click="copyId('jobId')")
            i.far.fa-copy(aria-hidden='true')
      .other-info__item
        LabelValue(title="Project ID" id="projectId" :value="job.projectId" customClass="pair_column-flex")
          span.copy-icon(@click="copyId('jobId')")
            i.far.fa-copy(aria-hidden='true')
      .other-info__item
        LabelValue(title="Project Name" :value="job.projectName" customClass="pair_column-flex")
      .other-info__item
        LabelValue(title="Status" :value="job.status | stepStatusFilter" customClass="pair_column-flex")
      .other-info__item
        LabelValue(title="Payable" :value="job.nativeFinance.Price.payables" customClass="pair_column-flex")
          span(v-html="returnIconCurrencyByStringCode('EUR')")

</template>

<script>
	import LabelValue from "../../../components/jobs/LabelValue"
	import moment from "moment"
	import returnIconCurrencyByStringCode from '../../../../mixins/currencyIconDetected'
	import copyId from "../../../../mixins/copyId"
	import { mapGetters, mapActions } from "vuex"

	export default {
		mixins: [returnIconCurrencyByStringCode, copyId],
		data() {
			return {
				domain: ""
			}
		},
		methods: {
			...mapActions({
				alertToggle: 'alertToggle'
			}),
			getFormattedDate(date) {
				return moment(date).format("DD-MM-YYYY")
			}
		},
		computed: {
			...mapGetters({
				job: "getSelectedJob"
			}),
			fullManagerName() {
				let result = ""
				if (this.job.manager) {
					result = this.job.manager.firstName + " " + this.job.manager.lastName
				}
				return result
			}
		},
		filters: {
			stepStatusFilter: (status) => status === 'Started' ? 'In progress' : status
		},
		components: {
			LabelValue
		},
		mounted() {
			this.domain = process.env.domain
		}
	}
</script>


<style lang="scss" scoped>
  @import "../../../../assets/scss/colors.scss";

  .other-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    box-sizing: border-box;
    border-left: 1px solid rgb(197, 191, 181);

    &__items {
      padding: 10px 10px 0 10px;
    }

    &__item {
      margin-bottom: 10px;
    }

    &__header {
      width: 100%;
      box-sizing: border-box;
      border-bottom: 1px solid rgb(197, 191, 181);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px;
    }

    &__photo {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 1px solid rgb(197, 191, 181);
      margin-bottom: 10px;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;

    }

    &__image {
      max-width: 33px;
      max-height: 33px;
      object-fit: contain;
    }

    &_no-photo {
      margin-right: 2px;
    }
  }

  .copy-icon {
    margin-left: 8px;
    cursor: pointer;
  }
</style>
