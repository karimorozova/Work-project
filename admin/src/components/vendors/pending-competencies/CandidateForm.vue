<template lang="pug">
  .container
    .candidateForm
      span.candidateForm__close(@click="closeModal") &#215;
      .candidateForm__title Candidate Form
      .candidateForm__row(v-if="!!candidateFormData.vendorName")
        .candidateForm__col
          .candidateForm__col-title Vendor:
          .candidateForm__col-value {{ candidateFormData.vendorName }}
        .candidateForm__col
          .candidateForm__col-title Native Language:
          .candidateForm__col-value {{  candidateFormData.native ? candidateFormData.native.lang  : '' }}

      .candidateForm__row
        .candidateForm__col
          .candidateForm__col-title Source Language:
          .candidateForm__col-value {{ candidateFormData.sourceLanguage.lang }}
        .candidateForm__col
          .candidateForm__col-title Target Language:
          .candidateForm__col-value {{ candidateFormData.targetLanguage.lang }}

      .candidateForm__row(v-if="candidateFormData.descriptions.targetLanguage.length")
        .candidateForm__textarea
          .candidateForm__textareaText(v-html="candidateFormData.descriptions.targetLanguage")

      .candidateForm__row
        .candidateForm__col
          .candidateForm__col-title Industry:
          .candidateForm__col-value {{ candidateFormData.industry.name }}
        .candidateForm__col
          .candidateForm__col-title Step:
          .candidateForm__col-value {{ candidateFormData.step.title }}

      .candidateForm__row(v-if="candidateFormData.descriptions.industry.length")
        .candidateForm__textarea
          .candidateForm__textareaText(v-html="candidateFormData.descriptions.industry")

      .candidateForm__row
        DataTable(
          :fields="fields"
          :tableData="ratesTableData"
          bodyRowClass="cursor-default"
          :bodyClass="'tbody_visible-overflow'"
          :tableheadRowClass="'tbody_visible-overflow'"
        )
          template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
            span.candidateForm__header-label {{ field.label }}

          template(slot="rate" slot-scope="{ row }")
            .candidateForm__data € {{ row.rate }}
          template(slot="benchmark" slot-scope="{ row }")
            .candidateForm__data € {{ row.systemRate }}
          template(slot="margin" slot-scope="{ row }")
            .candidateForm__data(:style="styleObject(row.margin)") € {{ row.margin }}

      .candidateForm__row
        .candidateForm__row-buttons
          Button(:value="'Approve & Test'" @clicked="approve")
          Button(:value="'Reject'" @clicked="reject")
          Button(:value="'Delete'" @clicked="deletePC")
          Button(:value="'Cancel'" @clicked="closeModal")

</template>

<script>
	import DataTable from "../../DataTable"
	import Button from "../../Button"

	export default {
		components: { Button, DataTable },
		props: {
			candidateFormData: {
				type: Object
			}
		},
		data() {
			return {
				fields: [
					{ label: "Requested Rate", headerKey: "headerRequestedRate", key: "rate", width: "33.3%", padding: "0" },
					{ label: "Benchmark", headerKey: "headerBenchmark", key: "benchmark", width: "33.3%", padding: "0" },
					{ label: "Margin", headerKey: "headerMargin", key: "margin", width: "33.4%", padding: "0" }
				]
			}
		},
		methods: {
			styleObject(margin) {
				return margin < 0 ? { 'background': '#e8afa2' } : {}
			},
			deletePC(){
				this.$emit('deletePC', this.candidateFormData)
      },
			approve() {
				this.$emit('approve', this.candidateFormData)
			},
			reject() {
				this.$emit('reject', this.candidateFormData)
			},
			closeModal() {
				this.$emit('closeModal')
			}
		},
		computed: {
			ratesTableData() {
				if (this.candidateFormData) {
					const { rate, systemRate } = this.candidateFormData
					return [ {
						rate: rate.toFixed(4),
						systemRate: systemRate.toFixed(4),
						margin: (systemRate - rate).toFixed(4)
					} ]
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
  .candidateForm {
    position: absolute;
    padding: 20px;
    z-index: 100;
    background: white;
    box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    width: 600px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    &__textareaText {
      padding-left: 10px;
      overflow-y: auto;
      min-height: 50px;
      max-height: 100px;
      border: none;
      outline: none;
      width: 98.3%;
      background: transparent;
      resize: none;
    }

    &__textarea {
      border: 2px solid #c5bfb5;
      border-radius: 8px;
      width: 100%;
      heigth: 60px;
    }

    &__title {
      font-size: 22px;
      width: 100%;
      text-align: center;
      margin-bottom: 20px;
      font-family: 'Myriad600';
    }

    &__row {
      display: flex;
      margin-bottom: 15px;

      &-buttons {
        display: flex;
        width: 100%;
        justify-content: space-between;
      }
    }

    &__col {
      display: flex;
      width: 50%;

      &-title {
        margin-right: 10px;
        font-family: 'Myriad600';
      }
    }

    &__close {
      position: absolute;
      top: 5px;
      right: 7px;
      font-size: 22px;
      cursor: pointer;
      height: 22px;
      width: 22px;
      justify-content: center;
      display: flex;
      align-items: center;
      font-family: Myriad900;
      opacity: 0.8;
      transition: ease 0.2s;

      &:hover {
        opacity: 1
      }
    }

    &__data {
      height: 31px;
      overflow-x: hidden;
      padding: 0 5px;
      align-items: center;
      display: flex;
    }
  }
</style>