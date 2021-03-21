<template lang="pug">
.price
    StepFilter(
      :step="stepFilter"
      :unit="unitFilter"
      :size="sizeFilter"
      :steps="steps"
      :units="units"
      :sizes="sizes"
      @setFilter="setFilter"
    )
    DataTable(
        :fields="fields"
        :tableData="dataArray"
        :errors="errors"
        :areErrors="areErrors"
        :isApproveModal="isDeleting"
        @closeErrors="closeErrors"
        @notApprove="setDefaults"
        @closeModal="setDefaults"
        :bodyClass="['setting-table-body', {'tbody_visible-overflow': dataArray.length < 3}]"
        :tableheadRowClass="dataArray.length < 3 ? 'tbody_visible-overflow' : ''"
        bodyRowClass="settings-table-row"
        bodyCellClass="settings-table-cell"
        @bottomScrolled="bottomScrolled"
    )
        template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
            .price-title {{ field.label }}

        template(slot="step" slot-scope="{ row, index }")
            .price__data(v-if="currentActive !== index") {{ row.step.title }}
            .price__data(v-else)
                input.price__data-input(type="text" v-model="currentStep" disabled)

        template(slot="unit" slot-scope="{ row, index }")
            .price__data(v-if="currentActive !== index") {{ row.unit.type }}
            .price__data(v-else)
                input.price__data-input(type="text" v-model="currentUnit" disabled)

        template(slot="size" slot-scope="{ row, index }")
            .price__data(v-if="currentActive !== index") {{ row.size }}
            .price__data(v-else)
                input.price__data-input(type="text" v-model="currentSize" disabled)

        template(slot="multiplier" slot-scope="{ row, index }")
            .price__data(v-if="currentActive !== index")
                span(id="multiplier") {{row.multiplier}}
                label(for="multiplier") &#37;
            .price__editing-data(v-else)
                input.price__data-input(type="number" v-model="currentMultiplier")

        //- template(slot="eur" slot-scope="{ row, index }")
        //-     .price__data(v-if="currentActive !== index")
        //-         span(id="eur") {{row.euroMinPrice}}
        //-         label(for="eur") &euro;
        //-     .price__editing-data(v-else)
        //-         input.price__data-input(type="number" :onchange="currentRatio" v-model="currentMinPriceEUR")

        //- template(slot="usd" slot-scope="{ row, index }")
        //-     .price__data(v-if="currentActive !== index")
        //-         span(id="usd") {{row.usdMinPrice}}
        //-         label(for="usd") &#36;
        //-     .price__data(v-else)
        //-         input.price__data-input(type="number" v-model="currentMinPriceUSD" disabled)

        //- template(slot="gbp" slot-scope="{ row, index }")
        //-     .price__data(v-if="currentActive !== index")
        //-         span(id="gbp") {{row.gbpMinPrice}}
        //-         label(for="gbp") &pound;
        //-     .price__data(v-else)
        //-         input.price__data-input(type="number" v-model="currentMinPriceGBP" disabled)

        template(slot="icons" slot-scope="{ row, index }")
            .price__icons
                img.price__icon(v-for="(icon, key) in manageIcons" :src="icon.icon" @click="makeAction(index, key)" :class="{'price_opacity': isActive(key, index)}")
    .price__empty(v-if="!dataArray.length") Nothing found...
</template>
<script>
import DataTable from "../../DataTable";
import crudIcons from "@/mixins/crudIcons";
import StepFilter from "./StepFilter";
import { mapGetters, mapActions } from "vuex";

export default {
  mixins: [crudIcons],
  props: {
    steps: {
      type: Array
    },
    units: {
      type: Array
    },
    sizes: {
      type: Array
    },
    priceId: {
      type: String
    },
    isRefresh: {
      type: Boolean
    }
  },
  data() {
    return {
      fields: [
        {
          label: "Step",
          headerKey: "headerStep",
          key: "step",
          width: "24%",
          padding: "0"
        },
        {
          label: "Unit",
          headerKey: "headerUnit",
          key: "unit",
          width: "24%",
          padding: "0"
        },
        {
          label: "Size",
          headerKey: "headerSize",
          key: "size",
          width: "14%",
          padding: "0"
        },
        {
          label: "Multiplier (%)",
          headerKey: "headerMultiplier",
          key: "multiplier",
          width: "18%",
          padding: "0"
        },
        // {
        //   label: "Min price (EUR)",
        //   headerKey: "headerMinPriceEUR",
        //   key: "eur",
        //   width: "12.5%",
        //   padding: "0"
        // },
        // {
        //   label: "Min price (USD)",
        //   headerKey: "headerMinPriceUSD",
        //   key: "usd",
        //   width: "12.5%",
        //   padding: "0"
        // },
        // {
        //   label: "Min price (GBP)",
        //   headerKey: "headerMinPriceGBP",
        //   key: "gbp",
        //   width: "12.5%",
        //   padding: "0"
        // },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          width: "20%",
          padding: "0"
        }
      ],
      dataArray: [],
      currentStep: "",
      currentUnit: "",
      currentStepObj: "",
      currentUnitObj: "",
      currentSize: "",
      currentMultiplier: "",
      currentMinPriceUSD: "",
      currentMinPriceEUR: "",
      currentMinPriceGBP: "",
      currency: {},

      stepFilter: "",
      unitFilter: "",
      sizeFilter: "",

      areErrors: false,
      errors: [],
      isDeleting: false,
      deleteIndex: -1,
      currentActive: -1,
      isDataRemain: true
    };
  },
  created() {
    this.getCurrency();
    this.getSteps(this.allFilters);
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
    async bottomScrolled() {
      if (this.isDataRemain) {
        const result = await this.$http.post(
          "/pricelists/step-multipliers/" + this.priceId,
          {
            ...this.allFilters,
            countFilter: this.dataArray.length
          }
        );
        this.dataArray.push(...result.data);
        this.isDataRemain = result.body.length === 25;
      }
    },
    setEditingData(index) {
      this.currentActive = index;
      this.currentStepObj = this.dataArray[index].step;
      this.currentUnitObj = this.dataArray[index].unit;
      this.currentStep = this.dataArray[index].step.title;
      this.currentUnit = this.dataArray[index].unit.type;
      this.currentSize = this.dataArray[index].size;
      this.currentMultiplier = this.dataArray[index].multiplier;
      this.currentMinPriceUSD = this.dataArray[index].usdMinPrice;
      this.currentMinPriceEUR = this.dataArray[index].euroMinPrice;
      this.currentMinPriceGBP = this.dataArray[index].gbpMinPrice;
    },
    manageCancelEdition() {
      this.setDefaults();
      this.isDeleting = false;
    },
    setDefaults() {
      this.currentActive = -1;
      this.isDeleting = false;
      this.currentTest = "";
    },
    async checkErrors(index) {
      if (this.currentActive === -1) return;
      this.errors = [];
      if (this.currentMultiplier == "") return;
      if (Math.sign(this.currentMultiplier) == -1) return;
      if (this.currentMinPriceUSD == "") return;
      if (this.currentMinPriceEUR == "") return;
      if (this.currentMinPriceGBP == "") return;
      if (this.errors.length) {
        this.areErrors = true;
        return;
      }
      await this.manageSaveClick(index);
    },
    async getSteps(filters, count = 0) {
      try {
        const result = await this.$http.post(
          "/pricelists/step-multipliers/" + this.priceId,
          {
            ...filters,
            countFilter: count
          }
        );
        this.dataArray = result.data;
      } catch (err) {
        this.alertToggle({
          message: "Error on getting Steps",
          isShow: true,
          type: "error"
        });
      }
    },
    refreshResultTable(){
      this.$emit('refreshResultTable')
    },
    async manageSaveClick(index) {
      if (this.currentActive === -1) return;
      const id = this.dataArray[index]._id;
      try {
        const result = await this.$http.post(
          "/pricelists/step-multipliers-update/" + this.priceId,
          {
            stepMultiplier: {
              _id: id,
              step: this.currentStepObj,
              unit: this.currentUnitObj,
              size: this.currentSize,
              multiplier: parseFloat(this.currentMultiplier).toFixed(0),
              usdMinPrice: this.currentMinPriceUSD,
              euroMinPrice: parseFloat(this.currentMinPriceEUR).toFixed(4),
              gbpMinPrice: this.currentMinPriceGBP
            }
          }
        );
        this.alertToggle({
          message: "Saved successfully",
          isShow: true,
          type: "success"
        });
        this.setDefaults();
        this.dataArray[index] = result.data;
        this.refreshResultTable();
      } catch (err) {
        this.alertToggle({
          message: "Error on saving Steps",
          isShow: true,
          type: "error"
        });
      }
    },
    closeErrors() {
      this.areErrors = false;
    },
    async setFilter({ option, prop }) {
      this[prop] = option;
      await this.getSteps(this.allFilters);
    },
    async getCurrency() {
      try {
        const result = await this.$http.get("/currency/currency-ratio");
        this.currency = result.data;
      } catch (err) {
        this.alertToggle({
          message: "Error on getting currency",
          isShow: true,
          type: "error"
        });
      }
    }
  },
  watch: {
    async isRefresh() {
      if (this.isRefresh) {
        await this.getCurrency();
        this.getSteps(this.allFilters);
      }
    }
  },
  computed: {
    currentRatio() {
      this.currentMinPriceUSD = (
        this.currentMinPriceEUR * this.currency.USD
      ).toFixed(4);
      this.currentMinPriceGBP = (
        this.currentMinPriceEUR * this.currency.GBP
      ).toFixed(4);
    },
    manageIcons() {
      const { delete: del, ...result } = this.icons;
      return result;
    },
    allFilters() {
      let result = {
        stepFilter: this.stepFilter,
        unitFilter: this.unitFilter,
        sizeFilter: this.sizeFilter
      };
      if (this.stepFilter == "All") result.stepFilter = "";
      if (this.unitFilter == "All") result.unitFilter = "";
      if (this.sizeFilter == "All") result.sizeFilter = "";

      return result;
    }
  },
  components: {
    DataTable,
    StepFilter
  }
};
</script>
<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";
@import "../../../assets/styles/settingsTable";

.price {
  @extend %setting-table;
  width: 36%;
  background-color: #fff;
  padding: 20px 0;
  box-shadow: none;

 
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
    height: 30px;
    padding: 0 5px;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    overflow-y: auto;
  }

  &__editing-data {
    box-shadow: inset 0 0 7px $brown-shadow;
  }

  &__data-input {
    width: 100%;
    border: none;
    outline: none;
    color: $main-color;
    padding: 0 2px;
    background-color: transparent;
  }
  &__icons {
    padding-top: 2px;
    display: flex;
    justify-content: flex-end;
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
