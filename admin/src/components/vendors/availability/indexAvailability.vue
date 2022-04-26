<template lang="pug">
  .main
    .flex-wrapper
      .vendor-schedule
        .available-container
          .available-wrapper
            label.available-title Available work
            Toggler.available__toggler(@toggle="showAvailability" :is-active="isAvailableForWork")
          .timezone-wrapper
            label.timezone  Time Zone
            .drop
              SelectSingle(
                :hasSearch="true"
                :options="timezones"
                :selectedOption="timezone"
                placeholder="Timezone"
                @chooseOption="setTimezone"
              )
        .working-schedule
          .title Working hours
          ScheduleList(
            v-if="isAvailableForWork"
            :daysList="this.workSchedule"
            :timezone="timezone"
            @changeItemPosition="changeSchedulePosition"
            @add="addAvailableDay"
            @remove="removeWorkingDay"
            @update="updateWorkSchedule"

          )

        //.manager-schedule
        //  .schedule-wrapper(
        //    v-for="(item, index) in projectManagerTime "
        //  )
        //    .schedule-row
        //      span.time-text from
        //      .time-picker {{ item.from}}
        //      span.time-text to
        //      .time-picker {{ item.to}}
      //  .timezone-wrapper.timezone-wrapper__manager
      //    span.timezone  Time Zone
      //    .manager__timezone {{ userTimezone }}
      //  p.title Time zone Offset in hours:
      //    span.offset {{ timezoneOffsetInHours }} hour(s)




</template>

<script>
import {mapActions, mapGetters} from "vuex"
import SelectSingle from "../../SelectSingle"
import Toggler from "../../Toggler"
import ScheduleList from './sub-components/ScheduleList'
import moment from "moment-timezone"

export default {
  data() {
    return {
      workSchedule: [],
      timezone: '',
      isAvailableForWork: false,
      timezones: [],
    }
  },
  methods: {
    ...mapActions([
      "alertToggle"
    ]),
    // async createTimeString() {
    //   try {
    //     // const res = await this.$http.get(`/vendorsapi/vendor-availability/${this.$route.params.id}`)
    //     // const {data: {workSchedule, timezone}} = res;
    //     // this.timezoneOffsetInHours = new Date().getHours() - moment().tz(timezone).hour()
    //
    //
    //     //
    //     // workSchedule.forEach(({from, to}) => {
    //     //   const timeFrom = `${dateString} ${from}`
    //     //   const timeTo = `${dateString} ${to}`
    //     //   this.getActualWorkingHoursForProjectManager(timeFrom, timeTo, timezone)
    //     // })
    //
    //   } catch (err) {
    //     console.log(err)
    //   }
    //
    // },

    // getActualWorkingHoursForProjectManager(timeFrom, timeTo, timezone) {
    //   console.log(timeFrom, timeTo, timezone)
    //   const startString =
    //   const finishString = moment.tz(timeTo, timezone).tz(this.userTimezone).format();
    //
    //   // this.projectManagerTime.push({
    //   //   from: this.getTimeString(startString),
    //   //   to: this.getTimeString(finishString),
    //   // })
    //   // console.log(this.projectManagerTime)
    //
    // },

    changeSchedulePosition(sortedArr) {
      this.workSchedule = sortedArr
      this.saveAvailability('workSchedule')
    },
    showAvailability() {
      if (this.isAvailableForWork) {
        this.isAvailableForWork = false
        this.saveAvailability('isAvailableForWork')
        console.log(this.isAvailableForWork, "---------inside if")
        return
      }
      this.isAvailableForWork = true
      this.saveAvailability('isAvailableForWork')
      console.log(this.isAvailableForWork)
    },
    setTimezone({option}) {
      this.timezone = option
      this.saveAvailability('timezone')
    },

    addAvailableDay(item) {
      this.workSchedule.push(item)
    },
    removeWorkingDay(index) {
      console.log(index)
      this.workSchedule.splice(index, 1)
      this.saveAvailability('workSchedule')
    },
    updateWorkSchedule({value, prop, index}) {
      this.workSchedule[index][prop] = value
      this.saveAvailability('workSchedule')
      // console.log(this.currentVendor._id)
    },
    async getAvailability() {
      try {
        const res = await this.$http.get(`/vendorsapi/vendor-availability/${this.$route.params.id}`)
        this.setUpAvailabilityData(res)
        console.log(res)
      } catch (err) {
        console.log(err)
      }
    },
    async saveAvailability(prop) {
      try {
        const res = await this.$http.put(`/vendorsapi/vendor-availability-manage/${this.$route.params.id}`, {
          prop,
          value: this[prop]
        })
        this.setUpAvailabilityData(res)
        this.alertToggle({message: "Saved", isShow: true, type: "success"})
      } catch (e) {
        console.log(e)
        this.alertToggle({message: "Cannot save info", isShow: true, type: "error"})
      }
    },
    setUpAvailabilityData({data}) {
      console.log('retrieve start data', data)

      this.workSchedule = data.workSchedule
      this.timezone = data.timezone
      this.isAvailableForWork = data.isAvailableForWork
    }
  },
  computed: {
    ...mapGetters({
      currentVendor: "getCurrentVendorGeneralData",
      currentFullVendor: "getCurrentVendor"
    }),
    // projectManagerTime() {
    //   console.log(this.workSchedule)
    //   return this.workSchedule.map(({from, to}) => ({
    //     from: this.convertToActualTimezone(from),
    //     to: this.convertToActualTimezone(to)
    //   }))
    // },
    // timezoneOffsetInHours() {
    //   return new Date().getHours() - moment().tz(this.timezone).hour()
    // }
  },
  components: {
    SelectSingle,
    Toggler,
    ScheduleList
  },
  async created() {
    await this.getAvailability()
    this.timezones = moment.tz.names()
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.timezone {
  margin-right: 20px;
}

.available-container {
  display: flex;
  margin-bottom: 40px;
}

.title {
  font-family: Myriad600;
  margin-bottom: 20px;
}

.available-wrapper {
  display: flex;
  align-items: center;
  margin-right: 80px;
}

.available__toggler {
  margin-left: 30px;
}


.timezone-wrapper {
  display: flex;
  align-items: center;
}

//.timezone-wrapper__manager {
//  margin-bottom: 40px;
//}

.wrapperAcc {
  padding: 25px;
  border-radius: 4px;
  background-color: white;
  box-shadow: $box-shadow;
  width: fit-content;
  position: relative;
  height: fit-content;
}

.drop {
  position: relative;
  width: 220px;
  height: 32px;
  background-color: white;
}

//.vendor-schedule {
//  border-right: 1px solid #ededed;
//}

//.flex-wrapper {
//  display: flex;
//}
//
//.manager-schedule {
//  padding-left: 20px;
//}
//
//.manager__timezone {
//  box-sizing: border-box;
//  border: 1px solid $border;
//  border-radius: 2px;
//  width: 220px;
//  height: 32px;
//  background-color: white;
//  padding: 7px;
//}
//
//.schedule-row {
//  display: flex;
//  align-items: center;
//  margin-bottom: 20px;
//}

//.time-picker {
//  width: 110px;
//  height: 32px;
//  margin-right: 20px;
//  box-sizing: border-box;
//  border: 1px solid $border;
//  border-radius: 2px;
//  background-color: white;
//  padding: 7px;
//
//}
//.time-picker {
//  opacity: 0.45;
//}
//
//.time-text {
//  margin-right: 10px;
//}
//
//.offset {
//  display: inline-block;
//  margin-left: 30px;
//}
//.manager-time {
//  position: absolute;
//  top: 0;
//  right: 310px;
//  opacity: 0.45;
//  z-index: 1;
//}
//.time-from {
//  position: absolute;
//  top: 0;
//  left: 150px;
//}
//.time-to {
//  position: absolute;
//  top: 0;
//  right: 310px;
//}

</style>
