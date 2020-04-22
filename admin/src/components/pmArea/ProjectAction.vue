<template lang="pug">
.project-action
    .project-action__preview(v-if="isEditAndSend")
        Preview(@closePreview="closePreview" :message="previewMessage" @send="sendMessage")

    .project-action__title Project Action: 
    .project-action__drop-menu
        SelectSingle(
            :selectedOption="selectedAction"
            :options="filteredActions"
            placeholder="Select Action"
            @chooseOption="setAction"
        )

    .project-action__confirm(v-if="isAction('Accept/Reject Quote')")
        .project-action__button
            Button(:value="'Accept'" @clicked="makeApprovedAction")
        .project-action__button(v-if="isAlternativeAction")
            Button(:value="'Reject'" @clicked="makeAlterAction")

    div(v-if="isAction('Send a Quote')")
        .project-action__confirm
                Button(:value="'Edit & Send'" @clicked="getSendQuoteMessage")
    div(v-if="isAction('Send Project Details')")
        .project-action__confirm
                Button(:value="'Edit & Send'" @clicked="getProjectDetailsMessage")

    div(v-if="isAction('Cancel')")
        .project-action__drop-menu
            SelectSingle(
                :selectedOption="selectedReason"
                :options="reasons"
                placeholder="Select Reason"
                @chooseOption="setReason"
            )
        span More Information:
        textarea(type="text" v-model="moreInformation" rows="4" class="project-action__text-input")
        div(v-if="project.status === 'In progress'")
            .project-action__payment
                .project-action__payment-span
                    span Partial Payment
                .project-action__checkbox
                    label.switch
                        input(type='checkbox' :checked="isPay" v-model="isPay")
                        span.slider.round
        .project-action__confirm
            Button(:value="'Confirm'" @clicked="getCancelMessage")

</template>

<script>
import Preview from "../vendors/VendorPreview";
import SelectSingle from "../SelectSingle";
import Button from "../Button";
import { mapGetters, mapActions } from "vuex";

export default {
  props: {
    project: {
      type: Object
    }
  },
  data() {
    return {
      previewMessage: "",
      selectedAction: "",
      selectedReason: "",
      moreInformation: "",
      reasons: [],
      actions: ["Cancel"],
      approveButtonValue: "Confirm",
      alternativeButtonValue: "Reject",
      isAlternativeAction: false,
      isEditAndSend: false,
      isPay: false
    };
  },
  methods: {
    closePreview() {
      this.isEditAndSend = false;
    },
    openPreview() {
      this.isEditAndSend = true;
    },
    async getCancelMessage() {
      const template = await this.$http.post("/pm-manage/get-cancel-message", {
        ...this.project,
        reason: this.selectedReason
      });
      this.previewMessage = template.body.message;
      this.openPreview();
    },
    async getSendQuoteMessage() {
      const template = await this.$http.get(
        `/pm-manage/quote-message?projectId=${this.project._id}`
      );
      this.previewMessage = template.body.message;
      this.openPreview();
    },
    async getProjectDetailsMessage() {
      const template = await this.$http.get(
        `/pm-manage/project-details?projectId=${this.project._id}`
      );
      this.previewMessage = template.body.message;
      this.openPreview();
    },
    async sendMessage(message) {
      try {
        this.makeApprovedAction(message);
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" });
      }
      this.closePreview();
    },
    isAction(action) {
      return this.selectedAction === action ? true : false;
    },
    setDefaults() {
      this.selectedAction = "";
      this.approveButtonValue = "Confirm";
      this.isAlternativeAction = false;
    },
    setReason({ option }) {
      this.selectedReason = option;
    },
    setAction({ option }) {
      this.selectedAction = option;
      this.isAlternativeAction = false;
      if (this.selectedAction === "Accept/Reject Quote") {
        this.approveButtonValue = "Accept";
        (this.alternativeButtonValue = "Reject"),
          (this.isAlternativeAction = true);
      }
    },
    async makeApprovedAction(message) {
      try {
        switch (this.selectedAction) {
          case "Send a Quote":
            await this.clientQuote(message);
            break;
          case "Send Project Details":
            await this.projectDetails(message);
            break;
          case "Accept/Reject Quote":
            await this.acceptQuote();
            break;
          case "Cancel":
            await this.cancelProject(message);
            break;
        }
      } catch (err) {
        this.alertToggle({
          message: "Internal server error. Cannot execute chosen action.",
          isShow: true,
          type: "error"
        });
      } finally {
        this.setDefaults();
      }
    },
<<<<<<< HEAD
    async clientQuote(message) {
      try {
        await this.sendClientQuote({ message });
        this.alertToggle({
          message: "Details sent",
          isShow: true,
          type: "success"
        });
      } catch (err) {
        this.alertToggle({
          message: err.message,
          isShow: true,
          type: "error"
        });
      }
    },
    async projectDetails(message) {
      try {
        await this.sendProjectDetails({ message });
        this.alertToggle({
          message: "Details sent",
          isShow: true,
          type: "success"
        });
      } catch (err) {
        this.alertToggle({
          message: err.message,
          isShow: true,
          type: "error"
        });
      }
    },
    async makeAlterAction() {
      try {
        switch (this.selectedAction) {
          case "Accept/Reject Quote":
            await this.rejectQuote();
            break;
=======
    methods: {
        setDefaults() {
            this.selectedAction = "";
            this.approveButtonValue = "Confirm";
            this.isAlternativeAction = false;
        },
        setAction({option}) {
            this.selectedAction = option;
            this.isAlternativeAction = false;
            if(this.selectedAction === "Send a Quote" || this.selectedAction === "Send Project Details") {
                this.approveButtonValue = "Edit & Send"
            }
            if(this.selectedAction === "Cancel") {
                this.approveButtonValue = "Confirm"
            }
            if(this.selectedAction === "Accept/Reject Quote") {
                this.approveButtonValue = "Accept";
                this.alternativeButtonValue = "Reject",
                this.isAlternativeAction = true
            }
        },
        async makeApprovedAction() {
            try {
                switch(this.selectedAction) {
                    case "Send a Quote":
                        const message = await this.$http.get(`/pm-manage/quote-message?projectId=${this.project._id}`);
                        this.$emit("editAndSend", { message, subject: "quote" });
                        break;
                    case "Send Project Details":
                        const details = await this.$http.get(`/pm-manage/project-details?projectId=${this.project._id}`);
                        this.$emit("editAndSend", { message: details, subject: "details" });
                        break;
                    case "Accept/Reject Quote":
                        await this.acceptQuote();
                        break;
                    case "Deliver":
                        await this.deliverProject();
                        break;
                    case "Cancel":
                        await this.cancelProject();
                        break;
                }
            } catch(err) {
                this.alertToggle({message: 'Internal server error. Cannot execute chosen action.', isShow: true, type: 'error'})
            } finally {
                this.setDefaults();
            }
        },
        async makeAlterAction() {
            try {
                switch(this.selectedAction) {
                    case "Accept/Reject Quote":
                        await this.rejectQuote();
                        break;
                }
            } catch(err) {
                this.alertToggle({message: 'Internal server error. Cannot execute chosen action.', isShow: true, type: 'error'})
            } finally {
                this.setDefaults();
            }
        },
        async cancelProject() {
            if(this.project.status === "Delivered" || this.project.status === "Closed") return;
            try {
                await this.setStatus('Cancelled');
            } catch(err) { }
        },
        async setStatus(status) {
            try {
                await this.setProjectStatus({status});
                this.alertToggle({message: "Project's status changed", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: err.message, isShow: true, type: "error"});
            }
        },
        async acceptQuote() {
            const status = this.project.isStartAccepted ? "Started" : "Approved";
            try {
                await this.setStatus(status);
            } catch(err) { }
        },
        async rejectQuote() {
            try {
                await this.setStatus("Rejected");
            } catch(err) { }
        },
        async sendQuote() {
            try {
                const result = await this.$http.post('/pm-manage/send-quote', {id: this.project._id});
                await this.storeProject(result.body);
                this.alertToggle({message: 'The Quote has been sent', isShow: true, type: 'success'})
            } catch(err) {
                this.alertToggle({message: 'Internal server error. Cannot send the Quote.', isShow: true, type: 'error'})
            }
        },
        async deliverProject() {
            try {
                await this.deliverProjectToClient(this.project._id);
            } catch(err) {              
            }
        },
        ...mapActions({
            alertToggle: "alertToggle",
            storeProject: "setCurrentProject",
            setProjectStatus: "setProjectStatus",
            deliverProjectToClient: "deliverProjectToClient"
        }),
    },
    computed: {
        filteredActions() {
            let result = this.actions;
            const nonStartedStatuses = ["Draft", "Quote sent", "Requested", "Cancelled"]
            if(this.project.status === "Approved") {
                result = ["Send a Quote", "Cancel"];
            }
            if(this.project.finance.Price.receivables && nonStartedStatuses.indexOf(this.project.status) !== -1) {
                result = ["Send a Quote", "Accept/Reject Quote", "Cancel"];
            }
            if(this.project.status === "Started" || this.project.status === "In progress") {
                result = ["Send Project Details", "Cancel"];
            }
            if(this.project.status === "Ready for Delivery") {
                result = ["Deliver", "Cancel"];
            }
            if(this.project.status === "Closed") {
                result = ["Deliver"];
            }
            return result;
>>>>>>> master
        }
      } catch (err) {
        this.alertToggle({
          message: "Internal server error. Cannot execute chosen action.",
          isShow: true,
          type: "error"
        });
      } finally {
        this.setDefaults();
      }
    },
    async cancelProject(message) {
      if (
        this.project.status === "Delivered" ||
        this.project.status === "Closed"
      )
        return;
      try {
        await this.setStatus("Cancelled", message);
      } catch (err) {}
    },
    async setStatus(status, message) {
      try {
        await this.setProjectStatus({
          status,
          message,
          reason: this.selectedReason,
          isPay: this.isPay
        });
        this.alertToggle({
          message: "Project's status changed",
          isShow: true,
          type: "success"
        });
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" });
      }
    },
    async acceptQuote() {
      const status = this.project.isStartAccepted ? "Started" : "Approved";
      try {
        await this.setStatus(status);
      } catch (err) {}
    },
    async rejectQuote() {
      try {
        await this.setStatus("Rejected");
      } catch (err) {}
    },
    // async sendQuote() {
    //   try {
    //     const result = await this.$http.post("/pm-manage/send-quote", {
    //       id: this.project._id
    //     });
    //     await this.storeProject(result.body);
    //     this.alertToggle({
    //       message: "The Quote has been sent",
    //       isShow: true,
    //       type: "success"
    //     });
    //   } catch (err) {
    //     this.alertToggle({
    //       message: "Internal server error. Cannot send the Quote.",
    //       isShow: true,
    //       type: "error"
    //     });
    //   }
    // },
    isAnyTaskReady() {
      return this.project.tasks.find(
        item => item.status === "Ready for Delivery"
      );
    },
    ...mapActions({
      alertToggle: "alertToggle",
      storeProject: "setCurrentProject",
      setProjectStatus: "setProjectStatus",
      sendClientQuote: "sendClientQuote",
      sendProjectDetails: "sendProjectDetails"
    })
  },
  computed: {
    filteredActions() {
      let result = this.actions;
      const nonStartedStatuses = [
        "Draft",
        "Quote sent",
        "Requested",
        "Cancelled"
      ];
      if (this.project.status === "Approved") {
        result = ["Send a Quote", "Cancel"];
      }
      if (
        this.project.finance.Price.receivables &&
        nonStartedStatuses.indexOf(this.project.status) !== -1
      ) {
        result = ["Send a Quote", "Accept/Reject Quote", "Cancel"];
      }
      if (
        this.project.status === "Started" ||
        this.project.status === "In progress"
      ) {
        result = ["Send Project Details", "Cancel"];
      }
      if (this.isAnyTaskReady()) {
        result = ["Deliver", "Cancel"];
      }
      return result;
    }
  },
  components: {
    SelectSingle,
    Preview,
    Button
  },
  async created() {
    const reasons = await this.$http.get("/api/reasons");
    for (let key in reasons.data) this.reasons.push(reasons.data[key].reason);
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.project-action {
  padding: 10px 20px;
  box-shadow: 0 3px 20px $brown-shadow;
  box-sizing: border-box;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  &__payment {
    margin-bottom: 10px;
    &-span {
      vertical-align: sub;
      display: inline-block;
    }
  }
  &__text-input {
    width: 191px;
    margin-top: 10px;
    border-radius: 10px;
    border: 1px solid #68573e;
    padding: 5px;
    color: #68573e;
    resize: none;
    outline: none;
    box-sizing: border-box;
    margin-bottom: 10px;
  }
  &__title {
    padding-bottom: 5px;
    font-size: 20px;
    border-bottom: 1px solid $brown-border;
    margin-bottom: 30px;
  }
  &__drop-menu {
    width: 191px;
    height: 28px;
    position: relative;
    margin-bottom: 20px;
  }
  &__confirm {
    display: flex;
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
            background-color: #67573e;
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
}
</style>
