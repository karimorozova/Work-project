<template lang="pug">
  .formLayout
    .form
      .form__inputs
        .form__projectName
          .input__title Project Name:
          input(type="text" :disabled="currentClientRequest.checkedForm.isCheckProjectName" v-model="currentClientRequest.projectName" @change="changeProjectName('projectName', currentClientRequest.projectName)" placeholder="Project Name")
          Check(id="checkProject" @click="checkProjectName", :isApproved="currentClientRequest.checkedForm.isCheckProjectName")
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
          Add(@add="openUploadModal")

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
        .order__row
          .order__subTitle Request:
          .order__value {{ currentClientRequest.projectId }}
            .order__details {{ currentClientRequest.startOption === 'Send' ? 'Send a Quote' : 'Start Immediately' }}
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


      .side__contacts
        .form__contacts
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

          Add(@add="addContact")
      .side__pm
        .input__title Assign to Project Manager:
        .pm__drop
          SelectSingle(
            :options="managers",
            placeholder="Project Manager",
            :selectedOption="currentClientRequest.projectManager ? `${currentClientRequest.projectManager.firstName} ${currentClientRequest.projectManager.lastName}` : ''",
            @chooseOption="setPM"
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
					{ label: "File Name", headerKey: "headerTemplate", key: "template", width: "54%", padding: 0 },
					{ label: "File Type", headerKey: "headerDescriptions", key: "description", width: "30%", padding: 0 },
					{ label: "", headerKey: "headerIcons", key: "icons", width: "16%", padding: 0 }
				],
				fields3: [
					{ label: "Name", headerKey: "headerName", key: "name", width: "70%", padding: 0 },
					{ label: "", headerKey: "headerIcon", key: "icon", width: "30%", padding: 0 }
				],
				complianceTemplates: [
					{
						title: 'POI (Proof of Identity Documents)',
						description: '<li>Full name</li><li>DOB</li><li>Issue date</li><li>Expiry date if there is any</li>'
					},
					{
						title: 'POA (Proof of Address Documents)',
						description: '<li>Full name</li><li>Address</li><li>Issue date</li>'
					},
					{
						title: 'Tax declarations',
						description: '<li>Name</li><li>Net annual declared income</li><li>Year of declaration</li><li>Issue date</li><li>Currency</li>'
					},
					{
						title: 'Salary certificates / letters of employment',
						description: '<li>Name</li><li>Net salary</li><li>Employer</li><li>Issue date</li><li>Currency</li>'
					},
					{
						title: 'Sales / purchase agreements',
						description: '<li>Name of seller</li><li>Name of buyer if any</li><li>Amount of the sale</li><li>Date of agreement</li><li>Issuing authority</li><li>Currency</li>'
					},
					{
						title: 'Cancellation letters of bank accounts / CCs',
						description: '<li>Account holder name</li><li>Account number</li><li>Issuing credit institution</li><li>CC digits</li><li>Issue date</li>'
					},
					{
						title: 'Specific transactions on bank statements',
						description: '<li>Brief description of specific transaction</li>'
					},
					{
						title: 'Proof of relation documents (eg birth certificates, marriage certificates)',
						description: '<li>Type of doc</li><li>Names involved</li><li>Relation</li>'
					},
					{
						title: 'Corporate: Company Info',
						description: '<li>Registered name</li><li>Incorporation date</li><li>Directors and Authorised Signatories</li><li>Shareholders/ Beneficial Owners</li><li>Registered AND Business address (if available)</li><li>Share capital</li><li>Any information on Directors and Shareholders</li>'
					},
					{
						title: 'Corporate: Financial statements',
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
				currentTemplate: ''
			}
		},
		methods: {
			...mapActions({
				updateClientsRequestsProps: "updateClientsRequestsProps",
				setCurrentClientRequest: "setCurrentClientRequest",
				alertToggle: "alertToggle"
			}),
			approveRequest() {
				try {
					this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { "status": 'Request Approved' } })
					this.alertToggle({ message: "Project approved!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Project not approved!", isShow: true, type: "error" })
				}
			},
			openDeleteFileApprovalModal(type, path, bool) {
				if (bool) return
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
				const regex = /^[A-Za-z][A-Za-z0-9\-\_ ]+((([A-Za-z0-9])+([\-\_])?)* *)*$/
				if (!regex.test(value) || !value) {
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
			changeBrief(data) {
				try {
					this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { 'brief': data } })
					this.alertToggle({ message: "Project brief saved!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Project brief not saved!", isShow: true, type: "error" })
				}
			},
			changeNotes(data) {
				try {
					this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { 'notes': data } })
					this.alertToggle({ message: "Project notes saved!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Project notes not saved!", isShow: true, type: "error" })
				}
			},
			async makeAction(index, key) {
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
				if (this.currentClientRequest.checkedForm.isCheckComplianceTemplate) return
				this.currentActive = index
				this.currentTemplate = this.currentClientRequest.requestForm.complianceOptions
			},
			manageCancelEdition() {
				this.currentActive = -1
			},
			setTemplate({ option }) {
				this.currentTemplate = this.complianceTemplates.find(({ title }) => title === option)
			},
			saveTemplate(index) {
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
				const pm = this.users.find(({ firstName, lastName }) => `${ firstName } ${ lastName }` === option)
				try {
					this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { "projectManager": pm } })
					this.alertToggle({ message: "Project managers added!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Project managers not added!", isShow: true, type: "error" })
				}
			},
			async removeContact(row) {
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
				this.currentClientRequest.clientContacts.push({})
			},
			checkTemplate(data) {
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
				try {
					this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { "checkedForm.isCheckProjectName": data } })
					this.alertToggle({ message: "Project checked!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Project not checked!", isShow: true, type: "error" })
				}
			},
			checkBrief(data) {
				try {
					this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { "checkedForm.isCheckBrief": data } })
					this.alertToggle({ message: "Project brief checked!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Project brief not checked!", isShow: true, type: "error" })
				}
			},
			async checkFile(data, { path, type }) {
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
				try {
					this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { "checkedForm.isCheckDeadline": data } })
					this.alertToggle({ message: "Project deadline checked!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Project deadline not checked!", isShow: true, type: "error" })
				}
			},
			async updateProjectDate(data) {
				try {
					this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { 'deadline': data } })
					this.alertToggle({ message: "Project deadline saved!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Project deadline saved!", isShow: true, type: "error" })
				}
			},
			restructuredFiles(project) {
				const { requestForm: { sourceFiles, refFiles } } = project
				this.files = [
					...sourceFiles.map(i => ({ ...i, type: 'Source' })),
					...refFiles.map(i => ({ ...i, type: 'Reference' }))
				]
			},
			deadlineOpen() {
				this.$refs.deadline.showCalendar()
			},
			clearInputFiles(str) {
				let inputFiles = document.querySelectorAll(str)
				for (let elem of inputFiles) {
					elem.value = ''
				}
			},
			async uploadSourceFiles({ files }) {
				const filteredFiles = Array.from(files).filter(item => {
					const { size, name } = item
					const extension = name.split('.').pop()
          if(this.currentClientRequest.requestForm.service.title === 'Compliance'){
	          return size / 1000000 <= 50
          }else{
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
				const filteredFiles = Array.from(files).filter(item => {
					const { size, name } = item
					const extension = name.split('.').pop()
					//return size / 1000000 <= 50 && this.forbiddenExtensions.indexOf(extension) === -1
					return size / 1000000 <= 50
				})

				let formData = new FormData()
				formData.append("type", 'Reference')
				formData.append("projectId", this.currentClientRequest._id)

				if (filteredFiles.length){
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
		}
	}
</script>

<style scoped lang="scss">
  @import "../../../assets/styles/settingsTable";

  .formLayout {
    padding: 40px;
    display: flex;
  }

  .side {
    &__contacts,
    &__pm {
      box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
      padding: 20px;
      width: 240px;
      height: fit-content;
      margin-left: 40px;
      margin-bottom: 40px;
    }

    &__info {
      box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
      padding: 10px 20px 20px 20px;
      width: 240px;
      height: fit-content;
      margin-left: 40px;
      margin-bottom: 40px;
    }
  }

  .form {
    padding: 20px;
    min-width: 720px;
    max-width: 720px;
    box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;

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
      display: flex;
      align-items: center;
      padding: 0 5px;
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

    &__table {
      margin-bottom: 40px;
      position: relative;
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
      margin-bottom: 40px;
    }

    &__projectName {
      position: relative;
      /*margin-right: 40px;*/
    }

    &__projectDeadline {
      position: relative;
    }


    &__icons {
      @extend %table-icons;
      justify-content: center;
    }

    &__icon {
      @extend %table-icon;
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
      box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
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
    }

    &__subTitle {
      opacity: 0.6;
      width: 70px;
    }

    &__value {
      font-family: 'Myriad600';
    }

    &__row {
      display: -webkit-box;
      margin-top: 10px;
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
    border-radius: 10px;
    border: 1px solid #68573E;
    padding: 5px;
    color: #68573E;
    resize: none;
    outline: none;
    box-sizing: border-box;
  }

  input {
    color: #67573e;
    border: 1px solid #67573e;
    border-radius: 5px;
    padding: 0 5px;
    outline: none;
    width: 240px;
    height: 30px;
    box-sizing: border-box;
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
