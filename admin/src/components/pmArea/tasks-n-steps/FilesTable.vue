<template lang="pug">
  div
    .files-table
      DataTable(
       :fields="fields"
       :tableData="allFiles"
       :hasScroll="hasScroll"
       bodyClass="all-projects"
       bodyRowClass="files-table-row-class"
      )
        template(slot="headerFile" slot-scope="{ field }")
          .files-table__checkbox
            input.files-table__check-input(type="checkbox")
        template(slot="headerFileName" slot-scope="{ field }")
          .files-table__label {{ field.label }}
        template(slot="headerType" slot-scope="{ field }")
          .files-table__label {{ field.label }}
        template(slot="headerActions" slot-scope="{ field }")
          .files-table__label {{ field.label }}
        template(slot="fileId" slot-scope="{ row, index }")
          .files-table__data.files-table_padding-left-10
            input.files-table__check-input(type="checkbox" @change="onCheckBoxChanged(row,index)" :checked="row.isApproved")
        template(slot="fileName" slot-scope="{ row, index }")
          .files-table__data.files-table_relative
            img(src="../../../assets/images/file_icon.png" alt="")
            span.files-table__name {{ row.fileName }}
                span.files-table__full-name {{ row.fileName }}
        template(slot="type" slot-scope="{ row }")
          .files-table__data {{ row.type }}
        template(slot="actions" slot-scope="{ row, index }")
          .files-table__icons
            img.files-table__icon(@click.stop="makeAction(key, row, index)" v-for="(icon, key) in icons" :src="icon.icon")
            i.files-table__check-icon.fa.fa-check-circle(:class="{'files-table_green': row.isApproved}")
    Add(@add="addFile")
</template>

<script>
  import DataTable from "@/components/DataTable";
  import Add from "@/components/Add";
  import { mapGetters, mapActions } from "vuex";

  export default {
    data() {
      return {
        fields: [
          {label: "", headerKey: "headerFile", key: "fileId", width: "8%", padding: 0},
          {label: "File Name", headerKey: "headerFileName", key: "fileName", width: "40%", padding: 0},
          {label: "Type", headerKey: "headerType", key: "type", width: "25%", padding: 0},
          {label: "", headerKey: "headerActions", key: "actions", width: "27%", padding: 0},
        ],
        icons: {
          download: {icon: require('../../../assets/images/Other/Download-icon.png')},
          upload: {icon: require('../../../assets/images/Other/upload-icon.png')},
          trash: {icon: require('../../../assets/images/Other/delete-icon-qa-form.png')},
        },
        allFiles:[],
        showIndex: -1
      }
    },
    methods: {
      makeAction(key, row, index) {
      },
      addFile() {
      },
      onCheckBoxChanged(row,index) {
      },
      clientName(elem) {
        return elem.name;
      },
      projectLangs(arr) {
        return arr.reduce((init, cur) => {
          return init + cur.sourceLanguage + ' >> ' + cur.targetLanguage + '; '
        }, "")
      },
      edit() {
      },
      parseFilesToArray() {
        const sourceFiles = this.currentProject.sourceFiles.map(item => {
            item.type = "Source File";
            return item;
        })
        const refFiles = this.currentProject.refFiles.length ? this.currentProject.refFiles.map(item => {
            item.type = "Reference File";
            return item;
        }) : [];
        this.allFiles.push(...sourceFiles, ...refFiles);
      }
    },
    computed: {
      ...mapGetters({
        currentProject: 'getCurrentProject',
      }),
      hasScroll() {
        return document.body.offsetWidth > 1024 && this.allFiles.length > 3;
      }
    },
    mounted() {
      this.parseFilesToArray();
    },
    components: {
      DataTable,
      Add
    }
  }
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

  .files-table {
    &__data, &__icons {
        height: 30px;
        box-sizing: border-box;
        padding: 0 5px;
        display: flex;
        align-items: center;
    }
    &__icons {
        justify-content: space-around;
        width: 90%;
    }
    &__file-icon{
        margin-right: 5px;
    }
    &__name {
        &:hover {
            position: relative;
            .files-table__full-name {
                display: block;
                z-index: 5;
            }
        }
    }
    &__full-name {
        position: absolute;
        background-color: $white;
        padding: 3px;
        display: none;
        max-width: 400px;
        top: -3px;
        left: 0;
        z-index: -1
    }
    &__checkbox {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    &__check-input {
        width: 18px;
        height: 18px;
    }
    &__label {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    &__check-icon {
        font-size: 16px;
        color: $light-brown;
        cursor: pointer;
    }
    &_padding-left-10 {
        padding-left: 10px;
    }
    &_green {
        color: $green-approve;
    }
  }
  .add-row {
    margin: 10px 0;
    &__plus {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      border: 1px solid #BFB09D;
      span {
        font-size: 28px;
        color: #BFB09D;
        opacity: .7;
      }
    }
  }
</style>
