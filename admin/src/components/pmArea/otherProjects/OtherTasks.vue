<template lang="pug">
  .tasks
    .tasks__table
      .tasks__tabs
        Tabs(
          :tabs="tabs"
          selectedTab="Tasks"
          @setTab="showTab"
        )

      DataTable(
        :fields="fields"
        :tableData="project.documents"
        bodyRowClass="steps-table-row"
        :bodyClass="['steps-table-body', {'tbody_visible-overflow': project.documents.length < 10}]"
        :tableheadRowClass="project.documents.length < 10 ? 'tbody_visible-overflow' : ''"
      )

        template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
          span.tasks__label {{ field.label }}

        template(slot="taskId" slot-scope="{ row, index }")
          span.tasks__task-data {{ formateId(index) }}
        template(slot="language" slot-scope="{ row }")
          span.tasks__task-data {{ `${project.sourceLanguage.symbol} >> ${ getTargetLanguage(row.TargetLangCode)}` }}
        template(slot="start" slot-scope="{ row }")
          span.tasks__task-data {{  formateDate(project.creationTime)}}
        template(slot="deadline" slot-scope="{ row }")
          span.tasks__task-data {{ formateDate(project.deadline)}}
        template(slot="progress" slot-scope="{ row }")
          ProgressLine(:progress="setProgress(row.DocumentStatus)")
        template(slot="status" slot-scope="{ row }")
          .tasks__task-status {{ row.DocumentStatus | otherProjectsTaskStatus }}
        template(slot="receivables" slot-scope="{ row, index }")
          .tasks__task-status(v-if="project.tasks !== undefined && project.tasks[index] !== undefined")
            span(v-if="project.tasks[index].finance.Price.receivables")
              span(v-html="returnIconCurrencyByStringCode(project.projectCurrency)")
            span {{ project.tasks[index].finance.Price.receivables }}
        template(slot="payables" slot-scope="{ row, index }")
          .tasks__task-status(v-if="project.tasks !== undefined && project.tasks[index] !== undefined")
            span(v-if="project.tasks[index].finance.Price.payables")
              span(v-html="returnIconCurrencyByStringCode(project.projectCurrency)")
            span {{ project.tasks[index].finance.Price.payables }}
        template(slot="margin" slot-scope="{ row, index }")
          .tasks__task-status(v-if="project.tasks !== undefined && project.tasks[index] !== undefined")
            span(v-if="project.tasks[index].finance.profit")
              span(v-html="returnIconCurrencyByStringCode(project.projectCurrency)")
            span {{ project.tasks[index].finance.profit }}

</template>

<script>
	import DataTable from '../../DataTable';
	import ProgressLine from '../../ProgressLine';
	import Tabs from '../../Tabs';
	import moment from 'moment';
	import '../../../filters/OtherProjectsFilters'
	import { mapGetters, mapActions } from 'vuex';
	import currencyIconDetected from "../../../mixins/currencyIconDetected"

	export default {
		mixins: [currencyIconDetected],
		props: {
			project: {
				type: Object
			},
			projectId: {
				type: String
			}
		},
		data() {
			return {
				fields: [
					{
						label: 'Task ID',
						headerKey: 'headerTaskid',
						key: 'taskId',
						width: '17%'
					},
					{
						label: 'Language',
						headerKey: 'headerLanguage',
						key: 'language',
						width: '13%'
					},
					{
						label: 'Start',
						headerKey: 'headerStart',
						key: 'start',
						width: '10%'
					},
					{
						label: 'Deadline',
						headerKey: 'headerDeadline',
						key: 'deadline',
						width: '10%'
					},
					{
						label: 'Progress',
						headerKey: 'headerProgress',
						key: 'progress',
						width: '8%'
					},
					{
						label: 'Status',
						headerKey: 'headerStatus',
						key: 'status',
						width: '15%'
					},
					{
						label: 'Receivables',
						headerKey: 'headerReceivables',
						key: 'receivables',
						width: '9%'
					},
					{
						label: 'Payables',
						headerKey: 'headerPayables',
						key: 'payables',
						width: '9%'
					},
					{
						label: 'Margin',
						headerKey: 'headerMargin',
						key: 'margin',
						width: '9%'
					}
				],
				tabs: ['Tasks', 'Steps']
			};
		},
		methods: {
			getTargetLanguage(memoqLang) {
				const obj = this.getAllLanguages.find(item => item.memoq === memoqLang);
				return obj ? obj.symbol : ''
			},
			setProgress(status){
				switch (status) {
					case 'TranslationFinished':
					case 'ProofreadingFinished':
						return 100;
          default:
					case 'TranslationInProgress':
						return 0
				}
			},
			formateId(index) {
				let newIndex = index + 1;
				return newIndex < 10 ? this.projectId + ' T0' + newIndex : this.projectId + ' T' + newIndex;
			},
			formateDate: time => moment(time).format('DD-MM-YYYY'),
			showTab({ index }) {
				return this.tabs[index] === 'Tasks'
						? true
						: this.$emit('showTab', { tab: this.tabs[index] });
			}
		},
		computed: {
			...mapGetters({
				getAllLanguages: 'getAllLanguages',
			}),
		},
		components: {
			DataTable,
			ProgressLine,
			Tabs
		},
	};
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .tasks {
    display: flex;
    flex-direction: column;

    &__action {
      align-self: flex-end;
    }

    &__title {
      margin-bottom: 5px;
      font-size: 19px;
    }

    &__drop-menu {
      position: relative;
      width: 220px;
      height: 32px;
    }

    &__delivery-image {
      height: 18px;
      width: 18px;
      cursor: pointer;
    }

    &__approve-action {
      position: absolute;
      right: 0;
      z-index: 50;
      background-color: $white;
    }

    &__review {
      position: absolute;
      top: -350px;
      right: 0;
      left: 0;
      bottom: 0;
      z-index: 50;
      box-sizing: border-box;
      display: flex;
      align-items: flex-start;
      justify-content: center;
    }

    &__task-status {
      position: relative;
    }

    &__timestamp {
      cursor: pointer;
      position: absolute;
      right: 0;
      top: 0;

      &:hover {
        .tasks__time-data {
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
      box-shadow: 0 0 10px $brown-shadow;
      opacity: 0;
      z-index: -2;
      transition: all 0.2s;
    }
  }
</style>
