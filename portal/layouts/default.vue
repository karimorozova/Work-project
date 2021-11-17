<template>

  <div>
    <transition name="slide-fade">
      <AlertMessage v-if="isAlert" :text="alertMessage" :type="alertType"></AlertMessage>
    </transition>
    <nuxt/>
  </div>
</template>

<script>
import AlertMessage from "../components/AlertMessage"
import { mapGetters } from "vuex"

export default {
  computed: {
    ...mapGetters({
      isAlert: "getIsAlert",
      alertMessage: "getAlertMessage",
      alertType: "getAlertType"
    })
  },
  components: {
    AlertMessage
  }
}
</script>


<style>
body {
  font-family: Myriad400;
  font-size: 14px;
  color: #333;
  background-color: #fbfbfb;
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

@font-face {
  font-family: 'Myriad300';
  font-style: normal;
  font-weight: normal;
  src: url('../assets/fonts/MYRIADPRO-LIGHT.woff') format('woff');
}

@font-face {
  font-family: 'Myriad400';
  font-style: normal;
  font-weight: normal;
  src: url('../assets/fonts/MYRIADPRO-REGULAR.woff') format('woff');
}

@font-face {
  font-family: 'Myriad600';
  font-style: normal;
  font-weight: normal;
  src: url('../assets/fonts/MYRIADPRO-SEMIBOLD.woff') format('woff');
}


@font-face {
  font-family: 'Myriad900';
  font-style: normal;
  font-weight: normal;
  src: url('../assets/fonts/MYRIADPRO-BOLD.woff') format('woff');
}
</style>
