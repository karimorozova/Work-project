<template lang="pug">
  .layout
    .new__languages(v-if="languageModal")
      NewLanguageModal(
        :languagesArr="newLanguagesPairs"
        @savePairs="savePairs"
        @closePairs="closeModal"
      )
    .title
      .title__title(v-if="this.pricelists") {{ this.pricelists.find((i) => i._id.toString() === priceId.toString()).name }}
      .buttons
        .title__return(v-if="newLanguagesPairs.length")
          .update-btn(@click="openModal") Update Languages pairs
        .title__return
          Button(value="Back", @clicked="goBack")

    .priceLayout
      .priceLayout__editIcons
        .actionsButton__icon
          img.priceLayout__editIcons-opacity1(v-if="!paramsIsEdit" :src="icons.edit.icon" @click="crudActions('edit')")
          img.priceLayout__editIcons-opacity05(v-else :src="icons.edit.icon")
        .actionsButton__icon
          img.priceLayout__editIcons-opacity1(v-if="paramsIsEdit" :src="icons.cancel.icon" @click="crudActions('cancel')")
          img.priceLayout__editIcons-opacity05(v-else :src="icons.cancel.icon")

      .priceLayout__currency
        CurrencyRatio(@refreshPage="getAllData", @refreshResultTable="refreshResultTable")

      .priceLayout__allTabs
        Tabs(
          :tabs="tabs"
          :selectedTab="selectedTab"
          @setTab="setTab"
        )
        .priceLayout__table(v-if="selectedTab === 'Basic Price'")
          LangTable(
            :priceId="priceId",
            :languages="languages",
            :isRefresh="isRefresh",
            @refreshResultTable="refreshResultTable"
            :isEdit="isEdit"
          )
        .priceLayout__table(v-if="selectedTab === 'Steps / Units'")
          StepTable(
            :priceId="priceId",
            :steps="steps",
            :units="units",
            :sizes="sizes",
            :isRefresh="isRefresh",
            @refreshResultTable="refreshResultTable"
            :isEdit="isEdit"
          )
        .priceLayout__table(v-if="selectedTab === 'Industries'")
          IndustryTable(
            :priceId="priceId",
            @refreshResultTable="refreshResultTable"
            :isEdit="isEdit"
          )

        .priceLayout__table(v-if="selectedTab === 'Overall Prices'")
          ResultTable(
            :priceId="priceId",
            :languages="languages",
            :steps="steps",
            :units="units",
            :industries="industries",
            :isRefreshResultTable="isRefreshResultTable"
          )
        .priceLayout__table(v-if="selectedTab === 'Discount Chart'")
          .discountChartLayout(v-if="this.pricelists != null")
            DiscountChart(
              :discountChart="discountChart",
              :pricelistId="priceId"
              :isEdit="isEdit"
            )

</template>
<script>
	import NewLanguageModal from "./pricelistSettings/NewLanguageModal"
	import LangTable from "./pricelistSettings/LangTable"
	import IndustryTable from "./pricelistSettings/IndustryTable"
	import StepTable from "./pricelistSettings/StepTable"
	import ResultTable from "./pricelistSettings/ResultTable"
	import CurrencyRatio from "./pricelistSettings/CurrencyRatio"
	import Button from "../Button"
	import DiscountChart from "./pricelistSettings/DiscountChart"
	import { mapActions } from "vuex"
	import Tabs from "../Tabs"

	export default {
		data() {
			return {
				icons: {
					edit: { icon: require("../../assets/images/latest-version/edit.png") },
					cancel: { icon: require("../../assets/images/cancel-icon.png") }
				},
				paramsIsEdit: false,
				priceId: null,
				pricelists: null,
				languages: null,
				steps: null,
				units: null,
				sizes: null,
				industries: null,
				currencyRatioObj: null,
				isRefresh: false,
				isRefreshResultTable: false,
				languageModal: false,
				newLanguagesPairs: [],
				tabs: [ 'Basic Price', 'Steps / Units', 'Industries', 'Discount Chart', 'Overall Prices' ],
				selectedTab: 'Basic Price',
				isEdit: false

			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle"
			}),
			setTab({ index: i }) {
				this.selectedTab = this.tabs.find((item, index) => index === i)
			},
			async savePairs(dataArr) {
				try {
					const result = await this.$http.post('/pm-manage/add-new-langs', {
						langArr: dataArr,
						pricelistId: this.$route.params.id
					})
					this.newLanguagesPairs = result.data
					this.getAllData()
					this.refreshResultTable()
					this.alertToggle({
						message: "New Languages Pairs saved",
						isShow: true,
						type: "success"
					})
				} catch (err) {
					this.alertToggle({
						message: "Error on saving Languages Pairs.",
						isShow: true,
						type: "error"
					})
				}
				this.languageModal = false
			},
			closeModal() {
				this.languageModal = false
			},
			openModal() {
				this.languageModal = true
			},
			async getNewLanguagesPairs() {
				try {
					const result = await this.$http.get(`/pm-manage/pricelist-new-langs/${ this.$route.params.id }`)
					this.newLanguagesPairs = result.data
				} catch (err) {
					this.alertToggle({
						message: "Error on getting new Languages Pairs.",
						isShow: true,
						type: "error"
					})
				}
			},
			async getPricelists() {
				try {
					const result = await this.$http.get("/prices/pricelists")
					this.pricelists = result.body
				} catch (err) {
					this.alertToggle({
						message: "Error on getting pricelists.",
						isShow: true,
						type: "error"
					})
				}
			},
			async getDefaultLanguages() {
				try {
					const result = await this.$http.get("/api/languages")
					let formatLanguages = result.data
					this.languages = formatLanguages.map((item) => item.lang)
					this.languages.unshift("All")
				} catch (err) {
					this.alertToggle({
						message: "Cannot get Languages",
						isShow: true,
						type: "error"
					})
				}
			},
			goBack() {
				this.$router.go(-1)
			},
			async getDefaultSteps() {
				try {
					const result = await this.$http.get("/api/steps")
					let formatSteps = result.data
					this.steps = formatSteps.map((item) => item.title)
					this.steps.unshift("All")
				} catch (err) {
					this.alertToggle({
						message: "Cannot get Steps",
						isShow: true,
						type: "error"
					})
				}
			},
			async getDefaultUnits() {
				try {
					const result = await this.$http.get("/api/units")
					let formatUnits = result.data
					this.units = formatUnits.map((item) => item.type)
					this.units.unshift("All")
					this.sizes = [ ...new Set(formatUnits.map((item) => item.sizes).flat()) ]
					this.sizes.unshift("All")
				} catch (err) {
					this.alertToggle({
						message: "Cannot get Units",
						isShow: true,
						type: "error"
					})
				}
			},
			async getDefaultIndustries() {
				try {
					const result = await this.$http.get("/api/industries")
					let formatIndustries = result.data
					this.industries = formatIndustries.map((item) => item.name)
					this.industries.unshift("All")
				} catch (err) {
					this.alertToggle({
						message: "Cannot get Industries",
						isShow: true,
						type: "error"
					})
				}
			},
			refreshResultTable() {
				this.isRefreshResultTable = true
				setTimeout(() => {
					this.isRefreshResultTable = false
				}, 2000)
			},
			getAllData() {
				this.isRefresh = true
				setTimeout(() => {
					this.isRefresh = false
				}, 2000)
			},
			crudActions(actionType) {
				this.paramsIsEdit = actionType !== 'cancel'
				this.isEdit = this.paramsIsEdit
			}
		},
		computed: {
			discountChart() {
				const { discountChart } = this.pricelists.find((pricelist) => pricelist._id === this.priceId)
				return discountChart
			}
		},
		created() {
			this.priceId = this.$route.params.id
			this.getPricelists()
			this.getDefaultLanguages()
			this.getDefaultSteps()
			this.getDefaultUnits()
			this.getDefaultIndustries()
			this.getNewLanguagesPairs()
		},
		components: {
			Tabs,
			LangTable,
			IndustryTable,
			StepTable,
			ResultTable,
			CurrencyRatio,
			Button,
			DiscountChart,
			NewLanguageModal
		}
	}
</script>
<style lang="scss" scoped>
  .new__languages {
    position: absolute;
    z-index: 9999;
    transform: translate(120%, 100%);
  }

  .title {
    display: flex;
    justify-content: space-between;
    padding-bottom: 20px;
    align-items: flex-end;
    max-width: 1000px;

    &__title {
      display: flex;
      align-items: flex-end;
      font-size: 22px;
    }
  }

  .update-btn {
    min-width: 120px;
    padding: 0 24px 0 24px;
    height: 32px;
    color: white;
    font-size: 14px;
    border-radius: 4px;
    background-color: #d15f45;
    border: none;
    transition: .1s ease;
    outline: none;
    letter-spacing: 0.2px;
    margin-right: 20px;
    line-height: 32px;

    &:hover {
      cursor: pointer;
      box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
    }

    &:active {
      transform: scale(.98);
    }
  }

  .priceLayout {
    width: 1000px;
    box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    position: relative;

    &__editIcons {
      display: flex;
      position: absolute;
      right: 20px;
      top: 20px;
      gap: 7px;
      height: 20px;
      align-items: center;

      &-opacity1 {
        opacity: 1;
        cursor: pointer;
      }

      &-opacity05 {
        opacity: 0.4;
        cursor: default;
      }
    }

    &__allTabs {
      padding: 20px;
    }
  }

  .buttons {
    display: flex;
  }
</style>
