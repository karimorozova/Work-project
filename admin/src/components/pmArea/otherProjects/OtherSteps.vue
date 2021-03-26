<template lang="pug">
  .steps
    .steps__table
      .steps__tabs
        Tabs(
          :tabs="tabs"
          selectedTab="Steps"
          @setTab="showTab"
        )
      .steps__data(v-if="!projectSteps.length")
        p Steps have not been recorded yet...
      .steps__data(v-else)
        DataTable(
          :fields="fields"
          :tableData="projectSteps"
          :activeIndex="activeIndex"
          :bodyClass="['steps-table-body', {'tbody_visible-overflow': projectSteps.length < 10}]"
          :tableheadRowClass="projectSteps.length < 10 ? 'tbody_visible-overflow' : ''"
          bodyCellClass="steps-table-cell"
          bodyRowClass="steps-table-row"
          v-if="project._id"
        )
          template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
            span.tasks__label {{ field.label }}

          template(slot="info" slot-scope="{row, index}")
            div(@click="showStepDetails(index)" :class="{isDisabled: isNoFinanceData(index), 'steps__info-icon': !isNoFinanceData(index) }")
              i.fas.fa-info-circle
          template(slot="name" slot-scope="{ row }")
            span.steps__step-data.steps_no-padding {{ getStepName(row.DocumentAssignmentRole) }}
          template(slot="language" slot-scope="{ row, index }")
            span.steps__step-data {{ languagePair(index) }}
          template(slot="vendor" slot-scope="{ row, index }")
            span.steps__step-data.steps_no-padding {{ getVendorFullName(index) }}
          template(slot="start" slot-scope="{ row, index }")
            span.steps__step-data {{row.DocumentAssignmentRole === 0 || index === 0 ? formateDate(project.creationTime) : formateDate(projectSteps[index-1].DeadLine) }}
          template(slot="deadline" slot-scope="{ row, index }")
            span.steps__step-data {{formateDate(row.DeadLine)}}

          template(slot="receivables" slot-scope="{ row, index }")
            .pricelist__block(v-if="project.steps.length")
              span.pricelist__list(v-if="project.steps[index].clientRate && !project.steps[index].clientRate.fromUser")
                img.pricelist__img( src="../../../assets/images/red-info-icon.png")
              span(v-else)

              span(v-if="project.steps[index].finance.Price.receivables")
                span(v-html="returnIconCurrencyByStringCode(project.projectCurrency)")
              span.steps__step-data {{ project.steps[index].finance.Price.receivables  }}

          template(slot="payables" slot-scope="{ row, index }")
            .pricelist__block(v-if="project.steps.length")
              span.pricelist__list(v-if="project.steps[index].vendorRate && !project.steps[index].clientRate.fromUser")
                img.pricelist__img( src="../../../assets/images/red-info-icon.png")
              span(v-else)

              span(v-if="project.steps[index].finance.Price.payables")
                span(v-html="returnIconCurrencyByStringCode(project.projectCurrency)")
              span.steps__step-data {{ project.steps[index].finance.Price.payables  }}

          template(slot="margin" slot-scope="{ row, index }")
            div(v-if="project.steps.length")
              span(v-if="project.steps[index].finance.profit")
                span(v-html="returnIconCurrencyByStringCode(project.projectCurrency)")
              span.steps__step-data {{ project.steps[index].finance.profit }}


      transition(name="fade")
        .steps__info(v-if="isStepInfo")
          OtherStepInfo(
            :index="infoIndex"
            :step="project.steps[infoIndex]"
            :project="project"
            :vendor="project.steps[infoIndex].vendor"
            @closeStepInfo="closeStepInfo"
          )
</template>

<script>
	import DataTable from "../../DataTable"
	import Tabs from "../../Tabs"
	import moment from "moment"
	import OtherStepInfo from "./OtherStepInfo"
	import { mapGetters } from "vuex"
	import currencyIconDetected from "../../../mixins/currencyIconDetected"

	export default {
		mixins: [currencyIconDetected],
		props: {
			project: {
				type: Object
			},
			projectSteps: {
				type: Array
			}
		},
		data() {
			return {
				tabs: [ "Tasks", "Steps" ],
				stepsTargetLanguages: [],
				fields: [
					{
						label: "",
						headerKey: "headerInfo",
						key: "info",
						width: "4%",
						padding: 0
					},
					{
						label: "Step",
						headerKey: "headerName",
						key: "name",
						width: "12%",
						padding: 0
					},
					{
						label: "Language",
						headerKey: "headerLanguage",
						key: "language",
						width: "13%"
					},
					{
						label: "Vendor name",
						headerKey: "headerVendor",
						key: "vendor",
						width: "14%",
						padding: 0
					},
					{
						label: "Start",
						headerKey: "headerStart",
						key: "start",
						width: "12%"
					},
					{
						label: "Deadline",
						headerKey: "headerDeadline",
						key: "deadline",
						width: "12%"
					},
					{
						label: "Receivables",
						headerKey: "headerReceivables",
						key: "receivables",
						width: "12%"
					},
					{
						label: "Payables",
						headerKey: "headerPayables",
						key: "payables",
						width: "12%"
					},
					{
						label: "Margin",
						headerKey: "headerMargin",
						key: "margin",
						width: "9%"
					}
				],
				infoIndex: -1,
				isStepInfo: false
			}
		},

		methods: {
			isNoFinanceData(index) {
				if (this.project.steps.length) {
					if (this.project.steps[index].vendor === null) {
						return true
					}
				} else {
					return true
				}
			},
			getVendorFullName(index) {
				return this.projectSteps[index].UserInfoHeader.FullName
			},
			getLanguageSymbol(memoqSymbol) {
				return this.getAllLanguages.find(item => item.memoq === memoqSymbol) === undefined ? '' : this.getAllLanguages.find(item => item.memoq === memoqSymbol).symbol
			},
			languagePair(index) {
				let secondLang = this.projectSteps[index].langSymbol !== null ? this.getLanguageSymbol(this.projectSteps[index].langSymbol) : ''
				return `${ this.project.sourceLanguage.symbol } >> ${ secondLang }`
			},
			showStepDetails(index) {
				if (!this.isNoFinanceData(index)) {
					this.infoIndex = index
					this.isStepInfo = true
				}
			},
			closeStepInfo() {
				this.isStepInfo = false
				this.infoIndex = -1
			},
			formateDate: time => moment(time).format('DD-MM-YYYY'),
			getStepName: num => (num === '0' ? 'Translation' : 'Revision'),
			showTab({ index }) {
				return this.tabs[index] === "Steps"
						? true
						: this.$emit("showTab", { tab: this.tabs[index] })
			}
		},
		computed: {
			...mapGetters({
				getAllLanguages: 'getAllLanguages'
			})
		},
		components: {
			OtherStepInfo,
			DataTable,
			Tabs
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .pricelist {
    &__block {
      display: flex;
    }

    &__list {
      height: 18px;
      width: 18px;
    }

    &__img {
      height: 18px;
      width: 18px;
      margin-top: -1px;
      margin-left: -1px;
    }
  }

  .steps {
    display: flex;
    flex-direction: column;

    &__table {
      position: relative;
    }

    &__action {
      align-self: flex-end;
    }

    &__title {
      margin-bottom: 5px;
      font-size: 18px;
    }

    &__drop-menu {
      position: relative;
      width: 191px;
      height: 28px;
    }

    &__info {
      position: absolute;
      top: -100px;
      left: 10%;
      width: 80%;
      z-index: 50;
      background-color: $white;
      box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    }

    &__info-icon {
      i {
        color: $main-color;
        opacity: 0.7;
        transition: all 0.3s;
        cursor: pointer;
        margin-top: 3px;
        margin-left: 12px;

        &:hover {
          opacity: 1;
        }
      }
    }

    &__vendor-replace {
      position: relative;
      width: 20px;
      margin-right: 5px;
      box-sizing: border-box;

      &:hover {
        .steps__tooltip {
          display: block;
          z-index: 50;
        }
      }
    }

    &__replace-icon {
      max-width: 20px;
      cursor: pointer;
    }

    &__tooltip {
      text-align: center;
      width: 110px;
      position: absolute;
      right: 25px;
      top: 0;
      display: none;
      background-color: $white;
      color: $orange;
      box-sizing: border-box;
      padding: 3px;
      border-radius: 8px;
    }

    &__step-no-select {
      opacity: 0.7;
    }

    &_rotated {
      transform: rotate(180deg);
    }

    &__vendor-menu {
      position: relative;
      width: 100%;
      height: 29px;
    }

    &__reassignment {
      position: absolute;
      z-index: 100;
      left: 0;
      top: 0;
      bottom: 0;
      right: 0;
    }

    &__approve-action {
      position: absolute;
      right: 0;
      z-index: 50;
      background-color: $white;
    }

    &__step-status {
      padding-left: 5px;
      max-height: 32px;
      overflow-y: auto;
    }

    &_no-padding {
      height: 100%;
      width: 100%;
      max-height: 31px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-left: 5px;
      overflow-y: auto;
      overflow-y: hidden;
    }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s;
  }

  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }

  .isDisabled {
    color: $main-color;
    opacity: 0.7;
    margin-top: 3px;
    margin-left: 12px;
    cursor: not-allowed !important;
  }

  .fa-info-circle {
    font-size: 16px;
  }
</style>
