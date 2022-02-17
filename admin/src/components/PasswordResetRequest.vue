<template lang="pug">
  .reset_request
    input(v-model="email")
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
      email: ''
    }
  },
  methods: {
    async sendRequest() {
      await this.$http.post('/pass-generate-mail', {email: this.email, portal: 'admin'})

    }
  }
}
</script>

<style scoped lang="scss">

</style>