<template lang="pug">
  .price
    DataTable(
      :fields="fields",
      :tableData="dataArray",
      :errors="errors",
      :areErrors="areErrors",
      :isApproveModal="isDeleting",
      @closeErrors="closeErrors",
      @notApprove="setDefaults",
      @closeModal="setDefaults",
      :bodyClass="['client-pricelist-table-body', { 'tbody_visible-overflow': dataArray.length < 6 }]",
      :tableheadRowClass="['client-pricelist-table-head', { 'tbody_visible-overflow': dataArray.length < 6 }]",
      bodyRowClass="client-pricelist-table-row",
      bodyCellClass="client-pricelist-table-cell"
    )
      template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
        .price-title {{ field.label }}

      template(slot="industry", slot-scope="{ row, index }")
        .price__data(v-if="currentActive !== index")
          .tooltip
            span#myTooltip.tooltiptext-left {{ row.industry.name }}
            img.price__main-icon(:style="{ cursor: 'help' }" :src="row.industry.icon")
        .price__data(v-else)
          .tooltip
            span#myTooltip.tooltiptext-left {{ row.industry.name }}
            img.price__main-icon(:style="{ cursor: 'help' }" :src="row.industry.icon")

      template(slot="multiplier", slot-scope="{ row, index }")
        .price__data(v-if="currentActive !== index")
          span#multiplier {{ row.multiplier }}
          label(for="multiplier") &#37;
        .price__editing-data(v-else)
          input.price__data-input(type="number", v-model="currentMultiplier")

      template(slot="icons", slot-scope="{ row, index }")
        .price__icons
          .altered(v-if="row.altered")
            .tooltip
              span(v-if="index <= 1")
                span#myTooltip.tooltiptext-bottom {{ row.notification }}
              span(v-else)
                span#myTooltip.tooltiptext {{ row.notification }}
              img.price__icons-info(:style="{ cursor: 'help' }", src="../../../assets/images/red-info-icon.png")
          img.price__icon(
            v-for="(icon, key) in manageIcons",
            :src="icon.icon",
            @click="makeAction(index, key)",
            :class="{ price_opacity: isActive(key, index) }"
          )
          span(v-if="row.altered")
            .price__icons-link(@click="getRowPrice(index)")
              i.fa.fa-link(aria-hidden="true")
          span(v-else)
            .price__icons-link-opacity
              i.fa.fa-link(aria-hidden="true")

    .price__empty(v-if="!dataArray.length") Nothing found...
</template>
<script>
	import DataTable from "../../DataTable"
	import crudIcons from "@/mixins/crudIcons"
	import { mapGetters, mapActions } from "vuex"

	export default {
		mixins: [ crudIcons ],
		props: {
			tableData: {
				type: Array
			},
			vendorId: {
				type: String
			},
			refresh: {
				type: Boolean
			}
		},
		data() {
			return {
				fields: [
					{
						label: "Industry",
						headerKey: "headerIndustry",
						key: "industry",
						width: "27%",
						padding: "0"
					},
					{
						label: "%",
						headerKey: "headerMultiplier",
						key: "multiplier",
						width: "21%",
						padding: "0"
					},
					{
						label: "",
						headerKey: "headerIcons",
						key: "icons",
						width: "52%",
						padding: "0"
					}
				],
				dataArray: [],

				currentIndustry: "",
				currentMultiplier: "",
				currentIndustryObj: null,

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
			async getRowPrice(index) {
				try {
					await this.$http.post("/vendorsapi/rates/sync-cost/" + this.vendorId, {
						tableKey: "Industry Multipliers Table",
						row: this.dataArray[index]
					})
					const result = await this.$http.post(`/vendorsapi/vendor-rate-by-key`, { id: this.vendorId, key: 'industryMultipliersTable' })
					this.dataArray = result.data
					this.setDefaults()
					this.refreshResultTable()
				} catch (err) {
					this.alertToggle({ message: "Impossible update price", isShow: true, type: "error" })
				}
			},
			async getIndustries() {
				this.dataArray = this.tableData
			},
			async makeAction(index, key) {
				if (this.currentActive !== -1 && this.currentActive !== index) {
					return this.isEditing()
				}
				switch (key) {
					case "edit":
						this.setEditingData(index)
						break
					case "cancel":
						this.manageCancelEdition()
						break
					case "delete":
						alert("delete")
						break
					default:
						await this.checkErrors(index)
				}
			},
			setEditingData(index) {
				this.currentActive = index
				this.currentIndustryObj = this.dataArray[index].industry
				this.currentIndustry = this.dataArray[index].industry.icon
				this.currentMultiplier = this.dataArray[index].multiplier
			},
			manageCancelEdition() {
				this.setDefaults()
				this.isDeleting = false
			},
			setDefaults() {
				this.currentActive = -1
				this.isDeleting = false
			},
			async checkErrors(index) {
				if (this.currentActive === -1) return
				this.errors = []
				if (this.currentMultiplier == "") return
				if (Math.sign(this.currentMultiplier) == -1) return
				if (this.errors.length) {
					this.areErrors = true
					return
				}
				await this.manageSaveClick(index)
			},
			refreshResultTable() {
				this.$emit("refreshResultTable")
			},
			async manageSaveClick(index) {
				if (this.currentActive === -1) return
				try {
					const id = this.dataArray[index]._id
					await this.$http.post("/vendorsapi/rates/" + this.vendorId, {
						itemIdentifier: "Industry Multipliers Table",
						updatedItem: {
							_id: id,
							industry: this.currentIndustryObj,
							multiplier: parseFloat(this.currentMultiplier).toFixed(0),
							altered: true
						}
					})
					this.alertToggle({
						message: "Saved successfully",
						isShow: true,
						type: "success"
					})
					const updatedData = await this.$http.get("/vendorsapi/rates/" + this.vendorId)
					this.dataArray[index] = updatedData.body.industryMultipliersTable[index]
					this.setDefaults()
					this.refreshResultTable()
				} catch (err) {
					this.alertToggle({
						message: "Error on getting Industry",
						isShow: true,
						type: "error"
					})
				}
			},
			closeErrors() {
				this.areErrors = false
			}
		},
		computed: {
			manageIcons() {
				const { delete: del, ...result } = this.icons
				return result
			}
		},
		watch: {
			async refresh() {
				if (this.refresh) {
					const vendor = await this.$http.get(`/vendorsapi/vendor?id=${ this.$route.params.id }`)
					this.dataArray = vendor.data.rates.industryMultipliersTable
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
  @import "../../../assets/styles/settingsTable";

  .price {
    @extend %setting-table;
    background-color: #fff;
    padding: 0;
    padding-left: 5px;
    box-shadow: none;

    input[disabled] {
      box-shadow: none;
    }

    &__empty {
      font-size: 14px;
      margin-bottom: 15px;
    }

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
      height: 32px;
      padding: 0 5px;
      display: flex;
      align-items: center;
      box-sizing: border-box;
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

    &__main-icon {
      width: 22px;
      height: 22px;
    }

    &__icons {
      padding-top: 2px;
      display: flex;
      justify-content: flex-end;
      align-items: center;

      &-info {
        margin-top: 1px;
        margin-right: 3px;
      }

      &-link {
        cursor: pointer;
        font-size: 18px;
        margin-top: 5px;
        margin-right: 4px;
      }

      &-link-opacity {
        cursor: default;
        font-size: 18px;
        margin-top: 4px;
        opacity: 0.5;
        margin-right: 4px;
      }
    }

    &__icon {
      cursor: pointer;
      opacity: 0.5;
      margin-right: 2px;
    }

    &_opacity {
      opacity: 1;
    }
  }

  .tooltip {
    position: relative;
    display: flex;

    .tooltiptext-left {
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
      left: 40px;
      opacity: 0;
      top: -2px;
      transition: opacity .3s;

      &::after {
        content: "";
        position: absolute;
        top: 8px;
        left: 0;
        margin-left: -10px;
        transform: rotate(90deg);
        border-width: 5px;
        border-style: solid;
        border-color: #67573e transparent transparent;
      }
    }

    .tooltiptext-bottom {
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
      bottom: -55px;
      left: 50%;
      margin-left: -75px;
      opacity: 0;
      transition: opacity 0.3s;

      &::after {
        content: "";
        position: absolute;
        top: -10px;
        left: 50%;
        margin-left: -5px;
        transform: rotate(180deg);
        border-width: 5px;
        border-style: solid;
        border-color: #67573e transparent transparent;
      }
    }

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
      .tooltiptext-left {
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