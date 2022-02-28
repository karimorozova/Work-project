<template lang="pug">
  .table_ref
    GeneralTable(
      :fields="fieldsFiles"
      :tableData="getFiles"
    )
      template(v-for="field in fieldsFiles" :slot="field.headerKey" slot-scope="{ field }")
        .table__header {{ field.label }}

      template(slot="file" slot-scope="{ row, index }")
        .table__data
          .short {{ row.fileName }}
      template(slot="icon" slot-scope="{ row, index }")
        .table__icons(v-if="row.path" @click="download(row.path)")
          .icon
            i(class="fa-solid fa-download")
</template>

<script>
import GeneralTable from "../../general/GeneralTable"

export default {
  name: "ProjectReferenceFiles",
  components: { GeneralTable },
  props: {
    job: {
      type: Object
    }
  },
  data() {
    return {
      fieldsFiles: [
        {
          label: "Reference File",
          headerKey: "h1",
          key: "file",
          style: { width: "89%" }
        },
        {
          label: "",
          headerKey: "h2",
          key: "icon",
          style: { width: "11%" }
        }
      ]
    }
  },
  methods: {
    download(path) {
      let link = document.createElement('a')
      link.href = path
      link.target = "_blank"
      link.click()
    }
  },
  computed: {
    getFiles() {
      if (this.job.refFiles.length) {
        const files = []
        for (const file of this.job.refFiles) {
          files.push({
            fileName: file.split('/').pop(),
            path: this.domain + file.split('./dist')[1]
          })
        }
        return files
      }
      return []
    }
  }
}
</script>

<style lang="scss" scoped>
@import "assets/scss/colors";

.table_ref {
  margin-bottom: 25px;
}

.table {
  width: 740px;
  background-color: white;
  padding: 25px;
  border-radius: 4px;
  background-color: white;
  box-shadow: $box-shadow;
  margin-bottom: 15px;

  &__header {
    padding: 0 0 0 7px;
  }

  &__icons {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 8px;
  }

  &__data {
    padding: 0 7px;
  }
}

.icon {
  font-size: 15px;
  cursor: pointer;
}
</style>