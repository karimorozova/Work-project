<template lang='pug'>
  #app
    Loading(v-if="!!requestCounter")
    transition(name="slide-fade")
      AlertMessage(v-if="isAlert" :text="alertMessage" :type="alertType")
    router-view
</template>

<script>
	import { mapGetters, mapActions } from "vuex"
	import Loading from "./components/Loading"
	import AlertMessage from "./components/AlertMessage"

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
  @import "assets/scss/colors";

  /** {*/
  /*  scrollbar-width: thin;*/
  /*}*/
  /* Works on Chrome, Edge, and Safari */
  /**::-webkit-scrollbar {*/
  /*  width: 8px;*/
  /*}*/

  /**::-webkit-scrollbar-track {*/
  /*  background: orange;*/
  /*}*/

  /**::-webkit-scrollbar-thumb {*/
  /*  background-color: blue;*/
  /*  border-radius: 20px;*/
  /*  border: 3px solid orange;*/
  /*}*/

  body {
    font-family: Myriad400;
    color: $text;
    font-size: 14px;
    background: $body;
    scrollbar-width: thin;
  }

  input::-webkit-input-placeholder {
    opacity: 0.5;
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

  .b-log-in,
  .b-log-out {
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
