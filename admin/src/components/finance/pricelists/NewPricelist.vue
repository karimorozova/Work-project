<template lang="pug">
  .new-price(:class="{'new-price_top-50': pricelists.length < 3}")
    .new-price__title Add a new Pricelist
    .new-price__row
      .new-price__item
        LabelVal(text="Name" customClass="new-chart-label" :isRequired="true")
          input.new-price__text(type="text" v-model="pricelistName")
      .new-price__item
        LabelVal(text="Copy from" customClass="new-chart-label")
          .new-price__drop-menu
            SelectSingle(
              :options="pricesNames"
              :selectedOption="selectedPricelist"
              @chooseOption="setPricelistForCopy"
              placeholder="Select"
            )
    .new-price__row-checkbox
      .new-price__item2
        LabelVal(text="Default Vendor" customClass="new-chart-label")
          CheckBox(:isChecked="isVendorDefault" @check="(e) => toggleProp(e, 'isVendorDefault')" @uncheck="(e) => toggleProp(e, 'isVendorDefault')")
        LabelVal(text="Active" customClass="new-chart-label")
          CheckBox(:isChecked="isActive" @check="(e) => toggleProp(e, 'isActive')" @uncheck="(e) => toggleProp(e, 'isActive')")
      .new-price__item2
        input.button__update-btn(v-if="selectedPricelist" type="submit" value="Clear Copy Input" @click="clearCopyForm()")

    .new-price__buttons
      .new-price__button
        Button(value="Save" @clicked="checkForErrors")
      .new-price__button
        Button(value="Cancel" @clicked="cancel")
    ValidationErrors(v-if="isErrorExist"
      :errors="errors"
      :isAbsolute="isAbsolute"
      @closeErrors="closeErrors")
</template>

<script>
	import LabelVal from "@/components/LabelVal";
	import Toggler from "@/components/Toggler";
	import CheckBox from "@/components/CheckBox";
	import SelectSingle from "@/components/SelectSingle";
	import ValidationErrors from "@/components/ValidationErrors";
	import Button from "@/components/Button";
	import { mapActions } from "vuex";

	export default {
		props: {
			pricelists: {
				type: Array
			}
		},
		data() {
			return {
				pricelistName: "",
				isClientDefault: false,
				isVendorDefault: false,
				isActive: false,
				selectedPricelist: "",
				isErrorExist: "",
				errors: [],
				isAbsolute: true
			}
		},
		methods: {
			clearCopyForm() {
				this.selectedPricelist = "";
			},
			toggleProp(e, prop) {
				this[prop] = !this[prop];
			},
			isNotUnique() {
				return this.pricelists.find(item => {
					return (item.name.toLowerCase() === this.pricelistName.toLowerCase().trim());
				});
			},
			closeErrors() {
				this.isErrorExist = false;
			},
			async checkForErrors() {
				this.errors = [];
				if(!this.pricelistName || this.isNotUnique()) this.errors.push("The name should be unique and not empty.");
				if(this.errors.length) {
					return this.isErrorExist = true;
				}
				await this.savePricelist();
			},
			async savePricelist() {
				const pricelist = {
					name: this.pricelistName,
					copyName: this.selectedPricelist,
					isClientDefault: this.isClientDefault,
					isVendorDefault: this.isVendorDefault,
					isActive: this.isActive
				};
				try {
					await this.$http.post("/prices/new-pricelist", { pricelist });
					await this.updateDefaultPricelists();
					this.$emit('saved');
					this.alertToggle({ message: "Pricelist saved", isShow: true, type: "success" });
				} catch (err) {
					this.alertToggle({ message: "Error: Cannot save pricelist", isShow: true, type: "error" });
				}
			},
			async updateDefaultPricelists() {
				try {
					if(this.isClientDefault) {
						let defaultClientPrice = this.pricelists.find(item => item.isClientDefault);
						defaultClientPrice.isClientDefault = false;
						await this.$http.post('/prices/pricelist', { pricelist: { ...defaultClientPrice } });
					}
					if(this.isVendorDefault) {
						let defaultVendorPrice = this.pricelists.find(item => item.isVendorDefault);
						defaultVendorPrice.isVendorDefault = false;
						await this.$http.post('/prices/pricelist', { pricelist: { ...defaultVendorPrice } });
					}
				} catch (err) {
					this.alertToggle({ message: "Error on updating Pircelist", isShow: true, type: "error" });
				}
			},
			cancel() {
				this.$emit('cancel');
			},
			setPricelistForCopy({ option }) {
				this.selectedPricelist = option;
			},
			...mapActions({
				alertToggle: "alertToggle",
				saveNewPricelist: "saveNewPricelist"
			})
		},
		computed: {
			pricesNames() {
				return this.pricelists.map(item => item.name);
			}
		},
		components: {
			LabelVal,
			Toggler,
			CheckBox,
			SelectSingle,
			ValidationErrors,
			Button
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .button {
    &__update-btn {
      width: 120px;
      height: 32px;
      color: #66563d;
      font-size: 14px;
      border-radius: 4px;
      box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
      background-color: #DDD3C8;
      border: 1px solid #DDD3C8;
      cursor: pointer;
      outline: 0;
      line-height: 32px;

      &:active {
        transform: scale(.98);
        outline: none !important;
        outline-color: none;
        border: none;
      }
    }
  }

  .new-price {
    width: 600px;
    display: flex;
    flex-direction: column;
    position: relative;
    background-color: $white;
    box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
    padding: 20px;

    &_top-50 {
      top: 50px;
    }

    &__title {
      margin-bottom: 25px;
      font-size: 22px;
    }

    &__row {
      display: flex;
      justify-content: space-between;
    }

    &__row-checkbox {
      display: flex;
      justify-content: space-between;
    }

    &__item {
      margin-bottom: 20px;
      width: 270px;
    }

    &__item2 {
      width: 120px;
      margin-bottom: 20px;
    }

    &__text {
      font-size: 14px;
      color: $text;
      border: 1px solid $border;
      border-radius: 4px;
      box-sizing: border-box;
      padding: 0 7px;
      outline: none;
      width: 220px;
      height: 32px;
      transition: .1s ease-out;

      &:focus {
        border: 1px solid $border-focus;
      }
    }

    &__drop-menu {
      position: relative;
      width: 220px;
      height: 32px;
    }

    &__buttons {
      display: flex;
      justify-content: center;
      margin-top: 10px;
    }

    &__button {
      margin-left: 15px;
    }
  }
</style>
