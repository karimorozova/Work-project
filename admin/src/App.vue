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

/* Custom scroll-bar */
#app {
  ::-webkit-scrollbar {
    width: 16px;
    height: 16px;
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
    &:hover {
      background-color: rgba(103, 87, 62, 0.6);
      background-clip: content-box;
    }
  }
  ::-webkit-scrollbar-thumb:horizontal {
    background-color: rgba(103, 87, 62, 0.3);
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    background-clip: content-box;
    border-radius: 7px;
    &:hover {
      background-color: rgba(103, 87, 62, 0.6);
      background-clip: content-box;
    }
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
}
</style>
