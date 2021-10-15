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
        //template(slot="step2" slot-scope="{ row, index }")
        //  .table__data(v-if="currentActive !== index") {{ presentStep(row.steps, 'stage2') }}
        //  .table__drop-menu(v-else)
        //    SelectSingle(
        //      :selectedOption="currentStep2"
        //      :options="secondStageSteps"
        //      @chooseOption="(e) => setStep(e, 'currentStep2')"
        //      @scrollDrop="scrollDrop"
        //      :isRemoveOption="true"
        //      @removeOption="removeOptionStep2"
        //    )
        //template(slot="isRequestQuote" slot-scope="{ row, index }")
          .table__data(:class="{'table_active': currentActive === index}")
            img.table__checkbox(v-if="row.isRequestQuote" src="../../../assets/images/latest-version/checkbox-brown-1.png" @click="toggleActiveRequestQuote(index)" :class="{'table_opacity': currentActive === index}")
            img.table__checkbox(v-else src="../../../assets/images/latest-version/checkbox-brown-0.png" @click="toggleActiveRequestQuote(index)" :class="{'table_opacity': currentActive === index}")

        template(slot="active" slot-scope="{ row, index }")
          .table__icons(:class="{'table_active': currentActive === index}")
            img.table__icon(v-if="row.active" src="../../../assets/images/latest-version/checkbox-brown-1.png" @click="toggleActive(index)" :class="{'table__opacity': currentActive === index}")
            img.table__icon(v-else src="../../../assets/images/latest-version/checkbox-brown-0.png" @click="toggleActive(index)" :class="{'table__opacity': currentActive === index}")
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
			allSteps: { type: Array },
			// firstStageSteps: { type: Array },
			// secondStageSteps: { type: Array }
		},
		data() {
			return {
				fields: [
					{ label: "Title", headerKey: "headerTitle", key: "title", style: { width: "50%" }},
					{ label: "Language Form", headerKey: "headerLangForm", key: "languageForm", style: { width: "25%" } },
					{ label: "Steps", headerKey: "headerSteps", key: "steps", style: { width: "25%" } },
					// { label: "Request Quote", headerKey: "headerIsRequestQuote", key: "isRequestQuote", style: { width: "25%" } },
					{ label: "Active", headerKey: "headerActive", key: "active", style: { width: "10%" } },
					{ label: "", headerKey: "headerIcons", key: "icons", style: { width: "15%" } }
				],
				services: [],
				langForms: [ "Mono", "Duo" ],
				currentActive: -1,
				currentTitle: "",
				currentLangForm: "",
				currentStep: "",
				// iconFile: [],
				imageData: "",
				steps: [],
				areErrors: false,
				errors: [],
				tableWidth: 920
			}
		},
		methods: {
			// removeOptionStep2(){
			// 	this.currentStep = ""
      // },
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
			// uploadIcon(event) {
			// 	this.iconFile.push(event.target.files[0])
			// 	const input = event.target
			// 	if (input.files && input.files[0]) {
			// 		let reader = new FileReader()
			// 		reader.onload = (e) => {
			// 			this.imageData = e.target.result
			// 		}
			// 		reader.readAsDataURL(input.files[0])
			// 	}
			// },
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
				if (!this.currentTitle || this.isTitleUnique(index)) this.errors.push("Title should not be empty and be unique!")
				if (!this.currentLangForm) this.errors.push("Please, select language form.")
				// if (!this.currentStep1) this.errors.push("Please, select Step 1.")
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
				const steps = this.allSteps.filter(({ title }) => this.currentStep.includes(title)).map(({ _id }) => ({step: _id}))
				const newData = new FormData()
				newData.append("title", this.currentTitle)
				newData.append("active", this.services[index].active)
				newData.append("steps", JSON.stringify(steps))
				// newData.append("isRequestQuote", this.services[index].isRequestQuote)
				// newData.append("icon", this.iconFile[0])
				newData.append("languageForm", this.currentLangForm)
				// newData.append("symbol", symbol)
				// newData.append("projectType", this.services[index].projectType)
				// newData.append("sortIndex", this.services[index].sortIndex)
				return newData
			},
			// getStepsInfo() {
			// 	let steps = []
			// 	const step = this.allSteps.find(item => item.title === this.currentStep)
      //   console.log(step)
			// 	steps.push({ step: step._id })
			// 	return steps
			// },
			setEditionData(index) {
				this.currentActive = index
				this.currentTitle = this.services[index].title
				this.currentLangForm = this.services[index].languageForm
				this.setCurrentEditableSteps(index)
			},
			setCurrentEditableSteps(index) {
				const { steps } = this.services[index]
				if (steps && steps.length) {
					this.currentStep = steps.map(({step}) => step.title)
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
				// this.iconFile = []
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
					calculationUnit: "",
				})
				this.setEditionData(this.services.length - 1)
			},
			async getAllServices() {
				try {
					const services = await this.$http.get("/api/services")
					this.services = services.body.sort((x, y) => {
						if (x.title > y.title) return 1
						if (x.title < y.title) return -1
					})
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
  //@import "../../../assets/styles/settingsTable";
  //
  //.services {
  //  width: 920;
  //
  //  &__data {
  //    @extend %table-data;
  //  }
  //
  //  &__editing-data {
  //    @extend %table-data;
  //    box-shadow: inset 0 0 7px $brown-shadow;
  //  }
  //
  //  &__input {
  //    @extend %table-text-input;
  //  }
  //
  //  &__icons {
  //    @extend %table-icons;
  //  }
  //
  //  &__icon {
  //    @extend %table-icon;
  //  }
  //
  //  &__drop-menu {
  //    position: relative;
  //  }
  //
  //  &__checkbox {
  //    cursor: pointer;
  //    opacity: 0.5;
  //  }
  //
  //  &_centered {
  //    justify-content: center;
  //  }
  //
  //  &_flex {
  //    display: flex;
  //    justify-content: space-around;
  //  }
  //
  //  &__main-icon, &__file-preview {
  //    width: 22px;
  //    height: 22px;
  //  }
  //
  //  &__link {
  //    display: flex;
  //    justify-content: center;
  //    align-items: center;
  //    width: 22px;
  //  }
  //
  //  &__download {
  //    cursor: pointer;
  //    width: 40%;
  //    display: flex;
  //    justify-content: center;
  //    align-items: center;
  //  }
  //
  //  &_opacity {
  //    opacity: 1;
  //  }
  //
  //  &__upload {
  //    position: relative;
  //    background: url("../../../assets/images/Other/upload-icon.png");
  //    background-position-x: center;
  //    background-repeat: no-repeat;
  //    width: 40%;
  //    height: 22px;
  //    overflow: hidden;
  //  }
  //
  //  &__load-file {
  //    width: 100%;
  //    height: 22px;
  //    border: none;
  //    outline: none;
  //    opacity: 0;
  //    z-index: 2;
  //    position: absolute;
  //    left: 6px;
  //    cursor: pointer;
  //    font-size: 0;
  //  }
  //
  //  &__no-file {
  //    opacity: 0.5;
  //  }
  //
  //  &_no-back {
  //    background: none;
  //  }
  //
  //  &__file-preview {
  //    margin-left: 10px;
  //  }
  //
  //  &_active {
  //    box-shadow: inset 0 0 8px $brown-shadow;
  //  }
  //}

  .table {
    width: 100%;

    &__data {
      width: 100%;
      padding: 0 7px;
    }

    &__header {
      padding: 0 7px;
    }

    &__drop {
      position: relative;
      height: 32px;
      width: 100%;
      margin: 0 7px;
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
