<template lang="pug">
  .wrapper
    .header
      .header__left
        .header__title {{job.step.title}}
        .header__status(:style="{'background-color': getColorByStatus(job.status).background, 'color': getColorByStatus(job.status).color}") {{ job.status }}
        .header__extraStatus(v-if="job.status === 'Approved'" ) Waiting for customer confirmation...
      .header__right(v-if="job.status === 'In progress' && job.payablesUnit.type === 'CAT Wordcount'" )
        .refresh-icon(@click="updateProgress")
          i(class="fas fa-refresh")

    .cards
      .card
        .card__icon
          i(class="fa-solid fa-clock")
        .card__number {{customFormatter(job.deadline)}}
        .card__description Deadline
      .card
        .card__icon
          i(class="fa-solid fa-sitemap")
        .card__number {{ job.nativeFinance.Wordcount.payables ? job.nativeFinance.Wordcount.payables : job.nativeFinance.Quantity.payables }}
        .card__description {{ job.nativeFinance.Wordcount.payables ? 'Weighted Wordcount' : job.payablesUnit.type  }}
      .card
        .card__icon
          i(class="fa-solid fa-award")
        .card__number {{ job.nativeVendorRate }}
        .card__description Rate
      .card
        .card__icon
          i(class="fa-solid fa-hand-holding-dollar")
        .card__number
          span.currency(v-html="currencyIconDetected('EUR')" )
          span {{ +(job.nativeFinance.Price.payables).toFixed(2) }}
        .card__description Payable

    .descriptions
      .descriptions__Rside
        .block
          .block__key Start Date & Time:
          .block__val {{customFormatter(job.start)}}
        .block
          .block__key Source Language:
          .block__val {{job.fullSourceLanguage.lang}}
        .block
          .block__key Target Language:
          .block__val {{job.fullTargetLanguage.lang}}
        .block
          .block__key Industry:
          .block__val {{job.industry.name}}

      .descriptions__Lside
        .block
          .block__key Project ID:
          .block__val {{job.projectId}}
        .block
          .block__key Job ID:
          .block__val {{job.stepId}}
        .block
          .block__key Project Name:
          .block__val {{ job.projectName}}


</template>

<script>
import moment from "moment"
import currencyIconDetected from "../../../mixins/currencyIconDetected"

export default {
  name: "ProjectDescription",
  mixins: [ currencyIconDetected ],
  props: {
    job: {
      type: Object
    }
  },
  methods: {
    getColorByStatus(status) {
      switch (status) {
        case 'Ready to Start':
        case 'In progress':
        case 'Completed':
          return {
            color: '#4caf50',
            background: '#e8f5e9'
          }
        case 'Rejected':
        case 'Cancelled Halfway':
          return {
            color: '#f44336',
            background: '#ffebee'
          }
        default:
          return {
            color: '#546e7a',
            background: '#eceff1'
          }
      }
    },
    updateProgress() {
      this.$emit('updateProgress')
    },
    customFormatter(date) {
      return moment(date).format('MMM D, HH:mm')
    }
  }
}
</script>

<style lang="scss" scoped>
@import "assets/scss/colors";

.wrapper {
  width: 740px;
  background-color: white;
  padding: 25px;
  border-radius: 4px;
  background-color: white;
  box-shadow: $box-shadow;
  margin-bottom: 15px;
}

.header {
  padding-bottom: 25px;
  display: flex;
  justify-content: space-between;

  &__title {
    font-size: 18px;
    font-family: Roboto900;
    text-transform: uppercase;
    margin-top: 2px;
  }

  &__status {
    padding: 4px 15px 4px;
  }

  &__left {
    display: flex;
    gap: 20px;
    align-items: center;
  }
}

.cards {
  display: flex;
  justify-content: space-between;
}

.card {
  padding: 10px;
  border: 1px solid $light-border;
  border-radius: 4px;
  width: 168px;
  box-sizing: border-box;
  border-top-right-radius: 20px;
  border-bottom-left-radius: 20px;
  position: relative;
  cursor: default;

  &__number {
    font-size: 16px;
    font-family: Roboto600;
    padding-top: 10px;
    margin-bottom: 10px;
    z-index: 20;
    letter-spacing: -0.5px;
  }

  &__icon {
    right: 6px;
    top: 6px;
    position: absolute;
    font-size: 16px;
    color: #ccc;
    background-color: white;
    height: 32px;
    width: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 32px;
    background-color: $table-list;
  }
}


.descriptions {
  display: flex;
  gap: 30px;
  margin-top: 20px;

  &__Rside {
    width: 365px;
  }

  &__Lside {
    width: 365px;
  }
}

.block {
  display: flex;
  gap: 20px;
  height: 36px;
  align-items: center;

  &__key {
    color: $dark-border;
    width: 130px;
  }

  &__val {
    width: 225px;
  }
}

.currency {
  color: $dark-border;
  margin-right: 2px;
}

.refresh-icon {
  width: fit-content;
  background: #fff;
  border: 1px solid $border;
  border-radius: 4px;
  cursor: pointer;
  padding: 5px;
  transition: .2s ease-out;
  color: $dark-border;

  &:hover {
    color: $text !important;
  }
}
</style>