<template lang="pug">
.price
    DataTable(
        :fields="fields"
        :tableData="dataArray"
        :errors="errors"
        :areErrors="areErrors"
        :isApproveModal="isDeleting"
        @closeErrors="closeErrors"
        @notApprove="setDefaults"
        @closeModal="setDefaults"
        :bodyClass="['client-pricelist-table-body', {'tbody_visible-overflow': dataArray.length < 3}]"
        :tableheadRowClass="['client-pricelist-table-head', {'tbody_visible-overflow': dataArray.length < 3}]"
        bodyRowClass="client-pricelist-table-row"
        bodyCellClass="client-pricelist-table-cell"
    )

        template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
            .price-title {{ field.label }}

        template(slot="industry" slot-scope="{ row, index }")
            .price__data(v-if="currentActive !== index")
                img.price__main-icon(:src="row.industry.icon")
            .price__data(v-else)
                img.price__main-icon(:src="row.industry.icon")

        template(slot="multiplier" slot-scope="{ row, index }")
            .price__data(v-if="currentActive !== index")
                span(id="multiplier") {{row.multiplier}}
                label(for="multiplier") &#37;
            .price__editing-data(v-else)
                input.price__data-input(type="number" v-model="currentMultiplier")

        template(slot="icons" slot-scope="{ row, index }")
          .price__icons
            .tooltip(v-if="row.altered")
              span#myTooltip.tooltiptext {{ row.notification }}
              img.price__icons-info(:style="{cursor: 'help'}" src="../../../assets/images/red-info-icon.png")
            img.price__icon(v-for="(icon, key) in manageIcons" :src="icon.icon" @click="makeAction(index, key)" :class="{'price_opacity': isActive(key, index)}")
            span(v-if="row.altered")
              .price__icons-link(@click="getRowPrice(index)")
                i.fa.fa-link(aria-hidden='true')
            span(v-else)
              .price__icons-link-opacity
                i.fa.fa-link(aria-hidden='true')

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
      type: Array
    },
    clientId: {
      type: String
    },
    refresh: {
      type: Boolean
    }
  },
  data() {
    return {
      fields: [
        {
          label: "Industry",
          headerKey: "headerIndustry",
          key: "industry",
          width: "27%",
          padding: "0"
        },
        {
          label: "%",
          headerKey: "headerMultiplier",
          key: "multiplier",
          width: "21%",
          padding: "0"
        },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          width: "52%",
          padding: "0"
        }
      ],
      dataArray: [],

      currentIndustry: "",
      currentMultiplier: "",
      currentIndustryObj: null,

      areErrors: false,
      errors: [],
      isDeleting: false,
      deleteIndex: -1,
      currentActive: -1
    };
  },
  created() {
    this.getIndustries();
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle"
    }),
    async getRowPrice(index){
      try {
        const result = await this.$http.post("/clientsapi/rates/sync-cost/" + this.clientId, {
            tableKey: "Industry Multipliers Table",
            row: this.dataArray[index]
          })
      } catch (err) {
        this.alertToggle({message: "Impossibly update price", isShow: true, type: "error" });
      }finally{
        this.refreshResultTable();
        const client = await this.$http.get(`/clientsapi/client?id=${this.$route.params.id}`);
        this.dataArray =  client.data.rates.industryMultipliersTable;
      }
    },
    async getIndustries() {
      this.dataArray = this.tableData;
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
      this.currentIndustryObj = this.dataArray[index].industry;
      this.currentIndustry = this.dataArray[index].industry.icon;
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
      this.errors = [];
      if (this.currentMultiplier == "") return;
      if (Math.sign(this.currentMultiplier) == -1) return;
      if (this.errors.length) {
        this.areErrors = true;
        return;
      }
      await this.manageSaveClick(index);
    },
    refreshResultTable() {
      this.$emit("refreshResultTable");
    },
    async manageSaveClick(index) {
      if (this.currentActive === -1) return;
      try {
        const id = this.dataArray[index]._id;
        const serviceId = this.dataArray[index].serviceId;
        const result = await this.$http.post(
          "/clientsapi/rates/" + this.clientId,
          {
            itemIdentifier: "Industry Multipliers Table",
            updatedItem: {
              _id: id,
              serviceId,
              industry: this.currentIndustryObj,
              multiplier: parseFloat(this.currentMultiplier).toFixed(0),
              altered: true
            }
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
        this.dataArray[index] =
          updatedData.body.industryMultipliersTable[index];
        this.setDefaults();
        this.refreshResultTable();
      } catch (err) {
        this.alertToggle({
          message: "Error on getting Industry",
          isShow: true,
          type: "error"
        });
      }
    },
    closeErrors() {
      this.areErrors = false;
    }
  },
  computed: {
    manageIcons() {
      const { delete: del, ...result } = this.icons;
      return result;
    },
    ...mapGetters({
      currentClient: "getCurrentClient"
    })
  },
  watch: {
    async refresh() {
      if (this.refresh) {
        const client = await this.$http.get(`/clientsapi/client?id=${this.$route.params.id}`);
        this.dataArray =  client.data.rates.industryMultipliersTable;
      }
    }
  },
  components: {
    DataTable
  }
};
</script>
<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";
@import "../../../assets/styles/settingsTable";

.price {
  @extend %setting-table;
  background-color: #fff;
  padding: 20px 0px 20px 5px;
  box-shadow: none;

  input[disabled] {
    box-shadow: none;
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
    width: 100%;
    border: none;
    outline: none;
    color: $main-color;
    padding: 0 2px;
    background-color: transparent;
  }
  &__main-icon {
    width: 22px;
    height: 22px;
  }
  &__icons {
    padding-top: 3px;
    display: flex;
    justify-content: center;
    align-items: center;
   &-info {   margin-top:  4px; margin-right: 3px;    }
    &-link {
      cursor: pointer;
      font-size: 18px;
      margin-top: 5px;
    }
    &-link-opacity {
      cursor: default;
      font-size: 18px;
      margin-top: 4px;
      opacity: 0.5;
    }
  }
  &__icon {
    cursor: pointer;
    opacity: 0.5;
    margin-right: 4px;
  }
  &_opacity {
    opacity: 1;
  }
}
.tooltip {
  position: relative;
  display: inline-block;
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
}
</style>
