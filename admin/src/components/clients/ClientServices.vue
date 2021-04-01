<template lang="pug">
  .clientService
    .clientService__table
      SettingsTable(
        :fields="fields",
        :tableData="clientServices",
        :errors="errors",
        :areErrors="areErrors",
        :isApproveModal="isDeleting",
        :tbodyStyle="{'max-height': '300px'}",
        :rowCount="9",
        @closeErrors="closeErrors",
        @approve="deleteService",
        @notApprove="setDefaults",
        @closeModal="setDefaults"
      )
        template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
          .clientService__head-title {{ field.label }}

        template(slot="source", slot-scope="{ row, index }")
          .clientService__data(v-if="currentActive !== index") {{ row.sourceLanguage.lang }}
          .clientService__drop-menu(v-else)
            SelectSingle(
              :isTableDropMenu="isTableDropMenu",
              placeholder="Select",
              :hasSearch="true",
              :selectedOption="currentSource.lang",
              :options="sourceLanguagesClient | firstEnglishLanguage",
              @chooseOption="setSource",
              @scrollDrop="scrollDrop"
            )

        template(slot="targets", slot-scope="{ row, index }")
          .clientService__data(v-if="currentActive !== index") {{ row.targetLanguages[0].lang }}
          .clientService__drop-menu(v-if="currentActive == index && !newRow")
            SelectSingle(
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

        template(slot="service", slot-scope="{ row, index }")
          .clientService__data(v-if="currentActive !== index") {{ row.services[0].title }}
          .clientService__drop-menu(v-if="currentActive == index && !newRow")
            SelectSingle(
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

        template(slot="industry", slot-scope="{ row, index }")
          .clientService__data(v-if="currentActive !== index") {{ row.industries[0].name }}
          .clientService__drop-menu(v-if="currentActive == index && !newRow")
            SelectSingle(
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
	import SettingsTable from "../Table/SettingsTable"
	import crudIcons from "@/mixins/crudIcons"
	import scrollDrop from "@/mixins/scrollDrop"
	import scrollEnd from "../../mixins/scrollEnd"
	import checkCombinations from "../../mixins/combinationsChecker"

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
			}
		},
		data() {
			return {
				fields: [
					{
						label: "Source Language",
						headerKey: "headerSource",
						key: "source",
						width: "20%",
						padding: "0"
					},
					{
						label: "Target Languages",
						headerKey: "headerTarget",
						key: "targets",
						width: "20%",
						padding: "0"
					},
					{
						label: "Services",
						headerKey: "headerService",
						key: "service",
						width: "20%",
						padding: "0"
					},
					{
						label: "Industries",
						headerKey: "headerIndustry",
						key: "industry",
						width: "20%",
						padding: "0"
					},

					{
						label: "",
						headerKey: "headerIcons",
						key: "icons",
						width: "20%",
						padding: "0"
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
				this.currentActive = index
				this.currentId = this.clientServices[index]._id
				this.currentSource = this.clientServices[index].sourceLanguage
				this.currentTargets = this.clientServices[index].targetLanguages
				this.currentIndustries = this.clientServices[index].industries
				this.currentServices = this.clientServices[index].services
			},

			manageCancelEdition(index) {
				!this.clientServices[index]._id && this.clientServices.splice(index, 1)
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
					const arraysOfTheSame = this.clientServices
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
					const id = this.clientServices[index]._id
					const oldData = this.clientServices[index]
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
					this.clientServices.length && this.$emit("updateRates", true)

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
				if (!this.clientServices[index]._id) {
					this.newRow = false
					this.clientServices.splice(index, 1)
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
					let currentData = this.clientServices[this.deleteIndex]
					const result = await this.$http.delete(`/clientsapi/services/${ this.$route.params.id }/${ currentData._id }`)
					this.setUpClientProp({ _id: this.$route.params.id, key: 'services', value: result.data.services })
					this.setUpClientProp({ _id: this.$route.params.id, key: 'rates', value: result.data.rates })

					this.$emit("updateRates", true)
					this.clientServices.splice(this.deleteIndex, 1)
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
			})
		},
		created() {
			// this.getClientInfo();
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
  @import "../../assets/scss/style.scss";
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
