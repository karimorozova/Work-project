<template lang="pug">
  .units
    .table
      GeneralTable(
        :fields="fields"
        :tableData="units"
        :errors="errors"
        :areErrors="areErrors"
        :isApproveModal="isDeleting"
        @closeErrors="closeErrors"
        @approve="deleteUnit"
        @closeModal="cancel"
        @notApprove="cancel"
      )
        template(slot="headerUnit" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerSteps" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerSizes" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerActive" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerIcons" slot-scope="{ field }")
          .table__header {{ field.label }}

        template(slot="unit" slot-scope="{ row, index }")
          .table__data(v-if="currentActive !== index") {{ row.type }}
          .table__input(v-else)
            input(type="text" v-model="currentUnit")

        template(slot="steps" slot-scope="{ row, index }")
          .table__data(style="max-height: 40px; overflow-y: auto;" v-if="currentActive !== index") {{ presentServices(row.steps) }}
          .table__drop(v-else)
            SelectMulti(
              :isTableDropMenu="isTableDropMenu"
              placeholder="Select"
              :hasSearch="true"
              :options="serviceData"
              :selectedOptions="selectedServices"
              @chooseOptions="setServices"
              :allOptionsButtons="true"
            )

        //template(slot="active" slot-scope="{ row, index }")
        //  .table__data(style="width: 100%; text-align: center;" :class="{'filter__opacity': currentActive !== index}")
        //    img.table__checkbox(v-if="row.active" src="../../assets/images/latest-version/checkbox-brown-1.png" @click="toggleActive(index)" :class="{'table__opacity': currentActive === index}")
        //    img.table__checkbox(v-else src="../../assets/images/latest-version/checkbox-brown-0.png" @click="toggleActive(index)" :class="{'table__opacity': currentActive === index}")

        template(slot="icons" slot-scope="{ row, index }")
          .table__icons
            img.table__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'table__opacity': isActive(key, index)}")

    Add(@add="addUnit")
</template>

<script>
	import SettingsTable from "./SettingsTable"
	import Chips from "../Chips"
	import Add from "../Add"
	import { mapActions } from "vuex"
	import crudIcons from "@/mixins/crudIcons"
	import SelectMulti from "../SelectMulti"
	import GeneralTable from "../GeneralTable"

	export default {
		mixins: [ crudIcons ],
		data() {
			return {
				fields: [
					{
						label: "Calculation Unit",
						headerKey: "headerUnit",
						key: "unit",
						style: { width: "25%" }
					},
					{
						label: "Steps",
						headerKey: "headerSteps",
						key: "steps",
						style: { width: "60%" }
					},
					// {
					// 	label: "Active",
					// 	headerKey: "headerActive",
					// 	key: "active",
					// 	style: { width: "9%" }
					// },
					{
						label: "",
						headerKey: "headerIcons",
						key: "icons",
						style: { width: "15%" }
					}
				],
				steps: [],
				currentServices: [],
				units: [],
				oldUnits: [],
				currentUnit: "",
				areErrors: false,
				errors: [],
				isDeleting: false,
				deleteIndex: -1,
				currentActive: -1,
				isTableDropMenu: true
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle"
			}),
			presentServices(services) {
				if (!services.length) return ""
				return services.reduce((acc, cur) => acc + `${ cur.title }, `, "")
			},
			setServices({ option }) {
				const position = this.selectedServices.indexOf(option)
				if (position !== -1) {
					this.currentServices.splice(position, 1)
				} else {
					const title = this.steps.find((item) => item.title === option)
					this.currentServices.push(title)
				}
			},
			async getServices() {
				try {
					const result = await this.$http.get("/api/steps")
					this.steps = result.body
				} catch (err) {
					this.alertToggle({ message: "Error on getting Services", isShow: true, type: "error" })
				}
			},
			async getUnits() {
				try {
					const result = await this.$http.get("/api/units")
					this.units = result.body
				} catch (err) {
					this.alertToggle({ message: "Error on getting Units", isShow: true, type: "error" })
				}
			},
			toggleActive(index) {
				if (this.currentActive !== index) return
				this.units[index].active = !this.units[index].active
			},
			addUnit() {
				if (this.currentActive !== -1) return this.isEditing()
				this.currentServices = []

				this.units.push({
					active: true,
					type: "",
					editable: true,
					sizes: []
				})
				this.setEditionData(this.units.length - 1)
			},
			setEditionData(index) {
				this.currentActive = index
				this.currentSizes = this.units[index].sizes
				this.currentUnit = this.units[index].type
				this.currentServices = Array.from(this.units[index].steps)
			},
			closeErrors() {
				this.areErrors = false
			},
			async makeAction(index, key) {
				if (this.currentActive !== -1 && this.currentActive !== index) {
					return this.isEditing()
				}
				if (key === "save") {
					await this.checkErrors(index)
				}
				if (key === "edit") {
					this.setEditionData(index)
				}
				if (key === "cancel") {
					if (this.currentActive === -1) return
					this.cancel()
					await this.getUnits()
				}
				if (key === "delete") {
					if (!this.units[index]._id) {
						this.units.splice(index, 1)
						return this.cancel()
					}
					this.deleteIndex = index
					this.isDeleting = true
				}
			},
			async saveChangesConst(index) {
				this.errors = []
				const id = this.units[index]._id
				let oldUnit = this.oldUnits[index]

				try {
					const result = await this.$http.post("/api/units", {
						unit: {
							_id: id,
							type: this.units[index].type,
							active: true,
							steps: this.currentServices
						}
					})
					this.alertToggle({ message: "Saved only Steps", isShow: true, type: "success" })
					this.getUnits()

					if (result.data !== "Updated") {
						await this.$http.post("/pricelists/add-new-multiplier", { key: "Unit", id: result.data })
					} else {
						await this.$http.post("/pricelists/update-multiplier", { key: "Unit", oldMultiplier: oldUnit })
						this.getOldData()
					}
				} catch (error) {
					this.alertToggle({ message: "Error on saving Unit Steps info", isShow: true, type: "error" })
				}
			},
			async saveChanges(index) {
				this.errors = []
				const id = this.units[index]._id
				let oldUnit = this.oldUnits[index]
				try {
					const result = await this.$http.post("/api/units", {
						unit: {
							_id: id,
							type: this.currentUnit,
							active: this.units[index].active,
							steps: this.currentServices
						}
					})
					this.alertToggle({ message: "Saved", isShow: true, type: "success" })
					this.getUnits()
					if (result.data !== "Updated") {
						await this.$http.post("/pricelists/add-new-multiplier", { key: "Unit", id: result.data })
					} else {
						await this.$http.post("/pricelists/update-multiplier", { key: "Unit", oldMultiplier: oldUnit })
						this.getOldData()
					}
				} catch (error) {
					this.alertToggle({ message: "Error on saving Unit info", isShow: true, type: "error" })
				}
			},
			cancel() {
				this.currentActive = -1
				this.isDeleting = false
			},
			async checkErrors(index) {
				if (this.currentActive === -1) return
				const editable = this.units[index].editable
				this.errors = []
        this.areErrors = false

				if (!this.currentUnit || !this.isUnique(index)) this.errors.push("Unit should not be empty and be unique!")
        if (!this.currentServices.length > 0) this.errors.push("Please, select at least one step.")
				if (this.errors.length) {
					this.areErrors = true
					return
				}
				if (!editable) {
					await this.saveChangesConst(index)
				} else {
					await this.saveChanges(index)
				}
				this.cancel()
			},
			async deleteUnit() {
				const index = this.deleteIndex
				const id = this.units[index]._id
				const editable = this.units[index].editable
				if (!editable) {
					this.alertToggle({ message: "This Unit cannot be deleted.", isShow: true, type: "error" })
					return
				}
				try {
					await this.$http.delete(`/api/units/${ id }`)
					this.alertToggle({ message: "Unit removed", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Error on removing Unit", isShow: true, type: "error" })
				}
				this.cancel()
				this.getUnits()
			},
			async getOldData() {
				try {
					const result = await this.$http.get("/api/units")
					this.oldUnits = result.body
				} catch (err) {
					this.alertToggle({ message: "Error on getting Units", isShow: true, type: "error" })
				}
			},
			isUnique(index) {
				const duplicateIndex = this.units.findIndex((item, ind) => {
					if (index !== ind && item.type.toLowerCase() === this.currentUnit.toLowerCase().trim()) {
						return item
					}
				})
				return duplicateIndex === -1
			}
		},
		computed: {
			serviceData() {
				return this.steps.map((item) => item.title)
			},
			selectedServices() {
				return this.currentServices.length
						? this.currentServices.map((item) => item.title)
						: []
			}
		},
		components: {
			GeneralTable,
			SettingsTable,
			Add,
			SelectMulti,
			Chips
		},
		async created() {
			await this.getOldData()
		},
		mounted() {
			this.getUnits()
			this.getServices()
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";

  .table {
    width: 100%;

    &__data {
      padding: 0 7px;
    }

    &__header {
      padding: 0 7px;
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
    border-radius: 2px;
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

  .filter {
    &__opacity {
      filter: opacity(0.5);
    }
  }
</style>
