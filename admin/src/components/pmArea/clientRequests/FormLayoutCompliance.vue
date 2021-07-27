<template lang="pug">
  .formLayout
    .form
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
      .form__group
        .form__inputsGroup
          .form__inputs
            .form__projectName
              .input__title Project Name:
              input(type="text" :disabled="currentClientRequest.checkedForm.isCheckProjectName" v-model="currentClientRequest.projectName" @change="changeProjectName('projectName', currentClientRequest.projectName)" placeholder="Project Name")
              Check(id="checkProject" @click="checkProjectName", :isApproved="currentClientRequest.checkedForm.isCheckProjectName")
            .form__assignedPm
              .input__title Assign to Project Manager:
              SelectSingle(
                :options="managers",
                placeholder="Project Manager",
                :selectedOption="currentClientRequest.projectManager ? `${currentClientRequest.projectManager.firstName} ${currentClientRequest.projectManager.lastName}` : ''",
                @chooseOption="setPM"
              )


          .form__inputs
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
                :disabledPicker="currentClientRequest.checkedForm.isCheckDeadline"
                :disabled="disabled"
                ref="deadline"
              )
              span(id="calendar" @click="deadlineOpen")
                i.calendar.far.fa-calendar-alt
              Check(id="checkDeadline" @click="checkProjectDeadline", :isApproved="currentClientRequest.checkedForm.isCheckDeadline")

            .form__assignedPm
              .input__title Assign to Account Manager:
              SelectSingle(
                :options="accountManagers",
                placeholder="Account Manager",
                :selectedOption="currentClientRequest.accountManager ? `${currentClientRequest.accountManager.firstName} ${currentClientRequest.accountManager.lastName}` : ''",
                @chooseOption="approveChangeAM"
              )

        .form__contacts
          .input__title Client Contacts
          DataTable(
            :fields="fields3"
            :tableData="currentClientRequest.clientContacts"
            :bodyClass="['form-table-body', {'tbody_visible-overflow': currentClientRequest.clientContacts.length < 10}]"
            :tableheadRowClass="currentClientRequest.clientContacts.length < 10 ? 'tbody_visible-overflow' : ''"
            :headCellClass="'padding-with-check-box'"
            :tableheadClass="'hideHead'"
          )
            div(slot="name" slot-scope="{ row, index }")
              .contacts__data(v-if="!!row.firstName") {{row.firstName}} {{row.surname || ''}}
              .contacts__dataDrop(v-else)
                SelectSingle(
                  :isTableDropMenu="true"
                  :options="availableContacts"
                  @chooseOption="setContact"
                )

            .contacts__dataIcon(slot="icon" slot-scope="{ row, index }")
              span(@click="removeContact(row)" style="margin-top: 2px; cursor: pointer;")
                i.fas.fa-trash

          Add(v-if="canUpdateRequest()" @add="addContact")

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
          DataTable(
            :fields="fields"
            :tableData="files"
            :bodyClass="['form-table-body', {'tbody_visible-overflow': files.length < 10}]"
            :tableheadRowClass="files.length < 10 ? 'tbody_visible-overflow' : ''"
          )
            .form__header(slot="headerFile" slot-scope="{ field }") {{ field.label }}
            .form__header(slot="headerType" slot-scope="{ field }") {{ field.label }}
            .form__header(slot="headerIcon" slot-scope="{ field }") {{ field.label }}

            .form__data(slot="file" slot-scope="{ row }") {{row.filename}}
            .form__data(slot="type" slot-scope="{ row }") {{row.type}}
            .form__dataIcons(slot="icon" slot-scope="{ row }")
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

        .form__table
          DataTable(
            :fields="fields2"
            :tableData="[currentClientRequest.requestForm.complianceOptions]"
            :bodyClass="['form-table-body', {'tbody_visible-overflow': [currentClientRequest.requestForm.complianceOptions].length < 10}]"
            :tableheadRowClass="[currentClientRequest.requestForm.complianceOptions].length < 10 ? 'tbody_visible-overflow' : ''"
          )
            .form__header(slot="headerTemplate" slot-scope="{ field }") {{ field.label }}
            .form__header(slot="headerDescriptions" slot-scope="{ field }") {{ field.label }}
            .form__header(slot="headerIcons" slot-scope="{ field }") {{ field.label }}

            template(slot="template" slot-scope="{ row, index }")
              .form__data(v-if="currentActive !== index") {{row.title}}
              .contacts__dataDrop(v-else)
                SelectSingle(
                  :isTableDropMenu="true",
                  placeholder="Select",
                  :selectedOption="currentTemplate.title",
                  :options="complianceTemplates.map(({title}) => title)",
                  @chooseOption="setTemplate"
                )

            template(slot="description" slot-scope="{ row, index }")
              .form__description(v-if="currentActive !== index") {{ replaceDescription(row.description) }}
              .form__description(v-else) {{ replaceDescription(currentTemplate.description) }}

            template(slot="icons" slot-scope="{ row, index }")
              .form__icons
                img.form__icon(v-for="(icon, key) in manageIcons" :src="icon.icon" @click="makeAction(index, key)" :class="[{'opacity-1': isActive(key, index)}, {'opacity-04': currentClientRequest.checkedForm.isCheckComplianceTemplate}]")
                Check(@click="(e) => checkTemplate(e)", :isApproved="currentClientRequest.checkedForm.isCheckComplianceTemplate" :isDisabled="currentActive === index")

      .form__comments
        .form__commentsBlock
          Check(id="checkBrief" @click="checkBrief", :isApproved="currentClientRequest.checkedForm.isCheckBrief")
          .input__title Project Brief:
          textarea(type="text" rows="9" :disabled="currentClientRequest.checkedForm.isCheckBrief" v-model="currentClientRequest.brief" @change="changeBrief(currentClientRequest.brief)")
        .form__commentsBlock
          .input__title Notes:
          textarea(type="text" rows="9" v-model="currentClientRequest.notes" @change="changeNotes(currentClientRequest.notes)")

      .form__button
        Button(@clicked="approveRequest" :isDisabled="!isAllChecked" value="Approve")

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
            span.order__details {{ currentClientRequest.startOption === 'Send' ? 'Send a Quote' : 'Start Immediately' }}
          .form__project-icons
            .icon
              span(class="click-copy" @click="copyId")
                i.far.fa-copy(aria-hidden="true")
        //.order__title
        //  span {{ currentClientRequest.projectId }}
        //  span {{ currentClientRequest.startOption === 'Send' ? 'Send a Quote' : 'Start Immediately' }}
        //.order__value {{ currentClientRequest.projectId }}
        //  .order__details
        .order__row
          .order__subTitle Status:
          .order__value {{ currentClientRequest.status }}
        .order__row
          .order__subTitle Service:
          .order__value {{ currentClientRequest.requestForm.service.title }}
        .order__row
          .order__subTitle Source:
          .order__value {{ currentClientRequest.requestForm.sourceLanguage.lang }}
        .order__row
          .order__subTitle Target:
          .order__value {{ currentClientRequest.requestForm.targetLanguages[0].lang }}
        Button(customClass="middle" @clicked="setCurrentAm" :isDisabled="isAmSet() || !isAm()" value="Get This Project")
        Button(customClass="middle" class="button-m-top" @clicked="isDeleteRequest" value="Delete Request")


      //.side__contacts
      //  .form__contacts
      //    DataTable(
      //      :fields="fields3"
      //      :tableData="currentClientRequest.clientContacts"
      //      :bodyClass="['form-table-body', {'tbody_visible-overflow': currentClientRequest.clientContacts.length < 10}]"
      //      :tableheadRowClass="currentClientRequest.clientContacts.length < 10 ? 'tbody_visible-overflow' : ''"
      //      :headCellClass="'padding-with-check-box'"
      //      :tableheadClass="'hideHead'"
      //    )
      //      div(slot="name" slot-scope="{ row, index }")
      //        .contacts__data(v-if="!!row.firstName") {{row.firstName}} {{row.surname || ''}}
      //        .contacts__dataDrop(v-else)
      //          SelectSingle(
      //            :isTableDropMenu="true"
      //            :options="availableContacts"
      //            @chooseOption="setContact"
      //          )
      //
      //      .contacts__dataIcon(slot="icon" slot-scope="{ row, index }")
      //        span(@click="removeContact(row)" style="margin-top: 2px; cursor: pointer;")
      //          i.fas.fa-trash
      //
      //    Add(@add="addContact")
      ////.side__pm

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

	export default {
		mixins: [ crudIcons ],
		data() {
			return {
				clientRequest: {},
				disabled: {
					to: moment().add(-1, 'day').endOf('day').toDate()
				},
				files: [],
				fields: [
					{ label: "File Name", headerKey: "headerFile", key: "file", width: "54%", padding: 0 },
					{ label: "File Type", headerKey: "headerType", key: "type", width: "30%", padding: 0 },
					{ label: "", headerKey: "headerIcon", key: "icon", width: "16%", padding: 0 }
				],
				fields2: [
					{ label: "Template", headerKey: "headerTemplate", key: "template", width: "47%", padding: 0 },
					{ label: "Description", headerKey: "headerDescriptions", key: "description", width: "30%", padding: 0 },
					{ label: "", headerKey: "headerIcons", key: "icons", width: "23%", padding: 0 }
				],
				fields3: [
					{ label: "Name", headerKey: "headerName", key: "name", width: "70%", padding: 0 },
					{ label: "", headerKey: "headerIcon", key: "icon", width: "30%", padding: 0 }
				],
				complianceTemplates: [
					{
						title: '[1] POI (Proof of Identity Documents)',
						description: '<li>Full name</li><li>DOB</li><li>Issue date</li><li>Expiry date if there is any</li>'
					},
					{
						title: '[2] POA (Proof of Address Documents)',
						description: '<li>Full name</li><li>Address</li><li>Issue date</li>'
					},
					{
						title: '[3] Tax declarations',
						description: '<li>Name</li><li>Net annual declared income</li><li>Year of declaration</li><li>Issue date</li><li>Currency</li>'
					},
					{
						title: '[4] Salary certificates / letters of employment',
						description: '<li>Name</li><li>Net salary</li><li>Employer</li><li>Issue date</li><li>Currency</li>'
					},
					{
						title: '[5] Sales / purchase agreements',
						description: '<li>Name of seller</li><li>Name of buyer if any</li><li>Amount of the sale</li><li>Date of agreement</li><li>Issuing authority</li><li>Currency</li>'
					},
					{
						title: '[6] Cancellation letters of bank accounts / CCs',
						description: '<li>Account holder name</li><li>Account number</li><li>Issuing credit institution</li><li>CC digits</li><li>Issue date</li>'
					},
					{
						title: '[7] Specific transactions on bank statements',
						description: '<li>Brief description of specific transaction</li>'
					},
					{
						title: '[8] Proof of relation documents (eg birth certificates, marriage certificates)',
						description: '<li>Type of doc</li><li>Names involved</li><li>Relation</li>'
					},
					{
						title: '[9] Corporate: Company Info',
						description: '<li>Registered name</li><li>Incorporation date</li><li>Directors and Authorised Signatories</li><li>Shareholders/ Beneficial Owners</li><li>Registered AND Business address (if available)</li><li>Share capital</li><li>Any information on Directors and Shareholders</li>'
					},
					{
						title: '[10] Corporate: Financial statements',
						description: '<li>Profit & Loss: line by line translation</li><li>Balance sheet: line by line translation</li><li>Additional notes: line by line for all table type notes</li><li>Any information regarding payments to shareholders and directors</li>'
					}
				],
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
			}
		},
		methods: {
			...mapActions({
				updateClientsRequestsProps: "updateClientsRequestsProps",
				setCurrentClientRequest: "setCurrentClientRequest",
				alertToggle: "alertToggle"
			}),
      isDeleteRequest() {
        this.deleteCurrentRequest = true
      },
      async deleteRequest() {
        const { id } = this.$route.params
        await this.$http.post(`/clients-requests/${id}/delete`)
        if(window.history.length > 2) {
          this.$router.go(-1)
        }else {
          this.$router.push('/pangea-dashboard/overall-view')
        }
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
					this.alertToggle({
						message: "Text copied successfully",
						isShow: true,
						type: "success"
					})
				} catch (err) {
					this.alertToggle({
						message: "Text not copied",
						isShow: true,
						type: "error"
					})
				}
			},
			setCurrentAm() {
				if (this.isAmSet()) return
				this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { "accountManager": this.user._id } })
			},
			canUpdateRequest() {
				if (!this.currentClientRequest.accountManager) return false

				const group = this.user.group.name
				const isAdmin = group === "Administrators" || group === "Developers"
				const currentAm = group === "Account Managers" && this.currentClientRequest.accountManager._id === this.user._id

				return isAdmin || currentAm
			},
			approveRequest() {
				if (!this.canUpdateRequest()) return
				try {
					this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { "status": 'Request Approved' } })
					this.alertToggle({ message: "Project approved!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Project not approved!", isShow: true, type: "error" })
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
				// const regex = /^([^\d\W]|[A-z])[\w \.]*$/
				// if (!regex.test(value) || !value) {
				if (!value) {
					this.alertToggle({ message: "Project name not saved!", isShow: true, type: "error" })
					// this.currentClientRequest.projectName = value.replace(/( *[^\w\s\.]+ *)+/g, ' ').trim().replace(/^\d+( ?\d*)*/g, '')
					return
				}
				try {
					this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { [key]: value } })
					this.alertToggle({ message: "Project name saved!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Project name not saved!", isShow: true, type: "error" })
				}
			},
			changeBrief(data) {
				if (!this.canUpdateRequest()) return
				try {
					this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { 'brief': data } })
					this.alertToggle({ message: "Project brief saved!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Project brief not saved!", isShow: true, type: "error" })
				}
			},
			changeNotes(data) {
				if (!this.canUpdateRequest()) return
				try {
					this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { 'notes': data } })
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
				link.href = __WEBPACK__API_URL__ + path
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
					this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { "checkedForm.isCheckBrief": data } })
					this.alertToggle({ message: "Project brief checked!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Project brief not checked!", isShow: true, type: "error" })
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
			deadlineOpen() {
				if (!this.canUpdateRequest()) return
				this.$refs.deadline.showCalendar()
			},
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
		},
		mounted() {
			this.restructuredFiles(this.currentClientRequest)
		},
		computed: {
			...mapGetters({
				user: "getUser",
				users: "getUsers",
				currentClientRequest: "getCurrentClientRequest"
			}),
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

				return isSourceFiles && isRefFiles && isCheckProjectName && isCheckDeadline && isCheckBrief && isCheckComplianceTemplate && !!projectManager
			}
		},

		components: {
			ApproveModal,
			Button,
			SelectSingle,
			FilesUpload,
			Add,
			DataTable,
			Check,
			DatepickerWithTime
		},
		created() {
			// this.currentClientRequest = this.
		}
	}
</script>

<style scoped lang="scss">
  @import "../../../assets/styles/settingsTable";
  @import "../../../assets/scss/colors";

  .button-m-top {
    margin-top: 20px;
  }
  .approve__delete {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translate(-50%, 0);
    z-index: 15;

  }

  .formLayout {
    padding: 40px;
    display: flex;
  }

  .side {
    &__contacts,
    &__pm {
      box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
      padding: 20px;
      width: 240px;
      height: fit-content;
      margin-left: 40px;
      margin-bottom: 40px;
    }

    &__info {
      position: relative;
      box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
      padding: 20px;
      width: 400px;
      box-sizing: border-box;
      margin-left: 40px;
      margin-bottom: 40px;
      border-radius: 4px;
      background: white;
    }
  }

  .form {
    position: relative;
    padding: 20px;
    min-width: 1000px;
    max-width: 1000px;
    box-sizing: border-box;
    box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
    border-radius: 4px;
    background: white;

    &__project-icons {
      color: #66563d;
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
      background: rgba(0, 0, 0, .2);
      z-index: 2;
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
    }

    &__commentsBlock {
      display: block;
      position: relative;
      width: 48%;
    }

    &__table-box {
      display: flex;
      justify-content: space-between;
    }

    &__table {
      margin-bottom: 20px;
      position: relative;
      width: 48%;
    }

    &__contacts {
      width: 240px;
      margin-left: 150px;
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
      margin-bottom: 15px;
    }

    &__group {
      display: flex;
    }

    &__inputsGroup {
      flex-grow: 1;
      margin-bottom: 40px;

    }

    &__projectName {
      position: relative;
      /*margin-right: 40px;*/
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
    }

    &__icon {
      @extend %table-icon;
    }

    &__project {
      margin-bottom: 20px;
      border-bottom: 1px solid $border;
      width: 100%;
      padding-bottom: 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      &-title {
        font-size: 21px;
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
      padding: 30px 20px 20px 20px;
      box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
      position: absolute;
      z-index: 9999;
      background: white;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 400px;
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
    &__details {
      font-size: 12px;
      font-family: 'Myriad400';
      opacity: 0.6;
      padding-left: 5px;
    }

    &__subTitle {
      width: 170px;
    }

    &__title {
      font-size: 21px;
      font-family: Myriad600;
    }

    &__value {
      font-family: 'Myriad400';
    }

    &__row {
      display: -webkit-box;
      //margin-bottom: 15px;
      width: 100%;
      //display: -ms-flexbox;
      //display: flex;
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
    right: 7px;
    top: 27px;
  }
</style>
