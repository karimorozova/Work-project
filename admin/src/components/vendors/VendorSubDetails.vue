<template lang="pug">
  .sub-information
    .sub-information__vendor(v-if="vendor._id" )
      .sub-information__vendor-title {{vendor.vendorId}}

    .sub-information__row
      .row__title Status:
      .row__data
        .drop
          SelectSingle(
            :options='[ "Active", "Inactive", "Potential" ]'
            :selectedOption="vendor.status"
            @chooseOption=" vendorStatus"
            placeholder="Option"
          )

    .sub-information__row
      .row__title Test:
      .row__data
        CheckBox(
          :isChecked="vendor.isTest"
          @check="setTest(true)"
          @uncheck="setTest(false)"
        )

    .sub-information__row(v-if="vendor.memoqUserName" )
      .row__title Memoq Username:
      .row__data {{ vendor.memoqUserName }}

</template>

<script>
import CheckBox from "../CheckBox"
import SelectSingle from "../SelectSingle"

export default {
  name: "VendorSubDetails",
  props: {
    vendor: {
      type: Object
    }
  },
  methods: {
    setVendorProp({ prop, value }) {
      this.$emit('setVendorProp', { prop, value })
    },
    setTest(bool) {
      this.setVendorProp({
        prop: 'isTest',
        value: bool
      })
    },
    vendorStatus({ option }) {
      this.setVendorProp({
        prop: 'status',
        value: option
      })
    }
  },
  components: { SelectSingle, CheckBox }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";


.sub-information {
  box-sizing: border-box;
  padding: 25px;
  box-shadow: $box-shadow;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 420px;
  width: 420px;
  background: white;
  border-radius: 4px;
  background: white;
  margin-left: 50px;
  height: fit-content;

  &__row {
    width: 100%;
    display: flex;
    height: 32px;
    align-items: center;
    margin-bottom: 10px;

    &:last-child {
      margin-bottom: 0px;

    }
  }

  .row {
    &__title {
      width: 150px;
    }

    &__data {
      width: 220px;
      position: relative;
    }

    &__dataFlex {
      width: 220px;
      position: relative;
      display: flex;
      gap: 20px;
      align-items: center;
    }
  }

  .drop {
    height: 32px;
    position: relative;
    width: 220px;
    background-color: white;
    border-radius: 4px;
  }

  &__vendor {
    margin-bottom: 20px;
    border-bottom: 1px solid $light-border;
    width: 100%;
    padding-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &-title {
      font-size: 18px;
      font-family: 'Myriad600';
    }
  }
}


</style>
