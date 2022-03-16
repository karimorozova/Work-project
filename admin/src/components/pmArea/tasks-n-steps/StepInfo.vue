<template lang="pug">
  .step-info
    .step-info__close(@click.stop="closeInfo") &#215;

    .tabs(style="margin-top: 5px;")
      Tabs(
        :tabs="mainTabs"
        selectedTab="Step Information"
        @setTab="showMainTab"
      )
    .info
      .info__title {{ step.step.title }}
      .info__value {{ step.stepId }}
      .info__value {{ step.sourceLanguage === step.targetLanguage ? step.fullTargetLanguage.lang : step.fullSourceLanguage.lang + ' to ' + step.fullTargetLanguage.lang }}
      .info__value(v-if="step.step.title === 'Translation' && step.totalWords" ) Total Words:  {{ step.totalWords }}

    .details__options
      .details__options-row
        .details__options-key Visible for Client:
        .details__options-value
          Toggler(
            :isActive="step.isReceivableVisible"
            @toggle="toggleVisible"
          )

    .step-info__block
      StepDetails(
        :vendor="step.vendor"
        :step="step"
        :task="task"
      )

    .step-info__matrix(v-if="step.receivablesUnit.type === 'CAT Wordcount' && step.step.title === 'Translation'")
      Tabs(:tabs="tabs.filter(i => !step.vendor ? i !== 'Payables' : true)" :selectedTab="selectedTab" @setTab="setTab")
      TableMatrix(
        :step="step"
        :task="task"
        :selectedTab="selectedTab"
      )

</template>

<script>
import Files from "../stepinfo/Files"
import { mapGetters, mapActions } from "vuex"
import StepDetails from "../stepinfo/StepDetails"
import Tabs from "../../Tabs"
import TableMatrix from "../stepinfo/finance/TableMatrix"
import Toggler from "../../Toggler"

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
    ...mapActions({
      alertToggle: "alertToggle"
    }),
    async toggleVisible() {
      try {
        const updatedProject = await this.$http.post(`/pm-manage/manage-receivable-visible`, {
          bool: !this.step.isReceivableVisible,
          _stepId: this.step._id
        })
        this.$emit('updateProject', updatedProject.data)
        this.alertToggle({ message: "Option installed", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: 'Error on hiding step', isShow: true, type: "error" })
      }
    },
    showMainTab({ index }) {
      switch (this.mainTabs[index]) {
        case 'Vendor Details':
          this.openVendorModal()
          break
        case 'Finance':
          this.openFinanceModal()
          break
      }
    },
    openFinanceModal() {
      const { closeStepInfo, showFinanceEditing } = this.$parent
      closeStepInfo()
      showFinanceEditing(this.index)
    },
    openVendorModal() {
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
    mainTabs() {
      if (!Object.keys(this.step).length) return []
      return [ "Step Information", "Vendor Details", "Finance" ].filter(i => !this.step.vendor ? i !== 'Vendor Details' : true)
    }
  },
  components: {
    Toggler,
    TableMatrix,
    Tabs,
    StepDetails,
    Files
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.details {
  &__options {
    margin-top: 20px;
    margin-bottom: 10px;

    &-row {
      height: 32px;
      display: flex;
      align-items: center;
    }

    &-key {
      margin-right: 20px;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.info {
  padding: 15px;
  border: 1px solid $border;
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
    font-size: 16px;
    margin-bottom: 10px;
    font-family: 'Myriad600';
  }

  &__value {
    font-size: 14px;
    margin-top: 6px;
    height: 16px;
  }
}

.step-info {
  box-sizing: border-box;
  background-color: white;
  box-shadow: $box-shadow;
  border-radius: 2px;
  width: 600px;
  padding: 25px;
  position: relative;

  &__matrix {
    margin-top: 20px;
  }

  &__title {
    font-size: 16px;
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
