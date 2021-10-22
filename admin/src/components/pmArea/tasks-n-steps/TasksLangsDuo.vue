<template lang="pug">
  .tasks-langs
    .source(v-if="tasksData.service && tasksData.service.languageForm === 'Duo'")
      .tasks-langs__title-source Source Language:
      .source__drop-menu
        SelectSingle(
          placeholder="Option",
          :options="mappedSourceLanguages",
          :selectedOption="tasksData.source ? tasksData.source.lang : ''",
          @chooseOption="setSource"
        )

    .target
      .tasks-langs__title-target Target Languages:
      .select-lang-wrapper
        ListManagement(
          :list="tasksData.targets ? mappedTargetLanguages.filter(item => !tasksData.targets.map(i => i.lang).includes(item)) : mappedTargetLanguages"
          @moveItem="moveFromAll"
        )
        ListManagementButtons(@moveAll="moveAll" @removeAll="removeAll")
        ListManagement(
          :list="tasksData.targets ? tasksData.targets.map(i => i.lang) : []"
          @moveItem="moveFromChosen"
        )

      .select-target-count Selected languages: {{ tasksData.targets ? tasksData.targets.length : 0 }}

</template>

<script>
import ListManagementButtons from "../../ListManagementButtons"
import ListManagement from "../../ListManagement"
import SelectSingle from "../../SelectSingle"
import { mapGetters, mapActions } from "vuex"

export default {
  methods: {
    ...mapActions({
      alertToggle: 'alertToggle',
      setDataValue: "setTasksDataValue"
    }),
    getServiceSourceLanguages() {
      const { customer: { services }, industry } = this.currentProject
      const { service } = this.tasksData
      const neededServices = services
          .filter(item => item.services[0] === service._id && item.industries[0] === industry._id)
          .map(item => item.sourceLanguage)
      return this.allLanguages.filter(a => [ ...new Set(neededServices) ].some(b => a._id.toString() === b))
    },
    getServiceTargetLanguages() {
      const { customer: { services }, industry } = this.currentProject
      const { service, source } = this.tasksData
      const neededServices = services
          .filter(item => item.services[0] === service._id && item.industries[0] === industry._id && item.sourceLanguage === source._id)
          .map(item => item.targetLanguages[0])
      return this.allLanguages.filter(a => [ ...new Set(neededServices) ].some(b => a._id.toString() === b))
    },
    moveFromAll(lang) {
      const targets = this.tasksData.targets || []
      targets.push(this.allLanguages.find(item => item.lang === lang))
      this.setDataValue({ prop: "targets", value: targets })
    },
    moveFromChosen(lang) {
      const targets = this.tasksData.targets || []
      this.setDataValue({ prop: "targets", value: targets.filter(item => item.lang !== lang) })
    },
    moveAll() {
      this.setDataValue({ prop: "targets", value: this.allLanguages.filter(item => this.mappedTargetLanguages.includes(item.lang)) })
    },
    removeAll() {
      this.setDataValue({ prop: "targets", value: [] })
    },
    setSource({ option }) {
      const language = this.allLanguages.find(item => item.lang === option)
      this.setDataValue({ prop: "source", value: language })
      this.setDataValue({ prop: "targets", value: [] })
    }
  },
  computed: {
    ...mapGetters({
      currentProject: "getCurrentProject",
      tasksData: "getTasksData",
      allLanguages: "getAllLanguages"
    }),
    mappedSourceLanguages() {
      if (this.currentProject._id && this.tasksData.hasOwnProperty("service") && this.allLanguages.length) {
        return this.getServiceSourceLanguages().length
            ? this.getServiceSourceLanguages().map(item => item.lang)
            : []
      }
    },
    mappedTargetLanguages() {
      if (this.currentProject._id && this.tasksData.hasOwnProperty("service") && this.allLanguages.length && this.tasksData.hasOwnProperty("source")) {
        return this.getServiceTargetLanguages().length
            ? this.getServiceTargetLanguages().map(item => item.lang)
            : []
      }
      return []
    }
  },
  components: {
    SelectSingle,
    ListManagement,
    ListManagementButtons
  }
}
</script>

<style lang="scss" scoped>
%flex-row {
  display: flex;
  align-items: center;
}

%flex-column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.tasks-langs {
  &__title {
    &-source {
      margin-bottom: 3px;
      position: relative;
    }

    &-target {
      margin-bottom: 3px;
      position: relative;
    }
  }
}

.source {
  @extend %flex-column;

  &__drop-menu {
    position: relative;
    width: 220px;
    height: 32px;
  }
}

.target {
  width: 495px;
  margin-top: 30px;

  &__arrows {
  }

  &__from {
    position: relative;
  }

  &__search-value {
    position: absolute;
    top: -20px;
    font-size: 14px;
    left: 100%;
  }
}

.select-lang-wrapper {
  @extend %flex-row;
  justify-content: space-between;
}

.select-target-count {
  margin-top: 6px;
  opacity: .4;
  float: right;
  font-size: 14px;
}
</style>
