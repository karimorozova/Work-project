<template lang="pug">
.price 
    ResultFilter(
      :source="sourceResultFilter"
      :target="targetResultFilter"
      :step="stepResultFilter"
      :unit="unitResultFilter"
      :industry="industryResultFilter"
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
    )
        template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
            .price-title {{ field.label }}
            
        template(slot="sourceLang" slot-scope="{ row, index }")
            .price__data(v-if="currentActive !== index") {{ row.sourceLang }}
        template(slot="targetLang" slot-scope="{ row, index }")
            .price__data(v-if="currentActive !== index") {{ row.targetLang }}
        template(slot="step" slot-scope="{ row, index }")
            .price__data(v-if="currentActive !== index") {{ row.step }}
        template(slot="unit" slot-scope="{ row, index }")
            .price__data(v-if="currentActive !== index") {{ row.unit }}
        template(slot="industry" slot-scope="{ row, index }")
            .price__data(v-if="currentActive !== index") {{ row.industry }}

        template(slot="usd" slot-scope="{ row, index }")
            .price__data(v-if="currentActive !== index")
                span(id="usd") {{row.usd}}
                label(for="usd") &#36;
        template(slot="minUsd" slot-scope="{ row, index }")
            .price__data(v-if="currentActive !== index")
                span(id="minUsd") {{row.minUsd}}
                label(for="minUsd") &#36;

        template(slot="eur" slot-scope="{ row, index }")
            .price__data(v-if="currentActive !== index")
                span(id="eur") {{row.eur}}
                label(for="eur") &euro;
        template(slot="minEur" slot-scope="{ row, index }")
            .price__data(v-if="currentActive !== index")
                span(id="minEur") {{row.minEur}}
                label(for="minEur") &euro;

        template(slot="gbp" slot-scope="{ row, index }")
            .price__data(v-if="currentActive !== index")
                span(id="gbp") {{row.gbp}}
                label(for="gbp") &pound;
        template(slot="minGbp" slot-scope="{ row, index }")
            .price__data(v-if="currentActive !== index")
                span(id="minGbp") {{row.minGbp}}
                label(for="minGbp") &pound;                                                        
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
    }
  },
  data() {
    return {
      fields: [
        {
          label: "Source Language",
          headerKey: "headerLanguageSource",
          key: "sourceLang",
          width: "9%",
          padding: "0"
        },
        {
          label: "Target Language",
          headerKey: "headerLanguageTarget",
          key: "targetLang",
          width: "9%",
          padding: "0"
        },
        {
          label: "Step",
          headerKey: "headerStep",
          key: "step",
          width: "9%",
          padding: "0"
        },
        {
          label: "Unit",
          headerKey: "headerUnit",
          key: "unit",
          width: "9%",
          padding: "0"
        },
        {
          label: "Industry",
          headerKey: "headerIndustry",
          key: "industry",
          width: "10%",
          padding: "0"
        },
        {
          label: "Price (USD)",
          headerKey: "headerPriceUSD",
          key: "usd",
          width: "9%",
          padding: "0"
        },
        {
          label: "Min Price (USD)",
          headerKey: "headerMinPriceUSD",
          key: "minUsd",
          width: "9%",
          padding: "0"
        },
        {
          label: "Price (EUR)",
          headerKey: "headerPriceEUR",
          key: "eur",
          width: "9%",
          padding: "0"
        },
        {
          label: "Min Price (EUR)",
          headerKey: "headerMinPriceEUR",
          key: "minEur",
          width: "9%",
          padding: "0"
        },
        {
          label: "Price (GBP)",
          headerKey: "headerPriceGBP",
          key: "gbp",
          width: "9%",
          padding: "0"
        },
        {
          label: "Min Price (GBP)",
          headerKey: "headerMinPriceGBP",
          key: "minGbp",
          width: "9%",
          padding: "0"
        }
      ],

      dataArray: [
        {
          sourceLang: "Eng",
          targetLang: "Fr",
          step: "someStep",
          unit: "someUnit",
          industry: "someIndustry",
          usd: 10,
          minUsd: 20,
          eur: 10,
          minEur: 20,
          gbp: 10,
          minGbp: 20
        }
      ],
      sourceResultFilter: "",
      targetResultFilter: "",
      stepResultFilter: "",
      unitResultFilter: "",
      industryResultFilter: ""
    };
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle"
    }),
    setFilter({ option, prop }) {
      this[prop] = option;
    }
  },
  computed: {},
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
    height: 32px;
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