<template lang="pug">
  .terms
    .terms__table
      GeneralTable(
        :fields="fields"
        :tableData="paymentTerms"
        :errors="errors"
        :areErrors="areErrors"
        :isApproveModal="isDeleting"
        @closeErrors="closeErrors"
        @approve="deleteTerms"
        @notApprove="cancel"
        @closeModal="cancel"
      )
        template(slot="headerName" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerValue" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerActive" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerIcons" slot-scope="{ field }")
          .table__header {{ field.label }}

        template(slot="name" slot-scope="{ row, index }")
          .table__data(v-if="currentActive !== index") {{ row.name }}
          .table__data(v-else)
            input(type="text" placeholder="Value" v-model="currentName")

        template(slot="value" slot-scope="{ row, index }")
          .table__data(v-if="currentActive !== index") {{ row.value }}
          .table__data(v-else)
            input(type="number" v-model="currentValue")

        template(slot="active" slot-scope="{ row, index }")
          .table__active(v-if="currentActive !== index")
            CheckBox(:isChecked="row.isActive" :isDisabled="true")
          .table__active(v-else)
            CheckBox(:isChecked="row.isActive" @check="toggleActive(index)" @uncheck="toggleActive(index)")

        template(slot="icons" slot-scope="{ row, index }")
          .table__icons
            img.table__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" v-if="isHIdeCRUDIcons(row.name)" :class="{'table__opacity': !isActive(key, index)}")

      .table__empty(v-show="!paymentTerms.length") No data...

    Add(@add="addData")

</template>

<script>
import SettingsTable from "./SettingsTable"
import Add from "../Add"
import { mapActions } from "vuex"
import crudIcons from "@/mixins/crudIcons"
import GeneralTable from "../GeneralTable"
import CheckBox from "../CheckBox"

export default {
  mixins: [ crudIcons ],
  data() {
    return {
      fields: [
        { label: "Title", headerKey: "headerName", key: "name", style: { width: "54%" } },
        { label: "Days", headerKey: "headerValue", key: "value", style: { width: "15%" } },
        { label: "Active", headerKey: "headerActive", key: "active", style: { width: "9%" } },
        { label: "", headerKey: "headerIcons", key: "icons", style: { width: "22%" } }
      ],
      paymentTerms: [],

      currentName: "",
      currentValue: null,
      currentActive: -1,

      areErrors: false,
      errors: [],
      isDeleting: false,
      deleteIndex: -1,

      vendors: [],
      clients: []
    }
  },
  methods: {
    isHIdeCRUDIcons(name) {
      return name !== '30 Days'
          && name !== '21 Days'
          && name !== 'Due on receipt'
    },
    toggleActive(index) {
      if (this.currentActive !== index) return
      this.paymentTerms[index].isActive = !this.paymentTerms[index].isActive
    },
    async makeAction(index, key) {
      if (this.currentActive !== -1 && this.currentActive !== index) return this.isEditing()

      if (key === "save") await this.checkErrors(index)
      if (key === "edit") this.setEditionData(index)
      if (key === "cancel") {
        if (this.currentActive === -1) return
        this.cancel()
        await this.getAndSetPaymentTerms()
      }
      if (key === "delete") {
        if (!this.paymentTerms[index]._id) {
          this.paymentTerms.splice(index, 1)
          return this.cancel()
        }
        this.deleteIndex = index
        this.isDeleting = true
      }
    },
    setEditionData(index) {
      this.currentActive = index
      this.currentName = this.paymentTerms[index].name
      this.currentValue = +this.paymentTerms[index].value
    },
    async checkErrors(index) {
      this.errors = []
      if (this.currentActive === -1) return
      if (!this.currentName) this.errors.push("Name should not be empty!")
      if (!this.currentValue) this.errors.push("Value should not be empty!")

      if (this.errors.length) {
        this.areErrors = true
        return
      }
      await this.saveChanges(index)
    },
    closeErrors() {
      this.areErrors = false
    },
    checkExistingInVendorsAndClients(_id) {
      const allVendorsBI = this.vendors
          .map(item => ({ 'name': item.firstName, 'billingInfo': item.billingInfo }))
          .filter(item => !!item.billingInfo)
          .filter(item => item.billingInfo.paymentTerm._id)
          .map(item => ({ 'name': item.name, 'paymentTerm': item.billingInfo.paymentTerm._id }))

      const allClientsBI = this.clients
          .map(item => ({ 'name': item.name, 'billingInfo': item.billingInfo }))
          .filter(item => !!item.billingInfo && item.billingInfo.length)
          .filter(item => item.billingInfo.find(item2 => item2.paymentTerms._id))
          .map(item => ({ 'name': item.name, 'paymentTerms': item.billingInfo.map(item2 => item2.paymentTerms._id) }))

      const existingInVendors = allVendorsBI.some(item => item.paymentTerm.toString() === _id.toString())
      const existingInClients = allClientsBI.some(item => item.paymentTerms.includes(_id.toString()))

      const res = {
        isExist: existingInVendors || existingInClients
      }
      if (existingInVendors) res.vendors = allVendorsBI.filter(item => item.paymentTerm.toString() === _id.toString()).map(item => item.name).join(', ')
      if (existingInClients) res.clients = allClientsBI.filter(item => item.paymentTerms.includes(_id.toString())).map(item => item.name).join(', ')

      return res
    },
    async saveChanges(index) {
      const { _id, isActive } = this.paymentTerms[index]
      const data = { _id, name: this.currentName, value: this.currentValue, isActive }
      try {
        const result = await this.$http.put("/api-settings/manage-payment-terms", data)
        this.paymentTerms = result.data
        this.alertToggle({ message: "Saved", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Error on saving!", isShow: true, type: "error" })
      } finally {
        this.cancel()
      }
    },
    async deleteTerms() {
      try {
        const { _id } = this.paymentTerms[this.deleteIndex]
        const checkErrors = this.checkExistingInVendorsAndClients(_id)
        this.errors = []
        if (checkErrors.isExist) {
          this.errors.push(`Failed to delete. Existing - ${ checkErrors.vendors ? 'Vendors: ' + checkErrors.vendors : '' }; ${ checkErrors.clients ? 'Clients: ' + checkErrors.clients : '' }`)
        }
        if (this.errors.length) {
          this.areErrors = true
          return
        }
        const result = await this.$http.delete(`/api-settings/payment-terms/${ _id }`)
        this.paymentTerms = result.data
        this.alertToggle({ message: "Removed", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Error on removing!", isShow: true, type: "error" })
      } finally {
        this.cancel()
      }
    },
    cancel() {
      this.currentActive = -1
      this.currentName = ''
      this.currentValue = null
      this.isDeleting = false
    },
    addData() {
      if (this.currentActive !== -1) return this.isEditing()
      this.paymentTerms.push({ name: "", value: "", isActive: true })
      this.setEditionData(this.paymentTerms.length - 1)
      this.$nextTick(() => this.scrollToEnd())
    },
    ...mapActions({
      alertToggle: "alertToggle"
    }),
    scrollToEnd() {
      const element = this.$el.querySelector('tbody')
      element.scrollTop = element.scrollHeight
    },
    async getAndSetPaymentTerms() {
      try {
        const result = await this.$http.get("/api-settings/payment-terms")
        const { paymentTerms, vendors, clients } = result.data
        this.paymentTerms = paymentTerms
        this.vendors = vendors
        this.clients = clients
      } catch (err) {
        this.alertToggle({ message: "Error on getting Payment Terms", isShow: true, type: "error" })
      }
    }
  },
  components: {
    CheckBox,
    GeneralTable,
    SettingsTable,
    Add
  },
  created() {
    this.getAndSetPaymentTerms()
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.terms {
  width: 650px;
  padding: 20px;
  margin: 50px;
  background: white;
  border-radius: 4px;
  box-shadow: $box-shadow;
}

.table {
  &__header,
  &__data {
    padding: 0 7px;
    width: 100%;
    text-align: left;
  }

  &__opacity {
    opacity: 0.5;
    cursor: default;
  }

  &__empty {
    opacity: 0.5;
    margin-top: 10px;
  }

  &__icon {
    cursor: pointer;
  }

  &__active {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  &__icons {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    width: 100%;
    height: 40px;
  }
}

/*;
@import "../../assets/styles/settingsTable";

input {
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}

.discounts {
  @extend %setting-table;
  width: 700px;
  border-radius: 4px;
  margin: 50px;

  &__data {
    @extend %table-data;
  }

  &__editing-data {
    @extend %table-data;
    box-shadow: inset 0 0 7px $brown-shadow;
  }

  &__input {
    @extend %table-text-input;
  }

  &__icons {
    @extend %table-icons;
  }

  &__icon {
    @extend %table-icon;
  }

  &__checkbox {
    width: 22px;
    height: 22px;
    cursor: pointer;
    opacity: 0.5;
  }

  &_centered {
    justify-content: center;
  }

  &_flex {
    display: flex;
    justify-content: space-around;
  }

  &__main-icon, &__file-preview {
    width: 22px;
    height: 22px;
  }

  &__link {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 22px;
  }

  &_opacity {
    opacity: 1;
  }

  &_active {
    box-shadow: inset 0 0 8px $brown-shadow;
  }
}*/

</style>
