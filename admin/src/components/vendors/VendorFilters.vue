<template lang="pug">
  .v-filters
    .v-filters__col
      .v-filters__item.v-filters_margin-bottom-20
        label.v-filters__filter-title Name:
        input.v-filters__input-field(type="text" placeholder="Vendor Name" v-model="nameFilter" @keyup="filterByName")

    .v-filters__col
      .v-filters__item
        label.v-filters__filter-title Source:
        .v-filters__drop-menu
          SelectSingle(
            :options="['All', ...allLanguages.map(item => item.lang)]",
            :hasSearch="true"
            placeholder="Source",
            :selectedOption="sourceLang",
            @chooseOption="setSourceFilter"
          )

    .v-filters__col
      .v-filters__item
        label.v-filters__filter-title Target:
        .v-filters__drop-menu
          SelectSingle(
            :options="['All', ...allLanguages.map(item => item.lang)]",
            :hasSearch="true"
            placeholder="Target",
            :selectedOption="targetLang",
            @chooseOption="setTargetFilter"
          )

    .v-filters__col
      .v-filters__item
        label.v-filters__filter-title Industry:
        .v-filters__drop-menu
          VendorIndustrySelect(:isAllExist="isAllForIndustryExist" :selectedInd="industryFilter" @chosenInd="chosenIndustry")


</template>

<script>
	import VendorIndustrySelect from "./VendorIndustrySelect"
	import LanguagesSelect from "@/components/LanguagesSelect"
	import SelectSingle from "@/components/SelectSingle"
	import { mapActions, mapGetters } from "vuex"

	export default {
		props: {
			statusFilter: {
				type: String
			},
			industryFilter: {
				type: [ Object, String ]
			},
			sourceLang: {
				type: String
			},
			targetLang: {
				type: String
			},
			statuses: {
				type: Array,
				default: () => []
			}
		},
		data() {
			return {
				nameFilter: "",
				isAllForIndustryExist: true,
				steps: [],
				typingTimer: "",
				doneTypingInterval: 800
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle"
			}),
			setSourceFilter({ option }) {
				this.$emit('setSourceFilter', option)
			},
			setTargetFilter({ option }) {
				this.$emit('setTargetFilter', option)
			},
			chosenIndustry({ industry }) {
				this.$emit("setIndustryFilter", { option: industry })
			},
			filterByName(e) {
				const { value } = e.target
				clearTimeout(this.typingTimer)
				this.typingTimer = setTimeout(doneTyping, this.doneTypingInterval)
				const vm = this

				function doneTyping() {
					vm.$emit("setNameFilter", { option: value })
				}
			}
		},
		computed: {
			...mapGetters({
				allLanguages: "getAllLanguages"
			})
		},
		components: {
			VendorIndustrySelect,
			LanguagesSelect,
			SelectSingle
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";

  .v-filters {
    width: 100%;
    display: flex;

    &__col {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      margin-right: 50px;
    }

    &__filter-title {
      margin-bottom: 0;
      margin-right: 10px;
      font-size: 14px;
    }

    &__item {
      width: 100%;
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;

      ::-webkit-input-placeholder {
        opacity: 0.5;
      }
    }

    &__input-field {
      box-sizing: border-box;
      color: $main-color;
      width: 191px;
      height: 30px !important;
      padding-left: 5px;
      border: 1px solid $main-color;
      border-radius: 5px;
      outline: none;
      font-size: 14px;
    }

    &__drop-menu {
      position: relative;
      width: 191px;
      height: 31px;
      box-sizing: border-box;
      z-index: 10;
    }

    &_margin-bottom-20 {
      margin-bottom: 20px;
    }
  }

</style>
