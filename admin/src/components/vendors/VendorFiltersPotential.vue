<template lang="pug">
  .v-filters
    .v-filters__col.v-filters_width-21
      .v-filters__item.v-filters_margin-bottom-20
        label.v-filters__filter-title Name:
        input.v-filters__input-field(type="text" placeholder="Vendor Name" v-model="nameFilter" @keyup="filterByName")
    .v-filters__col.v-filters_width-22
      .v-filters__item
        label.v-filters__filter-title Industry:
        .v-filters__drop-menu
          VendorIndustrySelect(:isAllExist="isAllForIndustryExist" :selectedInd="industryFilter" @chosenInd="chosenIndustry")
    .v-filters__col.v-filters_width-25
      .v-filters__itemPicker
        label.v-filters__filter-title Date range:
        input.v-filters__input-field(type="text" readonly v-model="dateRange")
        .v-filters__bodyCalendar
          img.v-filters__calendar(src="../../assets/images/calendar.png" @click="openPickers")
          .v-filters__datepickers(v-if="isDatepickers")
            span.modal__close(@click.stop="closePickers") &#215;
            .v-filters__pickers
              Datepicker(
                :value="fromDate"
                @selected="(e) => setDate(e, 'fromDate')"
                calendarClass="vendor__calendar-custom"
                :inline="true"
                monday-first=true
              )
              Datepicker(
                :value="toDate"
                @selected="(e) => setDate(e, 'toDate')"
                calendarClass="vendor__calendar-custom"
                :inline="true"
                monday-first=true
              )
            .v-filters__button
              .v-filters__buttonItem
                Button(value="Set Range" @clicked="setDateRange")
              .v-filters__buttonItem
                Button(value="Clear Range" @clicked="clearDateRange")
    .v-filters__col.v-filters_width-22
      .v-filters__item.margin-top-4
        span Active Vendors:
        .checkbox
          input(type="checkbox" id="hasPending"  :checked="hasPending"  @click.stop="hasPendingClicked")
          label(for="hasPending")


</template>

<script>
	import VendorIndustrySelect from "./VendorIndustrySelect"
	import LanguagesSelect from "@/components/LanguagesSelect"
	import SelectSingle from "@/components/SelectSingle"
	import { mapActions } from "vuex"
	import Datepicker from "../Datepicker"
	import Button from "../Button"
  import moment from "moment"

	export default {
		props: {
			statusFilter: {
				type: String
			},
			industryFilter: {
				type: [ Object, String ]
			},
			sourceLangs: {
				type: Array,
				default: () => []
			},
			targetLangs: {
				type: Array,
				default: () => []
			},
			statuses: {
				type: Array,
				default: () => []
			},
			step: {
				type: String
			}
		},
		data() {
			return {
				nameFilter: "",
				isAllForIndustryExist: true,
				steps: [],
				typingTimer: "",
				doneTypingInterval: 800,
				isDatepickers: false,
				fromDate: new Date(),
				toDate: new Date(),
				dateRange: "",
        hasPending: true,
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle"
			}),
			clearDateRange(){
				this.dateRange = ''
				this.$emit('setDateRange', null)
				this.closePickers()
			},
      setDateRange(){
	      this.dateRange = moment(this.fromDate).format("DD-MM-YYYY") + " / " + moment(this.toDate).format("DD-MM-YYYY")
				this.$emit('setDateRange', {from: this.fromDate, to: this.toDate})
	      this.closePickers()
      },
			openPickers() {
				this.isDatepickers = true
			},
      closePickers(){
	      this.isDatepickers = false
      },
			setDate(e, prop) {
				this[prop] = new Date(e)
			},
			setStepFilter({ option }) {
				if (option === 'All') {
					return this.$emit("setStepFilter", { step: { title: 'All' } })
				}
				const step = this.steps.find(item => item.title === option)
				this.$emit("setStepFilter", { step })
			},
			addLang({ lang }, filter) {
				const prop = (filter === 'sourceFilter') ? 'sourceLangs' : 'targetLangs'
				if (lang.symbol === 'All') {
					return this.$emit('setAllLangs', { prop })
				}
				const position = this[prop].indexOf(lang.symbol)
				if (position !== -1) {
					this.$emit('removeLangFilter', { prop, position })
				} else {
					this.$emit('addLangFilter', { prop, lang })
				}
			},
			chosenIndustry({ industry }) {
				this.$emit("setIndustryFilter", { option: industry })
			},
			async getSteps() {
				try {
					const result = await this.$http.get("/api/steps")
					this.steps = result.body.filter(item => item.isActive)
				} catch (err) {
					this.alertToggle({ message: "Error on getting steps", isShow: true, type: "error" })
				}
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
      hasPendingClicked() {
			  this.hasPending = !this.hasPending
			  this.$emit('setIsPendingFilter', {hasPending: this.hasPending})
      }
		},
		computed: {
			stepNames() {
				let result = this.steps.map(item => item.title)
				result.unshift("All")
				return result
			}
		},
		components: {
			Button,
			VendorIndustrySelect,
			LanguagesSelect,
			SelectSingle,
			Datepicker
		},
		created() {
			this.getSteps()
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";

  .modal {
    &__close {
      position: absolute;
      top: 3px;
      right: 3px;
      font-size: 24px;
      cursor: pointer;
      height: 24px;
      width: 24px;
      justify-content: center;
      display: flex;
      align-items: center;
      font-family: Myriad900;
      opacity: .8;
      transition: .2s ease;

      &:hover {
        opacity: 1
      }
    }
  }

  .v-filters {
    width: 100%;
    display: flex;

    &__itemPicker{
      position: relative;
    }
    &__calendar{
      height: 22px;
      width: 22px;
      cursor: pointer;
    }

    &__datepickers {
      z-index: 50;
      background-color: $white;
      position: absolute;
      padding: 30px 0 20px 20px;
      box-sizing: border-box;
      box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
      left: -530px;
      cursor: default;
      margin-top: 10px;
    }

    &__pickers {
      display: flex;
      justify-content: space-between;
    }

    &__buttonItem{
      margin-left: 20px;
    }

    &__button {
      margin-top: 20px;
      text-align: right;
      margin-right: 20px;
      display: flex;
      justify-content: flex-end;
    }

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
    &__bodyCalendar{
      position: absolute;
      top: 4px;
      right: 4px;
      cursor: pointer;
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
    .checkbox {
      display: inline-flex;
      align-items: center;

      input[type="checkbox"] {
        opacity: 0;

        + {
          label {
            &::after {
              content: none;
            }
          }
        }

        &:checked {
          + {
            label {
              &::after {
                content: "";
              }
            }
          }
        }
      }

      label {
        position: relative;
        display: inline-block;
        padding-left: 22px;
        padding-top: 24px;

        &::before {
          position: absolute;
          content: "";
          display: inline-block;
          height: 16px;
          width: 16px;
          border: 1px solid;
          left: 0px;
          top: 3px;
        }

        &::after {
          position: absolute;
          content: "";
          display: inline-block;
          height: 5px;
          width: 9px;
          border-left: 2px solid;
          border-bottom: 2px solid;
          transform: rotate(-45deg);
          left: 4px;
          top: 7px;
        }
      }
    }
    .margin-top-4 {
      margin-top: 4px;
    }
  }

</style>
