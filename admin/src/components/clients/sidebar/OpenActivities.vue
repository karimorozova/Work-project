<template lang="pug">
  .openActivities
    .openActivities__title Open Activities
    .openActivities__content(v-if="listOfActivity.length > 0")
      .openActivities__list(v-for="item in listOfActivity")
        .openActivities__item(v-on:click="openActivityDetails(item)")
          .card

            .card__icon
              span(v-html="renderIcon(item.entity)")

            .card__data
              .card__title {{ item.title }}
              .card__date
                span.due Due:
                span {{ item.dateTime | formatDate}}

            .card__check(v-on:click.stop="completeActivity(item)" :class="{notActive: item.assignedTo._id.toString() !== user._id.toString() && !isAdmin}")
              i.far.fa-check-circle


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
			isAdmin() {
				return this.user.group.name === 'Administrators' || this.user.group.name === 'Developers'
			},
			listOfActivity() {
				return [
					...this.currentClient.tasks
							.filter(item => item.status !== 'Completed')
							.map(item => {
								return { ...item, entity: 'task' }
							})
				]
			}
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors";

  .notActive {
    cursor: default !important;
    color: rgba(0, 0, 0, .1) !important;
  }

  .openActivities {
    &__content {
      max-height: 45vh;
      overflow-y: auto;
      padding: 10px;
      border-radius: 2px;
      border: 2px solid $light-border;
      box-sizing: border-box;
    }

    &__title {
      font-size: 16px;
      margin-bottom: 5px;
      letter-spacing: .2px;
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
    border: 1px solid $border;
    border-radius: 2px;
    margin-top: 0px;
    transition: .1s ease;
    margin-bottom: 10px;

    &:hover {
      cursor: pointer;
      background: $list-hover;
    }

    &__title {
      font-size: 14px;
      margin-bottom: 4px;
    }

    &__date {
      font-family: 'Myriad300';
      font-size: 13px;
    }

    &__data {
      width: 80%;
    }

    &__check {
      height: 22px;
      font-size: 22px;
      width: 22px;
      color: $dark-border;
      cursor: pointer;
      transition: ease 0.2s;
      cursor: pointer;

      &:hover {
        color: $text;
      }
    }

    &__icon {
      height: 40px;
      min-width: 40px;
      width: 40px;
      font-size: 19px;
      border-radius: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 15px;
      border: 1px solid $green;
      color: $green;
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
