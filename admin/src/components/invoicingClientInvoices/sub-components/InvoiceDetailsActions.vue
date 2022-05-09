<template lang="pug">
  .template
    .modal(v-if="isApproveModal")
      ApproveModal(
        text="Are you sure?"
        approveValue="Yes"
        notApproveValue="Cancel"
        @approve="deleteInvoice"
        @notApprove="closeModal"
        @close="closeModal"
      )
    .modal-sender(v-if="isEmailSender")
      MailChips(
        :emails="emails"
        @emailAction="fillSelectedEmail"
      )
      .modal-sender__buttons
        Button(value="Send" :isDisabled="!!requestCounter && !selectedMails.length" @clicked="sendInvoice")
        Button(value="Cancel" :isDisabled="!!requestCounter" @clicked="closeEmailSender" :outline="true")

    .details
      .details__invoice
        .details__invoice-title Actions

      .icons
        IconButton(
          :popupText="'Edit Invoice'"
          @clicked="editInvoice"
          :isDisabled="invoice.status === 'Paid'"
        )
          i.fas.fa-pen

        IconButton(
          :popupText="'Send Invoice'"
          @clicked="openEmailSender"
          :isDisabled="invoice.status === 'Paid'"
        )
          i.fa-solid.fa-envelope

        IconButton(
          :popupText="'Download invoice file'"
          @clicked="downloadInvoiceFile(invoice.invoiceFile.path)"
          :isDisabled="!invoice.invoiceFile.path"
        )
          i(class="fa-solid fa-download")

        IconButton(
          :popupText="'Delete Invoice'"
          @clicked="openDeleteModal"
          :isDisabled="invoice.status === 'Paid'"
        )
          i(class="fa-solid fa-trash")

        Button(v-if="invoice.status === 'Sent'" value="Paid" @clicked="payInvoice")


</template>

<script>
import IconButton from "../../IconButton"
import MailChips from "../../MailChips"
import Button from "../../Button"
import ApproveModal from "../../ApproveModal"
import { mapActions, mapGetters } from "vuex"


export default {
  name: "InvoiceDetailsActions",
  components: { Button, MailChips, IconButton, ApproveModal },
  props: {
    invoice: {
      type: Object
    }
  },
  data() {
    return {
      selectedMails: [],
      isEmailSender: false,
      emails: [],
      isApproveModal: false
    }
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle"
    }),
    deleteInvoice() {
      this.$emit('deleteInvoice')
    },
    openDeleteModal() {
      this.isApproveModal = true
    },
    closeModal() {
      this.isApproveModal = false
    },
    async payInvoice() {
      await this.$http.post(`/invoicing/invoice/${ this.$route.params.id }/pay`)
      this.refreshInvoice()
    },
    refreshInvoice() {
      this.$emit('refreshInvoice')
    },
    downloadInvoiceFile(path) {
      let link = document.createElement('a')
      link.href = this.$domains.admin + '/' + path
      link.target = "_blank"
      link.click()
    },
    fillSelectedEmail(emailArr) {
      this.selectedMails = emailArr
    },
    editInvoice() {
      this.$router.push(`/pangea-finance/receivables-reports/invoice/${ this.$route.params.id }/edit`)
    },
    openEmailSender() {
      const { clientBillingInfo, customer: { billingInfo, contacts: allCustomerContacts } } = this.invoice
      const { contacts } = billingInfo.find(({ _id }) => `${ _id }` === `${ clientBillingInfo }`)

      this.emails = contacts.map(id => {
        const { _id, email, photo, firstName, surname } = allCustomerContacts.find(({ _id }) => `${ _id }` === id)
        return {
          _id, email, photo, firstName: `${ firstName } ${ surname } || ''`
        }
      })
      this.isEmailSender = true
    },
    closeEmailSender() {
      this.isEmailSender = false
    },
    async sendInvoice() {
      try {
        await this.$http.post('/invoicing/send-invoice', { _invoiceId: this.invoice._id, clientContactsEmails: this.selectedMails })
        this.alertToggle({ message: "Invoice sent", isShow: true, type: "success" })
        this.closeEmailSender()
        this.refreshInvoice()
      } catch (err) {
        console.log(err)
      }
    }
  },
  computed: {
    ...mapGetters({
      requestCounter: 'getRequestCounter'
    })
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.template {
  width: 400px;
  box-sizing: border-box;
  border-radius: 2px;
  box-shadow: $box-shadow;
  padding: 25px;
  background: white;
}

.details {
  &__invoice {
    margin-bottom: 20px;
    border-bottom: 1px solid $light-border;
    width: 100%;
    padding-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &-title {
      font-size: 16px;
      font-family: 'Myriad600';
    }
  }
}

.icons {
  display: flex;
  flex-wrap: wrap;

  .button-wrapper {
    margin-bottom: 12px;
    margin-right: 12px;
  }
}

.modal {
  position: absolute;
  width: 600px;
  left: 600px;
  top: 320px;
}

.modal-sender, .modal-delete {
  position: absolute;
  width: 600px;
  left: 400px;
  top: 320px;
  padding: 25px;
  background: white;
  border-radius: 2px;
  box-shadow: $box-shadow;

  &__buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 25px;
  }
}
</style>
