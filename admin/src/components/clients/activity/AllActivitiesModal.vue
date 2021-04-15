<template lang="pug">
  .all-activities
    .all-activities__hz
      span(@click="openModalFullSize") open modal btn
    .all-activities__modal-actions(:class="{'with-scroll': (listOfActivity.length || 1) > rowCount }")
      //.all-activities__btn
        i.fas.fa-expand-all
      .all-activities__btn(@click="close")
        .all-activities__close &#215;
    .all-activities__wrapper(v-if="listOfActivity.length >= 1")
      .all-activities__content
        .all-activities__list(v-for="item in listOfActivity")
          TaskDetailsCard.mb-20(
            v-if="item.entity === 'task'"
            :taskData="item"
            @editActivityDetailsTask="editActivityDetailsTask"
            )
          NoteDetailsCard.mb-20(
            v-if="item.entity === 'note'"
            :data="item"
            @editActivityDetailsNote="editActivityDetailsNote"
            )
    .all-activities__no-activity(v-else)
      span There are no activities now
</template>

<script>
import {mapGetters} from "vuex";
import TaskDetailsCard from "./TaskDetailsCard";
import NoteDetailsCard from "./NoteDetailsCard";

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
	  openModalFullSize(){
		  this.$emit('openModalFullSize', true)
	  },
  },
	computed: {
		...mapGetters({
			currentClient: "getCurrentClient"
		}),
		listOfActivity() {
			const activities =  [
				...this.currentClient.tasks.map(item => {
					return { ...item, entity: 'task' }
				}),
				...this.currentClient.notes.map(item => {
					return { ...item, entity: 'note' }
				})
			]
			return activities.sort((a,b) => (new Date(b.dateTime) - new Date(a.dateTime)))
		}
	},
  components: {
    TaskDetailsCard,
    NoteDetailsCard,
  }
}
</script>

<style lang="scss" scoped>

  .all-activities {
    background-color: white;
    box-shadow: 0 2px 5px rgba(103,87,62,.3),0 2px 6px 2px rgba(103,87,62,.15);
    position: relative;

    &__wrapper {
      padding: 0 20px;
      max-height: 700px;
      overflow-x: auto;
    }

    &__modal-actions {
      font-size: 22px;
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
      font-size: 22px;
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

</style>
