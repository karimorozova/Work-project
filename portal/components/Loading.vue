<template lang="pug">
  .loading
    transition(name="slide-fade")
      .alert-message(v-show="!!currentRequests")
        .myIcon.myIcon__loading
          i(class="fa-solid fa-spinner fa-spin-pulse" style="--fa-animation-duration: 0.5s;")
        .text Loading
</template>

<script>
import { mapGetters } from "vuex"

export default {
  computed: {
    ...mapGetters({
      currentRequests: "getRequestsCount"
    })
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors";

.alert-message {
  position: fixed;
  z-index: 90000;
  right: 50px;
  top: 60px;
  background: white;
  border-radius: 4px;
  box-shadow: $box-shadow;
  display: flex;
  padding: 10px 20px 10px 12px;
  align-items: center;
  gap: 12px;
}

.myIcon {
  background: $table-list;
  height: 25px;
  width: 25px;
  border-radius: 25px;
  display: flex;
  justify-content: center;
  align-items: center;

  &__loading {
    color: $dark-border;
    font-size: 16px !important;
  }
}

.slide-fade-enter-active {
  transition: all 0.2s ease;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

.text {
  letter-spacing: 0.2px;
}
</style>
