<template lang="pug">
  .finance-matrix
    GeneralTable(
      :fields="fields"
      :tableData="arr"
    )
      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .table__header {{ field.label }}

      template(slot="text" slot-scope="{ row }")
        .table__data {{ row.text }}
      template(slot="rate" slot-scope="{ row }")
        .table__data {{ row.rate }}
          span.currency %

</template>

<script>

import GeneralTable from "../../../../../components/general/GeneralTable"

export default {
  props: [ 'arr' ],
  data() {
    return {
      fields: [
        {
          label: "Translation match",
          headerKey: "headerText",
          key: "text",
          style: { width: "50%" }
        },
        {
          label: "Value",
          headerKey: "headerRate",
          key: "rate",
          style: { width: "50%" }
        }
      ]
    }
  },
  components: {
    GeneralTable
  }
}
</script>
<style lang="scss" scoped>
@import "../../../../../assets/scss/colors";

.currency {
  color: $dark-border;
  margin-left: 4px;
}

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

.icon {
  font-size: 15px;
  cursor: pointer;
}

</style>
