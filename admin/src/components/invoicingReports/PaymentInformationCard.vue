<template lang="pug">
  .wrapper
    .paid PAID
    .card
      .card__price € 157
      .card__date 12-12-2345 12:12
      .row
        .row__title Payment method:
        .row__value Paypal
      .row
        .row__title Currency:
        .row__value EUR
      .row
        .row__title Unpaid amount:
        .row__value 0.00 €
      .row
        .row__title Expected payment date:
        .row__value 12-12-1212 12:21

      .card__notes Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ea incidunt nisi porro quaerat. Cupiditate dolores est illo ipsam minima minus molestiae quas quos reprehenderit saepe. Assumenda officia repellendus repudiandae suscipit?


</template>

<script>
	export default {}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors";

  .paid {
    position: absolute;
    right: 20px;
    color: $green;
    font-size: 14px;
    border: 2px solid;
    padding: 5px;
    border-radius: 4px;
    font-family: 'Myriad600';
    top: 27px;
  }

  .row {
    display: flex;
    margin: 10px 0;

    &__title {
      font-family: 'Myriad600';
      width: 170px;
    }

    &__value {
      width: 130px;
    }
  }

  .card {
    &__notes {
      padding-top: 15px;
      border-top: 1px solid $border;
      margin-top: 15px;
      color: $border-focus;
    }

    &__price {
      font-size: 32px;
      font-family: 'Myriad900';
    }

    &__date {
      font-size: 18px;
      margin-bottom: 20px;
      margin-top: 3px;
      font-family: 'Myriad300';
    }
  }

  .wrapper {
    width: 300px;
    margin-top: 30px;
    margin-right: 30px;
    background: white;
    border-radius: 4px;
    padding: 20px;
    position: relative;
    box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
  }
</style>