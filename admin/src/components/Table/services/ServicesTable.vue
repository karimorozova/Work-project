<template lang="pug">
  .services
    .table
      GeneralTable(
        :fields="fields"
        :tableData="services"
        :errors="errors"
        :areErrors="areErrors"
        @closeErrors="closeErrors"
      )
        template(slot="headerTitle" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerLangForm" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerSteps" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerIsRequestQuote" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerActive" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerIcons" slot-scope="{ field }")
          .table__header {{ field.label }}

        template(slot="title" slot-scope="{ row, index }")
          .table__data(v-if="currentActive !== index") {{ row.title }}
          .table__data(v-else)
            input.table__input(type="text" v-model="currentTitle")
        template(slot="languageForm" slot-scope="{ row, index }")
          .table__data(v-if="currentActive !== index") {{ row.languageForm }}
          .table__drop(v-else)
            SelectSingle(
              :selectedOption="currentLangForm"
              :options="langForms"
              @chooseOption="setLangForm"
              @scrollDrop="scrollDrop"
            )

        template(slot="steps" slot-scope="{ row, index }")
          .table__data(v-if="currentActive !== index") {{ row.steps.map(({step}) => step.title).join("; ")}}
          .table__drop(v-else)
            SelectMulti(
              :selectedOptions="currentStep"
              :options="allSteps.map(({title}) => title)"
              @chooseOptions="(e) => setStep(e)"
              @scrollDrop="scrollDrop"
            )
        template(slot="active" slot-scope="{ row, index }")
          .table__icons( :class="{'filter__opacity': currentActive !== index}")
            img.table__checkbox(v-if="row.active" src="../../../assets/images/latest-version/checkbox-brown-1.png" @click="toggleActive(index)" :class="{'table__opacity': currentActive === index}")
            img.table__checkbox(v-else src="../../../assets/images/latest-version/checkbox-brown-0.png" @click="toggleActive(index)" :class="{'table__opacity': currentActive === index}")
        template(slot="icons" slot-scope="{ row, index }")
          .table__icons
            img.table__icon(v-for="(icon, key) in manageIcons" :src="icon.icon" @click="makeAction(index, key)" :class="{'table__opacity': isActive(key, index)}")
    Add(@add="addService")
</template>

<script>
	import GeneralTable from "../../GeneralTable"
	import SelectMulti from "../../SelectMulti"
	import SelectSingle from "../../SelectSingle"
	import Add from "@/components/Add"
	import scrollDrop from "@/mixins/scrollDrop"
	import { mapActions } from "vuex"
	import crudIcons from "@/mixins/crudIcons"

	export default {
		mixins: [ scrollDrop, crudIcons ],
		props: {
			allSteps: { type: Array }
		},
		data() {
			return {
				fields: [
					{ label: "Title", headerKey: "headerTitle", key: "title", style: { width: "25%" } },
					{ label: "Language Form", headerKey: "headerLangForm", key: "languageForm", style: { width: "16%" } },
					{ label: "Steps", headerKey: "headerSteps", key: "steps", style: { width: "35%" } },
					{ label: "Active", headerKey: "headerActive", key: "active", style: { width: "9%" } },
					{ label: "", headerKey: "headerIcons", key: "icons", style: { width: "15%" } }
				],
				services: [],
				langForms: [ "Mono", "Duo" ],
				currentActive: -1,
				currentTitle: "",
				currentLangForm: "",
				currentStep: "",
				imageData: "",
				steps: [],
				areErrors: false,
				errors: [],
				tableWidth: 920
			}
		},
		methods: {
			isScrollDrop(drop, elem) {
				return drop && this.services.length >= 20
			},
			presentStep(steps, title) {
				if (steps && steps.length) {
					const stage = steps.find(item => item.stage === title)
					return stage ? stage.step.title : ""
				}
				return ""
			},
			toggleActive(index) {
				if (this.currentActive !== index) return
				this.services[index].active = !this.services[index].active
			},
			toggleActiveRequestQuote(index) {
				if (this.currentActive !== index) return
				this.services[index].isRequestQuote = !this.services[index].isRequestQuote
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
					await this.getAllServices()
				}
			},
			async checkErrors(index) {
				if (this.currentActive === -1) return
				this.errors = []
        this.areErrors = false
				if (!this.currentTitle || this.isTitleUnique(index)) this.errors.push("Title should not be empty and be unique!")
				if (!this.currentLangForm) this.errors.push("Please, select language form.")
				if (!this.currentStep.length > 0) this.errors.push("Please, select at least one step.")
				if (this.errors.length) {
					this.areErrors = true
					return
				}
				await this.saveChanges(index)
				this.cancel()
			},
			isTitleUnique(index2) {
				const notCurrentService = this.services.filter((item, index) => index !== index2)
				const duplicateIndex = notCurrentService.findIndex(item => item.title === this.currentTitle)
				console.log(duplicateIndex)
				return duplicateIndex !== -1
			},
			closeErrors() {
				this.areErrors = false
			},
			async saveChanges(index) {
				if (this.currentActive === -1) return
				const id = this.services[index]._id
				console.log(this.services[index])

				const newData = this.collectData(index)
				try {
					!id ? await this.createNew(newData) : await this.updateService(id, newData)
					await this.getAllServices()
					this.alertToggle({ message: "Saved", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Erorr on saving Service", isShow: true, type: "error" })
				}
			},
			async createNew(newData) {
				try {
					await this.$http.post('/service/service/new', newData)
				} catch (err) {
					this.alertToggle({ message: "Erorr on saving Service info", isShow: true, type: "error" })
				}
			},
			async updateService(id, newData) {
				try {
					await this.$http.post(`/service/service/${ id }`, newData)
				} catch (err) {
					this.alertToggle({ message: "Erorr on saving Service info", isShow: true, type: "error" })
				}
			},
			collectData(index) {
				const steps = this.allSteps.filter(({ title }) => this.currentStep.includes(title)).map(({ _id }) => ({ step: _id }))
				const newData = new FormData()
				newData.append("title", this.currentTitle)
				newData.append("active", this.services[index].active)
				newData.append("steps", JSON.stringify(steps))
				newData.append("languageForm", this.currentLangForm)
				return newData
			},
			setEditionData(index) {
				this.currentActive = index
				this.currentTitle = this.services[index].title
				this.currentLangForm = this.services[index].languageForm
				this.setCurrentEditableSteps(index)
			},
			setCurrentEditableSteps(index) {
				const { steps } = this.services[index]
				if (steps && steps.length) {
					this.currentStep = steps.map(({ step }) => step.title)
				} else {
					this.currentStep = []
				}
			},
			cancel() {
				this.currentActive = -1
				this.currentTitle = ""
				this.currentLangForm = ""
				this.currentStep = []
				this.imageData = ""
				this.$emit("setUnitFilter", { unit: "" })
			},
			setLangForm({ option }) {
				this.currentLangForm = option
			},
			setStep({ option }) {
				const position = this.currentStep.indexOf(option)
				if (position !== -1) {
					this.currentStep.splice(position, 1)
				} else {
					const { title } = this.allSteps.find((item) => item.title === option)
					this.currentStep.push(title)
				}
			},

			addService() {
				if (this.currentActive !== -1) {
					return this.isEditing()
				}
				this.services.push({
					title: "",
					languageForm: "",
					calculationUnit: ""
				})
				this.setEditionData(this.services.length - 1)
			},
			async getAllServices() {
				try {
					const services = await this.$http.get("/api/services")
					this.services = services.body
					await this.servicesGetting(this.services)
				} catch (err) {
					this.alertToggle({ message: "Erorr on getting Services", isShow: true, type: "error" })
				}
			},
			activeClasses(index) {
				return this.currentActive === index ? 'services_active services_flex' : ""
			},
			...mapActions([ "alertToggle", "servicesGetting" ])
		},
		computed: {
			manageIcons() {
				const { "delete": del, ...result } = this.icons
				return result
			}
		},
		components: {
			GeneralTable,
			SelectMulti,
			SelectSingle,
			Add
		},
		created() {
			this.getAllServices()
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
