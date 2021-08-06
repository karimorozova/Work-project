<template lang="pug">
  .finance-matrix

    .table
      GeneralTable(
        :fields="fields"
        :tableData="tableData"
      )
        template(slot="headerText" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerRate" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="text" slot-scope="{ row }")
          .table__header {{ row.text }}

        template(slot="rate" slot-scope="{ row }")
          .table__data(v-if="!isEdit")
            span {{ row.rate }}
            span.finance-matrix__percent %
          .table__data(v-else)
            input(
              type="number" min="0" max ="100"
              :value="row.rate | maxRateCount"
              @change="(e) => setMatrixData(e, row.key)"
            )

        template(slot="icons" slot-scope="{ row }")
          .table__icons
            .altered(v-if="row.altered")
              .tooltip
                span#myTooltip.tooltiptext {{ row.notification }}
                .table__icons-info
                  i.fas.fa-info-circle

            .link(v-if="isEdit")
              span(v-if="row.altered")
                .table__icons-link(@click="getDefaultValues(row.key)")
                  i.fa.fa-link(aria-hidden='true')
              span(v-else)
                .table__icons-link-opacity
                  i.fa.fa-link(aria-hidden='true')

</template>

<script>
	import DataTable from "../DataTable"
	import GeneralTable from "../GeneralTable"

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
					{ label: "Translation match", headerKey: "headerText", key: "text", style: { width: "76%" } },
					{ label: "Value", headerKey: "headerRate", key: "rate", style: { width: "12%" } },
					{ label: "", headerKey: "headerIcons", key: "icons", style: { width: "12%" } }
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
			GeneralTable,
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
    &__header,
    &__data {
      padding: 0 6px;
    }

    &__data {
      width: 100%;
    }

    &__icons {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 7px;
      width: 100%;
      height: 40px;

      &-info {
        cursor: help;
        color: $red;
        font-size: 16px;
      }

      &-link {
        cursor: pointer;
        font-size: 16px;
      }

      &-link-opacity {
        cursor: default;
        font-size: 16px;
        opacity: 0.5;
      }
    }
  }

  .tooltip {
    position: relative;
    display: flex;

    .tooltiptext {
      visibility: hidden;
      font-size: 14px;
      width: max-content;
      background-color: white;
      color: $text;
      text-align: center;
      border-radius: 4px;
      right: 28px;
      bottom: -7px;
      padding: 7px 12px;
      position: absolute;
      z-index: 1;
      opacity: 0;
      transition: opacity .3s;
      border: 1px solid $border;

      &::after {
        content: "";
        position: absolute;
        top: 30%;
        right: -12px;
        transform: rotate(270deg);
        border-width: 6px;
        border-style: solid;
        border-color: $border transparent transparent;
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
