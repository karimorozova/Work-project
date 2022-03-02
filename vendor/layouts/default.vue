<template>
  <div>
    <transition name="slide-fade">
      <AlertMessage v-if="isAlert" :text="alertMessage" :type="alertType"></AlertMessage>
    </transition>
    <nuxt/>
  </div>
</template>

<script>
import AlertMessage from "../components/general/AlertMessage"
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


<style lang="scss">
@import "../assets/scss/colors.scss";

body {
  color: $text;
  font-size: 14px;
  font-family: Roboto400;
  background-color: $body;
}

input::-webkit-input-placeholder {
  opacity: 0.5;
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
  font-family: 'Roboto300';
  font-style: normal;
  font-weight: normal;
  src: url('../assets/fonts/Roboto300.woff2') format('woff2');
}

@font-face {
  font-family: 'Roboto400';
  font-style: normal;
  font-weight: normal;
  src: url('../assets/fonts/Roboto400.woff2') format('woff2');
}

@font-face {
  font-family: 'Roboto600';
  font-style: normal;
  font-weight: normal;
  src: url('../assets/fonts/Roboto600.woff2') format('woff2');
}


@font-face {
  font-family: 'Roboto900';
  font-style: normal;
  font-weight: normal;
  src: url('../assets/fonts/Roboto900.woff2') format('woff2');
}
</style>
