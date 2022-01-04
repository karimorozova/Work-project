<template lang="pug">
  .v-filters
    .v-filters__row

      .v-filters__item
        label.v-filters__filter-title Name:
        input.v-filters__input-field(type="text" placeholder="Vendor Name" v-model="nameFilter" @keyup="filterByName")

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

      .v-filters__item
        label.v-filters__filter-title Industry:
        .v-filters__drop-menu
          SelectSingle(
            :hasSearch="true"
            placeholder="Select"
            :selectedOption="industryFilter.name"
            :options="['All', ...getAllIndustries.map(({name, _id}) => ({name, _id}))]"
            @chooseOption="setIndustries"
          )

      //.v-filters__itemButton
        Button(value="Add vendor" @clicked="addVendor" :class="['width-140']")


</template>

<script>
	import SelectSingle from "@/components/SelectSingle"
	import { mapActions, mapGetters } from "vuex"
	import Button from "../Button"
	import SelectMulti from "../SelectMulti"

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
			addVendor() {
				this.$router.push("/pangea-vendors/new-vendor")
			},
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
			},
			setIndustries({ option }) {
				this.$emit("setIndustryFilter", { option: option })
			}
		},
		computed: {
			...mapGetters({
				allLanguages: "getAllLanguages",
				getAllIndustries: "getAllIndustries"
			})
		},
		components: {
			SelectMulti,
			Button,
			SelectSingle
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";

  .v-filters {
    width: 100%;
    display: flex;

    &__row {
      display: flex;
      margin-bottom: 20px;
      height: 50px;
      align-items: flex-end;
    }

    &__filter-title {
      margin-bottom: 3px;
    }

    &__itemButton {
      position: relative;
      display: grid;
      align-items: end;
      width: 250px;
      justify-content: end;
    }

    &__item {
      position: relative;
      display: grid;
      align-items: end;
      width: 250px;

      ::-webkit-input-placeholder {
        opacity: 0.5;
      }
    }

    &__input-field {
      font-size: 14px;
      color: $text;
      border: 1px solid $border;
      border-radius: 4px;
      box-sizing: border-box;
      padding: 0 7px;
      outline: none;
      width: 220px;
      height: 32px;
      transition: .1s ease-out;

      &:focus {
        border: 1px solid $border-focus;
      }
    }

    &__drop-menu {
      position: relative;
      width: 220px;
      height: 32px;
      box-sizing: border-box;
      z-index: 15;
    }
  }

</style>
