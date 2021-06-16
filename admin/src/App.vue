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
  body {
    font-family: Myriad400;
    color: #66563d;
    font-size: 14px;
    background: #FCFCFC;
  }

  input:disabled,
  textarea:disabled {
    background-color: #eee !important;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type=number] {
    -moz-appearance: textfield;
  }


  ::-webkit-file-upload-button {
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

  /*::-webkit-scrollbar {*/
  /*  width: 12px;*/
  /*  height: 12px;*/
  /*}*/

  /*::-webkit-scrollbar-track {*/
  /*  background: rgba(103, 87, 62, 0.1);*/
  /*}*/

  /*::-webkit-scrollbar-thumb:vertical {*/
  /*  background-color: rgba(103, 87, 62, 0.3);*/
  /*  border-left: 2px solid transparent;*/
  /*  border-right: 2px solid transparent;*/
  /*  background-clip: content-box;*/
  /*  border-radius: 4px;*/
  /*  min-height: 25px;*/

  /*  &:hover {*/
  /*    background-color: #938676;*/
  /*    background-clip: content-box;*/
  /*  }*/
  /*}*/

  /*::-webkit-scrollbar-thumb:horizontal {*/
  /*  background-color: rgba(103, 87, 62, 0.3);*/
  /*  border-top: 2px solid transparent;*/
  /*  border-bottom: 2px solid transparent;*/
  /*  background-clip: content-box;*/
  /*  border-radius: 4px;*/

  /*  &:hover {*/
  /*    background-color: #938676;*/
  /*    background-clip: content-box;*/
  /*  }*/
  /*}*/

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
