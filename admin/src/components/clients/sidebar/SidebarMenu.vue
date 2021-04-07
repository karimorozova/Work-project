<template lang="pug">
  .sidebarMenu
    .sidebarMenu__mainIcon(@click="toggleMenu")
      i.fas.fa-bars
    transition(name='slide')
      .sidebarMenu__body(v-if="isShowMenu")
        .sidebarMenu__content
          .sidebarMenu__mainIcons
            span(@click="createTask") Create Task
          .sidebarMenu__listActivities
            OpenActivities(
              @openActivityDetails="openActivityDetails"
            )
        transition(name='slide-bottom')
          .sidebarMenu__activityDetails(v-if="isShowDetailsTask")
            ActivityDetailTask

</template>

<script>
	import OpenActivities from "./OpenActivities"
	import ActivityDetailTask from './ActivityDetailTask'

	export default {
		data() {
			return {
				isShowMenu: false,
				isShowDetailsTask: false

			}
		},
		methods: {
			openActivityDetails() {
				this.isShowDetailsTask = true
			},
			createTask() {
				this.$emit('createTask')
			},
			toggleMenu() {
				this.isShowMenu = !this.isShowMenu
			}
		},
		components: {
			OpenActivities,
			ActivityDetailTask
		}
	}
</script>

<style lang="scss" scoped>
  i {
    font-size: 20px;
  }

  .sidebarMenu {
    &__mainIcons {
      padding: 20px;
    }

    &__activityDetails {
      position: absolute;
      bottom: 0;
      margin-bottom: 30px;
      width: 100%;
    }

    &__content {
      margin-top: 6vh;
      height: 88vh;
      position: relative;
    }

    &__mainIcon {
      position: fixed;
      right: 20px;
      z-index: 99999;
      cursor: pointer;
      top: 7vh;
    }

    &__body {
      background: #fff;
      position: fixed;
      width: 390px;
      right: 0;
      top: 5vh;
      height: 95vh;
      z-index: 9999;
      border-left: 2px solid #E8E8E8;
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

  .slide-bottom-enter-active,
  .slide-bottom-leave-active {
    transition: 0.2s;
    transition-timing-function: ease-out;
  }

  .slide-bottom-enter,
  .slide-bottom-leave-to {
    transform: translateY(100%);
    transition: 0.15s;
    transition-timing-function: ease-in;
  }
</style>