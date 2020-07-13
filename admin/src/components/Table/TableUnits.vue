<template lang="pug">
.units
    .units__table
        SettingsTable(
            :fields="fields"
            :tableData="units"
            :errors="errors"
            :areErrors="areErrors"
            :isApproveModal="isDeleting"
            @closeErrors="closeErrors"
            @approve="deleteUnit"
            @closeModal="cancel"
            @notApprove="cancel"
        )
            template(slot="headerUnit" slot-scope="{ field }")
                .units__header {{ field.label }}
            template(slot="headerSteps" slot-scope="{ field }")
                .units__header {{ field.label }}
            template(slot="headerSizes" slot-scope="{ field }")
                .units__header {{ field.label }}
            template(slot="headerActive" slot-scope="{ field }")
                .units__header {{ field.label }}
            template(slot="headerIcons" slot-scope="{ field }")
                .units__header {{ field.label }}

            template(slot="unit" slot-scope="{ row, index }")
                .units__data(v-if="currentActive !== index") {{ row.type }}
                .units__editing-data(v-else)
                    input.units__input(type="text" v-model="currentUnit")

            template(slot="steps" slot-scope="{ row, index }")
                .units__data(v-if="currentActive !== index") {{ presentServices(row.steps) }}
                .units__drop-menu(v-else)
                    SelectMulti(
                        :isTableDropMenu="isTableDropMenu"
                        placeholder="Select"
                        :hasSearch="true"
                        :options="serviceData"
                        :selectedOptions="selectedServices"
                        @chooseOptions="setServices"
                    )

            template(slot="sizes" slot-scope="{ row, index }")
                .units__data-chips(v-if="currentActive !== index" v-html="formatSizes(row.sizes)")
                .units__editing-chips(v-else)
                      Chips(
                        :chips="currentSizes"
                        @setChips="setChips"
                        @deleteChips="deleteChips"
                        :placeholder="'Add size...'"
                      )

            template(slot="active" slot-scope="{ row, index }")
                .units__data.units_centered(:class="{'units_active': currentActive === index}")
                    img.units__checkbox(v-if="row.active" src="../../assets/images/selected-checkbox.png" @click="toggleActive(index)" :class="{'units_opacity': currentActive === index}")
                    img.units__checkbox(v-else src="../../assets/images/unselected-checkbox.png" @click="toggleActive(index)" :class="{'units_opacity': currentActive === index}")

            template(slot="icons" slot-scope="{ row, index }")
                .units__icons
                    img.units__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'units_opacity': isActive(key, index)}")
    Add(@add="addUnit")
</template>

<script>
import SettingsTable from "./SettingsTable";
import Chips from "../Chips";
import Add from "../Add";
import { mapGetters, mapActions } from "vuex";
import crudIcons from "@/mixins/crudIcons";
import SelectMulti from "../SelectMulti";

export default {
  mixins: [crudIcons],
  data() {
    return {
      fields: [
        {
          label: "Unit",
          headerKey: "headerUnit",
          key: "unit",
          width: "14%",
          padding: "0"
        },
        {
          label: "Steps",
          headerKey: "headerSteps",
          key: "steps",
          width: "32%",
          padding: "0"
        },
        {
          label: "Sizes",
          headerKey: "headerSizes",
          key: "sizes",
          width: "32%",
          padding: "0"
        },
        {
          label: "Active",
          headerKey: "headerActive",
          key: "active",
          width: "8%",
          padding: "0"
        },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          width: "14%",
          padding: "0"
        }
      ],
      steps: [],
      currentServices: [],
      currentSizes: [],
      units: [],
      oldUnits: [],
      currentUnit: "",
      areErrors: false,
      errors: [],
      isDeleting: false,
      deleteIndex: -1,
      currentActive: -1,
      isTableDropMenu: true
    };
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle"
    }),
    setChips({ data }) {
      this.currentSizes.push(data);
    },
    deleteChips({ index }) {
      this.currentSizes.splice(index, 1);
    },
    formatSizes(array) {
      let sizes = "";
      array.forEach(element => {
        sizes += `<span style="display:inline-flex;padding:0 10px;height:20px;font-size:14px;line-height:20px;border-radius:8px;margin-right:5px;border:1px solid #67573e" class="test">${element}</span>`;
      });
      return sizes;
    },
    presentServices(services) {
      if (!services.length) return "";
      return services.reduce((acc, cur) => acc + `${cur.title}; `, "");
    },
    setServices({ option }) {
      const position = this.selectedServices.indexOf(option);
      if (position !== -1) {
        this.currentServices.splice(position, 1);
      } else {
        const title = this.steps.find(item => item.title === option);
        this.currentServices.push(title);
      }
    },
    async getServices() {
      try {
        const result = await this.$http.get("/api/steps");
        this.steps = result.body;
      } catch (err) {
        this.alertToggle({
          message: "Error on getting Services",
          isShow: true,
          type: "error"
        });
      }
    },
    async getUnits() {
      try {
        const result = await this.$http.get("/api/units");
        this.units = result.body;
      } catch (err) {
        this.alertToggle({
          message: "Error on getting Units",
          isShow: true,
          type: "error"
        });
      }
    },
    toggleActive(index) {
      if (this.currentActive !== index) return;
      this.units[index].active = !this.units[index].active;
    },
    addUnit() {
      if (this.currentActive !== -1) {
        return this.isEditing();
      }
      this.currentServices = [];
      this.units.push({
        active: true,
        type: "",
        editable: true,
        sizes: []
      });
      this.setEditionData(this.units.length - 1);
    },
    setEditionData(index) {
      this.currentActive = index;
      this.currentSizes = this.units[index].sizes;
      this.currentUnit = this.units[index].type;
      this.currentServices = Array.from(this.units[index].steps);
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
        await this.getUnits();
      }
      if (key === "delete") {
        if (!this.units[index]._id) {
          this.units.splice(index, 1);
          return this.cancel();
        }
        this.deleteIndex = index;
        this.isDeleting = true;
      }
    },
    async saveChangesConst(index) {
      this.errors = [];
      const id = this.units[index]._id;
      let oldUnit = this.oldUnits[index];
      try {
        const result = await this.$http.post("/api/units", {
          unit: {
            _id: id,
            type: this.units[index].type,
            active: true,
            steps: this.currentServices,
            sizes: this.currentSizes
          }
        });
        this.alertToggle({
          message: "Saved only Steps",
          isShow: true,
          type: "success"
        });
        this.getUnits();
        if(result.data !== 'Updated'){
          await this.$http.post('/pricelists/add-new-multiplier', {
            key: 'Unit',
            id: result.data,
          });
        }else{
          await this.$http.post('/pricelists/update-multiplier', {
            key: 'Unit',
            oldMultiplier: oldUnit,
          });
          await this.$http.post('/clientsapi/rates', {
            key: 'Unit',
            oldMultiplier: oldUnit,
          });
          this.getOldData();
        }
      } catch (error) {
        this.alertToggle({
          message: "Error on saving Unit Steps info",
          isShow: true,
          type: "error"
        });
      }
    },
    async saveChanges(index) {
      this.errors = [];
      const id = this.units[index]._id;
      let oldUnit = this.oldUnits[index];
      try {
        const result = await this.$http.post("/api/units", {
          unit: {
            _id: id,
            type: this.currentUnit,
            active: this.units[index].active,
            steps: this.currentServices,
            sizes: this.currentSizes
          }
        });
        this.alertToggle({ message: "Saved", isShow: true, type: "success" });
        this.getUnits();
        if(result.data !== 'Updated'){
          await this.$http.post('/pricelists/add-new-multiplier', {
            key: 'Unit',
            id: result.data,
          });
        }else {
          await this.$http.post('/pricelists/update-multiplier', {
            key: 'Unit',
            oldMultiplier: oldUnit,
          });
          await this.$http.post('/clientsapi/rates', {
            key: 'Unit',
            oldMultiplier: oldUnit,
          });
          this.getOldData();
        }
      } catch (error) {
        this.alertToggle({
          message: "Error on saving Unit info",
          isShow: true,
          type: "error"
        });
      }
    },
    cancel() {
      this.currentActive = -1;
      this.isDeleting = false;
    },
    async checkErrors(index) {
      if (this.currentActive === -1) return;
      const editable = this.units[index].editable;
      this.errors = [];
      if (!this.currentUnit || !this.isUnique(index))
        this.errors.push("Unit should not be empty and be unique!");
      if(this.currentSizes.map(item => Math.sign(item)).includes(NaN))
        this.errors.push("Size should be number!");
      if(this.currentSizes.map(item => item == '').includes(true))
        this.errors.push("Size cannot be empty!");
      if(this.currentSizes.filter( (item, index, array) => index !== array.indexOf(item) || index !== array.lastIndexOf(item)).length)
        this.errors.push("Size should be unique!");
      if (this.errors.length) {
        this.areErrors = true;
        return;
      }
      if (!editable) {
        await this.saveChangesConst(index);
      } else {
        await this.saveChanges(index);
      }
      this.cancel();
    },
    async deleteUnit() {
      const index = this.deleteIndex;
      const id = this.units[index]._id;
      const editable = this.units[index].editable;
      if (!editable) {
        this.alertToggle({
          message: "This Unit cannot be deleted.",
          isShow: true,
          type: "error"
        });
        return;
      }
      try {
        await this.$http.delete(`/api/units/${id}`);
        this.alertToggle({
          message: "Unit removed",
          isShow: true,
          type: "success"
        });
      } catch (err) {
        this.alertToggle({
          message: "Error on removing Unit",
          isShow: true,
          type: "error"
        });
      }
      this.cancel();
      this.getUnits();
    },
    async getOldData() {
      try {
        const result = await this.$http.get("/api/units");
        this.oldUnits = result.body;
      } catch (err) {
        this.alertToggle({
          message: "Error on getting Units",
          isShow: true,
          type: "error"
        });
      }
    },
    isUnique(index) {
      const duplicateIndex = this.units.findIndex((item, ind) => {
        if (
          index !== ind &&
          item.type.toLowerCase() === this.currentUnit.toLowerCase().trim()
        ) {
          return item;
        }
      });
      return duplicateIndex === -1;
    }
  },
  computed: {
    serviceData() {
      return this.steps.map(item => item.title);
    },
    selectedServices() {
        return this.currentServices.length
          ? this.currentServices.map(item => item.title)
          : [];
    }
  },
  components: {
    SettingsTable,
    Add,
    SelectMulti,
    Chips
  },
  async created() {
    await this.getOldData()
  },
  mounted() {
    this.getUnits();
    this.getServices();
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";
@import "../../assets/styles/settingsTable";

.units {
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
    background: url("../../assets/images/Other/upload-icon.png");
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
