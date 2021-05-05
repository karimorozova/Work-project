<template lang="pug">
  .review
    span.review__close(@click="close") &#215;

    .review__modal(v-if="isModalRollback")
      RollbackModal(:manager="rollbackManager" @close="closeRollback" @setRollbackManager="setRollbackManager" @rollBack="rollBackApprove")
    //
    .review__title Delivery Review 2
    span.relative
      //.review__forbidden(v-if="isReviewing")
      //DropsDR2(:project="project":user="user" :dr1Manager="users.find(({_id}) => `${_id}` === `${deliveryData.dr1Manager}`)" :dr2Manager="users.find(({_id}) => `${_id}` === `${deliveryData.dr2Manager}`)" @assignManager="assignManager" @setContacts="setContacts")

    span.relative
      //.review_left-align {{ checklistTile }} Checklist
      //.review__forbidden(v-if="isReviewing")

    .review__check
      //.review__forbidden(v-if="isReviewing")
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
          ckeditor(v-model="deliveryData.comment" :config="editorConfig")
          .notes__button(@click="sendComment") Save &nbsp;
            i.fa.fa-paper-plane(aria-hidden='true')
    //
    //  .review__dr1Comment(:class="{marginTop: true}" v-if="dr === 2 && !!previousComment")
    //    .dr1Comment__title DR1 Comment
    //    .dr1Comment__textarea
    //      .dr1Comment__textareaText(v-html="previousComment")
    //
    //  span.relative
    //    .split-line
    //    .review__forbidden(v-if="isReviewing")
    //
    .review__table
      //.review__forbidden(v-if="isReviewing")
      TableDR2(
        :type="type"
        :task="task"
        :files="files"
        :users="users"
        :user="user"
        @approveFile="approveFile"
        @approveFiles="approveFiles"
        @uploadFile="uploadFile"
        @checkAll="checkAllFiles"
        @checkFile="checkFile"
        @removeFile="removeFile"
        @rollback="rollback"
      )

    .review__options
      //.review__options-check(v-if="isAllChecked")
        //CheckBox(
        //  :isChecked="areOptions"
        //  customClass="review-options"
        //  @check="(e) => toggleOptions(e, true)"
        //  @uncheck="(e) => toggleOptions(e, false)"
        //)
      OptionsDR2(
        v-if="true"
        :isDeliver="isDeliver"
        :isNotify="isNotify"
        :isReadyForDelivery="isReadyForDelivery"
        @toggleOption="toggleOption"
      )

      //  (v-if="dr1Manager && dr2Manager && getUser")
      //    .review__button(v-if="!isDr1")
      //      .review__forbidden(v-if="dr1Manager._id !== getUser._id && dr2Manager._id !== getUser._id && getUser.name === 'Administrators'")
      //      Button(
      //        value="Rollback"
      //        @clicked="popupRollback"
      //      )
      .review__buttons
        .review__button(v-if="true")
          Button(
            value="Approve"
            @clicked="approve"
          )
</template>

<script>
	import CKEditor from "ckeditor4-vue"
	import { mapGetters, mapActions } from "vuex"
	// import Drops from "../review/Drops"
	// import Table from "../review/Table"
	import Check from "../review/Check"
	// import _ from "lodash"
	import editorConfig from "../../../mixins/editorConfig"
  import TableDR2 from "../review/TableDR2";
  import OptionsDR2 from "../review/OptionsDR2";
  import Button from "../../Button";
  import RollbackModal from "../review/RollbackModal";
  // import DropsDR2 from "../review/DropsDR2";
  //
	// const CheckBox = () => import("@/components/CheckBox")

	export default {
		mixins: [ editorConfig ],
		props: {
			user: { type: Object },
			users: { type: Array },
			project: { type: Object },
			id: { type: String },
      type: {type: String }
		},
		data() {
			return {
        files: [],
				// editorData: "",
				// areFilesChecked: false,
				// areFilesConverted: false,
				// areOptions: true,
				isDeliver: false,
				isNotify: false,
				isReadyForDelivery: true,
        isModalRollback: false,
				rollbackManager: null,
        taskIdRollback: null
				// isAssign: true,
				// isDr1: true,
				// files: [],
				// dr1Manager: null,
				// dr2Manager: null,
				// contacts: [],
				// timestamp: "",
				// instructions: [],
				// isReviewing: false,
				// isModal: false,
				// previousComment: ''
			}
		},
		methods: {
			...mapActions([
				"approveInstructionDR2",
				"approveDeliveryFileDR2",
        "approveReady",
        "approveNotify",
        "approveDeliver",
        "changeReviewManagerDR2",
        "alertToggle",
        "setCurrentProject",
				// "rollBackReview",
				// "approveDeliveryFile",
				// "uploadTarget",
				// "approveWithOption",
				// "assignDr2",
			]),
			// async generateCertificate() {
			// 	try {
			// 		await this.$http.post('/pm-manage/generate-certificate', {
			// 			project: this.project,
			// 			task: this.task
			// 		})
			// 		await this.getDeliveryData()
			// 		this.alertToggle({ message: "Certificate generated!", isShow: true, type: "success" })
			// 	} catch (err) {
			// 		this.alertToggle({ message: "Certificate not generated!", isShow: true, type: "error" })
			// 	}
			// },
			async sendComment() {
				try {
					const updatedProject = await this.$http.post('/pm-manage/delivery-comments-dr2', {
            projectId: this.project._id,
            entityId: this.deliveryData._id,
            type: this.type,
						comment: this.deliveryData.comment
					})
          await this.setCurrentProject(updatedProject.data);
					this.alertToggle({ message: "Comment updated!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Comment not updated!", isShow: true, type: "error" })
				}
			},
			close() {
				this.$emit("close")
			},
			setContacts({ contacts }) {
				// this.contacts = [ ...contacts ]
			},
			toggleOption({ prop }) {
				this[prop] = true
				if (prop === 'isNotify') {
					this.isDeliver = false
					this.isNotify = true
					this.isReadyForDelivery = false
				} else if (prop === 'isDeliver') {
          this.isDeliver = true
          this.isNotify = false
          this.isReadyForDelivery = false
				} else if (prop === 'isReadyForDelivery') {
          this.isDeliver = false
          this.isNotify = false
          this.isReadyForDelivery = true
				}
			},
			async toggleList({ type, instruction }) {
        const types = [ 'isChecked', 'isNotRelevant' ]
        const anotherType = types.filter(item => item !== type)
        instruction[type] = !instruction[type]
        instruction[anotherType] = !instruction[type]
        await this.approveInstructionDR2({
          projectId: this.project._id,
          entityId: this.deliveryData._id,
          instruction,
          type: this.type
        })
			},
			// // toggleOptions() {
			// // 	this.isAssign = this.isDr1
			// // 	this.isDeliver = !this.isDr1
			// // 	this.isNotify = false
			// // },
			checkAllFiles({ bool }) {
				this.files = this.files.map(item => {
					return { ...item, isChecked: bool }
				})
			},
			checkFile({ index, bool }) {
				this.files[index].isChecked = bool
			},
			// popupRollback() {
			// 	this.isModal = true
			// },
      async updatedFiles(updatedProject){
        const { tasksDR2 } = updatedProject.data
        if(this.type === 'single'){
          const {files} = tasksDR2.singleLang.find(item => `${item._id}` === `${this.id}`)
          this.files = files.map(item => ({ ...item, isChecked: false }))
        }else{
          const { file, tasks } = tasksDR2.multiLang.find(item => `${item._id}` === `${this.id}`)
          this.files = [{ ...file, taskId: tasks.join(', '), pair: 'Multilingual', isChecked: false}]
        }
      },
      async removeFile(file){
        try{
          const updatedProject = await this.$http.post("/pm-manage/remove-dr2-file", {
            ...file,
            projectId: this.project._id,
            type: this.type,
            entityId: this.id
          });
          await this.setCurrentProject(updatedProject.data);
          await this.updatedFiles(updatedProject)
          this.alertToggle({ message: "File removed!", isShow: true, type: "success" })
        }catch (err){
          this.alertToggle({ message: "Error on remove DR1 Files", isShow: true, type: "error" })
        }
      },
			async uploadFile({ file, index }) {
        const { path } = index !== undefined ? this.files[index] : { path: "" }
        const fileData = new FormData()
        fileData.append("targetFile", file)
        fileData.append("projectId", this.project._id)
        fileData.append("path", path)
        fileData.append("entityId", this.deliveryData._id)
        fileData.append("type", this.type)
        try {
            const updatedProject = await this.$http.post("/pm-manage/target-dr2", fileData)
            await this.setCurrentProject(updatedProject.data);
            await this.updatedFiles(updatedProject)
        } catch (err) {
        }
			},
      async approveFile({ index }) {
        this.files[index].isFileApproved = !this.files[index].isFileApproved
        const { isFileApproved, path } = this.files[index]
        try {
          await this.approveDeliveryFileDR2({ type: this.type, entityId: this.id, projectId: this.project._id, isFileApproved, paths: [path] })
        } catch (err) {
        }
      },
      async approveFiles({ checked }) {
        const paths = checked.map(item => item.path)
        await this.approveDeliveryFileDR2({ projectId: this.project._id, isFileApproved: true, paths })
      },
			// async checkPermission() {
			// 	if (!this.isReviewing) {
			// 		try {
			// 			const reviewStatus = await this.$http.get(
			// 					`/pm-manage/review-status?group=${ this.user.group.name }&projectId=${ this.project._id }&taskId=${ this.task.taskId }&userId=${ this.user._id }`
			// 			)
			// 			if (reviewStatus.data === "forbidden") {
			// 				this.isReviewing = true
			// 				return this.alertToggle({ message: "This task Delivery Review is forbidden for you", isShow: true, type: "error" })
			// 			}
			// 		} catch (err) {
			// 			this.alertToggle({ message: "Error on checking review status", isShow: true, type: "error" })
			// 		}
			// 	}
			// },
			async approve() {
				// try {
				// 	if (this.isDr1 && this.isAssign) {
				// 		await this.assignDr2({
				// 			projectId: this.project._id,
				// 			taskId: this.task.taskId,
				// 			dr2Manager: this.dr2Manager
				// 		})
				// 		return await this.getDeliveryData()
				// 	} else if (!this.isNotify && !this.isDeliver && this.isReadyForDelivery) {
				// 		return await this.approveDeliverable(this.task.taskId)
				// 	} else {
				// 		return await this.approveWithOption({
				// 			taskId: this.task.taskId,
				// 			isDeliver: this.isDeliver,
				// 			contacts: this.project.clientContacts.map(({ email, firstName }) => ({ email, firstName })),
				// 			user: { firstName: this.getUser.firstName, lastName: this.getUser.lastName, _id: this.getUser._id }
				// 		})
				// 	}
				// } catch (err) {
				// } finally {
				// 	this.$emit("close")
				// }

        switch (true) {
          case this.isReadyForDelivery:
            console.log("isReadyForDelivery");
            return await this.approveReady(this.task.taskId)
          case this.isDeliver:
            console.log("isDeliver");
            return await this.approveDeliver(this.task.taskId)
          case this.isNotify:
            console.log("isNotify");
            return await this.approveNotify(this.task.taskId)
        }
        this.$emit("close")
			},
			async assignManager({ manager, prop }) {
        // const { dr2Manager, files } = this.deliveryData
        // if(manager._id === dr2Manager) return
        //
        // await this.changeReviewManagerDR2({
        //   manager,
        //   prop,
        //   projectId: this.project._id,
        //   taskId: files[0].taskId,
        //   isAdmin: this.isAdmin,
        //   status: 'dr2',
        //   deliveryData: this.deliveryData,
        //   type: this.type
        // })
			},
      rollback(task){
        this.isModalRollback = true
        const { tasksDR1 } = this.project
        const { dr1Manager } = tasksDR1.find(({ taskId }) => taskId === task)
        this.rollbackManager = this.users.find(({ _id }) => `${ _id }` === `${ dr1Manager }`)
        this.taskIdRollback = task
      },
      setRollbackManager({ manager }) {
        this.rollbackManager = manager
      },
      closeRollback() {
        this.isModalRollback = false
        this.rollbackManager = null
        this.taskIdRollback = null
      },
			async rollBackApprove() {
				const rollback = {
          entityId: this.deliveryData._id,
				  projectId: this.project._id,
          taskId: this.taskIdRollback,
          manager: this.rollbackManager
				}
				try{
          const updatedProject = await this.$http.post("/pm-manage/rollback-review", { ...rollback })
          await this.setCurrentProject(updatedProject.data);
          await this.updatedFiles(updatedProject)
        }catch (err){
          this.alertToggle({ message: "Err in rollback!", isShow: true, type: "error" })
        }
				this.closeRollback()
			},
			// async getDeliveryData() {
			// 	if (this.task.status === "Pending Approval [DR2]") {
			// 		this.isDr1 = false
			// 	}
			// 	this.isDeliver = this.isDr1 ? false : this.areOptions
      //
			// 	try {
			// 		const result = await this.$http.post("/pm-manage/delivery-data", {
			// 			projectId: this.project._id,
			// 			taskId: this.task.taskId
			// 		})
			// 		this.files = result.data.files.map(item => {
			// 			return { ...item, taskId: this.task.taskId, pair: result.data.pair, isChecked: false }
			// 		})
			// 		this.dr1Manager = result.data.dr1Manager
			// 		this.dr2Manager = result.data.dr2Manager
			// 		this.instructions = result.data.instructions.filter(item => item.step === result.data.status)
			// 		if (this.task.status === "Pending Approval [DR2]") {
			// 			this.rollbackManager = JSON.parse(JSON.stringify(this.dr1Manager))
			// 			this.timestamp = result.data.timestamp
			// 		}
			// 		const commentsData = await this.$http.get('/pm-manage/delivery-comments/' + this.project._id)
			// 		const { comments } = commentsData.data
			// 		this.editorData = this.task.status === 'Pending Approval [DR2]' ? comments.dr2.comment : comments.dr1.comment
			// 		this.previousComment = this.task.status === 'Pending Approval [DR2]' ? comments.dr1.comment : ''
			// 	} catch (err) {
			// 		this.alertToggle({ message: "Error on getting delivery data", isShow: true, type: "error" })
			// 	}
			// }
		},
		computed: {
		  deliveryData(){
        const { tasksDR2 } = this.project
		    if(this.type === 'single'){
		      const deliveryData = tasksDR2.singleLang.find(item => `${item._id}` === `${this.id}`)
          console.log('deliveryDataS',deliveryData)
          return deliveryData
        }else{
          const deliveryData = tasksDR2.multiLang.find(item => `${item._id}` === `${this.id}`)
          console.log('deliveryDataM',deliveryData)
          return deliveryData
        }
      },
			groupedInstructions() {
				return _.groupBy(this.deliveryData.instructions, 'title')
			},
			// isAllChecked() {
			// 	// this.toggleOptions()
			// 	const uncheckedFiles = this.files.filter(item => !item.isFileApproved)
			// 	const uncheckedInstructions = this.instructions.filter(item => !item.isChecked && !item.isNotRelevant)
			// 	return !uncheckedInstructions.length && !uncheckedFiles.length
			// },
			// dr() {
			// 	return this.task.status === "Pending Approval [DR1]" ? 1 : 2
			// },
			// checklistTile() {
			// 	return this.task.status === "Pending Approval [DR1]" ? "DR1" : "DR2"
			// },
			isAdmin() {
				return this.user.group.name === "Administrators" || this.user.group.name === "Developers"
			}
		},
		components: {
      RollbackModal,
      Button,
      OptionsDR2,
      TableDR2,
			Check,
			ckeditor: CKEditor.component
		},
    mounted() {
      const { tasksDR2 } = this.project
		  if(this.type === 'single'){
        const {files} = tasksDR2.singleLang.find(item => `${item._id}` === `${this.id}`)
        this.files = files.map(item => ({ ...item, isChecked: false }))
      }else{
        const { file, tasks } = tasksDR2.multiLang.find(item => `${item._id}` === `${this.id}`)
        this.files = [{ ...file, taskId: tasks.join(', '), pair: 'Multilingual', isChecked: false}]
      }
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

    &__table{
      margin-top: 20px;
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
