<template lang="pug">
  .clientService
    .clientService__table
      general-table(
        :headers="fields",
        :tableData="finalData",
        :errors="errors",
        :areErrors="areErrors",
        :isApproveModal="isDeleting",
        :tbodyStyle="{'max-height': '300px'}",
        :rowCount="9",
        @closeErrors="closeErrors",
        @approve="deleteService",
        @notApprove="setDefaults",
        @closeModal="setDefaults"
        @addSortKey="addSortKey"
        @changeSortKey="changeSortKey"
        @removeSortKey="removeSortKey"
        @setFilter="setFilter"
        @removeFilter="removeFilter"
      )
        template(v-for="field in fields", :slot="field.slotHeaderName", slot-scope="{ field }")
          .clientService__head-title {{ field.label }}

        template(slot="sourceLanguage", slot-scope="{ row, index }")
          .clientService__data(v-if="currentActive !== index") {{ row.sourceLanguage.lang }}
          .clientService__drop-menu(v-else)
            NewSelectSingle(
              :isTableDropMenu="isTableDropMenu",
              placeholder="Select",
              :hasSearch="true",
              :selectedOption="currentSource.lang",
              :options="sourceLanguagesClient | firstEnglishLanguage",
              @chooseOption="setSource",
              @scrollDrop="scrollDrop"
            )

        template(slot="targetLanguages", slot-scope="{ row, index }")
          .clientService__data(v-if="currentActive !== index") {{ row.targetLanguages[0].lang }}
          .clientService__drop-menu(v-if="currentActive == index && !newRow")
            NewSelectSingle(
              :isTableDropMenu="isTableDropMenu",
              placeholder="Select",
              :hasSearch="true",
              :selectedOption="currentTargets[0].lang",
              :options="targetLanguagesClient",
              @chooseOption="setTarget"
            )
          .clientService__drop-menu(v-if="currentActive == index && newRow")
            SelectMulti(
              :isTableDropMenu="isTableDropMenu",
              placeholder="Select",
              :hasSearch="true",
              :selectedOptions="currentTargets.map((i) => i.lang)",
              :options="targetLanguagesClient",
              @chooseOptions="setTargets"
              :allOptionsButtons="true"
            )

        template(slot="services", slot-scope="{ row, index }")
          .clientService__data(v-if="currentActive !== index") {{ row.services[0].title }}
          .clientService__drop-menu(v-if="currentActive == index && !newRow")
            NewSelectSingle(
              :isTableDropMenu="isTableDropMenu",
              placeholder="Select",
              :hasSearch="true",
              :selectedOption="currentServices[0].title",
              :options="services.filter(item => item.steps.length && item.active).map((i) => i.title)",
              @chooseOption="setService"
              :allOptionsButtons="true"
            )
          .clientService__drop-menu(v-if="currentActive == index && newRow")
            SelectMulti(
              :isTableDropMenu="isTableDropMenu",
              placeholder="Select",
              :hasSearch="true",
              :selectedOptions="currentServices.map((i) => i.title)",
              :options="services.filter(item => item.steps.length && item.active).map((i) => i.title)",
              @chooseOptions="setServices"
              :allOptionsButtons="true"
            )

        template(slot="industries", slot-scope="{ row, index }")
          .clientService__data(v-if="currentActive !== index") {{ row.industries[0].name }}
          .clientService__drop-menu(v-if="currentActive == index && !newRow")
            NewSelectSingle(
              :isTableDropMenu="isTableDropMenu",
              placeholder="Select",
              :hasSearch="true",
              :selectedOption="currentIndustries[0].name",
              :options="clientIndustries",
              @chooseOption="setIndustry"
            )
          .clientService__drop-menu(v-if="currentActive == index && newRow")
            SelectMulti(
              :isTableDropMenu="isTableDropMenu",
              placeholder="Select",
              :hasSearch="true",
              :selectedOptions="currentIndustries.map((i) => i.name)",
              :options="clientIndustries",
              @chooseOptions="setIndustries"
              :allOptionsButtons="true"
            )

        template(slot="icons", slot-scope="{ row, index }")
          .clientService__icons
            img.clientService__icon(
              v-for="(icon, key) in icons",
              :src="icon.icon",
              @click="makeAction(index, key, row._id)",
              :class="{ clientService_opacity: isActive(key, index) }"
            )

    Add(@add="addData")
</template>

<script>
	import { mapGetters, mapActions } from "vuex"
	import Add from "../Add"
	import NewSelectSingle from "../NewSelectSingle"
	import SelectMulti from "../SelectMulti"
	import SettingsTable from "../Table/SettingsTable"
	import crudIcons from "@/mixins/crudIcons"
	import scrollDrop from "@/mixins/scrollDrop"
	import scrollEnd from "../../mixins/scrollEnd"
	import checkCombinations from "../../mixins/combinationsChecker"
  import GeneralTable from "../GeneralTable"

	export default {
		mixins: [ scrollDrop, crudIcons, scrollEnd, checkCombinations ],
		props: {
			clientServices: {
				type: Array
			},
			defaultPriceList: {
				type: Object
			},
			clientIndustries: {
				type: Array
			},
			sourceLanguagesClient: {
				type: Array
			},
			targetLanguagesClient: {
				type: Array
			},
			languages: {
				type: Array
			},
			services: {
				type: Array
			},
			industries: {
				type: Array
			},
		},
		data() {
			return {
				fields: [
					{
						label: "Source Language",
            slotHeaderName: "headerSource",
            slotDataName: "sourceLanguage",
            key: 'lang',
            hasFilter: true,
            sortInfo: { isSort: true, isArray: false, order: 'default',},
            style: {"width": "20%"},
          },
					{
						label: "Target Languages",
						slotHeaderName: "headerTarget",
            slotDataName: "targetLanguages",
            key: 'lang',
            hasFilter: true,
            sortInfo: { isSort: true, isArray: true, order: 'default',},
            style: {"width": "20%"},
          },
					{
						label: "Services",
            slotHeaderName: "headerService",
            slotDataName: "services",
            key: 'title',
            hasFilter: false,
            sortInfo: { isSort: true, isArray: true,  order: 'default',},
            style: {"width": "20%"},
          },
					{
						label: "Industries",
            slotHeaderName: "headerIndustry",
						slotDataName: "industries",
            key: 'name',
            hasFilter: true,
            sortInfo: { isSort: true, isArray: true, order: 'default',},
            style: {"width": "20%"},
          },

					{
						label: "",
            slotHeaderName: "headerIcons",
						slotDataName: "icons",
            key: 'name',
            hasFilter: false,
            sortInfo: { isSort: false, isArray: false, order: 'default',},
            style: {"width": "20%"}
          }
				],
        sortKeys: [],
        filtersData: {
          sourceLanguage: {value: '' , key: ''},
          targetLanguages: {value: '' , key: ''},
          services: {value: '' , key: ''},
          industries: {value: '' , key: ''}
        },
        sortedData: [],


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
      addSortKey({ sortInfo, key, sortField, order }) {
        sortInfo.order = order
        this.sortKeys.push({sortField, key, sortInfo})
      },
      changeSortKey({ sortInfo, order }) {
        sortInfo.order = order
        this.sortKeys = [...this.sortKeys]
      },
      removeSortKey({ sortInfo, sortField}) {
        sortInfo.order = 'default'
        this.sortKeys = this.sortKeys.filter((sortKey) => sortKey.sortField !== sortField)
      },
      setFilter({value, key, filterField}) {
        this.filtersData[filterField] = {value, key}
      },
      removeFilter({ filterField}) {
        this.filtersData[filterField] = {value: '', key: ''}
      },
      sortData({ sortInfo, key, sortField }) {
        this.sortedData.sort((a,b) => {
          let first = !sortInfo.isArray ? a[sortField][key] : a[sortField][0][key]
          let second = !sortInfo.isArray ? b[sortField][key] : b[sortField][0][key]
          if(sortInfo.order === 'asc') [first, second] = [second, first]
          if (first > second) {
            return 1;
          }
          if (first < second) {
            return -1;
          }
          return 0;
        })
      },
      filterData({ filterKey, value, fieldName }) {
        this.sortedData = this.sortedData.filter((data) => {
          const regex = new RegExp(`${value}`,'gi')
          const dataReadyForSearch = !Array.isArray(data[filterKey]) ? data[filterKey][fieldName] : data[filterKey].map(elem => elem[fieldName]).join(' ')
          return regex.test(dataReadyForSearch)
        })
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

			async makeAction(index, key, _id) {
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
				this.currentId = this.sortedData[index]._id
				this.currentSource = this.sortedData[index].sourceLanguage
				this.currentTargets = this.sortedData[index].targetLanguages
				this.currentIndustries = this.sortedData[index].industries
				this.currentServices = this.sortedData[index].services
			},

			manageCancelEdition(index) {
				!this.sortedData[index]._id && this.sortedData.splice(index, 1)
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
					const arraysOfTheSame = this.sortedData
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

				if (this.currentActive === -1) return
				try {
					const id = this.sortedData[index]._id
					const oldData = this.sortedData[index]
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
					this.sortedData.length && this.$emit("updateRates", true)

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
				}
			},

			getArrayLanguagesCombinations(source, targets) {
				return targets.map(item => `${ source.lang } - ${ item.lang }`)
			},

			async manageDeleteClick(index) {
				if (!this.sortedData[index]._id) {
					this.newRow = false
					this.sortedData.splice(index, 1)
					this.setDefaults()
					return
				}
				this.deleteIndex = index
				this.isDeleting = true
			},

			closeModal() {
				return (this.isDeleting = false)
			},

			async deleteService() {
				try {
					let currentData = this.sortedData[this.deleteIndex]
					const result = await this.$http.delete(`/clientsapi/services/${ this.$route.params.id }/${ currentData._id }`)
					this.setUpClientProp({ _id: this.$route.params.id, key: 'services', value: result.data.services })
					this.setUpClientProp({ _id: this.$route.params.id, key: 'rates', value: result.data.rates })

					this.$emit("updateRates", true)
					this.sortedData.splice(this.deleteIndex, 1)
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
				this.sortedData.push({
					sourceLanguage: "",
					targetLanguages: [],
					services: [],
					industries: []
				})
				this.setEditingData(this.sortedData.length - 1)
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
		},
    watch: {
    },
		computed: {
			...mapGetters({
				currentClient: "getCurrentClient"
			}),
      finalData() {
        this.sortedData = JSON.parse( JSON.stringify( this.clientServices))

        for (let filterKey in this.filtersData) {
          if (this.filtersData[filterKey].value.length < 1) continue
          this.filterData({filterKey, value: this.filtersData[filterKey].value, fieldName: this.filtersData[filterKey].key })
        }

        let sortKeys = [...this.sortKeys].reverse()

        for(let sortKey of sortKeys ) {
          this.sortData(sortKey)
        }

        return this.sortedData
      }
		},
		created() {
			// this.getClientInfo();
		},
		components: {
      GeneralTable,
			NewSelectSingle,
			SettingsTable,
			SelectMulti,
			Add
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
      height: 100%;
    }

    &_opacity {
      opacity: 1;
    }

    &__input {
      @extend %table-text-input;
    }
  }
</style>
