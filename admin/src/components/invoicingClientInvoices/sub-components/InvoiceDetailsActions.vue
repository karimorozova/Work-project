<template lang="pug">
  .template
    .modal-sender(v-if="isEmailSender")
      MailChips(

      )
      .modal-sender__buttons
        Button(value="Send" :isDisabled="!!requestCounter || !selectedMails.length" v-if="" @clicked="sendInvoice")
        Button(value="Cancel" :isDisabled="!!requestCounter" @clicked="closeEmailSender" :outline="true")


    .details
      .details__invoice
        .details__invoice-title Actions

      .icons
        IconButton(
          :popupText="'Edit Invoice'"
          @clicked="editInvoice"
        )
          i.fas.fa-pen

        IconButton(
          :popupText="'Send Invoice'"
          @clicked="openEmailSender"
        )
          i.fa-solid.fa-envelope



</template>

<script>
import IconButton from "../../IconButton"
import MailChips from "../../MailChips";
import Button from "../../Button";
import { mapGetters } from "vuex";


export default {
  name: "InvoiceDetailsActions",
  components: {Button, MailChips, IconButton },
  props: {
    invoice: {
      type: Object
    }
  },
  data() {
    return {
      selectedMails: [],
      isEmailSender: false,
    }
  },
  methods: {
    editInvoice() {
      this.$router.push(`/pangea-finance/receivables-reports/invoice/${ this.$route.params.id }/edit`)
    },
    openEmailSender(){
      // const { accountManager } = this.invoice
      // this.selectedMails.push({
      //   _id: accountManager._id,
      //   email: accountManager.email,
      //   photo: accountManager.photo,
      //   firstName: accountManager.firstName
      // })
      // console.log(this.invoice)
      this.isEmailSender = true
    },
    closeEmailSender(){
      this.isEmailSender = false
    },
    sendInvoice(){
      console.log('asdas')
    },
  },
  computed: {
    ...mapGetters({
      requestCounter: 'getRequestCounter'
    })
  },
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

.modal-sender{
  position: absolute;
  width: 600px;
  left: 400px;
  top: 50%;
  padding: 25px;
  background: white;
  border-radius: 2px;
  box-shadow: $box-shadow;

  &__buttons{
    display: flex;
    justify-content:center;
    gap: 20px;
    margin-top: 25px;
  }
}
</style>
