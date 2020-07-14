<template lang="pug">
  .price
    ResultFilter(
      :source="sourceFilter"
      :target="targetFilter"
      :step="stepFilter"
      :unit="unitFilter"
      :industry="industryFilter"
      :targets="['All'].concat(languages)"
      :sources="['All'].concat(languages)"
      :steps="['All'].concat(steps)"
      :units="['All'].concat(units)"
      :industries="['All'].concat(industries)"
      @setFilter="setFilter"
    )
    DataTable(
      :fields="fields"
      :tableData="dataArray"
      :bodyClass="['setting-table-body', {'tbody_visible-overflow': dataArray.length < 6}]"
      :tableheadRowClass="dataArray.length < 6 ? 'tbody_visible-overflow' : ''"
      bodyRowClass="settings-table-row"
      bodyCellClass="settings-table-cell"
      @bottomScrolled="bottomScrolled"
    )
      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .price-title {{ field.label }}

      template(slot="sourceLang" slot-scope="{ row, index }")
        .price__data(v-if="currentActive !== index") {{ row.sourceLanguage }}
        .price__data(v-else)
          input.price__data-input( type="text" v-model="currentSourceLanguage" disabled)
      
      template(slot="targetLang" slot-scope="{ row, index }")
        .price__data(v-if="currentActive !== index") {{ row.targetLanguage }}
        .price__data(v-else)
          input.price__data-input( type="text" v-model="currentTargetLanguage" disabled)
      
      template(slot="step" slot-scope="{ row, index }")
        .price__data(v-if="currentActive !== index") {{ row.step }}
        .price__data(v-else)
          input.price__data-input( type="text" v-model="currentStep" disabled)
      
      template(slot="unit" slot-scope="{ row, index }")
        .price__data(v-if="currentActive !== index") {{ row.unit }} / {{row.size}}
        .price__data(v-else)
          input.price__data-input( type="text" v-model="currentUnit" disabled)
      
      template(slot="industry" slot-scope="{ row, index }")
        .price__data(v-if="currentActive !== index") {{ row.industry }}
        .price__data(v-else)
          input.price__data-input( type="text" v-model="currentIndustry" disabled)

      template(slot="price" slot-scope="{ row, index }")
        .price__data(v-if="currentActive !== index")
          span(id="currencyType") {{row.price}}
          label(for="currencyType") ??&euro;
        .price__editing-data(v-else)
          input.price__data-input(type="number" v-model="currentPrice")
      template(slot="icons" slot-scope="{ row, index }")
        .price__icons
          img.price__icon(v-for="(icon, key) in manageIcons" :src="icon.icon" @click="makeAction(index, key)" :class="{'price_opacity': isActive(key, index)}")

    .price__empty(v-if="!dataArray.length") Nothing found...
</template>
<script>
import DataTable from "../../DataTable";
import ResultFilter from "./ResultFilter";
import crudIcons from "@/mixins/crudIcons";
import { mapGetters, mapActions } from "vuex";

export default {
  mixins: [crudIcons],
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
          label: "Price",
          headerKey: "headerPrice",
          key: "price",
          width: "10%",
          padding: "0"
        },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          width: "15%",
          padding: "0"
        }
      ],

      dataArray: [],
      currentSourceLanguage: "",
      currentTargetLanguage: "",
      currentStep: "",
      currentUnit: "",
      currentIndustry: "",
      currentPrice: "",

      sourceFilter: "",
      targetFilter: "",
      stepFilter: "",
      unitFilter: "",
      industryFilter: "",
      isDataRemain: true,
      currentActive: -1
    };
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle"
    }),
    async makeAction(index, key) {
      if (this.currentActive !== -1 && this.currentActive !== index) {
        return this.isEditing();
      }
      switch (key) {
        case "edit":
          this.setEditingData(index);
          break;
        case "cancel":
          this.manageCancelEdition();
          break;
        case "delete":
          alert("delete");
          break;
        default:
          await this.checkErrors(index);
      }
    },
    setEditingData(index) {
      this.currentActive = index;
      this.currentSourceLanguage = this.dataArray[index].sourceLanguage;
      this.currentTargetLanguage = this.dataArray[index].targetLanguage;
      this.currentStep = this.dataArray[index].step;
      this.currentUnit = this.dataArray[index].unit;
      this.currentIndustry = this.dataArray[index].industry;
      this.currentPrice = this.dataArray[index].price;
    },
    async checkErrors(index) {
      if (this.currentActive === -1) return;
      if (this.currentPrice == "") return;
      await this.manageSaveClick(index);
    },

    async manageSaveClick(index) {
      if (this.currentActive === -1) return;
      const id = this.dataArray[index]._id;

      try {
        const result = await this.$http.post(
          "/clientsapi/rates/change-pricelist/" + this.clientId,
          {
              _id: id,
              price: parseFloat(this.currentPrice).toFixed(3),
              altered: true,
              notification: 'Price disconnected from function'
          }
        );
        this.alertToggle({
          message: "Saved successfully",
          isShow: true,
          type: "success"
        });

        const updatedData = await this.$http.get(
          "/clientsapi/rates/" + this.clientId
        );
        this.dataArray[index] = updatedData.body.pricelistTable[index];

        this.setDefaults();
      } catch (err) {
        this.alertToggle({
          message: "Error on saving Result pricelist",
          isShow: true,
          type: "error"
        });
      }
    },
    manageCancelEdition() {
      this.setDefaults();
    },
    setDefaults() {
      this.currentActive = -1;
    },
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
    ...mapGetters({
      currentClient: "getCurrentClient"
    }),
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
    },
    manageIcons() {
      const { delete: del, ...result } = this.icons;
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
  padding: 20px 30px;
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
