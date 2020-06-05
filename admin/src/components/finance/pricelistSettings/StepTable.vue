<template lang="pug">
.price
    StepFilter(
      :step="stepStepFilter"
      :unit="unitStepFilter"
      :size="sizeStepFilter"
      :steps="steps"
      :units="units"
      :sizes="['test']"
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
        :bodyClass="['setting-table-body', {'tbody_visible-overflow': dataArray.length < 10}]"
        :tableheadRowClass="dataArray.length < 10 ? 'tbody_visible-overflow' : ''"
        bodyRowClass="settings-table-row"
        bodyCellClass="settings-table-cell"        
    )
        template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
            .price-title {{ field.label }}
            
        template(slot="step" slot-scope="{ row, index }")
            .price__data(v-if="currentActive !== index") {{ row.step }}
            .price__data(v-else)
                input.price__data-input(type="text" v-model="currentStep" disabled)

        template(slot="unit" slot-scope="{ row, index }")
            .price__data(v-if="currentActive !== index") {{ row.unit }}
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

        template(slot="usd" slot-scope="{ row, index }")
            .price__data(v-if="currentActive !== index")
                span(id="usd") {{row.usd}}
                label(for="usd") &#36;
            .price__editing-data(v-else)
                input.price__data-input(type="number" v-model="currentMinPriceUSD")

        template(slot="eur" slot-scope="{ row, index }")
            .price__data(v-if="currentActive !== index")
                span(id="eur") {{row.eur}}
                label(for="eur") &euro;
            .price__editing-data(v-else)
                input.price__data-input(type="number" v-model="currentMinPriceEUR")

        template(slot="gbp" slot-scope="{ row, index }")
            .price__data(v-if="currentActive !== index")
                span(id="gbp") {{row.gbp}}
                label(for="gbp") &pound;
            .price__editing-data(v-else)
                input.price__data-input(type="number" v-model="currentMinPriceGBP")

        template(slot="icons" slot-scope="{ row, index }")
            .price__icons
                img.price__icon(v-for="(icon, key) in manageIcons" :src="icon.icon" @click="makeAction(index, key)" :class="{'price_opacity': isActive(key, index)}")
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
    }
  },
  data() {
    return {
      fields: [
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
          width: "12.5%",
          padding: "0"
        },
        {
          label: "Size",
          headerKey: "headerSize",
          key: "size",
          width: "8%",
          padding: "0"
        },
        {
          label: "Multiplier (%)",
          headerKey: "headerMultiplier",
          key: "multiplier",
          width: "10%",
          padding: "0"
        },
        {
          label: "Min price (USD)",
          headerKey: "headerMinPriceUSD",
          key: "usd",
          width: "12.5%",
          padding: "0"
        },
        {
          label: "Min price (EUR)",
          headerKey: "headerMinPriceEUR",
          key: "eur",
          width: "12.5%",
          padding: "0"
        },
        {
          label: "Min price (GBP)",
          headerKey: "headerMinPriceGBP",
          key: "gbp",
          width: "12.5%",
          padding: "0"
        },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          width: "17%",
          padding: "0"
        }
      ],
      dataArray: [
        {
          step: "SomeStep",
          unit: "Package",
          size: 200,
          multiplier: 100,
          usd: 1,
          eur: 2,
          gbp: 3
        }
      ],

      currentStep: "",
      currentUnit: "",
      currentSize: "",
      currentMultiplier: "",
      currentMinPriceUSD: "",
      currentMinPriceEUR: "",
      currentMinPriceGBP: "",

      stepStepFilter: "",
      unitStepFilter: "",
      sizeStepFilter: "",

      areErrors: false,
      errors: [],
      isDeleting: false,
      deleteIndex: -1,
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
      this.currentStep = this.dataArray[index].step;
      this.currentUnit = this.dataArray[index].unit;
      this.currentSize = this.dataArray[index].size;
      this.currentMultiplier = this.dataArray[index].multiplier;
      this.currentMinPriceUSD = this.dataArray[index].usd;
      this.currentMinPriceEUR = this.dataArray[index].eur;
      this.currentMinPriceGBP = this.dataArray[index].gbp;
    },
    manageCancelEdition() {
      // this.vendorTests = this.vendorTests.filter(item => item._id);
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
      // if (!this.currentTest) this.errors.push("Test should not be empty!");
      if (this.errors.length) {
        this.areErrors = true;
        return;
      }
      await this.manageSaveClick(index);
    },
    async manageSaveClick(index) {
      if (this.currentActive === -1) return;
      try {
        alert("try");
        // await this.saveLangTest({ testData, file: this.currentFile });
        // await this.getTests();
      } catch (err) {
      } finally {
        // this.setDefaults();
      }
    },
    closeErrors() {
      this.areErrors = false;
    },
    setFilter({ option, prop }) {
      this[prop] = option;
    }
  },
  computed: {
    manageIcons() {
      const { delete: del, ...result } = this.icons;
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
  width: 42%;
  background-color: #fff;
  padding: 20px 10px;
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