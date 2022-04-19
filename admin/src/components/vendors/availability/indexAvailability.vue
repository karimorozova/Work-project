<template lang="pug">
  .main
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
        @changeItemPosition="changeSchedulePosition"
        @add="addAvailableDay"
        @remove="removeWorkingDay"
        @update="updateWorkSchedule"
      )
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
      timezones: []
    }
  },
  methods: {
    ...mapActions([
      "alertToggle"
    ]),
    async createTimeString() {
      try {
        const res = await this.$http.get(`/vendorsapi/vendor-availability/${this.$route.params.id}`)
        const {data: {workSchedule, timezone}} = res;
        let timeFrom = '';
        let timeTo = '';
        workSchedule.forEach(({from, to}) => {
          timeFrom = "2013-11-18 " + from
          timeTo = "2013-11-18 " + to
        })
        // console.log(timeFrom)
        // console.log(timeTo)
        // console.log(timezone)
        const actualStartTime = moment.tz(timeFrom, timezone).format()
        // const actualFinishTime = moment.tz(timeTo, timezone).format()
        const projectTime = actualStartTime.format().tz('America/Los_Angeles').format()
        console.log(actualStartTime)
        console.log(projectTime);
        // console.log(actualFinishTime);


        // const {_d: day} = moment();
        // console.dir(day)
        // console.dir(day.getHours())
        // console.dir(day.getMinutes())
        // const str = Date()
        // console.log(str)
      } catch (err) {
        console.log(err)
      }

    },
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
    })
  },
  components: {
    SelectSingle,
    Toggler,
    ScheduleList
  },
  async created() {
    await this.getAvailability()
    this.timezones = moment.tz.names()
    await this.createTimeString()
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
</style>
