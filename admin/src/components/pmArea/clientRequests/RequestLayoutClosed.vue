<template lang="pug">
  .formLayout
    .form(v-if="user" )
      .parts
        .parts__left
          .form__title General Information
          .form__inputsGroup
            .form__inputs
              .form__projectName
                .input__title Project Name:
                input(type="text" :disabled="true" v-model="currentClientRequest.projectName")

              .form__projectDeadline
                .input__title Suggested Deadline:
                DatepickerWithTime(
                  placeholder="Suggested Deadline"
                  v-model="currentClientRequest.deadline"
                  @selected="(e) => updateProjectDate(e)"
                  monday-first=true
                  inputClass="datepicker-custom-compliance"
                  calendarClass="calendar-custom"
                  :format="customFormatter"
                  :disabledPicker="true"
                  ref="deadline"
                )

            .form__inputs
              .form__assignedPm
                .input__title Assign to Project Manager:
                .drop-white
                  SelectSingle(
                    :selectedOption="currentClientRequest.projectManager ? `${currentClientRequest.projectManager.firstName} ${currentClientRequest.projectManager.lastName}` : ''",
                    :isDisabled="true"
                  )

              .form__assignedPm
                .input__title Assign to Account Manager:
                .drop-white
                  SelectSingle(
                    :selectedOption="currentClientRequest.accountManager ? `${currentClientRequest.accountManager.firstName} ${currentClientRequest.accountManager.lastName}` : ''",
                    :isDisabled="true"
                  )

            .form__inputs
              .form__assignedPm
                .input__title Client Billing Info:
                .drop-white
                  SelectSingle(
                    :selectedOption="(currentClientRequest.clientBillingInfo && currentClientRequest.clientBillingInfo.name) || ''"
                    :isDisabled="true"
                  )

          .form__title Files Preparation & Options
          .form__table-box
            .form__table
              .approveModal(v-if="isDeleteModal")
                ApproveModal(
                  text="Delete file?"
                  approveValue="Yes"
                  notApproveValue="Cancel"
                  @approve="deleteFile"
                  @notApprove="closeDeleteFileApprovalModal"
                  @close="closeDeleteFileApprovalModal"
                )
              .table
                GeneralTable(
                  :fields="fields"
                  :tableData="files"
                )
                  .table__header(slot="headerFile" slot-scope="{ field }") {{ field.label }}
                  .table__header(slot="headerType" slot-scope="{ field }") {{ field.label }}
                  .table__header(slot="headerIcon" slot-scope="{ field }") {{ field.label }}

                  .table__data(slot="file" slot-scope="{ row }") {{row.filename}}
                  .table__data(slot="type" slot-scope="{ row }") {{row.type}}
                  .table__dataIcons(slot="icon" slot-scope="{ row }")
                    img(src="../../../assets/images/latest-version/download-file.png" style="cursor: pointer;" @click="downloadFile(row.path, row.isCheck)")

        .parts__right
          .form__title Options
          .form__comments
            Instructions(:instructions="currentClientRequest.instructions")

      .project__block-row.project_no-margin
        .project__block
          .block__header(@click="toggleBlock('isBrief')" )
            .title(style="display: flex;")
              span Project Brief

            .icon(v-if="!isBrief")
              i.fas.fa-chevron-down
            .icon(v-else)
              i.fas.fa-chevron-right
          .block__data(v-if="isBrief")
            divtextarea(v-html="currentClientRequest.brief")
        .project__block
          .block__header(@click="toggleBlock('isNotes')" )
            .title Project Notes
            .icon(v-if="!isNotes")
              i.fas.fa-chevron-down
            .icon(v-else)
              i.fas.fa-chevron-right
          .block__data(v-if="isNotes")
            divtextarea(v-html="currentClientRequest.notes")

    .side
      .side__info
        .form__project
          .form__project-title
            span(id="id") {{ currentClientRequest.projectId }}
          .form__project-icons
            .iconId(class="click-copy" @click="copyId")
              i.far.fa-copy
        //.order__title
        //  span {{ currentClientRequest.projectId }}
        //  span {{ currentClientRequest.startOption === 'Send' ? 'Send a Quote' : 'Start Immediately' }}
        //.order__value {{ currentClientRequest.projectId }}
        //  .order__details
        .order__row
          .order__subTitle Status:
          .order__value {{ currentClientRequest.status }}
        .order__row
          .order__subTitle Client:
          .order__value {{ currentClientRequest.customer.name }}
        .order__row
          .order__subTitle Service:
          .order__value {{ currentClientRequest.requestForm.service.title }}
        .order__row
          .order__subTitle Industry:
          .order__value {{ currentClientRequest.industry.name }}
        .order__row(v-if="currentClientRequest.requestForm.sourceLanguage" )
          .order__subTitle Source:
          .order__value {{ currentClientRequest.requestForm.sourceLanguage.lang }}
        .order__row
          .order__subTitle Targets:
          .order__value {{ getTargets(currentClientRequest) }}

        .order__row(v-if="currentClientRequest.hasOwnProperty('createdBy')")
          .order__subTitle Created By:
          .order__value {{ currentClientRequest.createdBy.firstName }} {{ currentClientRequest.createdBy.surname || '' }}

        .form__contacts
          .table
            GeneralTable(
              :fields="fields3"
              :tableData="currentClientRequest.clientContacts"
            )
              .table__header(slot="headerName" slot-scope="{ field }") {{ field.label }}

              .table__col(slot="name" slot-scope="{ row, index }")
                .table__data(v-if="!!row.firstName") {{row.firstName}} {{row.surname || ''}}

</template>

<script>
import { mapGetters, mapActions } from "vuex"
import DatepickerWithTime from "../../DatepickerWithTime"
import moment from "moment"
import Check from "../../Check"
import DataTable from "../../DataTable"
import Add from "../../Add"
import FilesUpload from "../tasks-n-steps/tasksFiles/FilesUpload"
import crudIcons from "@/mixins/crudIcons"
import SelectSingle from "../../SelectSingle"
import Button from "../../Button"
import ApproveModal from "../../ApproveModal"
import GeneralTable from "../../GeneralTable"
import SelectMulti from "../../SelectMulti"
import Instructions from "./Instructions"
import IconButton from "../../IconButton"


import CKEditor from "ckeditor4-vue"
import '../../../assets/scss/ckeditor.scss'
import { instructions } from "../../../../enums"

export default {
  mixins: [ crudIcons ],
  data() {
    return {
      instructions: instructions,
      isBrief: false,
      isNotes: false,
      clientRequest: {},
      disabled: {
        to: moment().add(-1, 'day').endOf('day').toDate()
      },
      files: [],
      fields: [
        { label: "File Name", headerKey: "headerFile", key: "file", style: { width: "55%" } },
        { label: "File Type", headerKey: "headerType", key: "type", style: { width: "25%" } },
        { label: "", headerKey: "headerIcon", key: "icon", style: { width: "20%" } }
      ],
      fields2: [
        { label: "Template", headerKey: "headerTemplate", key: "template", style: { width: "55%" } },
        { label: "Description", headerKey: "headerDescriptions", key: "description", style: { width: "30%" } },
        { label: "", headerKey: "headerIcons", key: "icons", style: { width: "15%" } }
      ],
      fields3: [
        { label: "Client Contacts", headerKey: "headerName", key: "name", style: { width: "100%" } }
      ],
      isUploadModal: false,
      isDeleteModal: false,
      deleteFileType: null,
      deleteFilePath: null,
      currentActive: -1,
      sourceFiles: [],
      refFiles: [],
      currentTemplate: '',
      selected: '',
      deleteCurrentRequest: false,
      mainSourceLanguageId: null
    }
  },
  methods: {
    ...mapActions({
      updateClientsRequestsProps: "updateClientsRequestsProps",
      setCurrentClientRequest: "setCurrentClientRequest",
      alertToggle: "alertToggle"
    }),
    toggleBlock(prop) {
      this[prop] = !this[prop]
    },
    getTargets({ requestForm }) {
      if (!requestForm.targetLanguages.length) return '-'
      return requestForm.targetLanguages.length > 1 ? requestForm.targetLanguages.map(i => i.lang).join(', ') : requestForm.targetLanguages[0].lang
    },
    copyId() {
      let id = document.getElementById('id')
      let elementText = id.textContent
      navigator.clipboard.writeText(elementText)
      try {
        document.execCommand('copy')
        this.alertToggle({ message: "Text copied successfully", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Text not copied", isShow: true, type: "error" })
      }
    },
    downloadFile(path, bool) {
      let link = document.createElement('a')
      link.href = __WEBPACK__API_URL__ + path
      link.target = "_blank"
      link.click()
    },
    customFormatter(date) {
      return moment(date).format('DD-MM-YYYY, HH:mm')
    },
    restructuredFiles(project) {
      const { requestForm: { sourceFiles, refFiles } } = project
      this.files = [
        ...sourceFiles.map(i => ({ ...i, type: 'Source' })),
        ...refFiles.map(i => ({ ...i, type: 'Reference' }))
      ]
    }
  },
  mounted() {
    this.restructuredFiles(this.currentClientRequest)
  },
  computed: {
    ...mapGetters({
      user: "getUser",
      users: "getUsers",
      languages: "getAllLanguages",
      currentClientRequest: "getCurrentClientRequest"
    })
  },

  components: {
    SelectMulti,
    GeneralTable,
    ApproveModal,
    Button,
    SelectSingle,
    FilesUpload,
    Add,
    DataTable,
    Check,
    DatepickerWithTime,
    ckeditor: CKEditor.component,
    Instructions,
    IconButton
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/styles/settingsTable";
@import "../../../assets/scss/colors";

.block {
  &__header {
    display: flex;
    justify-content: space-between;
    padding: 0px 10px;
    cursor: pointer;
    -webkit-box-align: center;
    transition: .2s ease;
    align-items: center;
    letter-spacing: .2px;
    border-radius: 4px;
    height: 36px;

    &-grey {
      background-color: white;
    }

    .title {
      font-size: 14px;
    }

    .icon {
      font-size: 13px;
      color: $text;
      margin-top: 2px;
    }
  }

  &__data {
    border-top: 1px solid $light-border;
    padding: 10px;
    max-height: 400px;
    overflow-y: auto;
  }
}

.project {
  &__block {
    box-sizing: border-box;
    border: 1px solid $light-border;
    position: relative;
    border-radius: 4px;
    background-color: white;
    width: 482px;

    &-row {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;

      ::-webkit-input-placeholder {
        opacity: 0.5;
      }
    }
  }
}

.parts {
  display: flex;
  justify-content: space-between;

  &__left {
    width: 57%;
  }

  &__right {
    width: 40%;
  }
}

.drop {
  height: 32px;
  position: relative;
  width: 220px;
}

input[type="text"]:disabled {
  background: white;
}

.table {
  position: relative;
  width: 100%;

  &__header {
    padding: 0 0 0 7px;
  }

  &__data {
    padding: 0 7px;
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  &__col {
    width: 100%;
  }

  &__dataDescription {
    overflow-x: auto;
    height: 40px;
    padding: 0 7px;
    display: grid;
    align-items: center;
  }

  &__dataDrop {
    position: relative;
    height: 32px;
    margin: 0 7px;
  }

  &__dataIcons {
    display: flex;
    justify-content: center;
    gap: 10px;
    width: 100%;
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

.drop-white {
  height: 32px;
  background: white;
  border-radius: 4px;
}

.button-m-top {
  margin-bottom: 15px;
}

.approve__delete {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translate(-50%, 0);
  z-index: 15;

}

.formLayout {
  padding: 50px;
  display: flex;
}

.side {
  &__contacts,
  &__pm {
    box-shadow: $box-shadow;
    padding: 25px;
    width: 240px;
    height: fit-content;
    margin-left: 40px;
    margin-bottom: 40px;
  }

  &__info {
    position: relative;
    box-shadow: $box-shadow;
    padding: 25px;
    width: 420px;
    box-sizing: border-box;
    margin-left: 50px;
    border-radius: 4px;
    background: white;
    margin-bottom: 25px;
  }
}

.form {
  position: relative;
  padding: 25px;
  min-width: 1040px;
  max-width: 1040px;
  box-sizing: border-box;
  box-shadow: $box-shadow;
  border-radius: 4px;
  background: white;
  height: fit-content;

  &__block {
    box-sizing: border-box;
    border: 1px solid $light-border;
    position: relative;
    border-radius: 4px;
    background-color: white;
    width: 482px;


    &-row {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;

      ::-webkit-input-placeholder {
        opacity: 0.4;
      }
    }
  }

  &__title {
    font-size: 16px;
    margin-top: 30px;
    padding-bottom: 8px;
    font-family: 'Myriad600'
  }

  &__project-icons {
    font-size: 16px;
    cursor: pointer;
  }

  &__approve {
    position: absolute;
    top: 25%;
    left: 50%;
    transform: translate(-50%, 0);
    z-index: 1;
  }

  &__wrapper {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(33, 33, 33, .1);
    z-index: 20;
    cursor: no-drop;

  }

  &__description {
    height: 30px;
    overflow-y: auto;
    padding: 0 5px;
    display: grid;
    align-items: center;
  }

  &__button {
    display: flex;
    justify-content: center;
  }

  &__data {
    height: 30px;
    display: grid;
    align-items: center;
    padding: 0 5px;
    overflow-y: auto;
  }

  &__comments {
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px;
    padding: 25px;
    border: 2px solid $light-border;
    border-radius: 4px;
  }

  &__table-box {
    border: 2px solid $light-border;
    border-radius: 4px;
    padding: 25px;
    margin-bottom: 30px;
  }

  &__table {
    position: relative;
  }

  &__contacts {
    margin-top: 20px;
    margin-bottom: 10px;
  }

  &__dataIcons {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 30px;
  }

  &__inputs {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    min-height: 50px;
  }

  &__group {
    display: flex;
  }

  &__inputsGroup {
    flex-grow: 1;
    position: relative;
    padding: 25px 25px 5px 25px;
    border: 2px solid $light-border;
    border-radius: 4px;
    height: fit-content;
  }

  &__projectName {
    position: relative;
  }

  &__projectDeadline {
    position: relative;
  }

  &__assignedPm {
    position: relative;
    width: 220px;
    height: 32px;
  }

  &__icons {
    @extend %table-icons;
    justify-content: center;
    margin-left: 10px;
  }

  &__icon {
    @extend %table-icon;
  }

  &__project {
    margin-bottom: 20px;
    border-bottom: 1px solid $light-border;
    width: 100%;
    padding-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &-title {
      font-size: 18px;
      font-family: 'Myriad600';
    }

    &-icons {
      display: flex;
    }
  }
}

.tasks-files {
  position: relative;

  &__tableAdd {
    width: 100px;
  }

  &__items {
    display: flex;
    justify-content: space-around;
  }

  &__item {
    display: flex;
    align-items: center;
  }

  &__label {
    margin-right: 15px;

    &-red {
      color: red;
      font-size: 14px;
      margin-right: 15px;
    }
  }

  &__main {
    padding: 30px 25px 25px 25px;
    box-shadow: $box-shadow;
    position: absolute;
    z-index: 9999;
    background: white;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 420px;
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

  &__upload-file {
    position: relative;
  }

  &__tooltip {
    text-align: center;
    opacity: 0.6;
    margin-top: 20px;
  }
}

.contacts {
  &__data {
    height: 30px;
    display: flex;
    align-items: center;
    padding: 0 5px;
  }

  &__dataDrop {
    position: relative;
  }

  &__dataIcon {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 30px;
  }
}

.opacity-1 {
  opacity: 1;
}

.opacity-04 {
  opacity: 0.4;
  cursor: default !important;
}

.input {
  &__title {
    margin-bottom: 4px;
  }
}

.calendar {
  cursor: pointer;
}

.order {
  &__buttons {
    padding-top: 25px;
    margin-top: 5px;
    border-top: 1px solid $light-border;
  }

  &__details {
    font-size: 12px;
    font-family: 'Myriad400';
    opacity: 0.6;
    padding-left: 5px;
  }

  &__subTitle {
    width: 110px;
  }

  &__title {
    font-size: 18px;
    font-family: Myriad600;
  }

  &__value {
    font-family: 'Myriad400';
  }

  &__row {
    display: flex;
    align-items: center;
    width: 100%;
    height: 40px;
  }

}

.pm {
  &__drop {
    height: 30px;
    position: relative;
    width: 240px;
  }
}

.approveModal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 40;
}

textarea {
  width: 100%;
  border-radius: 4px;
  border: 1px solid $border;
  padding: 5px;
  color: $text;
  resize: none;
  outline: none;
  box-sizing: border-box;
  transition: .1s ease-out;

  &:focus {
    border: 1px solid $border-focus;
  }
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

.copy-to-brief {
  position: absolute;
  left: -32px;
}

#checkProject,
#checkDeadline {
  position: absolute;
  bottom: 7px;
  right: 5px;
}

#calendar {
  position: absolute;
  right: 30px;
  bottom: 4px;
  font-size: 19px;
}

#checkBrief {
  position: absolute;
  right: -23px;
  top: 10px;
}

.iconId {
  font-size: 15px;
  border-radius: 4px;
  height: 30px;
  width: 30px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: .2s ease-out;
  justify-content: center;
  border: 1px solid $border;
  color: $dark-border;
  margin-left: 10px;

  &:hover {
    color: $text;
  }
}
</style>
