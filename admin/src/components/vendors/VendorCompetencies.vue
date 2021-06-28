<template lang="pug">
  .competencies
    .competencies__table
      SettingsTable(
        :fields="fields",
        :tableData="competenciesData",
        :errors="errors",
        :areErrors="areErrors",
        :isApproveModal="isDeleting",
        :tbodyStyle="{'max-height': '256px'}",
        :rowCount="9",
        @closeErrors="closeErrors",
        @approve="deleteCompetencies",
        @notApprove="setDefaults",
        @closeModal="setDefaults"
      )
        template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
          .competencies__head-title {{ field.label }}

        template(slot="source", slot-scope="{ row, index }")
          .competencies__data(v-if="currentActive !== index") {{ row.sourceLanguage.lang }}
          .competencies__drop-menu(v-else)
            SelectSingle(
              :isTableDropMenu="isTableDropMenu",
              placeholder="Select",
              :hasSearch="true",
              :selectedOption="currentSource.lang",
              :options="sourceData | firstEnglishLanguage",
              @chooseOption="setSource"
            )

        template(slot="targets", slot-scope="{ row, index }")
          .competencies__data(v-if="currentActive !== index") {{ row.targetLanguage.lang }}
          .competencies__drop-menu(v-if="currentActive == index && !newRow")
            SelectSingle(
              :isTableDropMenu="isTableDropMenu",
              placeholder="Select",
              :hasSearch="true",
              :selectedOption="currentTargets.lang",
              :options="languages.map((i) => i.lang).sort((a, b) => a.localeCompare(b))",
              @chooseOption="setTarget"
            )
          .competencies__drop-menu(v-if="currentActive == index && newRow")
            SelectMulti(
              :isTableDropMenu="isTableDropMenu",
              placeholder="Select",
              :hasSearch="true",
              :selectedOptions="currentTargets.map((i) => i.lang)",
              :options="languages.map((i) => i.lang).sort((a, b) => a.localeCompare(b))",
              @chooseOptions="setTargets"
              :allOptionsButtons="true"
            )

        template(slot="industry", slot-scope="{ row, index }")
          .competencies__data(v-if="currentActive !== index") {{ row.industry.name }}
          .competencies__drop-menu(v-if="currentActive == index && !newRow")
            SelectSingle(
              :isTableDropMenu="isTableDropMenu",
              placeholder="Select",
              :hasSearch="true",
              :selectedOption="currentIndustries.name",
              :options="vendorIndustries",
              @chooseOption="setIndustry"
            )
          .competencies__drop-menu(v-if="currentActive == index && newRow")
            SelectMulti(
              :isTableDropMenu="isTableDropMenu",
              placeholder="Select",
              :hasSearch="true",
              :selectedOptions="currentIndustries.map((i) => i.name)",
              :options="vendorIndustries",
              @chooseOptions="setIndustries"
              :allOptionsButtons="true"
            )

        template(slot="step", slot-scope="{ row, index }")
          .competencies__data(v-if="currentActive !== index") {{ row.step.title }}
          .competencies__drop-menu(v-if="currentActive == index && !newRow")
            SelectSingle(
              :isTableDropMenu="isTableDropMenu",
              placeholder="Select",
              :hasSearch="true",
              :selectedOption="currentSteps.title",
              :options="filteredSteps",
              @chooseOption="setStep"
            )
          .competencies__drop-menu(v-if="currentActive == index && newRow")
            SelectMulti(
              :isTableDropMenu="isTableDropMenu",
              placeholder="Select",
              :hasSearch="true",
              :selectedOptions="currentSteps.map((i) => i.title)",
              :options="filteredSteps",
              @chooseOptions="setSteps"
              :allOptionsButtons="true"
            )

        template(slot="icons", slot-scope="{ row, index }")
          .competencies__icons
            img.competencies__icon(
              v-for="(icon, key) in icons",
              :src="icon.icon",
              @click="makeAction(index, key)",
              :class="{ competencies_opacity: isActive(key, index) }"
            )

    Add(@add="addData")
</template>

<script>
	import { mapGetters, mapActions } from "vuex"
	import Add from "../Add"
	import SelectSingle from "../SelectSingle"
	import SelectMulti from "../SelectMulti"
	import SettingsTable from "../Table/SettingsTable"
	import crudIcons from "@/mixins/crudIcons"
	import scrollEnd from "../../mixins/scrollEnd"
	import checkCombinations from "../../mixins/combinationsChecker"

	export default {
		mixins: [ crudIcons, scrollEnd, checkCombinations ],
		props: {
			vendorIndustries: {
				type: Array
			},
			languages: {
				type: Array
			},
			steps: {
				type: Array
			},
			industries: {
				type: Array
			},
			competenciesData: {
				type: Array
			}
		},
		data() {
			return {
				fields: [
					{
						label: "Source Language",
						headerKey: "headerSource",
						key: "source",
						width: "21%",
						padding: "0"
					},
					{
						label: "Target Language",
						headerKey: "headerTarget",
						key: "targets",
						width: "21%",
						padding: "0"
					},
					{
						label: "Industry",
						headerKey: "headerIndustry",
						key: "industry",
						width: "21%",
						padding: "0"
					},
					{
						label: "Step",
						headerKey: "headerStep",
						key: "step",
						width: "21%",
						padding: "0"
					},
					{
						label: "",
						headerKey: "headerIcons",
						key: "icons",
						width: "16%",
						padding: "0"
					}
				],

				// competenciesData: [],
				currentSource: "",
				currentTargets: [],
				currentIndustries: [],
				currentSteps: [],
				currentId: "",

				currentActive: -1,
				areErrors: false,
				errors: [],
				isDeleting: false,
				deleteIndex: -1,
				isTableDropMenu: true,
				newRow: false
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle",
				storeCurrentVendor: "storeCurrentVendor",
				updateVendorProp: "updateVendorProp"
			}),

			presentArrays(Arr, key) {
				if (!Arr.length) return ""
				return Arr.reduce((acc, cur) => acc + `${ cur[key] }; `, "")
			},

			setIndustries({ option }) {
				const position = this.currentIndustries.map((item) => item.name).indexOf(option)
				if (position !== -1) {
					this.currentIndustries.splice(position, 1)
				} else {
					const industry = this.industries.find((item) => item.name === option)
					this.currentIndustries.push(industry)
				}
			},
			setIndustry({ option }) {
				this.currentIndustries = this.industries.find((item) => item.name === option)
			},

			setTargets({ option }) {
				const position = this.currentTargets.map((item) => item.lang).indexOf(option)
				if (position !== -1) {
					this.currentTargets.splice(position, 1)
				} else {
					const lang = this.languages.find((item) => item.lang === option)
					this.currentTargets.push(lang)
				}
			},
			setTarget({ option }) {
				this.currentTargets = this.languages.find((item) => item.lang === option)
			},

			setSteps({ option }) {
				const position = this.currentSteps.map((item) => item.title).indexOf(option)
				if (position !== -1) {
					this.currentSteps.splice(position, 1)
				} else {
					const service = this.steps.find((item) => item.title === option)
					this.currentSteps.push(service)
				}
			},
			setStep({ option }) {
				this.currentSteps = this.steps.find((item) => item.title === option)
			},

			async makeAction(index, key) {
				if (this.currentActive !== -1 && this.currentActive !== index) {
					return this.isEditing()
				}
				switch (key) {
					case "edit":
						this.setEditingData(index)
						break
					case "cancel":
						this.manageCancelEdition(index)
						break
					case "delete":
						this.manageDeleteClick(index)
						break
					default:
						await this.checkErrors(index)
				}
			},

			setEditingData(index) {
				this.currentActive = index
				this.currentId = this.competenciesData[index]._id
				this.currentSource = this.competenciesData[index].sourceLanguage
				this.currentTargets = this.competenciesData[index].targetLanguage
				this.currentIndustries = this.competenciesData[index].industry
				this.currentSteps = this.competenciesData[index].step
			},

			manageCancelEdition(index) {
				!this.competenciesData[index]._id && this.competenciesData.splice(index, 1)
				this.setDefaults()
				this.isDeleting = false
				this.newRow = false
			},

			setDefaults() {
				this.currentActive = -1
				this.isDeleting = false
				this.currentSource = ""
				this.currentTargets = []
				this.currentIndustries = []
				this.currentSteps = []
			},

			async checkErrors(index) {
				if (this.currentActive === -1) return
				const countOfFields = { first: 5, second: 5, third: 5 }
				this.errors = []
				if (this.newRow) {
					if (!this.checkCombinations(this.currentTargets.length, this.currentIndustries.length, this.currentSteps.length, countOfFields))
						this.errors.push(`Max selected fields: \n Targets = ${ countOfFields.first } | Industries = ${ countOfFields.second } | Steps = ${ countOfFields.third } `)
					if (!this.currentSource) this.errors.push("Source should not be empty!")
					if (!this.currentTargets.length) this.errors.push("Targets should not be empty!")
					if (!this.currentIndustries.length) this.errors.push("Industries should not be empty!")
					if (!this.currentSteps.length) this.errors.push("Steps should not be empty!")
				} else {
					const vendor = await this.$http.get(`/vendorsapi/vendor?id=${ this.$route.params.id }`)
					const listCompetencies = vendor.data.competencies.filter((item) => item._id !== this.currentId)

					const arraysOfTheSame = listCompetencies.filter(
							(item) =>
									item.sourceLanguage.lang === this.currentSource.lang &&
									item.targetLanguage.lang === this.currentTargets.lang &&
									item.industry.name === this.currentIndustries.name &&
									item.step.title === this.currentSteps.title
					)

					if (arraysOfTheSame.length) this.errors.push("Such data already exists!")
					if (!this.currentSource) this.errors.push("Source should not be empty!")
					if (!this.currentTargets) this.errors.push("Target should not be empty!")
					if (!this.currentIndustries) this.errors.push("Industry should not be empty!")
					if (!this.currentSteps) this.errors.push("Step should not be empty!")
				}
				if (this.errors.length) {
					this.areErrors = true
					return
				}
				await this.manageSaveClick(index)
			},
			async manageSaveClick(index) {
				try {
					const id = this.competenciesData[index]._id
					const currentData = {
						_id: id,
						sourceLanguage: this.currentSource,
						targetLanguage: this.currentTargets,
						step: this.currentSteps,
						industry: this.currentIndustries
					}
					const result = await this.$http.post("/vendorsapi/competencies", {
						vendorId: this.$route.params.id,
						currentData
					})
					await this.storeCurrentVendor(result.data)
					// await this.updateVendorProp({ id: this.$route.params.id , key: 'competencies', value: result.data.competencies })

					this.competenciesData.length && this.$emit("updateRates", true)

					// this.updateVendorProp({ prop: "competencies", value: result.data.competencies })

					// this.competenciesData = result.data.competencies;
					// this.competenciesData.length && this.$emit("updateQualifications");
					//

					// if (result.data.pendingCompetencies.length) {
					// 	const updatedPendingCompetencies = await this.$http.post('/vendorsapi/vendor-pendingCompetencies-add-benchmark', { pendingCompetencies: result.data.pendingCompetencies })
					// 	this.updateVendorProp({ prop: "pendingCompetencies", value: updatedPendingCompetencies.data })
					// }

					await this.$http.post('/pm-manage/check-pricelist-langs', {
						pricelistId: null,
						langPairs: this.getArrayLanguagesCombinations(this.currentSource, this.currentTargets)
					})

					this.alertToggle({
						message: "Competencies are saved",
						isShow: true,
						type: "success"
					})
				} catch (err) {
					console.log(err)
					this.alertToggle({
						message: "Error in save Competencies",
						isShow: true,
						type: "error"
					})
				} finally {
					this.setDefaults()
					this.newRow = false
				}
			},
			getArrayLanguagesCombinations(source, targets) {
				if (Array.isArray(targets)) {
					return targets.map(item => `${ source.lang } - ${ item.lang }`)
				} else {
					return [ `${ source.lang } - ${ targets.lang }` ]
				}
			},
			async manageDeleteClick(index) {
				if (!this.competenciesData[index]._id) {
					this.newRow = false
					this.competenciesData.splice(index, 1)
					this.setDefaults()
					return
				}
				this.deleteIndex = index
				this.isDeleting = true
			},

			closeModal() {
				return (this.isDeleting = false)
			},

			async deleteCompetencies() {
				try {
					let currentData = this.competenciesData[this.deleteIndex]
					const result = await this.$http.delete(`/vendorsapi/competencies/${ this.$route.params.id }/${ currentData._id }`)
					await this.storeCurrentVendor(result.data)
					// if (result.data.pendingCompetencies.length) {
					// 	const updatedPendingCompetencies = await this.$http.post('/vendorsapi/vendor-pendingCompetencies-add-benchmark', { pendingCompetencies: result.data.pendingCompetencies })
					// 	this.updateVendorProp({ prop: "pendingCompetencies", value: updatedPendingCompetencies.data.pendingCompetencies })
					// }
					// this.competenciesData.splice(this.deleteIndex, 1);
					this.$emit("updateRates", true)
					this.closeModal()
					this.alertToggle({
						message: "Competencies are deleted",
						isShow: true,
						type: "success"
					})
				} catch (err) {
					this.alertToggle({
						message: "Error in save Competencies",
						isShow: true,
						type: "error"
					})
				}
			},

			addData() {
				if (this.currentActive !== -1) {
					return this.isEditing()
				}
				this.newRow = true
				this.competenciesData.push({
					sourceLanguage: "",
					targetLanguage: [],
					step: [],
					industry: []
				})
				this.setEditingData(this.competenciesData.length - 1)
				this.$nextTick(() => {
					this.scrollToEnd()
				})
			},

			closeErrors() {
				this.areErrors = false
			},

			setSource({ option }) {
				this.currentSource = this.languages.find((item) => item.lang === option)
			}
			// async getVendorInfo() {
			// 	console.log('1')
			// 	const vendor = await this.$http.get(`/vendorsapi/vendor?id=${ this.$route.params.id }`);
			// 	this.competenciesData = vendor.data.competencies;
			// },
			// getVendorInfoByState(){
			// 	this.competenciesData = this.currentVendor.competencies
			// }
		},
		computed: {
			// ...mapGetters({
			// 	currentVendor: "getCurrentVendor",
			// }),
			sourceData() {
				return this.languages.map((i) => i.lang).sort((a, b) => a.localeCompare(b))
			},
			filteredSteps() {
				return this.steps.filter(step => step.calculationUnit.length).map(step => step.title)
			}
		},
		created() {
			// if(this.currentVendor._id){
			// 	this.competenciesData = this.currentVendor.competencies
			// }
			// ?  : this.getVendorInfo();
		},
		components: {
			SelectSingle,
			SettingsTable,
			SelectMulti,
			Add
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/styles/settingsTable.scss";

  .competencies {

    &__data {
      @extend %table-data;
      overflow-x: hidden;
    }

    &__editing-data {
      @extend %table-data;
      box-shadow: inset 0 0 7px $brown-shadow;
    }

    &__data-input {
      @extend %table-text-input;
    }

    &__icons {
      @extend %table-icons;
      height: 30px;
      justify-content: center;
    }

    &__icon {
      @extend %table-icon;
    }

    &__drop-menu {
      position: relative;
      box-shadow: inset 0 0 7px $brown-shadow;
    }

    &_opacity {
      opacity: 1;
    }

    &__input {
      @extend %table-text-input;
    }
  }
</style>
