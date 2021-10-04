<template lang="pug">
  .tasks-files
    .table
      GeneralTable(
        :fields="fields"
        :tableData="filesData"
      )
        template(slot="headerFileName" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerCategory" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerIcon" slot-scope="{ field }")
          .table__header {{ field.label }}

        template(slot="fileName" slot-scope="{ row, index }")
          .table__data {{ row.name }}
        template(slot="category" slot-scope="{ row, index }")
          .table__data {{ row.category }}
        template(slot="icon" slot-scope="{ row, index }")
          .table__icons
            .table__icon(@click="removeFile(row.name, row.category)")
              img(src="../../../assets/images/Other/delete-icon-qa-form.png")

    .tasks-files__tableAdd(id="add")
      Add(@add="openUploadModal")

    .tasks-files__main(v-if="isUploadModal" id="modal")
      .tasks-files__items
        span.tasks-files__close(@click="closeUploadModal") &#215;
        .tasks-files__item(v-if="isWordcount")
          span Source file:
          span.tasks-files__label-red *
          .tasks-files__upload-file
            FilesUpload(
              buttonValue="Source Files *"
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
              buttonValue="Reference Files"
              inputClass="files-upload__ref-file"
              :files="refFiles"
              @uploadFiles="uploadRefFiles"
              @deleteFile="(e) => deleteFile(e, 'refFiles')"
            )
      .tasks-files__tooltip
        div Source: total size must be <= 10Mb, each file can be <= 3Mb
        div Reference: each file can be <= 50Mb

    ValidationErrors(
      v-if="showFileSizeWarning"
      :errors="warnings"
      :isAbsolute="true"
      @closeErrors="closeErrors"
    )

</template>

<script>
	import FilesUpload from './tasksFiles/FilesUpload'
	import ValidationErrors from '../../ValidationErrors'
	import { mapActions } from 'vuex'
	import DataTable from "../../DataTable"
	import Add from "../../Add"
	import GeneralTable from "../../GeneralTable"

	export default {
		props: {
			tasksData: {
				type: Object
			}
		},
		data() {
			return {
				fields: [
					{ label: "File Name", headerKey: "headerFileName", key: "fileName", style: { width: "60%" } },
					{ label: "Category", headerKey: "headerCategory", key: "category", style: { width: "30%" } },
					{ label: "", headerKey: "headerIcon", key: "icon", style: { width: "10%" } }
				],
				sourceFiles: [],
				refFiles: [],
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
				isUploadModal: false
			}
		},
		methods: {
			...mapActions({
				setDataValue: "setTasksDataValue"
			}),
			removeFile(name, category) {
				let idx = -1
				let props = ''
				if (category === 'Source file') {
					idx = this.sourceFiles.findIndex(item => item.name === name)
					props = 'sourceFiles'
				} else {
					idx = this.refFiles.findIndex(item => item.name === name)
					props = 'refFiles'
				}
				this.deleteFile({ index: idx }, props)
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
			checkFilesSource(files) {
				const sizesSum = files.reduce((acc, cur) => acc + cur.size, 0)
				return sizesSum / 1000000 <= 10
			},
			uploadSourceFiles({ files }) {
				const filesBiggerThan2MB = Array.from(files).filter(item => item.size / 1000000 > 2)
				if (filesBiggerThan2MB.length) {
					this.showFileSizeWarning = true
				}
				const filteredFiles = Array.from(files).filter(item => {
					const { size, name } = item
					const extension = name.split('.').pop()
					return size / 1000000 <= 3 && this.forbiddenExtensions.indexOf(extension) === -1
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
				}
				this.setDataValue({ prop: "sourceFiles", value: this.sourceFiles })
				this.closeUploadModal()
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
				}
				this.setDataValue({ prop: "refFiles", value: this.refFiles })
				this.closeUploadModal()
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
			GeneralTable,
			Add,
			DataTable,
			FilesUpload,
			ValidationErrors
		},
		computed: {
			filesData() {
				let tableData = []
				this.sourceFiles.forEach(elem => tableData.push({ name: elem.name, category: 'Source file' }))
				this.refFiles.forEach(elem => tableData.push({ name: elem.name, category: 'Reference file' }))
				return tableData
			},
			isWordcount() {
				return this.tasksData.stepsAndUnits
						? this.tasksData.stepsAndUnits
								.map(item => item.unit)
								.includes("CAT Wordcount")
						: false
			}
		}
	}
</script>

<style lang="scss" scoped>

  .table {
    &__header,
    &__data {
      padding: 0 7px;
    }

    &__icons {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      width: 100%;
      height: 40px;
    }

    &__icon {
      cursor: pointer;
    }
  }

  .step-files {
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

</style>
