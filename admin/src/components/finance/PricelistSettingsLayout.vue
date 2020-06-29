<template lang="pug">
.layout
  .title
    .title__title(v-if="this.pricelists") {{this.pricelists.find(i => i._id == priceId).name}}
    .title__return
        Button(value="Back" @clicked="goBack")
  .priceLayout
      .priceLayout__currency
          CurrencyRatio(
            @refreshPage="getAllData"
            @refreshResultTable="refreshResultTable"
          )
      .priceLayout__setting
          LangTable(
              :priceId="priceId"
              :languages="languages"
              :isRefresh="isRefresh"
              @refreshResultTable="refreshResultTable"
          )
          StepTable(
              :priceId="priceId"
              :steps="steps"
              :units="units"
              :sizes="sizes"
              :isRefresh="isRefresh"
              @refreshResultTable="refreshResultTable"
          )
          IndustryTable(
              :priceId="priceId"
              @refreshResultTable="refreshResultTable"
          )
      .priceLayout__result
          ResultTable(
              :priceId="priceId"
              :languages="languages"
              :steps="steps"
              :units="units"
              :industries="industries"
              :isRefreshResultTable="isRefreshResultTable"
          )

</template>
<script>
import LangTable from "./pricelistSettings/LangTable";
import IndustryTable from "./pricelistSettings/IndustryTable";
import StepTable from "./pricelistSettings/StepTable";
import ResultTable from "./pricelistSettings/ResultTable";
import CurrencyRatio from "./pricelistSettings/CurrencyRatio";
import Button from "../Button";
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      priceId: null,
      pricelists: null,
      languages: null,
      steps: null,
      units: null,
      sizes: null,
      industries: null,
      currencyRatioObj: null,
      isRefresh: false,
      isRefreshResultTable: false,
    };
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle"
    }),
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
    async getDefaultLanguages() {
      try {
        const result = await this.$http.get("/api/languages");
        let formatLanguages = result.data;
        this.languages = formatLanguages.map(item => item.lang);
        this.languages.unshift("All");
      } catch (err) {
        this.alertToggle({
          message: "Cannot get Languages",
          isShow: true,
          type: "error"
        });
      }
    },
    goBack() {
      this.$router.go(-1);
    },
    async getDefaultSteps() {
      try {
        const result = await this.$http.get("/api/steps");
        let formatSteps = result.data;
        this.steps = formatSteps.map(item => item.title);
        this.steps.unshift("All");
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
        this.units.unshift("All");
        this.sizes = [...new Set(formatUnits.map(item => item.sizes).flat())];
        this.sizes.unshift("All");
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
        this.industries.unshift("All");
      } catch (err) {
        this.alertToggle({
          message: "Cannot get Industries",
          isShow: true,
          type: "error"
        });
      }
    },
    refreshResultTable(){
      this.isRefreshResultTable = true;
      setTimeout(() => {
        this.isRefreshResultTable = false;
      }, 2000);
    },
    getAllData(){
      this.isRefresh = true;
      setTimeout(() => {
        this.isRefresh = false;
      }, 2000);
    }
  },
  created() {
    this.priceId = this.$route.params.id;
    this.getPricelists();
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
    CurrencyRatio,
    Button
  }
};
</script>
<style lang="scss" scoped>
.title {
  display: flex;
  justify-content: space-between;
  padding-bottom: 20px;
  align-items: flex-end;

  &__title{
    display: flex;
    align-items: flex-end;
    font-size: 28px;
  }
}
.priceLayout {
  width: calc(100%);
  box-shadow: 0 0 10px #67573e;
  &__setting {
    display: flex;
  }
}
</style>