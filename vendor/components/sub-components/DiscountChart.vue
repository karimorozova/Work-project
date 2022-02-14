<template lang="pug">
  .finance-matrix
    .finance-matrix__table
      DataTable(
        :fields="fields"
        :tableData="matrix"
        bodyRowClass="rates-matrix-row"
        :bodyClass="['rates-matrix-body', 'tbody_visible-overflow']"
        tableheadRowClass="tbody_visible-overflow"
      )
        template(slot="headerText" slot-scope="{ field }")
          span.finance-matrix__text {{ field.label }}
        template(slot="headerRate" slot-scope="{ field }")
          span.finance-matrix__text {{ field.label }}
        template(slot="text" slot-scope="{ row }")
          span.finance-matrix__text {{ row.text }}
        template(slot="rate" slot-scope="{ row }")
          span.finance-matrix__text {{ row.rate }}
          span.finance-matrix__percent %

</template>

<script>

	// import DataTable from "../overall/DataTable"

	export default {
		props: {
			matrix: {
				type: Array,
				default: () => []
			}
		},
		data() {
			return {
				fields: [
					{ label: "Translation match", headerKey: "headerText", key: "text", width: "50%" },
					{ label: "Value %", headerKey: "headerRate", key: "rate", width: "50%" }
				]
			}
		},
		methods: {},
		components: {
			// DataTable
		},
		computed: {}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors";

  .finance-matrix {
    width: 1040px;
    height: auto;
    box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    box-sizing: border-box;
    padding: 20px 20px 20px 20px;
    position: relative;

    &__rate {
      color: #67573e;
      border: none;
      width: 94%;
      background: inherit;
      outline: none;

      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    }

    &__percent {
      margin-left: 3px;
    }
  }

</style>
