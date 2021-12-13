<template lang="pug">
  .step-info
    .step-info__title Details
    .step-info__close(@click.stop="closeInfo") &#215;

    .info
      .info__link(@click="openFinanceModal") Go to finance
      .info__link2(v-if="step.vendor" @click="openVendorModal") Go to vendor

      .info__title {{ step.step.title }}
      .info__value {{ step.stepId }}
      .info__value {{ step.sourceLanguage === step.targetLanguage ? step.fullTargetLanguage.lang : step.fullSourceLanguage.lang + ' to ' + step.fullTargetLanguage.lang }}
      .info__value(v-if="step.vendor") {{ step.vendor.firstName }} {{  step.vendor.surname || '' }}

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
    openFinanceModal() {
      const { closeStepInfo, showFinanceEditing } = this.$parent
      closeStepInfo()
      showFinanceEditing(this.index)
    },
    openVendorModal(){
      const { closeStepInfo, openVendorDetailsModal } = this.$parent
      closeStepInfo()
      openVendorDetailsModal(this.step.vendor, this.step, this.index)
    },
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
    // ...mapGetters({
    //   currentProject: "getCurrentProject"
    // })
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
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.info {
  border-radius: 4px;
  padding: 12px 20px;
  margin-bottom: 20px;
  border: 1px solid $light-border;
  position: relative;

  &__link {
    position: absolute;
    right: 12px;
    cursor: pointer;
    color: $dark-border;
    transition: .2s ease-out;

    &:hover {
      color: $text;
      text-decoration: underline;
    }
  }

  &__link2 {
    position: absolute;
    right: 12px;
    top: 35px;
    cursor: pointer;
    color: $dark-border;
    transition: .2s ease-out;

    &:hover {
      color: $text;
      text-decoration: underline;
    }
  }


  &__title {
    font-size: 20px;
    color: $red;
    margin-bottom: 10px;
  }

  &__value {
    font-size: 14px;
    margin-top: 6px;
    height: 16px;
  }
}

.step-info {
  &__title {
    font-size: 18px;
    font-family: Myriad600;
    margin-bottom: 20px;
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
