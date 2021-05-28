<template lang="pug">
  div
    .title
      i.fas.fa-check
      span Your order

    .content__body
      .content__form
        .form__title general information
        .form__part
          .form__row
            .form__col
              .form__select
                .form__input-title Project Name:
                .success__value {{ values.currentProjectName}}
            .form__col
              .form__select
                .form__input-title Project Deadline:
                .success__value {{ values.currentDeadline}}
            .form__col
              .form__select(style="margin-top: 20px;")
                .form__input-title Industry:
                .success__value {{ values.currentIndustries.name}}

        .form__title languages
        .form__part
          .form__row
            .form__col
              .form__select
                .form__input-title Source Language:
                .success__value {{ values.currentSourceLang.lang}}
            .form__col
              .form__select
                .form__input-title Target Language:
                .success__value {{ values.currentTargetLang.lang}}
        .form__title Files
        .form__part
          //.fileModal(v-if="isFileModal" id="modal")
          //  span.fileModal__close(@click="closeFileModal") &#215;
          //  .fileModal__btns
          //    .fileModal__btn
          //      UploadFileButton(label="Source File(s)" @uploadedFile="setSourceFiles" inputName="sourceFiles")
          //    .fileModal__btn
          //      UploadFileButton(label="Reference File(s)" @uploadedFile="setRefFiles" inputName="refFiles")
          //
          //  .fileModal__tooltip Each uploaded file can be <= 50Mb

          .form__row
            DataTable(
              :fields="fields"
              :tableData="values.files"
              :bodyClass="['review-body', {'tbody_visible-overflow': values.files.length < 6}]"
              :tableheadRowClass="values.files.length < 6 ? 'tbody_visible-overflow' : ''"
              :headCellClass="'padding-with-check-box'"
            )
              .form__header(slot="headerFile" slot-scope="{ field }") {{ field.label }}
              .form__header(slot="headerType" slot-scope="{ field }") {{ field.label }}

              .form__data(slot="file" slot-scope="{ row }") {{row.name}}
              .form__data(slot="type" slot-scope="{ row }") {{row.type}}

            //Add(@add="openFileModal" id="add")

        .form__title Project Details
        .form__part
          .form__row
            .form__col
              .form__select
                .form__input-title Compliance Template:

                .success__value {{ values.currentComplianceTemplate.title}}
            .form__col
              .form__select
                .width-310
                  ul(v-html="values.currentComplianceTemplate.description" )

          .form__row
            .form__col
              .form__select(style="margin-top: 20px;")
                .form__input-title-margin9 Enter a short brief:
                div(style="width: 575px")
                  textarea.form__textarea(rows="4" v-model="values.currentBrief" disabled="true")

        .form__ckeckbox
          TextRadio(
            :isChecked="values.startOption === 'Send'"
            title="Send a Quote"
            text="I approve for the project to begin immediately and I'll review the quote later."
            :style="{'cursor': 'default'}"
          )
          TextRadio(
            :isChecked="values.startOption === 'Start'"
            title="Start Immediately"
            text="I approve for the project to begin immediately and to receive the quote just for reference."
            :style="{'cursor': 'default'}"
          )
        .form__submit
          Button(@clicked="goToMainPage" value="Go to Main Page")

</template>

<script>
import moment from "moment";
import Button from "../buttons/Button";
import DataTable from "../Tables/DataTable";
import TextRadio from "../../pages/components/forms/TextRadio";

export default {
  components: {TextRadio, DataTable, Button},
  props: {
    values: {},
  },
  data() {
    return {
      fields: [
        { label: "File Name", headerKey: "headerFile", key: "file", width: "70%" },
        { label: "File Type", headerKey: "headerType", key: "type", width: "30%" },
      ],
    }
  },
  methods: {
    goToMainPage( ) {
      this.$router.push('/')
    },
  }
}
</script>

<style scoped lang="scss">
.success {
  &__value {
    display: flex;
    align-items: center;
    width: 191px;
    font-family: 'Myriad600';
  }
}
.width-310 {
  width: 310px;
  position: relative;
}

.title {
  margin: 30px 0 10px;
  font-family: Myriad400;
  font-size: 20px;
  color: #67573e;
  & svg {
    color: #4CA553;
    margin-right: 5px;
  }
}
.content {
  color: #67573e;

  &__body {
    display: flex;
    margin-bottom: 50px;
  }
  &__form {
    box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    padding: 0 20px 20px 20px;
    width: 740px;
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
    min-width: 140px;
  }

  &__input-title-margin9 {
    margin-top: 9px;
    display: flex;
    min-width: 140px;
  }

  &__title {
    font-size: 16px;
    padding-top: 20px;
    padding-bottom: 10px;
    text-transform: uppercase;
    font-family: 'Myriad900';

    &--order {
      font-size: 16px;
      padding-top: 20px;
      padding-bottom: 10px;
      text-transform: uppercase;
      font-family: 'Myriad900';
      border-bottom: 2px solid #f4f2f1;
    }
  }

  &__textarea {
    width: 100%;
    border: none;
    padding: 5px;
    outline: none;
    box-sizing: border-box;
    font-size: 14px;
    border: 1px solid #67573e;
    border-radius: 5px;
  }

  &__part {
    padding: 20px 10px;
    border: 2px solid #f4f2f1;
    border-radius: 10px;
    position: relative;
  }
}
ul {
  margin-block-start: 0em !important;
  margin-block-end: 0em !important;
  margin-inline-start: 0px !important;
  margin-inline-end: 0px !important;
  padding-inline-start: 0px !important;
}
</style>
