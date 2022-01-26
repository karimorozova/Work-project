<template lang="pug">
  .billing-info
    .billing-info__contactModalAuto(v-if="isContactModalAuto")
      .contactModalAuto
        .contactModalAuto__title Clients contacts:
        .contactModalAuto__drops
          SelectMulti(
            :hasSearch="true"
            placeholder="Options"
            :selectedOptions="controlContacts.length ? controlContacts.map(item => `${ item.firstName } ${ item.surname }`) : []"
            :options="clientContacts.map(item => `${ item.firstName } ${ item.surname }`)"
            @chooseOptions="setControlContacts"
          )
        .billing-info__buttons
          Button(value="Add" @clicked="addContactsModalAuto")
          Button(value="Cancel" @clicked="closeContactModalAuto" :outline="true")

    .billing-info__approveModal(v-show="isDeletingModal")
      ApproveModal(
        text="Are you sure?"
        approveValue="Yes"
        notApproveValue="Cancel"
        @approve="deleteContact"
        @close="closeApproveModal"
        @notApprove="closeApproveModal"
      )
    .billing-info__contactModal(v-if="isContactModal")
      ContactsManageModal(
        :contact="controlContact"
        @closeModal="closeContactModal"
        @contactSave="contactSave"
      )
    .billing-info__approveModal(v-if="errors.length")
      ValidationErrors(
        :errors="errors"
        :isAbsolute="true"
        @closeErrors="closeErrors"
      )
    .billing-info__body
      .billing-info__splited-part
        .billing-info__part-one
          .billing-info__title Billing Details

          .billing-info__field
            label Billing name:
              span.require *
            input(v-model="billingInfoCopy.name" placeholder="Value" :class="{'error-shadow': !billingInfoCopy.name && isSaveClicked}")

          .billing-info__field
            label Company name:
              span.require *
            input(v-model="billingInfoCopy.officialName" placeholder="Value" :class="{'error-shadow': !billingInfoCopy.officialName && isSaveClicked}")

          .billing-info__field
            label Payment type:
              span.require *
            .field__select-single
              SelectSingle(
                :class="{'error-shadow': !billingInfoCopy.paymentType && isSaveClicked}"
                :options="['PPP', 'Pre-Payment', 'Monthly', 'Custom']"
                placeholder="Payment Type",
                :selectedOption="billingInfoCopy.paymentType",
                @chooseOption="setPaymentType"
              )
          .billing-info__field
            label Payment terms:
              span.require *
            .field__select-single
              SelectSingle(
                :class="{'error-shadow': (!billingInfoCopy.paymentTerms || !billingInfoCopy.paymentTerms.name) && isSaveClicked}"
                placeholder="Select"
                :options="paymentTerms.map(({name}) => name)"
                :selectedOption="(billingInfoCopy.paymentTerms && billingInfoCopy.paymentTerms.name) || ''"
                @chooseOption="setPaymentTerms"
              )

          .billing-info__field
            label Reports:
            .field__select-single
              SelectMulti(
                placeholder="Option"
                :options="['Report1', 'Report2', 'Report3']"
                :selectedOptions="billingInfoCopy.reports || []"
                @chooseOptions="setReports"
              )

          .billing-info__field
            label Notes:
            textarea(v-model="billingInfoCopy.notes")

        .billing-info__part-two
          .billing-info__title Billing Address

          .billing-info__field
            label Country / Region:
            .field__select-single
              SelectSingle(
                :hasSearch="true"
                placeholder="Option"
                :options="countries"
                :selectedOption="billingInfoCopy.address.country"
                @chooseOption="setCountry"
              )


          .billing-info__field
            label City:
            input(v-model="billingInfoCopy.address.city" placeholder="Value")

          .billing-info__field
            label State:
            .field__select-single
              input(v-model="billingInfoCopy.address.state" placeholder="Value")

          .billing-info__field
            label Zip-code:
            input(v-model="billingInfoCopy.address.zipCode" placeholder="Value")

        .billing-info__part-three
          .billing-info__field
            .billing-info__label-group
              label VAT:
            input(v-model="billingInfoCopy.address.vat" placeholder="Value")

          .billing-info__field
            label Address 1:
            textarea(v-model="billingInfoCopy.address.street1")

          .billing-info__field
            label Address 2:
            textarea(v-model="billingInfoCopy.address.street2")


      .billing-info__addContactsRow(v-if="billingInfo.hasOwnProperty('_id')")
        span Billing Contacts
        .adds
          .addContacts(@click="openContactModal")
            i.fas.fa-plus
            span Add manually
          .addContacts(@click="openContactModalAuto")
            i.fas.fa-plus
            span Add existing contacts
          //Add(@add="openContactModal" style="margin-top: -6px;")


      .items(v-if="billingInfo.hasOwnProperty('_id')")
        .item(v-for="(item, index) in billingInfoCopy.contacts")
          .item__header
            .item__header--name {{ item.firstName }} {{ item.surname || '' }}

            .item__header--icons(v-if="deletingContactId === -1 && editingIndex === -1")
              .item__header--icon(@click="openModalForEdition(index)")
                i(class="fas fa-pen")
              .item__header--icon(@click="openApproveModal(item._id)")
                i(class="fas fa-trash")
            .item__header--icons(v-else)
              .item__header--icon
                i(class="fas fa-pen")
              .item__header--icon
                i(class="fas fa-trash")

          .item__body
            .item__body--key Email:
            .item__body--value {{ item.email || '-' }}

          .item__footer
            .item__footer--title {{ item.position }}

    .billing-info__buttons
      Button(value="Save" :isDisabled="isContactModal || isContactModalAuto" @clicked="checkErrors")
      Button(value="Cancel" :isDisabled="isContactModal || isContactModalAuto" :outline="true" @clicked="closeModal")

</template>

<script>
import SelectSingle from "../SelectSingle"
import Add from "../Add"
import Button from "../Button"
import CheckBox from "../CheckBox"
import ContactsManageModal from "./ContactsManageModal"
import ApproveModal from "../ApproveModal"
import SelectMulti from "../SelectMulti"
import ValidationErrors from "../ValidationErrors"
import Tabs from "../Tabs"
import { mapActions } from "vuex"

export default {
  name: "BillingDetails",
  components: {
    SelectMulti,
    ApproveModal,
    ContactsManageModal,
    SelectSingle,
    Add,
    Button,
    CheckBox,
    ValidationErrors,
    Tabs
  },
  props: {
    billingInfo: {
      type: Object,
      default: {
        address: {}
      }
    },
    clientContacts: {
      type: Array
    }
  },
  data() {
    return {
      countries: [],
      paymentTerms: [],
      billingInfoCopy: JSON.parse(JSON.stringify(this.billingInfo)),
      isContactModal: false,
      isContactModalAuto: false,
      controlContact: {},
      controlContacts: [],
      deletingContactId: -1,
      editingIndex: -1,
      isDeletingModal: false,
      errors: [],
      isSaveClicked: false
    }
  },
  methods: {
    ...mapActions([ 'alertToggle' ]),
    async addContactsModalAuto() {
      if (!this.controlContacts.length) {
        this.closeContactModalAuto()
        return
      }

      await this.addContactToBilling(this.controlContacts, this.billingInfo._id, this.billingInfoCopy )

      // this.$emit('updateBillingInfo')

      // this.billingInfoCopy.hasOwnProperty('contacts')
      //     ? this.billingInfoCopy.contacts.push(...this.controlContacts.filter(({ _id }) => !this.billingInfoCopy.contacts.map(({ _id }) => _id.toString()).includes(_id.toString())))
      //     : this.billingInfoCopy.contacts = [ ...this.controlContacts ]
      // this.closeContactModalAuto()
    },
    async addContactToBilling(contactsToAdd, billingInfoId, billingInfo) {
      const rawContactsIdsToAdd = contactsToAdd.map(({_id}) => _id)

      await this.$http.post("/clientsapi/add-contact-to-bill", {
        clientId: this.$route.params.id,
        billingId: billingInfoId,
        contactsIds: billingInfo.hasOwnProperty('contacts')
            ? rawContactsIdsToAdd.filter(( _id ) => !billingInfo.contacts.map(({ _id }) => _id.toString()).includes(_id.toString()) )
            : rawContactsIdsToAdd
      })
    },

    openContactModalAuto() {
      this.controlContacts = []
      this.isContactModalAuto = true
    },
    closeContactModalAuto() {
      this.isContactModalAuto = false
      this.controlContacts = []
    },
    setControlContacts({ option }) {
      const position = this.controlContacts.findIndex(item => `${ item.firstName } ${ item.surname }` === option)
      if (position !== -1) this.controlContacts.splice(position, 1)
      else this.controlContacts.push(this.clientContacts.find(item => `${ item.firstName } ${ item.surname }` === option))
    },
    async deleteContact() {
      const result = await this.$http.post("/clientsapi/remove-contact-to-bill", {
        clientId: this.$route.params.id,
        billingId: this.billingInfo._id,
        contactId: this.deletingContactId
      })
      this.$emit('updateBillingInfo')
      // this.billingInfoCopy.contacts.splice(this.deletingContactId, 1)
      this.closeApproveModal()
    },
    openApproveModal(id) {
      this.deletingContactId = id
      this.isDeletingModal = true
    },
    closeApproveModal() {
      this.deletingContactId = -1
      this.isDeletingModal = false
    },
    openModalForEdition(index) {
      this.editingIndex = index
      this.controlContact = { ...this.billingInfoCopy.contacts[index] }
      this.isContactModal = true
    },
    async contactSave({ contact, file }) {
      if (!contact.hasOwnProperty('_id')){
        const newContactId = await this.createContact({contact, file})
        await this.addContactToBilling([{_id: newContactId}], this.billingInfo._id, this.billingInfo)

        this.$emit('updateBillingInfo')
        // this.billingInfoCopy.contacts[this.editingIndex] = contact
      } else {
        await this.contactUpdate({contact, file})
        this.$emit('updateBillingInfo')
        // this.billingInfoCopy.hasOwnProperty('contacts') ? this.billingInfoCopy.contacts.push(contact) : this.billingInfoCopy.contacts = [ contact ]
      }
      this.closeContactModal()
    },
    async createContact({ contact, file }) {
      let sendData = new FormData()

      sendData.append("id", this.$route.params.id )
      sendData.append("contact", JSON.stringify(contact))
      sendData.append("photos", file)
      console.log("client",this.clientContacts)
      const result = (await this.$http.post("/clientsapi/addContact", sendData)).data
      this.clientContacts.slice(this.clientContacts - 1, 0 , result.addedContact)
      this.$emit('setContact', { _id: this.$route.params.id, key: 'contacts', value:  this.clientContacts })
      return result.addedContact._id

    },
    async contactUpdate({ contact, file }) {
      let sendData = new FormData()

      sendData.append("id", this.$route.params.id )
      sendData.append("contact", JSON.stringify(contact))
      sendData.append("photos", file)

      const result = (await this.$http.post("/clientsapi/updateContact", sendData)).data
      this.$emit('setContact', { _id: this.$route.params.id, key: 'contacts', value: result.contacts })
      return result.contacts
    },

    closeContactModal() {
      this.controlContact = {}
      this.isContactModal = false
      this.editingIndex = -1
      this.deletingContactId = -1
    },
    openContactModal() {
      this.controlContact = {
        timezone: "",
        leadContact: false,
        firstName: "",
        surname: "",
        email: "",
        gender: "",
        position: "",
        phone: "",
        photo: "",
        country: "",
        notes: ""
      }
      this.isContactModal = true
    },
    setReports({ option }) {
      if (!this.billingInfoCopy.hasOwnProperty('reports')) {
        this.$set(this.billingInfoCopy, 'reports', [])
      }
      const position = this.billingInfoCopy.reports.indexOf(option)
      if (position === -1) {
        this.billingInfoCopy.reports.push(option)
      } else {
        this.billingInfoCopy.reports.splice(position, 1)
      }
    },
    setPaymentType({ option }) {
      this.$set(this.billingInfoCopy, 'paymentType', option)
    },
    setCountry({ option }) {
      this.$set(this.billingInfoCopy.address, 'country', option)
    },
    setState({ option }) {
      this.$set(this.billingInfoCopy.address, 'state', option)
    },
    setPaymentTerms({ option }) {
      this.$set(this.billingInfoCopy, 'paymentTerms', this.paymentTerms.find(i => i.name === option))
    },
    closeModal() {
      this.billingInfoCopy = JSON.parse(JSON.stringify(this.billingInfo))
      this.$emit('closeBillingInfo')
    },
    checkErrors() {
      const allErrors = []
      this.errors = []
      this.isSaveClicked = true
      if (!this.billingInfoCopy.hasOwnProperty('officialName') || !this.billingInfoCopy.officialName.trim().length) {
        allErrors.push('Official Name name cannot be empty.')
      }

      if (!this.billingInfoCopy.hasOwnProperty('name') || !this.billingInfoCopy.name.trim().length) {
        allErrors.push('Name name cannot be empty.')
      }

      if (!this.billingInfoCopy.hasOwnProperty('paymentType') || !this.billingInfoCopy.paymentType.trim().length) {
        allErrors.push('Please select Payment Type.')
      }

      if (!this.billingInfoCopy.hasOwnProperty('paymentTerms') || !this.billingInfoCopy.paymentTerms.hasOwnProperty('name')) {
        allErrors.push('Please select Payment Terms.')
      }

      this.errors.push(...allErrors)
      if (!this.errors.length) {
          this.createBillingInfo()
      }
    },
    createBillingInfo() {
      this.$http.post(`/clientsapi/update-billing-info/${ this.$route.params.id }`, { billingInfo: this.billingInfoCopy })
      if (this.billingInfo.hasOwnProperty("_id")) {
        this.$emit('updateBillingInfo')
      } else  {
        this.$emit('createBillingInfo')
      }
    },
    closeErrors() {
      this.errors = []
    },
    async getAndSetPaymentTerms() {
      try {
        const result = await this.$http.get("/api-settings/payment-terms")
        const { paymentTerms } = result.data
        this.paymentTerms = paymentTerms.filter(i => !!i.isActive)
      } catch (err) {
        this.alertToggle({ message: "Error on getting Payment Terms in Billing Information", isShow: true, type: "error" })
      }
    },
    async getCountries() {
      try {
        const result = await this.$http.get('/api/countries')
        this.countries = result.data
      } catch (err) {
        console.log(err)
      }
    }
  },
  async created() {
    await this.getAndSetPaymentTerms()
    await this.getCountries()
  },
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";

.require {
  margin-left: 2px;
  color: $red;
  font-size: 14px;
}

.contactModalAuto {
  padding: 25px;
  background: white;
  z-index: 15;
  border-radius: 4px;
  box-shadow: $box-shadow;

  &__title {
    margin-bottom: 3px;
  }

  &__drops {
    width: 220px;
    height: 32px;
    position: relative;
  }
}

.adds {
  display: flex;
  gap: 25px;
}

.addContacts {
  display: flex;
  gap: 8px;
  font-size: 14px;
  height: 32px;
  box-sizing: border-box;
  border: 1px solid $border;
  border-radius: 4px;
  padding: 0px 10px;
  cursor: pointer;
  align-items: center;
  font-family: 'Myriad400';
  color: $dark-border;
  transition: .2s ease-out;

  &:hover {
    color: $text;
  }
}

.billing-info {
  box-sizing: border-box;
  margin-bottom: 60px;
  box-shadow: $box-shadow;
  position: relative;
  border-radius: 4px;
  background-color: white;
  padding: 25px;
  width: 786px;

  &__tabs {
    border-bottom: 1px solid #bfbfbf;
  }

  &__addContactsRow {
    font-size: 14px;
    font-family: Myriad600;
    margin-top: 16px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    align-items: center;
    height: 33px;
  }

  &__title {
    font-size: 13px;
    font-family: 'Myriad600';
    margin-bottom: 25px;
  }


  &__contactModalAuto {
    position: absolute;
    z-index: 10;
    left: 33%;
    top: 48%;
  }

  &__approveModal {
    position: absolute;
    z-index: 15;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  &__contactModal {
    position: absolute;
    z-index: 10;
    left: 18%;
    top: 6%;
  }

  &__splited-part {
    display: flex;
    padding-top: 16px;
  }

  &__buttons {
    display: flex;
    justify-content: center;
    gap: 25px;
    margin-top: 24px;
  }

  &__label-group {
    display: flex;
    justify-content: space-between;
  }


  label {
    display: block;
    padding-bottom: 3px;
  }

  .field__select-single {
    position: relative;
    height: 32px;
    width: 220px;
  }

  &__field {
    margin-bottom: 15px;
  }

  &__part-one {
    border-right: 1px solid $light-border;
    padding-right: 30px;
    margin-right: 30px;
  }

  &__part-two {
    margin-right: 15px;
  }

  &__part-three {
    margin-top: 37px;
  }

  &__row {
    display: flex;
    justify-content: space-between;
  }

  input {
    font-size: 14px;
    color: $text;
    border: 1px solid $border;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 0 7px;
    outline: none;
    width: 220px;
    height: 32px;
    transition: .1s ease-out;

    &:focus {
      border: 1px solid $border-focus;
    }
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 5px 0;
  }

}

textarea {
  color: $text;
  height: 64px;
  min-height: 64px;
  width: 220px;
  min-width: 220px;
  max-width: 220px;
  border: 1px solid $border;
  border-radius: 4px;
  outline: none;
  transition: .1s ease-out;
  padding: 7px;
  background-color: white;
  box-sizing: border-box;

  &:focus {
    border: 1px solid $border-focus;
  }
}

.item {
  width: 358px;
  box-sizing: border-box;
  border-radius: 4px;
  border: 1px solid $light-border;
  height: fit-content;

  &__footer {
    border-top: 1px solid $light-border;
    padding: 6px 20px;
    background: $table-list;
    text-align: center;
    color: #666;
    font-family: 'Myriad300';
    letter-spacing: 0.3px;
    font-size: 14px;
    margin-top: 10px;
  }

  &__body {
    padding: 6px 15px;
    display: flex;
    gap: 8px;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid $border;
    padding: 14px 14px 10px 14px;
    margin-bottom: 10px;
    min-height: 18px;

    &--name {
      font-size: 14px;
      font-family: 'Myriad600';
      width: 260px;
    }

    &--icons {
      display: flex;
      gap: 10px;
    }

    &--icon {
      color: $border-focus;
      font-size: 15px;
      cursor: pointer;

      &:hover {
        color: $text;
      }
    }
  }
}

.error-shadow {
  box-shadow: 0 0 5px $red;
}

.items {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
</style>