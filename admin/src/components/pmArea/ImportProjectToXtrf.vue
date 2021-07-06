<template lang="pug">
  .projectToXtrf
    .projectToXtrf__buttons
      Button(v-if="!project.isSendToXtrf && !project.xtrfLink" value="Send to XTRF" @clicked="sendTo" :isDisabled="isDisable")
      a(v-else target="_blank" :href="project.xtrfLink")
        Button(value="Go to project")
    .projectToXtrf__info
      span If a step has the same language pair, they will be grouped. Accounts payable and receivable will be added.
</template>

<script>
import Button from "../Button"
import axios from "axios"
import { mapActions } from "vuex"

export default {
  props: {
    project: {
      type: Object
    }
  },
  data() {
    return {
      isDisable: false
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
                message: "Send success" + notFoundVendorsMessage,
                isShow: true,
                type: "success"
              })
              this.$emit('refreshProject')
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


  &__info {
    margin-top: 10px;
    margin-bottom: 2px;
    letter-spacing: .6px;
    font-size: 11px;
    opacity: .5;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
}
</style>