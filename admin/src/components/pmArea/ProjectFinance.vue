<template lang="pug">
  .project-finance(v-if="currentProject.tasks.length")
    .project-finance__header
      .project-finance__titleFinance Discounts & Charge

    .project-finance__details
      //.project-finance__empty
      //  span No information available...
      .project-finance__noEmpty
        .project-finance__content-settingBlock
          .minPrice-item__forIgnore
            .minPrice-item
              .minPrice-item__title Minimum Charge:
              .minPrice-item__input(v-if="!isProjectFinished")
                .ratio__input
                  input( type="number" ref="minPrice" :value="currentProject.minimumCharge.value" @change="(e) => updateMinPrice('value', e)")
                  span.symbol(v-html="returnIconCurrencyByStringCode(currentProject.customer.currency)")
              .minPrice-item__input(v-else)
                span {{ currentProject.minimumCharge.value }}
                span(style="color: #999; margin-left: 5px;" v-html="returnIconCurrencyByStringCode(currentProject.customer.currency)")

            .minPrice-item
              .minPrice-item__title Ignore:
              .minPrice-item__input(v-if="!isProjectFinished")
                CheckBox(:isChecked="currentProject.minimumCharge.toIgnore" @check="() => updateMinPrice('bool', true)" @uncheck="() => updateMinPrice('bool', false)")
              .minPrice-item__input(v-else)
                span {{ currentProject.minimumCharge.toIgnore ? 'Price is ignored' : '-' }}

          .discounts
            ProjectDiscounts(
              v-if="!currentProject.minimumCharge.isUsed"
              :paramsIsEdit="paramsIsEdit"
              :test="currentProject.discounts"
            )
</template>

<script>
import { mapGetters, mapActions } from "vuex"
import ProjectDiscounts from "../clients/pricelists/ProjectDiscounts"
import currencyIconDetected from "../../mixins/currencyIconDetected"
import CheckBox from "../CheckBox"

export default {
  mixins: [ currencyIconDetected ],
  props: {},
  data() {
    return {
      paramsIsEdit: false
    }
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
      addFinanceProperty: "addFinanceProperty",
      setCurrentProject: "setCurrentProject"
    }),
    async updateMinPrice(prop, bool) {
      try {
        const result = await this.$http.post('/pm-manage/update-minimum-charge', {
          _id: this.currentProject._id,
          value: (+this.$refs.minPrice.value).toFixed(2) || 0,
          toIgnore: prop === 'value' ? this.currentProject.minimumCharge.toIgnore : bool
        })
        this.setCurrentProject(result.data)
        this.alertToggle({ message: "Minimum Price saved!", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: 'Project minimum price is not updated!', isShow: true, type: 'error' })
      }
    },
    detectedHigherMinPrice() {
      if (this.currentProject.hasOwnProperty('minimumCharge') &&
          this.currentProject.minimumCharge.value > this.currentProject.finance.Price.receivables &&
          !this.currentProject.minimumCharge.toIgnore
      ) {
        return +this.currentProject.minimumCharge.value
      } else {
        return +this.currentProject.finance.Price.receivables
      }
    }
  },
  computed: {
    ...mapGetters({
      currentProject: "getCurrentProject"
    }),
    detectedFinalPrice() {
      const { minimumCharge, finance } = this.currentProject
      return minimumCharge.value > finance.Price.receivables && !minimumCharge.toIgnore ?
          +minimumCharge.value :
          parseFloat(finance.Price.receivables).toFixed(2)
    },
    getStartedReceivables() {
      if (this.currentProject) {
        return this.currentProject.steps.reduce((acc, curr) => acc + curr.defaultStepPrice, 0).toFixed(2)
      }
    },
    barsStatistic() {
      if (this.currentProject) {
        const { finance } = this.currentProject
        const { Price } = finance
        let payblesPercents
        let receivablesPercents
        let basePrice = this.detectedHigherMinPrice()

        if (basePrice >= Price.payables) {
          payblesPercents = Math.ceil((Price.payables / basePrice) * 100)
          receivablesPercents = basePrice === 0 ? '0' : '100'
        } else {
          receivablesPercents = Math.ceil((basePrice / Price.payables) * 100)
          payblesPercents = +Price.payables === 0 ? '0' : '100'
        }

        return {
          receivables: {
            width: `${ receivablesPercents }%`,
            price: parseFloat(basePrice).toFixed(2)
          },
          payables: {
            width: `${ payblesPercents }%`,
            price: parseFloat(Price.payables).toFixed(2)
          }
        }
      }
    },
    financeData() {
      const finance = { ...this.currentProject.finance }
      const { Price } = finance
      let basePrice = this.detectedHigherMinPrice()
      return {
        profit: (basePrice - Price.payables).toFixed(2),
        margin: ((1 - (Price.payables / basePrice)) * 100).toFixed(2)
      }
    },
    isProjectFinished() {
      const { status } = this.currentProject
      return status === 'Closed' || status === 'Cancelled Halfway' || status === 'Cancelled'
    }
  },
  components: {
    CheckBox,
    ProjectDiscounts
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.symbol {
  color: $dark-border;
  position: absolute;
  right: 10px;
  top: 9px;
}

.actionsButton {
  display: flex;

  &__icon {
    margin-left: 5px;
  }
}

.defaultIcon {
  cursor: pointer;
}

.opacity {
  opacity: .4;
  cursor: default;
}

.initialReceivables {
  display: flex;

  .internal-info {
    font-size: 12px;
    margin-left: 4px;
  }

  &__value {
    margin-left: 23px;
  }
}

.minPrice-item {
  display: flex;
  align-items: center;
  height: 44px;

  &__forIgnore {
    //margin-bottom: 10px;
  }

  &__input {
    position: relative;
  }

  &__title {
    width: 150px;
  }
}


.project-finance {
  box-sizing: border-box;
  width: 400px;
  margin-top: 25px;
  padding: 25px;
  box-shadow: $box-shadow;
  background: white;
  border-radius: 2px;

  &__titleFinance {
    font-size: 16px;
    font-family: Myriad600;
  }

  &__header {
    margin-bottom: 20px;
    border-bottom: 1px solid $light-border;
    width: 100%;
    padding-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__details {
    &-displayBlock {
      position: relative;
    }

    &-settingBlock {
      margin-bottom: 20px;
    }
  }

  &__total {
    padding-top: 20px;
    border-top: 1px solid $border;
    display: flex;
    font-family: Myriad900;
    margin-top: 10px;

    &-title {
      width: 60px;
    }
  }

  &__title {
    padding: 20px;
    font-size: 18px;
    display: flex;
    font-family: Myriad600;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
  }

  &__icon {
    transition: all 0.1s;
  }

  &_reverse {
    transform: rotate(180deg);
  }

  &__dashboard {
    display: flex;
    border: 1px solid $border;
    border-radius: 2px;
    align-items: center;
    margin-bottom: 20px;
  }

  &__dashboardItem {
    width: 33%;
    display: flex;
    justify-content: center;
    border-left: 1px solid $border;
    padding: 6px 3px;

    &:first-child {
      border-left: none;
    }

    &-title {
      min-width: 10%;
    }

    &-value {
      min-width: 10%;
      margin-left: 6px;

    }
  }
}

.bar {
  display: flex;
  height: 16px;
  align-items: center;

  &__amount {
    margin-left: 5px;
  }

  &__green {
    background: #4CA553;
    height: 8px;
  }

  &__red {
    background: #D15F46;
    height: 8px;
  }
}

.finance-info {
  position: relative;

  &__bars {
    margin-bottom: 20px;
  }
}

input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 2px;
  box-sizing: border-box;
  padding: 0 7px;
  outline: none;
  width: 220px;
  height: 32px;
  transition: .1s ease-out;

  &:focus {
    border: 1px solid $border-focus;
  }
}

input {
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}

input:focus {
  outline: none;
}

.additional-functions {
  margin-top: 10px;
}
</style>
