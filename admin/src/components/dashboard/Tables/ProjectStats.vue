<template lang="pug">
  .project-stats
    .card
      .card__title
        span TODAY
      .card__sum
        .dollar.valut
          span.currency(v-html="'&#36;'")
          span {{projectsStats.statsDaily.dollarSum}}
        .euro.valut
          span.currency(v-html="'&euro;'")
          span {{projectsStats.statsDaily.euroSum}}
      .card__total
        span.currency(v-html="'&euro;'")
        span {{projectsStats.statsDaily.totalSum}}

    .card
      .card__title
        span MONTH
      .card__sum
        .dollar.valut
          span.currency(v-html="'&#36;'")
          span {{projectsStats.statsMonth.dollarSum}}
        .euro.valut
          span.currency(v-html="'&euro;'")
          span {{projectsStats.statsMonth.euroSum}}
      .card__total
        span.currency(v-html="'&euro;'")
        span {{projectsStats.statsMonth.totalSum}}
</template>

<script>
export default {
  name: "ProjectStats",
  props: {
    projectsStats: {
      type: Object,
      required: true,
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";
.project-stats {
  display: flex;
  justify-content: space-between;
}
.card {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 35px;


  //width: 755px;
  padding: 25px;
  box-shadow: $box-shadow;
  box-sizing: border-box;
  background-color: white;
  border-radius: 2px;
  //position: relative;
  align-self: baseline;

  &__title {
    padding: 15px 20px;
    background: $table-list;
    border-radius: 2px;
    font-family: Roboto700;
  }

  &__total {
    font-size: 20px;
    width: 85px;
  }
  .dollar {
    margin-bottom: 5px;
  }
  .currency {
    margin-right: 7px;
    color: $dark-border;
  }
  .valut {
    width: 65px;
  }
}
</style>