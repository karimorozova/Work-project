<template lang="pug">
  .main(v-if="vendor._id")
    ValidationErrors(
      v-if="areErrors"
      :errors="errors"
      :isAbsolute="true"
      @closeErrors="closeErrors"
    )
    .title Availability
    .available-container
      .available-wrapper
        label.available-title Available work
        Toggler.available__toggler(@toggle="showAvailability" :isActive="isAvailableForWork")
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
        @changeItemPosition="changeSchedulePosition"
        @add="addAvailableDay"
        @remove="removeWorkingDay"
        @update="updateWorkSchedule"
      )
    .vacancy-calendar
      .title Days-off


</template>

<script>
import ValidationErrors from "../../../../components/general/ValidationErrors"
import { mapActions, mapGetters } from "vuex"
import SelectSingle from "../../../../components/general/SelectSingle"
import Toggler from "../../../../components/general/Toggler"
import Add from "../../../../components/general/Add"
import getBgColor from "../../../../mixins/getBgColor"
import ScheduleList from "./sub-components/ScheduleList"
import moment from "moment-timezone"


export default {
  mixins: [ getBgColor ],
  data() {
    return {
      workSchedule: [],
      timezone: '',
      isAvailableForWork: false,
      currentTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,

      errors: [],
      areErrors: false,
      timezones: []
    }
  },
  methods: {
    ...mapActions([
      "alertToggle"
    ]),
    changeSchedulePosition(sortedArr) {
      this.workSchedule = sortedArr
      this.saveAvailability('workSchedule')
    },
    updateWorkSchedule({ value, prop, index }) {
      this.workSchedule[index][prop] = value
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
    addAvailableDay(item) {
      this.workSchedule.push(item)
    },
    removeWorkingDay(index) {
      this.workSchedule.splice(index, 1)
      this.saveAvailability('workSchedule')
    },
    setCurrentTimeZone() {
      if (this.vendor.timezone === '') {
        this.timezone = this.currentTimeZone
        this.saveAvailability('timezone')
      }
    },
    setTimezone({ option }) {
      this.timezone = option
      this.saveAvailability('timezone')
    },
    // async getTimezones() {
    //   try {
    //     const result = await this.$axios.get('/api/timezones')
    //     this.timezones = result.data.map(({ zone }) => zone)
    //
    //   } catch (err) {
    //     console.log(err)
    //   }
    // },
    async getAvailability() {
      try {
        const res = await this.$axios.get(`/vendor/vendor-availability/${ this.vendor._id }`)
        this.setUpAvailabilityData(res)
      } catch (err) {
        console.log(err)
      }
    },
    async saveAvailability(prop) {
      try {
        const res = await this.$axios.put(`/vendor/vendor-availability-manage/${ this.vendor._id }`, {
          prop,
          value: this[prop]
        })
        this.setUpAvailabilityData(res)
        this.alertToggle({ message: "Saved", isShow: true, type: "success" })
      } catch (e) {
        console.log(e)
        this.alertToggle({ message: "Cannot save info", isShow: true, type: "error" })
      }
    },
    setUpAvailabilityData({ data }) {
      console.log('retrieve start data', data)

      this.workSchedule = data.workSchedule
      this.timezone = data.timezone
      this.isAvailableForWork = data.isAvailableForWork
    },
    async checkErrors() {
      this.errors = []
      if (!this.vendor.workSchedule.day.trim()) this.errors.push("Please, choose the day.")
      if (!this.vendor.workSchedule.from.trim()) this.errors.push("Please, choose time to start.")
      if (!this.vendor.workSchedule.to.trim()) this.errors.push("Please, choose time to finish.")
      if (this.errors.length) {
        this.areErrors = true
        return
      }
      await this.saveAvailability()
    }
  },
  computed: {
    ...mapGetters({
      vendor: "getVendor"
    })
  },
  components: {
    ValidationErrors,
    SelectSingle,
    ScheduleList,
    Add,
    Toggler
  },
  async created() {
    await this.getAvailability()
    this.setCurrentTimeZone()
    this.timezones = moment.tz.names()
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors";

.timezone {
  margin-right: 20px;
}

.main {
  width: 1000px;
  font-family: Roboto400;
  padding: 25px;
  background-color: white;
  border-radius: 4px;
  margin-bottom: 60px;
  box-shadow: $box-shadow;
}

.available-container {
  display: flex;
  margin-bottom: 60px;
}

.title {
  font-family: Roboto600;
  font-size: 16px;
  margin-bottom: 20px;

}

.available-wrapper {
  display: flex;
  align-items: center;
}

.available__toggler {
  margin-left: 30px;
}


.available-wrapper {
  margin-right: 80px;
}

.timezone-wrapper {
  display: flex;
  align-items: center;
}

.drop {
  position: relative;
  width: 220px;
  height: 32px;
  background-color: white;
}
.working-schedule {
  margin-bottom: 60px;
}
.vacancy-calendar {
  border-top: 1px solid $light-border;
  padding-top: 60px;
}
</style>

