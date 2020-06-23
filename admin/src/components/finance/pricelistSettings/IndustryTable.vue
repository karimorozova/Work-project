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
        :bodyClass="['setting-table-body', {'tbody_visible-overflow': dataArray.length < 10}]"
        :tableheadRowClass="dataArray.length < 10 ? 'tbody_visible-overflow' : ''"
        bodyRowClass="settings-table-row"
        bodyCellClass="settings-table-cell"
    )
    
        template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
            .price-title {{ field.label }}
            
        template(slot="industry" slot-scope="{ row, index }")
            .price__data(v-if="currentActive !== index") {{ row.industry }}
            .price__data(v-else)
                input.price__data-input(type="text" v-model="currentIndustry" disabled)

        template(slot="multiplier" slot-scope="{ row, index }")
            .price__data(v-if="currentActive !== index")
                span(id="multiplier") {{row.multiplier}}
                label(for="multiplier") &#37;
            .price__editing-data(v-else)
                input.price__data-input(type="number" v-model="currentMultiplier")

        template(slot="icons" slot-scope="{ row, index }")
            .price__icons
                img.price__icon(v-for="(icon, key) in manageIcons" :src="icon.icon" @click="makeAction(index, key)" :class="{'price_opacity': isActive(key, index)}")
</template>
<script>
import DataTable from "../../DataTable";
import crudIcons from "@/mixins/crudIcons";
import { mapGetters, mapActions } from "vuex";

export default {
  mixins: [crudIcons],
  data() {
    return {
      fields: [
        {
          label: "Industry",
          headerKey: "headerIndustry",
          key: "industry",
          width: "40%",
          padding: "0"
        },
        {
          label: "Multiplier (%)",
          headerKey: "headerMultiplier",
          key: "multiplier",
          width: "25%",
          padding: "0"
        },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          width: "35%",
          padding: "0"
        }
      ],
      dataArray: [],

      currentIndustry: "",
      currentMultiplier: "",

      areErrors: false,
      errors: [],
      isDeleting: false,
      deleteIndex: -1,
      currentActive: -1
    };
  },
  created(){
    this.getIndustries();
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle"
    }),
    async getIndustries(){      
      try {
        const result = await this.$http.get('/pricelists/industry-multipliers');
        this.dataArray = result.data;        
      } catch (err) {
        this.alertToggle({
          message: "Error on getting Industries",
          isShow: true,
          type: "error"
        });       
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
      this.currentIndustry = this.dataArray[index].industry;
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
      if (this.currentMultiplier == '') return;
      if (this.errors.length) {
        this.areErrors = true;
        return;
      }      
      await this.manageSaveClick(index);
    },
    async manageSaveClick(index) {
      if (this.currentActive === -1) return;
      try {
        const id = this.dataArray[index]._id;
        await this.$http.post('/pricelists/industry-multipliers', {
          industryMultiplier: {
            _id: id,
            multiplier: this.currentMultiplier
          }
        })
        this.alertToggle({
          message: "Saved successfully",
          isShow: true,
          type: "success"
        }); 
        this.setDefaults();
      } catch (err) {
        this.alertToggle({
          message: "Error on getting Industry",
          isShow: true,
          type: "error"
        });  
        } finally {
        this.getIndustries();
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
  width: 20%;
  margin-top: 55px;
  background-color: #fff;
  padding: 20px 20px 20px 10px;
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