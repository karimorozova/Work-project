<template lang="pug">
  .projectToXtrf
    Button(value="Import to XTRF" @clicked="sendTo" :isDisabled="isDisable")
    span If a step has the same language pair, they will be grouped. Accounts payable and receivable will be added.
</template>

<script>
import Button from "../Button"
import axios from "axios"
import { mapActions } from "vuex"

export default {
  data() {
    return {
      isDisable: {
        type: Boolean,
        default: false
      }
    }
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle"
    }),
    sendTo() {
      this.isDisable = true
      axios
          .get('/projectsapi/createXtrfProjectWithFinance/' + this.$route.params.id)
          .then((res) => res.data)
          .then((data) => {
            if (data.isSuccess) {
              console.log(data)
              const notFoundVendorsMessage = data.noFoundVendors.length ? ", but we can not find some vendors: " + data.noFoundVendors.join(", ") : ''
                  this.alertToggle({
                message: "Import success" + notFoundVendorsMessage,
                isShow: true,
                type: "success"
              })
            } else {
              this.alertToggle({
                message: data.message,
                isShow: true,
                type: "error"
              })
            }
          })
          .finally(() => this.isDisable = false)
    }
  },
  components: { Button }
}
</script>

<style scoped lang="scss">
.projectToXtrf {
  box-sizing: border-box;
  padding: 20px;
  box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
  min-width: 400px;
  width: 400px;
  background: white;
  border-radius: 4px;
  margin-bottom: 40px;

  span {
    margin-top: 10px;
    margin-bottom: 2px;
    letter-spacing: .6px;
    font-size: 11px;
    opacity: .5;
  }
}
</style>