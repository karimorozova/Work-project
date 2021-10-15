<template lang="pug">
  .all-activities
    .all-activities__actions
      .all-activities__action(@click="backToMainPage")
        i.fas.fa-arrow-left.icon
        span  Back to page
      .all-activities__action(@click="closeModalFullSize")
        i.fas.fa-expand-arrows-alt.icon
        span  Open as modal

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
		methods: {
			closeModalFullSize(){
				this.$emit('closeModalFullSize')
      },
      backToMainPage(){
	      this.$emit('backToMainPage')
      },
			editActivityDetailsTask(taskData) {
				this.$emit('editActivityDetailsTask', taskData)
			},
			editActivityDetailsNote(noteData) {
				this.$emit('editActivityDetailsNote', noteData)
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
    min-width: 1040px;

    &__actions {
      display: flex;
      padding: 5px 0 15px;
    }

    &__action {
      opacity: 0.8;
      transition: .2s ease;
      cursor: pointer;
      cursor: pointer;
      margin-right: 20px;

      &:hover {
        opacity: 1;
      }
    }

    &__wrapper {
      overflow-x: auto;
    }

    &__modal-actions {
      font-size: 21px;
      display: flex;
      justify-content: flex-end;
      margin: 4px 8px;
    }

    &__btn {
      margin-left: 7px;
    }

    & .mb20 {
      margin-bottom: 20px;
    }

    &__close {
      font-size: 21px;
      cursor: pointer;
      font-family: Myriad900;
      opacity: 0.8;
      transition: ease 0.2s;

      &:hover {
        opacity: 1
      }
    }

    &__no-activity {
      padding: 0 20px 20px 20px;
      font-size: 16px;
    }

  }

  .with-scroll {
    right: 17px !important;
    top: 7px !important;
  }

  .icon {
    margin-right: 4px;
  }


</style>
