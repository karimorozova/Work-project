<template lang="pug">
  .review
    span.review__close(@click="close") &#215;

    .review__modal(v-if="isModalRollback")
      RollbackModal(:manager="rollbackManager" @close="closeRollback" @setRollbackManager="setRollbackManager" @rollBack="rollBackApprove")

    .review__title Delivery Review 2

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
          ckeditor(v-model="deliveryData.comment" :config="editorConfig")
          .notes__button(v-if="canAddDR2Manager" @click="sendComment") Save Comment &nbsp;
            i.fa.fa-paper-plane(aria-hidden='true')
    .relative__wrapper
      br(v-if="isCertificateExist && isServiceForCertificate")
      .review__certificate
        .inputs__group
          .input__field
            .input__title Delivery Name: {{isCertificateExist}} {{!isServiceForCertificate}}
            input.field__name(type="text" placeholder="Delivery Name" :value="deliveryData.deliveryName" @change="setDeliveryName" @keyup.13="setDeliveryName" :disabled="isCertificateExist || !isServiceForCertificate")
          .input__field
            .input__title Add Certificate:
            Button( value="Generate Certificate" @clicked="generateCertificate" :isDisabled="isCertificateExist || !isServiceForCertificate")
        .certificate__info(v-if="isCertificateExist && isServiceForCertificate") For change Delivery Name you need to delete Certificate.

    .review__table
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
        @assignManager="assignManager"
      )

    .review__options
      .review__group
        OptionsDR2(
          v-if="allChecked"
          class="max-with-400"
          :isDeliver="isDeliver"
          :isNotify="isNotify"
          :isReadyForDelivery="isReadyForDelivery"
          @toggleOption="toggleOption"
        )

      .review__additionalOptions

        .review__email-comment(v-if="(isDeliver) && allChecked")
          .review__email-checkbox
            CheckBox(:isChecked="isComment" @check="toggleCommentEmail"  @uncheck="toggleCommentEmail")
            span Add external comment

        .review__contacts(v-if="(isDeliver || isNotify) && allChecked") Contacts:
          SelectMulti(
            :options="contactsNames"
            :selectedOptions="selectedContacts"
            @chooseOptions="setContacts")

      .review__templateCommentRow(v-if="isComment")
        ckeditor(v-model="comment" :config="editorConfig")

      .review__buttons
        .review__button(v-if="allChecked")
          Button(
            value="Approve"
            @clicked="approve"
          )
</template>

<script>
	import CKEditor from "ckeditor4-vue"
	import { mapGetters, mapActions } from "vuex"
	import Check from "../review/Check"
	import editorConfig from "../../../mixins/editorConfig"
	import TableDR2 from "../review/TableDR2"
	import OptionsDR2 from "../review/OptionsDR2"
	import Button from "../../Button"
	import RollbackModal from "../review/RollbackModal"
	import SelectMulti from "../../SelectMulti"
	import CheckBox from "../../CheckBox"

	export default {
		mixins: [ editorConfig ],
		props: {
			user: { type: Object },
			users: { type: Array },
			project: { type: Object },
			id: { type: String },
			type: { type: String }
		},
		data() {
			return {
				files: [],
				isDeliver: false,
				isNotify: false,
				isReadyForDelivery: true,
				isModalRollback: false,
				rollbackManager: null,
				taskIdRollback: null,
				selectedContacts: [],
				comment: "",
				isComment: false
			}
		},
		beforeDestroy() {
			this.setShowTasksAndDeliverables(true)
		},
		methods: {
			...mapActions([
				"approveInstructionDR2",
				"approveDeliveryFileDR2",
				"approveReady",
				"approveNotify",
				"approveDeliver",
				"alertToggle",
				"setCurrentProject",
				"setShowTasksAndDeliverables"
			]),
			async generateCertificate() {
				const tasks = this.type === 'single'
						? this.deliveryData.files.map(item => item.taskId)
						: this.deliveryData.tasks

				try {
					const updatedProject = await this.$http.post('/pm-manage/generate-certificate', {
						project: this.project,
						type: this.type,
						tasks,
						deliveryData: this.deliveryData
					})
					await this.setCurrentProject(updatedProject.data)
					await this.updatedFiles(updatedProject)
					this.alertToggle({ message: "Certificate generated!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Certificate not generated!", isShow: true, type: "error" })
				}
			},
			toggleCommentEmail() {
				this.isComment = !this.isComment
			},
			async sendComment() {
				try {
					const updatedProject = await this.$http.post('/delivery/delivery-comments-dr2', {
						projectId: this.project._id,
						entityId: this.deliveryData._id,
						type: this.type,
						comment: this.deliveryData.comment
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
				if (!this.canAddDR2Manager) return
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

			checkAllFiles({ bool }) {
				this.files = this.files.map(item => {
					return { ...item, isChecked: bool }
				})
			},
			checkFile({ index, bool }) {
				this.files[index].isChecked = bool
			},
			async updatedFiles(updatedProject) {
				const { tasksDR2 } = updatedProject.data
				if (this.type === 'single') {
					const { files } = tasksDR2.singleLang.find(item => `${ item._id }` === `${ this.id }`)
					this.files = files.map(item => ({ ...item, isChecked: false }))
				} else {
					const { file, tasks } = tasksDR2.multiLang.find(item => `${ item._id }` === `${ this.id }`)
					this.files = file.map(files => ({ ...files, taskId: tasks.join(', '), pair: 'Multilingual', isChecked: false }))
				}
			},
			async removeFile(file) {
				try {
					const updatedProject = await this.$http.post("/delivery/remove-dr2-file", {
						...file,
						projectId: this.project._id,
						type: this.type,
						entityId: this.id
					})
					await this.setCurrentProject(updatedProject.data)
					await this.updatedFiles(updatedProject)
					this.alertToggle({ message: "File removed!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Error on remove DR1 Files", isShow: true, type: "error" })
				}
			},
			async uploadFile({ file, index }) {
				const { path } = index !== undefined ? this.files[index] : { path: "" }
				const fileData = new FormData()
				for (let i = 0; i < file.length; i++) {
					fileData.append("targetFile", file[i])
				}
				fileData.append("projectId", this.project._id)
				fileData.append("path", path)
				fileData.append("entityId", this.deliveryData._id)
				fileData.append("type", this.type)
				fileData.append("user", this.user._id)
				fileData.append("dr1Manager", this.project.projectManager._id)
				try {
					const updatedProject = await this.$http.post("/delivery/target-dr2", fileData)
					await this.setCurrentProject(updatedProject.data)
					await this.updatedFiles(updatedProject)
				} catch (err) {
				}
			},
			async approveFile({ index }) {
				this.files[index].isFileApproved = !this.files[index].isFileApproved
				const { isFileApproved, path } = this.files[index]
				try {
					const updatedProject = await this.$http.post("/delivery/approve-files-dr2", {
						type: this.type,
						entityId: this.id,
						projectId: this.project._id,
						isFileApproved,
						paths: [ path ]
					})
					await this.setCurrentProject(updatedProject.data)
				} catch (err) {
					this.alertToggle({ message: "Err in approveFile!", isShow: true, type: "error" })
				}
			},
			async approveFiles({ checked }) {
				const paths = checked.map(item => item.path)
				try {
					const updatedProject = await this.$http.post("/delivery/approve-files-dr2", {
						type: this.type,
						entityId: this.id,
						projectId: this.project._id,
						isFileApproved: true,
						paths
					})
					await this.setCurrentProject(updatedProject.data)
					await this.updatedFiles(updatedProject)
				} catch (err) {
					this.alertToggle({ message: "Err in approveFiles!", isShow: true, type: "error" })
				}
			},
			listOfContactsForDeliver() {
				return this.selectedContacts
						.map(item => this.project.clientContacts.find(({ firstName, surname }) => `${ firstName } ${ surname }` === item))
						.map(item => ({ email: item.email, firstName: `${ item.firstName } ${ item.surname }` }))
			},
			async approve() {
				switch (true) {
					case this.isReadyForDelivery:
						await this.approveReady({ projectId: this.project._id, entityId: this.deliveryData._id, type: this.type })
						this.$emit("close")
						break
					case this.isDeliver:
						await this.approveDeliver({
							projectId: this.project._id,
							entityId: this.deliveryData._id,
							type: this.type,
							user: this.user,
							contacts: this.listOfContactsForDeliver(),
							comment: this.comment
						})
						this.$emit("close")
						break
					case this.isNotify:
						await this.approveNotify({ projectId: this.project._id, entityId: this.deliveryData._id, type: this.type, contacts: this.listOfContactsForDeliver() })
						this.$emit("close")
						break
				}
			},
			async assignManager({ manager, type, file }) {
				if (manager._id === file.dr2Manager) return
				try {
					const updatedProject = await this.$http.post("/delivery/change-manager-dr2", {
						projectId: this.project._id,
						manager,
						type,
						file,
						entityId: this.deliveryData._id
					})
					await this.setCurrentProject(updatedProject.data)
					await this.updatedFiles(updatedProject)
					this.alertToggle({ message: "Manager changed!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Err in assignManager!", isShow: true, type: "error" })
				}
			},
			rollback(task) {
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
				try {
					const updatedProject = await this.$http.post("/delivery/rollback-review", { ...rollback })
					await this.setCurrentProject(updatedProject.data)
					await this.updatedFiles(updatedProject)
				} catch (err) {
					this.alertToggle({ message: "Err in rollback!", isShow: true, type: "error" })
				}
				this.closeRollback()
			},
			setContacts({ option }) {
				const position = this.selectedContacts.indexOf(option)
				if (position === -1) {
					this.selectedContacts.push(option)
				} else {
					if (this.selectedContacts.length > 1) {
						this.selectedContacts.splice(position, 1)
					}
				}
			},
			setDefaultContact() {
				this.selectedContacts = []
				const { firstName, surname } = this.project.clientContacts[0]
				this.selectedContacts.push(`${ firstName } ${ surname }`)
			},
			async setDeliveryName(e) {
				const { value } = e.target
				const deliveryId = this.deliveryData._id
				const projectId = this.project._id
				const updatedProject = await this.$http.post('/delivery/dr2-name-change', { projectId, deliveryId, deliveryName: value, type: this.type })
				await this.setCurrentProject(updatedProject.data)

			}
		},
		computed: {
			...mapGetters({
				requestCounter: 'getRequestCounter'
			}),
			isServiceForCertificate() {
				if (Object.keys(this.deliveryData).length && this.type && this.project) {
					let tasks = this.type === 'single'
							? this.deliveryData.files.map(item => item.taskId)
							: this.deliveryData.tasks
					tasks = tasks.filter(item => item !== "Loaded in DR2")

					const services = this.project.tasks.filter(item => tasks.includes(item.taskId)).map(item => item.service.title)
					return services.length && services.every(item => item === 'Compliance' || item === 'Translation')
				}
			},
			isCertificateExist() {
				if (this.files.length) {
					const filesNames = this.files.map(i => i.fileName)
					for (let str of filesNames) {
						if (str.indexOf('certificate') !== -1) return true
					}
					return false
				}
			},
			contactsNames() {
				return this.project.clientContacts.map(item => `${ item.firstName } ${ item.surname }`)
			},
			deliveryData() {
				const { tasksDR2 } = this.project
				if (this.type === 'single') {
					const deliveryData = tasksDR2.singleLang.find(item => `${ item._id }` === `${ this.id }`)
					return deliveryData
				} else {
					const deliveryData = tasksDR2.multiLang.find(item => `${ item._id }` === `${ this.id }`)
					return deliveryData
				}
			},
			groupedInstructions() {
				return _.groupBy(this.deliveryData.instructions, 'title')
			},
			isAdmin() {
				return this.user.group.name === "Administrators" || this.user.group.name === "Developers"
			},
			canAddDR2Manager() {
				return this.isAdmin || this.files.map(({ dr2Manager }) => dr2Manager).includes(this.user._id.toString())
			},
			allChecked() {
				return this.deliveryData.instructions.every(({ isChecked, isNotRelevant }) => isChecked || isNotRelevant)
						&& this.files.every(({ isFileApproved }) => isFileApproved) && this.files.length > 0
			}
		},
		components: {
			CheckBox,
			SelectMulti,
			RollbackModal,
			Button,
			OptionsDR2,
			TableDR2,
			Check,
			ckeditor: CKEditor.component
		},
		mounted() {
			const { tasksDR2 } = this.project
			if (this.type === 'single') {
				const { files } = tasksDR2.singleLang.find(item => `${ item._id }` === `${ this.id }`)
				this.files = files.map(item => ({ ...item, isChecked: false }))
			} else {
				const { file, tasks } = tasksDR2.multiLang.find(item => `${ item._id }` === `${ this.id }`)
				this.files = file.map(files => ({ ...files, taskId: tasks.join(', '), pair: 'Multilingual', isChecked: false }))
			}
			this.setDefaultContact()
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .field__name {
    font-size: 14px;
    color: #3d3d3d;
    border: 1px solid #bfbfbf;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 0 7px;
    outline: none;
    width: 220px;
    height: 32px;
    transition: .1s ease-out;
  }

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

    &__templateCommentRow {
      width: 100%;
      margin-top: 20px;
    }

    &__additionalOptions {
      display: flex;
      justify-content: center;
      gap: 25px;
      margin-top: 20px;
    }

    &__certificate {
      position: absolute;
      top: 20px;
      z-index: 5;
      background: #f7f7f7;
      border: 1px solid #bfbfbf;
      padding: 7px;
      border-radius: 4px;

      input {
        margin-right: 15px;
      }
    }
    .inputs{
      &__group {
        display: flex;
        margin-bottom: 10px;
      }
    }

    .relative__wrapper {
      position: relative;
    }

    &__checkSubTitle {
      border-bottom: 1px solid $border;
      font-family: Myriad600;
      width: 80%;
      margin-bottom: 12px;
      padding-bottom: 4px;
    }

    &__email-comment {
      position: relative;
      height: 50px;
      align-items: center;
      display: flex;
      margin-top: 6px;
    }

    &__email-checkbox {
      display: flex;
      font-size: 14px;
      justify-content: center;

      & span {
        padding-left: 8px;
        margin-top: 2px;
      }

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
      margin-top: 65px;
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

    &__contacts {
      position: relative;
      width: 220px;
      height: 50px;
    }

    &__group {
      display: flex;
      margin-top: 10px;
      flex-direction: column;
      align-items: center;
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

    &__button-email {
      position: absolute;
      right: 3%;
      bottom: 48px;
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
        background: #f7f7f7;
      }
    }
  }

  .max-with-400 {
    max-width: 440px;
  }
</style>
