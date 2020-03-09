<template lang="pug">
.documents 
    .documents__table
        SettingsTable(
            :fields="fields"
            :tableData="documentsData"
            :errors="errors"
            :areErrors="areErrors" 
            :isApproveModal="isDeleting" 
            @closeErrors="closeErrors"
            @approve="deleteData"
            @notApprove="setDefaults"
            @closeModal="setDefaults"
        )

            template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
                .documents__head-title {{ field.label }}

            template(slot="fileName" slot-scope="{ row, index }")
                .documents__data(v-if="currentActive !== index")
                    a(href="/static/example.xlsx") {{row.fileName}}
                .documents__editing-data(v-else) 
                    input.documents__input(type="text" readonly :value="row.fileName")

            template(slot="category" slot-scope="{ row, index }") 
                .documents__data(v-if="currentActive !== index") {{row.category}}
                .documents__drop-menu(v-else)
                    SelectSingle(
                        :isTableDropMenu="isTableDropMenu"
                        placeholder="Select"
                        :selectedOption="currentCategory.category"
                        :options="categoryData"
                        @chooseOption="setCategory"
                        @scrollDrop="scrollDrop"
                    )

            template(slot="icons" slot-scope="{ row, index }") 
                .documents__icons
                    img.documents__icon(v-if="!row.fileName" src="../../assets/images/Reject-icon.png")
                    img.documents__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'documents_opacity': isActive(key, index)}")
                    .documents__upload
                        input.documents__load-file(type="file" @change="uploadDocument(index)" )
            
    Add(@add="addData")
</template>
<script>
import SettingsTable from "./SettingsTable";
import { mapGetters, mapActions } from "vuex";
import SelectSingle from "../SelectSingle";
import Add from "../Add";
import scrollDrop from "@/mixins/scrollDrop";
import crudIcons from "@/mixins/crudIcons";

export default {
  mixins: [scrollDrop, crudIcons],
  props: {
    documentsData: {
      type: Array
    }
  },
  data() {
    return {
      fields: [
        {
          label: "File Name",
          headerKey: "headerFileName",
          key: "fileName",
          width: "40%",
          padding: "0"
        },
        {
          label: "Category",
          headerKey: "headerCategory",
          key: "category",
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

      currentCategory: "",
      currentFileName: [],
      imageData: "",

      areErrors: false,
      errors: [],
      isDeleting: false,
      deleteIndex: -1,
      isTableDropMenu: true,
      currentActive: -1
    };
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
      storeDocuments: "storeCurrentVendorDocuments",
      deleteDocuments: "deleteCurrentVendorDocuments"
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
          this.manageCancelEdition(index);
          break;
        case "delete":
          this.manageDeleteClick(index);
          break;
        case "save":
          await this.manageSaveClick(index);
          break;
        default:
          await this.checkErrors(index);
      }
    },

    setEditingData(index) {
      this.currentActive = index;
      this.currentCategory = {
        category: this.documentsData[index].category
      };
    },

    manageCancelEdition(index) {
      if (this.documentsData[index]._id == undefined) {
        this.documentsData.splice(index, 1);
      }
      this.setDefaults();
    },
    setDefaults() {
      this.currentActive = -1;
      this.isDeleting = false;
      this.category = [
        { category: "NDA" },
        { category: "Contact" },
        { category: "Resume" }
      ];
    },
    addData() {
      if (this.currentActive !== -1) {
        return this.isEditing();
      }
      this.documentsData.push({
        category: "",
        fileName: ""
      });
      this.setEditingData(this.documentsData.length - 1);
    },

    getDocuments() {
      this.documentsData = this.currentVendorDocuments;
    },
    uploadDocument(id) {
      this.currentFileName.push({
        fileName: event.target.files[0].name,
        id: id
      });
    },

    requiredFields() {
      if (this.currentActive === -1) return;
      this.errors = [];
      if (!this.currentCategory.category)
        this.errors.push("Category should not be empty!");
      if (this.errors.length) {
        this.areErrors = true;
        return;
      }
    },
    async manageSaveClick(index) {
      this.requiredFields();
      if (this.currentActive == index) {
        if (!this.areErrors) {
          let file = this.currentFileName.filter(value => value.id === index);
          const obj = {
            _id: index,
            fileName:
              file[file.length - 1] == undefined
                ? ""
                : file[file.length - 1].fileName,
            category: this.currentCategory.category
          };
          try {
            const result = await this.storeDocuments(obj);
            this.alertToggle({
              message: "Document saved",
              isShow: true,
              type: "success"
            });
          } catch (err) {
            this.alertToggle({
              message: err.message,
              isShow: true,
              type: "error"
            });
          }
          this.setDefaults();
          this.getDocuments();
        }
      }
    },

    async manageDeleteClick(index) {
      if (this.documentsData[index]._id == undefined) {
        this.documentsData.splice(index, 1);
        return this.setDefaults();
      }
      this.deleteIndex = index;
      this.isDeleting = true;
    },

    async deleteData() {
      const id = this.documentsData[this.deleteIndex]._id;
      try {
        await this.deleteDocuments(id);
        this.alertToggle({
          message: "Document removed",
          isShow: true,
          type: "success"
        });
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" });
      }
      this.setDefaults();
      this.getDocuments();
    },

    closeErrors() {
      this.areErrors = false;
    },

    getCategory() {
      this.category = [
        { category: "NDA" },
        { category: "Contact" },
        { category: "Resume" }
      ];
    },
    setCategory({ option }) {
      this.currentCategory = this.category.find(
        item => item.category === option
      );
    }
  },
  computed: {
    ...mapGetters({
      currentVendorDocuments: "getCurrentVendorDocuments"
    }),
    categoryData() {
      return this.category.map(item => item.category);
    }
  },
  mounted() {
    this.getCategory();
  },
  components: {
    SettingsTable,
    SelectSingle,
    Add
  }
};
</script>
<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";
@import "../../assets/styles/settingsTable";

.documents {
  @extend %setting-table;
  margin: 20px 10px 40px;
  width: 960px;
  box-shadow: 0 0 15px #67573e9d;

  &__table {
    width: 550px;
  }

  &__upload {
    position: relative;
    background: url("../../assets/images/Other/upload-icon.png");
    background-position: center;
    background-repeat: no-repeat;
    height: 30px;
    width: 18px;
    overflow: hidden;
  }
  &__load-file {
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    opacity: 0;
    z-index: 2;
    position: absolute;
    cursor: pointer;
    font-size: 0;
  }
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
  &__input {
    @extend %table-text-input;
  }
  &__icons {
    @extend %table-icons;
    height: 32px;
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
}
</style>