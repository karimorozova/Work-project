<template lang="pug">
  .review-table
    .review-table__approveModal(v-if="approveModalShow")
      ApproveModal(
        text="Are you sure?"
        approveValue="Yes"
        notApproveValue="No"
        @approve="approveModal"
        @close="closeModal"
        @notApprove="closeModal"
      )

    //.review-table__actions
      //.review-table__action(v-if="task.service.title === 'Compliance'")
        Button(value="Add Certificate" @clicked="generateCertificate")
    .review-table__action
      SelectSingle(
        placeholder="Select action"
        :options="actions"
        :selectedOption="selectedAction"
        @chooseOption="makeActions"
      )
    DataTable(
      :fields="fields"
      :tableData="files"
      :bodyClass="['review-body', {'tbody_visible-overflow': files.length < 12}]"
      :tableheadRowClass="files.length < 12 ? 'tbody_visible-overflow' : ''"
      :headCellClass="'padding-with-check-box'"
    )
      .review-table__header.review-table__check-cell(slot="headerCheck" slot-scope="{ field }")
        CheckBox(:isChecked="isAllChecked" :isWhite="true" @check="(e)=>toggleAll(e, true)" @uncheck="(e)=>toggleAll(e, false)" customClass="tasks-n-steps")
      .review-table__header(slot="headerName" slot-scope="{ field }") {{ field.label }}
      .review-table__header(slot="headerPair" slot-scope="{ field }") {{ field.label }}
      .review-table__header(slot="headerTask" slot-scope="{ field }") {{ field.label }}
      .review-table__header(slot="headerAction" slot-scope="{ field }") {{ field.label }}

      .review-table__data.review-table__check-cell(slot="check" slot-scope="{ row, index }")
        CheckBox(:isChecked="row.isChecked" @check="(e)=>toggle(e, index, true)" @uncheck="(e)=>toggle(e, index, false)" customClass="tasks-n-steps")

      .review-table__data(slot="name" slot-scope="{ row }")
        span.review-table__file-name {{ row.fileName }}

      .review-table__data(slot="pair" slot-scope="{ row }") {{ row.pair }}
      .review-table__data(slot="task" slot-scope="{ row }") {{ row.taskId }}
      .review-table__data(slot="action" slot-scope="{ row, index }")
        .review-table__icons
          template(v-for="(icon, key) in allIcons")
            img.review-table__icon(v-if="key !== 'upload'" :src="icon.src" :class="{'review-table_opacity-04': row.isFileApproved || key === 'delete' && isReviewing}" @click="makeOneAction(index, key)")
            .review-table__upload(v-if="key === 'upload'" :class="{'review-table_opacity-04': row.isFileApproved || isReviewing}")
              input.review-table__file-input(type="file" :disabled="row.isFileApproved || isReviewing" @change="(e) => uploadFile(e, index)")
          i.review-table__check-icon.fa.fa-check-circle(:class="{'review-table_green': row.isFileApproved}" @click="approveFile(index)")
          i.review-table__check-icon.fas.fa-file-export(v-if="row.isFileApproved" :class="{'review-table_green': row.isFilePushedDR2}" @click="deliverFile(index)")


    .review-table__upload.review-table_no-back
      input.review-table__file-inputButton(type="file" @change="uploadFile" :disabled="isReviewing")
      Add
</template>

<script>
	import DataTable from "@/components/DataTable"
	import SelectSingle from "@/components/SelectSingle"
	import CheckBox from "@/components/CheckBox"
	import Add from "@/components/Add"
	import { mapActions } from "vuex"
	import ApproveModal from "../../ApproveModal"
	import Button from "../../Button"

	export default {
		props: {
			task: { type: Object },
			files: { type: Array },
		},
		data() {
			return {
				fields: [
					{ label: "", headerKey: "headerCheck", key: "check", width: "3.5%", padding: 0 },
					{ label: "File Name", headerKey: "headerName", key: "name", width: "36.5%", padding: 0 },
					{ label: "Task ID", headerKey: "headerTask", key: "task", width: "25%", padding: 0 },
					{ label: "Language pair", headerKey: "headerPair", key: "pair", width: "20%", padding: 0 },
					{ label: "Action", headerKey: "headerAction", key: "action", width: "15%", padding: 0 }
				],
				icons: {
					download: { src: require("../../../assets/images/latest-version/download-file.png") },
					upload: { src: require("../../../assets/images/latest-version/upload-file.png") },
					delete: { src: require("../../../assets/images/latest-version/delete-icon.png") }
				},
				selectedAction: "",
				actions: [ "Approve", "Generate Deliverable", "Download" ],
				deleteIndex: null,
				approveModalShow: false
			}
		},
		methods: {
			approveFile(index) {
				this.$emit('approveFile', { index })
			},
      deliverFile(index){
        this.$emit('deliverFile', index)
      },
			// generateCertificate() {
			// 	this.$emit('generateCertificate')
			// },
			async makeOneAction(index, key) {
				const file = this.files[index]
				if (file.isFileApproved) return
				if (key === 'download') {
					return this.createLinkAndDownload(file.path)
				}
				if (key === 'delete') {
					if (this.isReviewing) return
					this.deleteIndex = index
					this.approveModalShow = true
				}
			},
			async makeActions({ option }) {
				const checked = this.files.filter(item => item.isChecked)
				if (!checked.length) return
				if (option === 'Download') {
					for (let file of checked) {
						this.createLinkAndDownload(file.path)
					}
				}
				if (option === 'Approve') {
					this.$emit('approveFiles', { checked })
				}else if(option === 'Generate Deliverable'){
          this.$emit('generateDeliverable', { checked })
        }
			},
			async approveModal() {
				if (this.deleteIndex === null) {
					this.closeModal()
				}
				const file = this.files[this.deleteIndex]
				this.$emit("removeFile", file)
				this.closeModal()
			},
			closeModal() {
				this.approveModalShow = false
				this.deleteIndex = null
			},
			createLinkAndDownload(href) {
				let link = document.createElement('a')
				link.href = __WEBPACK__API_URL__ + href
				link.target = "_blank"
				link.click()
			},
			uploadFile(e, index) {
				const file = e.target.files[0]
				this.$emit('uploadFile', { file, index })
				e.target.value = ""
			},
			toggleAll(e, bool) {
				if (this.isReviewing) return
				this.$emit("checkAll", { bool })
			},
			toggle(e, index, bool) {
				if (this.isReviewing) return
				this.$emit("checkFile", { index, bool })
			}
		},
		computed: {
			allIcons() {
				let result = this.icons
				if (this.files.length > 1) {
					result = {
						...result,
						delete: { src: require("../../../assets/images/latest-version/delete-icon.png") }
					}
				}
				return result
			},
			isAllChecked() {
				return !this.files.find(item => !item.isChecked)
			}
		},
		components: {
			Button,
			ApproveModal,
			DataTable,
			SelectSingle,
			CheckBox,
			Add
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .review-table {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;


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
      padding-left: 6px;
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
      box-sizing: border-box;
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }

    &__icon {
      cursor: pointer;
      margin-right: 10px;
    }

    &__check-icon {
      font-size: 16px;
      color: $light-brown;
      cursor: pointer;
      transition: ease 0.1s;
      margin-right: 10px;
    }

    &__upload {
      margin-right: 10px;
      position: relative;
      background: url("../../../assets/images/latest-version/upload-file.png");
      height: 16px;
      width: 16px;

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
      width: 25px;
      height: 20px;
      border: none;
      outline: none;
      opacity: 0;
      z-index: 2;
      position: absolute;
      left: -5px;
      cursor: pointer;
      font-size: 0;
    }

    &__file-inputButton {
      padding-left: 0;
      padding-right: 0;
      width: 35px;
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

</style>
