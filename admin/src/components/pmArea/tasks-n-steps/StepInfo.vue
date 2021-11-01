<template lang="pug">
  .step-info
    .step-info__title {{ step.stepId }}
    .step-info__close(@click.stop="closeInfo") &#215;

    .step-info__block
      StepDetails(
        :vendor="step.vendor"
        :step="step"
        :task="task"
      )

    .step-info__matrix(v-if="step.receivablesUnit.type === 'CAT Wordcount' && step.step.title === 'Translation'")
      Tabs(:tabs="tabs" :selectedTab="selectedTab" @setTab="setTab")
      TableMatrix(:step="step" :selectedTab="selectedTab")

</template>

<script>
import Finance from "../stepinfo/finance/Finance"
import Matrix from "../stepinfo/Matrix"
import Files from "../stepinfo/Files"
import { mapGetters, mapActions } from "vuex"
import StepDetails from "../stepinfo/StepDetails"
import Tabs from "../../Tabs"
import TableMatrix from "../stepinfo/finance/TableMatrix"

export default {
  props: {
    step: {
      type: Object
    },
    task: {
      type: Object
    },
    index: {
      type: [ Number, String ]
    },
    projectCurrency: {
      type: String
    }
  },
  data() {
    return {
      tabs: [ "Receivables", "Payables" ],
      selectedTab: "Receivables",
      matrixData: [],
      delivery: null
    }
  },
  methods: {
    setTab({ index }) {
      if (!this.step.vendor && index === 1) return
      this.selectedTab = this.tabs[index]
    },
    closeInfo() {
      this.$emit("closeStepInfo")
    },
    ...mapActions({
      alertToggle: "alertToggle",
      updateMatrix: "updateMatrix"
    })
  },
  mounted() {

  },
  computed: {
    ...mapGetters({
      currentProject: "getCurrentProject"
    })
  },
  components: {
    TableMatrix,
    Tabs,
    StepDetails,
    Finance,
    Matrix,
    Files
  }
}
1
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.step-info {
  &__title {
    font-size: 19px;
    font-family: Myriad600;
    margin-bottom: 10px;
  }

  &__finance {
    margin-top: 20px;
  }

  &__close {
    position: absolute;
    top: 10px;
    right: 10px;
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
</style>
