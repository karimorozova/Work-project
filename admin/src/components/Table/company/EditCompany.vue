<template lang="pug">
  .edit-company
    .modal.modal-border(v-if="isModalOpened")
      CompanyPaymentMethodModal(:editablePaymentMethod="editingId" @savePaymentMethod="savePaymentMethod" @closePaymentMethod="closeModal")
    .modal(v-if="deletingId")
      ApproveModal(
        text="Are you sure?"
        approveValue="Yes"
        notApproveValue="No"
        @approve="deletePaymentMethod"
        @close="closeApproveModal"
        @notApprove="closeApproveModal"
      )
    .edit-company__close(@click.stop="closeCompanyDetails") &#215;
    .title
    .flex-wrapper
      .logo
        .logo-edit
          .photo-wrap(v-if="!company.photo")
            input.photo-file(type="file" @change="previewPhoto")
            .photo-text(v-if="!isImageExist")
              p.photo-text__message(v-if="!isFileError") Upload File
                br
                span.photo-extensions *.jpg/jpeg/png
                span.photo-size <= 3MB
            img.photo-image(v-if="isImageExist")
            p.photo-text__error-message(v-if="isFileError") Incorrect file type or size
          .photo-wrap(v-if="company.photo")
            input.photo-file(type="file" @change="previewPhoto")
            img.photo-image(:src="company.photo")
        .input.input__ia-active
          .input__title Active:
          .input__field
            CheckBox(:isChecked="company.isActive" @check="toggleActive" @uncheck="toggleActive" )
      .main-info
        .input
          .input__title Company Name:
          .input__field
            input(type="text" placeholder="Value" v-model="company.companyName")
        .input
          .input__title Official Company Name:
          .input__field
            input(type="text" placeholder="Value" v-model="company.officialCompanyName")
        .input
          .input__title Finance email:
          .input__field
            input(type="text" placeholder="Value" v-model="company.financeEmail")
        .input
          .input__title Value:
          .input__field
            input(type="text" placeholder="Value" v-model="company.website")
        .input
          .input__title Phone:
          .input__field
            input(type="text" placeholder="Value" v-model="company.phone")
        .input
          .input__title Time Zone:
          .input__select
            SelectSingle(
              placeholder="Option"
              objectKey="zone"
              :options="timeZones"
              :selectedOption="company.timeZone"
              @chooseOption="setTimeZone"
            )
        .input
          .input__title Main Currency:
          .input__select
            SelectSingle(
              placeholder="Option"
              :options="['USD', 'EUR', 'GBP']"
              :selectedOption="company.mainCurrency"
              @chooseOption="setMainCurrency"
            )
        .input
          .input__title Company ID:
          .input__field
            input(type="text" placeholder="Value" v-model="company.companyId")
        .input
          .input__title Tax ID:
          .input__field
            input(type="text" placeholder="Value" v-model="company.taxId")

      .billing-address
        //.title Billing Address
        .input
          .input__title Country/Region:
          .input__select
            SelectSingle(
              placeholder="Option"
              :hasSearch="true"
              :options="countries"
              :selectedOption="company.country"
              @chooseOption="setCountry"
            )
        .input
          .input__title City:
          .input__field
            input(type="text" placeholder="Value" v-model="company.city")
        .input
          .input__title State:
          .input__field
            input(type="text" placeholder="Value" v-model="company.state")
        .input
          .input__title Zip-code:
          .input__field
            input(type="text" placeholder="Value" v-model="company.postCode")
        .input
          .input__title VAT:
          .input__field
            input(type="text" placeholder="Value" v-model="company.vat")
        .input
          .input__title Address 1:
          .input__field
            input(type="text" placeholder="Value" v-model="company.address")
    Button(value="Edit" @clicked="checkErrors")

    .payment-methods
      .payment-methods__body
        .item(v-for="(item, index) in company.paymentMethods")
          .item__header

            .item__header--icons(v-if="deletingId === null && editingId === null")
              .item__header--icon(@click="openModalForEdition(item)")
                i(class="fas fa-pen")
              .item__header--icon(@click="openApproveModal(item)")
                i(class="fas fa-trash")
            .item__header--icons(v-else)
              .item__header--icon
                i(class="fas fa-pen")
              .item__header--icon
                i(class="fas fa-trash")
          .item__body
            .item__body--key Name:
            .item__body--value {{item.name}}
          .item__body
            .item__body--key Payment Type:
            .item__body--value {{ item.paymentType.name }}
          .item__body
            .item__body--key Default:
            .item__body--value
              CheckBox(:isChecked="item.isDefault" @check="toggleDefault(item._id, true)" @uncheck="toggleDefault(item._id, false)")
          .item__body(v-for="[key, value] in Object.entries(allFieldsOutput(item.otherStatement))" )
            .item__body--key {{ replaceKeyName(key) }}:
            .item__body--value {{ value }}

      Add(@add="isModalOpened = true")
</template>

<script>
import CheckBox from "../../CheckBox"
import Button from "../../Button"
import SelectSingle from "../../SelectSingle"
import Add from "../../Add"
import CompanyPaymentMethodModal from "./CompanyPaymentMethodModal"
import photoPreview from "../../../mixins/photoPreview"
import ApproveModal from "../../ApproveModal"

export default {
  name: "EditCompany",
  mixins: [ photoPreview ],
  components: {
    CheckBox,
    Button,
    SelectSingle,
    CompanyPaymentMethodModal,
    Add,
    ApproveModal,
  },
  props: {
    editedId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isLoading: true,
      company: {},
      deletingId: null,
      editingId: null,
      isModalOpened: false,
      timeZones: [],
      countries: [],
      photoFile: [],
      isImageExist: false,
      isFileError: false,
    }
  },
  methods: {
    async toggleDefault(id, status) {
      const result = await this.$http.put(`/api-settings/company/${this.editedId}/payment-method/${id}/is-default`, { status })
      this.company = result.data
    },
    async getCompany() {
      try {
        const result = await this.$http.get(`/api-settings/company/${this.editedId}`)
        this.company = result.data

      } catch (err) {
        this.alertToggle({ message: "Error on getting Payment Methods", isShow: true, type: "error" })
      }
    },
    // async previewPhoto() {
    //   let sendData = new FormData()
    //   let input = document.getElementsByClassName('photo-file')[0]
    //   if (this.checkFile(input.files)) {
    //     // const vendor = JSON.stringify(this.currentVendorFull)
    //     // sendData.append("vendor", vendor)
    //     sendData.append("photo", input.files[0])
    //     try {
    //       // const res = await this.$http.post("/vendorsapi/update-vendor", sendData)
    //       // console.log(res)
    //       this.alertToggle({ message: "Vendor info updated", isShow: true, type: "success" })
    //     } catch (err) {
    //       this.alertToggle({ message: "Server error / Cannot update Vendor info", isShow: true, type: "error" })
    //     }
    //   } else {
    //     this.showFileError(input)
    //   }
    // },
    async savePaymentMethod(data) {
      try {
        const result = await this.$http.post(`/api-settings/company/${this.editedId}/payment-method`, data)
        this.company = result.data
        this.closeModal()
      }catch (err) {
        this.alertToggle({message: "Error on getting Payment Methods", isShow: true, type: "error" })
      }
    },
    toggleActive() {
      this.$set(this.company, 'isActive', !this.company.isActive)
    },
    setTimeZone({ option }) {
      this.$set(this.company, 'timeZone', option)
    },
    setMainCurrency({ option }) {
      this.$set(this.company, 'mainCurrency', option)
    },
    setCountry({ option }) {
      this.$set(this.company, 'country', option)
    },
    checkErrors() {
      this.saveDetails()
    },
    closeCompanyDetails() {
      this.$emit('closeModal')
    },
    async saveDetails() {
      try {
        let sendData = new FormData()
        sendData.append("photo", this.photoFile[0])
        sendData.append("company", JSON.stringify(this.company))
        const result = await this.$http.post(`/api-settings/company/${this.editedId}`, sendData)
        this.company = result.data
      } catch (err) {
        this.alertToggle({ message: "Error on getting Payment Methods", isShow: true, type: "error" })
      }
    },
    async getTimezones() {
      try {
        const result = await this.$http.get('/api/timezones')
        this.timeZones = result.data
      } catch (err) {
        this.alertToggle({ message: "Error on getting Payment Methods", isShow: true, type: "error" })
      }
    },
    async getCompanies() {
      try {
        const result = await this.$http.get('/api/countries')
        this.countries = result.data
      } catch (err) {
        this.alertToggle({ message: "Error on getting Payment Methods", isShow: true, type: "error" })
      }
    },
    allFieldsOutput(item, result = {}) {
      for (const key in item) {
        if ((typeof item[key] === 'object') && key !== 'paymentType') {
          return this.allFieldsOutput(item[key], result)
        } else {
          result = {
            ...result,
            [key]: item[key.name || key]
          }
        }
      }
      delete result._id
      return result
    },
    replaceKeyName(key) {
      if (key === 'paymentType ') return 'Payment Type '
      if (key === 'name') return 'Name'
      return key
    },
    openModalForEdition(item) {
      this.isModalOpened = true
      this.editingId = item
    },
    async openApproveModal(item) {
      this.deletingId = item._id
    },
    closeApproveModal() {
      this.deletingId = null
    },
    async deletePaymentMethod() {
      const result = await this.$http.delete(`/api-settings/company/${this.editedId}/payment-method/${this.deletingId}`)
      this.company = result.data
      this.closeApproveModal()
    },
    closeModal() {
      this.editingId = null
      this.isModalOpened = false
    }
  },
  created() {
    this.getCompany()
    this.getTimezones()
    this.getCompanies()
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";

.edit-company {
  position: relative;
  &__close {
    position: absolute;
    top: -6px;
    right: -5px;
    font-size: 22px;
    cursor: pointer;
    height: 22px;
    width: 22px;
    justify-content: center;
    display: flex;
    align-items: center;
    font-family: Myriad900;
    opacity: 0.8;
    transition: ease 0.2s;

    &:hover {
      opacity: 1
    }
  }
}

.modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -49%);
  z-index: 20;

  &-border {
    padding: 25px;
    background: white;
    box-shadow: rgba(99, 99, 99, 0.12) 0px 0px 1px, rgba(99, 99, 99, 0.2) 0px 1px 2px, rgba(99, 99, 99, 0.05) 0px 2px 1.3px;
  }
}

.payment-methods {
  margin-top: 15px;
  padding-top: 25px;
  border-top: 1px solid $light-border;

  &__body {
    display: flex;
    flex-wrap: wrap;
    gap: 25px;
  }

  &__header {
    display: flex;
    justify-content: space-between;

    &--title {
      font-size: 14px;
      font-family: Myriad600;
    }

    &--add {
      margin-top: -17px;
    }
  }
}

.item {
  width: 307px;
  box-sizing: border-box;
  border-radius: 2px;
  margin-top: 20px;
  border: 1px solid $light-border;
  height: fit-content;

  &__body {
    padding: 6px 15px;
    display: flex;
    gap: 8px;
  }

  &__header {
    display: flex;
    justify-content: end;
    border-bottom: 1px solid $light-border;
    background-color: $light-background;
    padding: 5px 10px;
    margin-bottom: 10px;
    min-height: 18px;

    &--name {
      font-size: 14px;
      font-family: 'Myriad600';
      width: 200px;
    }

    &--icons {
      display: flex;
      gap: 10px;
    }

    &--icon {
      font-size: 14px;
      border-radius: 2px;
      height: 30px;
      width: 30px;
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: .2s ease-out;
      justify-content: center;
      border: 1px solid $border;
      color: $dark-border;
      box-sizing: border-box;
      background-color: white;

      &:hover {
        color: $text;
      }
    }
  }
}
.flex-wrapper {
  display: flex;
  gap: 100px;
}
.input {
  padding-bottom: 15px;
}
.isLoading {
  background: white;
  width: 100%;
  position: absolute;
  z-index: 2;
  height: 100%;
  text-align: center;
  line-height: 50;
}
.input {
  &__select {
    position: relative;
    height: 31px;
    width: 220px;
  }
}

//Photo
.photo-text {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;

  &__message {
    opacity: .4;
    text-align: center;
  }

  &__error-message {
    position: absolute;
    z-index: 12;
    background-color: white;
    color: $red;
    height: 150px;
    width: 150px;
    display: flex;
    align-items: center;
    padding: 10px;
    box-sizing: border-box;
    font-size: 14px;
    text-align: center;
  }
}

.photo-wrap {
  width: 150px;
  height: 150px;
  border: 2px solid $light-border;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8%;
  background-color: white;

  .photo-image {
    object-fit: cover;
    height: 150px;
    width: 150px;
  }
}

.photo-file {
  position: absolute;
  top: -24px;
  height: 172px;
  width: 150px;
  background-color: transparent;
  outline: none;
  border: none;
  z-index: 5;
  cursor: pointer;
  border-radius: 8%;
}


.input__field > input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 2px;
  box-sizing: border-box;
  padding: 0 7px;
  outline: none;
  height: 32px;
  transition: .1s ease-out;
  width: 220px;
  font-family: 'Myriad400';

  &:focus {
    border: 1px solid $border-focus;
  }
}
.input__ia-active {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  justify-content: center;
}
</style>