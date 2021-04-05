<template lang="pug">
  .sidebarMenu
    .sidebarMenu__mainIcon(@click="toggleMenu") ICON
    transition(name='slide')
      .sidebarMenu__body(v-if="isShow")
        | askjdkajs

</template>

<script>
	export default {
		data() {
			return {
				isShow: false
			}
		},
		methods: {
			toggleMenu() {
				this.isShow = !this.isShow
			}
		}
	}
</script>

<style lang="scss" scoped>
  .sidebarMenu {
    &__mainIcon {
      position: fixed;
      right: 0;
      z-index: 99999;
    }

    &__body {
      background: #b1b1b1;
      position: fixed;
      width: 300px;
      right: 0;
      top: 6vh;
      height: 94vh;
      z-index: 9999;
    }
  }

  .slide-enter-active,
  .slide-leave-active {
    transition: 0.2s;
    transition-timing-function: ease-out;
  }

  .slide-enter,
  .slide-leave-to {
    transform: translateX(100%);
    transition: 0.15s;
    transition-timing-function: ease-in;
  }
</style>