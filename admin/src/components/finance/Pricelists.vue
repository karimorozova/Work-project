<template lang="pug">
  .pricelists
    .pricelists__table
      .pricelists__approve(v-if="isDeleting")
        ApproveModal(
          text="Are you sure?",
          approveValue="Yes",
          notApproveValue="Cancel",
          @approve="deletePricelist",
          @notApprove="setDefaults",
          @close="setDefaults"
        )

      .table
        GeneralTable(
          :fields="fields"
          :tableData="vuexPricelists"
        )
          template(slot="headerName" slot-scope="{ field }")
            .table__header {{ field.label }}
          template(slot="headerVendorDefault" slot-scope="{ field }")
            .table__header {{ field.label }}
          template(slot="headerActive" slot-scope="{ field }")
            .table__header {{ field.label }}
          template(slot="headerIcons" slot-scope="{ field }")
            .table__header {{ field.label }}

          template(slot="name" slot-scope="{ row, index }")
            .table__data.pricelists_pointer(v-if="currentActive !== index" @click="showPriceSettings(row._id)")
              .pricelists__rates-link {{ row.name }}
            .table__input(v-else)
              input(type="text" v-model="currentName" placeholder="Pricelist name")

          template(slot="vendorDefault" slot-scope="{ row, index }")
            .table__data.pricelists_centered(style="width: 100%; text-align: center;" :class="{'filter__opacity': currentActive !== index}")
              CheckBox(
                :isChecked="row.isVendorDefault"
                @check="(e) => setDefaultPricelist(e, index, 'isVendorDefault')"
                @uncheck="(e) => setDefaultPricelist(e, index, 'isVendorDefault')"
              )

          template(slot="active" slot-scope="{ row, index }")
            .table__data.pricelists_centered(style="width: 100%;")
              Toggler(:isDisabled="false" :isActive="row.isActive" @toggle="toggleActive(index)")

          template(slot="icons" slot-scope="{ row, index }")
            .table__icons
              img.table__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'table__opacity': isActive(key, index)}")

      Add(@add="addPricelist")

      ValidationErrors(
        v-if="isErrorExist"
        :errors="errors"
        :isAbsolute="isErrorExist"
        @closeErrors="closeErrors"
      )

    .pricelists__new(v-if="isNewPricelist")
      NewPricelist(:pricelists="pricelists" @cancel="cancelNewPricelist" @saved="refreshPricelists")
</template>

<script>
	import ApproveModal from "../ApproveModal"
	import SettingsTable from "../Table/SettingsTable"
	import Add from "../Add"
	import CheckBox from "../CheckBox"
	import Toggler from "../Toggler"
	import ValidationErrors from "../ValidationErrors"
	import NewPricelist from "./pricelists/NewPricelist"
	import { mapGetters, mapActions } from "vuex"
	import crudIcons from "@/mixins/crudIcons"
	import GeneralTable from "../GeneralTable"

	export default {
		mixins: [ crudIcons ],
		data() {
			return {
				pricelists: [],
				fields: [
					{ label: "Name", headerKey: "headerName", key: "name", style: { width: "50%" } },
					{ label: "Default Vendor", headerKey: "headerVendorDefault", key: "vendorDefault", style: { width: "15%" } },
					{ label: "Active", headerKey: "headerActive", key: "active", style: { width: "15%" } },
					{ label: "", headerKey: "headerIcons", key: "icons", style: { width: "20%" } }
				],

				icons: {
					save: { icon: require("../../assets/images/latest-version/i-save.png") },
					edit: { icon: require("../../assets/images/latest-version/i-edit.png") },
					cancel: { icon: require("../../assets/images/latest-version/i-cancel.png") },
					delete: { icon: require("../../assets/images/latest-version/i-delete.png") },
					copy: { icon: require("../../assets/images/duplicate.jpg") }
				},

				isNewPricelist: false,
				currentActive: -1,
				currentName: "",
				isErrorExist: false,
				errors: [],
				isDeleting: false,
				deleteIndex: -1
			}
		},
		methods: {
			showPriceSettings(id) {
				this.$router.push(`/pangea-settings/pricelists/${ id }`)
			},
			isDeletePricelist() {
				this.isDeleting = true
			},
			async makeAction(index, key) {
				if (this.currentActive !== -1 && this.currentActive !== index) {
					return
				}
				if (key === "edit") {
					this.currentActive = index
					this.currentName = this.pricelists[index].name
				}
				if (key === "save") {
					await this.checkErrors(index)
				}
				if (key === "copy") {
					await this.addPriceCopy(index)
				}
				if (key === "cancel") {
					await this.cancelEdition(index)
				}
				if (key === "delete") {
					this.deleteIndex = index
					await this.isDeletePricelist()
				}
			},
			isNameUnique(index) {
				const duplicateIndex = this.pricelists.findIndex((item, ind) => {
					return (ind !== index && this.currentName === item.name)
				})
				return duplicateIndex === -1
			},
			async checkErrors(index) {
				if (this.currentActive === -1) return
				this.errors = []
				if (!this.currentName || !this.isNameUnique(index)) this.errors.push("The name should be unique and not empty.")
				if (this.errors.length) {
					return this.isErrorExist = true
				}
				await this.savePricelist(index)
			},
			async savePricelist(index) {
				const pricelist = {
					...this.pricelists[index],
					name: this.currentName
				}
				try {
					await this.$http.post("/prices/pricelist", { pricelist })
					await this.getPricelists()
					this.setDefaults()
					this.alertToggle({ message: "Pricelist saved.", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Error on saving pricelist.", isShow: true, type: "error" })
				}
			},
			async addPriceCopy(index) {
				const name = this.setCopyPriceName(index)
				const pricelist = {
					name,
					copyName: this.pricelists[index].name,
					isDefault: false,
					isActive: false,
					basicPricesTable: this.pricelists[index].basicPricesTable,
					industryMultipliersTable: this.pricelists[index].industryMultipliersTable,
					stepMultipliersTable: this.pricelists[index].stepMultipliersTable
				}
				try {
					await this.$http.post("/prices/new-pricelist", { pricelist })
					await this.getPricelists()
					this.alertToggle({ message: "Pricelist saved.", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Error on copying pricelist.", isShow: true, type: "error" })
				}
			},
			setCopyPriceName(index) {
				const name = this.pricelists[index].name
				const priceCopies = this.pricelists.filter((item, ind) => {
					return ind !== index && item.name.indexOf(`${ name }-copy`) !== -1
				})
				const copyQuantity = priceCopies.length ? priceCopies.length : ""
				return `${ name }-copy${ copyQuantity }`
			},
			async deletePricelist() {
				this.errors = []
				const index = this.deleteIndex
				const id = this.pricelists[index]._id
				if (!id) return this.pricelists.slice(index, 1)

				const { isVendorDefault } = this.pricelists[index]

				if (!this.pricelists.filter(i => i.isActive).length) {
					this.errors.push('Cannot be deleted, no last active Pricelist')
				} else if (this.pricelists[index].isActive === true && this.pricelists.filter(i => i.isActive).length <= 1) {
					this.errors.push('Cannot be deleted, no last active Pricelist')
				}

				if (this.errors.length) {
					return this.isErrorExist = true
				}
				const result = await this.$http.delete(`/prices/pricelist/${ id }`, {
					body: { isVendorDefault }
				})
				if (result.data === 'Not deleted') {
					this.errors.push('This Pricelist assigned in client and cannot be deleted')
					return this.isErrorExist = true
				} else {
					this.isDeleting = false
					this.alertToggle({ message: "Pricelist deleted", isShow: true, type: "success" })
					await this.getPricelists()
				}
			},
			async setDefaultPricelist(e, index, prop) {
				if (this.pricelists[index][prop]) return
				const newDefaultPriceId = this.pricelists[index]._id
				const currentDefaultPrice = this.pricelists.find(item => item[prop])
				const exDefaultPriceId = currentDefaultPrice._id
				try {
					await this.$http.post("/prices/set-default", {
						newDefaultPriceId, exDefaultPriceId, prop
					})
					await this.getPricelists()
					this.alertToggle({ message: "Changes saved", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Error: Cannot set the default pricelist", isShow: true, type: "error" })
				}
			},
			async toggleActive(index) {
				const isActive = !this.pricelists[index].isActive
				try {
					await this.$http.post("/prices/activeness", { id: this.pricelists[index]._id, isActive })
					await this.getPricelists()
				} catch (err) {
					this.alertToggle({ message: "Error: Cannot toggle the property", isShow: true, type: "error" })
				}
			},
			async refreshPricelists() {
				await this.getPricelists()
				this.cancelNewPricelist()
			},
			closeErrors() {
				this.isErrorExist = false
			},
			cancelNewPricelist() {
				this.isNewPricelist = false
			},
			cancelEdition(index) {
				if (!this.pricelists[index]._id) {
					this.pricelists.splice(index, 1)
				}
				this.setDefaults()
			},
			setDefaults() {
				this.isDeleting = false
				this.deleteIndex = -1
				this.currentActive = -1
				this.currentName = ""
			},
			addPricelist() {
				this.isNewPricelist = true
			},
			async getPricelists() {
				try {
					const result = await this.$http.get("/prices/pricelists")
					this.pricelists = result.body
					await this.storePricelists(result.body)
				} catch (err) {
					this.alertToggle({ message: "Error on getting pricelists.", isShow: true, type: "error" })
				}
			},
			...mapActions([
				"alertToggle",
				"storeCurrentPrice",
				"storePriceRates",
				"storePricelists",
				"sortRates"
			])
		},
		computed: {
			...mapGetters({
				vuexPricelists: "getPricelists"
			})
		},
		components: {
			GeneralTable,
			SettingsTable,
			Add,
			Toggler,
			CheckBox,
			ValidationErrors,
			NewPricelist,
			ApproveModal
		},
		created() {
			this.getPricelists()
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";
  @import "../../assets/styles/settingsTable.scss";

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
      width: 100%;
      margin: 0 7px;
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

  .pricelists {
    position: relative;
    margin: 50px;
    border-radius: 4px;

    &__approve {
      position: absolute;
      left: 30%;
    }

    &__table {
      @extend %setting-table;
      width: 800px;
    }

    &__data {
      @extend %table-data;
    }

    &_pointer {
      cursor: pointer;
      transition: all 0.1s;

      &:hover {
        .pricelists__rates-link {
          text-decoration: underline;
        }
      }
    }

    &__editing-data {
      @extend %table-data;
      box-shadow: inset 0 0 7px $brown-shadow;
    }

    &__text {
      @extend %table-text-input;
    }

    &__icons {
      @extend %table-icons;
    }

    &__icon {
      @extend %table-icon;
    }

    &_opacity {
      opacity: 1;
    }

    &_centered {
      display: flex;
      justify-content: center;
    }

    &__new {
      width: 800px;
      padding: 0 20px;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
</style>
