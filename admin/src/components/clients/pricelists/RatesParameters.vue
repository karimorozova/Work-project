<template lang="pug">
.rates
    .rates-item
        .rates-item__title Pricelist:
        .rates-item__input(v-if="currentClient.defaultPricelist") {{currentClient.defaultPricelist.name}}
    .rates-item
        .rates-item__title Currency:
        .rates-item__input {{currentClient.currency}}
    .rates-item
        .rates-item__title Min Price:
      .rates-item__input
            .ratio__input
              input(type="number" v-model="minPrice" v-on:keyup.enter="updateMinPrice" :value="minPrice" )
                span.ratio__input-symbol(v-html="getSymbol(currentClient.currency)")
    .rates-item
        .rates-item__title Ignore Min Price:
        .rates-item__input
            .checkbox
              input(type="checkbox" id="ignoreMinPrice" v-model="ignoreMinPrice" @change="setTest")
                label(for="ignoreMinPrice")
</template>
<script>
  import { mapGetters, mapActions } from 'vuex';
  import { alertToggle } from '../../../vuex/general/actions';

export default {
  data() {
    return {
      minPrice: null,
      ignoreMinPrice: false,
    };
  },
  methods: {
    ...mapActions(['storeClientProperty']),
    async updateMinPrice () {
      try {
        await this.$http.put('/clientsapi/set-min-price', {
          _id: this.currentClient._id,
          value: this.minPrice,
        });
      } catch (err) {
        this.alertToggle({
          message: 'Client\'s minimal price is not updated!',
          isShow: true,
          type: 'error',
        });
      }
      // this.storeClientProperty({ prop, value: e.target.value });
    },
    getSymbol (currency) {
      return currency == 'USD'
        ? '&#36;'
        : currency == 'EUR'
          ? '&euro;'
          : '&pound';
    },
    async setTest () {
      // this.storeClientProperty({
      //   prop: "ignoreMinPrice",
      //   value: event.target.checked
      // });
      try {
        await this.$http.put('/clientsapi/toggle-ignore-min-price', {
          _id: this.currentClient._id,
          value: this.ignoreMinPrice,
        });
      } catch (err) {
        this.alertToggle({
          message: 'Client\'s ignoreMinPrice is not updated!',
          isShow: true,
          type: 'error',
        });
      }
    }
  },
  mounted() {
    this.minPrice = this.currentClient.minPrice;
    this.ignoreMinPrice = this.currentClient.ignoreMinPrice;
  },
  computed: {
    ...mapGetters({
      currentClient: "getCurrentClient"
    })
  }
};
</script>
<style lang="scss" scoped>
.rates {
  display: flex;
  .rates-item {
    min-width: 100px;
    margin-right: 40px;
    display: flex;
    &__title {
      font-size: 18px;
    }
    &__input {
      margin-left: 10px;
      font-size: 18px;
      .ratio__input {
        margin-top: -3px;
        &-symbol {
          margin-left: 4px;
        }
      }
    }
  }
  #ignoreMinPrice {
    width: 0;
  }
  .checkbox {
    display: flex;
    height: 20px;
    margin-top: -3px;

    input[type="checkbox"] {
      opacity: 0;
      + {
        label {
          &::after {
            content: none;
          }
        }
      }
      &:checked {
        + {
          label {
            &::after {
              content: "";
            }
          }
        }
      }
    }
    label {
      position: relative;
      display: inline-block;
      &::before {
        position: absolute;
        content: "";
        display: inline-block;
        height: 16px;
        width: 16px;
        border: 1px solid;
        left: 0px;
        top: 3px;
      }
      &::after {
        position: absolute;
        content: "";
        display: inline-block;
        height: 5px;
        width: 9px;
        border-left: 2px solid;
        border-bottom: 2px solid;
        transform: rotate(-45deg);
        left: 4px;
        top: 7px;
      }
    }
  }
}
input {
  color: #67573e;
  height: 22px;
  border-radius: 5px;
  width: 60px;
  border: 1px solid #67573e;
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
</style>
