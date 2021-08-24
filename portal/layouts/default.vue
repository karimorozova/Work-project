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
    font-family: Myriad400;
    font-size: 14px;
    color: #333;
    background-color: #fcfcfc;
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
    border-radius: 4px;
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
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background-color: rgba(103, 87, 62, 0.6);
    background-clip: content-box;
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
