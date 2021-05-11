<template lang="pug">
  .review
    span.review__close(@click="close") &#215;

    .review__modal(v-if="isModal")
      RollbackModal(:manager="rollbackManager" @close="closeRollback" @setRollbackManager="setRollbackManager" @rollBack="rollBack")

    .review__title Delivery Review {{ dr }}
    span.relative
      .review__forbidden(v-if="isReviewing")
      Drops(
        :isReviewing="isReviewing"
        :project="project"
        :user="user"
        :dr1Manager="dr1Manager"
        :dr2Manager="dr2Manager"
        :timestamp="timestamp"
        @assignManager="assignManager"
        @setContacts="setContacts"
      )

    span.relative
      .review_left-align {{ checklistTile }} Checklist
      .review__forbidden(v-if="isReviewing")

    .review__check
      .review__forbidden(v-if="isReviewing")
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
            )
          .review__check-itemCheck
            Check(
              @toggleApproval="toggleList"
              :instruction="instruction"
              :isApproved="instruction.isNotRelevant"
              :type="'isNotRelevant'"
            )
      .review__checkTitle
        .review__checkSubTitle(:class="{marginTop: true}") Comments
        .review__notes
          ckeditor(v-model="editorData" :config="editorConfig")
          .notes__button(@click="sendMessage") Save &nbsp;
            i.fa.fa-paper-plane(aria-hidden='true')

    .review__dr1Comment(:class="{marginTop: true}" v-if="dr === 2 && !!previousComment")
      .dr1Comment__title DR1 Comment
      .dr1Comment__textarea
        .dr1Comment__textareaText(v-html="previousComment")

    span.relative
      .split-line
      .review__forbidden(v-if="isReviewing")

    .review__table
      .review__forbidden(v-if="isReviewing")
      Table(
        :task="task"
        :isReviewing="isReviewing"
        :files="files"
        @approveFile="approveFile"
        @approveFiles="approveFiles"
        @uploadFile="uploadFile"
        @checkAll="checkAllFiles"
        @checkFile="checkFile"
        @updateDeliveryData="getDeliveryData"
        @generateCertificate="generateCertificate"
      )

    .review__options
      //.review__options-check(v-if="isAllChecked")
        //CheckBox(
        //  :isChecked="areOptions"
        //  customClass="review-options"
        //  @check="(e) => toggleOptions(e, true)"
        //  @uncheck="(e) => toggleOptions(e, false)"
        //)
      .review__forbidden(v-if="isReviewing")
      Options(
        v-if="isAllChecked"
        :isAssign="isAssign"
        :isDeliver="isDeliver"
        :isNotify="isNotify"
        :isReadyForDelivery="isReadyForDelivery"
        :isDr1="isDr1"
        @toggleOption="toggleOption"
      )

    .review__buttons(v-if="dr1Manager && dr2Manager && getUser")
      .review__button(v-if="!isDr1")
        .review__forbidden(v-if="dr1Manager._id !== getUser._id && dr2Manager._id !== getUser._id && getUser.name === 'Administrators'")
        Button(
          value="Rollback"
          @clicked="popupRollback"
        )
      .review__button(v-if="isAllChecked")
        .review__forbidden(v-if="isReviewing")
        Button(
          value="Approve Deliverable"
          @clicked="approve"
        )
</template>

<script>
	import CKEditor from "ckeditor4-vue"
	import { mapGetters, mapActions } from "vuex"
	import Drops from "../review/Drops"
	import Table from "../review/Table"
	import Check from "../review/Check"
	import _ from "lodash"
	import editorConfig from "../../../mixins/editorConfig"

	const Options = () => import("../review/Options")
	const CheckBox = () => import("@/components/CheckBox")
	const Button = () => import("@/components/Button")
	const RollbackModal = () => import("../review/RollbackModal")

	export default {
		mixins: [ editorConfig ],
		props: {
			task: { type: Object },
			user: { type: Object },
			project: { type: Object }
		},
		data() {
			return {
				editorData: "",
				areFilesChecked: false,
				areFilesConverted: false,
				areOptions: true,
				isDeliver: false,
				isNotify: false,
				isReadyForDelivery: false,
				isAssign: true,
				isDr1: true,
				files: [],
				dr1Manager: null,
				dr2Manager: null,
				contacts: [],
				timestamp: "",
				instructions: [],
				isReviewing: false,
				isModal: false,
				rollbackManager: null,
				previousComment: ''
			}
		},
		methods: {
			...mapActions([
				"approveInstruction",
				"approveDeliveryFile",
				"uploadTarget",
				"approveWithOption",
				"approveDeliverable",
				"assignDr2",
				"changeReviewManager",
				"rollBackReview",
				"alertToggle"
			]),
			async generateCertificate() {
				try {
					await this.$http.post('/pm-manage/generate-certificate', {
						project: this.project,
						task: this.task
					})
					await this.getDeliveryData()
					this.alertToggle({ message: "Certificate generated!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Certificate not generated!", isShow: true, type: "error" })
				}
			},
			async sendMessage() {
				try {
					await this.$http.post('/delivery/delivery-comments', {
						projectId: this.project._id,
						taskStatus: this.task.status === 'Pending Approval [DR2]' ? 'dr2' : 'dr1',
						comment: this.editorData
					})
					this.alertToggle({ message: "Comment updated!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Comment not updated!", isShow: true, type: "error" })
				}
			},
			close() {
				this.$emit("close")
			},
			closeRollback() {
				this.isModal = false
				this.rollbackManager = JSON.parse(JSON.stringify(this.dr1Manager))
			},
			setContacts({ contacts }) {
				this.contacts = [ ...contacts ]
			},
			toggleOption({ prop }) {
				this[prop] = true
				if (prop === 'isAssign') {
					this.isDeliver = false
					this.isReadyForDelivery = false
					this.isNotify = false
				} else if (prop === 'isDeliver') {
					this.isAssign = false
					this.isReadyForDelivery = false
					this.isNotify = false
				} else if (prop === 'isReadyForDelivery') {
					this.isAssign = false
					this.isDeliver = false
					this.isNotify = false
				} else {
					this.isAssign = false
					this.isReadyForDelivery = false
					this.isDeliver = false
				}
			},
			setRollbackManager({ manager }) {
				this.rollbackManager = manager
			},
			async toggleList({ type, instruction }) {
				const types = [ 'isChecked', 'isNotRelevant' ]
				const anotherType = types.filter(item => item !== type)
				instruction[type] = !instruction[type]
				instruction[anotherType] = !instruction[type]
				await this.approveInstruction({
					projectId: this.project._id,
					taskId: this.task.taskId,
					instruction
				})
				await this.getDeliveryData()
			},
			// toggleOptions() {
			// 	this.isAssign = this.isDr1
			// 	this.isDeliver = !this.isDr1
			// 	this.isNotify = false
			// },
			checkAllFiles({ bool }) {
				this.files = this.files.map(item => {
					return { ...item, isChecked: bool }
				})
			},
			checkFile({ index, bool }) {
				this.files[index].isChecked = bool
			},
			popupRollback() {
				this.isModal = true
			},
			async uploadFile({ file, index }) {
				await this.checkPermission()
				if (this.isReviewing) return
				const { path, isOriginal } = index !== undefined ? this.files[index] : { path: "", isOriginal: false }
				const fileData = new FormData()
				fileData.append("targetFile", file)
				fileData.append("projectId", this.project._id)
				fileData.append("path", path)
				fileData.append("taskId", this.task.taskId)
				fileData.append("isOriginal", isOriginal)
				try {
					await this.uploadTarget(fileData)
					await this.getDeliveryData()
				} catch (err) {
				}
			},
			async approveFile({ index }) {
				await this.checkPermission()
				if (this.isReviewing) return
				this.files[index].isFileApproved = !this.files[index].isFileApproved
				const { taskId, isFileApproved, path } = this.files[index]
				try {
					await this.approveDeliveryFile({ taskId, isFileApproved, paths: [ path ] })
					await this.getDeliveryData()
				} catch (err) {
				}
			},
			async approveFiles({ checked }) {
				await this.checkPermission()
				if (this.isReviewing) return
				const paths = checked.map(item => item.path)
				await this.approveDeliveryFile({ taskId: this.task.taskId, isFileApproved: true, paths })
				await this.getDeliveryData()
			},
			async checkPermission() {
				if (!this.isReviewing) {
					try {
						const reviewStatus = await this.$http.get(
								`/pm-manage/review-status?group=${ this.user.group.name }&projectId=${ this.project._id }&taskId=${ this.task.taskId }&userId=${ this.user._id }`
						)
						if (reviewStatus.data === "forbidden") {
							this.isReviewing = true
							return this.alertToggle({ message: "This task Delivery Review is forbidden for you", isShow: true, type: "error" })
						}
					} catch (err) {
						this.alertToggle({ message: "Error on checking review status", isShow: true, type: "error" })
					}
				}
			},
			async approve() {
				try {
					if (this.isDr1 && this.isAssign) {
						await this.assignDr2({
							projectId: this.project._id,
							taskId: this.task.taskId,
							dr2Manager: this.dr2Manager
						})
						return await this.getDeliveryData()
					} else if (!this.isNotify && !this.isDeliver && this.isReadyForDelivery) {
						return await this.approveDeliverable(this.task.taskId)
					} else {
						return await this.approveWithOption({
							taskId: this.task.taskId,
							isDeliver: this.isDeliver,
							contacts: this.project.clientContacts.map(({ email, firstName }) => ({ email, firstName })),
							user: { firstName: this.getUser.firstName, lastName: this.getUser.lastName, _id: this.getUser._id }
						})
					}
				} catch (err) {
				} finally {
					this.$emit("close")
				}
			},
			async assignManager({ manager, prop }) {
				await this.checkPermission()
				// if (this.isReviewing || this.dr1Manager._id === manager._id) return
				if (this.isReviewing) return
				await this.changeReviewManager({
					prevManager: this[prop],
					manager,
					prop,
					projectId: this.project._id,
					taskId: this.task.taskId,
					isAdmin: this.isAdmin,
					status: `dr${ this.dr }`
				})
				await this.getDeliveryData()
			},
			async rollBack() {
				const rollback = {
					projectId: this.project._id,
					taskId: this.task.taskId,
					manager: this.rollbackManager
				}
				await this.rollBackReview(rollback)
				this.close()
			},
			async getDeliveryData() {
				if (this.task.status === "Pending Approval [DR2]") {
					this.isDr1 = false
				}
				this.isDeliver = this.isDr1 ? false : this.areOptions

				try {
					const result = await this.$http.post("/pm-manage/delivery-data", {
						projectId: this.project._id,
						taskId: this.task.taskId
					})
					this.files = result.data.files.map(item => {
						return { ...item, taskId: this.task.taskId, pair: result.data.pair, isChecked: false }
					})
					this.dr1Manager = result.data.dr1Manager
					this.dr2Manager = result.data.dr2Manager
					this.instructions = result.data.instructions.filter(item => item.step === result.data.status)
					if (this.task.status === "Pending Approval [DR2]") {
						this.rollbackManager = JSON.parse(JSON.stringify(this.dr1Manager))
						this.timestamp = result.data.timestamp
					}
					const commentsData = await this.$http.get('/pm-manage/delivery-comments/' + this.project._id)
					const { comments } = commentsData.data
					this.editorData = this.task.status === 'Pending Approval [DR2]' ? comments.dr2.comment : comments.dr1.comment
					this.previousComment = this.task.status === 'Pending Approval [DR2]' ? comments.dr1.comment : ''
				} catch (err) {
					this.alertToggle({ message: "Error on getting delivery data", isShow: true, type: "error" })
				}
			}
		},
		computed: {
			...mapGetters({
				getUser: "getUser"
			}),
			groupedInstructions() {
				return _.groupBy(this.instructions, 'title')
			},
			isAllChecked() {
				// this.toggleOptions()
				const uncheckedFiles = this.files.filter(item => !item.isFileApproved)
				const uncheckedInstructions = this.instructions.filter(item => !item.isChecked && !item.isNotRelevant)
				return !uncheckedInstructions.length && !uncheckedFiles.length
			},
			dr() {
				return this.task.status === "Pending Approval [DR1]" ? 1 : 2
			},
			checklistTile() {
				return this.task.status === "Pending Approval [DR1]" ? "DR1" : "DR2"
			},
			isAdmin() {
				return this.user.group.name === "Administrators" || this.user.group.name === "Developers"
			}
		},
		components: {
			Drops,
			Table,
			Check,
			Options,
			CheckBox,
			Button,
			RollbackModal,
			ckeditor: CKEditor.component
		},
		mounted() {
			this.checkPermission()
					.then(res => this.getDeliveryData())
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .dr1Comment {
    &__title {
      border-bottom: 1px solid #c5bfb5;
      font-family: Myriad600;
      width: 78%;
      margin-bottom: 10px;
      padding-bottom: 2px;
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
      border-radius: 8px;
      width: 100%;
      heigth: 60px;
    }
  }

  .review {
    display: flex;
    flex-direction: column;
    padding: 20px;
    box-sizing: border-box;
    box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    background-color: $white;
    position: relative;
    width: 800px;

    &__checkSubTitle {
      border-bottom: 1px solid #c5bfb5;
      font-family: Myriad600;
      width: 78%;
      margin-bottom: 10px;
      padding-bottom: 2px;
    }


    &__title {
      font-size: 22px;
      text-align: center;
      margin-bottom: 20px;
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

    &__check-item {
      display: flex;
      margin-top: 6px;
    }

    &__headers {
      display: flex;
      justify-content: flex-end;
      margin-top: 15px;

      &-item {
        width: 11%;
        display: flex;
        justify-content: center;
        font-family: 'Myriad600';
      }
    }

    &__check-itemText {
      width: 78%;
    }

    &__check-itemCheck {
      width: 11%;
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

    &_left-align {
      font-size: 20px;
      text-align: left;
      border-bottom: 1px solid #c5bfb5;
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
    margin-right: 6px;
  }

  .marginTop {
    margin-top: 20px;
  }

  .notes {
    &__button {
      position: absolute;
      left: 83%;
      bottom: 45px;
      width: 100px;
      height: 30px;
      border-radius: 7px;
      font-size: 14px;
      background-color: #fff;
      color: #938676;
      outline: none;
      border: none;
      transition: 0.2s ease-out;
      text-align: center;
      line-height: 30px;
      letter-spacing: 0.2px;
      border: 2px solid #938676;

      &:active {
        transform: scale(.98);
      }

      &:hover {
        cursor: pointer;
        background: #f2efeb;
      }
    }
  }
</style>
