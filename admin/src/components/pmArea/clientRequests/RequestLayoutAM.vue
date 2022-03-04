<template lang="pug">
  .formLayout
    .form(v-if="user" )
      .form__approve
        ApproveModal(
          v-if="selected"
          text="Do you want to change manager?"
          approveValue="Yes"
          notApproveValue="Cancel"
          @approve="setAM"
          @notApprove="setDefault"
          @close="setDefault"
        )
      .form__wrapper(v-if="!canUpdateRequest()")
      .parts
        .parts__left
          .form__title General Information
          .form__inputsGroup
            .form__inputs
              .form__projectName
                .input__title Project Name:
                input(type="text" :disabled="currentClientRequest.checkedForm.isCheckProjectName" v-model="currentClientRequest.projectName" @change="changeProjectName('projectName', currentClientRequest.projectName)" placeholder="Project Name")
                Check(id="checkProject" @click="checkProjectName", :isApproved="currentClientRequest.checkedForm.isCheckProjectName")
              .form__projectDeadline
                .input__title Suggested Deadline:
                DatePicker(
                  :value="new Date(currentClientRequest.deadline)"
                  @confirm="(e) => updateProjectDate(e)"
                  format="DD-MM-YYYY, HH:mm"
                  type="datetime"
                  ref="deadline"
                  :clearable="false"
                  :confirm="true"
                  :disabled="currentClientRequest.checkedForm.isCheckDeadline"
                  confirm-text="Set date"
                  prefix-class="xmx"
                )
                Check(id="checkDeadline" @click="checkProjectDeadline", :isApproved="currentClientRequest.checkedForm.isCheckDeadline")


            .form__inputs
              .form__assignedPm
                .input__title Assign to Project Manager:
                .drop-white
                  SelectSingle(
                    :hasSearch="true"
                    :options="managers",
                    placeholder="Option",
                    :selectedOption="currentClientRequest.projectManager ? `${currentClientRequest.projectManager.firstName} ${currentClientRequest.projectManager.lastName}` : ''",
                    @chooseOption="setPM"
                  )

              .form__assignedPm
                .input__title Assign to Account Manager:
                .drop-white
                  SelectSingle(
                    :hasSearch="true"
                    :options="accountManagers",
                    placeholder="Option",
                    :selectedOption="currentClientRequest.accountManager ? `${currentClientRequest.accountManager.firstName} ${currentClientRequest.accountManager.lastName}` : ''",
                    @chooseOption="approveChangeAM"
                  )

            //.form__inputs
            //  .form__assignedPm
            //    .input__title Client Billing Info:
            //    .drop-white
            //      SelectSingle(
            //        :hasSearch="true"
            //        placeholder="Option"
            //        :options="billingInfoList.map(({name}) => name)"
            //        :selectedOption="(currentClientRequest.clientBillingInfo && currentClientRequest.clientBillingInfo.name) || ''"
            //        @chooseOption="choseBillingInfo"
            //      )

          .form__title Files Preparation
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
                    img(src="../../../assets/images/latest-version/download-file.png" style="cursor: pointer;" :class="{'opacity-04': row.isCheck}" @click="downloadFile(row.path, row.isCheck)")
                    span(@click="(e) => openDeleteFileApprovalModal(row.type, row.path, row.isCheck)" style="cursor: pointer;" :class="{'opacity-04': row.isCheck}")
                      i.fas.fa-trash
                    Check(@click="(e) => checkFile(e, row)", :isApproved="row.isCheck")

                .tasks-files__add(id="add")
                  Add(v-if="canUpdateRequest()" @add="openUploadModal")

                .tasks-files__main(v-if="isUploadModal" id="modal")
                  .tasks-files__items
                    span.tasks-files__close(@click="closeUploadModal") &#215;
                    .tasks-files__item
                      span Source file:
                      span.tasks-files__label-red
                      .tasks-files__upload-file
                        FilesUpload(
                          inputClass="files-upload__source-file"
                          :files="sourceFiles"
                          @uploadFiles="uploadSourceFiles"
                          @deleteFile="(e) => deleteFile(e, 'sourceFiles')"
                        )
                    .tasks-files__item
                      span Reference file:
                      span.tasks-files__label-red
                      .tasks-files__upload-file
                        FilesUpload(
                          inputClass="files-upload__ref-file"
                          :files="refFiles"
                          @uploadFiles="uploadRefFiles"
                          @deleteFile="(e) => deleteFile(e, 'refFiles')"
                        )
                  .tasks-files__tooltip
                    div Source: each file can be <= 2Mb for Translation service, other can be <= 50Mb
                    div Reference: each file can be <= 50Mb

        .parts__right
          .form__title Options
          .form__comments
            Instructions(:instructions="currentClientRequest.instructions")

      .project__block-row.project_no-margin
        .project__block
          Check(id="checkBrief" @click="checkBrief", :isApproved="currentClientRequest.checkedForm.isCheckBrief")
          #swapBrief(@click="copyNotesToBrief" v-if="!currentClientRequest.checkedForm.isCheckBrief" )
            i(class="fas fa-arrow-circle-left")
          .block__header(@click="toggleBlock('isBrief')" )
            .title(style="display: flex;")
              span Project Instructions
            .icon(v-if="!isBrief")
              i.fas.fa-chevron-down
            .icon(v-else)
              i.fas.fa-chevron-right
          .block__data(v-if="isBrief && canUpdateRequest()")
            ckeditor(v-model="currentClientRequest.brief" ref="editor" :config="editorConfig" @blur="changeBrief")

        .project__block
          .block__header(@click="toggleBlock('isNotes')" )
            .title Project Notes
            .icon(v-if="!isNotes")
              i.fas.fa-chevron-down
            .icon(v-else)
              i.fas.fa-chevron-right
          .block__data(v-if="isNotes && canUpdateRequest()")
            ckeditor(v-model="currentClientRequest.notes" :config="editorConfig" @blur="changeNotes")


      .optionsAndButton
        .options
          .options__item.border(:class="{'options_brown': isClassicConvert}" @click="(e) => toggleConvert(e, 'isClassicConvert')") Send to PM
          .options__item(:class="{'options_brown': isPreCreatedProject}" @click="(e) => toggleConvert(e, 'isPreCreatedProject')") Generate T&S
        .form__button
          Button(@clicked="approveRequest" :isDisabled="!isAllChecked || !currentClientRequest.requestForm.targetLanguages.length || onRequestSending" value="Proceed")

    .side
      .side__info
        .approve__delete
          ApproveModal(
            v-if="deleteCurrentRequest"
            text="Do you want to delete Request?"
            approveValue="Yes"
            notApproveValue="Cancel"
            @approve="deleteRequest"
            @notApprove="doNotDelete"
            @close="doNotDelete"
          )
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
                .table__dataDrop(v-else)
                  SelectSingle(
                    :hasSearch="true"
                    :isTableDropMenu="true"
                    :options="availableContacts"
                    @chooseOption="setContact"
                  )

              .table__dataIcon(v-if="canUpdateRequest()" slot="icon" slot-scope="{ row, index }")
                span(@click="removeContact(row)" style="margin-top: 2px; cursor: pointer;")
                  i.fas.fa-trash

          Add(v-if="canUpdateRequest()" @add="addContact")

        .order__buttons
          Button(v-if="(isAdmin || isAm()) && !isAmSet()" class="button-m-top" @clicked="setCurrentAm" value="Get This Project" )
          Button(v-if="isAdmin || isAm()" color="#d66f58" :outline="true" @clicked="isDeleteRequest" value="Delete Request" )

      .side__info()
        .form__wrapper(v-if="!canUpdateRequest()")
        .form__project
          .form__project-title Languages
        .order__row(v-if="currentClientRequest.requestForm.service.languageForm !== 'Mono'" )
          .order__subTitle Source:
          .order__value
            .drop
              SelectSingle(
                :hasSearch="true"
                placeholder="Option"
                :options="getSourceLanguages.map(i => i.lang)"
                :selectedOption="currentClientRequest.requestForm.sourceLanguage.lang"
                @chooseOption="setSourceLanguage"
              )
        .order__row
          .order__subTitle Targets:
          .order__value
            .drop
              SelectMulti(
                :hasSearch="true"
                placeholder="Options"
                :options="getTargetLanguages.map(i => i.lang)"
                :selectedOptions="currentClientRequest.requestForm.targetLanguages.length ? currentClientRequest.requestForm.targetLanguages.map(i => i.lang) : []"
                @chooseOptions="setTargetLanguages"
              )

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

import DatePicker from 'vue2-datepicker'
import '../../../assets/scss/datepicker.scss'


import CKEditor from "ckeditor4-vue"
import '../../../assets/scss/ckeditor.scss'
// import { instructions } from "../../../../enums"

export default {
  mixins: [ crudIcons ],
  data() {
    return {
      isClassicConvert: true,
      isPreCreatedProject: false,
      onRequestSending: false,
      // instructions: instructions,
      isBrief: true,
      isNotes: true,
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
        { label: "Client Contacts", headerKey: "headerName", key: "name", style: { width: "80%" } },
        { label: "", headerKey: "headerIcon", key: "icon", style: { width: "20%" } }
      ],
      editorConfig: {
        extraPlugins: [ 'colorbutton', 'smiley' ],
        toolbarGroups: [
          { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
          { name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
          { name: 'editing', groups: [ 'find', 'selection', 'spellchecker', 'editing' ] },
          { name: 'forms', groups: [ 'forms' ] },
          { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
          { name: 'clipboard', groups: [ 'clipboard', 'undo' ] },
          { name: 'links', groups: [ 'links' ] },
          // { name: 'insert', groups: [ 'insert' ] },
          { name: 'styles', groups: [ 'styles' ] },
          { name: 'colors', groups: [ 'colors' ] },
          { name: 'tools', groups: [ 'tools' ] },
          { name: 'others', groups: [ 'others' ] },
          { name: 'about', groups: [ 'about' ] }
        ],
        removeButtons: 'Source,Save,NewPage,ExportPdf,Preview,Print,Templates,Cut,Copy,Paste,PasteText,PasteFromWord,Find,Replace,SelectAll,Form,Checkbox,Radio,TextField,Textarea,Select,ImageButton,HiddenField,Button,Superscript,Subscript,CopyFormatting,NumberedList,Blockquote,CreateDiv,JustifyLeft,JustifyCenter,JustifyRight,JustifyBlock,BidiLtr,BidiRtl,Language,Anchor,HorizontalRule,Table,Flash,PageBreak,Iframe,Styles,Format,Font,FontSize,ShowBlocks,Maximize,About',
        uiColor: "#ffffff",
        height: 280
      },
      // forbiddenExtensions: [
      // 	'webm', 'mpg', 'mp2', 'mpeg', 'mpe', 'mpv', 'ogg', 'mp4', 'm4p',
      // 	'm4v', 'avi', 'wmv', 'mov', 'qt', 'flv', 'swf', 'avchd', 'jpeg',
      // 	'png', 'gif', 'bmp', 'tiff', 'ppm', 'pgm', 'jpg', 'svg', 'bat',
      // 	'mp3', 'aac', '3gp', 'aa', 'aax', 'aiff', 'alac', 'm4p', 'mpc'
      // ],
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
    toggleConvert(e, prop) {
      this[prop] = true
      if (prop === 'isClassicConvert') {
        this.isPreCreatedProject = false
      } else if (prop === 'isPreCreatedProject') {
        this.isClassicConvert = false
      }
    },
    copyNotesToBrief() {
      this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { 'brief': this.currentClientRequest.notes, 'notes': this.currentClientRequest.notes } })
    },
    toggleBlock(prop) {
      if (this[prop]) {
        this.changeBrief()
        this.changeNotes()
      }
      this[prop] = !this[prop]
    },
    getTargets({ requestForm }) {
      if (!requestForm.targetLanguages.length) return '-'
      return requestForm.targetLanguages.length > 1 ? requestForm.targetLanguages.map(i => i.lang).join(', ') : requestForm.targetLanguages[0].lang
    },
    async setSourceLanguage({ option }) {
      const neededLanguageObject = this.languages.find(item => item.lang === option)
      if (neededLanguageObject._id.toString() === this.mainSourceLanguageId.toString()) return
      this.mainSourceLanguageId = neededLanguageObject._id

      try {
        const updatedProject = await this.$http.post('/clients-requests/manage-request-languages', {
          projectId: this.currentClientRequest._id,
          type: 'sourceLanguage',
          data: neededLanguageObject
        })
        this.setCurrentClientRequest(updatedProject.data)
      } catch (err) {
        this.alertToggle({ message: "Error in setting source language!", isShow: true, type: "error" })
      }
    },
    async setTargetLanguages({ option }) {
      let data = [ ...this.currentClientRequest.requestForm.targetLanguages ]
      const neededLanguageObject = this.languages.find(item => item.lang === option)

      const position = data.findIndex(item => item.lang === option)
      if (position !== -1) data.splice(position, 1)
      else data.push(neededLanguageObject)

      try {
        const updatedProject = await this.$http.post('/clients-requests/manage-request-languages', {
          projectId: this.currentClientRequest._id,
          type: 'targetLanguages',
          data
        })
        this.setCurrentClientRequest(updatedProject.data)
      } catch (err) {
        this.alertToggle({ message: "Error in setting target language!", isShow: true, type: "error" })
      }
    },
    isDeleteRequest() {
      this.deleteCurrentRequest = true
    },
    async deleteRequest() {
      const { id } = this.$route.params
      await this.$http.post(`/clients-requests/${ id }/delete`)
      if (window.history.length > 2) this.$router.go(-1)
      else this.$router.push('/pangea-dashboard/overall-view')
    },
    doNotDelete() {
      this.deleteCurrentRequest = false
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
    setCurrentAm() {
      if (this.isAmSet()) return
      if (this.isAdmin) {
        const { _id } = this.users.find(item => {
          const { group: { name } } = item
          return name === "Account Managers"
        })
        this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { "accountManager": _id } })
        return
      }
      this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { "accountManager": this.user._id } })
    },
    canUpdateRequest() {
      if (!this.currentClientRequest.accountManager) return false

      const group = this.user.group.name
      const isAdmin = group === "Administrators" || group === "Developers"
      const currentAm = group === "Account Managers" && this.currentClientRequest.accountManager._id === this.user._id

      const isCurrentClientCC = (
          !!this.currentClientRequest.projectManager
          && this.user._id.toString() === "61b359f25c9ee507f4aa7a14"
          && this.currentClientRequest.projectManager._id === "60b4dee7f2611f5115701566"
      )

      return isAdmin || currentAm || isCurrentClientCC
    },
    async approveRequest() {
      this.onRequestSending = true
      if (!this.canUpdateRequest()) return
      try {
        if (this.isClassicConvert) {
          await this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { "tasksAndSteps": [] } })
          await this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { "status": 'Request Approved' } })
          this.onRequestSending = false
        } else if (this.isPreCreatedProject) {
          await this.convertWithPreCreation()
          await this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { "status": 'Request Approved' } })
          this.onRequestSending = false
        }
        this.alertToggle({ message: "Project approved!", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Project not approved!", isShow: true, type: "error" })
        this.onRequestSending = false
      }
    },
    async convertWithPreCreation() {
      const { instructions, deadline, requestForm: { sourceFiles, refFiles, targetLanguages, service: { title, steps } } } = this.currentClientRequest

      let quantity = 0
      let tasksData = new FormData()
      tasksData.append('requestId', this.currentClientRequest._id)
      tasksData.append('targets', JSON.stringify(targetLanguages))
      if (sourceFiles && sourceFiles.length) tasksData.append('sourceFilesVault', JSON.stringify(sourceFiles))
      if (refFiles && refFiles.length) tasksData.append('refFilesVault', JSON.stringify(refFiles))

      if (title === 'Translation') {
        const templates = await this.getMemoqTemplates()
        tasksData.append('template', JSON.stringify(templates[0]))
      } else if (title === 'Compliance') {
        quantity = sourceFiles && sourceFiles.length ? sourceFiles.length : 0
        tasksData.append('template', null)
      } else {
        tasksData.append('template', null)
        quantity = 1
      }

      if (title === 'Compliance' && instructions.length) {
        for await (const complianceTemplate of instructions) {
          const stepsAndUnits = []
          tasksData.delete('stepsAndUnits')
          for (const { step } of steps) {
            const settingStep = this.allSteps.find(item => item._id.toString() === step.toString())
            if (!settingStep) throw 'NO STEPS IN SERVICE'
            const unit = settingStep.calculationUnit.find(item => item.type === hardcodeDetectComplianceUnit(complianceTemplate))
            if (!unit) throw 'NO UNITS IN STEP'

            stepsAndUnits.push({
              step: settingStep,
              start: new Date(),
              deadline,
              receivables: { unit, quantity },
              payables: { unit, quantity }
            })
          }
          tasksData.append('stepsAndUnits', JSON.stringify(stepsAndUnits))
          await this.$http.post('/pm-manage/request-tasks', tasksData)
        }
      } else {
        const stepsAndUnits = []
        for (const { step } of steps) {
          const settingStep = this.allSteps.find(item => item._id.toString() === step.toString())
          if (!settingStep) throw 'NO STEPS IN SERVICE'
          const unit = settingStep.calculationUnit[0]
          if (!unit) throw 'NO UNITS IN STEP'

          stepsAndUnits.push({
            step: settingStep,
            start: new Date(),
            deadline,
            receivables: { unit, quantity },
            payables: { unit, quantity }
          })
        }
        tasksData.append('stepsAndUnits', JSON.stringify(stepsAndUnits))
        await this.$http.post('/pm-manage/request-tasks', tasksData)
      }

      function hardcodeDetectComplianceUnit({ title, isChanged }) {
        const re = /\[(.*)\]/.exec(title)

        if (isChanged) return 'Compliance Expert'
        if (!re) return 'Compliance Basic'

        const [ , num ] = re
        return (num.toString() === '3' || num.toString() === '9' || num.toString() === '10')
            ? 'Compliance Advance'
            : 'Compliance Basic'
      }
    },
    async getMemoqTemplates() {
      try {
        const result = await this.$http.get("/memoqapi/templates")
        return result.data
      } catch (err) {
        return [ { name: 'No Templates' } ]
      }
    },
    openDeleteFileApprovalModal(type, path, bool) {
      if (!this.canUpdateRequest() || bool) return
      this.isDeleteModal = true
      this.deleteFileType = type
      this.deleteFilePath = path
    },
    closeDeleteFileApprovalModal() {
      this.isDeleteModal = false
      this.deleteFileType = null
      this.deleteFilePath = null
    },
    async deleteFile() {
      if (!this.canUpdateRequest()) return
      try {
        const updatedProject = await this.$http.post("/clients-requests/remove-form-file", {
          path: this.deleteFilePath,
          projectId: this.currentClientRequest._id,
          type: this.deleteFileType
        })
        this.setCurrentClientRequest(updatedProject.data)
        this.restructuredFiles(updatedProject.data)
        this.alertToggle({ message: "File removed!", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Error on remove DR1 Files", isShow: true, type: "error" })
      } finally {
        this.closeDeleteFileApprovalModal()
      }
    },
    changeProjectName(key, value) {
      if (!this.canUpdateRequest()) return
      if (!value) {
        this.alertToggle({ message: "Project name not saved!", isShow: true, type: "error" })
        return
      }
      try {
        this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { [key]: value } })
        this.alertToggle({ message: "Project name saved!", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Project name not saved!", isShow: true, type: "error" })
      }
    },
    changeBrief() {
      if (!this.canUpdateRequest()) return
      try {
        this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { 'brief': this.currentClientRequest.brief } })
        this.alertToggle({ message: "Project Instructions saved!", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Project Instructions not saved!", isShow: true, type: "error" })
      }
    },
    changeNotes() {

      if (!this.canUpdateRequest()) return
      try {
        this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { 'notes': this.currentClientRequest.notes } })
        this.alertToggle({ message: "Project notes saved!", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Project notes not saved!", isShow: true, type: "error" })
      }
    },
    async makeAction(index, key) {
      if (!this.canUpdateRequest()) return
      if (this.currentActive !== -1 && this.currentActive !== index) {
        return this.isEditing()
      }
      switch (key) {
        case "edit":
          this.setEditingData(index)
          break
        case "cancel":
          this.manageCancelEdition(index)
          break
        case "save":
          await this.saveTemplate(index)
          break
      }
    },
    setEditingData(index) {
      if (!this.canUpdateRequest()) return
      if (this.currentClientRequest.checkedForm.isCheckComplianceTemplate) return
      this.currentActive = index
      this.currentTemplate = this.currentClientRequest.requestForm.complianceOptions
    },
    manageCancelEdition() {
      this.currentActive = -1
    },
    setTemplate({ option }) {
      if (!this.canUpdateRequest()) return
      this.currentTemplate = this.complianceTemplates.find(({ title }) => title === option)
    },
    saveTemplate(index) {
      if (!this.canUpdateRequest()) return
      if (this.currentActive === -1 || this.currentActive !== index) return
      try {
        this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { "requestForm.complianceOptions": this.currentTemplate } })
        this.alertToggle({ message: "Project template saved!", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Project template not saved!", isShow: true, type: "error" })
      } finally {
        this.manageCancelEdition()
        this.checkTemplate(false)
      }
    },
    setPM({ option }) {
      if (!this.canUpdateRequest()) return
      const pm = this.users.find(({ firstName, lastName }) => `${ firstName } ${ lastName }` === option)
      try {
        this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { "projectManager": pm } })
        this.alertToggle({ message: "Project managers added!", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Project managers not added!", isShow: true, type: "error" })
      }
    },
    isAmSet() {
      return this.currentClientRequest.accountManager !== null
    },
    isAm() {
      return this.user.group.name === 'Account Managers'
    },
    approveChangeAM({ option }) {
      this.selected = option
    },
    setDefault() {
      this.selected = ''
    },
    setAM() {
      if (!this.canUpdateRequest()) return
      const am = this.users.find(({ firstName, lastName }) => `${ firstName } ${ lastName }` === this.selected)
      this.selected = ''
      try {
        this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { "accountManager": am } })
        this.alertToggle({ message: "Account managers added!", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Account managers not added!", isShow: true, type: "error" })
      }
    },
    async removeContact(row) {
      if (!this.canUpdateRequest()) return
      if (this.currentClientRequest.clientContacts.length === 1) {
        this.alertToggle({ message: 'One contact should remain', isShow: true, type: "error" })
        return
      }
      try {
        const updatedProject = await this.$http.post('/clients-requests/manage-client-contact', { projectId: this.currentClientRequest._id, contact: row, action: 'Delete' })
        this.setCurrentClientRequest(updatedProject.data)
        this.alertToggle({ message: "Project contact removed!", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Project contact not removed!", isShow: true, type: "error" })
      }
    },
    async setContact({ option }) {
      if (!this.canUpdateRequest()) return
      const contact = this.currentClientRequest.customer.contacts.find(item => `${ item.firstName } ${ item.surname }` === option)
      try {
        const updatedProject = await this.$http.post('/clients-requests/manage-client-contact', { projectId: this.currentClientRequest._id, contact, action: 'Add' })
        this.setCurrentClientRequest(updatedProject.data)
        this.alertToggle({ message: "Project contact saved!", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Project contact not saved!", isShow: true, type: "error" })
      }
    },
    addContact() {
      if (!this.canUpdateRequest()) return
      this.currentClientRequest.clientContacts.push({})
    },
    checkTemplate(data) {
      if (!this.canUpdateRequest()) return
      try {
        this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { "checkedForm.isCheckComplianceTemplate": data } })
        this.alertToggle({ message: "Template checked!", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Template not checked!", isShow: true, type: "error" })
      }
    },
    downloadFile(path, bool) {
      if (bool) return
      let link = document.createElement('a')
      link.href = this.$domains.admin + path
      link.target = "_blank"
      link.click()
    },
    customFormatter(date) {
      return moment(date).format('DD-MM-YYYY, HH:mm')
    },
    checkProjectName(data) {
      if (!this.canUpdateRequest()) return
      try {
        this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { "checkedForm.isCheckProjectName": data } })
        this.alertToggle({ message: "Project checked!", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Project not checked!", isShow: true, type: "error" })
      }
    },
    checkBrief(data) {
      if (!this.canUpdateRequest()) return
      try {
        this.changeBrief()
        this.changeNotes()
        this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { "checkedForm.isCheckBrief": data } })
        this.alertToggle({ message: "Project Instructions checked!", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Project Instructions not checked!", isShow: true, type: "error" })
      }
    },
    async checkFile(data, { path, type }) {
      if (!this.canUpdateRequest()) return
      try {
        const updatedProject = await this.$http.post("/clients-requests/check-form-file", { projectId: this.currentClientRequest._id, path, check: data, type })
        this.setCurrentClientRequest(updatedProject.data)
        this.restructuredFiles(updatedProject.data)
        this.alertToggle({ message: "File checked!", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Error checked file!", isShow: true, type: "error" })
      } finally {
        this.clearInputFiles(".files-upload__source-file")
      }
    },
    checkProjectDeadline(data) {
      if (!this.canUpdateRequest()) return
      try {
        this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { "checkedForm.isCheckDeadline": data } })
        this.alertToggle({ message: "Project deadline checked!", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Project deadline not checked!", isShow: true, type: "error" })
      }
    },
    async updateProjectDate(data) {
      if (!this.canUpdateRequest()) return
      try {
        this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { 'deadline': data } })
        this.alertToggle({ message: "Project deadline saved!", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Project deadline saved!", isShow: true, type: "error" })
      }
    },
    restructuredFiles(project) {
      // if (!this.canUpdateRequest()) return
      const { requestForm: { sourceFiles, refFiles } } = project
      this.files = [
        ...sourceFiles.map(i => ({ ...i, type: 'Source' })),
        ...refFiles.map(i => ({ ...i, type: 'Reference' }))
      ]
    },
    // deadlineOpen() {
    //   if (!this.canUpdateRequest()) return
    //   this.$refs.deadline.showCalendar()
    // },
    clearInputFiles(str) {
      if (!this.canUpdateRequest()) return
      let inputFiles = document.querySelectorAll(str)
      for (let elem of inputFiles) {
        elem.value = ''
      }
    },
    async uploadSourceFiles({ files }) {
      if (!this.canUpdateRequest()) return
      const filteredFiles = Array.from(files).filter(item => {
        const { size, name } = item
        const extension = name.split('.').pop()
        if (this.currentClientRequest.requestForm.service.title === 'Compliance') {
          return size / 1000000 <= 50
        } else {
          return size / 1000000 <= 2
        }
        // return size / 1000000 <= 2 && this.forbiddenExtensions.indexOf(extension) === -1
      })

      let formData = new FormData()
      formData.append("type", 'Source')
      formData.append("projectId", this.currentClientRequest._id)

      if (filteredFiles.length) {
        for (let file of filteredFiles) formData.append('sourceFiles', file)
      } else {
        return
      }

      try {
        const updatedProject = await this.$http.post("/clients-requests/add-form-file", formData)
        this.setCurrentClientRequest(updatedProject.data)
        this.restructuredFiles(updatedProject.data)
        this.alertToggle({ message: "File added!", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Error add files!", isShow: true, type: "error" })
      } finally {
        this.clearInputFiles(".files-upload__source-file")
      }
    },
    async uploadRefFiles({ files }) {
      if (!this.canUpdateRequest()) return
      const filteredFiles = Array.from(files).filter(item => {
        const { size, name } = item
        const extension = name.split('.').pop()
        //return size / 1000000 <= 50 && this.forbiddenExtensions.indexOf(extension) === -1
        return size / 1000000 <= 50
      })

      let formData = new FormData()
      formData.append("type", 'Reference')
      formData.append("projectId", this.currentClientRequest._id)

      if (filteredFiles.length) {
        for (let file of filteredFiles) formData.append('refFiles', file)
      } else {
        return
      }

      try {
        const updatedProject = await this.$http.post("/clients-requests/add-form-file", formData)
        this.setCurrentClientRequest(updatedProject.data)
        this.restructuredFiles(updatedProject.data)
        this.alertToggle({ message: "File added!", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Error add files!", isShow: true, type: "error" })
      } finally {
        this.clearInputFiles(".files-upload__ref-file")
      }
    },
    outsideClickListener(e) {
      const layout = document.getElementById("modal")
      const add = document.getElementById("add")
      let { target } = e
      do {
        if (target === layout) return
        if (target === add) return
        target = target.parentNode
      } while (target)

      this.closeUploadModal()
    },
    closeUploadModal() {
      this.isUploadModal = false
      document.removeEventListener('click', this.outsideClickListener)
    },
    openUploadModal() {
      this.isUploadModal = true
      document.addEventListener('click', this.outsideClickListener)
    },
    replaceDescription(str) {
      if (!this.canUpdateRequest()) return
      return str.split(/<\/li>/).join('').split(/<li>/).filter(i => !!i).reduce((acc, curr) => {
        acc = acc + curr + '; '
        return acc
      }, '')
    }
    // async choseBillingInfo({ option }) {
    //   const billingInfo = this.billingInfoList.find(({ name }) => name === option)
    //   try {
    //     const updatedProject = await this.$http.post(`/clients-requests/manage-client-billing-info/${ this.currentClientRequest._id }`, {
    //       billingInfoId: billingInfo._id
    //     })
    //     this.setCurrentClientRequest(updatedProject.data)
    //     this.alertToggle({ message: "Project billing info changed!", isShow: true, type: "success" })
    //   } catch (err) {
    //     this.alertToggle({ message: "Project billing info not changed!", isShow: true, type: "error" })
    //   }
    // }
  },
  mounted() {
    this.restructuredFiles(this.currentClientRequest)
    this.mainSourceLanguageId = this.currentClientRequest.requestForm.service.languageForm === 'Mono'
        ? null
        : this.currentClientRequest.requestForm.sourceLanguage._id.toString()
  },
  computed: {
    ...mapGetters({
      user: "getUser",
      users: "getUsers",
      languages: "getAllLanguages",
      allSteps: "getAllSteps",
      allUnits: "getAllUnits",
      currentClientRequest: "getCurrentClientRequest"
    }),
    billingInfoList() {
      if (!this.currentClientRequest.customer.billingInfo || !this.currentClientRequest.customer.billingInfo.length) return []

      const billingInfo = this.currentClientRequest.customer.billingInfo
      return billingInfo.map(({ _id, paymentType, name }) => ({ _id, paymentType, name }))

    },
    getSourceLanguages() {
      if (this.languages.length) {
        const { customer: { services }, requestForm: { service }, industry } = this.currentClientRequest
        const neededServices = [ ...new Set(services
            .filter(item => item.industries[0].toString() === industry._id.toString() && item.services[0].toString() === service._id.toString())
            .map(item => item.sourceLanguage)) ]
        return neededServices.map(item => this.languages.find(item2 => item2._id.toString() === item))
      }
    },
    getTargetLanguages() {
      if (this.languages.length) {
        const { customer: { services }, requestForm: { service }, industry } = this.currentClientRequest
        const neededServices = [ ...new Set(services
            .filter(item => item.industries[0].toString() === industry._id.toString()
                    && item.services[0].toString() === service._id.toString()
                // && (service.languageForm === 'Mono' ? true : item.sourceLanguage.toString() === this.mainSourceLanguageId.toString())
            )
            .map(item => item.targetLanguages[0])) ]
        return neededServices.map(item => this.languages.find(item2 => item2._id.toString() === item))
      }
      return []
    },
    isAdmin() {
      const { group: { name } } = this.user
      return name === "Administrators" || name === "Developers"
    },
    availableContacts() {
      return this.currentClientRequest.customer.contacts
          .map(item => `${ item.firstName } ${ item.surname }`)
          .filter(name => !this.currentClientRequest.clientContacts.map(item => `${ item.firstName } ${ item.surname }`).includes(name))
    },
    managers() {
      return this.users.map(item => {
        const { group: { name }, firstName, lastName } = item
        if (name === 'Project Managers') return `${ firstName } ${ lastName }`
      }).filter(i => !!i)
    },
    accountManagers() {
      return this.users.map(item => {
        const { group: { name }, firstName, lastName } = item
        if (name === 'Account Managers') return `${ firstName } ${ lastName }`
      }).filter(i => !!i)
    },
    manageIcons() {
      const { delete: del, ...result } = this.icons
      return result
    },
    isAllChecked() {
      const {
        requestForm: { sourceFiles, refFiles },
        checkedForm: { isCheckProjectName, isCheckDeadline, isCheckBrief, isCheckComplianceTemplate },
        projectManager
      } = this.currentClientRequest

      const isSourceFiles = !sourceFiles.length ? true : sourceFiles.every(({ isCheck }) => isCheck)
      const isRefFiles = !refFiles.length ? true : refFiles.every(({ isCheck }) => isCheck)

      return isSourceFiles && isRefFiles && isCheckProjectName && isCheckDeadline && isCheckBrief && !!projectManager
    }
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
    IconButton,
    DatePicker
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/styles/settingsTable";
@import "../../../assets/scss/colors";

.border {
  border-right: 1px solid $border;
}

.optionsAndButton {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.options {
  display: flex;
  align-items: center;
  border: 1px solid $border;
  background-color: $table-list;
  border-radius: 2px;
  box-sizing: border-box;
  font-size: 14px;
  width: fit-content;
  overflow: hidden;
  margin: 20px 0;

  &__item {
    padding: 8px 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #3333;
  }

  &_brown {
    background-color: white;
    color: $text;
  }
}

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
    border-radius: 2px;
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
  }
}

.project {
  &__block {
    box-sizing: border-box;
    border: 1px solid $light-border;
    position: relative;
    border-radius: 2px;
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
  border-radius: 2px;
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
    border-radius: 2px;
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
  border-radius: 2px;
  background: white;
  height: fit-content;

  &__block {
    box-sizing: border-box;
    border: 1px solid $light-border;
    position: relative;
    border-radius: 2px;
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
    border: 1px solid $light-border;
    border-radius: 2px;
  }

  &__table-box {
    border: 1px solid $light-border;
    border-radius: 2px;
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
    border: 1px solid $light-border;
    border-radius: 2px;
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
    padding-top: 20px;
    display: flex;
    gap: 20px;
    justify-content: center;
  }

  &__details {
    font-size: 12px;
    font-family: 'Myriad400';
    opacity: 0.6;
    padding-left: 5px;
  }

  &__subTitle {
    width: 150px;
  }

  &__title {
    font-size: 18px;
    font-family: Myriad600;
  }

  &__value {
    font-family: 'Myriad400';
    min-width: 220px;
  }

  &__row {
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 40px;
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
  border-radius: 2px;
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
  border-radius: 2px;
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
  font-size: 18px;
}

#checkBrief {
  position: absolute;
  right: -23px;
  top: 0px;
}

#swapBrief {
  position: absolute;
  right: -23px;
  top: 25px;
  font-size: 16px;
  color: $dark-border;
  cursor: pointer;
  transition: .2s ease-out;

  &:hover {
    color: $text;
  }
}

.iconId {
  font-size: 15px;
  border-radius: 2px;
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
