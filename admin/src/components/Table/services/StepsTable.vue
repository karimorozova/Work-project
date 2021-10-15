<template lang="pug">
  .steps
    .table
      GeneralTable(
        :fields="fields"
        :tableData="steps"
        :errors="errors"
        :areErrors="areErrors"
        @closeErrors="closeErrors"
      )
        .table__header(slot="headerTitle" slot-scope="{ field }") {{ field.label }}
        .table__header(slot="headerUnit" slot-scope="{ field }") {{ field.label }}
        .table__header(slot="headerStage1" slot-scope="{ field }") {{ field.label }}
        .table__header(slot="headerStage2" slot-scope="{ field }") {{ field.label }}
        .table__header(slot="headerEditor" slot-scope="{ field }") {{ field.label }}
        .table__header(slot="headerActive" slot-scope="{ field }") {{ field.label }}
        .table__header(slot="headerIcons" slot-scope="{ field }") {{ field.label }}

        template(slot="title" slot-scope="{ row, index }")
          .table__data(v-if="currentActive !== index") {{ row.title }}
          .table__data(v-else)
            input(type="text" v-model="currentStep.title")

        template(slot="calculationUnit" slot-scope="{ row, index }")
          .table__data(v-if="currentActive !== index") {{ presentUnits(row.calculationUnit) }}
          .table__drop(v-else)
            SelectMulti(
              :isTableDropMenu="true"
              placeholder="Select"
              :hasSearch="true"
              :options="unitData"
              :selectedOptions="selectedUnits"
              @chooseOptions="setUnits"
              :allOptionsButtons="true"
            )
        .table__icons.table_centered( slot="active" slot-scope="{ row, index }" :class="{'table_active': currentActive === index}")
          img.table__checkbox(v-if="isSelected('isActive', index)" src="../../../assets/images/latest-version/checkbox-brown-1.png" @click="toggleActive(index, 'isActive')" :class="{'table__opacity': currentActive === index}")
          img.table__checkbox(v-else src="../../../assets/images/latest-version/checkbox-brown-0.png" @click="toggleActive(index, 'isActive')" :class="{'table__opacity': currentActive === index}")

        .table__icons(slot="icons" slot-scope="{ row, index }")
          img.table__icon(v-for="(icon, key) in manageIcons" :src="icon.icon" @click="makeAction(index, key)" :class="{'table__opacity': isActive(key, index)}")
    Add(@add="addStep")
</template>

<script>
	import SelectMulti from "../../SelectMulti"
	import SettingsTable from "../SettingsTable"
	import GeneralTable from "../../GeneralTable"
	import SelectSingle from "@/components/SelectSingle"
	import Add from "@/components/Add"
	import crudIcons from "@/mixins/crudIcons"
	import scrollDrop from "@/mixins/scrollDrop"
	import { mapActions } from "vuex"

	export default {
		mixins: [ crudIcons, scrollDrop ],
		props: {
			steps: { type: Array }
		},
		data() {
			return {
				fields: [
					{ label: "Title", headerKey: "headerTitle", key: "title", style: { width: "25%" } },
					{ label: "Calculation Unit", headerKey: "headerUnit", key: "calculationUnit", style: { width: "51%" } },
					{ label: "Active", headerKey: "headerActive", key: "active", style: { width: "9%" } },
					{ label: "", headerKey: "headerIcons", key: "icons", style: { width: "15%" } }
				],
				units: [],
				errors: [],
				areErrors: false,
				currentActive: -1,
				currentStep: "",
				tableWidth: 850,
				currentUnits: []
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle"
			}),
			presentUnits(units) {
				if (!units.length) return ""
				return units.reduce((acc, cur) => acc + `${ cur.type }; `, "")
			},
			setUnits({ option }) {
				const position = this.selectedUnits.indexOf(option)
				if (position !== -1) {
					this.currentUnits.splice(position, 1)
				} else {
					const title = this.units.find(item => item.type === option)
					this.currentUnits.push(title)
				}
			},
			async getUnits() {
				try {
					const result = await this.$http.get('/api/units')
					this.units = result.body
				} catch (err) {
					this.alertToggle({ message: "Erorr on getting Units", isShow: true, type: "error" })
				}
			},
			closeErrors() {
				this.areErrors = false
			},
			cancel() {
				this.currentActive = -1
				this.currentStep = ""
			},
			setUnit({ option }) {
				this.currentStep.calculationUnit = option
			},
			addStep() {
				if (this.currentActive !== -1) {
					return this.isEditing()
				}
				this.currentUnits = []
				this.currentStep = {
					title: "",
					calculationUnit: [],
					isActive: true
				}
				this.steps.push(this.currentStep)
				this.currentActive = this.steps.length - 1
			},
			isSelected(rowProp, index) {
				if (this.currentActive === index) {
					return this.currentStep[rowProp]
				}
				return this.steps[index][rowProp]
			},
			toggleActive(index, prop) {
				if (this.currentActive === -1 || this.currentActive !== index) return
				this.currentStep[prop] = !this.currentStep[prop]
			},
			async makeAction(index, key) {
				if (this.currentActive !== -1 && this.currentActive !== index) {
					return this.isEditing()
				}
				switch (key) {
					case 'edit':
						this.currentActive = index
						this.currentStep = { ...this.steps[index] }
						this.currentUnits = Array.from(this.steps[index].calculationUnit)
						break
					case 'cancel':
						this.currentActive = -1
						this.$emit("setStepsWithId")
						break
					case 'save':
						await this.checkErrors(index)
						break
				}
			},
			async checkErrors(index) {
				if (this.currentActive === -1) return
				this.errors = []
				const isNotUnique = this.steps.find((item, ind) => ind !== index && item.title === this.currentStep.title.trim())
				if (!this.currentStep.title || isNotUnique) this.errors.push("Step title should be unique and not empty")
				if (!this.currentUnits.length) this.errors.push("Please, select calculation unit.")
				if (this.errors.length) {
					return this.areErrors = true
				}
				await this.saveChanges(index)
				this.cancel()
			},
			async saveChanges(index) {
				try {
					let oldStep = this.steps[index]
					this.currentStep.symbol = this.currentStep.title.toLowerCase().trim().replace(/ /g, "_")
					this.currentStep.calculationUnit = this.currentUnits
					const result = await this.$http.post("/api/step", { step: this.currentStep })
					this.$emit("updateSteps")
					if (result.data !== "Updated") {
						await this.$http.post('/pricelists/add-new-multiplier', {
							key: 'Step',
							id: result.data
						})
					} else {
						await this.$http.post('/pricelists/update-multiplier', {
							key: 'Step',
							oldMultiplier: oldStep
						})
					}
					this.alertToggle({ message: "Information saved", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Error on savind step", isShow: true, type: "error" })
				} finally {
					this.cancel()
				}
			}
		},
		computed: {
			manageIcons() {
				const { "delete": del, ...result } = this.icons
				return result
			},
			unitData() {
				return this.units.map(item => item.type)
			},
			selectedUnits() {
				return this.currentUnits.length
						? this.currentUnits.map(item => item.type)
						: []
			}
		},
		created() {
			this.getUnits()
		},
		components: {
			SettingsTable,
			GeneralTable,
			SelectSingle,
			Add,
			SelectMulti
		},
		beforeDestroy() {
			this.$emit("setStepsWithId")
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";
  @import "../../../assets/styles/settingsTable";

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
      border-radius: 4px;
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
