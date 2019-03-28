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

  ::-webkit-scrollbar {
    width: 14px;
    height: 14px;
  }
  ::-webkit-scrollbar-track {
    background: rgba(103, 87, 62, 0.1);
  }
  ::-webkit-scrollbar-thumb:vertical {
    background-color: rgba(103, 87, 62, 0.3);
    border-left: 3px solid transparent;
    border-right: 3px solid transparent;
    background-clip: content-box;
    border-radius: 6px;
    min-height: 25px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background-color: rgba(103, 87, 62, 0.6);
    background-clip: content-box;
  }

  ::-webkit-scrollbar-thumb:horizontal {
    background-color: rgba(103, 87, 62, 0.3);
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    background-clip: content-box;
    border-radius: 7px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background-color: rgba(103, 87, 62, 0.6);
    background-clip: content-box;
  }

  /* ------- If buttons needed ---------

  ::-webkit-scrollbar-button:vertical:decrement {
    border-bottom: 14px solid rgba(103, 87, 62, 0.3);
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-radius: 4px;
    &:hover {
      border-bottom: 14px solid rgba(103, 87, 62, 0.6);
    }
  }
  ::-webkit-scrollbar-button:vertical:increment {
    border-top: 14px solid rgba(103, 87, 62, 0.3);
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-radius: 4px;
    &:hover {
      border-top: 14px solid rgba(103, 87, 62, 0.6);
    }
  }
  ::-webkit-scrollbar-button:horizontal:decrement {
    border-right: 14px solid rgba(103, 87, 62, 0.3);
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-radius: 4px;
    &:hover {
      border-right: 14px solid rgba(103, 87, 62, 0.6);
    }
  }
  ::-webkit-scrollbar-button:horizontal:increment {
    border-left: 14px solid rgba(103, 87, 62, 0.3);
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-radius: 4px;
    &:hover {
      border-left: 14px solid rgba(103, 87, 62, 0.6);
    }
  }

  -----------  */

</style>
