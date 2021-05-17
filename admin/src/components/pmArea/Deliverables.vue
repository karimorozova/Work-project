<template lang="pug">
  .body
    .content
      .content__DR2(v-if="isDR2Modal")
        DeliveryTwo(:user="user" :users="users" :project="currentProject" :id="currentReviewId" :type="currentReviewType" @close="closeDR2")

    .deliverables(:class="{'no-box-shadow': !isShowTasksAndDeliverables}")
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

      .deliverables__modal(v-if="deliverablesModal")
        .deliverables__titleModal Upload Deliverables
        span.deliverables__close-modal(@click="closeDeliverablesModal") &#215;
        .deliverables__body
          .deliverables_items
            .deliverables__items
              .deliverables__item
                .deliverables__uploadItem
                  .deliverables__selectTitle Upload File:
                  .tasks-files__upload-file
                    FilesUpload(
                      :isMulti="false"
                      buttonValue="Upload deliverables"
                      inputClass="files-upload__multiLang"
                      :files="refFiles"
                      @uploadFiles="uploadRefFiles"
                      @deleteFile="deleteFile()"
                    )

              div(style="z-index: 50")
                .deliverables__selectTitle Assign to task:
                .deliverables__select
                  SelectMulti(
                    placeholder="Select"
                    :options="selectTaskInfo"
                    :selectedOptions="selectedTasks"
                    @chooseOptions="selectedTasksMethod"
                  )

          .tasks-files__fileItem
            .deliverable__wrapper
              .file-list__items(v-for="(file) in refFiles")
                .file-list__item
                  .file-list__name {{file.name}}
                  span.file-list__delete(@click="deleteFile()") &#x2715
          .tasks-files__button
            Button(:value="'Upload'" @clicked="uploadFiles" :isDisabled="!checkMultiReview")
          .tasks-files__tooltip File can be <= 50Mb (otherwise it will not be loaded)


      .deliverables__header
        .deliverables__title Deliverables
        .deliverablesActions
          .deliverablesActions__title Deliverables Action:
          .deliverablesActions__drop-menu
            SelectSingle(
              :selectedOption="selectedAction"
              :options="availableActionsOptions"
              placeholder="Select Action"
              @chooseOption="setAction"
            )

      .deliverables-table
      DataTable(
        :fields="fields"
        :tableData="deliverables"
        :bodyClass="['review-body', {'tbody_visible-overflow': deliverables.length < 6}]"
        :tableheadRowClass="deliverables.length < 6 ? 'tbody_visible-overflow' : ''"
        :headCellClass="'padding-with-check-box'"
      )
        .deliverables-table__header(slot="headerCheck" slot-scope="{ field }") {{ field.label }}
          CheckBox(:isChecked="!!isAllChecked" :isWhite="true" @check="()=>toggleAll(true)" @uncheck="()=>toggleAll(false)" customClass="tasks-n-steps")
        .deliverables-table__header(slot="headerID" slot-scope="{ field }") {{ field.label }}
        .deliverables-table__header(slot="headerPair" slot-scope="{ field }") {{ field.label }}
        .deliverables-table__header(slot="headerFile" slot-scope="{ field }") {{ field.label }}
        .deliverables-table__header(slot="headerTask" slot-scope="{ field }") {{ field.label }}
        .deliverables-table__header(slot="headerStatus" slot-scope="{ field }") {{ field.label }}
        .deliverables-table__header(slot="headerAction" slot-scope="{ field }") {{ field.label }}

        .deliverables-table__data(slot="check" slot-scope="{ index, row }")
          CheckBox(:isChecked="!!row.isChecked" @check="()=> toggle(row, true)" @uncheck="()=>toggle(row, false)" customClass="tasks-n-steps")
        .deliverables-table__data(slot="ID" slot-scope="{ row }") {{ row.deliveryInternalId }}
        .deliverables-table__data(slot="pair" slot-scope="{ row }") {{ row.pair }}
        .deliverables-table__data(slot="file" slot-scope="{ row }") {{ row.files.length }}
        .deliverables-table__data(slot="task" slot-scope="{ row }") {{ getTasksId(row) }}
        .deliverables-table__data(slot="status" slot-scope="{ row }")
          .deliverables-table__data-status
            .tooltip(v-if="row.status === 'Delivered'")
              span#myTooltip2.tooltiptext-left(v-html="getDeliveryTimeAndPerson(row)")
              i.far.fa-clock

            span {{ row.status }}

        .deliverables-table__data(slot="action" slot-scope="{ row, index }")

          .deliverables-table__icons(v-if="row.status === 'Ready for Delivery' && canUpdateDr2")
            .deliverables-table__icon(@click="openContactsModalOne(row)")
              i.fas.fa-truck-loading

          .deliverables-table__icons(v-if="row.status !== 'Ready for Delivery'")
            img.deliverables-table__icon(v-for="(icon, key) in getIcons(row)" :src="icon.src" @click="dr2Action(row, key)")

      Add(v-if="canUploadDR1 && currentProject.status !== 'Closed'" @add="showModal")
</template>

<script>
import DataTable from "../DataTable";
import CKEditor from "ckeditor4-vue";
import Add from "../Add";
import Button from "../Button";
import FilesUpload from "./tasks-n-steps/tasksFiles/FilesUpload"
import { mapGetters, mapActions } from "vuex"
import SelectMulti from "../SelectMulti";
import DeliveryTwo from "./tasks-n-steps/DeliveryTwo";
import ApproveModal from "../ApproveModal";
import CheckBox from "@/components/CheckBox";
import SelectSingle from "../SelectSingle";
import editorConfig from "../../mixins/editorConfig";
import moment from "moment";

export default {
  mixins: [ editorConfig ],
  data() {
    return {
      fields: [
        { label: "", headerKey: "headerCheck", key: "check", width: "3.2%", padding: 0 },
	      { label: "ID", headerKey: "headerID", key: "ID", width: "18%", padding: 0 },
	      { label: "Language pair", headerKey: "headerPair", key: "pair", width: "23.8%", padding: 0 },
        { label: "# Files", headerKey: "headerFile", key: "file", width: "10%", padding: 0 },
        { label: "Task ID", headerKey: "headerTask", key: "task", width: "16%", padding: 0 },
        { label: "Status", headerKey: "headerStatus", key: "status", width: "20%", padding: 0 },
        { label: "Delivery", headerKey: "headerAction", key: "action", width: "9%", padding: 0 },
      ],
      deliverablesModal: false,
      refFilesForDelete: [],
      refFiles: [],
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
      comment: '',
    }
  },
  mounted(){
    this.setDefaultContact()
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
      storeProject: "setCurrentProject",
      approveDeliver: "approveDeliver",
      approveDeliverMany: "approveDeliverMany",
	    setShowTasksAndDeliverables: "setShowTasksAndDeliverables"
    }),
    getDeliveryTimeAndPerson(row) {
      const {deliveredAt, deliveredBy} = this.currentProject.tasksDeliverables.find(({deliverablesId}) => deliverablesId === row._id)
      const time = moment(deliveredAt).format('DD-MM-YYYY, HH:mm')
      const { firstName, lastName } = this.users.find(({_id}) => _id.toString() === deliveredBy.toString())

      return `At: ${time} <br> By: ${firstName} ${lastName}`

    },
    toggleCommentEmail() {
      this.isComment = !this.isComment
    },
    closeContactsModal(){
      this.isContactsPickerForMany = this.isContactsPickerForOne = false
    },
    openContactsModalOne(row){
      this.selectedRow = row
      this.isContactsPickerForOne = true
    },
    openContactsModalMany(){
      this.isContactsPickerForMany = true
    },
    async deliverForMany(){
      const entitiesForDeliver = this.deliverables.filter(item => !!item.isChecked).map(item => ({ entityId: item._id, type: item.type }))
      await this.approveDeliverMany({
        projectId: this.currentProject._id,
        entitiesForDeliver,
        user: this.user,
        contacts: this.listOfContactsForDeliver(),
        comment: this.comment,
      })
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
        comment: this.comment,
      })
      this.closeContactsModal()
      this.setDefaultContact()
      this.selectedRow = null
	    this.isComment = false
	    this.comment = ''
    },
    listOfContactsForDeliver(){
      return this.selectedContacts
        .map(item => this.currentProject.clientContacts.find(({firstName, surname}) => `${firstName} ${surname}` === item))
        .map(item => ({email: item.email, firstName: `${item.firstName} ${item.surname}`}))
    },
    setContacts({ option }) {
      const position = this.selectedContacts.indexOf(option)
      if(position === -1){
        this.selectedContacts.push(option)
      }else{
        if(this.selectedContacts.length > 1){
          this.selectedContacts.splice(position, 1)
        }
      }
    },
    setDefaultContact() {
      this.selectedContacts = []
      const { firstName, surname } = this.currentProject.clientContacts[0]
      this.selectedContacts.push(`${firstName} ${surname}`)
    },
    setAction({ option }){
      this.selectedAction = option
      if(option === 'Deliver'){
        this.openContactsModalMany()
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
        const result = await this.$http.post('/delivery/multi-file-dr2-remove', {projectId: this.currentProject._id, type: this.currentReviewType, dr2Id: this.currentReviewId})
        this.storeProject(result.data)
        this.closeDeleteModal()
        this.alertToggle({ message: "Review deleted", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" })
      } finally {
        this.closeDeliverablesModal()
      }
    },
    getIcons({type, files, status}) {
      const { accountManager: {_id: AMId}, projectManager: {_id: PMId}  } = this.currentProject
      const icons = {}
      if (status === 'Delivered') {
        icons.download = {src: require("../../assets/images/latest-version/download-file.png")}
        return icons
      }
      if(type === 'multi' && this.canUpdateDr2 ){
        icons.dr2 = {src: require("../../assets/images/latest-version/delivery-list.png") }
        icons.delete = {src: require("../../assets/images/latest-version/delete-icon.png")}
      }else if(type === 'single' && !files.length && (this.isAdmin || `${AMId}` === `${this.user._id}` || `${PMId}` === `${this.user._id}`)
      ){
        icons.dr2 = {src: require("../../assets/images/latest-version/delivery-list.png") }
        icons.delete = {src: require("../../assets/images/latest-version/delete-icon.png")}
      } else {
        icons.dr2 = {src: require("../../assets/images/latest-version/delivery-list.png") }
      }
      return icons
    },
    dr2Action({_id, type}, key) {
      this.currentReviewId = _id
      this.currentReviewType = type

      switch (key) {
        case "delete":
          this.isDeleteModal = true
          break;
        case "dr2":
          this.isDR2Modal = true
          this.setShowTasksAndDeliverables(false)
          break;
        case "download":
          this.createLinkAndDownload(_id)
          break;
      }
    },
    closeDR2() {
      this.currentReviewId = this.currentReviewType  = null
      this.isDR2Modal = false
	    this.setShowTasksAndDeliverables(true)
    },
    getLangPair(row, type) {
      const source = this.allLang.find(({_id}) => row.sourceLanguage.toString() === _id.toString())
      const target = this.allLang.find(({_id}) => row.targetLanguage.toString() === _id.toString())
      return source[type] + " >> " + target[type]
    },
    getTasksId(row) {
      const mySet = new Set(row.tasks.map((field) => field.substring(field.length - 3) ))
      return [...mySet].join(', ')
    },
    showModal() {
      this.deliverablesModal = true
    },
    closeDeliverablesModal() {
      this.deliverablesModal = false
    },
    async uploadFiles( ) {
      let filesData = new FormData()
      filesData.append('projectId', this.currentProject._id)
      filesData.append('taskIds', JSON.stringify(this.selectedTasks))
      try {
          filesData.append('refFiles', this.refFiles[0])

        const result = await this.$http.post('/delivery/multi-file-dr2-push', filesData)
        this.storeProject(result.data)

        this.refFiles = []
        this.selectedTasks = []
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
          this.refFiles = [files[0]]
      }
      if (!filteredFiles.length) {
        this.clearInputFiles(".files-upload__multiLang")
      }
    },
    deleteFile() {
      this.refFiles = []
    },
    selectedTasksMethod({ option }) {
      const position = this.selectedTasks.indexOf(option);
      if(position !== -1) {
        this.selectedTasks.splice(position, 1);
      } else {
        this.selectedTasks.push(option);
      }
    },
    createLinkAndDownload(id) {
      const deliverables = this.currentProject.tasksDeliverables.find(({deliverablesId})=> deliverablesId === id)
      let link = document.createElement('a')
      link.href = __WEBPACK__API_URL__ + deliverables.path
      link.target = "_blank"
      link.click()
    },
    toggleAll(bool) {
      if(this.currentProject.tasksDR2.hasOwnProperty('singleLang')){
        for(let [index] of this.currentProject.tasksDR2.singleLang.entries()){
          this.currentProject.tasksDR2.singleLang.splice(index, 1, {...this.currentProject.tasksDR2.singleLang[index], isChecked: bool})
        }
      }
      if(this.currentProject.tasksDR2.hasOwnProperty('multiLang')){
        for(let [index] of this.currentProject.tasksDR2.multiLang.entries()){
          this.currentProject.tasksDR2.multiLang.splice(index, 1, {...this.currentProject.tasksDR2.multiLang[index], isChecked: bool})
        }
      }
    },
    toggle(row, bool) {
      const { type, _id: id } = row

      if(type === 'single'){
        const { tasksDR2: { singleLang } } = this.currentProject
        this.currentProject.tasksDR2.singleLang
          .splice(idx(singleLang), 1, {
            ...this.currentProject.tasksDR2.singleLang[idx(singleLang)],
            isChecked: bool
          })
      }else{
        const { tasksDR2: { multiLang } } = this.currentProject
        this.currentProject.tasksDR2.multiLang
          .splice(idx(multiLang), 1, {
            ...this.currentProject.tasksDR2.multiLang[idx(multiLang)],
            isChecked: bool
          })
      }

      function idx(arr){
        return arr.findIndex(({_id}) => `${_id}` === `${id}`)
      }
    },
  },
  computed: {
    ...mapGetters({
	    isShowTasksAndDeliverables: 'isShowTasksAndDeliverables',
	    currentProject: 'getCurrentProject',
      allLang: 'getAllLanguages',
      users: 'getUsers',
      user: 'getUser',
    }),
    availableActionsOptions(){
      const getArrayOfChecked = this.deliverables.filter(item => !!item.isChecked)

      if(getArrayOfChecked.length) if(getArrayOfChecked.every(({status}) => status === 'Ready for Delivery')){
        return ['Deliver']
      }
    },
    checkMultiReview() {
      return this.refFiles.length > 0 && this.selectedTasks.length > 0
    },
    canUpdateDr2() {
      return this.user.group.name === "Administrators" || this.user.group.name === "Developers" || this.currentProject.accountManager._id.toString() === this.user._id.toString()
    },
    canUploadDR1() {
      return this.user.group.name === "Administrators" ||
        this.user.group.name === "Developers" ||
        this.currentProject.projectManager._id.toString() === this.user._id.toString() ||
        this.currentProject.tasksDR1.map(({dr1Manager}) => dr1Manager.toString()).includes(this.user._id.toString())
    },

    deliverables(){
      if(!this.currentProject.hasOwnProperty('tasksDR2')) return []

      const singleLang = this.currentProject.tasksDR2.hasOwnProperty('singleLang') ?
        this.currentProject.tasksDR2.singleLang.map(item => {
          return {
            _id: item._id,
	          deliveryInternalId: item.deliveryInternalId,
            type: 'single',
            status: item.status,
            tasks: item.files.map(item => item.taskId),
            pair: this.getLangPair(item, 'lang'),
            files: item.files,
            isChecked: item.isChecked
          }
        }) : []

      const multiLang = this.currentProject.tasksDR2.hasOwnProperty('multiLang') ?
        this.currentProject.tasksDR2.multiLang.map(item => {
          return {
            _id: item._id,
	          deliveryInternalId: item.deliveryInternalId,
	          type: 'multi',
            status: item.status,
            tasks: item.tasks,
            pair: 'Multilingual',
            files: [item.file],
            isChecked: item.isChecked
          }
        }) : []
      return [ ...singleLang, ...multiLang ]
    },

    selectTaskInfo() {
      if(!this.currentProject || !this.currentProject.tasks) return []
      const multilingualIds = this.currentProject.hasOwnProperty('tasksDR2') ? this.currentProject.tasksDR2.multiLang.map(({tasks}) => tasks).flat() : []
      let result = new Set()
      this.currentProject.tasksDR1
        .filter(({files, taskId}) => files.every(({isFileApproved, isFilePushedDR2}) => isFileApproved && !isFilePushedDR2) && !multilingualIds.includes(taskId))
        .forEach(({taskId}) => result.add(taskId))

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
    isAdmin(){
      const { _id, group: { name } } = this.user
      return name === 'Administrators' || name === 'Developers'
    },

  },
  components: {
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

.deliverablesActions{
  position: relative;
  width: 191px;

  &__drop-menu{
    height: 30px;
  }

  &__title{
    margin-bottom: 4px;
  }

}
.content{
  &__DR2 {
    position: absolute;
    top: 505px;
    left: 40px;
    bottom: 0;
    z-index: 50;
    box-sizing: border-box;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    height: fit-content;
    padding-bottom: 150px;
  }
}

.deliverables {
  box-sizing: border-box;
  min-width: 1000px;
  width: 1000px;
  padding: 20px;
  margin-top: 40px;
  box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
  position: relative;

  &__header{
    display: flex;
    justify-content: space-between;
    margin-bottom: 25px;
  }

  &__items{
    display: flex;
  }
  &__itemsContacts{
    display: flex;
    justify-content: center;
  }

  &__selectTitle{
    margin-bottom: 4px;
  }

  &__approveModal{
    position: absolute;
    z-index: 5555;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  &__uploadItem{
    //display: flex;
    //align-items: center;
    //justify-content: center;
  }

  &__item {
    margin-right: 40px;
  }

  &__titleModal{
    font-size: 21px;
    margin-bottom: 20px;
    text-align: center;
    font-family: Myriad600;
  }
  &__title{
    font-size: 21px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: Myriad600;
  }

  &__select {
    position: relative;
    height: 32px;
    width: 191px;
  }

  &-table {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;

    &__data-status {
      display: flex;
    }


    &__approveModal {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &__actions {
      display: flex;
      justify-content: space-between;
    }

    &__action {
      position: relative;
      width: 191px;
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

    &__icons {
      width: 100%;
      padding: 0 7px 0 0;
      box-sizing: border-box;
      display: flex;
      justify-content: space-around;
      align-items: center;
    }

    &__icon {
      cursor: pointer;
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
      color: $green-approve;
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
    padding: 20px;
    background: white;
    position: absolute;
    box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
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

    & span {
      padding-left: 5px;

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
    background-color: #67573e;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    left: 38px;
    opacity: 0;
    top: -5px;
    transition: opacity .3s;

    &::after {
      content: "";
      position: absolute;
      top: 8px;
      left: 0;
      margin-left: -10px;
      transform: rotate(90deg);
      border-width: 5px;
      border-style: solid;
      border-color: #67573e transparent transparent;
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
    position: relative;
  }

  &__name {
    color: #68573e;
    margin-right: 10px;
  }

  &__item {
    width: 100%;
    border-radius: 5px;
    border: 1px solid #68573e;
    box-sizing: border-box;
    background-color: #fff;
    font-size: 12px;
    padding: 8px;
    margin: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    margin-top: 20px;
    font-family: -webkit-pictograph;
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
}

.title {
  &__action {
    align-self: flex-end;
  }
  &__drop-menu {
    position: relative;
    width: 191px;
    height: 28px;
  }
  &__title {
    margin-bottom: 5px;
    font-size: 16px;
  }
}
.no-box-shadow{
  box-shadow: none;
}

</style>
