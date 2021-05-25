<template lang="pug">
  .formLayout
    .form
      .form__inputs
        .form__projectName
          .input__title Project Name:
          input(type="text" v-model="currentClientRequest.projectName" placeholder="Project Name" @change="changeProjectName(currentClientRequest.projectName)")
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
            :disabledPicker="false"
            :disabled="disabled"
            ref="deadline"
          )
          span(id="calendar" @click="deadlineOpen")
            i.calendar.far.fa-calendar-alt
          Check(id="checkDeadline" @click="checkProjectDeadline", :isApproved="currentClientRequest.checkedForm.isCheckDeadline")

      .form__table
        DataTable(
          :fields="fields"
          :tableData="files"
          :bodyClass="['review-body', {'tbody_visible-overflow': files.length < 6}]"
          :tableheadRowClass="files.length < 6 ? 'tbody_visible-overflow' : ''"
        )
          .form__header(slot="headerFile" slot-scope="{ field }") {{ field.label }}
          .form__header(slot="headerType" slot-scope="{ field }") {{ field.label }}
          .form__header(slot="headerIcon" slot-scope="{ field }") {{ field.label }}

          .form__data(slot="file" slot-scope="{ row }") {{row.filename}}
          .form__data(slot="type" slot-scope="{ row }") {{row.type}}
          .form__dataIcons(slot="icon" slot-scope="{ row }")
            img.review-table__icon(src="../../../assets/images/latest-version/download-file.png" :class="{'opacity-04': row.isFileApproved}" @click="downloadFile(row.path)")
            span(@click="(e) => deleteFile()" :class="{'opacity-04': row.isFileApproved}")
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
            div Source: total size must be <= 10Mb, each file can be <= 2Mb
            div Reference: each file can be <= 50Mb

      .form__table
        DataTable(
          :fields="fields2"
          :tableData="[currentClientRequest.requestForm.complianceOptions]"
          :bodyClass="['review-body', {'tbody_visible-overflow': [currentClientRequest.requestForm.complianceOptions].length < 6}]"
          :tableheadRowClass="[currentClientRequest.requestForm.complianceOptions].length < 6 ? 'tbody_visible-overflow' : ''"
        )
          .form__header(slot="headerTemplate" slot-scope="{ field }") {{ field.label }}
          .form__header(slot="headerDescriptions" slot-scope="{ field }") {{ field.label }}
          .form__header(slot="headerIcons" slot-scope="{ field }") {{ field.label }}

          .form__data(slot="template" slot-scope="{ row }") {{row.title}}
          .form__data(slot="description" slot-scope="{ row }")
            span {{ replaceDescription(row.description) }}
          template(slot="icons" slot-scope="{ row, index }")
            .form__icons
              img.form__icon(v-for="(icon, key) in manageIcons" :src="icon.icon" @click="makeAction(index, key)" :class="[{'opacity-1': isActive(key, index)}, {'opacity-04': row.isFileApproved}]")
              Check(@click="(e) => checkTemplate(e)", :isApproved="row.isCheck")

      .form__comments
        .form__commentsBlock
          Check(id="checkBrief" @click="(e) => checkBrief(e)", :isApproved="currentClientRequest.checkedForm.isCheckBrief")
          .input__title Project Brief:
          textarea(type="text" rows="9" v-model="currentClientRequest.brief")
        .form__commentsBlock
          .input__title Notes:
          textarea(type="text" rows="9" v-model="currentClientRequest.notes")

      .form__button
        Button( value="Approve")

    .side
      .side__info
        .order__row
          .order__subTitle Status:
          .order__value {{ currentClientRequest.status }}
        .order__row
          .order__subTitle Service:
          .order__value {{ currentClientRequest.requestForm.service.title }}
            //.order__details det
        .order__row
          .order__subTitle Source:
          .order__value {{ currentClientRequest.requestForm.sourceLanguage.lang }}
        .order__row
          .order__subTitle Target:
          .order__value {{ currentClientRequest.requestForm.targetLanguages[0].lang }}
        .order__row
          .order__subTitle Option:
          .order__value asjkdkasdj


      .side__contacts
        .form__contacts
          DataTable(
            :fields="fields3"
            :tableData="currentClientRequest.clientContacts"
            :bodyClass="['review-body', {'tbody_visible-overflow': currentClientRequest.clientContacts.length < 6}]"
            :tableheadRowClass="currentClientRequest.clientContacts.length < 6 ? 'tbody_visible-overflow' : ''"
            :headCellClass="'padding-with-check-box'"
            :tableheadClass="'hideHead'"
          )
            div(slot="name" slot-scope="{ row, index }")
              .contacts__data(v-if="!!row.firstName") {{row.firstName}} {{row.surname || ''}}
              .contacts__dataDrop(v-else)
                SelectSingle(
                  :isTableDropMenu="true"
                  :options="[1,3]"
                  @chooseOption="(e) => setContact()"
                )

            .contacts__dataIcon(slot="icon" slot-scope="{ row, index }")
              span(@click="removeContact(index)")
                i.fas.fa-trash

          Add(@add="addContact")
      .side__pm
        .input__title Assign to Project Manager:
        .pm__drop
          SelectSingle(
            :options="['1', '2']",
            placeholder="Project Manager",
            :selectedOption="currentClientRequest.projectManager",
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
				forbiddenExtensions: [
					'webm', 'mpg', 'mp2', 'mpeg', 'mpe', 'mpv', 'ogg', 'mp4', 'm4p',
					'm4v', 'avi', 'wmv', 'mov', 'qt', 'flv', 'swf', 'avchd', 'jpeg',
					'png', 'gif', 'bmp', 'tiff', 'ppm', 'pgm', 'jpg', 'svg', 'bat',
					'mp3', 'aac', '3gp', 'aa', 'aax', 'aiff', 'alac', 'm4p', 'mpc'
				],
				isUploadModal: false,
				sourceFiles: [],
				refFiles: []
			}
		},
		methods: {
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
					default:
						await this.saveTemplate(index)
				}
			},
			setPM({ option }) {
				console.log(option)
			},
			removeContact(index) {
				// this.currentContacts.splice(index, 1)
			},
			setContact(index, { option }) {
				// this.currentContacts.splice(index, 1, this.clientInfo.contacts.find(item => `${ item.firstName } ${ item.surname }` === option))
			},
			addContact() {
				this.currentClientRequest.clientContacts.push({})
			},
			saveTemplate() {

			},
			checkTemplate(data) {

			},
			checkBrief(data) {

			},
			downloadFile(path) {
				console.log(path)
			},
			changeProjectName(name) {
				console.log(name)
			},
			customFormatter(date) {
				return moment(date).format('DD-MM-YYYY, HH:mm')
			},
			checkProjectName(data) {
				this.currentClientRequest.checkedForm.isCheckProjectName = data
			},
			checkFile(data, row) {
				console.log(data, row)
			},
			checkProjectDeadline(data) {
				this.currentClientRequest.checkedForm.isCheckDeadline = data
			},
			async updateProjectDate(date) {
				console.log(date)
				// if (this.project._id) {
				// 	if (prop === 'deadline' && this.isBilling) {
				// 		const date = { ['billingDate']: e }
				// 		await this.setDate('billingDate', date)
				// 	}
				// 	const date = { [prop]: e }
				// 	await this.setDate(prop, date)
				// } else {
				// 	if (prop === 'deadline' && this.isBilling) {
				// 		this.project.billingDate = e
				// 	}
				// }
			},
			restructuredFiles() {
				const { requestForm: { sourceFiles, refFiles } } = this.currentClientRequest
				this.files = [
					...sourceFiles.map(i => ({ ...i, type: 'Source' })),
					...refFiles.map(i => ({ ...i, type: 'Reference' }))
				]
			},
			deadlineOpen() {
				this.$refs.deadline.showCalendar()
			},


			uploadSourceFiles({ files }) {
				console.log(files)
				// const filesBiggerThan2MB = Array.from(files).filter(item => item.size / 1000000 > 2)
				// if (filesBiggerThan2MB.length) {
				// 	this.showFileSizeWarning = true
				// }
				// const filteredFiles = Array.from(files).filter(item => {
				// 	const { size, name } = item
				// 	const extension = name.split('.').pop()
				// 	return size / 1000000 <= 2 && this.forbiddenExtensions.indexOf(extension) === -1
				// })
				// if (filteredFiles.length && this.checkFilesSource(filteredFiles)) {
				// 	for (let file of filteredFiles) {
				// 		const isExist = this.sourceFiles.find(item => item.name === file.name)
				// 		if (!isExist) {
				// 			this.sourceFiles.push(file)
				// 		}
				// 	}
				// }
				// if (!filteredFiles.length) {
				// 	this.clearInputFiles(".files-upload__source-file")
				// }
				// this.setDataValue({ prop: "sourceFiles", value: this.sourceFiles })
			},
			uploadRefFiles({ files }) {
				console.log(files)
				// const filesBiggerThan2MB = Array.from(files).filter(item => item.size / 1000000 > 50)
				// if (filesBiggerThan2MB.length) {
				// 	this.showFileSizeWarning = true
				// }
				// const filteredFiles = Array.from(files).filter(item => {
				// 	console.log(item)
				// 	return item.size / 1000000 <= 50
				// })
				// if (filteredFiles.length) {
				// 	for (let file of files) {
				// 		const isExist = this.refFiles.find(item => item.name === file.name)
				// 		if (!isExist) {
				// 			this.refFiles.push(file)
				// 		}
				// 	}
				// }
				// if (!filteredFiles.length) {
				// 	this.clearInputFiles(".files-upload__ref-file")
				// }
				// this.setDataValue({ prop: "refFiles", value: this.refFiles })
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
			this.restructuredFiles()
		},
		computed: {
			...mapGetters({
				currentClientRequest: "getCurrentClientRequest"
			}),
			manageIcons() {
				const { delete: del, ...result } = this.icons
				return result
			}
		},
		components: {
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
    &__info{
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
    width: 720px;
    box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;

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

  .opacity-04 {
    opacity: 0.4;
    cursor: default;
  }

  .opacity-1 {
    opacity: 1;
    cursor: default;
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
