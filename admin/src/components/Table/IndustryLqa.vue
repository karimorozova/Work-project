<template lang="pug">
  .industrylqas
    SettingsTable(
      :fields="fields"
      :tableData="industryTier"
      :errors="errors"
      :areErrors="areErrors"
      :rowCount="17"
      @closeErrors="closeErrors"
    )
      .industrylqas__head-title(slot="headerCategory" slot-scope="{ field }") {{ field.label }}
      .industrylqas__head-title(slot="headerLqa1" slot-scope="{ field }") {{ field.label }}
      .industrylqas__head-title(slot="headerLqa2" slot-scope="{ field }") {{ field.label }}
      .industrylqas__head-title(slot="headerLqa3" slot-scope="{ field }") {{ field.label }}
      .industrylqas__data(slot="category" slot-scope="{ row, index }") {{row.industry.name}}
      template(slot="tier1" slot-scope="{ row, index }")
        .industrylqas__data.center(v-if="currentActive !== index")
          span.industrylqas__secondary-text  Over
          span.industrylqas_bold.industrylqas__output {{row.tier1}}
          span.industrylqas__secondary-text  Wordcount
        .industrylqas__editing-data(v-else)
          span.industrylqas__secondary-text Over
          input.industrylqas_bold.industrylqas__data-input(type="number" v-model="currentTier1")
          span.industrylqas__secondary-text Wordcount
      template(slot="tier2" slot-scope="{ row, index }")
        .industrylqas__no-editable-data
          span.industrylqas__secondary-text Between
          span.industrylqas_bold.industrylqas__output {{row.tier3}}
          span.industrylqas__secondary-text to
          span.industrylqas_bold.industrylqas__output {{row.tier1}}
          span.industrylqas__secondary-text Wordcount
      template(slot="tier3" slot-scope="{ row, index }")
        .industrylqas__data.center(v-if="currentActive !== index")
          span.industrylqas__secondary-text Under
          span.industrylqas_bold.industrylqas__output {{row.tier3}}
          span.industrylqas__secondary-text Wordcount
        .industrylqas__editing-data(v-else)
          span.industrylqas__secondary-text Under
          input.industrylqas_bold.industrylqas__data-input(type="number" v-model="currentTier3")
          span.industrylqas__secondary-text Wordcount
      template(slot="icons" slot-scope="{ row, index }")
        .industrylqas__icons(v-if="isAdmin")
          img.industrylqas__icon(v-for="(icon, key) in manageIcons" :src="icon.icon" @click="makeAction(index, key)" :class="{'industrylqas_opacity': isActive(key, index)}")
        .industrylqas__icons(v-else)
          img(src="../../assets/images/lock.png")

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
        { label: "Name", headerKey: "headerCategory", key: "category", width: "19%", padding: "0" },
        { label: "Tier 1", headerKey: "headerLqa1", key: "tier1", width: "20%", padding: "0" },
        { label: "Tier 2", headerKey: "headerLqa2", key: "tier2", width: "30%", padding: "0" },
        { label: "Tier 3", headerKey: "headerLqa3", key: "tier3", width: "20%", padding: "0" },
        { label: "", headerKey: "headerLqa3", key: "icons", width: "11%", padding: "0" }
      ],
      industryTier: {},
      currentActive: -1,
      currentTier1: "",
      currentIndustryId: null,
      currentTier3: "",
      areErrors: false,
      errors: []
    }
  },
  methods: {
    async getIndustryTier() {
      try {
        const result = await this.$http.get("/api-settings/industry-tier")
        this.industryTier = result.body
      } catch (err) {
        this.alertToggle({ message: "Error on getting tier lqas.", isShow: true, type: "error" })
      }
    },
    isDigit(string) {
      const regex = /^\d+$/
      return regex.test(string)
    },
    closeErrors() {
      this.areErrors = false
    },
    async makeAction(index, key) {
      if (this.currentActive !== -1 && this.currentActive !== index) {
        return this.isEditing()
      }
      if (key === "save") {
        await this.checkErrors(index)
      }
      if (key === "edit") {
        this.setEditingData(index)
      }
      if (key === "cancel") {
        this.cancelEdition(index)
      }
    },
    setEditingData(index) {
      this.currentActive = index
      this.currentIndustryId = this.industryTier[index].industry._id
      this.currentTier1 = this.industryTier[index].tier1
      this.currentTier3 = this.industryTier[index].tier3
    },

    async checkErrors(index) {
      if (this.currentActive === -1) return
      this.errors = []
      if (!this.currentTier1 || !this.isDigit(this.currentTier1)) this.errors.push("Please, enter numeric value tier 1")
      if (!this.currentTier3 || !this.isDigit(this.currentTier3)) this.errors.push("Please, enter numeric value tier 3")
      if (this.errors.length) {
        return this.areErrors = true
      }
      await this.saveIndustryTier(index)
    },
    async saveIndustryTier(index) {
      const updatedIndustryTier = {
        index: this.currentIndustryId,
        currentTier1: this.currentTier1,
        currentTier3: this.currentTier3
      }
      try {
        await this.$http.put("/api-settings/update-industry-tier", { updatedIndustryTier })
        await this.getIndustryTier()
        this.alertToggle({ message: "User info saved", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" })
      }
      this.setDefaults()
    },
    cancelEdition(index) {
      if (!this.industryTier[index]) {
        this.industryTier.splice(index, 1)
      }
      this.setDefaults()
    },
    setDefaults() {
      this.currentActive = -1
      this.currentTier1 = ''
      this.currentIndustryId = null
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
    ...mapGetters({
      user: 'getUser'
    }),
    manageIcons() {
      const { "delete": del, ...result } = this.icons
      return result
    },
    isAdmin() {
      if (this.user && this.user.group) {
        const { group: { name } } = this.user
        return name === 'Administrators' || name === 'Developers'
      }
    }
  },
  created() {
    this.getIndustryTier()
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";
@import "../../assets/styles/settingsTable";

.industrylqas {
  @extend %setting-table;
  width: 950px;

  &__data, &__editing-data{
    height: 32px;
    padding: 0 5px;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    &.center {
      justify-content: center;
    }
  }

  &__no-editable-data {
    height: 32px;
    padding: 0 5px;
    display: flex;
    align-items: center;
    box-sizing: border-box;
  }

  &__editing-data {
    /*justify-content: space-between;*/
    box-shadow: inset 0 0 7px $brown-shadow

  }

  &__data-input {
    box-sizing: border-box;
    text-align: center;
    width: 35%;
    border: none;
    outline: none;
    color: $main-color;
    background: transparent;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }

    &[type=number] {
      -moz-appearance: textfield;
    }
  }

  &__secondary-text{
    opacity: 0.6;
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
    margin: 0 3px;
  }

  &_opacity {
    opacity: 1;
  }
  &_bold {
    font-family: 'Myriad600';
  }
  &__output{
    padding: 0 5px;
    width: 55px;
    text-align: center;
  }
}
</style>
