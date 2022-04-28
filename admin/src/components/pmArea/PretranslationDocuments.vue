<template lang="pug">
  .pretranslation
    input.file-input(type="file" @change='uploadFiles' :multiple='true')
    Button(@clicked="pretranslateFiles" :isDisabled="!!requestCounter" value="Pre-translate")
</template>

<script>

import Button from "../Button"
import { mapActions, mapGetters } from "vuex"

export default {
  name: "PretranslationDocuments",
  components: { Button },
  data() {
    return {
      files: []
    }
  },
  methods: {
    ...mapActions([ 'alertToggle' ]),
    uploadFiles(e) {
      this.files = Array.from(e.target.files)
    },
    async pretranslateFiles() {
      if (!this.files.length) return
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

      for (let file of this.files) {
        formData.append('file', file)
      }
      try {
        const res = await this.$http.post('/memoqapi/pretranslate-files', formData)
        let link = document.createElement('a')
        link.href = this.$domains.admin + res.data
        link.target = "_blank"
        link.click()
        setTimeout(async () => {
          console.log('2000')
          await this.$http.post('/memoqapi/clear-pretranslate-files', {
            path: res.data
          })
        }, 2000)
      } catch (e) {
        this.alertToggle({ message: e.data, isShow: true, type: "error" })
      } finally {
        this.files = []
        let inputFiles = document.querySelectorAll('.file-input')
        for (let elem of inputFiles) {
          elem.value = ''
        }
      }
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

.pretranslation {
  box-sizing: border-box;
  width: 400px;
  margin-top: 25px;
  padding: 25px;
  box-shadow: $box-shadow;
  background: white;
  border-radius: 2px;
  margin-top: 25px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
</style>