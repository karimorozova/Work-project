<template lang="pug">
  .wrapper
    .paid PAID
    .card
      .card__price € {{ cardInfo.paidAmount }}
      .card__date {{ customFormatter(cardInfo.paymentDate) }}
      .row
        .row__title Payment method:
        .row__value {{ cardInfo.paymentMethod }}
      .row
        .row__title Currency:
        .row__value EUR
      .row
        .row__title Unpaid amount:
        .row__value {{ cardInfo.unpaidAmount }} €
      .row
        .row__title Expected payment date:
        .row__value {{ customFormatter(paymentDetails.expectedPaymentDate) }}

      .card__notes(v-if="cardInfo.notes") {{ cardInfo.notes }}


</template>

<script>
	import moment from "moment"

	export default {
		props: {
			cardInfo: {
				type: Object
			},
			paymentDetails: {
				type: Object
			}
		},
		methods: {
			customFormatter(date) {
				return moment(date).format('DD-MM-YYYY, HH:mm')
			}
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors";

  .paid {
    position: absolute;
    right: 20px;
    color: $green-approve;
    font-size: 12px;
    border: 2px solid;
    padding: 5px;
    border-radius: 4px;
    font-family: 'Myriad600';
    top: 26.5px;
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
      font-size: 28px;
      font-family: 'Myriad900';
    }

    &__date {
      font-size: 17px;
      margin-bottom: 20px;
      margin-top: 2px;
      font-family: 'Myriad300';
    }
  }

  .wrapper {
    width: 300px;
    margin-top: 40px;
    margin-right: 40px;
    background: white;
    border-radius: 4px;
    padding: 20px;
    position: relative;
    box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
  }
</style>