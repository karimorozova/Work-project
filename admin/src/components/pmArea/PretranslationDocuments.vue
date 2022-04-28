<template lang="pug">
  .wrap
    .pretranslation
      input.file-input(type="file" @change='uploadFiles' :multiple='true')
      Button(@clicked="pretranslateFiles" :isDisabled="!!requestCounter" value="Pre-translate")
    .filesManage(v-if="filesManage.length" v-for="item in filesManage" )
      .filesManage__row
        .filesManage__key.short {{item.filename}}
        .filesManage__val {{item.status}}
          span(v-if="item.status === 'Ready'")
            i(class="fa-solid fa-download" style="cursor:pointer; margin-left: 10px;" @click="download(item.filename, item.path)")

</template>

<script>

import Button from "../Button"
import { mapActions, mapGetters } from "vuex"

export default {
  name: "PretranslationDocuments",
  components: { Button },
  data() {
    return {
      files: [],
      filesManage: []
    }
  },
  methods: {
    ...mapActions([ 'alertToggle' ]),
    uploadFiles(e) {
      this.files = Array.from(e.target.files)
    },
    async download(filename, path) {
      const _fileIdx = this.filesManage.findIndex(i => i.filename === filename)
      let link = document.createElement('a')
      link.href = this.$domains.admin + path
      link.target = "_blank"
      link.click()

      setTimeout(async () => {
        console.log('2000')
        await this.$http.post('/memoqapi/clear-pretranslate-files', { path })
        this.filesManage[_fileIdx].status = 'Downloaded & Deleted'
      }, 2000)
    },
    async pretranslateFiles() {
      if (!this.files.length) return
      for (let file of this.files) this.filesManage.push({ filename: file.name, status: 'Pending' })

      for await (let file of this.files) {
        const _fileIdx = this.filesManage.findIndex(i => i.filename === file.name)

        try {
          this.filesManage[_fileIdx].status = 'Working'
          const formData = await this.manageFormData(file)
          const res = await this.$http.post('/memoqapi/pretranslate-files', formData)
          this.filesManage[_fileIdx].status = 'Ready'
          this.filesManage[_fileIdx].path = res.data
          console.log(res)

        } catch (e) {
          this.filesManage[_fileIdx].status = 'Error'
          this.alertToggle({ message: e.data, isShow: true, type: "error" })
        }
      }

      this.files = []
      let inputFiles = document.querySelectorAll('.file-input')
      for (let elem of inputFiles) {
        elem.value = ''
      }
    },
    async manageFormData(file) {
      const formData = new FormData()
      const creatorUserId = await this.getCreatorUserId()
      const templates = await this.getMemoqTemplates()
      formData.append('creatorUserId', creatorUserId)
      formData.append('template', JSON.stringify(templates.find(i => i.name === '2 Steps - autoMT')))
      formData.append('industry', JSON.stringify(this.currentProject.industry))
      formData.append('projectId', this.currentProject._id)
      formData.append('internalProjectId', this.currentProject.projectId)
      formData.append('nativeProjectName', this.currentProject.projectName)
      formData.append('projectManager', this.currentProject.projectManager._id)
      formData.append('customerName', this.currentProject.customer.name)
      formData.append('file', file)
      return formData
    },
    async getCreatorUserId() {
      try {
        const memoqCreatorUser = await this.$http.get(`/memoqapi/user?userId=${ this.currentProject.projectManager._id }`)
        const { creatorUserId } = memoqCreatorUser.data
        if (!creatorUserId) throw new Error()
        return creatorUserId
      } catch (err) {
        this.alertToggle({ message: 'PM in now exist in Memoq', isShow: true, type: "error" })
      }
    },
    async getMemoqTemplates() {
      try {
        const result = await this.$http.get("/memoqapi/templates")
        return result.data
      } catch (err) {
        this.alertToggle({ message: 'No Temlates', isShow: true, type: "error" })
      }
    }
  },
  computed: {
    ...mapGetters({
      currentProject: "getCurrentProject",
      requestCounter: 'getRequestCounter'
    })
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.wrap {
  box-sizing: border-box;
  width: 400px;
  margin-top: 25px;
  padding: 25px;
  box-shadow: $box-shadow;
  background: white;
  border-radius: 2px;
  margin-top: 25px;
}

.pretranslation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.filesManage {
  margin-top: 25px;

  &__row {
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
  }
}

.short {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 220px;
}
</style>