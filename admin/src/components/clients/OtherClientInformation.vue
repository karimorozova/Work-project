<template lang="pug">
  .other-information
    .block-item
      .block-item__label First Contact Date:
      .block-item__time
        .block-item__time-input
          Datepicker(
            :value="currentClientOverallData.otherInfo.hasOwnProperty('firstContactDate') ? currentClientOverallData.otherInfo.firstContactDate : firstContactDate"
            ref="firstContactDate"
            @selected="setDate"
            monday-first=true
            inputClass="datepicker-custom-project-info"
            calendarClass="calendar-custom"
            :format="customFormatter"
          )
      .icon(@click="openCalendar")
        i.far.fa-calendar-alt

    .block-item
      .block-item__label First Quote Date:
      .block-item__time {{ currentClient.otherInfo.firstQuoteDate || emptyField }}
    .block-item
      .block-item__label Last Quote Date:
      .block-item__time {{ currentClient.otherInfo.lastQuoteDate || emptyField }}
    .block-item
      .block-item__label First Project Date:
      .block-item__time {{ currentClient.otherInfo.firstProjectDate || emptyField }}
    .block-item
      .block-item__label Last Project Date:
      .block-item__time {{ currentClient.otherInfo.lastProjectDate || emptyField }}

</template>
<script>
	import Datepicker from "../DatepickerWithTime"
	import moment from "moment"
	import { mapGetters, mapActions } from "vuex"

	export default {
		data() {
			return {
				firstContactDate: '',
				emptyField: "Not yet assigned"
			}
		},
		methods: {
			...mapActions({
				storeClientPropertyOverallData: "storeClientPropertyOverallData"
			}),
			customFormatter(date) {
				return moment(date).format("DD-MM-YYYY")
			},
			openCalendar() {
				this.$refs.firstContactDate.showCalendar()
			},
			setDate(date) {
				this.firstContactDate = date
				let clientDates = {
					firstContactDate: date
				}
				this.storeClientPropertyOverallData({ prop: "otherInfo", value: clientDates })
			}
		},
		computed: {
			...mapGetters({
				currentClient: "getCurrentClient",
				currentClientOverallData: "currentClientOverallData"
			})
		},
		components: {
			Datepicker
		}
	}
</script>
<style lang="scss" scoped>
  .other-information {
    padding: 20px;

    .block-item:last-child {
      height: 30px;
    }

    .block-item:first-child {
      margin-top: 10px;
      position: relative;
    }

    .block-item {
      display: flex;
      height: 50px;

      &__last {
        height: 32px;
      }

      &__label {
        width: 130px;
      }

    }

    .icon {
      font-size: 18px;
      position: absolute;
      right: 5px;
      top: 6px;
      width: 20px;
      cursor: pointer;
    }
  }
</style>