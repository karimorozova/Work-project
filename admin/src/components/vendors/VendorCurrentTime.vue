<template lang="pug">
  .action
    .action__title Vendor's time:
    .time {{ time }}
</template>
<script>

import moment from "moment"

export default {
  name: 'VendorCurrentTime',
  props: [ 'timezone' ],
  data() {
    return {
      time: this.getTime(),
      interval: null
    }
  },
  methods: {
    getTime() {
      return moment(new Date().toLocaleString('en-US', { timeZone: this.timezone })).format('DD/MM/YYYY, HH:mm:ss')
    }
  },
  mounted() {
    this.interval = setInterval(() => {
      this.time = this.getTime()
    }, 1000)
  },
  beforeDestroy() {
    clearInterval(this.interval)
  }
}
</script>
<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.action {
  box-sizing: border-box;
  padding: 25px;
  box-shadow: $box-shadow;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 420px;
  width: 420px;
  border-radius: 2px;
  background: white;
  margin-left: 50px;
  margin-top: 25px;

  &__title {
    font-size: 16px;
    border-bottom: 1px solid $light-border;
    font-family: Myriad600;
    margin-bottom: 20px;
    width: 100%;
    padding-bottom: 8px;
  }
}
</style>
