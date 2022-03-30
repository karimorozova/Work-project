<template lang="pug">
  .terms
    .terms__table
      GeneralTable(
        :fields="fields"
        :tableData="companies"
        :errors="errors"
        :areErrors="areErrors"
        :isApproveModal="isDeleting"
        @closeErrors="closeErrors"
        @approve="deleteMethod"
        @notApprove="cancel"
        @closeModal="cancel"
      )
        template(slot="headerCompanyName" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerOfficialCompanyName" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerDefault" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerActive" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerIcons" slot-scope="{ field }")
          .table__header {{ field.label }}

        template(slot="companyName" slot-scope="{ row, index }")
          .table__data(v-if="currentActive !== index") {{ row.companyName }}
          .table__data(v-else)
            input(type="text" placeholder="Value" v-model="currentCompanyName")

        template(slot="officialCompanyName" slot-scope="{ row, index }")
          .table__data(v-if="currentActive !== index") {{ row.officialCompanyName }}
          .table__data(v-else)
            input(type="text" placeholder="Value" v-model="currentOfficialCompanyName")

        template(slot="default" slot-scope="{ row, index }")
          .table__active(v-if="currentActive !== index")
            CheckBox(:isChecked="row.isDefault" :isDisabled="true")
          .table__active(v-else)
            CheckBox(:isChecked="currentIsDefault" @check="toggleActive(index, 'currentIsDefault')" @uncheck="toggleActive(index, 'currentIsDefault')")

        template(slot="active" slot-scope="{ row, index }")
          .table__active(v-if="currentActive !== index")
            CheckBox(:isChecked="row.isActive" :isDisabled="true")
          .table__active(v-else)
            CheckBox(:isChecked="currentIsActive" @check="toggleActive(index, 'currentIsActive')" @uncheck="toggleActive(index, 'currentIsActive')")

        template(slot="icons" slot-scope="{ row, index }")
          .table__icons
            img.table__icon(v-for="(icon, key) in iconsWithEditingModal" :src="icon.icon" @click="makeAction(index, key)" :class="{'table__opacity': !isActive(key, index)}")

      .table__empty(v-show="!companies.length") No data...

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
        { label: "Name", headerKey: "headerCompanyName", key: "companyName", style: { width: "27%" } },
        { label: "Official Name", headerKey: "headerOfficialCompanyName", key: "officialCompanyName", style: { width: "27%" } },
        { label: "Default ", headerKey: "headerDefault", key: "default", style: { width: "18%" } },
        { label: "Active", headerKey: "headerActive", key: "active", style: { width: "8%" } },
        { label: "", headerKey: "headerIcons", key: "icons", style: { width: "20%" } }
      ],
      companies: [],

      currentCompanyName: "",
      currentOfficialCompanyName: "",
      currentIsActive: true,
      currentIsDefault: false,

      currentActive: -1,
      areErrors: false,
      errors: [],
      isDeleting: false,
      deleteIndex: -1
    }
  },
  methods: {
    // chooseKeys({ option }) {
    //   if (!this.currentKeys.length) return this.currentKeys.push(this.companies.find(({ key }) => key === option))
    //
    //   const position = this.currentKeys.findIndex(({ key }) => key === option)
    //   if (position !== -1) {
    //     this.currentKeys.splice(position, 1)
    //   } else {
    //     this.currentKeys.push(this.companies.find(({ key }) => key === option))
    //   }
    // },
    toggleActive(index, field) {
      if (this.currentActive !== index) return
      this[field] = !this[field]
    },
    async makeAction(index, key) {
      if (this.currentActive !== -1 && this.currentActive !== index) return this.isEditing()

      if (key === "save") await this.checkErrors(index)
      if (key === "edit") this.setEditionData(index)
      if (key === "cancel") {
        if (this.currentActive === -1) return
        this.cancel()
        await this.getCompanies()
      }
      if (key === "delete") {
        if (!this.companies[index]._id) {
          this.companies.splice(index, 1)
          return this.cancel()
        }
        this.deleteIndex = index
        this.isDeleting = true
      }
      if (key === "editModal") {
        this.$emit('openModal', this.companies[index]._id)
      }
    },
    setEditionData(index) {
      this.currentActive = index
      this.currentCompanyName = this.companies[index].companyName
      this.currentOfficialCompanyName = this.companies[index].officialCompanyName
      this.currentIsDefault = this.companies[index].isDefault
      this.currentIsActive = this.companies[index].isActive
    },
    async checkErrors(index) {
    //   // this.errors = []
    //   // if (this.currentActive === -1) return
    //   // if (!this.currentName) this.errors.push("Name should not be empty!")
    //   // if (!this.currentMinimumAmount) this.errors.push("Minimum Amount should not be empty!")
    //   // if (!this.currentKeys.length) this.errors.push("Fields should not be empty!")
    //   //
    //   // if (this.errors.length) {
    //   //   this.areErrors = true
    //   //   return
    //   // }
      await this.saveChanges(index)
    },
    closeErrors() {
      this.areErrors = false
    },
    async saveChanges(index) {
      this.companies[index].companyName = this.currentCompanyName
      this.companies[index].officialCompanyName = this.currentOfficialCompanyName
      this.companies[index].isActive = this.currentIsActive
      this.companies[index].isDefault = this.currentIsDefault
      console.log(this.companies[index])
      try {
        this.companies = this.companies[index]._id
            ? (await this.$http.put(`/api-settings/payment-methods/${ this.companies[index]._id }`, { ...this.companies[index] })).data
            : (await this.$http.post(`/api-settings/company/`, { ...this.companies[index] })).data

        this.alertToggle({ message: "Saved", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Error on saving!", isShow: true, type: "error" })
      } finally {
        this.cancel()
      }
    },
    async deleteMethod() {
      try {
        const { _id } = this.companies[this.deleteIndex]
        const result = await this.$http.delete(`/api-settings/company/${ _id }`)
        this.companies = result.data
        this.alertToggle({ message: "Removed", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Error on removing!", isShow: true, type: "error" })
      } finally {
        this.cancel()
      }
    },
    cancel() {
      this.currentActive = -1
      this.currentCompanyName = ''
      this.currentOfficialCompanyName = ''
      this.currentIsActive = true
      this.currentIsDefault = true
      this.isDeleting = false
    },
    addData() {
      if (this.currentActive !== -1) return this.isEditing()
      this.companies.push({
        companyName: "",
        officialCompanyName: "",
        isActive: true,
        isDefault: true,
      })
      this.setEditionData(this.companies.length - 1)
      this.$nextTick(() => this.scrollToEnd())
    },
    ...mapActions({
      alertToggle: "alertToggle"
    }),
    // scrollToEnd() {
    //   const element = this.$el.querySelector('tbody')
    //   element.scrollTop = element.scrollHeight
    // },
    async getCompanies() {
      try {
        const result = await this.$http.get("/api-settings/companies")
        this.companies = result.data

      } catch (err) {
        this.alertToggle({ message: "Error on getting Payment Methods", isShow: true, type: "error" })
      }
    },
  },
  computed: {
    iconsWithEditingModal() {
      return {  ...this.icons, editModal :  { icon: require("../../../assets/images/latest-version/i-edit.png") }}
    }
  },
  components: {
    SelectMulti,
    CheckBox,
    GeneralTable,
    Add
  },
  created() {
    this.getCompanies()
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
    border-radius: 2px;
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
