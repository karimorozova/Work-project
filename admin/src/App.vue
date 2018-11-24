<template lang='pug'>
  #app
    //-  a.b-log-out(href='/logout') Log out
    //-  a.b-log-in(href='/login') Log in
    Loading(v-if="requestCounter > 0")
    transition(name="slide-fade")
      AlertMessage(v-if="isAlert" :text="alertMessage" :type="alertType")
    router-view
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Loading from "./components/Loading";
import AlertMessage from "./components/AlertMessage";
export default {
  name: 'app',
  computed: {
    ...mapGetters({
      isLoggedIn: 'isLoggedIn',
      isLoading: 'loading',
      isAlert: 'isAlert',
      alertType: 'alertType',
      alertMessage: 'alertMessage',
      requestCounter: 'getRequestCounter'
    })
  },
  components: {
    Loading,
    AlertMessage
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
.slide-fade-enter-active {
  transition: all .5s ease;
}
.slide-fade-leave-active {
  transition: all .5s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
