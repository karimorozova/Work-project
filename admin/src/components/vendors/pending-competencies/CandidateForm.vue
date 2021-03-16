<template lang="pug">
  .container
    .candidateForm
      .candidateForm__title Candidate Form
      .candidateForm__row
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
          span(v-html="candidateFormData.descriptions.targetLanguage").candidateForm__textareaText(disabled)
          //textarea()

      .candidateForm__row
        .candidateForm__col
          .candidateForm__col-title Industry:
          .candidateForm__col-value {{ candidateFormData.industry.name }}
        .candidateForm__col
          .candidateForm__col-title Step:
          .candidateForm__col-value {{ candidateFormData.step.title }}

      .candidateForm__row(v-if="candidateFormData.descriptions.industry.length")
        .candidateForm__textarea
          textarea(v-model="candidateFormData.descriptions.industry").candidateForm__textareaText(disabled)

      .candidateForm__row
        DataTable(
          :fields="fields"
          :tableData="[]"
          bodyRowClass="cursor-default"
        )
      .candidateForm__row
      | {{ candidateFormData }}
</template>

<script>
	import DataTable from "../../DataTable"

	export default {
		components: { DataTable },
		props: {
			candidateFormData: {
				type: Object
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
    /*    top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);*/

    &__textareaText {
      padding-top: 5px;
      padding-left: 10px;
      overflow-y: auto;
      min-height: 50px;
      border: none;
      outline: none;
      width: 98%;
      heigth: 100%;
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
      margin-bottom: 10px;
    }

    &__col {
      display: flex;
      width: 50%;

      &-title {
        margin-right: 10px;
        font-family: 'Myriad600';
      }
    }
  }
</style>