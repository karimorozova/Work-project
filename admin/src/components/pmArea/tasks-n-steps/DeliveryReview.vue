<template lang="pug">
  .review
    //.review__forbidden(v-if="isReviewing")
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
      .review__title.review_left-align {{ checklistTile }} Checklist
      .review__forbidden(v-if="isReviewing")

    .review__check
      .review__forbidden(v-if="isReviewing")
      .review__check-item(v-for="instruction in instructions")
        Check(
          @toggleApproval="toggleList"
          :instruction="instruction"
          :isApproved="instruction.isNotRelevant"
          :type="'isNotRelevant'"
        )
        Check(
          @toggleApproval="toggleList"
          :instruction="instruction"
          :isApproved="instruction.isChecked"
          :type="'isChecked'"
        )
        span {{ instruction.text }}

    span.relative
      .split-line
      .review__forbidden(v-if="isReviewing")

    .review__table
      .review__forbidden(v-if="isReviewing")
      Table(
        :isReviewing="isReviewing"
        :files="files"
        @approveFile="approveFile"
        @approveFiles="approveFiles"
        @uploadFile="uploadFile"
        @checkAll="checkAllFiles"
        @checkFile="checkFile"
        @updateDeliveryData="getDeliveryData"
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
	import { mapGetters, mapActions } from "vuex"
	import Drops from "../review/Drops"
	import Table from "../review/Table"
	import Check from "../review/Check"

	const Options = () => import("../review/Options")
	const CheckBox = () => import("@/components/CheckBox")
	const Button = () => import("@/components/Button")
	const RollbackModal = () => import("../review/RollbackModal")

	export default {
		props: {
			task: { type: Object },
			user: { type: Object },
			project: { type: Object }
		},
		data() {
			return {
				areFilesChecked: false,
				areFilesConverted: false,
				areOptions: true,
				isDeliver: false,
				isNotify: false,
				isDr1: true,
				isAssign: true,
				files: [],
				dr1Manager: null,
				dr2Manager: null,
				contacts: [],
				timestamp: "",
				instructions: [],
				isReviewing: false,
				isModal: false,
				rollbackManager: null
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
					this.isNotify = false
				} else if (prop === 'isDeliver') {
					this.isAssign = false
					this.isNotify = false
				} else {
					this.isAssign = false
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
			toggleOptions() {
				this.isAssign = this.isDr1
				this.isDeliver = !this.isDr1
				this.isNotify = false
			},
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
					}
					if (!this.isNotify && !this.isDeliver) {
						return await this.approveDeliverable(this.task.taskId)
					}
					await this.approveWithOption({
						taskId: this.task.taskId,
						isDeliver: this.isDeliver,
						contacts: this.project.clientContacts.map(({ email, firstName }) => ({ email, firstName })),
						user: { firstName: this.getUser.firstName, lastName: this.getUser.lastName, _id: this.getUser._id }
					})
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
					const result = await this.$http.post("/pm-manage/delivery-data", { projectId: this.project._id, taskId: this.task.taskId })
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
				} catch (err) {
					this.alertToggle({ message: "Error on getting delivery data", isShow: true, type: "error" })
				}
			}
		},
		computed: {
			...mapGetters({
				getUser: "getUser"
			}),
			isAllChecked() {
				this.toggleOptions()
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
			RollbackModal
		},
		mounted() {
			this.checkPermission()
					.then(res => this.getDeliveryData())
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .review {
    display: flex;
    flex-direction: column;
    padding: 20px;
    box-sizing: border-box;
    box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    background-color: $white;
    position: relative;
    width: 800px;

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
      transition: ease 0.2s;

      &:hover {
        opacity: 1
      }
    }

    &__check, &__table {
      position: relative;
    }

    &__check-item {
      /*margin-bottom: 6px;*/
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
      font-size: 22px;
      margin-bottom: 20px;
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
    background-color: #c5bfb5;
    margin: 39.5px 0;
    padding: 0.5px;
    position: relative;
  }

  .relative {
    position: relative
  }
</style>
