<template lang="pug">
  .terms
    .terms__table
      GeneralTable(
        :fields="fields"
        :tableData="paymentMethods"
        :errors="errors"
        :areErrors="areErrors"
        :isApproveModal="isDeleting"
        @closeErrors="closeErrors"
        @approve="deleteMethod"
        @notApprove="cancel"
        @closeModal="cancel"
      )
        template(slot="headerName" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerFields" slot-scope="{ field }")
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

        template(slot="fields" slot-scope="{ row, index }")
          .table__data(v-if="currentActive !== index") {{ row.keys.map(({key}) => key).join("; ") }}
          .table__drop(v-else)
            SelectMulti(
              placeholder="Options"
              :options="paymentMethodsKeys.map(i => i.key)"
              :selectedOptions="currentKeys.map(i => i.key)"
              @chooseOptions="chooseKeys"
            )

        template(slot="value" slot-scope="{ row, index }")
          .table__data(v-if="currentActive !== index") {{ row.minimumAmount }}
          .table__data(v-else)
            input(type="number" v-model="currentMinimumAmount")

        template(slot="active" slot-scope="{ row, index }")
          .table__active(v-if="currentActive !== index")
            CheckBox(:isChecked="row.isActive" :isDisabled="true")
          .table__active(v-else)
            CheckBox(:isChecked="row.isActive" @check="toggleActive(index)" @uncheck="toggleActive(index)")

        template(slot="icons" slot-scope="{ row, index }")
          .table__icons
            img.table__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'table__opacity': !isActive(key, index)}")

      .table__empty(v-show="!paymentMethods.length") No data...

    Add(@add="addData")

</template>

<script>
import Add from "../../Add"
import { mapActions } from "vuex"
import crudIcons from "@/mixins/crudIcons"
import GeneralTable from "../../GeneralTable"
import CheckBox from "../../CheckBox"
import SelectMulti from "../../SelectMulti"

export default {
  mixins: [ crudIcons ],
  data() {
    return {
      fields: [
        { label: "Title", headerKey: "headerName", key: "name", style: { width: "27%" } },
        { label: "Fields", headerKey: "headerFields", key: "fields", style: { width: "27%" } },
        { label: "Minimum Amount", headerKey: "headerValue", key: "value", style: { width: "18%" } },
        { label: "Active", headerKey: "headerActive", key: "active", style: { width: "8%" } },
        { label: "", headerKey: "headerIcons", key: "icons", style: { width: "20%" } }
      ],
      paymentMethods: [],
      paymentMethodsKeys: [],

      currentName: "",
      currentMinimumAmount: null,
      currentKeys: [],
      currentIsActive: true,

      currentActive: -1,
      areErrors: false,
      errors: [],
      isDeleting: false,
      deleteIndex: -1
    }
  },
  methods: {
    chooseKeys({ option }) {
      if (!this.currentKeys.length) return this.currentKeys.push(this.paymentMethodsKeys.find(({ key }) => key === option))

      const position = this.currentKeys.findIndex(({ key }) => key === option)
      if (position !== -1) {
        this.currentKeys.splice(position, 1)
      } else {
        this.currentKeys.push(this.paymentMethodsKeys.find(({ key }) => key === option))
      }
    },
    toggleActive(index) {
      if (this.currentActive !== index) return
      this.currentIsActive = !this.currentIsActive
    },
    async makeAction(index, key) {
      if (this.currentActive !== -1 && this.currentActive !== index) return this.isEditing()

      if (key === "save") await this.checkErrors(index)
      if (key === "edit") this.setEditionData(index)
      if (key === "cancel") {
        if (this.currentActive === -1) return
        this.cancel()
        await this.getPaymentsMethods()
      }
      if (key === "delete") {
        if (!this.paymentMethods[index]._id) {
          this.paymentMethods.splice(index, 1)
          return this.cancel()
        }
        this.deleteIndex = index
        this.isDeleting = true
      }
    },
    setEditionData(index) {
      this.currentActive = index
      this.currentName = this.paymentMethods[index].name
      this.currentMinimumAmount = this.paymentMethods[index].minimumAmount
      this.currentKeys = this.paymentMethods[index].keys
      this.currentIsActive = this.paymentMethods[index].isActive
    },
    async checkErrors(index) {
      this.errors = []
      if (this.currentActive === -1) return
      if (!this.currentName) this.errors.push("Name should not be empty!")
      if (!this.currentMinimumAmount) this.errors.push("Minimum Amount should not be empty!")
      if (!this.currentKeys.length) this.errors.push("Fields should not be empty!")

      if (this.errors.length) {
        this.areErrors = true
        return
      }
      await this.saveChanges(index)
    },
    closeErrors() {
      this.areErrors = false
    },
    async saveChanges(index) {
      this.paymentMethods[index].name = this.currentName
      this.paymentMethods[index].minimumAmount = this.currentMinimumAmount < 0 ? 0 : this.currentMinimumAmount
      this.paymentMethods[index].keys = this.currentKeys
      this.paymentMethods[index].isActive = this.currentIsActive

      try {
        this.paymentMethods[index].key = this.currentKey
        this.paymentMethods = this.paymentMethods[index]._id
            ? (await this.$http.put(`/api-settings/payment-methods/${ this.paymentMethods[index]._id }`, { ...this.paymentMethods[index] })).data
            : (await this.$http.post(`/api-settings/payment-methods/`, { ...this.paymentMethods[index] })).data

        this.alertToggle({ message: "Saved", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Error on saving!", isShow: true, type: "error" })
      } finally {
        this.cancel()
      }
    },
    async deleteMethod() {
      try {
        const { _id } = this.paymentMethods[this.deleteIndex]
        const result = await this.$http.delete(`/api-settings/payment-methods/${ _id }`)
        this.paymentMethods = result.data
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
      this.currentIsActive = true
      this.currentMinimumAmount = null
      this.currentKeys = []
      this.isDeleting = false
    },
    addData() {
      if (this.currentActive !== -1) return this.isEditing()
      this.paymentMethods.push({
        name: "",
        minimumAmount: "",
        isActive: true,
        keys: []
      })
      this.setEditionData(this.paymentMethods.length - 1)
      this.$nextTick(() => this.scrollToEnd())
    },
    ...mapActions({
      alertToggle: "alertToggle"
    }),
    scrollToEnd() {
      const element = this.$el.querySelector('tbody')
      element.scrollTop = element.scrollHeight
    },
    async getPaymentsMethods() {
      try {
        const result = await this.$http.get("/api-settings/payment-methods")
        this.paymentMethods = result.data
      } catch (err) {
        this.alertToggle({ message: "Error on getting Payment Methods", isShow: true, type: "error" })
      }
    },
    async getPaymentsMethodsKeys() {
      try {
        const result = await this.$http.get("/api-settings/payment-methods-keys")
        this.paymentMethodsKeys = result.data
      } catch (err) {
        this.alertToggle({ message: "Error on getting Payment Terms", isShow: true, type: "error" })
      }
    }
  },
  components: {
    SelectMulti,
    CheckBox,
    GeneralTable,
    Add
  },
  created() {
    this.getPaymentsMethods()
    this.getPaymentsMethodsKeys()
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.table {
  &__header,
  &__data {
    padding: 0 7px;
    width: 100%;
    text-align: left;
  }

  &__drop {
    position: relative;
    height: 32px;
    max-width: 220px;
    margin: 0 7px;
    width: 100%;
    background: white;
    border-radius: 4px;
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
</style>
