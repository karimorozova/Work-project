<template lang="pug">
  .login
    input(v-model='form.email' )
    input(v-model='form.password' type="password")
    Button(value="Login" @clicked="login")
</template>

<script>
import Button from './Button'

export default {
  name: "NewLogin",
  components: {
    Button
  },
  data() {
    return {
      form: {
        email: '',
        password: '',
      }
    }
  },
  methods: {
    async login() {
      try {
        await this.$http.post('/login', this.form)
        this.$router.push("/")
      } catch (err) {
        console.log(err)
      }
    }

  }
}
</script>

<style scoped lang="scss">

</style>