<template lang="pug">
  .addition-steps
    GeneralTable(
      :fields="fields"
      :tableData="additionsSteps"
    )
      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .table__header {{ field.label }}


      template(slot="title" slot-scope="{ row, index }")
          .table__data(v-if="currentActive !== index") {{ row.title }}
          .table__data(v-else)
            input(type="text" placeholder="Value" v-model="currentTitle")

      template(slot="amount" slot-scope="{ row, index }")
        .table__data(v-if="currentActive !== index") {{ row.finance.Price.receivables }}
        .table__data(v-else)
          input(type="number" v-model="currentAmount")

      template(slot="icons" slot-scope="{ row, index }")
        .table__icons
          img.table__icon(v-for="(icon, key) in icon" :src="icon.icon" @click="makeAction( key,index)" :class="{'table__opacity': isActive(key, index)}")

    .table__empty(v-show="!additionsSteps.length") No data...

    Add(@add="addData")

</template>

<script>
import GeneralTable from '../../GeneralTable'
import Add from '../../Add'
import crudIcons from "../../../mixins/crudIcons"

export default {
  mixins: [crudIcons],
  name: "AdditionsSteps",
  props: {
    additionsSteps: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      fields: [
        { label: "Service title", headerKey: "headerServiceTitle", key: "title", style: { "width": "60%" } },
        { label: "Amount", headerKey: "headerAmount", key: "amount", style: { "width": "25%" } },
        { label: "", headerKey: "headerIcons", key: "icons", style: { "width": "15%" } },
      ],
      currentTitle: '',
      currentAmount: '',

      currentActive: -1,
    }
  },
  methods: {
    makeAction(key, index) {
      if(this.currentActive !== -1 && this.currentActive !== index) {
        return this.isEditing();
      }
      switch(key) {
        case "edit":
          this.setEditingData(index);
          break;
        case "cancel":
          this.cancelEdition(index);
          break;
        case "save":
          this.checkErrors();
          break;
        // case "delete":
        //   this.deleteRate(index);
      }
    },
    addData() {

    },
    checkErrors() {

    },
    setEditingData(index) {
      this.currentActive = index;
      this.currentTitle = this.additionsSteps[index].title
      this.currentAmount = this.additionsSteps[index].finance.Price.receivables
    },
    cancelEdition( ) {
      this.currentActive = -1
      this.currentTitle = ''
      this.currentAmount = ''
    }
  },
  computed: {
    manageIcons() {
      console.log(this.icons)
      const { "delete": del, ...result } = this.icons
      return result
    }
  },
  components: {
    GeneralTable,
    Add,
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors.scss";

.table {
  width: 100%;

  &__data {
    padding: 0 7px;
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