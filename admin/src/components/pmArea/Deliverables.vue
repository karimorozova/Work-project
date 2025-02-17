<template lang="pug">
  .body
    .content
      .content__DR2(v-if="isDR2Modal")
        DeliveryTwo(:user="user" :users="users" :project="currentProject" :id="currentReviewId" :type="currentReviewType" @close="closeDR2")

    .deliverables
      .deliverables__approveModal(v-if="isDeleteModal")
        ApproveModal(
          text="Are you sure?"
          approveValue="Yes"
          notApproveValue="Cancel"
          @approve="deleteDR2"
          @notApprove="closeDeleteModal"
          @close="closeDeleteModal"
        )

      .deliverables__modal(v-if="isContactsPickerForMany || isContactsPickerForOne")
        .deliverables__titleModal Delivery for Contacts
        span.deliverables__close-modal(@click="closeContactsModal()") &#215;
        .deliverables__body
          .deliverables__itemsContacts
            .deliverables__items2
              .deliverables__selectTitle Choose client contacts:
              .deliverables__select
                SelectMulti(
                  placeholder="Select"
                  :options="contactsNames"
                  :selectedOptions="selectedContacts"
                  @chooseOptions="setContacts"
                )
          .deliverables__email-comment
            .deliverables__email-checkbox
              CheckBox(:isChecked="isComment" @check="toggleCommentEmail"  @uncheck="toggleCommentEmail")
              span Do you want to external comment? &nbsp;&nbsp;
            .deliverables__notes(v-if="isComment")
              ckeditor(v-model="comment" :config="editorConfig")

          .tasks-files__button(v-if="isContactsPickerForMany")
            Button(:value="'Deliver'" @clicked="deliverForMany")
          .tasks-files__button(v-if="isContactsPickerForOne")
            Button(:value="'Deliver'" @clicked="deliverForOne")
          .tasks-files__tooltip One project client contact is selected by default


      .modal__tasks(v-if="assignTaskModal")
        .modal__tasks-body
          .modal__title Select a tasks:
          span.modal__close-modal(@click="closeTasksModal()") &#215;
          .deliverables__select
            SelectMulti(
              :allOptionsButtons="true"
              placeholder="Select"
              :options="selectTaskInfo"
              :selectedOptions="selectedTasks"
              @chooseOptions="selectedTasksMethod"
            )
        .modal__button
          Button(value="Upload files" :isDisabled="!selectedTasks.length" @clicked="openDeliverablesModal")

      .modal__vault(v-if="deliverablesModal")
        span.modal__close-modal(@click="closeDeliverablesModal()") &#215;
        .sections
          .sections__files(v-if="refFiles.length || filesFromVault.filter(item => item.isCheck).length")
            .sections__title Deliverable files
            .file-list__items
              .file-list__item(v-for="(file, index) in refFiles")
                .file-list__name {{file.name}}
                span.file-list__delete(@click="deleteFile(index)") &#x2715

              .file-list__item(v-for="file in filesFromVault.filter(item => item.isCheck)")
                .file-list__name {{file.fileName}}
                span.file-list__delete(@click="deleteVaultFile(file.fileName)") &#x2715

          .sections__upload
            .sections__upload-buttons
              .uploadButtons__uploadItem
                .uploadButtons__title Upload files:
                .uploadButtons__upload-file
                  FilesUpload(
                    :isMulti="true"
                    buttonValue="Upload deliverables"
                    inputClass="files-upload__multiLang"
                    :files="refFiles"
                    @uploadFiles="uploadRefFiles"
                  )
              .uploadButtons__uploadItem
                .uploadButtons__title Tasks vault:
                .uploadButtons__vaultToggler(@click="toggleVault")
                  i.fas.fa-cloud-download-alt(v-if="!isVaultShow")
                  i.fas.fa-times-circle(v-if="isVaultShow")

            .sections__upload-table(v-if="isVaultShow")
              GeneralTable(
                :fields="fields2"
                :tableData="filesFromVault"
              )
                .table__header(slot="headerCheck" slot-scope="{ field }")
                  CheckBox(:isChecked="isAllCheckedVault" :isWhite="true" @check="(e)=>toggleAllCheckVault(e, true)" @uncheck="(e)=>toggleAllCheckVault(e, false)" customClass="tasks-n-steps")
                .table__header(slot="headerFileName" slot-scope="{ field }") {{ field.label }}

                .table__data(slot="check" slot-scope="{ row, index }")
                  CheckBox(:isChecked="row.isCheck" @check="(e)=>toggleCheckVault(e, index, true)" @uncheck="(e)=>toggleCheckVault(e, index, false)" customClass="tasks-n-steps")

                template(slot="fileName" slot-scope="{ row, index }")
                  .table__data {{ row.fileName }}


        .modal__attention(v-if="refFiles.length || filesFromVault.filter(item => item.isCheck).length") Creating deliverable will be for the selected tasks: {{ selectedTasks.map((i) => i.substring(i.length - 3)).join(', ') }}
        .modal__button
          Button(
            value="Complete"
            :isDisabled="!refFiles.length && !filesFromVault.filter(item => item.isCheck).length"
            @clicked="uploadFiles"
          )

      .deliverables__header
        .deliverables__title Deliverables
        .deliverablesActions
          .deliverablesActions__drop-menu
            SelectSingle(
              :selectedOption="selectedAction"
              :options="availableActionsOptions"
              placeholder="Deliverables Action"
              @chooseOption="setAction"
            )

      .table
        GeneralTable(
          :fields="fields"
          :tableData="deliverables"
        )
          .table__header(slot="headerCheck" slot-scope="{ field }") {{ field.label }}
            CheckBox(:isChecked="!!isAllChecked" :isWhite="true" @check="()=>toggleAll(true)" @uncheck="()=>toggleAll(false)" customClass="tasks-n-steps")
          .table__header(slot="headerID" slot-scope="{ field }") {{ field.label }}
          .table__header(slot="headerName" slot-scope="{ field }") {{ field.label }}
          .table__header(slot="headerPair" slot-scope="{ field }") {{ field.label }}
          .table__header(slot="headerFile" slot-scope="{ field }") {{ field.label }}
          .table__header(slot="headerTask" slot-scope="{ field }") {{ field.label }}
          .table__header(slot="headerStatus" slot-scope="{ field }") {{ field.label }}
          .table__header(slot="headerAction" slot-scope="{ field }") {{ field.label }}

          .table__checkbox(slot="check" slot-scope="{ index, row }")
            CheckBox(:isChecked="!!row.isChecked" @check="()=> toggle(row, true)" @uncheck="()=>toggle(row, false)" customClass="tasks-n-steps")
          .table__data(slot="ID" slot-scope="{ row }") {{ row.deliveryInternalId }}
          .table__data(slot="name" slot-scope="{ row }") {{ row.deliveryName }}
          .table__data-langs(slot="pair" slot-scope="{ row }" v-html="row.pair")
          .table__data(slot="file" slot-scope="{ row }") {{ row.files.length }}
          .table__data(slot="task" slot-scope="{ row }") {{ getTasksId(row) }}
          .table__dataStatus(slot="status" slot-scope="{ row }")
            .tooltip(v-if="row.status === 'Delivered'")
              span#myTooltip2.tooltiptext-left(v-html="getDeliveryTimeAndPerson(row)")
              i.far.fa-clock

            span {{ row.status }}

          .table__data(slot="action" slot-scope="{ row, index }")

            .table__icons(v-if="row.status === 'Ready for Delivery' && canUpdateDr2")
              .table__icon(@click="openContactsModalOne(row)")
                i.fas.fa-truck-loading

            .table__icons(v-if="row.status !== 'Ready for Delivery'")
              img.table__icon(
                v-for="(icon, key) in getIcons(row)"
                :src="icon.src"
                :style="{...icon.style}"
                @click="dr2Action(row, key)"
              )

      Add(v-if="canUploadDR1 && currentProject.status !== 'Closed'" @add="showTasksModal")
</template>

<script>
import DataTable from "../DataTable"
import CKEditor from "ckeditor4-vue"
import Add from "../Add"
import Button from "../Button"
import FilesUpload from "./tasks-n-steps/tasksFiles/FilesUpload"
import { mapGetters, mapActions } from "vuex"
import SelectMulti from "../SelectMulti"
import DeliveryTwo from "./tasks-n-steps/DeliveryTwo"
import ApproveModal from "../ApproveModal"
import CheckBox from "@/components/CheckBox"
import SelectSingle from "../SelectSingle"
import editorConfig from "../../mixins/editorConfig"
import moment from "moment"
import GeneralTable from "../GeneralTable"

export default {
  mixins: [ editorConfig ],
  data() {
    return {
      fields: [
        { label: "", headerKey: "headerCheck", key: "check", style: { "width": "3%" } },
        { label: "Id", headerKey: "headerID", key: "ID", style: { "width": "17%" } },
        { label: "Name", headerKey: "headerName", key: "name", style: { "width": "17%" } },
        { label: "Status", headerKey: "headerStatus", key: "status", style: { "width": "17%" } },
        { label: "Tasks Id", headerKey: "headerTask", key: "task", style: { "width": "15%" } },
        { label: "Languages", headerKey: "headerPair", key: "pair", style: { "width": "17%" } },
        { label: "Files", headerKey: "headerFile", key: "file", style: { "width": "6%" } },
        { label: "Delivery", headerKey: "headerAction", key: "action", style: { "width": "8%" } }
      ],
      fields2: [
        { label: "", headerKey: "headerCheck", key: "check", style: { "width": "11%" } },
        { label: "File Name", headerKey: "headerFileName", key: "fileName", style: { "width": "89%" } }
      ],
      assignTaskModal: false,
      deliverablesModal: false,

      isVaultShow: false,

      refFiles: [],
      filesFromVault: [],

      selectedTasks: [],
      isTableDropMenu: true,
      isDR2Modal: false,
      isDeleteModal: false,
      currentReviewId: null,
      currentReviewType: null,
      selectedAction: '',
      isContactsPickerForMany: false,
      isContactsPickerForOne: false,
      selectedContacts: [],
      selectedRow: null,
      isComment: false,
      comment: ''
    }
  },
  mounted() {
    this.setDefaultContact()
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
      storeProject: "setCurrentProject",
      approveDeliver: "approveDeliver",
      approveDeliverMany: "approveDeliverMany"
    }),
    projectLanguages(tasks) {
      if (!tasks.length) return '-'
      const taskLanguages = tasks.map(({ sourceLanguage, targetLanguage }) => ({ sourceLanguage, targetLanguage }))
      let groupedLanguages = Object.entries(_.groupBy(taskLanguages, 'sourceLanguage'))
      groupedLanguages = groupedLanguages.map(item => {
        return { sourceLanguage: item[0], targetLanguages: [ ...new Set(item[1].map(({ targetLanguage }) => targetLanguage)) ].join(';&ensp;') }
      })
      groupedLanguages = groupedLanguages.reduce((acc, curr) => {
        acc = acc + `${ curr.sourceLanguage } <span style="font-size: 12px;color: #9c9c9c;margin: 0 2px;"><i class="fas fa-angle-double-right"></i></span> ${ curr.targetLanguages } <br>`
        return acc
      }, '')
      return groupedLanguages
    },
    toggleCheckVault(e, index, bool) {
      const file = this.filesFromVault[index]
      file.isCheck = bool
      this.filesFromVault.splice(index, 1, file)
    },
    toggleAllCheckVault(e, bool) {
      this.filesFromVault.forEach((elem, index) => {
        elem.isCheck = bool
        this.filesFromVault.splice(index, 1, elem)
      })
    },
    toggleVault() {
      this.isVaultShow = !this.isVaultShow
    },
    getDeliveryTimeAndPerson(row) {
      const { deliveredAt, deliveredBy } = this.currentProject.tasksDeliverables.find(({ deliverablesId }) => deliverablesId === row._id)
      const time = moment(deliveredAt).format('DD-MM-YYYY, HH:mm')
      const { firstName, lastName } = this.users.find(({ _id }) => _id.toString() === deliveredBy.toString())

      return `At: ${ time } <br> By: ${ firstName } ${ lastName }`

    },
    toggleCommentEmail() {
      this.isComment = !this.isComment
    },
    closeContactsModal() {
      this.isContactsPickerForMany = this.isContactsPickerForOne = false
    },
    openContactsModalOne(row) {
      this.selectedRow = row
      this.isContactsPickerForOne = true
    },
    openContactsModalMany() {
      this.isContactsPickerForMany = true
    },
    async deliverForMany() {
      const entitiesForDeliver = this.deliverables.filter(item => !!item.isChecked).map(item => ({ entityId: item._id, type: item.type }))

      if (this.selectedAction === 'Deliver') {
        await this.approveDeliverMany({
          projectId: this.currentProject._id,
          entitiesForDeliver,
          user: this.user,
          contacts: this.listOfContactsForDeliver(),
          comment: this.comment
        })
      }
      if (this.selectedAction === 'ReSend') {
        this.reSendDeliverables()
      }

      this.closeContactsModal()
      this.setDefaultContact()
      this.selectedAction = ''
      this.toggleAll(false)
      this.isComment = false
      this.comment = ''
    },
    async deliverForOne() {
      await this.approveDeliver({
        projectId: this.currentProject._id,
        entityId: this.selectedRow._id,
        type: this.selectedRow.type,
        user: this.user,
        contacts: this.listOfContactsForDeliver(),
        comment: this.comment
      })
      this.closeContactsModal()
      this.setDefaultContact()
      this.selectedRow = null
      this.isComment = false
      this.comment = ''
    },
    listOfContactsForDeliver() {
      return this.selectedContacts
          .map(item => this.currentProject.clientContacts.find(({ firstName, surname }) => `${ firstName } ${ surname }` === item))
          .map(item => ({ email: item.email, firstName: `${ item.firstName } ${ item.surname }` }))
    },
    setContacts({ option }) {
      const position = this.selectedContacts.indexOf(option)
      if (position === -1) {
        this.selectedContacts.push(option)
      } else {
        if (this.selectedContacts.length > 1) {
          this.selectedContacts.splice(position, 1)
        }
      }
    },
    setDefaultContact() {
      this.selectedContacts = []
      const { firstName, surname } = this.currentProject.clientContacts[0]
      this.selectedContacts.push(`${ firstName } ${ surname }`)
    },
    setAction({ option }) {
      this.selectedAction = option
      if (option === 'Deliver') {
        this.openContactsModalMany()
      } else if (option === 'ReOpen') {
        this.reOpenDeliverables()
      } else if (option === 'ReSend') {
        this.openContactsModalMany()
      }
    },
    async reSendDeliverables() {
      try {
        await this.$http.post('/delivery/re-send', {
          projectId: this.currentProject._id,
          multi: this.currentProject.tasksDR2.multiLang.filter(i => i.isChecked),
          single: this.currentProject.tasksDR2.singleLang.filter(i => i.isChecked),
          contacts: this.listOfContactsForDeliver(),
          comment: this.comment,
          user: this.user
        })
        this.alertToggle({ message: 'Successfully resent!', isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: 'Error in reSend deliverables!', isShow: true, type: "error" })
      } finally {
        this.selectedAction = ''
      }
    },
    async reOpenDeliverables() {
      try {
        const result = await this.$http.post('/delivery/re-open', {
          projectId: this.currentProject._id,
          multi: this.currentProject.tasksDR2.multiLang.filter(i => i.isChecked),
          single: this.currentProject.tasksDR2.singleLang.filter(i => i.isChecked)
        })
        this.storeProject(result.data)
      } catch (err) {
        this.alertToggle({ message: 'Error in reOpen deliverables!', isShow: true, type: "error" })
      } finally {
        this.selectedAction = ''
      }
    },
    closeDeleteModal() {
      this.refFiles = []
      this.selectedTasks = []
      this.isDeleteModal = false
      this.currentReviewId = null
      this.currentReviewType = null
    },
    async deleteDR2() {
      try {
        const result = await this.$http.post('/delivery/multi-file-dr2-remove', { projectId: this.currentProject._id, type: this.currentReviewType, dr2Id: this.currentReviewId })
        this.storeProject(result.data)
        this.closeDeleteModal()
        this.alertToggle({ message: "Review deleted", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" })
      } finally {
        // this.closeDeliverablesModal()
      }
    },
    getIcons({ type, files, status }) {
      const { accountManager: { _id: AMId }, projectManager: { _id: PMId } } = this.currentProject
      const icons = {}
      if (status === 'Delivered') {
        icons.download = { src: require("../../assets/images/latest-version/download-file.png") }
        return icons
      }
      if (type === 'multi' && this.canUpdateDr2) {
        icons.dr2 = { src: require("../../assets/images/latest-version/delivery-list.svg"), style: { 'width': '18px' } }
        icons.delete = { src: require("../../assets/images/latest-version/i-delete.png") }
      } else if (type === 'single' && !files.length && (this.isAdmin || `${ AMId }` === `${ this.user._id }` || `${ PMId }` === `${ this.user._id }`)
      ) {
        icons.dr2 = { src: require("../../assets/images/latest-version/delivery-list.svg"), style: { 'width': '18px' } }
        icons.delete = { src: require("../../assets/images/latest-version/i-delete.png") }
      } else {
        icons.dr2 = { src: require("../../assets/images/latest-version/delivery-list.svg"), style: { 'width': '18px' } }
      }
      return icons
    },
    dr2Action({ _id, type }, key) {
      this.currentReviewId = _id
      this.currentReviewType = type

      switch (key) {
        case "delete":
          this.isDeleteModal = true
          break
        case "dr2":
          this.isDR2Modal = true
          break
        case "download":
          this.createLinkAndDownload(_id)
          break
      }
    },
    closeDR2() {
      this.currentReviewId = this.currentReviewType = null
      this.isDR2Modal = false
    },
    getLangPair(row, type) {
      const source = this.allLang.find(({ _id }) => row.sourceLanguage.toString() === _id.toString())
      const target = this.allLang.find(({ _id }) => row.targetLanguage.toString() === _id.toString())
      return '<div>' + source[type] + ' <span style="font-size: 12px;color: #9c9c9c;margin: 0 2px;"><i class="fas fa-angle-double-right"></i></span> ' + target[type] + '</div>'
    },
    getLangPairByTasks(tasks) {
      const filteredTasks = this.currentProject.tasks.filter(item => tasks.includes(item.taskId))

      return [ ...new Set(filteredTasks.reduce((acc, curr) => {
        acc.push('<div>' + curr.sourceLanguage + ' <span style="font-size: 12px;color: #9c9c9c;margin: 0 2px;"><i class="fas fa-angle-double-right"></i></span> ' + curr.targetLanguage + '</div>')
        return acc
      }, [])) ].join('')
    },
    getTasksId(row) {
      const mySet = new Set(row.tasks.map((field) => field.substring(field.length - 3)))
      return [ ...mySet ].join(', ')
    },
    showTasksModal() {
      this.assignTaskModal = true
    },
    closeTasksModal() {
      this.assignTaskModal = false
      this.selectedTasks = []
    },
    openDeliverablesModal() {
      this.filesFromVault = this.currentProject.tasksDR1
          .filter(({ taskId }) => this.selectedTasks.includes(taskId))
          .map(({ files }) => files)
          .flat()
          .map(item => ({ ...item, isCheck: false }))

      this.assignTaskModal = false
      this.deliverablesModal = true
    },
    closeDeliverablesModal() {
      this.deliverablesModal = false
      this.isVaultShow = false
      this.selectedTasks = []
      this.filesFromVault = []
      this.refFiles = []
    },
    async uploadFiles() {
      let filesData = new FormData()
      filesData.append('projectId', this.currentProject._id)
      filesData.append('taskIds', JSON.stringify(this.selectedTasks))
      filesData.append('filesFromVault', JSON.stringify(this.filesFromVault.filter(i => i.isCheck)))

      try {
        if (this.refFiles.length) {
          for (let file of this.refFiles) {
            filesData.append('refFiles', file)
          }
        }
        const result = await this.$http.post('/delivery/multi-file-dr2-push', filesData)
        this.storeProject(result.data)

        this.alertToggle({ message: "Files saved", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" })
      } finally {
        this.closeDeliverablesModal()
      }
    },
    uploadRefFiles({ files }) {
      const filteredFiles = Array.from(files).filter(item => item.size / 1000000 <= 50)
      if (filteredFiles.length) {
        for (let file of files) {
          const isExist = this.refFiles.find(item => item.name === file.name)
          if (!isExist) this.refFiles.push(file)
        }
      }
      if (!filteredFiles.length) this.clearInputFiles(".files-upload__multiLang")
    },
    deleteFile(index) {
      this.refFiles.splice(index, 1)
    },
    deleteVaultFile(fileName) {
      const _idx = this.filesFromVault.findIndex(item => item.fileName === fileName)
      if (_idx !== -1) this.filesFromVault[_idx].isCheck = false
    },
    selectedTasksMethod({ option }) {
      const position = this.selectedTasks.indexOf(option)
      if (position !== -1) this.selectedTasks.splice(position, 1)
      else this.selectedTasks.push(option)
    },
    createLinkAndDownload(id) {
      const deliverables = this.currentProject.tasksDeliverables.find(({ deliverablesId }) => deliverablesId === id)
      let link = document.createElement('a')
      link.href = this.$domains.admin + deliverables.path
      link.target = "_blank"
      link.click()
    },
    toggleAll(bool) {
      if (this.currentProject.tasksDR2.hasOwnProperty('singleLang')) {
        for (let [ index ] of this.currentProject.tasksDR2.singleLang.entries()) {
          this.currentProject.tasksDR2.singleLang.splice(index, 1, { ...this.currentProject.tasksDR2.singleLang[index], isChecked: bool })
        }
      }
      if (this.currentProject.tasksDR2.hasOwnProperty('multiLang')) {
        for (let [ index ] of this.currentProject.tasksDR2.multiLang.entries()) {
          this.currentProject.tasksDR2.multiLang.splice(index, 1, { ...this.currentProject.tasksDR2.multiLang[index], isChecked: bool })
        }
      }
    },
    toggle(row, bool) {
      const { type, _id: id } = row

      if (type === 'single') {
        const { tasksDR2: { singleLang } } = this.currentProject
        this.currentProject.tasksDR2.singleLang
            .splice(idx(singleLang), 1, {
              ...this.currentProject.tasksDR2.singleLang[idx(singleLang)],
              isChecked: bool
            })
      } else {
        const { tasksDR2: { multiLang } } = this.currentProject
        this.currentProject.tasksDR2.multiLang
            .splice(idx(multiLang), 1, {
              ...this.currentProject.tasksDR2.multiLang[idx(multiLang)],
              isChecked: bool
            })
      }

      function idx(arr) {
        return arr.findIndex(({ _id }) => `${ _id }` === `${ id }`)
      }
    }
  },
  computed: {
    ...mapGetters({
      currentProject: 'getCurrentProject',
      allLang: 'getAllLanguages',
      users: 'getUsers',
      user: 'getUser'
    }),

    isAllCheckedVault() {
      return this.filesFromVault.length && this.filesFromVault.every(item => item.isCheck)
    },
    availableActionsOptions() {
      const getArrayOfChecked = this.deliverables.filter(item => !!item.isChecked)

      if (getArrayOfChecked.length) {
        if (getArrayOfChecked.every(({ status }) => status === 'Ready for Delivery')) {
          return [ 'Deliver', 'ReOpen' ]
        }
        if (getArrayOfChecked.every(({ status }) => status === 'Delivered')) {
          return [ 'ReOpen', 'ReSend' ]
        }
      }
    },
    canUpdateDr2() {
      return this.user.group.name === "Administrators" || this.user.group.name === "Developers" || this.currentProject.accountManager._id.toString() === this.user._id.toString()
    },
    canUploadDR1() {
      return this.user.group.name === "Administrators" ||
          this.user.group.name === "Developers" ||
          this.currentProject.projectManager._id.toString() === this.user._id.toString() ||
          this.currentProject.accountManager._id.toString() === this.user._id.toString() ||
          this.currentProject.tasksDR1.map(({ dr2Manager }) => dr2Manager.toString()).includes(this.user._id.toString()) ||
          this.currentProject.tasksDR1.map(({ dr1Manager }) => dr1Manager.toString()).includes(this.user._id.toString())
    },
    deliverables() {
      if (Object.keys(this.currentProject).length && !this.currentProject.hasOwnProperty('tasksDR2')) return []

      const singleLang = this.currentProject.tasksDR2.hasOwnProperty('singleLang') ?
          this.currentProject.tasksDR2.singleLang.map(item => {
            return {
              _id: item._id,
              deliveryName: item.deliveryName || this.currentProject.projectName,
              deliveryInternalId: item.deliveryInternalId,
              type: 'single',
              status: item.status,
              tasks: item.files.map(item => item.taskId),
              pair: this.getLangPair(item, 'symbol'),
              files: item.files,
              isChecked: item.isChecked
            }
          }) : []

      const multiLang = this.currentProject.tasksDR2.hasOwnProperty('multiLang') ?
          this.currentProject.tasksDR2.multiLang.map(item => {
            return {
              _id: item._id,
              deliveryName: item.deliveryName || this.currentProject.projectName,
              deliveryInternalId: item.deliveryInternalId,
              type: 'multi',
              status: item.status,
              tasks: item.tasks,
              pair: this.getLangPairByTasks(item.tasks),
              files: Array.isArray(item.file) ? item.file : [ item.file ],
              isChecked: item.isChecked
            }
          }) : []
      return [ ...singleLang, ...multiLang ]
    },

    selectTaskInfo() {
      if (!this.currentProject || !this.currentProject.tasks) return []
      const multilingualIds = this.currentProject.hasOwnProperty('tasksDR2') ? this.currentProject.tasksDR2.multiLang.map(({ tasks }) => tasks).flat() : []
      let result = new Set()
      this.currentProject.tasksDR1
          .filter(({ files, taskId }) => files.every(({ isFileApproved, isFilePushedDR2 }) => isFileApproved && !isFilePushedDR2) && !multilingualIds.includes(taskId))
          .forEach(({ taskId }) => result.add(taskId))

      return Array.from(result)
    },
    isAllChecked() {
      const single = this.currentProject.tasksDR2.hasOwnProperty('singleLang') ?
          this.currentProject.tasksDR2.singleLang.every(item => item.isChecked) :
          true
      const multi = this.currentProject.tasksDR2.hasOwnProperty('multiLang') ?
          this.currentProject.tasksDR2.multiLang.every(item => item.isChecked) :
          true

      return !this.deliverables.length ? false : multi && single
    },
    contactsNames() {
      return this.currentProject.clientContacts.map(item => `${ item.firstName } ${ item.surname }`)
    },
    isAdmin() {
      const { _id, group: { name } } = this.user
      return name === 'Administrators' || name === 'Developers'
    },
    isProjectFinished() {
      const { status } = this.currentProject
      return status === 'Closed' || status === 'Cancelled Halfway' || status === 'Cancelled'
    }

  },
  components: {
    GeneralTable,
    ApproveModal,
    DeliveryTwo,
    SelectMulti,
    DataTable,
    Add,
    Button,
    FilesUpload,
    CheckBox,
    SelectSingle,
    ckeditor: CKEditor.component
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";


.sections {
  display: flex;

  &__title {
    font-size: 16px;
    font-family: 'Myriad600';
    margin-bottom: 10px;
    width: 271px;
  }

  &__files {
    padding-right: 19px;
    margin-right: 20px;
    border-right: 1px solid $border;
  }

  &__upload {
    &-buttons {
      display: flex;
      width: 330px;
      justify-content: space-between;
    }

    &-table {
      margin-top: 12px;
    }
  }
}

.uploadButtons {
  &__title {
    width: 90px;
  }

  &__uploadItem {
    display: flex;
    align-items: center;
  }

  &__vaultToggler {
    position: relative;
    width: 55px;
    height: 32px;
    color: #fff;
    font-size: 15px;
    border-radius: 2px;
    background-color: $red;
    justify-content: center;
    display: flex;
    align-items: center;

    &:hover {
      cursor: pointer;
      box-shadow: $box-shadow;
    }

    &:active {
      transform: scale(.98);
    }
  }
}

.modal {

  &__attention {
    text-align: center;
    opacity: 0.5;
    margin-top: 20px;
    margin-bottom: -10px;
  }

  &__button {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }

  &__title2 {
    font-family: "Myriad600";
    margin-bottom: 15px;
  }


  &__tasks,
  &__vault {
    padding: 25px;
    background: white;
    position: absolute;
    box-shadow: $box-shadow;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 500;
  }

  &__tasks {
    &-body {
      display: flex;
      align-items: center;
      gap: 15px;
    }
  }

  &__vault {
    padding: 20px 35px 20px 20px;
  }

  &__close-modal {
    position: absolute;
    top: 5px;
    right: 5px;
    font-size: 22px;
    cursor: pointer;
    height: 22px;
    width: 22px;
    justify-content: center;
    display: flex;
    align-items: center;
    opacity: 0.8;
    transition: ease 0.2s;

    &:hover {
      opacity: 1
    }
  }

}

.table {
  &__header {
    padding: 0 0 0 7px;
  }

  &__data-langs {
    padding: 0 7px;
    width: 100%;
    display: grid;
    align-items: center;
    height: 40px;
    overflow: auto;
  }

  &__dataStatus {
    padding: 0 7px;
    width: 100%;
    display: flex;
    align-items: center;
  }

  &__data {
    padding: 0 7px;
    width: 100%;
    display: grid;
    align-items: center;
    height: 40px;
    overflow: auto;
  }


  &__checkbox {
    padding: 0 7px;
    width: 100%;
    display: flex;
    align-items: center;
  }

  &__icons {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    justify-content: space-around;
    align-items: center;
  }

  &__iconSvg {
    img {
      height: 18px;
    }
  }

  &__icon {
    cursor: pointer;
  }
}

.deliverablesActions {
  position: relative;
  width: 220px;

  &__drop-menu {
    height: 32px;
  }

  &__title {
    margin-bottom: 4px;
  }

}

.content {
  &__DR2 {
    position: absolute;
    top: 351px;
    left: 0px;
    bottom: 0;
    z-index: 50;
    box-sizing: border-box;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    height: fit-content;
    padding-bottom: 150px;
    border-radius: 2px;
  }
}

.deliverables {
  box-sizing: border-box;
  padding: 25px;
  min-width: 1040px;
  width: 1040px;
  margin-top: 25px;
  box-shadow: $box-shadow;
  position: relative;
  background: white;
  border-radius: 2px;
  margin-bottom: 70px;

  &__header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  &__items {
    display: flex;
  }

  &__itemsContacts {
    display: flex;
    justify-content: center;
  }

  &__selectTitle {
    margin-bottom: 4px;
  }

  &__approveModal {
    position: absolute;
    z-index: 5555;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  &__uploadItem {
    //display: flex;
    //align-items: center;
    //justify-content: center;
  }

  &__item {
    margin-right: 40px;
  }

  &__titleModal {
    font-size: 16px;
    margin-bottom: 20px;
    text-align: center;
    font-family: Myriad600;
  }

  &__title {
    font-size: 16px;
    display: flex;
    justify-content: space-between;
    font-family: Myriad600;
  }

  &__select {
    position: relative;
    height: 32px;
    width: 220px;
  }

  &-table {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;


    &__approveModal {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -49%);
    }

    &__actions {
      display: flex;
      justify-content: space-between;
    }

    &__action {
      position: relative;
      width: 220px;
      height: 30px;
      align-self: flex-end;
      margin-bottom: 20px;
    }

    &__data {
      height: 30px;
      box-sizing: border-box;
      padding-left: 5px;
      display: flex;
      align-items: center;
    }

    &__check-cell {
      display: flex;
      justify-content: center;
      padding-left: 0;
    }


    &__file-icon {
      margin-right: 7px;
      color: #938676;
    }

    &__upload {
      position: relative;
      background: url("../../assets/images/Other/upload-icon.png");
      background-repeat: no-repeat;
      background-position-y: center;
      width: 20px;
      height: 21px;
      overflow: hidden;

      input[type=file],
      input[type=file]::-webkit-file-upload-button {
        cursor: pointer;
      }
    }

    &_no-back {
      background: none;
      width: 30px;
      height: 30px;
    }

    &__file-input {
      padding-left: 0;
      padding-right: 0;
      width: 40px;
      height: 30px;
      border: none;
      outline: none;
      opacity: 0;
      z-index: 2;
      position: absolute;
      left: -5px;
      cursor: pointer;
      font-size: 0;
    }

    &_green {
      color: $green;
      transform: rotateY(360deg);
    }

    &_opacity-04 {
      opacity: 0.4;
      cursor: default;

      input[type=file],
      input[type=file]::-webkit-file-upload-button {
        cursor: default;
      }
    }
  }

  &__modal {
    padding: 25px;
    background: white;
    position: absolute;
    box-shadow: $box-shadow;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 500;
  }

  &__close-modal {
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

  &__email-comment {
    position: relative;
    margin: 20px 0;
  }

  &__email-checkbox {
    display: flex;
    font-size: 14px;
    justify-content: center;
    margin-bottom: 10px;
    align-items: center;

    & span {
      padding-left: 6px;

    }

  }
}

.tooltip {
  position: relative;
  display: flex;
  font-size: 16px;
  margin-right: 5px;
  cursor: help;

  .tooltiptext-left {
    font-size: 14px;
    visibility: hidden;
    width: 220px;
    background-color: white;
    color: $text;
    text-align: center;
    border-radius: 2px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    left: 23px;
    opacity: 0;
    top: -5px;
    border: 1px solid $text;
    transition: opacity .3s;

    &::after {
      content: "";
      position: absolute;
      top: 6px;
      left: 0;
      margin-left: -12px;
      transform: rotate(90deg);
      border-width: 6px;
      border-style: solid;
      border-color: $text transparent transparent;
    }
  }

  &:hover {
    .tooltiptext-left {
      visibility: visible;
      opacity: 1;
    }
  }
}


.tasks-files {
  &__item {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }

  &__upload-file {
    display: flex;
    //margin-left: 15px;
  }

  &__button {
    margin-top: 20px;
    text-align: center;
    margin-bottom: 20px;
  }

  &__tooltip {
    text-align: center;
    opacity: 0.6;
  }

  &__tooltipManage {
    text-align: center;
    opacity: 0.6;
    margin-top: 20px;
  }

}

.file-list {
  &__items {

  }

  &__name {
    width: 240px;
  }

  &__item {
    border-radius: 2px;
    border: 1px solid $border;
    box-sizing: border-box;
    background-color: #fff;
    padding: 7px;
    margin: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    font-family: 'Myriad300';
    font-size: 14px;
    word-break: break-all;
    width: 281px;
    margin-bottom: 5px;
  }

  &__delete {
    cursor: pointer;
    transform: .2s ease;
    font-size: 14px;
    height: 16px;
    width: 16px;
    cursor: pointer;

    &:hover {
      font-weight: bold;
    }
  }
}

.title {
  &__action {
    align-self: flex-end;
  }

  &__drop-menu {
    position: relative;
    width: 220px;
    height: 32px;
  }

  &__title {
    margin-bottom: 5px;
    font-size: 16px;
  }
}

.no-box-shadow {
  box-shadow: none;
}

</style>
