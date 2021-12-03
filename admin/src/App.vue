<template lang='pug'>
  #app
    title {{ title }}
    transition(name="slide-fade")
      Loading(v-if="!!requestCounter")
      //Loading(v-if="true")
    transition(name="slide-fade")
      AlertMessage(v-if="isAlert" :text="alertMessage" :type="alertType")
      //AlertMessage(v-if="true" :text="'alertMessage ASD'" :type="'success'")
    router-view
</template>

<script>
import { mapGetters } from "vuex"
import Loading from "./components/Loading"
import AlertMessage from "./components/AlertMessage"

export default {
  name: 'app',
  data() {
    return {
      title: ''
    }
  },
  methods: {
    goFirstToUpperCase(str) {
      return str[0].toUpperCase() + str.slice(1)
    },
    setTitle(re) {
      if (re) this.title = `Pangea - Admin portal - ${ this.goFirstToUpperCase(re[1]) }`
      else this.title = 'Pangea - Admin portal'
    }
  },
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
  mounted() {
    const re = /pangea-(\w+)/.exec(this.$route.fullPath)
    this.setTitle(re)
  },
  watch: {
    $route(to) {
      const re = /pangea-(\w+)/.exec(to.fullPath)
      this.setTitle(re)
    }
  },
  components: {
    Loading,
    AlertMessage
  }
}
</script>

<style lang='scss'>
@import "assets/scss/colors";

body {
  font-family: Myriad400;
  color: $text;
  font-size: 14px;
  background: $body;
  scrollbar-width: thin;
}

input::-webkit-input-placeholder {
  opacity: 0.45;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}

input::-webkit-file-upload-button {
  cursor: pointer;
}

sup {
  margin-left: 4px;
  font-size: 11px;
  color: $dark-border;
}

.b-log-in,
.b-log-out {
  padding: 6px;
  background-color: bisque;
  cursor: pointer;
}


.slide-fade-enter-active {
  transition: all .2s ease;
}

.slide-fade-leave-active {
  transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.slide-fade-enter, .slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

@font-face {
  font-family: 'Myriad300';
  font-style: normal;
  font-weight: normal;
  src: url('./assets/fonts/MYRIADPRO-LIGHT.woff') format('woff');
}

@font-face {
  font-family: 'Myriad400';
  font-style: normal;
  font-weight: normal;
  src: url('./assets/fonts/MYRIADPRO-REGULAR.woff') format('woff');
}

@font-face {
  font-family: 'Myriad600';
  font-style: normal;
  font-weight: normal;
  src: url('./assets/fonts/MYRIADPRO-SEMIBOLD.woff') format('woff');
}

@font-face {
  font-family: 'Myriad900';
  font-style: normal;
  font-weight: normal;
  src: url('./assets/fonts/MYRIADPRO-BOLD.woff') format('woff');
}
</style>
