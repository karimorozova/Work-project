<template lang="pug">
  .tasks-files
    .tasks-files__table
      DataTable(
        :fields="fields"
        :tableData="filesData"
        :bodyClass="filesData.length < 6 ? 'tbody_visible-overflow' : ''"
        :tableheadRowClass="filesData.length < 6 ? 'tbody_visible-overflow' : ''"
        bodyRowClass="steps-table-row"
      )
        template(slot="headerFileName" slot-scope="{ field }")
          span.step-files__label {{ field.label }}
        template(slot="headerCategory" slot-scope="{ field }")
          span.step-files__label {{ field.label }}
        template(slot="headerIcon" slot-scope="{ field }")
          span.step-files__label {{ field.label }}

        template(slot="fileName" slot-scope="{ row, index }")
          span.step-files__data {{ row.name }}
        template(slot="category" slot-scope="{ row, index }")
          span.step-files__data {{ row.category }}
        template(slot="icon" slot-scope="{ row, index }")
          .step-files__icons
            span.step-files__data.step-files__dataIcon(v-if="!!row.path" @click="downloadFile(row.path)")
              img(src="../../../../assets/images/latest-version/download-file.png" )
            span.step-files__data.step-files__dataIcon(@click="removeFile(row)")
              img(src="../../../../assets/images/Other/delete-icon-qa-form.png")

    .tasks-files__tableAdd(id="add")
      Add(@add="openVaultModal")

    .tasks-files__vault(v-if="isVaultModal" id="modal")
      .tasks-files__title Client's Vault
      .tasks-files__items
        span.tasks-files__close(@click="closeVaultModal") &#215;
        DataTable(
          :fields="fields2"
          :tableData="filesVaultAll"
          :bodyClass="filesVaultAll.length < 6 ? 'tbody_visible-overflow' : ''"
          :tableheadRowClass="filesVaultAll.length < 6 ? 'tbody_visible-overflow' : ''"
          bodyRowClass="cursor-default"
        )
          .vault-table__header.vault-table__check-cell(slot="headerCheck" slot-scope="{ field }")
            CheckBox(:isChecked="isAllChecked" :isWhite="true" @check="(e)=>toggleAll(e, true)" @uncheck="(e)=>toggleAll(e, false)" customClass="tasks-n-steps")
          .vault-table__header(slot="headerFileName" slot-scope="{ field }") {{ field.label }}
          .vault-table__header(slot="headerCategory" slot-scope="{ field }") {{ field.label }}

          .vault-table__data.vault-table__check-cell(slot="check" slot-scope="{ row, index }")
            CheckBox(:isChecked="row.isCheck" @check="(e)=>toggle(e, index, true)" @uncheck="(e)=>toggle(e, index, false)" customClass="tasks-n-steps")

          template(slot="fileName" slot-scope="{ row, index }")
            span.step-files__data {{ row.filename }}
          template(slot="category" slot-scope="{ row, index }")
            span.step-files__data {{ row.category }}

      .tasks-files__items
        .tasks-files__button
          Button(@clicked="addFileToAllTypes" value="Add")

      .tasks-files__browse
        Button(@clicked="openUploadModal()" value="Browse my computer" :color="'#938676'")

    .tasks-files__main(v-if="isUploadModal" id="modal2")
      .tasks-files__items
        span.tasks-files__close(@click="closeUploadModal") &#215;
        .tasks-files__item
          span Source file:
          span.tasks-files__label-red
          .tasks-files__upload-file
            FilesUpload(
              buttonValue="Source Files"
              inputClass="files-upload__source-file"
              :files="sourceFiles"
              @uploadFiles="uploadSourceFiles"
            )
        .tasks-files__item
          span Reference file:
          span.tasks-files__label-red
          .tasks-files__upload-file
            FilesUpload(
              buttonValue="Reference Files"
              inputClass="files-upload__ref-file"
              :files="refFiles"
              @uploadFiles="uploadRefFiles"
            )
      .tasks-files__tooltip
        div Source: each file can be <= 2Mb for Translation service, other can be <= 50Mb
        div Reference: each file can be <= 50Mb

    ValidationErrors(
      v-if="showFileSizeWarning"
      :errors="warnings"
      :isAbsolute="true"
      @closeErrors="closeErrors"
    )

</template>

<script>

	import ValidationErrors from '../../../ValidationErrors'
	import { mapActions } from 'vuex'
	import DataTable from "../../../DataTable"
	import Add from "../../../Add"
	import FilesUpload from "../../tasks-n-steps/tasksFiles/FilesUpload"
	import Button from "../../../Button"
	import CheckBox from "../../../CheckBox"

	export default {
		props: {
			currentTaskIdForUpdate: {
				type: String
			},
			tasksData: {
				type: Object
			},
			currentProject: {
				type: Object
			}
		},
		data() {
			return {
				fields: [
					{ label: "File Name", headerKey: "headerFileName", key: "fileName", width: "60%", padding: 0 },
					{ label: "Category", headerKey: "headerCategory", key: "category", width: "30%", padding: 0 },
					{ label: "", headerKey: "headerIcon", key: "icon", width: "10%", padding: 0, cellClass: "step-files_centered" }
				],
				fields2: [
					{ label: "", headerKey: "headerCheck", key: "check", width: "5%", padding: 0 },
					{ label: "File Name", headerKey: "headerFileName", key: "fileName", width: "65%", padding: 0 },
					{ label: "Category", headerKey: "headerCategory", key: "category", width: "30%", padding: 0 }
				],

				filesVaultAll: [],

				sourceFilesFromDB: [],
				refFilesFromDB: [],

				sourceFiles: [],
				refFiles: [],
				sourceFilesVault: [],
				refFilesVault: [],

				isSourceFilesShow: false,
				isRefFilesShow: false,
				forbiddenExtensions: [
					'webm', 'mpg', 'mp2', 'mpeg', 'mpe', 'mpv', 'ogg', 'mp4', 'm4p',
					'm4v', 'avi', 'wmv', 'mov', 'qt', 'flv', 'swf', 'avchd', 'jpeg',
					'png', 'gif', 'bmp', 'tiff', 'ppm', 'pgm', 'jpg', 'svg', 'bat',
					'mp3', 'aac', '3gp', 'aa', 'aax', 'aiff', 'alac', 'm4p', 'mpc'
				],
				showFileSizeWarning: false,
				warnings: [ 'File is too big. The max size of a file cannot exceed 2 MB' ],
				isUploadModal: false,
				isVaultModal: false
			}
		},
		mounted() {
			this.setFiles()
		},
		methods: {
			...mapActions({
				setDataValue: "setTasksDataValueRequest",
				setCurrentClientRequest: "setCurrentClientRequest",
				alertToggle: "alertToggle"
			}),
			downloadFile(path) {
				let link = document.createElement('a')
				link.href = __WEBPACK__API_URL__ + path
				link.target = "_blank"
				link.click()
			},
			setFiles() {
				this.filesVaultAll = [
					...this.currentProject.requestForm.sourceFiles.map(item => ({ ...item, category: 'Source', isCheck: false })),
					...this.currentProject.requestForm.refFiles.map(item => ({ ...item, category: 'Reference', isCheck: false }))
				]
				if (this.currentTaskIdForUpdate) {
					const { sourceFiles, refFiles } = this.currentProject.tasksAndSteps.find(item => item.taskId === this.currentTaskIdForUpdate)
					this.sourceFilesFromDB = sourceFiles.map(item => ({ ...item, fromDB: true }))
					this.refFilesFromDB = refFiles.map(item => ({ ...item, fromDB: true }))
				}
			},
			addFileToAllTypes() {
				const mappedFilesVault = [ ...this.sourceFilesVault.map(item => item.filename), ...this.refFilesVault.map(item => item.filename) ]

				this.sourceFilesVault.push(
						...this.filesVaultAll
								.filter(item => item.isCheck && item.category === 'Source' && !mappedFilesVault.includes(item.filename))
				)
				this.refFilesVault.push(
						...this.filesVaultAll
								.filter(item => item.isCheck && item.category === 'Reference' && !mappedFilesVault.includes(item.filename))
				)
				this.setDataValue({ prop: "sourceFilesVault", value: this.sourceFilesVault })
				this.setDataValue({ prop: "refFilesVault", value: this.refFilesVault })
				this.toggleAll(1, false)
			},
			toggleAll(e, bool) {
				this.filesVaultAll = this.filesVaultAll.map(item => {
					return { ...item, isCheck: bool }
				})
			},
			toggle(e, index, bool) {
				this.filesVaultAll[index].isCheck = bool
			},
			async removeFile({ name, category, path, fromDB }) {
				if (fromDB) {
					try {
						const updatedProject = await this.$http.post('/pm-manage/remove-request-file', {
							_id: this.currentProject._id,
							taskId: this.currentTaskIdForUpdate,
							category,
							path
						})
						await this.setCurrentClientRequest(updatedProject.data)
						this.setFiles()
						this.alertToggle({ message: 'File deleted!', isShow: true, type: "success" })
					} catch (err) {
						this.alertToggle({ message: 'Files error', isShow: true, type: "error" })
					}
					return
				}
				if (!path) {
					if (category === 'Source') {
						this.deleteFile({ index: this.sourceFiles.findIndex(item => item.name === name) }, 'sourceFiles')
					} else if (category === 'Reference') {
						this.deleteFile({ index: this.refFiles.findIndex(item => item.name === name) }, 'refFiles')
					}
				} else {
					if (category === 'Source') {
						this.sourceFilesVault.splice(this.sourceFilesVault.findIndex(item => item.filename === name), 1)
						this.setDataValue({ prop: "sourceFilesVault", value: this.sourceFilesVault })
					} else if (category === 'Reference') {
						this.refFilesVault.splice(this.refFilesVault.findIndex(item => item.filename === name), 1)
						this.setDataValue({ prop: "refFilesVault", value: this.refFilesVault })
					}
				}
			},
			closeUploadModal() {
				this.isUploadModal = false
			},
			openUploadModal() {
				this.closeVaultModal()
				this.isUploadModal = true
			},
			openVaultModal() {
				this.isVaultModal = true
				this.isUploadModal = false
			},
			closeVaultModal() {
				this.isVaultModal = false
				this.toggleAll(1, false)
			},
			checkFilesSource(files) {
				const sizesSum = files.reduce((acc, cur) => acc + cur.size, 0)
				return sizesSum / 1000000 <= 10
			},
			uploadSourceFiles({ files }) {
				const filesBiggerThan2MB = Array.from(files).filter(item => item.size / 1000000 > 2)
				if (filesBiggerThan2MB.length && this.currentProject.requestForm.service.title === 'Translation') {
					this.showFileSizeWarning = true
				}
				const filteredFiles = Array.from(files).filter(item => {
					const { size, name } = item
					const extension = name.split('.').pop()
					if (this.currentProject.requestForm.service.title === 'Compliance') {
						return size / 1000000 <= 50
					} else {
						return size / 1000000 <= 2
					}
					// return size / 1000000 <= 2 && this.forbiddenExtensions.indexOf(extension) === -1
				})
				if (filteredFiles.length && this.checkFilesSource(filteredFiles)) {
					for (let file of filteredFiles) {
						const isExist = this.sourceFiles.find(item => item.name === file.name)
						if (!isExist) {
							this.sourceFiles.push(file)
						}
					}
				}
				if (!filteredFiles.length) {
					this.clearInputFiles(".files-upload__source-file")
					return
				}
				this.setDataValue({ prop: "sourceFiles", value: this.sourceFiles })
			},
			uploadRefFiles({ files }) {
				const filesBiggerThan2MB = Array.from(files).filter(item => item.size / 1000000 > 50)
				if (filesBiggerThan2MB.length) {
					this.showFileSizeWarning = true
				}
				const filteredFiles = Array.from(files).filter(item => {
					return item.size / 1000000 <= 50
				})
				if (filteredFiles.length) {
					for (let file of files) {
						const isExist = this.refFiles.find(item => item.name === file.name)
						if (!isExist) {
							this.refFiles.push(file)
						}
					}
				}
				if (!filteredFiles.length) {
					this.clearInputFiles(".files-upload__ref-file")
					return
				}
				this.setDataValue({ prop: "refFiles", value: this.refFiles })
			},
			deleteFile({ index }, prop) {
				this[prop].splice(index, 1)
				this.setDataValue({ prop, value: this[prop] })
				if (!this[prop].length) {
					if (prop === "sourceFiles") {
						this.isSourceFilesShow = false
						return this.clearInputFiles(".files-upload__source-file")
					}
					this.isRefFilesShow = false
					return this.clearInputFiles(".files-upload__ref-file")
				}
			},
			clearInputFiles(str) {
				let inputFiles = document.querySelectorAll(str)
				for (let elem of inputFiles) {
					elem.value = ''
				}
			},
			toggleSourceFiles() {
				this.isSourceFilesShow = !this.isSourceFilesShow
			},
			toggleRefFiles() {
				this.isRefFilesShow = !this.isRefFilesShow
			},
			closeErrors() {
				this.showFileSizeWarning = false
			}
		},
		components: {
			CheckBox,
			Button,
			FilesUpload,
			Add,
			DataTable,
			ValidationErrors
		},
		computed: {
			filesData() {
				let filesArr = []
				if (this.currentTaskIdForUpdate) {
					this.sourceFilesFromDB.forEach(elem => filesArr.push({ name: elem.filename, category: 'Source', path: elem.path, fromDB: elem.fromDB }))
					this.refFilesFromDB.forEach(elem => filesArr.push({ name: elem.filename, category: 'Reference', path: elem.path, fromDB: elem.fromDB }))
				}
				this.sourceFiles.forEach(elem => filesArr.push({ name: elem.name, category: 'Source' }))
				this.sourceFilesVault.forEach(elem => filesArr.push({ name: elem.filename, category: 'Source', path: elem.path }))
				this.refFiles.forEach(elem => filesArr.push({ name: elem.name, category: 'Reference' }))
				this.refFilesVault.forEach(elem => filesArr.push({ name: elem.filename, category: 'Reference', path: elem.path }))
				return filesArr
			},
			isAllChecked() {
				return !this.filesVaultAll.find(item => !item.isCheck)
			}
			// isWordcount() {
			// 	return this.tasksData.stepsAndUnits
			// 			? this.tasksData.stepsAndUnits
			// 					.map(item => item.unit)
			// 					.includes("CAT Wordcount")
			// 			: false
			// }
		}
	}
</script>

<style lang="scss" scoped>

  .vault-table {
    &__check-cell {
      display: flex;
      justify-content: center;
      padding-left: 0;
    }

    &__data {
      box-sizing: border-box;
      display: grid;
      align-items: center;
      height: 30px;
      padding: 6px 5px;
    }
  }

  .step-files {
    &__icons {
      display: flex;
      justify-content: center;
      gap: 10px;
    }

    &__data {
      display: flex;
      align-items: center;
      padding-left: 5px;
      height: 30px;
    }

    &__dataIcon {
      cursor: pointer;
    }
  }

  .tasks-files {
    position: relative;

    &__title {
      font-size: 18px;
      margin-bottom: 20px;
    }

    &__button {
      margin-bottom: 20px;
      display: flex;
      justify-content: center;
    }

    &__browse {
      border-top: 1px solid #c5bfb5;
      padding-top: 20px;
    }

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

    &__vault {
      padding: 20px 20px 20px 20px;
      box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
      position: absolute;
      z-index: 777;
      background: white;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 600px;
    }

    &__main {
      padding: 30px 20px 20px 20px;
      box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
      position: absolute;
      z-index: 999;
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

</style>
