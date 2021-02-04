<template lang="pug">
  .tierlqas
    SettingsTable(
      :fields="fields"
      :tableData="tierInfo"
      :errors="errors"
      :areErrors="areErrors"
      @closeErrors="closeErrors"
    )
      .tierlqas__head-title(slot="headerCategory" slot-scope="{ field }") {{ field.label }}
      .tierlqas__head-title(slot="headerLqa1" slot-scope="{ field }") {{ field.label }}
      .tierlqas__head-title(slot="headerLqa2" slot-scope="{ field }") {{ field.label }}
      .tierlqas__head-title(slot="headerLqa3" slot-scope="{ field }") {{ field.label }}
      .tierlqas__data(slot="category" slot-scope="{ row, index }") {{index}}
      template(slot="tier1" slot-scope="{ row, index }")
        .tierlqas__data(v-if="currentActive !== index") {{row.tier1}}
        .tierlqas__editing-data(v-else)
          input.tierlqas__data-input(type="number" v-model="currentTier1")
      template(slot="tier2" slot-scope="{ row, index }")
        .tierlqas__data(v-if="currentActive !== index") {{row.tier2}}
        .tierlqas__editing-data(v-else)
          input.tierlqas__data-input(type="number" v-model="currentTier2")
      template(slot="tier3" slot-scope="{ row, index }")
        .tierlqas__data(v-if="currentActive !== index") {{row.tier3}}
        .tierlqas__editing-data(v-else)
          input.tierlqas__data-input(type="number" v-model="currentTier3")
      template(slot="icons" slot-scope="{ row, index }")
        .tierlqas__icons
          img.tierlqas__icon(v-for="(icon, key) in manageIcons" :src="icon.icon" @click="makeAction(index, key)" :class="{'tierlqas_opacity': isActive(key, index)}")

</template>

<script>
import SettingsTable from "./SettingsTable"
import { mapGetters, mapActions } from "vuex"
import crudIcons from "@/mixins/crudIcons"

export default {
  mixins: [ crudIcons ],
  data() {
    return {
      fields: [
        { label: "Name", headerKey: "headerCategory", key: "category", width: "25%", padding: "0" },
        { label: "Tier 1", headerKey: "headerLqa1", key: "tier1", width: "25%", padding: "0" },
        { label: "Tier 2", headerKey: "headerLqa2", key: "tier2", width: "25%", padding: "0" },
        { label: "Tier 3", headerKey: "headerLqa3", key: "tier3", width: "25%", padding: "0" },
        { label: "", headerKey: "headerLqa3", key: "icons", width: "25%", padding: "0" }
      ],
      tierInfo: {},
      currentActive: -1,
      currentTier1: "",
      currentTier2: "",
      currentTier3: "",
      areErrors: false,
      errors: [],
      }
  },
  methods: {
    async getTierInfo() {
      try {
          const result = await this.$http.get("/api-settings/tier-info");
          this.tierInfo = result.body;
      } catch(err) {
          this.alertToggle({message: "Error on getting tier lqas.", isShow: true, type: "error"});
      }
    },
    isDigit(string) {
      const regex = /^\d+$/
      return regex.test(string)
    },
    closeErrors() {
      this.areErrors = false;
    },
    async makeAction(index, key) {
      if(this.currentActive !== -1 && this.currentActive !== index) {
        return this.isEditing();
      }
      if(key === "save") {
        await this.checkErrors(index);
      }
      if(key === "edit") {
        this.setEditingData(index);
      }
      if(key === "cancel") {
        this.cancelEdition(index);
      }
    },
    setEditingData(index) {
      this.currentActive = index;
      this.currentTier1 = this.tierInfo[index].tier1
      this.currentTier2 = this.tierInfo[index].tier2
      this.currentTier3 = this.tierInfo[index].tier3
    },

    async checkErrors(index){
      if(this.currentActive === -1) return;
      this.errors = [];
      if(!this.currentTier1 || !this.isDigit(this.currentTier1)) this.errors.push("Please, enter numeric value tier 1");
      if(!this.currentTier2 || !this.isDigit(this.currentTier2)) this.errors.push("Please, enter numeric value tier 2");
      if(!this.currentTier3 || !this.isDigit(this.currentTier3)) this.errors.push("Please, enter numeric value tier 3");
      if(this.errors.length) {
        return this.areErrors = true;
      }
      await this.saveTierInfo(index);
    },
    async saveTierInfo(index) {
      const updatedTierInfo = {
        index,
        currentTier1: this.currentTier1,
        currentTier2: this.currentTier2,
        currentTier3: this.currentTier3,
      }
      try {
        await this.$http.put("/api-settings/update-tier-info", {updatedTierInfo});
        await this.getTierInfo();
        this.alertToggle({message: "User info saved", isShow: true, type: "success"});
      } catch(err) {
        this.alertToggle({message: err.message, isShow: true, type: "error"});
      }
      this.setDefaults();
    },
    cancelEdition(index) {
      if(!this.tierInfo[index]) {
        this.tierInfo.splice(index, 1);
      }
      this.setDefaults();
    },
    setDefaults() {
      this.currentActive = -1;
      this.currentTier1 = ''
      this.currentTier2 = ''
      this.currentTier3 = ''
    },
    ...mapActions({
      alertToggle: "alertToggle"
    })
  },
  components: {
    SettingsTable
  },
  computed: {
    manageIcons() {
      const { "delete": del, ...result } = this.icons;
      return result;
    }
  },
  created() {
    this.getTierInfo()
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";
@import "../../assets/styles/settingsTable";

.tierlqas {
  @extend %setting-table;
  width: 900px;

  &__data, &__editing-data {
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

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }
    &[type=number] {
      -moz-appearance: textfield;
    }
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
