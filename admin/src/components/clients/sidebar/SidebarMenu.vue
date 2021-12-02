<template lang="pug">
  .sidebarMenu
    .sidebarMenu__mainIcon(@click="toggleMenu")
      span(v-if="!isShowMenu")
        i.fas.fa-bars
      span(v-if="isShowMenu")
        i.fas.fa-times

    transition(name='slide')
      .sidebarMenu__body(v-if="isShowMenu")
        .sidebarMenu__content

          .sidebarMenu__mainIcons
            .icon(@click="createTask")
              i.fas.fa-tasks
            .icon(@click="createNote")
              i.fas.fa-clipboard

          .sidebarMenu__allActivities
            .sidebarMenu__allActivities-button(@click="openAllActivities") View All Activities
              //Button( value="" :isFullWidth="true" :outline="true" color="#4ba5a5" )

          .sidebarMenu__generalInfo
            SideGeneral(:isSaveClicked="isSaveClicked")

          .sidebarMenu__listActivities
            OpenActivities(
              @openActivityDetails="openActivityDetails"
            )

        transition(name='slide-bottom')
          .sidebarMenu__activityDetails(v-if="isShowDetailsTask && !!taskData")
            ActivityDetailTask(
              @editActivityDetailsTask="editActivityDetailsTask"
              @closeActivityDetailsTask="closeActivityDetailsTask"
              :taskData="taskData"
            )

</template>

<script>
	import OpenActivities from "./OpenActivities"
	import ActivityDetailTask from './ActivityDetailTask'
	import SideGeneral from "../clientInfo/SideGeneral"
	import Button from "../../Button"

	export default {
		props: {
			isSaveClicked: { type: Boolean }
		},
		data() {
			return {
				isShowMenu: true,
				isShowDetailsTask: false,
				taskData: null

			}
		},
		methods: {
			openActivityDetails(data) {
				const { entity } = data
				switch (entity) {
					case 'task' :
						this.openActivityDetailsTask()
						this.taskData = data
				}
			},
			editActivityDetailsTask(taskData) {
				this.$emit('editActivityDetailsTask', taskData)
			},
			openActivityDetailsTask() {
				this.isShowDetailsTask = true
			},
			closeActivityDetailsTask() {
				this.isShowDetailsTask = false
				this.taskData = null
			},
			createTask() {
				this.$emit('createTask')
			},
			createNote() {
				this.$emit('createNote')
			},
			openAllActivities() {
				this.$emit('openAllActivities')
				this.closeActivityDetailsTask()
				this.isShowMenu = false
			},
			toggleMenu() {
				this.isShowMenu = !this.isShowMenu
			}
		},
		components: {
			Button,
			SideGeneral,
			OpenActivities,
			ActivityDetailTask
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors";

  .sidebarMenu {
    &__generalInfo {
      padding: 0 20px 20px 20px;
    }

    &__listActivities {
      padding: 0 20px 20px 20px;
    }

    &__allActivities {
      padding: 0 20px 20px 20px;

      &-button {
        font-size: 16px;
        letter-spacing: .2px;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }

      .allActivities {
        padding: 10px;
        display: flex;
        border: 1px solid $border;
        font-size: 18px;
        justify-content: center;
        font-family: 'Myriad600';
        transition: ease 0.2s;

        &__title {
          margin-left: 10px;
        }

        &:hover {
          cursor: pointer;
          background: rgba(153, 153, 153, .1);
        }
      }
    }

    &__mainIcons {
      display: flex;
      padding: 0 20px 20px 20px;
      align-items: center;
      gap: 15px;
    }

    &__activityDetails {
      position: absolute;
      bottom: 0;
      padding-bottom: 50px;
      width: 100%;
      z-index: 10;
      background: white;
    }

    &__content {
      position: relative;
      margin-top: 80px;
    }

    &__mainIcon {
      position: fixed;
      height: 40px;
      min-width: 40px;
      width: 40px;
      background: $table-list-hover;
      font-size: 19px;
      border-radius: 40px;
      color: $border-focus;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: .2s ease;
      right: 20px;
      z-index: 99999;
      cursor: pointer;
      top: 80px;

      &:hover {
        cursor: pointer;
        background: $light-green
      }
    }

    &__body {
      background: #fff;
      position: fixed;
      width: 430px;
      right: 0;
      top: 0;
      height: 100vh;
      z-index: 30;
      box-shadow: $box-shadow;
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

  i {
    font-size: 16px;
  }

  .icon {
    height: 40px;
    min-width: 40px;
    width: 40px;
    background: $table-list-hover;
    border-radius: 40px;
    color: $border-focus;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: ease 0.2s;

    &:hover {
      cursor: pointer;
      background: $light-green;
    }
  }
</style>
