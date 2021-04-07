<template lang="pug">
  .openActivities
    .openActivities__title Open Activities
    .openActivities__list
      .openActivities__item(v-on:click="openActivityDetails")
        .card
          .card__check
            i.far.fa-check-circle
          .card__data
            .card__title Hello Js
            .card__date
              span.due Due:
              span 15-15-1515, 20:20
          .card__icon
            i.far.fa-calendar-alt

      .openActivities__item(v-on:click="openActivityDetails")
        .card
          .card__check
            i.far.fa-check-circle
          .card__data
            .card__title Hello Js2
            .card__date
              span.due Due:
              span 33-33-3333, 22:22
          .card__icon
            i.far.fa-calendar-alt


</template>

<script>
	export default {
		data() {
			return {}
		},
		methods: {
			openActivityDetails() {
				this.$emit('openActivityDetails')
			}
		}
	}
</script>

<style lang="scss" scoped>
  .openActivities {
    padding: 20px;

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
      height: 24px;
      font-size: 24px;
      width: 24px;
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
  }

  .due {
    margin-right: 6px;
  }
</style>