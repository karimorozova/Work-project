<template lang="pug">
  .request-info(v-if="currentRequest._id")
    .request-info__title Request Details : {{currentRequest.requestId}}
    .request-info__all-info
      Request(:request="currentRequest")
        .request-info__modal(v-if="isModal")
          ApproveModal(
            text="Are you sure you want to reassign this project?"
            approveValue="Yes"
            notApproveValue="Cancel"
            @close="closeModal"
            @notApprove="closeModal"
            @approve="setManager"
          )
      .request-info__disabled(v-if="isDisabled")
    .request-info__all-info
      RequestTasksData(
        :originallyLanguages="originallyLanguages"
        :originallyUnits="originallyUnits"
        :originallySteps="originallySteps"
        @setDate="setDate"
        @showErrors="showErrors"
      )
        ValidationErrors(v-if="areErrorsExist"
          :errors="errors"
          :isAbsolute="isBlockAbsoulte"
          @closeErrors="closeErrorsBlock"
        )
      .request-info__disabled(v-if="isDisabled")
</template>

<script>
	const ValidationErrors = () => import("../ValidationErrors");
	import Request from "./Request";
	import RequestTasksData from "./RequestTasksData";
	import ApproveModal from "@/components/ApproveModal";
	import { mapGetters, mapActions } from 'vuex';

	export default {
		data() {
			return {
				errors: [],
				areErrorsExist: false,
				isBlockAbsoulte: true,
				isEditAndSend: false,
				message: "",
				mailSubject: "",
				isModal: false,
				selectedManager: null,
				managerProp: 'projectManager'
			}
		},
		methods: {
			...mapActions([
				"setProjectValue",
				"setRequestValue",
				"setCurrentProject",
				"alertToggle",
				"updateCurrentProject"
			]),
			async reassignManager({ prop, manager }) {
				const groupName = this.user.group.name;
				this.selectedManager = manager;
				this.managerProp = prop;
				if((groupName === 'Account Managers' && prop === 'accountManager') || (groupName === 'Project Managers' && prop === 'projectManager')) {
					this.isModal = true;
				} else {
					await this.setRequestValue({ id: this.currentRequest._id, prop, value: manager });
				}
			},
			async setDate({ date, prop, index }) {
				try {
					await this.setStepDate({ value: date, prop, index });
					await this.updateCurrentProject({ ...this.currentRequest, id: this.currentRequest._id });
				} catch (err) {
				}
			},
			async refreshCustomerInfo() {
				const client = await this.$http.get(`/clientsapi/client?id=${ this.currentRequest.customer._id }`);
				await this.setProjectValue({ prop: 'customer', value: client.body });
			},
			showErrors({ errors }) {
				this.errors = [...errors];
				this.areErrorsExist = true;
			},
			closeErrorsBlock() {
				this.areErrorsExist = false;
				this.errors = [];
			},
			editAndSend({ message, subject }) {
				this.isEditAndSend = true;
				this.message = message.data.message;
				this.mailSubject = subject;
			},
			async setManager() {
				try {
					await this.setRequestValue({
						id: this.currentRequest._id,
						prop: this.managerProp,
						value: this.selectedManager,
						isEmail: true
					});
				} catch (err) {
				} finally {
					this.closeModal();
				}
			},
			async getRequest() {
				const { id } = this.$route.params;
				try {
					if(!this.currentRequest._id) {
						const result = await this.$http.get(`/pm-manage/request?id=${ id }`);
						this.setCurrentProject(result.body);
					}
				} catch (err) {
					this.alertToggle({ message: err.response, isShow: true, type: "error" });
				}
			},
			closeModal() {
				this.isModal = false;
				this.selectedAm = null;
				this.managerProp = "projectManager";
			},
			async getOriginallyLanguages() {
				try {
					const result = await this.$http.get("/api/languages");
					this.originallyLanguages = result.body;
				} catch (err) {
					this.alertToggle({
						message: "Error in Originally Languages",
						isShow: true,
						type: "error",
					});
				}
			},
			async getOriginallyUnits() {
				try {
					const result = await this.$http.get("/api/units");
					this.originallyUnits = result.body;
				} catch (err) {
					this.alertToggle({
						message: "Error in Originally Units",
						isShow: true,
						type: "error",
					});
				}
			},
			async getOriginallySteps() {
				try {
					const result = await this.$http.get("/api/steps");
					this.originallySteps = result.body;
				} catch (err) {
					this.alertToggle({
						message: "Error in Originally Steps",
						isShow: true,
						type: "error",
					});
				}
			}
		},
		computed: {
			...mapGetters({
				currentRequest: 'getCurrentProject',
				user: 'getUser'
			}),
			isDisabled() {
				if(this.user && this.user.group) {
					if(this.user.group.name === 'Administrators' || this.user.group.name === 'Developers') return false;
					if(this.currentRequest.isAssigned) {
						return this.currentRequest.projectManager._id !== this.user._id;
					} else {
						return this.currentRequest.accountManager._id !== this.user._id;
					}
				}
			}
		},
		components: {
			ValidationErrors,
			Request,
			RequestTasksData,
			ApproveModal
		},
		async created() {
			await this.getRequest();
			await this.getOriginallyLanguages();
			await this.getOriginallyUnits();
			await this.getOriginallySteps();
		},
		beforeRouteEnter(to, from, next) {
			next(async (vm) => {
				if(from && from.name === "client-details") {
					await vm.refreshCustomerInfo();
				}
			})
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";

  .request-info {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;

    &__title {
      padding: 20px 0 0 40px;
      font-size: 20px;
    }

    &__all-info {
      width: 100%;
      display: flex;
      align-items: flex-start;
      box-sizing: border-box;
      padding-left: 20px;
      position: relative;
    }

    &__disabled {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      opacity: 0;
      z-index: 10;
    }

    &__action {
      width: 20%;
      @media (max-width: 1600px) {
        width: 23%;
      }
    }

    &__modal {
      position: absolute;
      top: -10px;
      left: -15px;
    }
  }
</style>
