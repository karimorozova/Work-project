<template lang="pug">
  .sidebarMenu
    .sidebarMenu__mainIcon(@click="toggleMenu")
      img(src="../../../assets/images/left-menu-close.png" v-if="!isShowMenu")
      img(src="../../../assets/images/left-menu-open.png" v-else)
    transition(name='slide')
      .sidebarMenu__body(v-if="isShowMenu")
        .sidebarMenu__content

          .sidebarMenu__mainIcons
            .icon(@click="createTask")
              i.fas.fa-tasks

          .sidebarMenu__allActivities
            .allActivities(@click="openAllActivities")
              i.fas.fa-chart-line
              span.allActivities__title View All Activities

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

	export default {
		props: {
			isSaveClicked: { type: Boolean }
		},
		data() {
			return {
				isShowMenu: false,
				isShowDetailsTask: false,
				taskData: null

			}
		},
		methods: {
			openActivityDetails(data) {
				console.log(data)
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
      openAllActivities() {
			  this.$emit('openAllActivities')
      },
			toggleMenu() {
				this.isShowMenu = !this.isShowMenu
			}
		},
		components: {
			SideGeneral,
			OpenActivities,
			ActivityDetailTask
		}
	}
</script>

<style lang="scss" scoped>
  .sidebarMenu {
    &__generalInfo {
      padding: 0 20px 20px 20px;
    }

    &__listActivities {
      padding: 0 20px 20px 20px;
    }

    &__allActivities {
      padding: 0 20px 20px 20px;

      .allActivities {
        padding: 10px;
        display: flex;
        border: 1px solid #e8e8e8;
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
      justify-content: space-between;
    }

    &__activityDetails {
      position: absolute;
      bottom: 0;
      padding-bottom: 35px;
      width: 100%;
      z-index: 10;
      background: white;
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
      width: 400px;
      right: 0;
      top: 5vh;
      height: 95vh;
      z-index: 9;
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

  i {
    font-size: 20px;
  }

  .icon {
    height: 40px;
    min-width: 40px;
    width: 40px;
    background: #daeded;
    font-size: 20px;
    border-radius: 40px;
    color: #4ba5a5;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: ease 0.2s;

    &:hover {
      cursor: pointer;
      background: #c8e4e4;
    }
  }
</style>
