<template lang="pug">
  .all-activities
    .all-activities__modal-actions(:class="{'with-scroll': (listOfActivity.length || 1) > rowCount }")
      .all-activities__btn.open(@click="openModalFullSize")
        i.fas.fa-expand-arrows-alt
        span  Open as page
      .all-activities__btn(@click="close")
        p.all-activities__close &#215;
    .all-activities__wrapper(v-if="listOfActivity.length >= 1")
      .all-activities__content
        .all-activities__list(v-for="item in listOfActivity")
          TaskDetailsCard.mb-20(
            v-if="item.entity === 'task'"
            :taskData="item"
            @editActivityDetailsTask="editActivityDetailsTask"
          )
          NoteDetailsCard.mb-20(
            v-if="item.entity === 'activityNotes'"
            :data="item"
            @editActivityDetailsNote="editActivityDetailsNote"
          )
    .all-activities__no-activity(v-else)
      span There are no activities now
</template>

<script>
	import { mapGetters } from "vuex"
	import TaskDetailsCard from "./TaskDetailsCard"
	import NoteDetailsCard from "./NoteDetailsCard"

	export default {
		name: "AllActivitiesModal",
		props: {
			rowCount: Number
		},
		methods: {
			close() {
				this.$emit('close')
			},
			editActivityDetailsTask(taskData) {
				this.$emit('editActivityDetailsTask', taskData)
			},
			editActivityDetailsNote(noteData) {
				this.$emit('editActivityDetailsNote', noteData)
			},
			openModalFullSize() {
				this.$emit('openModalFullSize', true)
				this.close()
			}
		},
		computed: {
			...mapGetters({
				currentClient: "getCurrentClient"
			}),
			listOfActivity() {
				const activities = [
					...this.currentClient.tasks.map(item => {
						return { ...item, entity: 'task' }
					}),
					...this.currentClient.activityNotes.map(item => {
						return { ...item, entity: 'activityNotes' }
					})
				]
				return activities.sort((a, b) => (new Date(b.dateTime) - new Date(a.dateTime)))
			}
		},
		components: {
			TaskDetailsCard,
			NoteDetailsCard
		}
	}
</script>

<style lang="scss" scoped>

  .all-activities {
    background-color: white;
    box-shadow: 0 2px 5px rgba(103, 87, 62, .3), 0 2px 6px 2px rgba(103, 87, 62, .15);
    position: relative;

    &__wrapper {
      padding: 0 20px;
      max-height: 700px;
      overflow-x: auto;
    }

    &__modal-actions {
      display: flex;
      justify-content: space-between;
      padding: 15px 11px 12px 20px;
    }

    &__btn {
    }

    & .mb20 {
      margin-bottom: 20px;
    }

    &__close {
      font-size: 19px;
      cursor: pointer;
      font-family: Myriad900;
      opacity: .8;
      transition: .2s ease;
      line-height: 0.7;
      margin: 0;
      margin-top: -3px;

      &:hover {
        opacity: 1
      }
    }

    &__no-activity {
      padding: 0 20px 20px 20px;
      font-size: 16px;
    }
  }

  .open {
    opacity: 0.8;
    transition: .2s ease;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }
  }

  .fa-expand-arrows-alt {
    margin-right: 4px;
  }
</style>
