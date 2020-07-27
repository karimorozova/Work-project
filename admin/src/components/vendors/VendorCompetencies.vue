<template lang="pug">
.competencies
    .competencies__table
        SettingsTable(
          :fields="fields"
          :tableData="competenciesData"
          :errors="errors"
          :areErrors="areErrors"
          :isApproveModal="isDeleting"
          @closeErrors="closeErrors"
          @approve="deleteCompetencies"
          @notApprove="setDefaults" 
          @closeModal="setDefaults"
        )

          template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
            .competencies__head-title {{ field.label }}

          template(slot="source" slot-scope="{ row, index }")
            .competencies__data(v-if="currentActive !== index") {{ row.sourceLanguage.lang }}
            .competencies__drop-menu(v-else)
                SelectSingle(
                    :isTableDropMenu="isTableDropMenu"
                    placeholder="Select"
                    :hasSearch="true"
                    :selectedOption="currentSource.lang"
                    :options="languages.map(i => i.lang)"
                    @chooseOption="setSource"
                )

          template(slot="targets" slot-scope="{ row, index }")
            .competencies__data(v-if="currentActive !== index") {{ presentArrays(row.targetLanguages, 'lang') }}
            .competencies__drop-menu(v-else)
                SelectMulti(
                  :isTableDropMenu="isTableDropMenu"
                  placeholder="Select"
                  :hasSearch="true"
                  :selectedOptions="currentTargets.map(i => i.lang)"
                  :options="languages.map(i => i.lang)"
                  @chooseOptions="setTargets"   
                )
                
          template(slot="step" slot-scope="{ row, index }")
            .competencies__data(v-if="currentActive !== index") {{ presentArrays(row.steps, 'title') }}
            .competencies__drop-menu(v-else)
                SelectMulti(
                  :isTableDropMenu="isTableDropMenu"
                  placeholder="Select"
                  :hasSearch="true"
                  :selectedOptions="currentSteps.map(i => i.title)"
                  :options="steps.map(i => i.title)"
                  @chooseOptions="setSteps"   
                )

          template(slot="industry" slot-scope="{ row, index }")
            .competencies__data(v-if="currentActive !== index") {{ presentArrays(row.industries, 'name') }}
            .competencies__drop-menu(v-else)
                SelectMulti(
                  :isTableDropMenu="isTableDropMenu"
                  placeholder="Select"
                  :hasSearch="true"
                  :selectedOptions="currentIndustries.map(i => i.name)"
                  :options="vendorIndustries"
                  @chooseOptions="setIndustries"
                )
                  
          template(slot="icons" slot-scope="{ row, index }")
            .competencies__icons
              img.competencies__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'competencies_opacity': isActive(key, index)}")

    Add(@add="addData")

</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Add from "../Add";
import SelectSingle from "../SelectSingle";
import SelectMulti from "../SelectMulti";
import SettingsTable from "../Table/SettingsTable";
import crudIcons from "@/mixins/crudIcons";

export default {
  mixins: [crudIcons],
  props: {
    vendorIndustries: {
      type: Array
    },
    languages: {
      type: Array
    },
    steps: {
      type: Array
    },
    industries: {
      type: Array
    }
  },
  data() {
    return {
      fields: [
        {
          label: "Source Language",
          headerKey: "headerSource",
          key: "source",
          width: "20%",
          padding: "0"
        },
        {
          label: "Target Languages",
          headerKey: "headerTarget",
          key: "targets",
          width: "20%",
          padding: "0"
        },
        {
          label: "Steps",
          headerKey: "headerService",
          key: "step",
          width: "20%",
          padding: "0"
        },
        {
          label: "Industries",
          headerKey: "headerIndustry",
          key: "industry",
          width: "20%",
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

      competenciesData: [],
      currentSource: "",
      currentTargets: [],
      currentIndustries: [],
      currentSteps: [],

      currentActive: -1,
      areErrors: false,
      errors: [],
      isDeleting: false,
      deleteIndex: -1,
      isTableDropMenu: true
    };
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle"
    }),

    presentArrays(Arr, key) {
      if (!Arr.length) return "";
      return Arr.reduce((acc, cur) => acc + `${cur[key]}; `, "");
    },

    setIndustries({ option }) {
      const position = this.currentIndustries
        .map(item => item.name)
        .indexOf(option);
      if (position !== -1) {
        this.currentIndustries.splice(position, 1);
      } else {
        const industry = this.industries.find(item => item.name === option);
        this.currentIndustries.push(industry);
      }
    },

    setTargets({ option }) {
      const position = this.currentTargets
        .map(item => item.lang)
        .indexOf(option);
      if (position !== -1) {
        this.currentTargets.splice(position, 1);
      } else {
        const lang = this.languages.find(item => item.lang === option);
        this.currentTargets.push(lang);
      }
    },
    setSteps({ option }) {
      const position = this.currentSteps
        .map(item => item.title)
        .indexOf(option);
      if (position !== -1) {
        this.currentSteps.splice(position, 1);
      } else {
        const service = this.steps.find(item => item.title === option);
        this.currentSteps.push(service);
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
          this.manageCancelEdition(index);
          break;
        case "delete":
          this.manageDeleteClick(index);
          break;
        default:
          await this.checkErrors(index);
      }
    },

    setEditingData(index) {
      this.currentActive = index;
      this.currentSource = this.competenciesData[index].sourceLanguage;
      this.currentTargets = Array.from(
        this.competenciesData[index].targetLanguages
      );
      this.currentIndustries = Array.from(
        this.competenciesData[index].industries
      );
      this.currentSteps = Array.from(this.competenciesData[index].steps);
    },

    manageCancelEdition(index) {
      !this.competenciesData[index]._id &&
        this.competenciesData.splice(index, 1);
      this.setDefaults();
      this.isDeleting = false;
    },

    setDefaults() {
      this.currentActive = -1;
      this.isDeleting = false;
      this.currentSource = "";
      this.currentTargets = [];
      this.currentIndustries = [];
      this.currentSteps = [];
    },

    async checkErrors(index) {
      this.errors = [];

      // const client = await this.$http.get(
      //   `/clientsapi/client?id=${this.$route.params.id}`
      // );

      // const liststepsExceptTheCurrent = client.body.steps;
      // const arraysOfTheSame = liststepsExceptTheCurrent.filter(
      //   item => item.sourceLanguage.lang === this.currentSource.lang
      // );

      // if (this.competenciesData[index]._id != null) {
      //   const oldCurrentSource =
      //     liststepsExceptTheCurrent[index].sourceLanguage.lang;
      //   if (
      //     oldCurrentSource !== this.currentSource.lang &&
      //     arraysOfTheSame.length
      //   ) {
      //     this.errors.push("Target language cannot be the same");
      //   }
      // } else {
      //   if (arraysOfTheSame.length) {
      //     this.errors.push("Target language cannot be the same");
      //   }
      // };

      if (!this.currentSource) this.errors.push("Source should not be empty!");
      if (!this.currentTargets.length)
        this.errors.push("Target should not be empty!");
      if (!this.currentIndustries.length)
        this.errors.push("Industry should not be empty!");
      if (!this.currentSteps.length)
        this.errors.push("Steps should not be empty!");
      if (this.errors.length) {
        this.areErrors = true;
        return;
      }
      await this.manageSaveClick(index);
    },

    async manageSaveClick(index) {
      if (this.currentActive === -1) return;
      try {
        const id = this.competenciesData[index]._id;
        const currentData = {
          _id: id,
          sourceLanguage: this.currentSource,
          targetLanguages: this.currentTargets,
          steps: this.currentSteps,
          industries: this.currentIndustries
        };
        const result = this.$http.post("/vendorsapi/competencies", {
          vendorId: this.$route.params.id,
          currentData
        });
        this.alertToggle({
          message: "Competencies are saved",
          isShow: true,
          type: "success"
        });
      } catch (err) {
        this.alertToggle({
          message: "Error in save Competencies",
          isShow: true,
          type: "error"
        });
      } finally {
        this.setDefaults();
        const vendor = await this.$http.get(
          `/vendorsapi/vendor?id=${this.$route.params.id}`
        );
        this.competenciesData = vendor.data.competencies;
      }
    },

    async manageDeleteClick(index) {
      if (!this.competenciesData[index]._id) {
        this.competenciesData.splice(index, 1);
        this.setDefaults();
        return;
      }
      this.deleteIndex = index;
      this.isDeleting = true;
    },

    closeModal() {
      return (this.isDeleting = false);
    },

    async deleteCompetencies() {
      try {
        let currentData = this.competenciesData[this.deleteIndex];
        const result = this.$http.delete(
          `/vendorsapi/competencies/${this.$route.params.id}/${currentData._id}`
        );
        this.competenciesData.splice(this.deleteIndex, 1);
        this.closeModal();
        this.alertToggle({
          message: "Competencies are deleted",
          isShow: true,
          type: "success"
        });
      } catch (err) {
        this.alertToggle({
          message: "Error in save Competencies",
          isShow: true,
          type: "error"
        });
      }
    },

    addData() {
      if (this.currentActive !== -1) {
        return this.isEditing();
      }
      this.competenciesData.push({
        sourceLanguage: "",
        targetLanguages: [],
        steps: [],
        industries: []
      });
      this.setEditingData(this.competenciesData.length - 1);
    },

    closeErrors() {
      this.areErrors = false;
    },

    setSource({ option }) {
      this.currentSource = this.languages.find(item => item.lang === option);
    },

    async getVendorInfo() {
      const vendor = await this.$http.get(
        `/vendorsapi/vendor?id=${this.$route.params.id}`
      );
      this.competenciesData = vendor.data.competencies;
    }
  },
  computed: {
    ...mapGetters({
      currentVendor: "getCurrentVendor"
    })
  },
  created() {
    this.currentVendor._id && this.getVendorInfo();
  },
  components: {
    SelectSingle,
    SettingsTable,
    SelectMulti,
    Add
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/scss/style.scss";
@import "../../assets/styles/settingsTable.scss";

.competencies {
  &__data {
    @extend %table-data;
    overflow-x: hidden;
  }
  &__editing-data {
    @extend %table-data;
    box-shadow: inset 0 0 7px $brown-shadow;
  }
  &__data-input {
    @extend %table-text-input;
  }
  &__icons {
    @extend %table-icons;
    height: 32px;
    justify-content: center;
  }
  &__icon {
    @extend %table-icon;
  }
  &__drop-menu {
    position: relative;
    box-shadow: inset 0 0 7px $brown-shadow;
  }
  &_opacity {
    opacity: 1;
  }
  &__input {
    @extend %table-text-input;
  }
}
</style>
