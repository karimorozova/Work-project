<template lang="pug">
  .activityDetail
    .activityDetail__header
      .header
        .header__icon
          i.fas.fa-tasks
        .header__title Task
        .header__status Upcoming
        .header__crud
    .activityDetail__content
      .card
        .card__check
          i.far.fa-check-circle
        .card__data
          .card__title Hello Js
          .card__date
            span.due Due:
            span 15-15-1515, 20:20


</template>

<script>
	export default {}
</script>

<style lang="scss" scoped>

  .card {
    display: flex;
    align-items: center;
    padding: 15px 20px;

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

    &__title {
      font-size: 16px;
      margin-bottom: 2px;
    }

    &__date {
      color: rgba(0, 0, 0, .6);
    }
  }

  .activityDetail {
    &__header {
      background: #48A6A6;
      color: white;
      padding: 5px 20px;
    }
  }

  .header {
    display: flex;
    align-items: center;

    &__status {
      border: 1px solid white;
      padding: 5px;
      margin-left: 30px;
    }

    &__title {
      font-size: 18px;
      margin-left: 10px;
    }

    &__icon {
      height: 40px;
      min-width: 40px;
      width: 40px;
      background: white;
      font-size: 20px;
      border-radius: 40px;
      color: #4ba5a5;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
</style>