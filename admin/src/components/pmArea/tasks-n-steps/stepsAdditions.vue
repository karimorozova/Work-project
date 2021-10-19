<template lang="pug">
  .units
    .table
      GeneralTable(
        :fields="fields"
        :tableData="data"
      )
        template(slot="headerTitle" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerAmount" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerIcons" slot-scope="{ field }")
          .table__header {{ field.label }}

        template(slot="unit" slot-scope="{ row, index }")
          .table__data(v-if="currentActive !== index") {{ row.title }}
          .table__input(v-else)
            input(type="text" v-model="data[index].title")

        template(slot="steps" slot-scope="{ row, index }")
          .table__data(v-if="currentActive !== index") {{ row.value }}
          .table__drop(v-else)
            input(type="number" v-model="data[index].value")

        template(slot="icons" slot-scope="{ row, index }")
          .table__icons
            img.table__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'table__opacity': isActive(key, index)}")

    Add(@add="addAdditions")
</template>

<script>
import Add from "../../Add"
import crudIcons from "@/mixins/crudIcons"
import GeneralTable from "../../GeneralTable"

export default {
  mixins: [ crudIcons ],
  props: {
    stepsAdditions: {
      type: Array
    }
  },
  data() {
    return {
      fields: [
        {
          label: "Service title",
          headerKey: "headerTitle",
          key: "unit",
          style: { width: "70%" }
        },
        {
          label: "Amount",
          headerKey: "headerAmount",
          key: "steps",
          style: { width: "10%" }
        },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          style: { width: "20%" }
        }
      ],
      data: [ ...this.stepsAdditions ],
      currentActive: -1

      // steps: [],
      // currentServices: [],
      // units: [],
      // oldUnits: [],
      // currentUnit: "",
      // areErrors: false,
      // errors: [],
      // isDeleting: false,
      // deleteIndex: -1,
      // isTableDropMenu: true
    }
  },
  methods: {
    addAdditions() {
      if (this.currentActive !== -1) return this.isEditing()
      this.data.push({ title: '', value: 0 })
      this.currentActive = this.data.length - 1
    },
    // ...mapActions({
    //   alertToggle: "alertToggle"
    // }),
    // presentServices(services) {
    //   if (!services.length) return ""
    //   return services.reduce((acc, cur) => acc + `${ cur.title }, `, "")
    // },
    // setServices({ option }) {
    //   const position = this.selectedServices.indexOf(option)
    //   if (position !== -1) {
    //     this.currentServices.splice(position, 1)
    //   } else {
    //     const title = this.steps.find((item) => item.title === option)
    //     this.currentServices.push(title)
    //   }
    // },
    // async getServices() {
    //   try {
    //     const result = await this.$http.get("/api/steps")
    //     this.steps = result.body
    //   } catch (err) {
    //     this.alertToggle({ message: "Error on getting Services", isShow: true, type: "error" })
    //   }
    // },
    // async getUnits() {
    //   try {
    //     const result = await this.$http.get("/api/units")
    //     this.units = result.body
    //   } catch (err) {
    //     this.alertToggle({ message: "Error on getting Units", isShow: true, type: "error" })
    //   }
    // },
    // toggleActive(index) {
    //   if (this.currentActive !== index) return
    //   this.units[index].active = !this.units[index].active
    // },
    // addUnit() {
    //   if (this.currentActive !== -1) return this.isEditing()
    //   this.currentServices = []
    //
    //   this.units.push({
    //     active: true,
    //     type: "",
    //     editable: true,
    //     sizes: []
    //   })
    //   this.setEditionData(this.units.length - 1)
    // },
    // setEditionData(index) {
    //   this.currentActive = index
    //   this.currentSizes = this.units[index].sizes
    //   this.currentUnit = this.units[index].type
    //   this.currentServices = Array.from(this.units[index].steps)
    // },
    // closeErrors() {
    //   this.areErrors = false
    // },
    async makeAction(index, key) {
      if (this.currentActive !== -1 && this.currentActive !== index) return this.isEditing()

      if (key === "save") {
        this.$emit('save', this.data)
        this.currentActive = -1
      }
      if (key === "edit") {
        this.currentActive = index
      }
      if (key === "cancel") {
        if (this.currentActive === -1) return
        this.data = [ ...this.stepsAdditions ]
      }
      if (key === "delete") {
        this.data = this.data.splice(index, 1)
        this.$emit('delete', this.data)
      }
    }
    // async saveChangesConst(index) {
    //   this.errors = []
    //   const id = this.units[index]._id
    //   let oldUnit = this.oldUnits[index]
    //
    //   try {
    //     const result = await this.$http.post("/api/units", {
    //       unit: {
    //         _id: id,
    //         type: this.units[index].type,
    //         active: true,
    //         steps: this.currentServices
    //       }
    //     })
    //     this.alertToggle({ message: "Saved only Steps", isShow: true, type: "success" })
    //     this.getUnits()
    //
    //     if (result.data !== "Updated") {
    //       await this.$http.post("/pricelists/add-new-multiplier", { key: "Unit", id: result.data })
    //     } else {
    //       await this.$http.post("/pricelists/update-multiplier", { key: "Unit", oldMultiplier: oldUnit })
    //       this.getOldData()
    //     }
    //   } catch (error) {
    //     this.alertToggle({ message: "Error on saving Unit Steps info", isShow: true, type: "error" })
    //   }
    // },
    // async saveChanges(index) {
    //   this.errors = []
    //   const id = this.units[index]._id
    //   let oldUnit = this.oldUnits[index]
    //   try {
    //     const result = await this.$http.post("/api/units", {
    //       unit: {
    //         _id: id,
    //         type: this.currentUnit,
    //         active: this.units[index].active,
    //         steps: this.currentServices
    //       }
    //     })
    //     this.alertToggle({ message: "Saved", isShow: true, type: "success" })
    //     this.getUnits()
    //     if (result.data !== "Updated") {
    //       await this.$http.post("/pricelists/add-new-multiplier", { key: "Unit", id: result.data })
    //     } else {
    //       await this.$http.post("/pricelists/update-multiplier", { key: "Unit", oldMultiplier: oldUnit })
    //       this.getOldData()
    //     }
    //   } catch (error) {
    //     this.alertToggle({ message: "Error on saving Unit info", isShow: true, type: "error" })
    //   }
    // },
    // cancel() {
    //   this.currentActive = -1
    //   this.isDeleting = false
    // },
    // async checkErrors(index) {
    //   if (this.currentActive === -1) return
    //   const editable = this.units[index].editable
    //   this.errors = []
    //   this.areErrors = false
    //
    //   if (!this.currentUnit || !this.isUnique(index)) this.errors.push("Unit should not be empty and be unique!")
    //   if (!this.currentServices.length > 0) this.errors.push("Please, select at least one step.")
    //   if (this.errors.length) {
    //     this.areErrors = true
    //     return
    //   }
    //   if (!editable) {
    //     await this.saveChangesConst(index)
    //   } else {
    //     await this.saveChanges(index)
    //   }
    //   this.cancel()
    // },
    // async deleteUnit() {
    //   const index = this.deleteIndex
    //   const id = this.units[index]._id
    //   const editable = this.units[index].editable
    //   if (!editable) {
    //     this.alertToggle({ message: "This Unit cannot be deleted.", isShow: true, type: "error" })
    //     return
    //   }
    //   try {
    //     await this.$http.delete(`/api/units/${ id }`)
    //     this.alertToggle({ message: "Unit removed", isShow: true, type: "success" })
    //   } catch (err) {
    //     this.alertToggle({ message: "Error on removing Unit", isShow: true, type: "error" })
    //   }
    //   this.cancel()
    //   this.getUnits()
    // },
    // async getOldData() {
    //   try {
    //     const result = await this.$http.get("/api/units")
    //     this.oldUnits = result.body
    //   } catch (err) {
    //     this.alertToggle({ message: "Error on getting Units", isShow: true, type: "error" })
    //   }
    // },
    // isUnique(index) {
    //   const duplicateIndex = this.units.findIndex((item, ind) => {
    //     if (index !== ind && item.type.toLowerCase() === this.currentUnit.toLowerCase().trim()) {
    //       return item
    //     }
    //   })
    //   return duplicateIndex === -1
    // }
  },
  computed: {

    // serviceData() {
    //   return this.steps.map((item) => item.title)
    // },
    // selectedServices() {
    //   return this.currentServices.length
    //       ? this.currentServices.map((item) => item.title)
    //       : []
    // }
  },
  components: {
    GeneralTable,
    // SettingsTable,
    Add
    // SelectMulti,
    // Chips
  },
  async created() {
    // await this.getOldData()
  },
  mounted() {
    // this.getUnits()
    // this.getServices()
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.table {
  width: 100%;

  &__data {
    padding: 0 7px;
  }

  &__header {
    padding: 0 7px;
  }

  &__icons {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 8px;
  }

  &__icon {
    cursor: pointer;
    opacity: 0.5;
  }

  &__opacity {
    opacity: 1;
  }

  &__input {
    width: 100%;
    padding: 0 7px;
  }
}

input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 4px;
  box-sizing: border-box;
  padding: 0 7px;
  outline: none;
  width: 100%;
  height: 32px;
  transition: .1s ease-out;

  &:focus {
    border: 1px solid $border-focus;
  }
}
</style>
