<template lang="pug">
  .component
    .title
      span Your Order

    .component__body
      .component__form
        .form__title General Information
        .form__part
          .form__row
            .form__col
              .form__select
                .form__input-title Project Name:
                .width-220 {{ values.currentProjectName}}

            .form__col
              .form__select
                .form__input-title Project Deadline:
                .width-220 {{ values.currentDeadline}}

            .form__col
              .form__select(style="margin-top: 20px;")
                .form__input-title Industry:
                .width-220 {{ values.currentIndustries.name}}

            .form__col
              .form__select(style="margin-top: 20px;")
                .form__input-title Service:
                .width-220 {{ values.currentService}}

        .form__title Languages
        .form__part
          .form__row
            .form__col(v-if="values.currentSourceLang && values.currentSourceLang.hasOwnProperty('lang')")
              .form__select
                .form__input-title Source Language:
                .width-220 {{values.currentSourceLang.lang}}
            .form__col
              .form__select
                .form__input-title Target Language:
                .width-220 {{ Array.isArray( values.currentTargetLang) ?  values.currentTargetLang.map(({lang}) => lang).join(', ') : values.currentTargetLang.lang}}

        .form__title(v-if="values.files.length") Files
        .form__part(v-if="values.files.length")
          .form__row
            .table
              GeneralTable(
                :fields="fields"
                :tableData="values.files"
              )
                .table__header(slot="headerFile" slot-scope="{ field }") {{ field.label }}
                .table__header(slot="headerType" slot-scope="{ field }") {{ field.label }}
                .table__header(slot="headerDownload" slot-scope="{ field }") {{ field.label }}

                .table__data(slot="file" slot-scope="{ row }") {{row.name}}
                .table__data(slot="type" slot-scope="{ row }") {{row.type}}
                .table__data-center(slot="download" slot-scope="{ row }")
                  a(class="link" :href="domain + row.path" target="_blank")
                    i(class="fas fa-download")


        .form__title(v-if="values.selectedInstructions.length") Instructions
        .form__part(v-if="values.selectedInstructions.length")
          .form__select
            InstructionsShowSelected(:instructions="values.selectedInstructions")

          //.form__row
          //  .form__col
          //    .form__select(style="margin-top: 20px;")
          //      .form__input-title-margin9 Enter a short brief:
          //      div(style="width: 575px")
          //        textarea.form__textarea(rows="4" v-model="values.currentBrief" disabled="true")

        //.form__ckeckbox(v-if="isStartOption")
        //  TextRadio(
        //    :isChecked="values.startOption === 'Send'"
        //    title="Send a Quote"
        //    text="I approve for the project to begin immediately and I'll review the quote later."
        //    :style="{'cursor': 'default'}"
        //  )
        //  TextRadio(
        //    :isChecked="values.startOption === 'Start'"
        //    title="Start Immediately"
        //    text="I approve for the project to begin immediately and to receive the quote just for reference."
        //    :style="{'cursor': 'default'}"
        //  )
        .form__submit
          Button(@clicked="goToMainPage" value="Go to Main Page")

</template>

<script>
	import moment from "moment"
	import Button from "../buttons/Button"
	import DataTable from "../Tables/DataTable"
	import TextRadio from "../../pages/components/forms/TextRadio"
	import { mapActions } from "vuex"
	import GeneralTable from "../pangea/GeneralTable"
  // import { instructions } from "../../../admin/enums"
  import InstructionsShowSelected from "../../pages/components/forms/InstructionsShowSelected"

	export default {
		components: { GeneralTable, TextRadio, DataTable, Button, InstructionsShowSelected },
		props: {
			values: {},
			isStartOption: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {
				fields: [
					{ label: "File Name", headerKey: "headerFile", key: "file", style: { width: "60%" } },
					{ label: "File Type", headerKey: "headerType", key: "type", style: { width: "30%" } },
					{ label: "", headerKey: "headerDownload", key: "download", style: { width: "10%" } }
				],
        // instructions: instructions,
			}
		},
		methods: {
			...mapActions({
			}),
			goToMainPage() {
				this.$router.push('/')
			}
		},
    computed: {
      domain() {
        return window.location.origin === 'http://localhost:3000' ? 'http://localhost:3001' : 'admin2.pangea.global/'
      }
    }
	}
</script>

<style scoped lang="scss">
  @import "../../assets/scss/colors";

  .table {
    width: 100%;

    &__header {
      padding: 0 0 0 7px;
    }

    &__data {
      padding: 0 7px;
      width: 100%;
      display: flex;
      justify-content: space-between;
      &-center {
        display: flex;
        width: 100%;
        justify-content: center;
      }
    }

    &__dataIcon {
      width: 100%;
      display: flex;
      justify-content: center;
    }

    .fa-trash {
      cursor: pointer;
    }
  }

  .fileModal {
    box-shadow: $box-shadow;
    position: absolute;
    z-index: 9999;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    padding: 30px 20px 20px;
    background: rgb(255, 255, 255);


    &__tooltip {
      text-align: center;
      opacity: 0.6;
      margin-top: 15px;
    }

    &__btns {
      display: flex;
      justify-content: space-around;
      margin-top: 10px;
    }

    &__btn {
      width: 100px;
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
  }

  .order {
    &__files-item {
      border-radius: 4px;
      border: 1px solid #ddd;
      background-color: transparent;
      font-size: 12px;
      padding: 6px;
      margin: 0;
      justify-content: space-between;
      align-items: center;
      position: relative;
      margin-bottom: 7px;
      color: #d66f58;
      display: flex;
    }

    &__details {
      font-size: 12px;
      font-family: 'Myriad400';
      opacity: 0.6;
    }

    &__project {
      margin-bottom: 12px;
    }

    &__subTitle {
      width: 80px;
      font-family: Myriad600;
    }

    &__value {
      font-size: 14px;
    }

    &__projectName {
      font-size: 16px;
      color: #d66f58;
      margin-top: 10px;
      font-family: 'Myriad600';
    }

    &__projectOption {
      opacity: 0.6;
    }

    &__delete {
      cursor: pointer;
      transform: 0.2s ease;
      font-size: 14px;

      &:hover {
        font-weight: bold;
        cursor: pointer;
      }
    }

    &__title {
      margin-top: 10px;
      margin-bottom: 2px;
    }

    &__row {
      display: -webkit-box;
      margin-top: 10px;
    }

  }

  .form {
    &__row {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
    }

    &__submit {
      margin-top: 30px;
      display: flex;
      justify-content: center;
    }

    &__dataIcon {
      text-align: center;
      cursor: pointer;
    }

    &__col {
      /*width: 50%;*/
      /*justify-content: center;*/
      /*display: flex;*/
    }

    &__ckeckbox {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }

    &__select {
      display: flex;
      min-height: 30px;
      position: relative;
    }

    &__input-title {
      align-items: center;
      display: flex;
      min-width: 130px;
    }

    &__input-title-margin9 {
      margin-top: 9px;
      display: flex;
      min-width: 130px;
    }

    &__title {
      font-size: 14px;
      padding-top: 30px;
      padding-bottom: 8px;
      font-family: 'Myriad600';

      &--order {
        font-size: 14px;
        padding-top: 20px;
        padding-bottom: 15px;
        font-family: 'Myriad600';
        border-bottom: 1px solid $border;
        margin-bottom: 15px;
      }
    }

    &__textarea {
      width: 100%;
      border: none;
      padding: 5px;
      outline: none;
      box-sizing: border-box;
      font-size: 14px;
      border: 1px solid $border;
      border-radius: 4px;
    }

    &__part {
      padding: 30px 20px;
      border: 1px solid $light-border;
      border-radius: 4px;
      position: relative;
    }
  }

  .component {
    color: $text;

    &__body {
      display: flex;
      margin-bottom: 50px;
    }

    &__order {
      box-shadow: $box-shadow;
      padding: 0 20px 20px 20px;
      width: 300px;
      height: fit-content;
      margin-left: 40px;
      margin-bottom: 40px;
      background-color: white;
      border-radius: 4px;
    }


    &__form {
      border-radius: 4px;
      box-shadow: $box-shadow;
      padding: 0 25px 25px 25px;
      width: 800px;
      background-color: white;
      position: relative;
    }
  }

  .title {
    font-size: 18px;
    font-family: Myriad600;
    margin-bottom: 10px;
  }

  .width-220 {
    width: 220px;
    position: relative;
    align-items: center;
    display: flex;
  }

  .width-310 {
    width: 310px;
    position: relative;
  }

  input {
    font-size: 14px;
    color: $text;
    border: 1px solid $border;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 0 7px;
    outline: none;
    width: 220px;
    height: 32px;
    transition: .1s ease-out;

    &:focus {
      border: 1px solid $border-focus;
    }
  }

  ::-webkit-input-placeholder {
    opacity: 0.5;
  }

  .calendar {
    z-index: 10;
    position: absolute;
    right: 5px;
    font-size: 18px;
    top: 6px;
    cursor: pointer;
  }

  .link {
    text-decoration: none;
    color: $text;
  }


  ul {
    margin-block-start: 0em !important;
    margin-block-end: 0em !important;
    margin-inline-start: 0px !important;
    margin-inline-end: 0px !important;
    padding-inline-start: 0px !important;
  }
</style>
