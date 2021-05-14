<template lang="pug">
  .activityDetail
    .modal
      ApproveModal(
        v-if="approveModal"
        text="Are you sure?"
        approveValue="Yes"
        notApproveValue="Cancel"
        @approve="approve"
        @notApprove="notApprove"
        @close="closeModal"
      )
    .activityDetail__header
      .header
        .header__icon
          i.fas.fa-tasks
        .header__title Task
        .header__status {{taskData.status}}
        .header__crud
          span.icon(
            v-if="(taskData.assignedTo._id.toString() === user._id.toString() || isAdmin) && taskData.status !== 'Completed'"
            @click="edit(taskData)"
          )
            i.fas.fa-pencil-alt
          span.icon(
            v-if="(taskData.assignedTo._id.toString() === user._id.toString() || isAdmin) && taskData.status !== 'Completed'"
            @click="deleteTask()"
          )
            i.fas.fa-trash
          span.icon(@click="close")
            i.fas.fa-times-circle

    .activityDetail__content
      .card
        .card__check(
          v-if="taskData.status !== 'Completed'"
          @click="completeActivity(taskData)"
          :class="{notActive: taskData.assignedTo._id.toString() !== user._id.toString() && !isAdmin}"
        )
          i.far.fa-check-circle
        .card__checkDone(v-else)
          i.far.fa-check-circle

        .card__data
          .card__title {{taskData.title}}
          .card__date
            span.due Due:
            span {{taskData.dateTime | formatDate}}

      .description
        .side
          .side__left
            .description__priority
              .d-title Priority:
              .description__priorityBlockHigh(v-if="taskData.priority === 'High'") High
              .description__priorityBlockRegular(v-else) Regular

            .description__assigned
              .d-title Assigned to:
              .assignedImage
                .tooltip
                  span#myTooltip.tooltiptext {{taskData.assignedTo.firstName}} {{taskData.assignedTo.lastName}}
                  img(src="../../../assets/images/signin-background.jpg")

          .side__right
            .description__associated(v-if="taskData.associatedTo.length")
              .d-title Associated with:
              .description__associatedList(v-for="user in taskData.associatedTo")
                .associatedUser
                  .associatedUser__block
                  .associatedUser__title {{user.firstName}} {{user.surname}}

            .description__details
              .d-title Details:
              .details__data(id="editor" v-html="taskData.details")


</template>

<script>
	import ApproveModal from "../../ApproveModal"
	import { mapActions, mapGetters } from "vuex"

	export default {
		components: { ApproveModal },
		props: {
			taskData: {
				type: Object
			}
		},
		data() {
			return {
				approveModal: false
			}
		},
		methods: {
			...mapActions({
				setUpClientProp: 'setUpClientProp',
				alertToggle: "alertToggle"
			}),
			async completeActivity(item) {
				if (item.assignedTo._id.toString() !== this.user._id.toString() && !this.isAdmin) {
					return
				}
				this.taskData.status = 'Completed'
				item.status = 'Completed'
				try {
					const tasks = await this.$http.post(`/clientsapi/activity/task/${ item._id }`, { data: item })
					this.setUpClientProp({ key: "tasks", value: tasks.data })
					this.alertToggle({ message: "Task compleated", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Error on Completing task", isShow: true, type: "error" })
				}
			},
			edit(taskData) {
				this.$emit('editActivityDetailsTask', taskData)
				this.close()
			},
			deleteTask() {
				this.approveModal = true
			},
			close() {
				this.$emit('closeActivityDetailsTask')
				this.approveModal = false
			},
			async approve() {
				try {
					const tasks = await this.$http.delete(`/clientsapi/activity/task/${ this.taskData._id }?client=${ this.taskData.client }`)
					this.setUpClientProp({ key: "tasks", value: tasks.data })
					this.close()
				} catch (e) {
					this.alertToggle({ message: "Error on deleting tasks", isShow: true, type: "error" })
				}

			},
			notApprove() {
				this.closeModal()
			},
			closeModal() {
				this.approveModal = false
			}
		},
		computed: {
			...mapGetters({
				user: "getUser"
			}),
			isAdmin() {
				return this.user.group.name === 'Administrators' || this.user.group.name === 'Developers'
			}
		}


	}
</script>

<style lang="scss" scoped>
  .notActive {
    cursor: default !important;
    color: rgba(0, 0, 0, .1) !important;
  }

  .side {
    width: 100%;
    display: flex;

    &__left {
      width: 30%;
    }

    &__right {
      width: 70%;
    }
  }

  .modal {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .associatedUser {
    border: 1px solid #e8e8e8;
    margin-bottom: 5px;
    display: flex;

    &__title {
      padding: 5px;
    }

    &__block {
      width: 5px;
      background: #e8e8e8;
    }
  }

  .description {
    padding: 0px 20px;

    &__priorityBlockHigh {
      padding: 5px 12px;
      background: #D15F45;
      color: white;
      width: fit-content;
      display: inline-block;
    }

    &__priorityBlockRegular {
      padding: 5px 12px;
      background: #48a6a6;
      color: white;
      width: fit-content;
      display: inline-block;
    }

    &__priority {
      margin-bottom: 20px;
    }

    &__associated {
      margin-bottom: 15px;
    }
  }

  .card {
    display: flex;
    align-items: center;
    padding: 20px;

    &__check {
      height: 22px;
      font-size: 21px;
      width: 22px;
      margin-right: 10px;
      color: rgba(0, 0, 0, .6);
      cursor: pointer;
      transition: ease 0.2s;

      &:hover {
        cursor: pointer;
        color: #4ba5a5;
      }
    }

    &__checkDone {
      height: 22px;
      font-size: 21px;
      width: 22px;
      margin-right: 10px;
      color: #4ba5a5;
      cursor: default;
    }

    &__title {
      font-size: 20px;
      margin-bottom: 2px;
    }

    &__date {
      color: rgba(0, 0, 0, .6);
    }
  }

  .activityDetail {
    &__header {
      background: #48A6A6;
      color: white;
      padding: 5px 20px;
    }
  }

  .header {
    display: flex;
    align-items: center;

    &__crud {
      position: absolute;
      right: 20px;
    }

    &__status {
      border: 1px solid white;
      padding: 5px;
      margin-left: 40px;
    }

    &__title {
      font-size: 18px;
      margin-left: 10px;
    }

    &__icon {
      height: 40px;
      min-width: 40px;
      width: 40px;
      background: white;
      font-size: 20px;
      border-radius: 40px;
      color: #4ba5a5;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .icon {
    margin-left: 15px;
    font-size: 16px;
    color: white;
    transition: ease 0.2s;
    cursor: pointer;
  }

  .assignedImage {
    height: 50px;
    width: 50px;
    border-radius: 50px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50px;
    }
  }

  .due {
    margin-right: 6px;
  }


  #editor /deep/ p {
    margin: 0;
  }

  .d-title {
    margin-bottom: 5px;
  }

  .tooltip {
    position: relative;
    display: flex;
    height: 50px;
    width: 50px;
    border-radius: 50px;
    cursor: help;

    .tooltiptext {
      font-size: 14px;
      visibility: hidden;
      width: 140px;
      background-color: #67573e;
      color: #fff;
      text-align: center;
      border-radius: 6px;
      padding: 5px;
      position: absolute;
      z-index: 1;
      bottom: 50px;
      left: 50%;
      margin-left: -75px;
      opacity: 0;
      transition: opacity 0.3s;

      &::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: #67573e transparent transparent transparent;
      }
    }

    &:hover {
      .tooltiptext {
        visibility: visible;
        opacity: 1;
      }
    }

  }
</style>
