<template lang="pug">
  .addition-steps
    Tabs(:tabs="tabs" @setTab="setTab" :selectedTab="selectedTabQuery")
    GeneralTable(
      :fields="fields"
      :tableData="additionsSteps"
      :errors="errors"
      :areErrors="areErrors"
      @closeErrors="closeErrors"
    )

      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .table__header {{ field.label }}

      template(slot="title" slot-scope="{ row, index }")
        .table__data(v-if="currentActive !== index") {{ row.title }}
        .table__data(v-else)
          input(type="text" placeholder="Extra Service" v-model="currentTitle")

      template(slot="amount" slot-scope="{ row, index }")
        .table__data(v-if="currentActive !== index")
          span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          span {{ row.finance.Price.receivables }}
        .table__data(v-else)
          input(type="number" placeholder="Value" v-model="currentAmount")

      template(slot="icons" slot-scope="{ row, index }")
        .table__icons
          img.table__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction( key,index)" :class="{'table__opacity': isActive(key, index)}")

    Add(@add="addAdditionStep")

</template>

<script>
import GeneralTable from '../../GeneralTable'
import Add from '../../Add'
import crudIcons from "../../../mixins/crudIcons"
import Tabs from "../../Tabs"
import { mapActions, mapGetters } from "vuex"
import currencyIconDetected from "../../../mixins/currencyIconDetected"

export default {
  mixins: [ crudIcons, currencyIconDetected ],
  name: "AdditionsSteps",
  props: {
    additionsSteps: {
      type: Array,
      default: []
    },
    tabs: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      fields: [
        { label: "Service", headerKey: "headerServiceTitle", key: "title", style: { "width": "70%" } },
        { label: "Amount", headerKey: "headerAmount", key: "amount", style: { "width": "15%" } },
        { label: "", headerKey: "headerIcons", key: "icons", style: { "width": "15%" } }
      ],
      currentTitle: '',
      currentAmount: '',

      currentActive: -1,

      errors: [],
      areErrors: false
    }
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
      setCurrentProject: "setCurrentProject"
    }),
    makeAction(key, index) {
      if (this.currentActive !== -1 && this.currentActive !== index) {
        return this.isEditing()
      }
      switch (key) {
        case "edit":
          this.setEditingData(index)
          break
        case "cancel":
          this.cancelEdition()
          break
        case "save":
          this.checkErrors()
          break
        case "delete":
          this.deleteAdditionsStep(index)
      }
    },
    deleteAdditionsStep(index) {
      this.additionsSteps.splice(index, 1)
      this.currentActive = -1
      this.sendData()
    },

    addAdditionStep() {
      if (this.currentActive !== -1) return this.isEditing()
      this.additionsSteps.push({})
      this.currentActive = this.additionsSteps.length - 1
    },
    checkErrors() {
      this.errors = []
      this.areErrors = false
      if (!this.currentTitle || !this.currentAmount) this.errors.push("Fields cannot be empty")
      if (this.errors.length) {
        this.areErrors = true
        return
      }
      this.saveAdditionsSteps()
    },
    async saveAdditionsSteps() {
      const currentAdditions = this.additionsSteps[this.currentActive]
      currentAdditions.title = this.currentTitle
      currentAdditions.finance = { Price: { receivables: this.currentAmount } }
      await this.sendData()
      this.cancelEdition()
    },
    setEditingData(index) {
      this.currentActive = index
      this.currentTitle = this.additionsSteps[index].title
      this.currentAmount = this.additionsSteps[index].finance.Price.receivables
    },
    cancelEdition() {
      if (!this.additionsSteps[this.currentActive].hasOwnProperty('finance')) this.additionsSteps.pop()
      this.currentActive = -1
      this.currentTitle = ''
      this.currentAmount = ''
    },
    closeErrors() {
      this.areErrors = false
    },
    async sendData() {
      try {
        const updatedProject = await this.$http.post('/pm-manage/update-project-additions', { _id: this.currentProject._id, additionsSteps: this.additionsSteps })
        this.setCurrentProject(updatedProject.data)
      } catch (e) {
        console.log(e)
      }
    },

    setTab({ index }) {
      this.$emit('setTab', { index })
    }
  },
  computed: {
    ...mapGetters({
      currentProject: "getCurrentProject"
    }),

    selectedTabQuery() {
      return this.$route.query.selectedTab || 'Tasks'
    }
  },
  components: {
    GeneralTable,
    Add,
    Tabs
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors.scss";

.table {
  width: 100%;

  &__data {
    padding: 0 7px;
    width: 100%;
  }

  &__header {
    padding: 0 7px;
  }

  &__drop {
    position: relative;
    height: 32px;
    max-width: 220px;
    margin: 0 7px;
    width: 100%;
    background: white;
    border-radius: 4px;
  }

  &__icons {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 8px;
  }

  &__icon {
    cursor: pointer;
    opacity: 0.5;
  }

  &__opacity {
    opacity: 1;
  }

  &__input {
    width: 100%;
    padding: 0 7px;
  }
}

input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 4px;
  box-sizing: border-box;
  padding: 0 7px;
  outline: none;
  width: 100%;
  height: 32px;
  transition: .1s ease-out;

  &:focus {
    border: 1px solid $border-focus;
  }
}

.filter {
  &__opacity {
    filter: opacity(0.5);
  }
}


</style>