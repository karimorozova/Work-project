<template lang="pug">
  .edit-company
    .edit-company__close(@click.stop="closeCompanyDetails") &#215;
    .title
    .body
      .logo-edit
      .main-info
        .input
          .input__title Active:
          .input__field
            CheckBox(:isChecked="company.isActive" @check="toggleActive" @uncheck="toggleActive" )
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
        .title Billing Address
        .input
          .input__title Country/Region:
          .input__select
            SelectSingle(
              placeholder="Option"
              :options="['Country 1', 'Country 2', 'Country 3']"
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
</template>

<script>
import CheckBox from "../../CheckBox"
import Button from "../../Button"
import SelectSingle from "../../SelectSingle"

export default {
  name: "EditCompany",
  components: {
    CheckBox,
    Button,
    SelectSingle,
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
      timeZones: [],

    }
  },
  methods: {
    async getCompany() {
      try {
        const result = await this.$http.get(`/api-settings/company/${this.editedId}`)
        this.company= result.data

      } catch (err) {
        this.alertToggle({ message: "Error on getting Payment Methods", isShow: true, type: "error" })
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
        const result = await this.$http.post(`/api-settings/company/${this.editedId}`, this.company)
        console.log({t: result.data})
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
    }

  },
  created() {
    this.getCompany()
    this.getTimezones()
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


  input {
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
</style>