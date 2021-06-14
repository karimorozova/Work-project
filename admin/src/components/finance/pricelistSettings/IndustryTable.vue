<template lang="pug">
  .price
    DataTable(
      :fields="fields"
      :tableData="dataArray"
      :bodyClass="['setting-table-body', {'tbody_visible-overflow': dataArray.length < 3}]"
      :tableheadRowClass="dataArray.length < 3 ? 'tbody_visible-overflow' : ''"
      bodyRowClass="settings-table-row"
      bodyCellClass="settings-table-cell"
    )

      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .price-title {{ field.label }}

      template(slot="industry" slot-scope="{ row, index }")
        .price__data {{ row.industry.name }}

      template(slot="multiplier" slot-scope="{ row, index }")
        .price__data(v-if="!isEdit")
          span(id="multiplier") {{ row.multiplier }}
          label(for="multiplier") &#37;
        .price__editing-data(v-else)
          input.price__data-input(type="number" @change="setRowValue(index)" v-model="dataArray[index].multiplier")

</template>
<script>
	import DataTable from "../../DataTable"
	import { mapActions } from "vuex"

	export default {
		props: {
			priceId: {
				type: String
			},
			isEdit: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				fields: [
					{
						label: "Industry",
						headerKey: "headerIndustry",
						key: "industry",
						width: "85%",
						padding: "0"
					},
					{
						label: "Multiplier %",
						headerKey: "headerMultiplier",
						key: "multiplier",
						width: "15%",
						padding: "0"
					}
				],
				dataArray: [],

				areErrors: false,
				errors: [],
				isDeleting: false,
				deleteIndex: -1,
				currentActive: -1
			}
		},
		created() {
			this.getIndustries()
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle"
			}),
			async getIndustries() {
				try {
					const result = await this.$http.get("/pricelists/industry-multipliers/" + this.priceId)
					this.dataArray = result.data
				} catch (err) {
					this.alertToggle({ message: "Error on getting Industries", isShow: true, type: "error" })
				}
			},

			async setRowValue(index) {
				await this.checkErrors(index)
			},
			async checkErrors(index) {
				if (!this.isEdit) return
				if (this.dataArray[index].multiplier === "") this.dataArray[index].multiplier = 100
				await this.manageSaveClick(index)
			},
			refreshResultTable() {
				this.$emit('refreshResultTable')
			},
			async manageSaveClick(index) {
				const { _id, industry, multiplier } = this.dataArray[index]
				try {
					const result = await this.$http.post("/pricelists/industry-multipliers/" + this.priceId, {
						industryMultiplier: {
							_id,
							industry,
							multiplier: parseFloat(multiplier).toFixed(0)
						}
					})
					this.dataArray.splice(index, 1, result.data)
					this.refreshResultTable()
				} catch (err) {
					this.alertToggle({ message: "Error on getting Industry", isShow: true, type: "error" })
				}
			}
		},
		components: {
			DataTable
		}
	}
</script>
<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .price {
    background-color: #fff;
    box-shadow: none;

    input {
      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    }

    label {
      margin-left: 3px;
    }

    &__data,
    &__editing-data {
      height: 31px;
      padding: 0 5px;
      display: flex;
      align-items: center;
      box-sizing: border-box;
      overflow-y: auto;
    }

    &__editing-data {
      box-shadow: inset 0 0 7px $brown-shadow;
    }

    &__data-input {
      width: 100%;
      border: none;
      outline: none;
      color: $main-color;
      padding: 0 2px;
      background-color: transparent;
    }

    &__icons {
      padding-top: 2px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    &__icon {
      cursor: pointer;
      opacity: 0.5;
      margin-right: 8px;
    }

    &_opacity {
      opacity: 1;
    }
  }
</style>