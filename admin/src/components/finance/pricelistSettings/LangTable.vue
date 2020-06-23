<template lang="pug">
.price
    LangFilter(
      :source="sourceFilter"
      :target="targetFilter"
      :form="typeFilter"
      :sources="languages"
      :targets="languages"
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
        @bottomScrolled="bottomScrolled"
    )
      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .price-title {{ field.label }}

      template(slot="sourceLang" slot-scope="{ row, index }")
        .price__data(v-if="currentActive !== index") {{ row.sourceLanguage.lang }}
        .price__data(v-else)
          input.price__data-input(type="text" v-model="currentSourceLang" disabled)

      template(slot="targetLang" slot-scope="{ row, index }")
        .price__data(v-if="currentActive !== index") {{ row.targetLanguage.lang }}
        .price__data(v-else)
          input.price__data-input(type="text" v-model="currentTargetLang" disabled)

      template(slot="eur" slot-scope="{ row, index }")
        .price__data(v-if="currentActive !== index")
          span(id="eur") {{row.euroBasicPrice}}
          label(for="eur") &euro;
        .price__editing-data(v-else)
          input.price__data-input(type="number" v-model="currentBasicPriceEUR")

      template(slot="usd" slot-scope="{ row, index }")
        .price__data(v-if="currentActive !== index")
          span(id="usd") {{row.usdBasicPrice}}
          label(for="usd") &#36;
        .price__editing-data(v-else)
          input.price__data-input(type="number" v-model="currentBasicPriceUSD")

      template(slot="gbp" slot-scope="{ row, index }")
        .price__data(v-if="currentActive !== index")
          span(id="gbp") {{row.gbpBasicPrice}}
          label(for="gbp") &pound;
        .price__editing-data(v-else)
          input.price__data-input(type="number" v-model="currentBasicPriceGBP")

      template(slot="icons" slot-scope="{ row, index }")
        .price__icons
          img.price__icon(v-for="(icon, key) in manageIcons" :src="icon.icon" @click="makeAction(index, key)" :class="{'price_opacity': isActive(key, index)}")

</template>
<script>
import DataTable from "../../DataTable";
import crudIcons from "@/mixins/crudIcons";
import LangFilter from "./LangFilter";
import { mapGetters, mapActions } from "vuex";

export default {
  mixins: [crudIcons],
  props: {
    languages: {
      type: Array
    }
  },
  data() {
    return {
      fields: [
        {
          label: "Source Lang",
          headerKey: "headerSourceLang",
          key: "sourceLang",
          width: "17.5%",
          padding: "0"
        },
        {
          label: "Target Lang",
          headerKey: "headerTargetLang",
          key: "targetLang",
          width: "17.5%",
          padding: "0"
        },
        {
          label: "Basic price (Euro)",
          headerKey: "headerBasicPriceEUR",
          key: "eur",
          width: "15%",
          padding: "0"
        },
        {
          label: "Basic price (USD)",
          headerKey: "headerBasicPriceUSD",
          key: "usd",
          width: "15%",
          padding: "0"
        },
        {
          label: "Basic price (GBP)",
          headerKey: "headerBasicPriceGBP",
          key: "gbp",
          width: "15%",
          padding: "0"
        },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          width: "20%",
          padding: "0"
        }
      ],
      dataArray: [],
      currentSourceLang: "",
      currentTargetLang: "",
      currentBasicPriceUSD: "",
      currentBasicPriceEUR: "",
      currentBasicPriceGBP: "",

      typeFilter: "",
      sourceFilter: "",
      targetFilter: "",

      areErrors: false,
      errors: [],
      isDeleting: false,
      deleteIndex: -1,
      currentActive: -1,
      isDataRemain: true
    };
  },
  created() {
    this.getLangs(this.allFilters);
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
      (this.currentSourceLang = this.dataArray[index].sourceLanguage.lang),
        (this.currentTargetLang = this.dataArray[index].targetLanguage.lang),
        (this.currentBasicPriceUSD = this.dataArray[index].usdBasicPrice);
      this.currentBasicPriceEUR = this.dataArray[index].euroBasicPrice;
      this.currentBasicPriceGBP = this.dataArray[index].gbpBasicPrice;
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
      this.errors = [];
      if (this.currentBasicPriceUSD == "") return;
      if (this.currentBasicPriceEUR == "") return;
      if (this.currentBasicPriceGBP == "") return;
      if (this.errors.length) {
        this.areErrors = true;
        return;
      }
      await this.manageSaveClick(index);
    },
    async bottomScrolled() {
      if (this.isDataRemain) {
        const result = await this.$http.post("/pricelists/basic-prices", {
          ...this.allFilters,
          countFilter: this.dataArray.length
        });
        this.dataArray.push(...result.data);
        this.isDataRemain = result.body.length === 25;
      }
    },
    async getLangs(filters, count = 0) {
      try {
        const result = await this.$http.post("/pricelists/basic-prices", {
          ...filters,
          countFilter: count
        });
        this.dataArray = result.data;
      } catch (err) {
        this.alertToggle({
          message: "Error on getting Languages",
          isShow: true,
          type: "error"
        });
      }
    },
    async manageSaveClick(index) {
      if (this.currentActive === -1) return;
      const id = this.dataArray[index]._id;
      try {
        const result = await this.$http.post(
          "/pricelists/basic-prices-update",
          {
            basicPrice: {
              _id: id,
              usdBasicPrice: this.currentBasicPriceUSD,
              euroBasicPrice: this.currentBasicPriceEUR,
              gbpBasicPrice: this.currentBasicPriceGBP
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
      await this.getLangs(this.allFilters);
    }
  },
  computed: {
    manageIcons() {
      const { delete: del, ...result } = this.icons;
      return result;
    },
    allFilters() {
      let result = {
        typeFilter: this.typeFilter,
        sourceFilter: this.sourceFilter,
        targetFilter: this.targetFilter
      };
      if(this.typeFilter == "All") result.typeFilter = '';
      if(this.sourceFilter == "All") result.sourceFilter = '';
      if(this.targetFilter == "All") result.targetFilter = '';

      return result;
    }
  },
  components: {
    DataTable,
    LangFilter
  }
};
</script>
<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";
@import "../../../assets/styles/settingsTable";

.price {
  @extend %setting-table;
  width: 38%;
  background-color: #fff;
  padding: 20px 10px 20px 20px;
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