<template lang="pug">
  .vendors-table
    DataTable(
      :fields="fields"
      :tableData="vendors"
      :bodyCellClass="'vendor-table-cell'"
      :bodyClass="['vendors-table__body',{'tbody_visible-overflow': vendors.length < 6}]"
      :tableheadRowClass="vendors.length < 6 ? 'tbody_visible-overflow' : ''"
      @onRowClicked="onRowClicked"
      @bottomScrolled="bottomScrolled"
    )
      template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
        span.vendors-table__header-label {{ field.label }}

      template(slot="vendorName" slot-scope="{ row }")
        .vendors-table__data {{ getFullName(row) }}
      template(slot="status" slot-scope="{ row, index }")
        .vendors-table__drop-menu(v-if="currentEditingIndex === index")
          SelectSingle(
            :options="statuses"
            :selectedOption="selectedStatus"
            @chooseOption="setStatus"
          )
        .vendors-table__no-drop.vendors-table__status(v-else) {{ row.status }}

      template(slot="languagePair" slot-scope="{ row }")
        .vendors-table__combinations(v-html="formateLanguagesPairs(getLanguagePairs(row).duoLanguagesPairs) ")

      template(slot="monLanguage" slot-scope="{ row }")
        .vendors-table__combinations(v-html="formateLanguagesPairs(getLanguagePairs(row).monoLanguagesPairs)")

      template(slot="native" slot-scope="{ row, index }")
        .vendors-table__no-drop.vendors-table__native(v-if="row.native") {{ row.native.lang }}
      //template(slot="industry" slot-scope="{ row, index }")
      //  .vendors-table__drop-menu(v-if="currentEditingIndex === index")
      //    //MultiVendorIndustrySelect(
      //    //  :selectedInd="industrySelected"
      //    //  :filteredIndustries="selectedIndNames"
      //    //  :parentInd="index"
      //    //  @chosenInd="setIndustry"
      //    //  @scrollDrop="scrollDrop"
      //    //)
      //    SelectMulti(
      //      :hasSearch="true"
      //      :allOptionsButtons="true"
      //      placeholder="Select"
      //      :selectedOptions="industrySelected.length ? industrySelected.map(i => i.name) : []"
      //      :options="getAllIndustries.map(i => i.name)"
      //      @chooseOptions="setIndustries"
      //    )
      //  .vendors-table__no-drop.vendors-table__industry.vendors-table_flex-wrap(v-else)
      //    img.vendors-table__industry-icon(v-for="industry in row.industries" :src="industry.icon")
      //template(slot="basicRate" slot-scope="{ row, index }")
      //  .vendors-table__active(v-if="currentEditingIndex === index")
      //    input.vendors-table__input(type="text" v-model="currentBasicRate" @click.stop="stopPropagation")
      //  .vendors-table__no-drop(v-else)
      //    span.vendors-table__data {{ row.basicRate }}
      //template(slot="tqi" slot-scope="{ row, index }")
      //  .vendors-table__active(v-if="currentEditingIndex === index")
      //    input.vendors-table__input(type="text" v-model="currentTqi" @click.stop="stopPropagation")
      //  .vendors-table__no-drop(v-else)
      //    span.vendors-table__data {{ row.tqi }}
      template(slot="test" slot-scope="{ row, index }")
        .checkbox(@click.stop="")
          input(type="checkbox" :id="'test' + (index + 1)"  :checked="row.isTest"  @click.stop="setTest(row._id)")
          label(:for="'test' + (index + 1)")
      template(slot="icons" slot-scope="{ row, index }")
        span.vendors-table__icons
          img.vendors-table__icon(@click.stop="makeAction(index, key)" v-for="(icon, key) in icons" :src="icon.icon" :class="{'vendors-table_opacity': isIconClass(index, key)}")
    .vendors-table__error(v-if="isErrorShow")
      .vendors-table__error-message
        p Please finish the current edition first!
        span.vendors-table__close(@click="closeErrorMessage") +
    .vendors-table__delete-approve(v-if="isDeleteMessageShow")
      p Are you sure you want to delete?
      Button.vendors-table__button(value="Cancel" @clicked="cancelDelete")
      Button.vendors-table__button(value="Delete" @clicked="approveDelete")
</template>

<script>
	import DataTable from "../DataTable";
	import Button from "../Button";
	import scrollDrop from "@/mixins/scrollDrop";
	import { mapGetters, mapActions } from "vuex";
  import SelectSingle from "../SelectSingle"
  import SelectMulti from "../SelectMulti"

	export default {
		mixins: [scrollDrop],
		data() {
			return {
				fields: [
					{ label: "Vendor Name", headerKey: "headerVendorName", key: "vendorName", width: "27%", padding: "0" },
					{ label: "Status", headerKey: "headerStatus", key: "status", width: "12%", padding: "0" },
					{ label: "Language Pair", headerKey: "headerLanguagePair", key: "languagePair", width: "15%", cellClass: "vendors-table_scroll-y" },
					{ label: "Mono Language", headerKey: "headerMonoLanguage", key: "monLanguage", width: "15%", cellClass: "vendors-table_scroll-y" },
					{ label: "Native Language", headerKey: "headerNative", key: "native", width: "15%", padding: "0" },
					{ label: "Test", headerKey: "headerTest", key: "test", width: "4%", padding: "0" },
					{ label: "", headerKey: "headerIcons", key: "icons", width: "12%", padding: "3px" },
				],
				icons: {
					save: { icon: require('../../assets/images/Other/save-icon-qa-form.png') },
					edit: { icon: require('../../assets/images/Other/edit-icon-qa.png') },
					cancel: { icon: require('../../assets/images/cancel-icon.png') },
					delete: { icon: require('../../assets/images/Other/delete-icon-qa-form.png') }
				},
				currentEditingIndex: -1,
				deletingVendorIndex: -1,
				currentBasicRate: "",
				currentTqi: "",
				industrySelected: [],
				selectedNative: {},
				selectedStatus: "",
				isErrorShow: false,
				isDeleteMessageShow: false,
        searchLang: '',
        statuses: ["Active", "Inactive", "Potential"],
      }
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle",
				updateVendorProp: "updateVendorProp",
				storeVendors: "vendorsSetting",
				updateCurrentVendor: "updateCurrentVendor",
				storeCurrentVendor: "storeCurrentVendor",
				updateIndustry: "updateIndustry",
				deleteCurrentVendor: "deleteCurrentVendor",
				updateVendorStatus: "updateVendorStatus"
			}),
			async setTest(vendorId) {
				const vendor = {
					id: vendorId,
					isTest: event.target.checked
				}
				try {
					await this.updateVendorStatus(vendor);
					this.alertToggle({ message: "Vendor status updated", isShow: true, type: "success" });
				} catch (err) {
					this.alertToggle({
						message: "Server error / Cannot update Vendor status",
						isShow: true,
						type: "error"
					});
				}
			},
			bottomScrolled() {
				this.$emit("bottomScrolled");
			},
			isScrollDrop(drop, elem) {
				return drop && elem.clientHeight >= 600;
			},
			stopPropagation() {
				return
			},
			getFullName(vendor) {
				return vendor.firstName + " " + vendor.surname;
			},
			formateLanguagesPairs(arr) {
				return arr.reduce((acc, curr) => acc + curr + '<br>', '')
			},
			getLanguagePairs(vendor) {
				const isId = vendor.competencies.length && vendor.competencies[0].sourceLanguage.hasOwnProperty('_id');
				return {
					duoLanguagesPairs: returnLangPairs('duo', this.getAllLanguages),
					monoLanguagesPairs: returnLangPairs('mono', this.getAllLanguages)
				};

				function returnLangPairs(condition, allLanguages) {
					return [...new Set(
							vendor.competencies
									.map(({ sourceLanguage, targetLanguage }) => {
										return isId ? { sourceLanguage: sourceLanguage._id, targetLanguage: targetLanguage._id } : { sourceLanguage, targetLanguage }
									})
									.filter(({ sourceLanguage, targetLanguage }) => condition === 'duo' ? sourceLanguage !== targetLanguage : sourceLanguage === targetLanguage)
									.map(({ sourceLanguage, targetLanguage }) => {
										return condition === 'duo' ? `${ findSymbolOrLang(sourceLanguage, condition, allLanguages) } >> ${ findSymbolOrLang(targetLanguage, condition, allLanguages) }` :
												`${ findSymbolOrLang(sourceLanguage, condition, allLanguages) }`
									})
					)];

					function findSymbolOrLang(_idItem, condition, allLanguages) {
						const { symbol, lang } = allLanguages.find(({ _id }) => _id.toString() === _idItem.toString());
						return condition === 'duo' ? symbol : lang;
					}
				}
			},
			isIconClass(index, key) {
				if(this.currentEditingIndex !== index) {
					return key === 'save' || key === 'cancel';
				}
				if(this.currentEditingIndex === index) {
					return key === 'edit'
				}
			},
			closeErrorMessage() {
				this.isErrorShow = false;
			},
			setCurrentEditionValues(index) {
				this.currentEditingIndex = index;
				this.currentBasicRate = this.vendors[index].basicRate;
				this.currentTqi = this.vendors[index].tqi;
				this.industrySelected = Array.from(this.vendors[index].industries);
				this.selectedStatus = this.vendors[index].status;
				this.selectedNative = this.vendors[index].native;
			},
			setCurrentDefaults() {
				this.currentEditingIndex = -1;
				this.currentBasicRate = "";
				this.currentTqi = "";
				this.industrySelected = [];
				this.selectedStatus = "";
				this.selectedNative = {};
				const tbody = document.querySelector('.table__tbody');
				tbody.style.minHeight = this.currentTableHeight + 'px';
			},
			async updateVendor(index) {
				let sendData = new FormData();
				const updatingVendor = {
					...this.vendors[index],
					basicRate: this.currentBasicRate,
					tqi: this.currentTqi,
					industries: this.industrySelected,
					status: this.selectedStatus,
					native: this.selectedNative
				}
				sendData.append('vendor', JSON.stringify(updatingVendor));
				try {
					await this.updateCurrentVendor(sendData);
					this.alertToggle({ message: "Vendor info updated", isShow: true, type: "success" });
					this.$emit("update", { status: this.selectedStatus });
				} catch (err) {
					this.alertToggle({ message: "Server error / Cannot update Vendor info", isShow: true, type: "error" })
				}
			},
			async makeAction(index, key) {
				if(this.currentEditingIndex !== -1 && this.currentEditingIndex !== index) {
					return this.isErrorShow = true;
				}
				if(key === 'edit') {
					this.setCurrentEditionValues(index);
				}
				if(key === 'save') {
					await this.updateVendor(index);
					this.setCurrentDefaults();
				}
				if(key === 'cancel') {
					this.setCurrentDefaults();
				}
				if(key === 'delete') {
					this.deletingVendorIndex = index;
					this.isDeleteMessageShow = true;
				}
			},
			async approveDelete() {
				this.isDeleteMessageShow = false;
				this.currentEditingIndex = -1;
				const vendor = this.vendors[this.deletingVendorIndex];
				try {
					const isAssigned = await this.$http.get(`/vendorsapi/any-step?id=${ vendor._id }`);
					if(isAssigned.body) {
						return this.alertToggle({ message: "The vendor was assigned to a step and cannot be deleted.", isShow: true, type: "error" });
					}
					await this.deleteCurrentVendor({ id: vendor._id });
					this.alertToggle({ message: "Vendor removed", isShow: true, type: "success" });
				} catch (err) {
					this.alertToggle({ message: "Server error / Cannot delete the Vendor", isShow: true, type: "error" });
				}
			},
			cancelDelete() {
				this.deletingVendorIndex = -1;
				this.isDeleteMessageShow = false;
			},
			setStatus({ option }) {
				this.selectedStatus = option
			},
			setNative(value) {
        const {_id, lang} = this.filteredLanguages.find(({lang}) => lang === value.option)
				this.selectedNative = {_id, lang};
			},
			// setIndustry({ industry, index }) {
			// 	const position = this.industrySelected.findIndex(item => {
			// 		return item._id === industry._id
			// 	})
			// 	if(position !== -1) {
			// 		return this.industrySelected.splice(position, 1);
			// 	}
			// 	this.industrySelected.push(industry);
			// },
      setIndustries({ option }) {
        let industries = [ ...this.industrySelected ]
        const position = industries.findIndex(item => item.name === option)
        if (position !== -1) industries.splice(position, 1)
        else industries.push(this.getAllIndustries.find(item => item.name === option))
        this.industrySelected = industries
        // this.updateCurrentVendorGeneralData({ key: "industries", value: industries })
      },
			onRowClicked({ index }) {
				if(this.currentEditingIndex === index || this.currentEditingIndex !== -1 && this.currentEditingIndex !== index) {
					return
				}
				const vendor = this.vendors[index];
				this.$emit('goToVendor', vendor._id)
			}
		},
		computed: {
			...mapGetters({
				vendors: "getFilteredVendors",
				getAllLanguages: "getAllLanguages",
        getAllIndustries: "getAllIndustries",
      }),
      filteredLanguages() {
        let result = this.getAllLanguages;
        if(this.addAll) {
          result.unshift({lang: "All", symbol: "All"})
        }
        result = result.filter(item => {
          if(item.lang.toLowerCase().indexOf(this.searchLang.toLowerCase()) != -1) {
            return item
          }
        })
        return result;
      },
			selectedIndNames() {
				let result = [];
				for (let ind of this.industrySelected) {
					result.push(ind.name);
				}
				return result;
			}
		},
		components: {
      SelectMulti,
      SelectSingle,
			DataTable,
			Button
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";

  .vendors-table {
    position: relative;

    &__combinations {
      padding: 8px 5px;
    }

    &__industry-icon {
      width: 21px;
      height: 21px;
      margin-right: 5px;
    }

    &__industry {
      padding: 5px;
    }

    &__status,
    &__native,
    &__data {
      margin: 6px 5px;
      padding: 2px 0;
    }

    &__no-drop, &__data {
      display: flex;
      align-items: center;
      overflow-y: auto;
      box-sizing: border-box;
    }

    &__icons {
      margin-right: 16px;
      display: flex;
      justify-content: space-around;
      align-items: center;
    }

    &__icon {
      cursor: pointer;
    }

    &_opacity {
      opacity: 0.5;
    }

    &__drop-menu {
      position: relative;
    }

    &__active {
      box-shadow: $box-shadow;
    }

    &__input {
      border: none;
      outline: none;
      color: $main-color;
      padding: 2px;
      background-color: transparent;
    }

    &__error {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      background: transparent;
      padding: 0 15px;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &__error-message {
      position: relative;
      width: 300px;
      padding: 0 20px;
      border: 1px solid $orange;
      box-shadow: $box-shadow;
      background-color: $white;
      font-weight: bolder;
      font-size: 14px;
    }

    &__close {
      position: absolute;
      font-size: 24px;
      font-weight: 700;
      top: -2px;
      right: 5px;
      transform: rotate(45deg);
      cursor: pointer;
    }

    &__delete-approve {
      position: absolute;
      width: 332px;
      height: 270px;
      top: 10%;
      left: 50%;
      margin-left: -166px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      box-shadow: $box-shadow;
      background-color: $white;
      z-index: 20;

      p {
        font-size: 19px;
        width: 50%;
        text-align: center;
      }

      .approve-block {
        margin-bottom: 15px;
      }
    }

    &__button {
      margin-bottom: 5px;
    }

    &_flex-wrap {
      flex-wrap: wrap;
    }

    .checkbox {
      display: inline-flex;
      align-items: center;

      input[type="checkbox"] {
        opacity: 0;

        + {
          label {
            &::after {
              content: none;
            }
          }
        }

        &:checked {
          + {
            label {
              &::after {
                content: "";
              }
            }
          }
        }
      }

      label {
        position: relative;
        display: inline-block;
        padding-left: 22px;
        padding-top: 7px;

        &::before {
          position: absolute;
          content: "";
          display: inline-block;
          height: 16px;
          width: 16px;
          border: 1px solid $border;
          left: 0px;
          top: 3px;
        }

        &::after {
          position: absolute;
          content: "";
          display: inline-block;
          height: 5px;
          width: 9px;
          border-left: 2px solid;
          border-bottom: 2px solid;
          transform: rotate(-45deg);
          left: 4px;
          top: 7px;
        }
      }
    }
  }
</style>
