<template lang="pug">
  .review
    span.review__close(@click="close") &#215;
    .review__approve(v-if="isApproveModal")
      ApproveModal(
        text="Pay attention! Before you finish the task, check carefully all the files sent to Deliverables section (if it is necessary). After completing the task, file management will not be available."
        approveValue="Complete"
        notApproveValue="Cancel"
        @approve="changeStatus"
        @notApprove="closeApproveModal"
        @close="closeApproveModal"
      )

    .review__title Delivery Review 1
    span.relative
      DropsDR1(
        :project="project"
        :user="user"
        :dr1Manager="users.find(({_id}) => `${_id}` === `${deliveryTask.dr1Manager}`)"
        :dr2Manager="users.find(({_id}) => `${_id}` === `${deliveryTask.dr2Manager}`)"
        :deliveryTask="deliveryTask"
        @assignManager="assignManager"
      )

    span.relative
    .review__wrapper
      .review__wrapper-hide(v-if="!canUpdateDR1")

      .review__check
        .review__headers
          .review__headers-item Check
          .review__headers-item Not Relevant
        .review__checkTitle(v-for="(group, index) in  Object.keys(groupedInstructions)")
          .review__checkSubTitle(:class="{marginTop: !!index}") {{ group }}
          .review__check-item(v-for="instruction in groupedInstructions[group]")
            .review__check-itemText
              span.icon-start-line
                i.fa.fa-angle-double-right(aria-hidden='true')
              span {{ instruction.text }}
            .review__check-itemCheck
              Check(
                @toggleApproval="toggleList"
                :instruction="instruction"
                :isApproved="instruction.isChecked"
                :type="'isChecked'"
                :isDisabled="!!requestCounter.length"
              )
            .review__check-itemCheck
              Check(
                @toggleApproval="toggleList"
                :instruction="instruction"
                :isApproved="instruction.isNotRelevant"
                :type="'isNotRelevant'"
                :isDisabled="!!requestCounter.length"
              )
        .review__checkTitle
          .review__checkSubTitle(:class="{marginTop: true}") Comments
          .review__notes
            ckeditor(v-model="deliveryTask.comment" :config="editorConfig")
            .notes__button( @click="sendMessage") Save Comment &nbsp;
              i.fa.fa-paper-plane(aria-hidden='true')

      .review__table
        TableDR1(
          :task="task"
          :files="files"
          @approveFile="approveFile"
          @approveFiles="approveFiles"
          @uploadFile="uploadFile"
          @checkAll="checkAllFiles"
          @checkFile="checkFile"
          @removeFile="removeFile"
          @deliverFile="deliverFile"
          @generateDeliverable="generateDeliverable"
        )
      .review__button-complete(v-if="canCompleteTask")
        Button(
          value="Complete Task"
          @clicked="openApproveModal"
        )
</template>

<script>
	import CKEditor from "ckeditor4-vue"
	import { mapGetters, mapActions } from "vuex"
	import Check from "../review/Check"
	import _ from "lodash"
	import editorConfig from "../../../mixins/editorConfig"
	import DropsDR1 from "../review/DropsDR1"
	import TableDR1 from "../review/TableDR1"
	import Button from "@/components/Button"
	import ApproveModal from "../../ApproveModal"

	const CheckBox = () => import("@/components/CheckBox")
	const RollbackModal = () => import("../review/RollbackModal")

	export default {
		mixins: [ editorConfig ],
		props: {
			task: { type: Object },
			user: { type: Object },
			users: { type: Array },
			project: { type: Object },
			deliveryTask: { type: Object }
		},
		data() {
			return {
				editorData: "",
				areFilesChecked: false,
				areFilesConverted: false,
				areOptions: true,
				isNotify: false,
				isReadyForDelivery: false,
				isAssign: true,
				files: [],
				timestamp: "",
				instructions: [],
				isReviewing: false,
				isModal: false,
				rollbackManager: null,
				isApproveModal: false
			}
		},
		beforeDestroy() {
			this.setShowTasksAndDeliverables(true)
		},
		methods: {
			...mapActions([
				"approveInstruction",
				"changeReviewManager",
				"alertToggle",
				"setCurrentProject",
				"setShowTasksAndDeliverables"
			]),
			openApproveModal() {
				this.isApproveModal = true
			},
			closeApproveModal() {
				this.isApproveModal = false
			},
			async removeFile(file) {
				if (!this.canUpdateDR1) return
				try {
					const updatedProject = await this.$http.post("/delivery/remove-dr-file", { ...file, projectId: this.project._id })
					await this.setCurrentProject(updatedProject.data)
					await this.updatedFiles(updatedProject)
					this.alertToggle({ message: "File removed!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Error on remove DR1 Files", isShow: true, type: "error" })
				}
			},
			async sendMessage() {
				if (!this.canUpdateDR1) return
				try {
					const updatedProject = await this.$http.post('/delivery/delivery-comments', {
						projectId: this.project._id,
						taskId: this.deliveryTask.taskId,
						comment: this.deliveryTask.comment
					})
					await this.setCurrentProject(updatedProject.data)
					this.alertToggle({ message: "Comment updated!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Comment not updated!", isShow: true, type: "error" })
				}
			},
			close() {
				this.$emit("close")
			},
			async toggleList({ type, instruction }) {
				if (!this.canUpdateDR1) return
				const types = [ 'isChecked', 'isNotRelevant' ]
				const anotherType = types.filter(item => item !== type)
				instruction[type] = !instruction[type]
				instruction[anotherType] = !instruction[type]
				await this.approveInstruction({
					projectId: this.project._id,
					taskId: this.task.taskId,
					instruction
				})
			},
			checkAllFiles({ bool }) {
				this.files = this.files.map(item => ({ ...item, isChecked: bool }))
			},
			checkFile({ index, bool }) {
				this.files[index].isChecked = bool
			},
			async updatedFiles(updatedProject) {
				if (!this.canUpdateDR1) return
				const deliveryTask = updatedProject.data.tasksDR1.find(item => item.taskId === this.deliveryTask.taskId)
				this.files = deliveryTask.files
						.map(item => ({ ...item, taskId: this.task.taskId, pair: `${ this.task.sourceLanguage } >> ${ this.task.targetLanguage }`, isChecked: false }))
			},
			async uploadFile({ file, index }) {
				if (!this.canUpdateDR1) return
				const { path } = index !== undefined ? this.files[index] : { path: "", isOriginal: false }
				const fileData = new FormData()
				fileData.append("targetFile", file)
				fileData.append("projectId", this.project._id)
				fileData.append("path", path)
				fileData.append("taskId", this.task.taskId)
				try {
					const updatedProject = await this.$http.post("/delivery/target", fileData)
					await this.setCurrentProject(updatedProject.data)
					await this.updatedFiles(updatedProject)
				} catch (err) {
				}
			},
			async deliverFile(index) {
				if (!this.canUpdateDR1) return
				const projectId = this.project._id
				this.files[index].isFilePushedDR2 = !this.files[index].isFilePushedDR2
				const { dr1Manager, dr2Manager, taskId } = this.deliveryTask
				const { path, isFilePushedDR2 } = this.files[index]
				const { sourceLanguage, targetLanguage } = this.task
				try {
					if (isFilePushedDR2) {
						await this.$http.post('/delivery/file-dr2-push', { projectId, taskId, dr1Manager, dr2Manager, files: [ this.files[index] ] })
					} else {
						await this.$http.post('/delivery/file-dr2-pull', { projectId, taskId, path, sourceLanguage, targetLanguage })
					}
					const updatedProject = await this.$http.post('/delivery/is-file-pushed-dr2', { projectId, taskId, isFilePushedDR2, paths: [ path ] })
					await this.setCurrentProject(updatedProject.data)
				} catch (err) {
				}
			},
			async generateDeliverable({ checked }) {
				if (!this.canUpdateDR1) return
				const files = checked.filter(item => !item.isFilePushedDR2)
				const { dr1Manager, dr2Manager, taskId } = this.deliveryTask

				if (files.length) {
					const paths = files.map(item => item.path)
					await this.$http.post('/delivery/file-dr2-push', { projectId: this.project._id, taskId, dr1Manager, dr2Manager, files })
					await this.$http.post('/delivery/is-file-pushed-dr2', { projectId: this.project._id, taskId, isFilePushedDR2: true, paths })
					const updatedProject = await this.$http.post("/delivery/approve-files", { projectId: this.project._id, taskId: this.task.taskId, isFileApproved: true, paths })
					await this.setCurrentProject(updatedProject.data)
					await this.updatedFiles(updatedProject)
				}
			},
			async changeStatus() {

				if (!this.canUpdateDR1) return
				try {
					const updatedProject = await this.$http.post("/delivery/change-task-status", { projectId: this.project._id, taskId: this.deliveryTask.taskId })
					await this.setCurrentProject(updatedProject.data)
					await this.updatedFiles(updatedProject)
					this.closeApproveModal()
					this.close()
				} catch (err) {
				}
			},
			async approveFile({ index }) {
				if (!this.canUpdateDR1) return
				this.files[index].isFileApproved = !this.files[index].isFileApproved
				const { taskId, isFileApproved, path } = this.files[index]
				try {
					const updatedProject = await this.$http.post("/delivery/approve-files", { projectId: this.project._id, taskId, isFileApproved, paths: [ path ] })
					await this.setCurrentProject(updatedProject.data)
					await this.updatedFiles(updatedProject)
				} catch (err) {
				}
			},
			async approveFiles({ checked }) {
				if (!this.canUpdateDR1) return
				const paths = checked.map(item => item.path)
				try {
					const updatedProject = await this.$http.post("/delivery/approve-files", { projectId: this.project._id, taskId: this.task.taskId, isFileApproved: true, paths })
					await this.setCurrentProject(updatedProject.data)
					await this.updatedFiles(updatedProject)
				} catch (err) {
				}
			},
			async assignManager({ manager, prop }) {
				const { dr1Manager, dr2Manager } = this.deliveryTask
				if (prop === 'dr1Manager') {
					if (manager._id === dr1Manager) return
				} else {
					if (manager._id === dr2Manager) return
				}
				await this.changeReviewManager({
					manager,
					prop,
					projectId: this.project._id,
					taskId: this.task.taskId,
					isAdmin: this.isAdmin,
					status: 'dr1'
				})
			}
		},
		computed: {
			...mapGetters({
				requestCounter: 'getRequestCounter'
			}),
			groupedInstructions() {
				return _.groupBy(this.deliveryTask.instructions, 'title')
			},
			canCompleteTask() {
				return this.deliveryTask.instructions.every(({ isChecked, isNotRelevant }) => isChecked || isNotRelevant)
						&& this.deliveryTask.files.every(({ isFileApproved }) => isFileApproved)
			},
			dr() {
				return this.task.status === "Pending Approval [DR1]" ? 1 : 2
			},
			isAdmin() {
				return this.user.group.name === "Administrators" || this.user.group.name === "Developers"
			},
			canUpdateDR1() {
				if (!this.deliveryTask) return false
				return this.isAdmin
						|| this.user._id.toString() === this.deliveryTask.dr1Manager.toString()
			}
		},
		components: {
			ApproveModal,
			TableDR1,
			DropsDR1,
			Check,
			CheckBox,
			Button,
			RollbackModal,
			ckeditor: CKEditor.component
		},
		mounted() {
			this.files = this.deliveryTask.files
					.map(item => ({ ...item, taskId: this.task.taskId, pair: `${ this.task.sourceLanguage } >> ${ this.task.targetLanguage }`, isChecked: false }))
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .dr1Comment {
    &__title {
      border-bottom: 1px solid $border;
      font-family: Myriad600;
      width: 80%;
      margin-bottom: 12px;
      padding-bottom: 4px;
    }

    &__textareaText {
      padding-left: 10px;
      overflow-y: auto;
      min-height: 50px;
      max-height: 100px;
      border: none;
      outline: none;
      width: auto;
      background: transparent;
      resize: none;
    }

    &__textarea {
      border: 2px solid #c5bfb5;
      border-radius: 4px;
      width: 100%;
      heigth: 60px;
    }
  }

  .review {
    display: flex;
    flex-direction: column;
    padding: 20px;
    box-sizing: border-box;
    box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
    background-color: $white;
    position: relative;
    width: 1000px;
    border-radius: 4px;


    &__button-certificate {
      position: absolute;
      margin-top: 20px;
      left: 0;
      z-index: 10;
    }

    &__wrapper {
      position: relative;
    }

    &__approve {
      position: absolute;
      z-index: 10;
      transform: translate(-50%, 0);
      left: 50%;
      bottom: 20%;
    }

    &__wrapper-hide {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: rgba(0, 0, 0, .1);
      z-index: 10;
    }

    &__checkSubTitle {
      border-bottom: 1px solid $border;
      font-family: Myriad600;
      width: 80%;
      margin-bottom: 12px;
      padding-bottom: 4px;
    }


    &__title {
      font-size: 21px;
      margin-bottom: 20px;
      font-family: 'Myriad600';
    }

    &__close {
      position: absolute;
      top: 10px;
      right: 15px;
      font-size: 22px;
      cursor: pointer;
      height: 22px;
      width: 22px;
      justify-content: center;
      display: flex;
      align-items: center;
      font-family: Myriad900;
      opacity: 0.8;
      transition: ease 0.1s;

      &:hover {
        opacity: 1
      }
    }

    &__check, &__table {
      position: relative;
    }

    &__table {
      margin-top: 20px;
    }

    &__check-item {
      display: flex;
      padding: 6px 0;

      &:nth-child(even) {
        background-color: $table-list;
      }
    }

    &__headers {
      display: flex;
      justify-content: flex-end;
      margin-bottom: -15px;

      &-item {
        width: 10%;
        display: flex;
        justify-content: center;
        font-family: 'Myriad600';
      }
    }

    &__check-itemText {
      width: 80%;
    }

    &__check-itemCheck {
      width: 10%;
      justify-content: center;
      display: flex;
    }

    &__options {
      align-self: center;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }

    &__options-check {
      position: absolute;
      left: 0;
    }

    &__buttons {
      display: flex;
      justify-content: center;
      position: relative;
      padding-top: 20px;
    }

    &__button {
      margin: 0 10px;
      position: relative;
    }

    &__button-complete {
      display: flex;
      justify-content: center;
      padding-top: 10px;
    }

    &_left-align {
      font-size: 20px;
      text-align: left;
      border-bottom: 1px solid $border;
      padding-bottom: 3px;
    }

    &__modal {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }

    &__forbidden {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 999;
      background-color: rgba(0, 0, 0, 0.2);
      cursor: not-allowed;
    }
  }

  .split-line {
    background-color: #ffffff;
    margin: 19px 0;
    padding: 1px;
    position: relative;
  }

  .relative {
    position: relative
  }

  .icon-start-line {
    margin-right: 10px;
    color: #666;
  }

  .marginTop {
    margin-top: 20px;
  }

  .notes {
    &__button {
      position: absolute;
      left: 82%;
      bottom: 45px;
      width: 140px;
      height: 30px;
      border-radius: 4px;
      font-size: 14px;
      background-color: #fff;
      outline: none;
      transition: .2s ease-out;
      text-align: center;
      line-height: 30px;
      letter-spacing: .2px;
      border: 1px solid $border;

      &:active {
        transform: scale(.98);
      }

      &:hover {
        cursor: pointer;
        border: 1px solid $border-focus;
      }
    }
  }
</style>
