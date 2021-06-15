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
        template(slot="headerIcons" slot-scope="{ field }")
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
                img(:style="{ cursor: 'help' }", src="../../assets/images/red-info-icon.png")

            span(v-if="row.altered")
              .icons-link(@click="getDefaultValues(row.key)")
                i.fa.fa-link(aria-hidden='true')
            span(v-else)
              .icons-link-opacity
                i.fa.fa-link(aria-hidden='true')

</template>

<script>
	import DataTable from "../DataTable"

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
					{ label: "Translation match", headerKey: "headerText", key: "text", width: "46%" },
					{ label: "Value %", headerKey: "headerRate", key: "rate", width: "46%" },
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
  @import "../../assets/scss/colors.scss";

  .table {
    &__dataEdit {
      box-shadow: inset 0 0 7px $brown-shadow;
    }
  }

  .finance-matrix {
    &__icons {
      display: flex;
      align-items: center;
      justify-content: center;

      .altered {
        margin-top: -4px;
        margin-left: 3px;
        margin-right: 3px;
      }

      .icons-link {
        cursor: pointer;
        font-size: 16px;
        margin-left: 3px;
        margin-right: 3px;
      }

      .icons-link-opacity {
        cursor: default;
        font-size: 16px;
        opacity: 0.5;
        margin-left: 3px;
        margin-right: 3px;
      }
    }

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

  .tooltip {
    position: relative;
    display: flex;

    .tooltiptext {
      font-size: 14px;
      visibility: hidden;
      width: 140px;
      background-color: #67573e;
      color: #fff;
      text-align: center;
      border-radius: 6px;
      padding: 5px;
      position: absolute;
      z-index: 1;
      bottom: 30px;
      left: 50%;
      margin-left: -75px;
      opacity: 0;
      transition: opacity 0.3s;

      &::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: #67573e transparent transparent transparent;
      }
    }

    &:hover {
      .tooltiptext {
        visibility: visible;
        opacity: 1;
      }
    }

    &:hover {
      .tooltiptext-bottom {
        visibility: visible;
        opacity: 1;
      }
    }
  }
</style>
