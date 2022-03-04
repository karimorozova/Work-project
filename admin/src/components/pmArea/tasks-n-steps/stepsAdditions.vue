<template lang="pug">
  .additions
    .table
      GeneralTable(
        :fields="fields"
        :tableData="data"
        :errors="errors"
        :areErrors="areErrors"
        @closeErrors="closeErrors"
      )

        template(slot="headerTitle" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerAmount" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerIcons" slot-scope="{ field }")
          .table__header {{ field.label }}

        template(slot="unit" slot-scope="{ row, index }")
          .table__data(v-if="currentActive !== index") {{ row.title }}
          .table__input(v-else)
            input(type="text" v-model="data[index].title")

        template(slot="steps" slot-scope="{ row, index }")
          .table__data(v-if="currentActive !== index") {{ row.value }}
          .table__data(v-else)
            input(type="number" v-model="data[index].value")

        template(slot="icons" slot-scope="{ row, index }")
          .table__icons
            img.table__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'table__opacity': isActive(key, index)}")

    Add(@add="addAdditions")
</template>

<script>
import Add from "../../Add"
import crudIcons from "../../../mixins/crudIcons"
import GeneralTable from "../../GeneralTable"

export default {
  mixins: [ crudIcons ],
  props: {
    stepsAdditions: {
      type: Array
    }
  },
  data() {
    return {
      fields: [
        {
          label: "Service title",
          headerKey: "headerTitle",
          key: "unit",
          style: { width: "50%" }
        },
        {
          label: "Amount",
          headerKey: "headerAmount",
          key: "steps",
          style: { width: "20%" }
        },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          style: { width: "30%" }
        }
      ],
      data: JSON.parse(JSON.stringify(this.stepsAdditions)),
      original: [],
      currentActive: -1,
      errors: [],
      areErrors: false
    }
  },
  methods: {
    addAdditions() {
      if (this.currentActive !== -1) return this.isEditing()
      this.data.push({ title: '', value: '' })
      this.currentActive = this.data.length - 1
    },
    makeAction(index, key) {
      if (this.currentActive !== -1 && this.currentActive !== index) return this.isEditing()

      if (key === "save") {
        this.checkSave(index)
      }
      if (key === "edit") {
        this.currentActive = index
        this.original = JSON.parse(JSON.stringify(this.data))
      }
      if (key === "cancel") {
        if (this.currentActive === -1) return

        if(this.data.filter(item => !item.title).length){
          this.data = this.data.filter(item => item.title)
          this.$emit('save', this.data)
          this.currentActive = -1
          return
        }
        this.data = JSON.parse(JSON.stringify(this.original))
        this.$emit('save', this.data)
        this.currentActive = -1
        this.original = []
      }
      if (key === "delete") {
        this.data.splice(index, 1)
        this.$emit('delete', this.data)
        this.currentActive = -1
      }
    },
    checkSave(index) {
      this.errors = []
      this.areErrors = false

      if (!this.data[index].value || !this.data[index].title) this.errors.push("Fields cannot be empty")
      if (this.errors.length) {
        this.areErrors = true
        return
      }

      if (this.currentActive === -1) return
      this.$emit('save', this.data)
      this.currentActive = -1
    },
    closeErrors() {
      this.areErrors = false
    }
  },
  components: {
    GeneralTable,
    Add
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.table {
  width: 100%;

  &__data {
    padding: 0 7px;
  }

  &__header {
    padding: 0 7px;
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
  border-radius: 2px;
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
</style>
