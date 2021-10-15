<template lang="pug">
  .competencies
    .competencies__modal-wrapper
      ApproveModal(
        v-if="isDeleting"
        text="Are you sure?"
        approveValue="Yes"
        notApproveValue="Cancel"
        @approve="deleteCompetencies"
        @close="closeModal"
        @notApprove="closeModal"
      )
      ValidationErrors(
        v-if="areErrors"
        :errors="errors"
        @closeErrors="closeErrors"
      )
    .competencies__table
      .competencies__editing(v-if="currentActive >= 0" :class="{'move-bottom': toggleFilter}" :style='`width: ${widthWithoutScroll}` ')
        .competencies__editing-item(style="width: 21%; background: white;")
          SelectSingle(
            :isTableDropMenu="isTableDropMenu",
            placeholder="Select",
            :hasSearch="true",
            :selectedOption="currentSource.lang",
            :options="sourceData | firstEnglishLanguage",
            @chooseOption="setSource"
          )
        .competencies__editing-item(v-if="!newRow" style="width: 21%; background: white;")
          SelectSingle(
            :isTableDropMenu="isTableDropMenu",
            placeholder="Select",
            :hasSearch="true",
            :selectedOption="currentTargets.lang",
            :options="languages.map((i) => i.lang).sort((a, b) => a.localeCompare(b))",
            @chooseOption="setTarget"
          )
        .competencies__editing-item(v-if="newRow" style="width: 21%; background: white;")
          SelectMulti(
            :isTableDropMenu="isTableDropMenu",
            placeholder="Select",
            :hasSearch="true",
            :selectedOptions="currentTargets.map((i) => i.lang)",
            :options="languages.map((i) => i.lang).sort((a, b) => a.localeCompare(b))",
            @chooseOptions="setTargets"
            :allOptionsButtons="true"
          )
        .competencies__editing-item(v-if="!newRow" style="width: 21%; background: white;")
          SelectSingle(
            :isTableDropMenu="isTableDropMenu",
            placeholder="Select",
            :hasSearch="true",
            :selectedOption="currentIndustries.name",
            :options="vendorIndustries",
            @chooseOption="setIndustry"
          )
        .competencies__editing-item(v-if="newRow" style="width: 21%; background: white;")
          SelectMulti(
            :isTableDropMenu="isTableDropMenu",
            placeholder="Select",
            :hasSearch="true",
            :selectedOptions="currentIndustries.map((i) => i.name)",
            :options="vendorIndustries",
            @chooseOptions="setIndustries"
            :allOptionsButtons="true"
          )
        .competencies__editing-item(v-if="!newRow" style="width: 21%; background: white;")
            SelectSingle(
              :isTableDropMenu="isTableDropMenu",
              placeholder="Select",
              :hasSearch="true",
              :selectedOption="currentSteps.title",
              :options="filteredSteps",
              @chooseOption="setStep"
            )
        .competencies__editing-item(v-if=" newRow" style="width: 21%; background: white;")
          SelectMulti(
            :isTableDropMenu="isTableDropMenu",
            placeholder="Select",
            :hasSearch="true",
            :selectedOptions="currentSteps.map((i) => i.title)",
            :options="filteredSteps",
            @chooseOptions="setSteps"
            :allOptionsButtons="true"
          )
        .competencies__editing-item(style="width: 16%")
          .competencies__icons
            img.competencies__icon(
              v-for="(icon, key) in saveCancelIcon",
              :src="icon.icon",
              @click.stop="makeAction(currentActive, key)",
              class="competencies_opacity"
            )

      GeneralTable(
        :fields="fields"
        :tableData="finalData"
        :isFilterShow="true"
        :activeField="currentActive"
        :isCoverBody="currentActive >= 0 || isDeleting || areErrors"

        @addSortKey="addSortKeyIfCan"
        @changeSortKey="changeSortKeyIfCan"
        @removeSortKey="removeSortKeyIfCan"
        @setFilter="setFilterIfCan"
        @removeFilter="removeFilterIfCan"
        @clearAllFilters="clearAllFiltersIfCan"
        @toggleFilter="(e) => (toggleFilter = e)"
      )

        template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
          .competencies__head-title {{ field.label }}

        template(slot="sourceLanguage", slot-scope="{ row, index }")
          .competencies__data {{ row.sourceLanguage.lang }}

        template(slot="targetLanguage", slot-scope="{ row, index }")
          .competencies__data  {{ row.targetLanguage.lang }}

        template(slot="industry", slot-scope="{ row, index }")
          .competencies__data  {{ row.industry.name }}

        template(slot="step", slot-scope="{ row, index }")
          .competencies__data  {{ row.step.title }}

        template(slot="icons", slot-scope="{ row, index }")
          .competencies__icons
            img.competencies__icon(
              v-for="(icon, key) in editDeleteIcon",
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
	import GeneralTable from "../GeneralTable"
	import ValidationErrors from "../ValidationErrors"
	import ApproveModal from "../ApproveModal"
	import crudIcons from "@/mixins/crudIcons"
	import scrollEnd from "../../mixins/scrollEnd"
	import checkCombinations from "../../mixins/combinationsChecker"
  import tableSortAndFilter from "../../mixins/tableSortAndFilter"

	export default {
		mixins: [ crudIcons, scrollEnd, checkCombinations,tableSortAndFilter ],
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
						key: "sourceLanguage",
            dataKey: "lang",
            sortInfo: { isSort: true, order: 'default' },
            filterInfo: { isFilter: true },
						style: {width: "21%"},
						padding: "0"
					},
					{
						label: "Target Language",
						headerKey: "headerTarget",
						key: "targetLanguage",
            dataKey: "lang",
            sortInfo: { isSort: true, order: 'default' },
            filterInfo: { isFilter: true },
						style: {width: "21%"},
						padding: "0"
					},
					{
						label: "Industry",
						headerKey: "headerIndustry",
						key: "industry",
            dataKey: "name",
            sortInfo: { isSort: true, order: 'default' },
            filterInfo: { isFilter: true },
            style: {width: "21%"},
						padding: "0"
					},
					{
						label: "Step",
						headerKey: "headerStep",
						key: "step",
            dataKey: "title",
            sortInfo: { isSort: true, order: 'default' },
            filterInfo: { isFilter: true },
            style: {width: "21%"},
						padding: "0"
					},
					{
						label: "",
						headerKey: "headerIcons",
						key: "icons",
            style: {width: "16%"},
						padding: "0"
					}
				],

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
				newRow: false,
        toggleFilter: false
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle",
				storeCurrentVendor: "storeCurrentVendor",
				updateVendorProp: "updateVendorProp"
			}),
      addSortKeyIfCan(e) {
			  if(this.currentActive >= 0 || this.isDeleting) {
          this.isEditing()
        }else {
			    this.addSortKey(e)
        }
      },
      changeSortKeyIfCan(e) {
			  if(this.currentActive >= 0 || this.isDeleting) {
          this.isEditing()
        }else {
			    this.changeSortKey(e)
        }
      },
      removeSortKeyIfCan(e) {
			  if(this.currentActive >= 0 || this.isDeleting) {
          this.isEditing()
        }else {
			    this.removeSortKey(e)
        }
      },
      setFilterIfCan(e) {
			  if(this.currentActive >= 0 || this.isDeleting) {
          this.isEditing()
        }else {
			    this.setFilter(e)
        }
      },
      removeFilterIfCan(e) {
			  if(this.currentActive >= 0 || this.isDeleting) {
          this.isEditing()
        }else {
			    this.removeFilter(e)
        }
      },
      clearAllFiltersIfCan(e) {
			  if(this.currentActive >= 0 || this.isDeleting) {
          this.isEditing()
        }else {
			    this.clearAllFilters(e)
        }
      },
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
			  const allCompetencies = this.finalData[index] ? this.finalData[index] : this.competenciesData[index]
				this.currentActive = index
				this.currentId = allCompetencies._id
				this.currentSource = allCompetencies.sourceLanguage
				this.currentTargets = allCompetencies.targetLanguage
				this.currentIndustries = allCompetencies.industry
				this.currentSteps = allCompetencies.step
			},

			manageCancelEdition(index) {
        const allCompetencies = this.finalData[index] ? this.finalData : this.competenciesData
				!allCompetencies[index]._id && allCompetencies.splice(index, 1)
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

          const allCompetencies = this.finalData[index] ? this.finalData[index] : this.competenciesData[index]
					const id = allCompetencies._id
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
					this.finalData.length && this.$emit("updateRates", true)
					await this.$http.post('/pm-manage/check-pricelist-langs', {
						pricelistId: null,
						langPairs: this.getArrayLanguagesCombinations(this.currentSource, this.currentTargets)
					})

					this.alertToggle({ message: "Competencies are saved", isShow: true, type: "success" })
				} catch (err) {
					console.log(err)
					this.alertToggle({ message: "Error in save Competencies", isShow: true, type: "error" })
				} finally {
					this.setDefaults()
					this.newRow = false
					this.$emit('updateRateCombinationFromSettings')
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
        if(this.currentActive >= 0 || this.isDeleting) {
          this.isEditing()
          return
        }
				if (!this.finalData[index]._id) {
					this.newRow = false
					this.finalData.splice(index, 1)
					this.setDefaults()
					return
				}
				this.deleteIndex = index
				this.isDeleting = true
        this.$emit('updateRateCombinationFromSettings')
			},

			closeModal() {
				return (this.isDeleting = false)
			},

			async deleteCompetencies() {
				try {
					let currentData = this.finalData[this.deleteIndex]
					const result = await this.$http.delete(`/vendorsapi/competencies/${ this.$route.params.id }/${ currentData._id }`)
					await this.storeCurrentVendor(result.data)
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
			},

			closeErrors() {
				this.areErrors = false
			},

			setSource({ option }) {
				this.currentSource = this.languages.find((item) => item.lang === option)
			}
		},
		computed: {
      widthWithoutScroll(){
        return document.querySelector('.data') ? document.querySelector('.data').clientWidth+1 +'px' : '100%'
      },
		  saveCancelIcon() {
        const {cancel, save} = this.icons
        return { save,cancel  }
      },
      editDeleteIcon() {
        const { cancel, save, ...result } = this.icons
        return result
      },
			sourceData() {
				return this.languages.map((i) => i.lang).sort((a, b) => a.localeCompare(b))
			},
			filteredSteps() {
				return this.steps.filter(step => step.calculationUnit.length).map(step => step.title)
			},
      rawData() {
        return this.competenciesData.filter(data => {
          return data.sourceLanguage.hasOwnProperty('lang') && data.targetLanguage.hasOwnProperty('lang') && data.step.hasOwnProperty('title') && data.industry.hasOwnProperty('name')
        })
      },

		},
		created() {
		},
		components: {
			SelectSingle,
      ApproveModal,
      GeneralTable,
      ValidationErrors,
			SelectMulti,
			Add
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/styles/settingsTable.scss";
  @import "../../assets/scss/colors";


  .competencies {

    &__table {
      position: relative;
    }

    &__editing {
      position: absolute;
      height: 40px;
      background-color: $light-green;
      z-index: 3;
      top: 80px;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      margin-left: 1px;

      &.move-bottom{
        top:120px;
      }

      &-item {
        position: relative;
        height: 32px;
        margin: 0 2px;
      }
    }

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
      width: 100%;
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
    &__head-title {
      padding: 0 6px;
    }
    &__modal-wrapper {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 5;
    }
    &__content-close {
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      left: 0;
      background-color: rgba(61,61,61,.3);
      z-index: 5;
    }
  }
</style>
