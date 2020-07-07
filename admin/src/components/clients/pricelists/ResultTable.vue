<template lang="pug">
  .price
    ResultFilter(
      :source="sourceFilter"
      :target="targetFilter"
      :step="stepFilter"
      :unit="unitFilter"
      :industry="industryFilter"
      :targets="languages"
      :sources="languages"
      :steps="steps"
      :units="units"
      :industries="industries"
      @setFilter="setFilter"
    )
    DataTable(
      :fields="fields"
      :tableData="dataArray"
      :bodyClass="['setting-table-body', {'tbody_visible-overflow': dataArray.length < 10}]"
      :tableheadRowClass="dataArray.length < 10 ? 'tbody_visible-overflow' : ''"
      bodyRowClass="settings-table-row"
      bodyCellClass="settings-table-cell"
      @bottomScrolled="bottomScrolled"
    )
      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .price-title {{ field.label }}

      template(slot="sourceLang" slot-scope="{ row, index }")
        .price__data(v-if="currentActive !== index") {{ row.sourceLanguage.lang }}
      template(slot="targetLang" slot-scope="{ row, index }")
        .price__data(v-if="currentActive !== index") {{ row.targetLanguage.lang }}
      template(slot="step" slot-scope="{ row, index }")
        .price__data(v-if="currentActive !== index") {{ row.step.title }}
      template(slot="unit" slot-scope="{ row, index }")
        .price__data(v-if="currentActive !== index") {{ row.unit.type }} / {{row.size}}
      template(slot="industry" slot-scope="{ row, index }")
        .price__data(v-if="currentActive !== index") {{ row.industry }}

      template(slot="eur" slot-scope="{ row, index }")
        .price__data(v-if="currentActive !== index")
          span(id="eur") {{row.eurPrice}}
          label(for="eur") &euro;
      template(slot="minEur" slot-scope="{ row, index }")
        .price__data(v-if="currentActive !== index")
          span(id="minEur") {{row.euroMinPrice}}
          label(for="minEur") &euro;

    .price__empty(v-if="!dataArray.length") Nothing found...
</template>
<script>
  import DataTable from "../../DataTable";
  import ResultFilter from "./ResultFilter";
  import { mapGetters, mapActions } from "vuex";

  export default {
    props: {
      languages: {
        type: Array
      },
      industries: {
        type: Array
      },
      units: {
        type: Array
      },
      steps: {
        type: Array
      },
      clientId: {
        type: String
      },
      isRefreshResultTable: {
        type: Boolean
      }
    },
    data() {
      return {
        fields: [
          {
            label: "Source Language",
            headerKey: "headerLanguageSource",
            key: "sourceLang",
            width: "15%",
            padding: "0"
          },
          {
            label: "Target Language",
            headerKey: "headerLanguageTarget",
            key: "targetLang",
            width: "15%",
            padding: "0"
          },
          {
            label: "Step",
            headerKey: "headerStep",
            key: "step",
            width: "15%",
            padding: "0"
          },
          {
            label: "Unit",
            headerKey: "headerUnit",
            key: "unit",
            width: "15%",
            padding: "0"
          },
          {
            label: "Industry",
            headerKey: "headerIndustry",
            key: "industry",
            width: "15%",
            padding: "0"
          },
          {
            label: "Price (EUR)",
            headerKey: "headerPriceEUR",
            key: "eur",
            width: "12.5%",
            padding: "0"
          },
          {
            label: "Min Price (EUR)",
            headerKey: "headerMinPriceEUR",
            key: "minEur",
            width: "12.5%",
            padding: "0"
          },
        ],

        dataArray: [],
        sourceFilter: "",
        targetFilter: "",
        stepFilter: "",
        unitFilter: "",
        industryFilter: "",
        isDataRemain: true
      };
    },
    methods: {
      ...mapActions({
        alertToggle: "alertToggle"
      }),
      setFilter({ option, prop }) {
        this[prop] = option;
        this.getPricelist(this.allFilters);
      },
      async bottomScrolled() {
        if (this.isDataRemain) {
          const result = await this.$http.post(
            "/clientsapi/rates/rate-combinations/" + this.clientId,
            {
              ...this.allFilters,
              countFilter: this.dataArray.length
            }
          );
          this.dataArray.push(...result.data);
          this.isDataRemain = result.body.length === 25;
        }
      },
      async getPricelist(filters, count = 0) {
        try {
          const result = await this.$http.post(
            "/clientsapi/rates/rate-combinations/" + this.clientId,
            {
              ...filters,
              countFilter: count
            }
          );
          this.dataArray = result.data;
        } catch (err) {
          this.alertToggle({
            message: "Error on getting Pricelist",
            isShow: true,
            type: "error"
          });
        }
      }
    },
    watch: {
      async isRefreshResultTable() {
        if (this.isRefreshResultTable) {
          this.getPricelist(this.allFilters);
        }
      }
    },
    created() {
      this.getPricelist(this.allFilters);
    },
    computed: {
      allFilters() {
        let result = {
          sourceFilter: this.sourceFilter,
          targetFilter: this.targetFilter,
          stepFilter: this.stepFilter,
          unitFilter: this.unitFilter,
          industryFilter: this.industryFilter
        };
        if (this.sourceFilter == "All") result.sourceFilter = "";
        if (this.targetFilter == "All") result.targetFilter = "";
        if (this.stepFilter == "All") result.stepFilter = "";
        if (this.unitFilter == "All") result.unitFilter = "";
        if (this.industryFilter == "All") result.industryFilter = "";

        return result;
      }
    },
    components: {
      DataTable,
      ResultFilter
    }
  };
</script>
<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";
  @import "../../../assets/styles/settingsTable";

  .price {
    @extend %setting-table;
    background-color: #fff;
    padding: 20px;
    box-shadow: none;

    input[disabled] {
      background: white;
    }

    input {
      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    }

    label {
      margin-left: 3px;
    }

    &__data,
    &__editing-data {
      min-height: 32px;
      padding: 0 5px;
      display: flex;
      align-items: center;
      box-sizing: border-box;
    }

    &__editing-data {
      box-shadow: inset 0 0 7px $brown-shadow;
    }

    &__data-input {
      box-sizing: border-box;
      width: 100%;
      border: none;
      outline: none;
      color: $main-color;
    }

    &__icons {
      padding-top: 3px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    &__icon {
      cursor: pointer;
      opacity: 0.5;
      margin-right: 8px;
    }

    &_opacity {
      opacity: 1;
    }
  }
</style>
