<template lang="pug">
.documents
    .documents__table
        SettingsTable(
            :fields="fields"
            :tableData="documentsData"
            :errors="errors"
            :areErrors="areErrors" 
            :isApproveModal="isDeleting" 
        )

            template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
                .documents__head-title  {{ field.label }}

            template(slot="fileName" slot-scope="{ row, index }")
                .documents__data {{ documentsData[index].file.name  }}

            template(slot="category" slot-scope="{ row, index }") 
                .documents__data {{row.category}}

            template(slot="icons" slot-scope="{ row, index }") 
                .documents__icons
                    img.documents__icon(v-if="!documentsData[index].file.name" :style="{cursor: 'default'}" :class="'documents_opacity'" src="../../assets/images/red-info-icon.png")
                    .documents__upload
                        input.documents__load-file(type="file" :ref="'file' + (index)" @change="uploadDocument(index)")

</template>
<script>
import SettingsTable from "../Table/SettingsTable";
import SelectSingle from "../SelectSingle";
import Add from "../Add";
import crudIcons from "@/mixins/crudIcons";
import { mapGetters, mapActions } from "vuex";

export default {
  mixins: [crudIcons],
  props: {},
  data() {
    return {
      fields: [
        {
          label: "File Name",
          headerKey: "headerFileName",
          key: "fileName",
          width: "64%",
          padding: "0"
        },
        {
          label: "Category",
          headerKey: "headerCategory",
          key: "category",
          width: "18%",
          padding: "0"
        },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          width: "18%",
          padding: "0"
        }
      ],
      documentsData: [
        { file: "", category: "NDA" },
        { file: "", category: "Contract" }
      ],
    };
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
      storeClientProperty: "storeClientProperty"
    }),
    uploadDocument(index) {
      let key = 'file' + (index);
      this.documentsData[index].file = this.$refs[key].files[0]
      this.$emit('uploadFiles', this.documentsData)
    },
  },
  components: {
    SettingsTable,
    SelectSingle,
    Add
  },
};
</script>
<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";
@import "../../assets/styles/settingsTable";

.documents {
  &__upload {
    position: relative;
    background: url("../../assets/images/Other/upload-icon.png");
    background-position: center;
    background-repeat: no-repeat;
    height: 30px;
    width: 18px;
    overflow: hidden;
    margin-right: 8px;
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
    &-half {
      opacity: 0.5;
    }
  }
}
</style>