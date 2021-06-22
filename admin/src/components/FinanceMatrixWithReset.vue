<template lang="pug">
  .finance-matrix
    .finance-matrix__table
      DataTable(
        :fields="fields"
        :tableData="tableData"
        bodyRowClass="rates-matrix-row"
        :bodyClass="['rates-matrix-body', 'tbody_visible-overflow']"
        tableheadRowClass="tbody_visible-overflow"
        bodyCellClass="matrix-table"
      )
        template(slot="headerText" slot-scope="{ field }")
          span.finance-matrix__text {{ field.label }}
        template(slot="headerRate" slot-scope="{ field }")
          span.finance-matrix__text {{ field.label }}
        template(slot="text" slot-scope="{ row }")
          span.finance-matrix__text {{ row.text }}

        template(slot="rate" slot-scope="{ row }")
          .table__data(v-if="!isEdit")
            span {{ row.rate }}
            span.finance-matrix__percent %
          div(v-else)
            input.finance-matrix__rate(
              type="number" min="0" max ="100"
              :value="row.rate | maxRateCount"
              @change="(e) => setMatrixData(e, row.key)"
            )

        template(slot="icons" slot-scope="{ row }")
          .finance-matrix__icons
            .altered(v-if="row.altered")
              .tooltip
                span#myTooltip.tooltiptext {{ row.notification }}
                .finance-matrix__icons-info
                  i.fas.fa-info-circle

            span(v-if="row.altered")
            .icons-link(@click="getDefaultValues(row.key)")
              i.fa.fa-link(aria-hidden='true')
            span(v-else)
              .icons-link-opacity
                i.fa.fa-link(aria-hidden='true')

</template>

<script>
	import DataTable from "./DataTable"

	export default {
		props: {
			entity: {
				type: Object
			},
			isEdit: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				fields: [
					{ label: "Translation match", headerKey: "headerText", key: "text", width: "50%" },
					{ label: "Value %", headerKey: "headerRate", key: "rate", width: "42%" },
					{ label: "", headerKey: "headerIcons", key: "icons", width: "8%" }
				]
			}
		},
		methods: {
			setMatrixData(e, key) {
				this.$emit("setMatrixData", { value: e.target.value, key })
			},
			getDefaultValues(key) {
				this.$emit('getDefaultValues', key)
			}
		},
		components: {
			DataTable
		},
		computed: {
			tableData() {
				return Object.keys(this.entity.matrix).map(key => {
					return { ...this.entity.matrix[key], key }
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
  @import "../assets/scss/colors.scss";

  .table {
    &__dataEdit {
      box-shadow: inset 0 0 7px $brown-shadow;
    }
  }

  .icons {
    &-link {
      cursor: pointer;
      font-size: 16px;
    }
  }

  .finance-matrix {
    &__icons {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 7px;

      &-info {
        cursor: help;
        color: $red;
        font-size: 16px;
      }


      &-link-opacity {
        cursor: default;
        font-size: 16px;
        opacity: 0.5;
      }
    }

    &__rate {
      color: #66563d;
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

  .tooltip {
    position: relative;
    display: flex;

    .tooltiptext {
      visibility: hidden;
      font-size: 14px;
      width: max-content;
      background-color: $red;
      color: #fff;
      text-align: center;
      border-radius: 4px;
      right: 30px;
      bottom: -3px;
      padding: 6px;
      position: absolute;
      z-index: 1;
      opacity: 0;
      transition: opacity .3s;

      &::after {
        content: "";
        position: absolute;
        top: 38%;
        right: -10px;
        transform: rotate(270deg);
        border-width: 5px;
        border-style: solid;
        border-color: $red transparent transparent;
      }
    }

    &:hover {
      .tooltiptext {
        visibility: visible;
        opacity: 1;
      }
    }
  }
</style>
