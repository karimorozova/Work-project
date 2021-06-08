<template lang="pug">
  .task
    .modal
      ApproveModal(
        v-if="approveModal.show"
        text="Are you sure?"
        approveValue="Yes"
        notApproveValue="Cancel"
        @approve="approve"
        @notApprove="notApprove"
        @close="notApprove"
      )
      ApproveModal(
        v-if="showApproveDelete"
        text="Are you sure?"
        approveValue="Yes"
        notApproveValue="Cancel"
        @approve="approveDelete"
        @notApprove="close"
        @close="close"
      )
    .header
      .header__icon
        i.fas.fa-clipboard
      .header__title Note {{item}}
      .header__crud
        span.icon(
          v-if="(data.assignedTo._id.toString() === user._id.toString() || isAdmin) && data.status !== 'Completed'"
          @click="edit(data)"
        )
          i.fas.fa-pencil-alt
        span.icon(
          v-if="(data.assignedTo._id.toString() === user._id.toString() || isAdmin) && data.status !== 'Completed'"
          @click="deleteTask()"
        )
          i.fas.fa-trash
    .main-info
      .main-info__check(
        :class="{notActive: data.assignedTo._id.toString() !== user._id.toString() && !isAdmin}"
      )
        i.far.fa-check-circle
      .main-info__data
        .main-info__title {{data.title}}
      .main-info__date
        span.due Due:
        span {{data.dateTime | formatDate}}
    .details
      .details__header(@click="clickDetails")
        .details__icon
          i.fas.fa-chevron-down(v-if="showDetails")
          i.fas.fa-chevron-right(v-else)
        .details__text Details
      .details__data(v-if="showDetails")
        .blocks
          .block
            .description__assigned
              .d-title Created by:
              .assignedImage
                .tooltip
                  span#myTooltip.tooltiptext {{data.assignedTo.firstName}} {{data.assignedTo.lastName}}
                  img(src="../../../assets/images/signin-background.jpg")
          .block(v-if="data.associatedTo[0]")
            .description__associated
              .d-title Associated with:
              .description__associatedList(v-for="user in data.associatedTo")
                .associatedUser
                  .associatedUser__block
                  .associatedUser__title {{user.firstName}} {{user.surname}}
          .block
            .description__details
              .d-title Details:
              .details__data(id="editor" v-html="data.details")
</template>

<script>
	import {mapGetters, mapActions} from "vuex";
  import ApproveModal from "../../ApproveModal";

  export default {
		props: {
      data: null,
		},
		data() {
			return {
        showDetails: this.data.status === "Upcoming",
        approveModal: {
          item: null,
          show: false
        },
        showApproveDelete: false
      }
		},
		methods: {
		  ...mapActions({
        setUpClientProp: "setUpClientProp",
        alertToggle: "alertToggle",
      }),
			clickDetails() {
				this.showDetails = !this.showDetails
			},
      setUpcomingStatus(item) {
        if (item.assignedTo._id.toString() !== this.user._id.toString() && !this.isAdmin) {
          return
        }
		    this.approveModal = {
		      item: item,
          show: true
        }
      },
      edit(data) {
        this.$emit('editActivityDetailsNote', data)
        this.close()
      },
      deleteTask() {
        this.showApproveDelete = true
      },
      async approveDelete() {
        try {
          const activityNotes = await this.$http.delete(`/clientsapi/activity/note/${ this.data._id }?client=${ this.data.client }`)
          this.setUpClientProp({ key: "activityNotes", value: activityNotes.data })
          this.close()
        } catch (e) {
          this.alertToggle({ message: "Error on deleting activityNotes", isShow: true, type: "error" })
        }

      },
      close() {
		    this.showApproveDelete = false
      }
		},
    computed: {
      ...mapGetters({
        user: "getUser"
      }),
      isAdmin() {
        return this.user.group.name === 'Administrators' || this.user.group.name === 'Developers'
      },
      details() {

      }
    },
    components: { ApproveModal },
	}
</script>

<style lang="scss" scoped>

  .notActive {
    cursor: default !important;
    opacity: 0.4;
  }
  .task {
    border: 1px solid #e8e8e8;
    padding: 20px;
    background: #fff;
    height: fit-content;
    margin-bottom: 20px;
  }

  .modal{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .header {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #daeded;
    padding-bottom: 10px;

    &__title {
      font-size: 20px;
      margin-left: 10px;
    }

    &__icon {
      height: 40px;
      min-width: 40px;
      width: 40px;
      background: #daeded;
      font-size: 20px;
      border-radius: 40px;
      color: #4ba5a5;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    &__crud {
      margin-left: auto;
      & .icon {
        margin-left: 10px;
        cursor: pointer;
      }
    }


  }

  .main-info {
    display: flex;
    align-items: center;
    padding: 20px 0;

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
      cursor: pointer;
    }

    &__title {
      font-size: 21px;
    }

    &__date {
      color: rgba(0, 0, 0, .6);
      margin-left: auto;

      & .due {
        margin-right: 5px;
      }
    }
  }

  .details {
    &__header {
      font-size: 16px;
      display: flex;
      cursor: pointer;
      padding-bottom: 5px;
    }

    &__icon {
      color: #48a6a6;
      min-width: 15px;
    }

    &__text {
      margin-left: 5px;
    }
  }

  .blocks {
    border-top: 1px solid #ccc;
    padding-top: 15px;
    width: 100%;
    display: flex;
  }

  .block {
    margin-right: 30px;
  }

  .description {
    padding: 0px 20px;

    &__priorityBlockHigh {
      display: inline-block;
      padding: 5px 12px;
      background: #D15F45;
      color: white;
      width: fit-content;
    }

    &__priorityBlockRegular {
      padding: 5px 12px;
      background: #48a6a6;
      color: white;
      width: fit-content;
    }

    &__priority {
      margin-bottom: 20px;
    }

    &__associated {
      margin-bottom: 15px;
    }
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
      left: 146%;
      margin-left: -75px;
      opacity: 0;
      transition: opacity 0.3s;

      &::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 18%;
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

  .d-title{
    margin-bottom: 5px;
  }

  #editor /deep/ p {
    margin: 0;
  }

</style>
