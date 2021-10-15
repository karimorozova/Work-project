<template lang="pug">
  .clientService
    .clientService__modal-wrapper
      ApproveModal(
        v-if="isDeleting"
        text="Are you sure?"
        approveValue="Yes"
        notApproveValue="Cancel"
        @approve="deleteService"
        @close="closeModal"
        @notApprove="closeModal"
      )
      ValidationErrors(
        v-if="areErrors"
        :errors="errors"
        @closeErrors="closeErrors"
      )


    .clientService__table
      .clientService__editing(v-if="currentActive >= 0" :class="{'move-bottom': toggleFilter}" :style='`width: ${widthWithoutScroll}` ')
        .clientService__editing-item(style="width: 20%; background: white;")
          SelectSingle(
            :isTableDropMenu="isTableDropMenu",
            placeholder="Select",
            :hasSearch="true",
            :selectedOption="currentSource.lang",
            :options="mappedLanguages | firstEnglishLanguage",
            @chooseOption="setSource",
            @scrollDrop="scrollDrop"
          )
        .clientService__editing-item(v-if=" !newRow" style="width: 20%; background: white;" )
          SelectSingle(
            :isTableDropMenu="isTableDropMenu",
            placeholder="Select",
            :hasSearch="true",
            :selectedOption="currentTargets[0].lang",
            :options="mappedLanguages",
            @chooseOption="setTarget"
          )

        .clientService__editing-item( v-if=" newRow" style="width: 20%; background: white;")
          SelectMulti(
            :isTableDropMenu="isTableDropMenu",
            placeholder="Select",
            :hasSearch="true",
            :selectedOptions="currentTargets.map((i) => i.lang)",
            :options="mappedLanguages",
            @chooseOptions="setTargets"
            :allOptionsButtons="true"
          )
        .clientService__editing-item(v-if=" !newRow" style="width: 20%; background: white;")
          SelectSingle(
            :isTableDropMenu="isTableDropMenu",
            placeholder="Select",
            :hasSearch="true",
            :selectedOption="currentServices[0].title",
            :options="services.filter(item => item.steps.length && item.active).map((i) => i.title)",
            @chooseOption="setService"
            :allOptionsButtons="true"
          )
        .clientService__editing-item(v-if=" newRow" style="width: 20%; background: white;")
          SelectMulti(
            :isTableDropMenu="isTableDropMenu",
            placeholder="Select",
            :hasSearch="true",
            :selectedOptions="currentServices.map((i) => i.title)",
            :options="services.filter(item => item.steps.length && item.active).map((i) => i.title)",
            @chooseOptions="setServices"
            :allOptionsButtons="true"
          )
        .clientService__editing-item(v-if=" !newRow" style="width: 20%; background: white;")
          SelectSingle(
            :isTableDropMenu="isTableDropMenu",
            placeholder="Select",
            :hasSearch="true",
            :selectedOption="currentIndustries[0].name",
            :options="mappedIndustries",
            @chooseOption="setIndustry"
          )
        .clientService__editing-item(v-if=" newRow" style="width: 20%; background: white;")
          SelectMulti(
            :isTableDropMenu="isTableDropMenu",
            placeholder="Select",
            :hasSearch="true",
            :selectedOptions="currentIndustries.map((i) => i.name)",
            :options="mappedIndustries",
            @chooseOptions="setIndustries"
            :allOptionsButtons="true"
          )
        .clientService__editing-item(style="width: 20%;")
          .clientService__icons
            img.clientService__icon(
              v-for="(icon, key) in saveCancelIcon",
              :src="icon.icon",
              @click="makeAction(currentActive, key)",
              class="clientService_opacity"
            )
      //GeneralTable(
      //
      //  :fields="fields",
      //  :tableData="clientServices",
      //  :errors="errors",
      //  :areErrors="areErrors",
      //  :isApproveModal="isDeleting",
      //  :tbodyStyle="{'max-height': '300px'}",
      //  :rowCount="9",
      //  @closeErrors="closeErrors",
      //  @approve="deleteService",
      //  @notApprove="setDefaults",
      //  @closeModal="setDefaults"


      //)
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
          .clientService__head-title {{ field.label }}

        template(slot="sourceLanguage", slot-scope="{ row, index }")
          .clientService__data {{ row.sourceLanguage.lang }}

        template(slot="targetLanguages", slot-scope="{ row, index }")
          .clientService__data {{ row.targetLanguages[0].lang }}

        template(slot="services", slot-scope="{ row, index }")
          .clientService__data {{ row.services[0].title }}

        template(slot="industries", slot-scope="{ row, index }")
          .clientService__data {{ row.industries[0].name }}

        template(slot="icons", slot-scope="{ row, index }")
          .clientService__icons
            img.clientService__icon(
              v-for="(icon, key) in editDeleteIcon",
              :src="icon.icon",
              @click="makeAction(index, key)",
              :class="{ clientService_opacity: isActive(key, index) }"
            )

    Add(@add="addData")
</template>

<script>
	import { mapGetters, mapActions } from "vuex"
	import Add from "../Add"
	import SelectSingle from "../SelectSingle"
	import SelectMulti from "../SelectMulti"
	import GeneralTable from "../GeneralTable"
	import crudIcons from "@/mixins/crudIcons"
	import scrollDrop from "@/mixins/scrollDrop"
	import checkCombinations from "../../mixins/combinationsChecker"
  import tableSortAndFilter from "../../mixins/tableSortAndFilter"
  import ValidationErrors from "../ValidationErrors"
  import ApproveModal from "../ApproveModal"

	export default {
		mixins: [ scrollDrop, crudIcons, checkCombinations,tableSortAndFilter ],
		props: {
			clientServices: {
				type: Array
			},
			defaultPriceList: {
				type: Object
			},
			// mappedIndustries: {
			// 	type: Array
			// },
			// sourceLanguagesClient: {
			// 	type: Array
			// },
			// targetLanguagesClient: {
			// 	type: Array
			// },
      industries: {
	      type: Array
      },
			languages: {
				type: Array
			},
			mappedLanguages: {
				type: Array
			},
			services: {
				type: Array
			},
			mappedIndustries: {
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
            style: {width: "20%"},
					},
					{
						label: "Target Languages",
						headerKey: "headerTarget",
						key: "targetLanguages",
            dataKey: "lang",
            sortInfo: { isSort: true, order: 'default' },
            filterInfo: { isFilter: true },
            style: {width: "20%"},
					},
					{
						label: "Services",
						headerKey: "headerService",
						key: "services",
            dataKey: "title",
            sortInfo: { isSort: true, order: 'default' },
            filterInfo: { isFilter: true },
            style: {width: "20%"},
					},
					{
						label: "Industries",
						headerKey: "headerIndustry",
						key: "industries",
            dataKey: "name",
            sortInfo: { isSort: true, order: 'default' },
            filterInfo: { isFilter: true },
            style: {width: "20%"},
					},

					{
						label: "",
						headerKey: "headerIcons",
						key: "icons",
            style: {width: "20%"},
					}
				],

				currentSource: "",
				currentTargets: [],
				currentIndustries: [],
				currentServices: [],
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
				storeCurrentClient: "storeCurrentClient",
				setUpClientProp: "setUpClientProp"
			}),

			presentArrays(Arr, key) {
				if (!Arr.length) return ""
				return Arr.reduce((acc, cur) => acc + `${ cur[key] }; `, "")
			},

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
				this.currentIndustries = [ this.industries.find((item) => item.name === option) ]
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
				this.currentTargets = [ this.languages.find((item) => item.lang === option) ]
			},

			setServices({ option }) {
				const position = this.currentServices.map((item) => item.title).indexOf(option)
				if (position !== -1) {
					this.currentServices.splice(position, 1)
				} else {
					const service = this.services.find((item) => item.title === option)
					this.currentServices.push(service)
				}
			},
			setService({ option }) {
				this.currentServices = [ this.services.find((item) => item.title === option) ]
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

        const allServices = this.finalData[index] ? this.finalData[index] : this.clientServices[index]
				this.currentActive = index
				this.currentId = allServices._id
				this.currentSource = allServices.sourceLanguage
				this.currentTargets = allServices.targetLanguages
				this.currentIndustries = allServices.industries
				this.currentServices = allServices.services
			},

			manageCancelEdition(index) {
        const allServices = this.finalData[index] ? this.finalData : this.clientServices
				!allServices[index]._id && allServices.splice(index, 1)
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
				this.currentServices = []
			},

			async checkErrors(index) {
				const currentIndex = index
				const countOfFields = { first: 5, second: 5, third: 5 }
				if (this.currentActive === -1) return
				this.errors = []

				if (!this.newRow) {
					const arraysOfTheSame = this.finalData
							.filter((item, index) => index !== currentIndex)
							.filter((item) =>
									item.sourceLanguage.lang === this.currentSource.lang &&
									item.targetLanguages.find((x) => this.currentTargets.some((y) => x.lang === y.lang)) &&
									item.industries.find((x) => this.currentIndustries.some((y) => x.name === y.name)) &&
									item.services.find((x) => this.currentServices.some((y) => x.title === y.title))
							)
					if (arraysOfTheSame.length) this.errors.push("Such data already exists!")
				}
				if (!this.checkCombinations(this.currentTargets.length, this.currentServices.length, this.currentIndustries.length, countOfFields))
					this.errors.push(`Max selected fields: \n Targets = ${ countOfFields.first } | Services = ${ countOfFields.second } | Steps = ${ countOfFields.third } `)
				if (!this.currentSource) this.errors.push("Source should not be empty!")
				if (!this.currentTargets.length) this.errors.push("Target should not be empty!")
				if (!this.currentIndustries.length) this.errors.push("Industry should not be empty!")
				if (!this.currentServices.length) this.errors.push("Service should not be empty!")
				if (this.errors.length) {
					this.areErrors = true
					return
				}
				await this.manageSaveClick(index)
			},

			async manageSaveClick(index) {

        const allServices = this.finalData[index] ? this.finalData : this.clientServices
				if (this.currentActive === -1) return
				try {
					const id = allServices[index]._id
					const oldData = allServices[index]
					const currentData = {
						_id: id,
						sourceLanguage: this.currentSource,
						targetLanguages: this.currentTargets,
						services: this.currentServices,
						industries: this.currentIndustries
					}
					const result = await this.$http.post("/clientsapi/services", {
						clientId: this.$route.params.id,
						currentData,
						oldData
					})

					this.setUpClientProp({ _id: this.$route.params.id, key: 'services', value: result.data.services })
					this.setUpClientProp({ _id: this.$route.params.id, key: 'rates', value: result.data.rates })

					// this.clientServices = result.data.services;
          allServices.length && this.$emit("updateRates", true)

					await this.$http.post('/pm-manage/check-pricelist-langs', {
						pricelistId: this.defaultPriceList,
						langPairs: this.getArrayLanguagesCombinations(this.currentSource, this.currentTargets)
					})

					this.alertToggle({ message: "Services are saved", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Error in save Services", isShow: true, type: "error" })
				} finally {
					this.setDefaults()
					this.newRow = false
					this.$emit('updateRateCombinationFromSettings')
				}
			},

			getArrayLanguagesCombinations(source, targets) {
				return targets.map(item => `${ source.lang } - ${ item.lang }`)
			},

			async manageDeleteClick(index) {
        if(this.currentActive >= 0 || this.isDeleting) {
         return this.isEditing()
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

			async deleteService() {
				try {
					let currentData = this.finalData[this.deleteIndex]
					const result = await this.$http.delete(`/clientsapi/services/${ this.$route.params.id }/${ currentData._id }`)
					this.setUpClientProp({ _id: this.$route.params.id, key: 'services', value: result.data.services })
					this.setUpClientProp({ _id: this.$route.params.id, key: 'rates', value: result.data.rates })

					this.$emit("updateRates", true)
					this.finalData.splice(this.deleteIndex, 1)
					this.closeModal()
					this.alertToggle({ message: "Services are deleted", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Error in save Services", isShow: true, type: "error" })
				}
			},

			addData() {
				if (this.currentActive !== -1) {
					return this.isEditing()
				}
				this.newRow = true
				this.clientServices.push({
					sourceLanguage: "",
					targetLanguages: [],
					services: [],
					industries: []
				})
				this.setEditingData(this.clientServices.length - 1)
			},

			closeErrors() {
				this.areErrors = false
			},

			setSource({ option }) {
				this.currentSource = this.languages.find((item) => item.lang === option)
			}

			// async getClientInfo() {
			//   if (!this.currentClient._id) {
			//     const client = await this.$http.get(`/clientsapi/client?id=${this.$route.params.id}`);
			//     this.clientServices = client.body.services;
			//     this.defaultPriceList = client.body.defaultPricelist;
			//   } else {
			//     this.clientServices = this.currentClient.services;
			//     this.defaultPriceList = this.currentClient.defaultPricelist;
			//
			//   }
			// },
		},
		computed: {
			...mapGetters({
				currentClient: "getCurrentClient"
			}),

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
      rawData() {
        return this.clientServices.filter(data => {
          return data.sourceLanguage.hasOwnProperty('lang')
        })
      },
		},
		created() {
			// this.getClientInfo();
		},
		components: {
			SelectSingle,
      GeneralTable,
			SelectMulti,
			Add,
      ValidationErrors,
      ApproveModal,
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/styles/settingsTable.scss";

  .clientService {
    &__data {
      @extend %table-data;
      overflow-x: hidden;
    }
    &__table{
      position: relative;
    }
    &__modal-wrapper {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 5;
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

    &__head-title{
      padding: 0 6px;
    }
  }
</style>
