<template>

  <div>
    <transition name="slide-fade">
      <AlertMessage v-if="isAlert" :text="alertMessage" :type="alertType"></AlertMessage>
    </transition>
    <nuxt/>
  </div>
</template>

<script>
import AlertMessage from "../components/AlertMessage";
import { mapGetters } from "vuex";

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
  font-family: MyriadPro;
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
  font-family: MyriadPro;
  src: url("../assets/fonts/MyriadPro-Regular.otf");
}
@font-face {
  font-family: MyriadBold;
  src: url("../assets/fonts/MyriadPro-Bold.otf");
}

</style>
