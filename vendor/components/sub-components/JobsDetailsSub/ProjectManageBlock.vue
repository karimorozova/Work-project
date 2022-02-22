<template lang="pug">
  .areas
    .pm-area
      .user(v-if="job.projectManager._id" )
        .user__image
          img(v-if="job.projectManager.photo && !job.projectManager.photo.includes('https://')" :src="domain+job.projectManager.photo")
          .user__fakeImage(:style="{'--bgColor': getBgColor(job.projectManager._id)[0], '--color':getBgColor(job.projectManager._id)[1]  }" v-else) {{ job.projectManager.firstName[0].toUpperCase() }}
        .user__name {{job.projectManager.firstName + ' ' + job.projectManager.lastName || ''}}

        .user__who Project Manager
        a(:href="'mailto:' + job.projectManager.email")
          .user__email
            .email__icon
              i(class="far fa-envelope")
            .email__text Send a message

    .files-area(v-if="job.refFiles.length && (job.status === 'Ready to Start' || job.status === 'In progress')" )
      GeneralTable(
        :fields="fieldsFiles"
        :tableData="getFiles"
      )
        template(v-for="field in fieldsFiles" :slot="field.headerKey" slot-scope="{ field }")
          .table__header {{ field.label }}

        template(slot="file" slot-scope="{ row, index }")
          .table__data {{ row.fileName }}
        template(slot="icon" slot-scope="{ row, index }")
          .table__icons(v-if="row.path" @click="download(row.path)")
            .icon
              i(class="fa-solid fa-download")

    .brief-area(v-if="(job.brief || job.vendorBrief) && (job.status === 'Ready to Start' || job.status === 'In progress')" )
      .brief(v-if="job.brief" )
        .brief-area__title General Instruction
        .brief-area__description(v-html="job.brief")
      .brief(v-if="job.vendorBrief" )
        .brief-area__title Individual Instruction
        .brief-area__description(v-html="job.vendorBrief")


</template>

<script>
import getBgColor from "../../../mixins/getBgColor"
import GeneralTable from "../../general/GeneralTable"

export default {
  name: "ProjectManagerBlock",
  components: { GeneralTable },
  mixins: [ getBgColor ],
  props: {
    job: {
      type: Object
    }
  },
  data() {
    return {
      domain: '',
      fieldsFiles: [
        {
          label: "File",
          headerKey: "h1",
          key: "file",
          style: { width: "70%" }
        },
        {
          label: "",
          headerKey: "h2",
          key: "icon",
          style: { width: "30%" }
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
          let fileName = file.split('/').pop()
          fileName = fileName.length > 16 ? fileName.substr(16, fileName.length) : fileName
          files.push({
            fileName: `Reference - ${ fileName }`,
            path: this.domain + file.split('./dist')[1]
          })
        }
        return files
      }
      return []
    }
  },
  mounted() {
    this.domain = process.env.domain
  }
}
</script>

<style lang="scss" scoped>
@import "assets/scss/colors";

.files-area {
  width: 320px;
  box-sizing: border-box;
  background-color: white;
  border-radius: 4px;
  box-shadow: $box-shadow;
  padding: 25px;
  margin-bottom: 25px;
}

.brief-area {
  width: 320px;
  box-sizing: border-box;
  background-color: white;
  border-radius: 4px;
  box-shadow: $box-shadow;
  padding: 25px 25px 1px 25px;

  &__title {
    text-align: center;
    font-family: Roboto600;
    margin-bottom: 5px;
  }

  &__description {
    border: 1px solid $light-border;
    border-radius: 4px;
    padding: 0px 15px;
    overflow-y: auto;
    max-height: 85px;
    margin-bottom: 25px;
  }
}

.pm-area {
  width: 320px;
  box-sizing: border-box;
  background-color: white;
  border-radius: 4px;
  box-shadow: $box-shadow;
  padding: 25px;
  margin-bottom: 25px;
}

.user {
  display: flex;
  flex-direction: column;
  align-items: center;

  &__name {
    margin-top: 5px;
    font-family: Roboto600;
  }

  &__who {
    margin-top: 5px;
    color: #3333;
  }

  &__email {
    display: flex;
    gap: 5px;
    margin-top: 5px;
  }

  &__fakeImage {
    cursor: default;
    height: 32px;
    width: 32px;
    border-radius: 32px;
    background-color: var(--bgColor);
    color: var(--color);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
  }

  &__image {
    cursor: default;
    height: 32px;
    width: 32px;
    border-radius: 32px;
    margin-bottom: 5px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 32px;
    }
  }
}

a {
  color: $text;
  text-decoration: none;
  transition: .2s ease-out;

  &:hover {
    text-decoration: underline;
  }
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