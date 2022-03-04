<template lang="pug">
  .content
    .row
      .row__title Test:
      .row__value
        CheckBox(:isChecked="extraOptions.isTest", @check="() => setTest(true)",  @uncheck="() => setTest(false)")
    .row
      .row__title Urgent:
      .row__data
        CheckBox(:isChecked="extraOptions.isUrgent", @check="() => setUrgentStatus(true)", @uncheck="() => setUrgentStatus(false)")
    .row
      .row__title Skip Progress:
      .row__data
        CheckBox(:isChecked="extraOptions.isSkipProgress", @check="() => setWorkflowStatus(true)", @uncheck="() => setWorkflowStatus(false)")

</template>

<script>
import CheckBox from "../../CheckBox"

export default {
  components: { CheckBox },
  props: [ 'extraOptions' ],
  methods: {
    setProjectValue(prop, value) {
      this.$emit('setSideOption', { prop, value })
    },
    setTest(bool) {
      this.setProjectValue('isTest', bool)
    },
    setUrgentStatus(bool) {
      this.setProjectValue('isUrgent', bool)
    },
    setWorkflowStatus(bool) {
      this.setProjectValue('isSkipProgress', bool)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.content {
  box-sizing: border-box;
  padding: 25px;
  box-shadow: $box-shadow;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 420px;
  width: 420px;
  border-radius: 2px;
  margin-left: 50px;
  background: white;
  height: fit-content;
}

.row {
  width: 100%;
  display: flex;
  height: 30px;
  align-items: center;
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0px;

  }

  &__title {
    width: 150px;
  }

  &__value {
    width: 220px;
    position: relative;
  }
}

</style>