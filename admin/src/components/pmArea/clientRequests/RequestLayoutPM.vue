<template lang="pug">
  .client-req__layout
    .main-wrapper
      Request(:project="currentClientRequest")
      RequestTasksAndSteps(
        :originallyLanguages="originallyLanguages"
        :originallyUnits="originallyUnits"
        :originallySteps="originallySteps"
        :originallyServices="originallyServices"
      )
    .sub-wrapper
      RequestSubInformation(:project="currentClientRequest")
      RequestAction(:project="currentClientRequest")

      .side(v-if="!currentClientRequest.tasksAndSteps.length")
        .side__info
          .form__project
            .form__project-title Languages

          .order__row(v-if="currentClientRequest.requestForm.service.languageForm !== 'Mono'" )
            .order__subTitle Source:
            .order__value
              .drop
                SelectSingle(
                  :hasSearch="true"
                  placeholder="Option"
                  :options="getSourceLanguages.map(i => i.lang)"
                  :selectedOption="currentClientRequest.requestForm.sourceLanguage.lang"
                  @chooseOption="setSourceLanguage"
                )

          .order__row
            .order__subTitle Targets:
            .order__value
              .drop
                SelectMulti(
                  :hasSearch="true"
                  placeholder="Options"
                  :options="getTargetLanguages.map(i => i.lang)"
                  :selectedOptions="currentClientRequest.requestForm.targetLanguages.length ? currentClientRequest.requestForm.targetLanguages.map(i => i.lang) : []"
                  @chooseOptions="setTargetLanguages"
                )

</template>

<script>
import Request from "./subComponents/Request"
import { mapGetters, mapActions } from "vuex"
import RequestSubInformation from "./subComponents/RequestSubInformation"
import RequestTasksAndSteps from "./RequestTasksAndSteps"
import RequestAction from "./subComponents/RequestAction"
import SelectMulti from "../../SelectMulti"
import SelectSingle from "../../SelectSingle"

export default {
  data() {
    return {
      mainSourceLanguageId: null
    }
  },
  methods: {
    ...mapActions([ 'alertToggle', 'setCurrentClientRequest' ]),
    async setSourceLanguage({ option }) {
      // this.$children[1].closeTaskDataAndClearTasksRequest()
      const neededLanguageObject = this.originallyLanguages.find(item => item.lang === option)
      if (neededLanguageObject._id.toString() === this.mainSourceLanguageId.toString()) return
      this.mainSourceLanguageId = neededLanguageObject._id

      try {
        const updatedProject = await this.$http.post('/clients-requests/manage-request-languages', {
          projectId: this.currentClientRequest._id,
          type: 'sourceLanguage',
          data: neededLanguageObject
        })
        this.setCurrentClientRequest(updatedProject.data)
      } catch (err) {
        this.alertToggle({ message: "Error in setting source language!", isShow: true, type: "error" })
      }
    },
    async setTargetLanguages({ option }) {
      // this.$children[1].closeTaskDataAndClearTasksRequest()
      let data = [ ...this.currentClientRequest.requestForm.targetLanguages ]
      const neededLanguageObject = this.originallyLanguages.find(item => item.lang === option)

      const position = data.findIndex(item => item.lang === option)
      if (position !== -1) data.splice(position, 1)
      else data.push(neededLanguageObject)

      try {
        const updatedProject = await this.$http.post('/clients-requests/manage-request-languages', {
          projectId: this.currentClientRequest._id,
          type: 'targetLanguages',
          data
        })
        this.setCurrentClientRequest(updatedProject.data)
      } catch (err) {
        this.alertToggle({ message: "Error in setting target language!", isShow: true, type: "error" })
      }
    }
  },
  computed: {
    ...mapGetters({
      currentClientRequest: "getCurrentClientRequest",
      originallyLanguages: 'getAllLanguages',
      originallySteps: 'getAllSteps',
      originallyServices: "getAllServices",
      originallyUnits: "getAllUnits"
    }),
    getSourceLanguages() {
      if (this.originallyLanguages.length) {
        const { customer: { services }, requestForm: { service }, industry } = this.currentClientRequest
        const neededServices = [ ...new Set(services
            .filter(item => item.industries[0].toString() === industry._id.toString() && item.services[0].toString() === service._id.toString())
            .map(item => item.sourceLanguage)) ]
        return neededServices.map(item => this.originallyLanguages.find(item2 => item2._id.toString() === item))
      }
    },
    getTargetLanguages() {
      if (this.originallyLanguages.length) {
        const { customer: { services }, requestForm: { service }, industry } = this.currentClientRequest
        const neededServices = [ ...new Set(services
            .filter(item => item.industries[0].toString() === industry._id.toString()
                && item.services[0].toString() === service._id.toString()
                && (service.languageForm === 'Mono' ? true : this.mainSourceLanguageId && item.sourceLanguage.toString() === this.mainSourceLanguageId.toString()))
            .map(item => item.targetLanguages[0])) ]
        return neededServices.map(item => this.originallyLanguages.find(item2 => item2._id.toString() === item))
      }
    }
  },
  mounted() {
    this.mainSourceLanguageId = this.currentClientRequest.requestForm.service.languageForm === 'Mono'
        ? null
        : this.currentClientRequest.requestForm.sourceLanguage._id.toString()
  },
  components: { SelectSingle, SelectMulti, RequestAction, RequestTasksAndSteps, RequestSubInformation, Request }
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";

.side {
  &__info {
    position: relative;
    padding: 25px;
    box-shadow: $box-shadow;
    width: 420px;
    box-sizing: border-box;
    margin-top: 25px;
    border-radius: 2px;
    background: white;
  }
}

.client-req {
  &__layout {
    margin: 50px;
    display: flex;
  }
}

.sub-wrapper {
  margin-left: 25px;
}

.form {
  position: relative;
  padding: 20px;
  min-width: 1040px;
  max-width: 1040px;
  box-sizing: border-box;
  box-shadow: $box-shadow;
  border-radius: 2px;
  background: white;

  &__project {
    margin-bottom: 20px;
    border-bottom: 1px solid $light-border;
    width: 100%;
    padding-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &-title {
      font-size: 16px;
      font-family: 'Myriad600';
    }
  }
}

.order {
  &__buttons {
    padding-top: 25px;
    margin-top: 5px;
    border-top: 1px solid $light-border;
  }

  &__subTitle {
    width: 150px;
  }

  &__value {
    font-family: 'Myriad400';
  }

  &__row {
    display: flex;
    align-items: center;
    width: 100%;
    height: 44px;
  }

}

.drop {
  height: 32px;
  position: relative;
  width: 220px;
}
</style>
