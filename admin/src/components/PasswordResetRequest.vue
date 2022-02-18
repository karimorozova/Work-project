<template lang="pug">
  .reset_request
    input(v-model="email")
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
      email: ''
    }
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
    }),
    async sendRequest() {
      try {
        await this.$http.post('/pass-generate-mail', {email: this.email, portal: 'admin'})
        this.alertToggle({ message: 'Success', isShow: true, type: "success" })
        await this.$router.push('/login')
      }catch (e) {

        this.alertToggle({ message: 'Something went wrong', isShow: true, type: "error" })
        console.log(e)
      }

    }
  }
}
</script>

<style scoped lang="scss">

</style>