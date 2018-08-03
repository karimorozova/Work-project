<template lang='pug'>
  #app
    //-  a.b-log-out(href='/logout') Log out
    //-  a.b-log-in(href='/login') Log in
    router-view
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  name: 'app',
  computed: {
    ...mapGetters({
      isLoggedIn: 'isLoggedIn'
    })
  }
}
</script>

<style lang='scss'>
body {
  font-family: MyriadPro;
  color: #67573E;
}
.b-log-in,
.b-log-out{
  padding: 6px;
  background-color: bisque;
  cursor: pointer;
}
</style>
