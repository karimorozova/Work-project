<template lang="pug">
  .reset_request
    input(v-model="pass" type="password")
    input(v-model="passRepeat" type="password")
    Button(value="Reset" @clicked="sendRequest")
</template>

<script>
import Button from "./Button"
import { mapActions } from "vuex"

export default {
  components: {
    Button
  },
  data() {
    return {
      pass: '',
      passRepeat: '',
    }
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
    }),
    async sendRequest() {
      try {
        const { status, message } = (await this.$http.post('/pass-reset', { pass: this.pass, passRepeat: this.passRepeat, token: this.$route.params.token })).data
        this.alertToggle({ message, isShow: true, type: status })
        await this.$router.push('/login')
      } catch (e) {
        this.alertToggle({ message: e.body.message, isShow: true, type: "error" })
      }
    }
  }
}
</script>

<style scoped lang="scss">

</style>