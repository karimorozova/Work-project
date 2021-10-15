<template lang="pug">
  .formLayout
    .form
      .form__title General Information
      .form__group
        .form__inputsGroup
          .form__inputs
            .form__projectName
              .input__title Project Name:
              input(type="text" :disabled="true" :value="currentClientRequest.projectName")

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
                :disabled="disabled"
                ref="deadline"
              )

          .form__inputs
            .form__assignedPm
              .input__title Project Manager:
              .drop-white
                SelectSingle(
                  :options="managers",
                  placeholder="Option",
                  :selectedOption="currentClientRequest.projectManager ? `${currentClientRequest.projectManager.firstName} ${currentClientRequest.projectManager.lastName}` : ''",
                  :isDisabled="true"
                )

            .form__assignedPm
              .input__title Account Manager:
              .drop-white
                SelectSingle(
                  :options="accountManagers",
                  placeholder="Option",
                  :selectedOption="currentClientRequest.accountManager ? `${currentClientRequest.accountManager.firstName} ${currentClientRequest.accountManager.lastName}` : ''",
                  @chooseOption="approveChangeAM"
                  :isDisabled="true"
                )

        .form__contacts
          .table
            GeneralTable(
              :fields="fields3"
              :tableData="currentClientRequest.clientContacts"
            )
              .table__header(slot="headerName" slot-scope="{ field }") {{ field.label }}
              .table__col(slot="name" slot-scope="{ row, index }")
                .table__data {{row.firstName}} {{row.surname || ''}}

      .form__title Files & Options
      .form__table-box
        .form__table
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
                img(src="../../../assets/images/latest-version/download-file.png" style="cursor: pointer;" @click="downloadFile(row.path)")

        .form__table
          .table(style="margin-top: 20px;")
            GeneralTable(
              :fields="fields2"
              :tableData="[currentClientRequest.requestForm.complianceOptions]"
            )
              .table__header(slot="headerTemplate" slot-scope="{ field }") {{ field.label }}
              .table__header(slot="headerDescriptions" slot-scope="{ field }") {{ field.label }}

              .table__col(slot="template" slot-scope="{ row, index }")
                .table__data {{row.title}}
              template(slot="description" slot-scope="{ row, index }")
                .table__dataDescription {{ replaceDescription(row.description) }}

      .form__comments
        .form__commentsBlock
          .input__title Project Brief:
          textarea(type="text" rows="9" :disabled="true" :value="currentClientRequest.brief")
        .form__commentsBlock
          .input__title Notes:
          textarea(type="text" rows="9" :disabled="true" :value="currentClientRequest.notes")

    .side
      .side__info
        .form__project
          .form__project-title
            span(id="id") {{ currentClientRequest.projectId }}
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
          .order__subTitle Client:
          .order__value {{ currentClientRequest.customer.name }}
        .order__row
          .order__subTitle Service:
          .order__value {{ currentClientRequest.requestForm.service.title }}
        .order__row
          .order__subTitle Industry:
          .order__value {{ currentClientRequest.industry.name }}
        .order__row
          .order__subTitle Source:
          .order__value {{ currentClientRequest.requestForm.sourceLanguage.lang }}
        .order__row
          .order__subTitle Targets:
          .order__value {{ getTargets(currentClientRequest) }}
        .order__row(v-if="currentClientRequest.hasOwnProperty('createdBy')")
          .order__subTitle Created By:
          .order__value {{ currentClientRequest.createdBy.firstName }} {{ currentClientRequest.createdBy.surname || '' }}


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
					{ label: "File Name", headerKey: "headerFile", key: "file", style: { width: "60%" } },
					{ label: "File Type", headerKey: "headerType", key: "type", style: { width: "30%" } },
					{ label: "", headerKey: "headerIcon", key: "icon", style: { width: "10%" } }
				],
				fields2: [
					{ label: "Template", headerKey: "headerTemplate", key: "template", style: { width: "50%" } },
					{ label: "Description", headerKey: "headerDescriptions", key: "description", style: { width: "50%" } }
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
			checkTemplate(data) {
				try {
					this.updateClientsRequestsProps({ projectId: this.currentClientRequest._id, value: { "checkedForm.isCheckComplianceTemplate": data } })
					this.alertToggle({ message: "Template checked!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Template not checked!", isShow: true, type: "error" })
				}
			},
			downloadFile(path) {
				let link = document.createElement('a')
				link.href = __WEBPACK__API_URL__ + path
				link.target = "_blank"
				link.click()
			},
			customFormatter(date) {
				return moment(date).format('DD-MM-YYYY, HH:mm')
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
			replaceDescription(str) {
				return str.split(/<\/li>/).join('').split(/<li>/).filter(i => !!i).reduce((acc, curr) => {
					acc = acc + curr + '; '
					return acc
				}, '')
			}
		},
		mounted() {
			this.restructuredFiles(this.currentClientRequest)
			this.mainSourceLanguageId = this.currentClientRequest.requestForm.sourceLanguage._id.toString()
		},
		computed: {
			...mapGetters({
				user: "getUser",
				users: "getUsers",
				languages: "getAllLanguages",
				currentClientRequest: "getCurrentClientRequest"
			}),
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
				if (this.languages.length && this.mainSourceLanguageId) {
					const { customer: { services }, requestForm: { service }, industry } = this.currentClientRequest
					const neededServices = [ ...new Set(services
							.filter(item => item.industries[0].toString() === industry._id.toString()
									&& item.services[0].toString() === service._id.toString()
									&& item.sourceLanguage.toString() === this.mainSourceLanguageId.toString())
							.map(item => item.targetLanguages[0])) ]
					return neededServices.map(item => this.languages.find(item2 => item2._id.toString() === item))
				}
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

				return isSourceFiles && isRefFiles && isCheckProjectName && isCheckDeadline && isCheckBrief && isCheckComplianceTemplate && !!projectManager
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
			DatepickerWithTime
		}
	}
</script>

<style scoped lang="scss">
  @import "../../../assets/styles/settingsTable";
  @import "../../../assets/scss/colors";

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
      padding: 20px;
      box-shadow: $box-shadow;
      width: 240px;
      height: fit-content;
      margin-left: 40px;
      margin-bottom: 40px;
    }

    &__info {
      position: relative;
      padding: 20px;
      box-shadow: $box-shadow;
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
    min-width: 1040px;
    max-width: 1040px;
    box-sizing: border-box;
    box-shadow: $box-shadow;
    border-radius: 4px;
    background: white;

    &__title {
      font-size: 16px;
      margin-top: 30px;
      padding-bottom: 8px;
      font-family: 'Myriad600'
    }

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
    }

    &__commentsBlock {
      display: block;
      position: relative;
      width: 48.5%;
    }

    &__table-box {
      border: 2px solid $light-border;
      border-radius: 4px;
      padding: 30px;
      margin-bottom: 25px;
    }

    &__table {
      position: relative;
    }

    &__contacts {
      width: 340px;
      margin-left: 90px;
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
    }

    &__group {
      display: flex;
    }

    &__inputsGroup {
      flex-grow: 1;
      position: relative;
      padding: 20px 30px;
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
      border-bottom: 1px solid $border;
      width: 100%;
      padding-bottom: 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      &-title {
        font-size: 19px;
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
      box-shadow: $box-shadow;
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
      font-size: 19px;
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
</style>
