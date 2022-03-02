<template lang="pug">
  .terms
    .terms__table
      GeneralTable(
        :fields="fields"
        :tableData="paymentMethodsKeys"
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
        template(slot="headerIcons" slot-scope="{ field }")
          .table__header {{ field.label }}

        template(slot="key" slot-scope="{ row, index }")
          .table__data(v-if="currentActive !== index") {{ row.key }}
          .table__data(v-else)
            input(type="text" placeholder="Value" v-model="currentKey")

        template(slot="icons" slot-scope="{ row, index }")
          .table__icons
            img.table__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)"  :class="{'table__opacity': !isActive(key, index)}")

      .table__empty(v-show="!paymentMethodsKeys.length") No data...

    Add(@add="addData")

</template>

<script>
import Add from "../../Add"
import { mapActions } from "vuex"
import crudIcons from "@/mixins/crudIcons"
import GeneralTable from "../../GeneralTable"

export default {
  mixins: [ crudIcons ],
  data() {
    return {
      fields: [
        { label: "Title", headerKey: "headerName", key: "key", style: { width: "80%" } },
        { label: "", headerKey: "headerIcons", key: "icons", style: { width: "20%" } }
      ],
      paymentMethodsKeys: [],

      currentKey: "",

      areErrors: false,
      errors: [],
      isDeleting: false,
      deleteIndex: -1,
      currentActive: -1
    }
  },
  methods: {
    async makeAction(index, key) {
      if (this.currentActive !== -1 && this.currentActive !== index) return this.isEditing()

      if (key === "save") await this.checkErrors(index)
      if (key === "edit") this.setEditionData(index)
      if (key === "cancel") {
        if (this.currentActive === -1) return
        this.cancel()
        await this.getPaymentsMethodsKeys()
      }
      if (key === "delete") {
        if (!this.paymentMethodsKeys[index]._id) {
          this.paymentMethodsKeys.splice(index, 1)
          return this.cancel()
        }
        this.deleteIndex = index
        this.isDeleting = true
      }
    },
    setEditionData(index) {
      this.currentActive = index
      this.currentKey = this.paymentMethodsKeys[index].key
    },
    async checkErrors(index) {
      this.errors = []
      if (this.currentActive === -1) return
      if (!this.currentKey) this.errors.push("Title should not be empty!")
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
      try {
        this.paymentMethodsKeys[index].key = this.currentKey
        this.paymentMethodsKeys = this.paymentMethodsKeys[index]._id
            ? (await this.$http.put(`/api-settings/payment-methods-keys/${ this.paymentMethodsKeys[index]._id }`, { ...this.paymentMethodsKeys[index] })).data
            : (await this.$http.post(`/api-settings/payment-methods-keys/`, { ...this.paymentMethodsKeys[index] })).data

        this.alertToggle({ message: "Saved", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Error on saving!", isShow: true, type: "error" })
      } finally {
        this.cancel()
      }
    },
    async deleteTerms() {
      try {
        const { _id } = this.paymentMethodsKeys[this.deleteIndex]
        const result = await this.$http.delete(`/api-settings/payment-methods-keys/${ _id }`)
        this.paymentMethodsKeys = result.data
        this.alertToggle({ message: "Removed", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Error on removing!", isShow: true, type: "error" })
      } finally {
        this.cancel()
      }
    },
    cancel() {
      this.currentActive = -1
      this.currentKey = ''
      this.currentValue = null
      this.isDeleting = false
    },
    addData() {
      if (this.currentActive !== -1) return this.isEditing()
      this.paymentMethodsKeys.push({ key: "" })
      this.setEditionData(this.paymentMethodsKeys.length - 1)
      this.$nextTick(() => this.scrollToEnd())
    },
    ...mapActions({
      alertToggle: "alertToggle"
    }),
    scrollToEnd() {
      const element = this.$el.querySelector('tbody')
      element.scrollTop = element.scrollHeight
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
    GeneralTable,
    Add
  },
  created() {
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
