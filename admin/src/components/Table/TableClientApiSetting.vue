<template lang="pug">
  .client-api
    .client-api__table
      SettingsTable(
        :fields="fields"
        :tableData="clientApi"

      )
        template(slot="headerLogo" slot-scope="{ field }")
          .client-api__header {{ field.label }}
        template(slot="headerAffiliation" slot-scope="{ field }")
          .client-api__header {{ field.label }}
        template(slot="headerClientName" slot-scope="{ field }")
          .client-api__header {{ field.label }}
        template(slot="headerIndustry" slot-scope="{ field }")
          .client-api__header {{ field.label }}
        template(slot="headerDisplay" slot-scope="{ field }")
          .client-api__header {{ field.label }}
        template(slot="headerIcons" slot-scope="{ field }")
          .client-api__header {{ field.label }}

        template(slot="logo" slot-scope="{ row, index }")
          .client-api__data.client-api_centered(:class="activeClasses(index)")
            img.client-api__main-icon(v-if="row.logo" :src="row.logo")
            .client-api__upload(v-if="currentActive === index" :class="{'client-api_no-back': imageData}")
              input.client-api__load-file(type="file" @change="uploadIcon")
              img.client-api__file-preview(v-if="imageData" :src="imageData")

        template(slot="affiliation" slot-scope="{ row, index }")
          .client-api__data(v-if="currentActive !== index") {{ row.affiliation }}
          .client-api__drop-menu(v-else)
            SelectSingle(
              :isTableDropMenu="isTableDropMenu"
              placeholder="Select"
              :options="affiliationData"
              :selectedOption="selectedAffiliation"
              @chooseOption="setAffiliation"
              :allOptionsButtons="true"
            )

        template(slot="clientName" slot-scope="{ row, index }")
          .client-api__data(v-if="currentActive !== index") {{ presentServices(row.clientName) }}
          .client-api__drop-menu(v-else-if="selectedAffiliation === 'System'")
            SelectSingle(
              :isTableDropMenu="isTableDropMenu"
              placeholder="Select"
              :hasSearch="true"
              :options="allClients.map(({name}) =>  name)"
              :selectedOption="selectedClients"
              @chooseOption="setClientName"
              :allOptionsButtons="true"
            )
          .client-api__editing-data(v-else)
            input.client-api__input(type="text" v-model="clientName")


        template(slot="industry" slot-scope="{ row, index }")
          .client-api__data(v-if="currentActive !== index") {{ presentServices(row.industry) }}
          .client-api__drop-menu(v-else)
            SelectMulti(
              placeholder="Select"
              :hasSearch="true"
              :options="getIndustry.map(({ name }) => name)"
              :selectedOptions="selectedIndustry"
              :isTableDropMenu="isTableDropMenu"
              @chooseOptions="choseIndustries"
            )

        template(slot="display" slot-scope="{ row, index }")
          .client-api__data.client-api_centered(:class="{'client-api_active': currentActive === index}")
            img.client-api__checkbox(v-if="row.isDisplay" src="../../assets/images/selected-checkbox.png" @click="toggleActive(index)" :class="{'client-api_opacity': currentActive === index}")
            img.client-api__checkbox(v-else src="../../assets/images/unselected-checkbox.png" @click="toggleActive(index)" :class="{'client-api_opacity': currentActive === index}")

        template(slot="icons" slot-scope="{ row, index }")
          .client-api__icons
            img.client-api__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'client-api_opacity': isActive(key, index)}")

    Add(@add="addClientApi")
</template>

<script>
import SettingsTable from "./SettingsTable";
import Add from "../Add";
import { mapGetters, mapActions } from "vuex";
import SelectSingle from "../SelectSingle"
import crudIcons from "@/mixins/crudIcons";
import SelectMulti from "../SelectMulti";

export default {
  mixins: [crudIcons],
  data() {
    return {
      fields: [
        {
          label: "Logo",
          headerKey: "headerLogo",
          key: "logo",
          width: "10%",
          padding: "0",
        },
        {
          label: "Affiliation",
          headerKey: "headerAffiliation",
          key: "affiliation",
          width: "15%",
          padding: "0",
        },
        {
          label: "Client Name",
          headerKey: "headerClientName",
          key: "clientName",
          width: "35%",
          padding: "0",
        },
        {
          label: "Industry",
          headerKey: "headerIndustry",
          key: "industry",
          width: "26%",
          padding: "0",
        },
        {
          label: "HP display",
          headerKey: "headerDisplay",
          key: "display",
          width: "10%",
          padding: "0",
        },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          width: "14%",
          padding: "0",
        },
      ],
      clientApi: [],
      currentServices: [],
      selectedAffiliation: "Input",
      selectedIndustry: [],
      clients: [],
      selectedClients: "",
      iconFile: [],
      imageData: "",
      currentClientApi: "",
      currentActive: -1,
      isTableDropMenu: true,
      affiliationData: ['Input', 'System'],
    };
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
    }),
    getClientsApi() {

    },
    activeClasses(index) {
      return this.currentActive === index ? 'client-api_active client-api_flex' : "";
    },
    setAffiliation({ option }) {
      this.selectedAffiliation = option
      this.selectedIndustry = []
      this.selectedClients = ""
    },
    setClientName({ option }) {
      this.selectedClients = option
      this.selectedIndustry = []
    },
    async getAllClients() {
      let result = await this.$http.post('/api-settings/all-clients');
      console.log({ test: result.data })
      this.allClients = result.data
    },
    uploadIcon(event) {
      this.iconFile.push(event.target.files[0])
      const input = event.target
      if (input.files && input.files[0]) {
        let reader = new FileReader()
        reader.onload = (e) => {
          this.imageData = e.target.result
        }
        reader.readAsDataURL(input.files[0])
      }
    },
    choseIndustries({ option }) {
      const position = this.selectedIndustry.indexOf(option);
      if (position !== -1) {
        this.selectedIndustry.splice(position, 1);
      } else {
        this.selectedIndustry.push(option);
      }
    },
    presentServices(services) {
      if (!services.length) return "";
      return services.reduce((acc, cur) => acc + `${cur.title}; `, "");
    },
    toggleActive(index) {
      if (this.currentActive !== index) return;
      this.clientApi[index].isDisplay = !this.clientApi[index].isDisplay;
    },
    addClientApi() {
      if (this.currentActive !== -1) {
        return this.isEditing();
      }
      this.currentServices = [];
      this.clientApi.push({
        logo: "",
        affiliation: "",
        clientName: "",
        industry: [],
        isDisplay: true,

      });
      this.setEditionData(this.clientApi.length - 1);
    },
    setEditionData(index) {
      this.currentActive = index;
      // this.currentSizes = this.clientApi[index].sizes;
      this.currentClientApi = this.clientApi[index].type;
      this.currentServices = Array.from(this.clientApi[index].steps);
    },
    closeErrors() {
      this.areErrors = false;
    },
    async makeAction(index, key) {
      if (this.currentActive !== -1 && this.currentActive !== index) {
        return this.isEditing();
      }
      if (key === "save") {
        await this.checkErrors(index);
      }
      if (key === "edit") {
        this.setEditionData(index);
      }
      if (key === "cancel") {
        if (this.currentActive === -1) return;
        this.cancel();
        await this.getClientsApi();
      }
      if (key === "delete") {
        if (!this.clientApi[index]._id) {
          this.clientApi.splice(index, 1);
          return this.cancel();
        }
        this.deleteIndex = index;
        this.isDeleting = true;
      }
    },
    async saveChanges(index) {

      const id = this.industries[index]._id;
      const newData = this.collectData(index);
      try {
        if(!id) {
          await this.createNew(newData);
        } else {
          await this.updateClientApi(id, newData, index);
        }
        await this.getIndustries();
        this.alertToggle({ message: "Saved", isShow: true, type: "success" });

      } catch (error) {
        this.alertToggle({
          message: "Error on saving Unit info",
          isShow: true,
          type: "error",
        });
      }
    },
    collectData(index) {
      const newData = new FormData();
      newData.append("logo", this.imageData[0]);
      newData.append("affiliation", this.selectedAffiliation);
      newData.append("clientName", this.selectedClients);
      newData.append("industry", this.selectedIndustry);
      newData.append("isDisplay", this.allClients[index].isDisplay);
      return newData;
    },
    async createNew(newData) {
      try {
        const result = await this.$http.post(`/api-settings/clients-api-setting/new`, newData);
        this.clientApi = result.data.clientsApi
      } catch (err) {
        this.alertToggle({ message: "Error on saving Industry info", isShow: true, type: "error" });
      }
    },
    async updateClientApi(id, newData, index) {
      const oldIndustry = this.industries[index];
      oldIndustry.active = !oldIndustry.active;
      try {
        await this.$http.post(`/api-settings/clients-api-setting/${ id }`, newData);

      } catch (err) {
        this.alertToggle({ message: "Error on saving Industry info", isShow: true, type: "error" });
      }
    },
    cancel() {
      this.currentActive = -1;
      this.isDeleting = false;
    },
    async checkErrors(index) {

      this.saveChanges()
    },

  },
  computed: {
    ...mapGetters({
      industries: "getAllIndustries",
    }),

    getIndustry() {
      if(this.selectedClients.length > 0 && this.selectedAffiliation === 'System') {
        return this.allClients.filter(({ name }) => name === this.selectedClients)[0].industries
      }
      return this.industries
    }
  },
  components: {
    SelectSingle,
    SettingsTable,
    Add,
    SelectMulti,
  },
  async created() {
  },
  mounted() {
    this.getAllClients()
  },
};
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";
@import "../../assets/styles/settingsTable";

.client-api {
  @extend %setting-table;
  max-width: 1200px;
  width: calc(100% - 100px);
  &__data {
    @extend %table-data;
    overflow-x: hidden;
  }
  &__editing-data {
    @extend %table-data;
    box-shadow: inset 0 0 7px $brown-shadow;
  }
  &__data-chips {
    @extend %table-data;
    overflow-y: hidden;
  }
  &__editing-chips {
    @extend %table-data;
    box-shadow: inset 0 0 7px $brown-shadow;
    overflow-y: hidden;
  }
  &__input {
    @extend %table-text-input;
  }
  &__icons {
    @extend %table-icons;
  }
  &__icon {
    @extend %table-icon;
  }
  &__checkbox {
    width: 22px;
    height: 22px;
    cursor: pointer;
    opacity: 0.5;
  }
  &_centered {
    justify-content: center;
  }
  &_flex {
    display: flex;
    justify-content: space-around;
  }
  &__main-icon,
  &__file-preview {
    width: 22px;
    height: 22px;
  }
  &__link {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 22px;
  }
  &__drop-menu {
    position: relative;
    box-shadow: inset 0 0 7px $brown-shadow;
  }
  &__download {
    cursor: pointer;
    width: 40%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  &_opacity {
    opacity: 1;
  }
  &__upload {
    position: relative;
    background: url("../../../src/assets/images/latest-version/upload-file.png");
    background-position-x: center;
    background-repeat: no-repeat;
    width: 40%;
    height: 22px;
    overflow: hidden;
  }
  &__load-file {
    width: 100%;
    height: 22px;
    border: none;
    outline: none;
    opacity: 0;
    z-index: 2;
    position: absolute;
    left: 6px;
    cursor: pointer;
    font-size: 0;
  }
  &__no-file {
    opacity: 0.5;
  }
  &_no-back {
    background: none;
  }
  &__file-preview {
    margin-left: 10px;
  }
  &_active {
    box-shadow: inset 0 0 8px $brown-shadow;
  }
}
</style>
