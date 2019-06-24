<template lang="pug">
  div
    .files-table
      DataTable(
       :fields="fields"
       :tableData="finalFilesArray"
       :hasScroll="hasScroll"
       bodyClass="all-projects"
       bodyRowClass="files-table-row-class"
      )
        template(slot="headerFile" slot-scope="{ field }")
          input.files-table__input-checkbox-inside-cell(type="checkbox" disabled=true)
        template(slot="headerFileName" slot-scope="{ field }")
          span.files-table__label {{ field.label }}
        template(slot="headerType" slot-scope="{ field }")
          span.files-table__label {{ field.label }}
        template(slot="headerActions" slot-scope="{ field }")
          span.files-table__label {{ field.label }}
        template(slot="fileId" slot-scope="{ row, index }")
          input.files-table__input-checkbox-inside-cell(type="checkbox" @change="onCheckBoxChanged(row,index)")
        template(slot="fileName" slot-scope="{ row }")
          span.files-table__file-icon
            img(src="../../../assets/images/file_icon.png" alt="")
          span {{ row.fileName }}
        template(slot="fileType" slot-scope="{ row }")
          span {{ row.fileType }}
        template(slot="actions" slot-scope="{ row, index }")
          span.files-table__icons
            img.files-table__icon(@click.stop="makeAction(key, row, index)" v-for="(icon, key) in icons" :src="icon.icon")
    .add-row
      .add-row__plus(@click="addNewRow")
        span +
</template>

<script>
  import DataTable from "../../DataTable";
  import { mapGetters, mapActions } from "vuex";

  export default {
    data() {
      return {
        fields: [
          {label: "", headerKey: "headerFile", key: "fileId", width: "10%"},
          {label: "File Name", headerKey: "headerFileName", key: "fileName", width: "30%", cellClass:"flex-content"},
          {label: "Type", headerKey: "headerType", key: "fileType", width: "25%", cellClass:"flex-content"},
          {label: "", headerKey: "headerActions", key: "actions", width: "35%"},
        ],
        icons: {
          download: {icon: require('../../../assets/images/Other/Download-icon.png')},
          upload: {icon: require('../../../assets/images/Other/upload-icon.png')},
          trash: {icon: require('../../../assets/images/Other/delete-icon-qa-form.png')},
          checked: {icon: require('../../../assets/images/white-check-png-1.png')},
        },
        finalFilesArray:[]
      }
    },
    methods: {
      makeAction(key, row, index) {
      },
      addNewRow() {
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
      }
    },
    computed: {
      ...mapGetters({
        currentProject: 'getCurrentProject',
      }),
      hasScroll() {
        return document.body.offsetWidth > 1024 && this.finalFilesArray.length > 3;
      }
    },
    mounted() {
      let mediumFileArray = [];
      this.currentProject.sourceFiles.map((el)=>{
        const sourceFileName = el.split('/')[4];
        mediumFileArray.push({fileName:sourceFileName, fileType:'Source file'})
      });
       this.finalFilesArray = [...mediumFileArray];
       mediumFileArray = [];
      this.currentProject.refFiles.map((el)=>{
        const sourceFileName = el.split('/')[4];
        mediumFileArray.push({fileName:sourceFileName, fileType:'Reference file'})
      });
      this.finalFilesArray = [...this.finalFilesArray,...mediumFileArray];

    },
    components: {
      DataTable
    }
  }
</script>

<style lang="scss" scoped>
  .files-table {
    min-height: 121px;
    &__icon {
      height: 17px;
      margin: 0 10px;
    }
    &__file-icon{
      margin: 0 10px;
    }
    &__input-checkbox-inside-cell{
      width: 20px;
      height: 20px;
      position: relative;
      left: 9px;
    }
    &__label {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
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
