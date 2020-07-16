<template lang="pug">
.clientService
    .clientService__table
        SettingsTable(
          :fields="fields"
          :tableData="clientServices"
          :errors="errors"
          :areErrors="areErrors"
          :isApproveModal="isDeleting"
          @closeErrors="closeErrors"
          @approve="deleteService"
          @notApprove="setDefaults" 
          @closeModal="setDefaults"
        )

          template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
            .clientService__head-title {{ field.label }}

          template(slot="source" slot-scope="{ row, index }")
            .clientService__data(v-if="currentActive !== index") {{ row.sourceLanguage.lang }}
            .clientService__drop-menu(v-else)
                SelectSingle(
                    :isTableDropMenu="isTableDropMenu"
                    placeholder="Select"
                    :hasSearch="true"
                    :selectedOption="currentSource.lang"
                    :options="sourceLanguagesClient"
                    @chooseOption="setSource"
                    @scrollDrop="scrollDrop"
                )

          template(slot="targets" slot-scope="{ row, index }")
            .clientService__data(v-if="currentActive !== index") {{ presentArrays(row.targetLanguages, 'lang') }}
            .clientService__drop-menu(v-else)
                SelectMulti(
                  :isTableDropMenu="isTableDropMenu"
                  placeholder="Select"
                  :hasSearch="true"
                  :selectedOptions="currentTargets.map(i => i.lang)"
                  :options="targetLanguagesClient" 
                  @chooseOptions="setTargets"   
                )
                
          template(slot="service" slot-scope="{ row, index }")
            .clientService__data(v-if="currentActive !== index") {{ presentArrays(row.services, 'title') }}
            .clientService__drop-menu(v-else)
                SelectMulti(
                  :isTableDropMenu="isTableDropMenu"
                  placeholder="Select"
                  :hasSearch="true"
                  :selectedOptions="currentServices.map(i => i.title)"
                  :options="services.map(i => i.title)"
                  @chooseOptions="setServices"   
                )

          template(slot="industry" slot-scope="{ row, index }")
            .clientService__data(v-if="currentActive !== index") {{ presentArrays(row.industries, 'name') }}
            .clientService__drop-menu(v-else)
                  SelectMulti(
                    :isTableDropMenu="isTableDropMenu"
                    placeholder="Select"
                    :hasSearch="true"
                    :selectedOptions="currentIndustries.map(i => i.name)"
                    :options="clientIndustries"
                    @chooseOptions="setIndustries"   
                  )
                  
          template(slot="icons" slot-scope="{ row, index }")
            .clientService__icons
              img.clientService__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'clientService_opacity': isActive(key, index)}")

    Add(@add="addData")

</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Add from "../Add";
import SelectSingle from "../SelectSingle";
import SelectMulti from "../SelectMulti";
import SettingsTable from "../Table/SettingsTable";
import crudIcons from "@/mixins/crudIcons";
import scrollDrop from "@/mixins/scrollDrop";

export default {
  mixins: [scrollDrop, crudIcons],
  props: {
    clientIndustries: {
      type: Array
    },
    sourceLanguagesClient: {
      type: Array
    },
    targetLanguagesClient: {
      type: Array
    },
    languages: {
      type: Array
    },
    services: {
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
          label: "Services",
          headerKey: "headerService",
          key: "service",
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

      clientServices: [],

      currentSource: "",
      currentTargets: [],
      currentIndustries: [],
      currentServices: [],

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
      alertToggle: "alertToggle",
      storeCurrentClient: "storeCurrentClient"
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

    setServices({ option }) {
      const position = this.currentServices
        .map(item => item.title)
        .indexOf(option);
      if (position !== -1) {
        this.currentServices.splice(position, 1);
      } else {
        const service = this.services.find(item => item.title === option);
        this.currentServices.push(service);
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
      this.currentSource = this.clientServices[index].sourceLanguage;
      this.currentTargets = Array.from(
        this.clientServices[index].targetLanguages
      );
      this.currentIndustries = Array.from(
        this.clientServices[index].industries
      );
      this.currentServices = Array.from(this.clientServices[index].services);
    },

    manageCancelEdition(index) {
      !this.clientServices[index]._id && this.clientServices.splice(index, 1);
      this.setDefaults();
      this.isDeleting = false;
    },

    setDefaults() {
      this.currentActive = -1;
      this.isDeleting = false;
      this.currentSource = "";
      this.currentTargets = [];
      this.currentIndustries = [];
      this.currentServices = [];
    },

    async checkErrors(index) {
      this.errors = [];
      if (!this.currentSource) this.errors.push("Source should not be empty!");
      if (!this.currentTargets.length)
        this.errors.push("Target should not be empty!");
      if (!this.currentIndustries.length)
        this.errors.push("Industry should not be empty!");
      if (!this.currentServices.length)
        this.errors.push("Service should not be empty!");
      if (this.errors.length) {
        this.areErrors = true;
        return;
      }
      await this.manageSaveClick(index);
    },

    async manageSaveClick(index) {
      if (this.currentActive === -1) return;
      try {
        const id = this.clientServices[index]._id;
        const currentData = {
          _id: id,
          sourceLanguage: this.currentSource,
          targetLanguages: this.currentTargets,
          services: this.currentServices,
          industries: this.currentIndustries
        };
        const result = this.$http.post("/clientsapi/services", {
          clientId: this.$route.params.id,
          currentData
        });
        this.alertToggle({
          message: "Services are saved",
          isShow: true,
          type: "success"
        });
      } catch (err) {
        this.alertToggle({
          message: "Error in save Services",
          isShow: true,
          type: "error"
        });
      } finally {
        const client = await this.$http.get(
          `/clientsapi/client?id=${this.$route.params.id}`
        );
        this.clientServices = client.body.services;
        this.setDefaults();
      }
    },

    async manageDeleteClick(index) {
      if (!this.clientServices[index]._id) {
        this.clientServices.splice(index, 1);
        this.setDefaults();
        return;
      }
      this.deleteIndex = index;
      this.isDeleting = true;
    },

    closeModal() {
      return (this.isDeleting = false);
    },

    async deleteService() {
      try {
        let currentData = this.clientServices[this.deleteIndex];
        const result = this.$http.delete(
          `/clientsapi/services/${this.$route.params.id}/${currentData._id}`
        );
        this.clientServices.splice(this.deleteIndex, 1);
        this.closeModal();
        this.alertToggle({
          message: "Services are deleted",
          isShow: true,
          type: "success"
        });
      } catch (err) {
        this.alertToggle({
          message: "Error in save Services",
          isShow: true,
          type: "error"
        });
      }
    },

    addData() {
      if (this.currentActive !== -1) {
        return this.isEditing();
      }
      this.clientServices.push({
        sourceLanguage: "",
        targetLanguages: [],
        services: [],
        industries: []
      });
      this.setEditingData(this.clientServices.length - 1);
    },

    closeErrors() {
      this.areErrors = false;
    },

    setSource({ option }) {
      this.currentSource = this.languages.find(item => item.lang === option);
    },

    async getClientInfo() {
      if (!this.currentClient._id) {
        const client = await this.$http.get(
          `/clientsapi/client?id=${this.$route.params.id}`
        );
        this.clientServices = client.body.services;
      } else {
        this.clientServices = this.currentClient.services;
      }
    }
  },
  computed: {
    ...mapGetters({
      currentClient: "getCurrentClient"
    }),
    selectedTargets() {
      return this.currentTargets.length
        ? this.currentTargets.map(item => item.lang)
        : [];
    }
  },
  created() {
    this.getClientInfo();
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

.clientService {
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
