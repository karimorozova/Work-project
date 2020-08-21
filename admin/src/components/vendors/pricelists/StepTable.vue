<template lang="pug">
.price
  DataTable(
    :fields="fields",
    :tableData="dataArray",
    :errors="errors",
    :areErrors="areErrors",
    :isApproveModal="isDeleting",
    @closeErrors="closeErrors",
    @notApprove="setDefaults",
    @closeModal="setDefaults",
    :bodyClass="['client-pricelist-table-body', { 'tbody_visible-overflow': dataArray.length < 6 }]",
    :tableheadRowClass="['client-pricelist-table-head', { 'tbody_visible-overflow': dataArray.length < 6 }]",
    bodyRowClass="client-pricelist-table-row",
    bodyCellClass="client-pricelist-table-cell"
  )
    template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
      .price-title {{ field.label }}

    template(slot="step", slot-scope="{ row, index }")
      .price__data(v-if="currentActive !== index") {{ row.step.title }}
      .price__data(v-else)
        input.price__data-input(type="text", v-model="currentStep", disabled)

    template(slot="unit", slot-scope="{ row, index }")
      .price__data(v-if="currentActive !== index") {{ row.unit.type }}
      .price__data(v-else)
        input.price__data-input(type="text", v-model="currentUnit", disabled)

    template(slot="size", slot-scope="{ row, index }")
      .price__data(v-if="currentActive !== index") {{ row.size }}
      .price__data(v-else)
        input.price__data-input(type="text", v-model="currentSize", disabled)

    template(slot="multiplier", slot-scope="{ row, index }")
      .price__data(v-if="currentActive !== index")
        span#multiplier {{ row.multiplier }}
        label(for="multiplier") &#37;
      .price__editing-data(v-else)
        input.price__data-input(type="number", v-model="currentMultiplier")

    template(slot="icons", slot-scope="{ row, index }")
      .price__icons
        .altered(v-if="row.altered")
          .tooltip
            span(v-if="index <= 1")
              span#myTooltip.tooltiptext-bottom {{ row.notification }}
            span(v-else)
              span#myTooltip.tooltiptext {{ row.notification }}
            img.price__icons-info(:style="{ cursor: 'help' }", src="../../../assets/images/red-info-icon.png")
        img.price__icon(
          v-for="(icon, key) in manageIcons",
          :src="icon.icon",
          @click="makeAction(index, key)",
          :class="{ price_opacity: isActive(key, index) }"
        )
        span(v-if="row.altered")
          .price__icons-link(@click="getRowPrice(index)")
            i.fa.fa-link(aria-hidden="true")
        span(v-else)
          .price__icons-link-opacity
            i.fa.fa-link(aria-hidden="true")

  .price__empty(v-if="!dataArray.length") Nothing found...
</template>
<script>
import DataTable from "../../DataTable";
import crudIcons from "@/mixins/crudIcons";
import { mapGetters, mapActions } from "vuex";

export default {
  mixins: [crudIcons],
  props: {
    tableData: {
      type: Array,
    },
    vendorId: {
      type: String,
    },
    refresh: {
      type: Boolean,
    },
  },
  data() {
    return {
      fields: [
        {
          label: "Step",
          headerKey: "headerStep",
          key: "step",
          width: "23%",
          padding: "0",
        },
        {
          label: "Unit",
          headerKey: "headerUnit",
          key: "unit",
          width: "23%",
          padding: "0",
        },
        {
          label: "Size",
          headerKey: "headerSize",
          key: "size",
          width: "10%",
          padding: "0",
        },
        {
          label: "%",
          headerKey: "headerMultiplier",
          key: "multiplier",
          width: "13%",
          padding: "0",
        },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          width: "31%",
          padding: "0",
        },
      ],
      dataArray: [],
      currentStep: "",
      currentUnit: "",
      currentStepObj: "",
      currentUnitObj: "",
      currentSize: "",
      currentMultiplier: "",

      areErrors: false,
      errors: [],
      isDeleting: false,
      deleteIndex: -1,
      currentActive: -1,
      isDataRemain: true,
    };
  },
  created() {
    this.getSteps();
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
    }),
    async getRowPrice(index) {
      try {
        const result = await this.$http.post("/vendorsapi/rates/sync-cost/" + this.vendorId, {
          tableKey: "Step Multipliers Table",
          row: this.dataArray[index],
        });
      } catch (err) {
        this.alertToggle({ message: "Impossible update price", isShow: true, type: "error" });
      } finally {
        this.refreshResultTable();
        const vendor = await this.$http.get(`/vendorsapi/vendor?id=${this.$route.params.id}`);
        this.dataArray = vendor.data.rates.stepMultipliersTable;
      }
    },
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
      this.currentStepObj = this.dataArray[index].step;
      this.currentUnitObj = this.dataArray[index].unit;
      this.currentStep = this.dataArray[index].step.title;
      this.currentUnit = this.dataArray[index].unit.type;
      this.currentSize = this.dataArray[index].size;
      this.currentMultiplier = this.dataArray[index].multiplier;
    },
    manageCancelEdition() {
      this.setDefaults();
      this.isDeleting = false;
    },
    setDefaults() {
      this.currentActive = -1;
      this.isDeleting = false;
    },
    async checkErrors(index) {
      if (this.currentActive === -1) return;
      if (this.currentMultiplier == "") return;
      if (Math.sign(this.currentMultiplier) == -1) return;
      await this.manageSaveClick(index);
    },
    async getSteps() {
      this.dataArray = this.tableData;
    },
    refreshResultTable() {
      this.$emit("refreshResultTable");
    },
    async manageSaveClick(index) {
      if (this.currentActive === -1) return;
      const id = this.dataArray[index]._id;
      try {
        const result = await this.$http.post("/vendorsapi/rates/" + this.vendorId, {
          itemIdentifier: "Step Multipliers Table",
          updatedItem: {
            _id: id,
            step: this.currentStepObj,
            unit: this.currentUnitObj,
            size: this.currentSize,
            multiplier: parseFloat(this.currentMultiplier).toFixed(0),
            altered: true,
          },
        });
        this.alertToggle({
          message: "Saved successfully",
          isShow: true,
          type: "success",
        });
        const updatedData = await this.$http.get("/vendorsapi/rates/" + this.vendorId);
        this.dataArray[index] = updatedData.body.stepMultipliersTable[index];
        this.setDefaults();
        this.refreshResultTable();
      } catch (err) {
        this.alertToggle({
          message: "Error on saving Steps",
          isShow: true,
          type: "error",
        });
      }
    },
    closeErrors() {
      this.areErrors = false;
    },
  },
  watch: {
    async refresh() {
      if (this.refresh) {
        const vendor = await this.$http.get(`/vendorsapi/vendor?id=${this.$route.params.id}`);
        this.dataArray = vendor.data.rates.stepMultipliersTable;
      }
    },
  },
  computed: {
    manageIcons() {
      const { delete: del, ...result } = this.icons;
      return result;
    },
  },
  components: {
    DataTable,
  },
};
</script>
<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";
@import "../../../assets/styles/settingsTable";

.price {
  @extend %setting-table;
  background-color: #fff;
  padding: 20px 0 0;
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
  &__empty {
    font-size: 16px;
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
    &-info {
      margin-top: 1px;
      margin-right: 3px;
    }
    &-link {
      cursor: pointer;
      font-size: 18px;
      margin-top: 5px;
     margin-right: 4px;
    }
    &-link-opacity {
      cursor: default;
      font-size: 18px;
      margin-top: 4px;
      opacity: 0.5;
      margin-right: 4px;
    }
  }

  &__icon {
    cursor: pointer;
    opacity: 0.5;
    margin-right: 2px;
  }

  &_opacity {
    opacity: 1;
  }
}

.tooltip {
  position: relative;
  display: flex;

  .tooltiptext-bottom{
    font-size: 14px;
    visibility: hidden;
    width: 140px;
    background-color: #67573e;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    bottom: -225%;
    left: 50%;
    margin-left: -75px;
    opacity: 0;
    transition: opacity 0.3s;
    &::after {
      content: "";
      position: absolute;
      top: -10px;
      left: 50%;
      margin-left: -5px;
      transform: rotate(180deg);
      border-width: 5px;
      border-style: solid;
      border-color: #67573e transparent transparent;
    }
  }

  .tooltiptext {
    font-size: 14px;
    visibility: hidden;
    width: 140px;
    background-color: #67573e;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    bottom: 150%;
    left: 50%;
    margin-left: -75px;
    opacity: 0;
    transition: opacity 0.3s;
    &::after {
      content: "";
      position: absolute;
      top: 100%;
      left: 50%;
      margin-left: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: #67573e transparent transparent transparent;
    }
  }

  &:hover {
    .tooltiptext {
      visibility: visible;
      opacity: 1;
    }
  }
  &:hover {
    .tooltiptext-bottom {
      visibility: visible;
      opacity: 1;
    }
  }
}
</style>
