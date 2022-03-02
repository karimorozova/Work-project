<template lang="pug">
  .tasks-langs
    .source(v-if="isServiceDuo")
      .tasks-langs__title-source Source Language:
      .source__drop-menu
        SelectSingle(
          placeholder="Option",
          :options="mappedSourceLanguages",
          :selectedOption="source.hasOwnProperty('lang') ? source.lang : source",
          @chooseOption="setSource"
        )

    .target
      .tasks-langs__title-target Target Languages:
      .select-lang-wrapper
        ListManagement(
          :list="targets ? mappedTargetLanguages.filter(item => !targets.map(i => i.lang).includes(item)) : mappedTargetLanguages"
          @moveItem="moveFromAll"
        )
        ListManagementButtons(@moveAll="moveAll" @removeAll="removeAll")
        ListManagement(
          :list="targets ? targets.map(i => i.lang) : []"
          @moveItem="moveFromChosen"
        )

      .select-target-count Selected languages: {{ targets ? targets.length : 0 }}

</template>

<script>
import ListManagementButtons from "./ListManagementButtons"
import ListManagement from "./ListManagement"
import SelectSingle from "../../../components/pangea/SelectSingle"
import { mapGetters, mapActions } from "vuex"

export default {
  props: {
    mappedSourceLanguages: {
      type: Array,
      default: () => []
    },
    mappedTargetLanguages: {
      type: Array,
      default: () => []
    },
    isServiceDuo: {
      type: Boolean
    },
    source: {
      type: String,
      default: ''
    },
    targets: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      // source: this.selectedSource,
      // targets: this.selectedTargets,
      selectedTargetLang: [],

    }
  },
  methods: {
    ...mapActions({
      alertToggle: 'alertToggle',
      getLanguages: "getLanguages"
    }),
    moveFromAll(lang) {
      const targets = this.targets || []
      targets.push(this.allLanguages.find(item => item.lang === lang))
      // this.targets = targets
      this.$emit('selectTargetLang', targets)
      // this.setDataValue({ prop: "targets", value: targets })
    },
    moveFromChosen(lang) {
      const targets = this.targets || []
      this.$emit('selectTargetLang', targets.filter(item => item.lang !== lang) )
      // this.setDataValue({ prop: "targets", value: targets.filter(item => item.lang !== lang) })
    },
    moveAll() {
      // this.targets = this.allLanguages.filter(item => this.mappedTargetLanguages.includes(item.lang))
      this.$emit('selectTargetLang', this.allLanguages.filter(item => this.mappedTargetLanguages.includes(item.lang)))
      // this.setDataValue({ prop: "targets", value: this.allLanguages.filter(item => this.mappedTargetLanguages.includes(item.lang)) })
    },
    removeAll() {
      // this.allLanguages.filter(item => [])
      this.$emit('selectTargetLang', [])
      // this.setDataValue({ prop: "targets", value: [] })
    },
    setSource({ option }) {
      this.$emit('selectSourceLang', option)
    }
  },
  computed: {
    ...mapGetters({
      // currentProject: "getCurrentProject",
      // tasksData: "getTasksData",
      allLanguages: "allLanguages"
    }),
    // mappedSourceLanguages() {
    //   if (this.currentProject._id && this.tasksData.hasOwnProperty("service") && this.allLanguages.length) {
    //     return this.getServiceSourceLanguages().length
    //         ? this.getServiceSourceLanguages().map(item => item.lang)
    //         : []
    //   }
    // },
    // mappedTargetLanguages() {
    //   if (this.currentProject._id && this.tasksData.hasOwnProperty("service") && this.allLanguages.length && this.tasksData.hasOwnProperty("source")) {
    //     return this.getServiceTargetLanguages().length
    //         ? this.getServiceTargetLanguages().map(item => item.lang)
    //         : []
    //   }
    //   return []
    // }
  },
  created() {
    this.getLanguages()
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
  display: flex;
  justify-content: space-between;

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
  //margin-top: 30px;

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
