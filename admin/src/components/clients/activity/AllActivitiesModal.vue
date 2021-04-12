<template lang="pug">
  .all-activities
    .all-activities__modal-actions(:class="{'with-scroll': (listOfActivity.length || 1) > rowCount }")
      //.all-activities__btn
        i.fas.fa-expand-all
      .all-activities__btn(@click="close")
        .all-activities__close &#215;
    .all-activities__wrapper
      .all-activities__content
        .all-activities__list(v-for="item in listOfActivity")
          TaskDetailsCard.mb-20(:taskData="item")
</template>

<script>
import {mapGetters} from "vuex";
import TaskDetailsCard from "./TaskDetailsCard";

export default {
  name: "AllActivitiesModal",
  props: {
    rowCount: Number
  },
  computed: {
    ...mapGetters({
      currentClient: "getCurrentClient"
    }),
    listOfActivity() {
      return [
        ...this.currentClient.tasks.map(item => {
          return { ...item, entity: 'task' }
        })
      ]
    }
  },
  methods: {
    close() {
      this.$emit('close')
    }

  },
  components: {
    TaskDetailsCard

  }
}
</script>

<style lang="scss" scoped>

  .all-activities {
    background-color: white;
    box-shadow: 0 2px 5px rgba(103,87,62,.3),0 2px 6px 2px rgba(103,87,62,.15);
    position: relative;

    &__wrapper {
      padding: 35px 20px 0 20px;
      max-height: 605px;
      overflow-x: auto;
    }

    &__modal-actions {
      display: flex;
      font-size: 22px;
      position: absolute;
      right: 7px;
      top: 2px;
    }

    &__btn {
      margin-left: 7px;
    }

    & .mb20 {
      margin-bottom: 20px;
    }

    &__close {
      height: 22px;
      width: 22px;
      justify-content: center;
      display: flex;
      align-items: center;
      opacity: 0.8;
      transition: ease 0.2s;
      cursor: pointer;

      &:hover {
        opacity: 1
      }
    }

  }
  .with-scroll {
    right: 17px !important;
    top: 7px !important;
  }

</style>
