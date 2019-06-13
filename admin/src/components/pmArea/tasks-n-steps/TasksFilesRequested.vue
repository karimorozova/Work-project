<template lang="pug">
  .tasks-files
    .tasks-files__header
      .tasks-files__header-name Files:
      .tasks-files__header-action-wrapper
       .tasks-files__header-action File Action:
       .filters__drop-menu
          SelectSingle(
           :selectedOption="fileAction"
           :options="actions"
           placeholder="Select"
           refersTo="fileAction"
           @chooseOption="setValue"
          )
    .tasks-files__table  Table
</template>

<script>
  import FilesUpload from "./tasksFiles/FilesUpload";
  import DataTable from "../../DataTable";
  import SelectSingle from "../../SelectSingle";
  export default {
    props: {
      sourceFiles: {type: Array},
      refFiles: {type: Array},
      isJoinFiles: {type: Boolean}
    },
    data() {
      return {
        actions: ["Delete", "Download", "Approve"],
        fileAction: "",
        isSourceFilesShow: false,
        isRefFilesShow: false,
      }
    },
    methods: {
      setValue({option, refersTo}) {
        this[refersTo] = option;
      },
      uploadSourceFiles({files}) {
        this.$emit('uploadSourceFiles', {files});
      },
      toggleSourceFiles() {
        this.isSourceFilesShow = !this.isSourceFilesShow;
      },
      uploadRefFiles({files}) {
        this.$emit('uploadRefFiles', {files});
      },
      toggleRefFiles() {
        this.isRefFilesShow = !this.isRefFilesShow;
      },
      deleteFile({index}, prop) {
        this.$emit('deleteFile', {index, prop});
      }
    },
    components: {
      FilesUpload,
      DataTable,
      SelectSingle
    }
  };
</script>

<style lang="scss" scoped>

  .tasks-files {
    font-size: 14px;
    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    &__header-action-wrapper {
      display: flex;
      align-items: center;
    }
    &__header-action {
      margin-right: 15px;
    }
  }

</style>
