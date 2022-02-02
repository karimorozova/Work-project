<template lang="pug">
  .wrapper
    .content
      .amount Amount:
      .input
        input(type="text" placeholder="Value" :value="value" @change="setValue" @keyup.13="setValue")
        span.currency &euro;


</template>

<script>
import { mapActions } from "vuex"

export default {
  name: "MinimumPaymentVendorAmount",
  data() {
    return {
      value: null
    }
  },
  methods: {
    ...mapActions([ 'alertToggle' ]),
    async setValue(e) {
      try {
        await this.$http.put(`/api-settings/vendor-payment-benchmark/${ e.target.value }`)
        this.alertToggle({ message: "Updated", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Error on setting Value", isShow: true, type: "error" })
      } finally {
        await this.getValue()
      }
    },
    async getValue() {
      try {
        this.value = (await this.$http.get('/api-settings/vendor-payment-benchmark')).data.value
      } catch (err) {
        this.alertToggle({ message: "Error on getting Value", isShow: true, type: "error" })
      }
    }
  },
  created() {
    this.getValue()
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.wrapper {
  width: fit-content;
  border-radius: 4px;
  margin: 50px;
  background-color: white;
  padding: 25px;
  box-shadow: $box-shadow;
}

.content {
  display: flex;
  align-items: center;
  gap: 20px;
}

input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 4px;
  box-sizing: border-box;
  padding: 0 7px;
  outline: none;
  height: 32px;
  transition: .1s ease-out;
  width: 220px;
  font-family: 'Myriad400';

  &:focus {
    border: 1px solid $border-focus;
  }
}

.currency {
  margin-left: 7px;
  color: $dark-border;
}

</style>