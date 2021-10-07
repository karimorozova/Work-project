<template lang="pug">
  .project-action
    .drops
      .drops__item
        .drops__label Account Manager:
        .drops__menuTitle {{ selectedAccManager }}
      .drops__item
        .drops__label Project Manager:
        .drops__menu(v-if="!isProjectFinished && canUpdateRequest")
          SelectSingle(
            :options="projManagers"
            :selectedOption="selectedProjManager"
            @chooseOption="showModalPM"
          )
        .drops__menuTitle(v-else) {{ selectedProjManager }}
      slot

    .approve-action(v-if="approveChangePM")
      ApproveModal(
        text="Are you sure you want to change Project Manager?"
        approveValue="Yes"
        notApproveValue="No"
        @approve="setPM"
        @close="closeModal"
        @notApprove="closeModal"
      )

    .approve-action(v-if="deleteCurrentRequest")
      ApproveModal(
        v-if="deleteCurrentRequest"
        text="Are you sure you want to change Project Manager?"
        approveValue="Yes"
        notApproveValue="No"
        @approve="deleteRequest"
        @close="doNotDelete"
        @notApprove="doNotDelete"
      )
    .delete-button
      Button(customClass="middle" color="#d15f45"  :outline="true" class="button-m-top" @clicked="isDeleteRequest" value="Delete Request")

</template>

<script>
	import SelectSingle from '../../../SelectSingle'
	import { mapActions, mapGetters } from 'vuex'
	import ApproveModal from '../../../ApproveModal'
	import Button from "../../../Button"

	export default {
		props: {
			project: {
				type: Object
			}
		},
		data() {
			return {
				deleteCurrentRequest: false,
				approveChangePM: false,
				selectedPM: {},
				managers: []
			}
		},
		methods: {
			...mapActions({
				updateClientsRequestsProps: 'updateClientsRequestsProps'
			}),
			isDeleteRequest() {
				this.deleteCurrentRequest = true
			},
			async deleteRequest() {
				const { id } = this.$route.params
				await this.$http.post(`/clients-requests/${ id }/delete`)
				if (window.history.length > 2) {
					this.$router.go(-1)
				} else {
					this.$router.push('/pangea-dashboard/overall-view')
				}
			},
			doNotDelete() {
				this.deleteCurrentRequest = false
			},
			closeModal() {
				this.approveChangePM = false
			},
			async showModalPM({ option }) {
				this.selectedPM = this.managers.find(item => `${ item.firstName } ${ item.lastName }` === option)
				this.approveChangePM = true
			},
			async setPM() {
				await this.updateClientsRequestsProps({ projectId: this.project._id, value: { projectManager: this.selectedPM } })
				this.approveChangePM = false
				this.selectedPM = {}
			},
			async getManagers() {
				try {
					const result = await this.$http.get('/users')
					this.managers = result.data
				} catch (err) {
					this.alertToggle({ message: 'Error on getting managers', isShow: true, type: 'error' })
				}
			}
		},
		computed: {
			...mapGetters({
				currentClient: 'getCurrentClient',
				user: 'getUser',
				requestCounter: 'getRequestCounter'
			}),
			canUpdateRequest() {
				return this.user.group.name === "Administrators"
						|| this.user.group.name === "Developers"
						|| this.project.projectManager._id === this.user._id
			},
			projManagers() {
				let result = []
				if (this.managers.length) {
					result = this.managers.filter(item => item.group.name === "Project Managers")
					result = result.map(item => `${ item.firstName } ${ item.lastName }`)
				}
				return result
			},
			selectedAccManager() {
				return this.project.accountManager ? this.project.accountManager.firstName + " " + this.project.accountManager.lastName : ""
			},
			selectedProjManager() {
				return this.project.projectManager ? this.project.projectManager.firstName + " " + this.project.projectManager.lastName : ""
			}
		},
		components: {
			Button,
			ApproveModal,
			SelectSingle
		},
		async created() {
			await this.getManagers()
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../../assets/scss/colors.scss";

  .delete-button {
    padding-top: 10px;
    margin-top: 10px;
    border-top: 1px solid $light-border;
  }

  .button-m-top {
    margin-top: 10px;
  }

  .project-action {
    padding: 20px;
    box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
    box-sizing: border-box;
    width: 400px;
    margin-top: 40px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    border-radius: 4px;
    background: white;
    position: relative;

    &__dropBody {
      position: relative;
      width: 200px;
      height: 30px;
      margin-bottom: 20px;
    }

    &__setting {
      display: flex;
      flex-direction: column;
    }

    &__payment {
      margin-bottom: 10px;

      &-span {
        vertical-align: sub;
        display: inline-block;
        font-size: 18px;
      }
    }

    &__text-input {
      width: 200px;
      margin-top: 5px;
      border-radius: 4px;
      border: 1px solid $border;
      padding: 5px;
      color: $text;
      resize: none;
      outline: none;
      box-sizing: border-box;
      margin-bottom: 20px;
    }

    &__title {
      font-size: 19px;
      font-family: Myriad600;
      border-bottom: 1px solid $border;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    &__drop-menu {
      width: 220px;
      height: 32px;
      position: relative;
      margin-bottom: 20px;
    }

    &__confirm {
      display: flex;
      margin-bottom: 20px;
    }

    &__button {
      :first-child {
        margin-right: 10px;
      }
    }

    &__checkbox {
      display: inline-flex;

      .switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 28px;
        margin-left: 28px;

        input {
          opacity: 0;
          width: 0;
          height: 0;
        }
      }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ebebe4;
        -webkit-transition: 0.4s;
        transition: 0.4s;

        &:before {
          position: absolute;
          content: "";
          height: 19px;
          width: 19px;
          left: 7px;
          bottom: 4px;
          background-color: #fff;
          transition: 0.4s;
        }
      }

      input {
        &:checked {
          + {
            .slider {
              background-color: #66563d;

              &:before {
                -webkit-transform: translateX(26px);
                -ms-transform: translateX(26px);
                transform: translateX(26px);
              }
            }
          }
        }
      }

      .slider.round {
        border-radius: 28px;

        &:before {
          border-radius: 50%;
        }
      }
    }

    .drops {
      width: 100%;
      position: relative;

      &__menu {
        position: relative;
        width: 220px;
        height: 32px;
      }

      &__menuTitle {
        width: 220px;
        height: 32px;
        display: flex;
        align-items: center;
      }

      &__item {
        @extend %item-style;
        width: 100%;
        justify-content: space-between;
      }

      &__text {
        font-size: 14px;
        font-weight: bolder;
      }

      &__label {
        position: relative;
        width: 160px;
      }

      &__assigned-icon {
        position: absolute;
        left: -18px;
        width: 15px;
      }
    }

    %item-style {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
  }

  .approve-action {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    z-index: 222;
  }

  .project-details {
    margin-bottom: 4px;
  }
</style>
