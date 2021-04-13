<template lang="pug">
  .openActivities
    .openActivities__title Open Activities
    .openActivities__content(v-if="listOfActivity.length > 0")
      .openActivities__list(v-for="item in listOfActivity")
        .openActivities__item(v-on:click="openActivityDetails(item)")
          .card
            .card__check(
              v-on:click.stop="completeActivity(item)"
              :class="{notActive: item.assignedTo._id.toString() !== user._id.toString() && !isAdmin}"
            )
              i.far.fa-check-circle
            .card__data
              .card__title {{ item.title }}
              .card__date
                span.due Due:
                span {{ item.deadline | formatDate}}
            .card__icon
              span(v-html="renderIcon(item.entity)")
    .openActivities__no-activity(v-else)
      span There are no activities now


</template>

<script>
	import { mapActions, mapGetters } from "vuex"

	export default {
		data() {
			return {}
		},
		methods: {
			...mapActions({
				setUpClientProp: 'setUpClientProp',
				alertToggle: "alertToggle"
			}),
			renderIcon(entity) {
				switch (entity) {
					case 'task' :
						return '<i class="fas fa-tasks"></i>'
				}
			},
			async completeActivity(item) {
				if (item.assignedTo._id.toString() !== this.user._id.toString() && !this.isAdmin) {
					return
				}
				item.status = 'Completed'
				try {
					const tasks = await this.$http.post(`/clientsapi/activity/task/${ item._id }`, { data: item })
					this.setUpClientProp({ key: "tasks", value: tasks.data })
					this.alertToggle({ message: "Task compleated", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Error on Completing task", isShow: true, type: "error" })
				}
			},
			openActivityDetails(item) {
				this.$emit('openActivityDetails', item)
			}
		},
		computed: {
			...mapGetters({
				currentClient: "getCurrentClient",
				user: "getUser"
			}),
			isAdmin(){
				return this.user.group.name === 'Administrators' || this.user.group.name === 'Developers'
      },
			listOfActivity() {
				let result = [
					...this.currentClient.tasks
					    .filter(item => item.status !== 'Completed')
							.map(item => {
								return { ...item, entity: 'task' }
							})
				]
				return result
			}
		}
	}
</script>

<style lang="scss" scoped>
  .notActive {
    cursor: default !important;
    color: rgba(0, 0, 0, .1) !important;
  }

  .openActivities {
    &__content {
      max-height: 45vh;
      overflow-y: auto;
    }

    &__title {
      font-size: 18px;
    }

    &__item {
      position: relative;
      width: 100%;
    }
  }

  .card {
    display: flex;
    align-items: center;
    padding: 10px;
    border: 1px solid #E8E8E8;
    margin-top: 5px;
    transition: ease 0.2s;

    &:hover {
      cursor: pointer;
      background: rgba(153, 153, 153, .1);
    }

    &__title {
      font-size: 16px;
      margin-bottom: 2px;
    }

    &__date {
      color: rgba(0, 0, 0, .6);
    }

    &__data {
      width: 80%;
    }

    &__check {
      height: 22px;
      font-size: 22px;
      width: 22px;
      margin-right: 10px;
      color: rgba(0, 0, 0, .6);
      cursor: pointer;
      transition: ease 0.2s;

      &:hover {
        cursor: pointer;
        color: #4ba5a5;
      }
    }

    &__icon {
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
    }
    &__no-activity {
      font-size: 14px;
      padding-top: 5px;
    }
  }

  .due {
    margin-right: 6px;
  }

</style>
