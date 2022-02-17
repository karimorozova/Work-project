<template lang="pug">
  .reset_request
    input(v-model="pass" type="password")
    input(v-model="passRepeat" type="password")
    Button(value="Reset" @clicked="sendRequest")
</template>

<script>
import Button from "./Button"

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
    async sendRequest() {
      await this.$http.post('/pass-reset', {pass: this.pass, passRepeat: this.passRepeat, token: this.$route.params.token})
    }
  }
}
</script>

<style scoped lang="scss">

</style>