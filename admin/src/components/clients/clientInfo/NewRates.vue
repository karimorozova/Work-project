<template lang="pug">
.rates-info
  .block-item
    .block-item__title Pricelist:
      span.require *
    .block-item__input(:class="{'rates-info_error-shadow': !client.defaultPricelist.length && isSaveClicked}")
      SelectSingle(
          placeholder="Select"
          :selectedOption="client.defaultPricelist.hasOwnProperty('name') ? client.defaultPricelist.name : client.defaultPricelist"
          :options="pricelistsData"
          @chooseOption="setPricelist"
      )
  .block-item
    .block-item__title Currency:
      span.require *
    .block-item__input(:class="{'rates-info_error-shadow': !client.currency.length && isSaveClicked}")
      SelectSingle(
          placeholder="Select"
          :selectedOption="client.currency"
          :options="['EUR','USD','GBP']"
          @chooseOption="setCurrency"
      )
</template>

<script>
import SelectSingle from "../../SelectSingle";
import { mapActions } from "vuex";

export default {
  props: {
    client: {
      type: Object
    },
    isSaveClicked: {
      type: Boolean
    }
  },
  data() {
    return {
      pricelists: []
    };
  },
  computed: {
    pricelistsData() {
      return this.pricelists.map(i => i.name);
    }
  },
  methods: {
    ...mapActions(["alertToggle"]),
    async getPricelists() {
      try {
        const result = await this.$http.get("/prices/pricelists");
        this.pricelists = result.body;
      } catch (err) {
        this.alertToggle({
          message: "Error on getting pricelists.",
          isShow: true,
          type: "error"
        });
      }
    },
    setPricelist({ option }) {
      this.client.defaultPricelist = this.pricelists.find(
        i => i.name == option
      );
    },
    setCurrency({ option }) {
      this.client.currency = option;
    }
  },
  created() {
    this.getPricelists();
  },
  components: {
    SelectSingle
  }
};
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";
.rates-info {
  display: flex;
  &_error-shadow {
    box-shadow: 0 0 5px $red;
    height: 31px;
  }
  .block-item {
    width: 350px;
    display: flex;
    &__title {
      width: 100px;
    }
    &__input {
      width: 190px;
      position: relative;
      margin-top: -6px;
    }
  }
  .require {
    font-size: 14px;
    color: red;
    margin-left: 2px;
  }
}
</style>
