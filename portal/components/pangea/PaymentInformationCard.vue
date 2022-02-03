<template lang="pug">
  .receipt
    .receipt__title RECEIPT
    .receipt__number
      span #
      span {{ cardInfo._id }}

    .header
      .row
        .row__title Payment Date
        .row__value {{ customFormatter(cardInfo.paymentDate) }}

    .body

      .row.margin
        .row__title Currency
        .row__value EUR

      .row
        .row__title Unpaid Amount
        .row__value € {{ cardInfo.unpaidAmount }}

    .footer
      .row
        .row__title.total-key TOTAL
        .row__value.total-key € {{ cardInfo.paidAmount }}

    .notes(v-if="cardInfo.notes") {{ cardInfo.notes }}

</template>

<script>
import moment from "moment"

export default {
  props: {
    cardInfo: {
      type: Object
    },
  },
  methods: {
    customFormatter(date) {
      return moment(date).format('MMM D, HH:mm')
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.receipt {
  padding: 25px;
  box-shadow: $box-shadow;
  border-radius: 4px;
  height: fit-content;
  margin: 25px 25px 0 0;
  background-color: white;
  width: 320px;
  box-sizing: border-box;

  &__title {
    text-align: center;
    font-family: 'Myriad900';
  }

  &__number {
    text-align: center;
    opacity: .4;
    margin-top: 4px;
    font-family: 'Myriad300';
  }
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;

  &:last-child {
    margin-bottom: 0px;
  }

  &__title {
    width: 150px;
  }

  &__value {
    width: 110px;
    display: flex;
    justify-content: end;
  }
}

.header {
  margin-top: 12px;
  margin-bottom: 12px;
  padding-top: 12px;
  padding-bottom: 12px;
  border-top: 1px dotted $border;
  border-bottom: 1px dotted $border;
}

.footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dotted $border;
}

.total {
  &-key {
    font-family: Myriad600;
  }
}

.notes {
  margin-top: 12px;
  text-align: center;
  border-top: 1px dotted $border;
  padding-top: 20px;
}

.margin {
  margin-bottom: 12px;
}
</style>