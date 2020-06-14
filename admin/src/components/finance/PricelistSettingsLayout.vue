<template lang="pug">
.priceLayout
    .priceLayout__currency
        CurrencyRatio
    .priceLayout__setting
        LangTable(
            :languages="languages"
        )
        StepTable(
            :steps="steps"
            :units="units"
        )
        IndustryTable
    .priceLayout__result
        ResultTable(
            :languages="languages"
            :steps="steps"
            :units="units"
            :industries="industries"
        )

</template>
<script>
import LangTable from "./pricelistSettings/LangTable";
import IndustryTable from "./pricelistSettings/IndustryTable";
import StepTable from "./pricelistSettings/StepTable";
import ResultTable from "./pricelistSettings/ResultTable";
import CurrencyRatio from "./pricelistSettings/CurrencyRatio";
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      languages: null,
      steps: null,
      units: null,
      industries: null,
    };
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle"
    }),
    async getDefaultLanguages() {
      try {
        const result = await this.$http.get("/api/languages");
        let formatLanguages = result.data;
        this.languages = formatLanguages.map(item => item.lang);
      } catch (err) {
        this.alertToggle({
          message: "Cannot get Languages",
          isShow: true,
          type: "error"
        });
      }
    },
    async getDefaultSteps() {
      try {
        const result = await this.$http.get("/api/steps");
        let formatSteps = result.data;
        this.steps = formatSteps.map(item => item.title);
      } catch (err) {
        this.alertToggle({
          message: "Cannot get Steps",
          isShow: true,
          type: "error"
        });
      }
    },
    async getDefaultUnits() {
      try {
        const result = await this.$http.get("/api/units");
        let formatUnits = result.data;
        this.units = formatUnits.map(item => item.type);
      } catch (err) {
        this.alertToggle({
          message: "Cannot get Units",
          isShow: true,
          type: "error"
        });
      }
    },
    async getDefaultIndustries() {
      try {
        const result = await this.$http.get("/api/industries");
        let formatIndustries = result.data;
        this.industries = formatIndustries.map(item => item.name);
      } catch (err) {
        this.alertToggle({
          message: "Cannot get Industries",
          isShow: true,
          type: "error"
        });
      }
    }
  },
  created() {
    this.getDefaultLanguages();
    this.getDefaultSteps();
    this.getDefaultUnits();
    this.getDefaultIndustries();
  },
  components: {
    LangTable,
    IndustryTable,
    StepTable,
    ResultTable,
    CurrencyRatio
  }
};
</script>
<style lang="scss" scoped>
.priceLayout {
  width: calc(100%);
  box-shadow: 0 0 10px #67573e;
  &__setting {
    display: flex;
  }
}
</style>