<template lang="pug">
  .content
    .row
      .row__title Industry:
      .row__value
        .drop
          SelectSingle(
            :hasSearch="true"
            placeholder="Option"
            :selectedOption="project.selectedIndustry.name || ''"
            :options="industries.map(i => i.name)"
            @chooseOption="setIndustry"
          )
    .row2
      .row2__title Files:
      .row2__value(v-if="!xtmFileData.length")
        UploadFileButton
          input.xtm-file-input(type="file" @change='uploadXTMFile' :multiple='true')
      .row2__value(v-else)
        .data__xtm-fileWrapper(v-for="item in Array.from(xtmFileData)" )
          .data__xtm-fileName {{ item.name }}
          .data__xtm-removeFile( @click="removeXTMFile(item.name)") &#215;

    .create-btn
      Button(
        :isDisabled="isRequestNow || isDisableSubmitButton"
        value="Submit"
        @clicked="createProject"
      )
</template>

<script>
import SelectSingle from "../../SelectSingle"
import DatePicker from 'vue2-datepicker'
import '../../../assets/scss/datepicker.scss'
import { mapActions } from "vuex"
import Button from "../../Button"
import UploadFileButton from "../../UploadFileButton"

export default {
  name: "XTM",
  props: [ 'clients', "industries", 'user', 'extraOptions' ],
  data() {
    return {
      xtmFileData: [],
      project: {
        selectedIndustry: {}
      },
      isRequestNow: false
    }
  },
  methods: {
    ...mapActions([ "alertToggle" ]),
    uploadXTMFile(e) {
      this.xtmFileData = Array.from(e.target.files)
    },
    removeXTMFile(name) {
      this.xtmFileData = this.xtmFileData.filter(item => item.name !== name)
    },
    async createProject() {
      this.isRequestNow = true
      let project = {}
      for (let [ key, val ] of Object.entries(this.extraOptions)) project = { ...project, [key]: val }

      const formData = new FormData()
      formData.append('user', JSON.stringify(this.user))
      formData.append('industry', this.project.selectedIndustry._id)
      formData.append('project', JSON.stringify(project))

      for (let file of this.xtmFileData) {
        formData.append('file', file)
      }
      const result = await this.$http.post("/pm-manage/new-project-from-xtmFile", formData)
      const { data } = result
      if (data.status === 'success') {
        await this.$router.push(`/pangea-projects/all-projects/All`)
        this.alertToggle({ message: "New Projects has been created", isShow: true, type: "success" })
        this.isRequestNow = false
      } else {
        this.alertToggle({ ...data, type: data.status, isShow: true })
        this.isRequestNow = false
      }
    },
    setIndustry({ option }) {
      this.project.selectedIndustry = this.industries.find(i => i.name === option)
    }
  },
  computed: {
    isDisableSubmitButton() {
      return !this.xtmFileData.length || !this.project.selectedIndustry.name
    }
  },
  components: {
    UploadFileButton,
    Button,
    SelectSingle,
    DatePicker
  }
}
</script>


<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.row {
  display: flex;
  align-items: center;
  min-height: 32px;
  margin-bottom: 20px;

  &__title {
    width: 100px;
    margin-right: 20px;
  }
}

.row2 {
  display: flex;
  min-height: 32px;
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0px;
  }

  &__title {
    width: 100px;
    margin-right: 20px;
  }
}

.drop {
  height: 32px;
  position: relative;
  width: 220px;
  background-color: white;
  border-radius: 4px;
}

.data {
  &__xtm {
    display: flex;
    gap: 20px;
    align-items: center;
    justify-content: center;

    &-fileWrapper {
      height: 30px;
      padding: 0 7px;
      display: flex;
      border: 1px solid $border;
      align-items: center;
      gap: 5px;
      border-radius: 4px;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0px;
      }
    }

    &-fileName {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      max-width: 260px;
      opacity: 0.5;
    }

    &-removeFile {
      font-size: 22px;
      cursor: pointer;
      height: 22px;
      width: 22px;
      justify-content: center;
      display: flex;
      align-items: center;
      font-family: Myriad900;
      opacity: 0.8;
      transition: ease 0.2s;

      &:hover {
        opacity: 1
      }
    }
  }
}

.create-btn {
  margin-top: 25px;
  display: flex;
  justify-content: center;
}
</style>