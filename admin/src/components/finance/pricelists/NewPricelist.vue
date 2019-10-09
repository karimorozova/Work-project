<template lang="pug">
    .new-price(:class="{'new-price_top-50': pricelists.length < 3}")
        .new-price__title Add a new Pricelist
        .new-price__row
            .new-price__col
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
            .new-price__col.new-price_width-120
                .new-price__item
                    LabelVal(text="Default Client" customClass="new-chart-label")
                        CheckBox(:isChecked="isClientDefault" @check="(e) => toggleProp(e, 'isClientDefault')" @uncheck="(e) => toggleProp(e, 'isClientDefault')")
                .new-price__item
                    LabelVal(text="Default Vendor" customClass="new-chart-label")
                        CheckBox(:isChecked="isVendorDefault" @check="(e) => toggleProp(e, 'isVendorDefault')" @uncheck="(e) => toggleProp(e, 'isVendorDefault')")
                .new-price__item
                    LabelVal(text="Active" customClass="new-chart-label")
                        CheckBox(:isChecked="isActive" @check="(e) => toggleProp(e, 'isActive')" @uncheck="(e) => toggleProp(e, 'isActive')")
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
import { mapGetters, mapActions } from "vuex";

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
        toggleProp(e, prop) {
            this[prop] = !this[prop];
        },
        isNotUnique() {
            const duplicateName = this.pricelists.find(item => {
                return (item.name.toLowerCase() === this.pricelistName.toLowerCase().trim());
            })
            return duplicateName;
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
            } 
            try {
                await this.$http.post("/prices/new-pricelist", { pricelist });
                await this.updateDefaultPricelists();
                this.$emit('saved');
                this.alertToggle({message: "Pricelist saved", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: "Error: Cannot save pricelist", isShow: true, type: "error"});
            }
        },
        async updateDefaultPricelists() {
            try {
                if(this.isClientDefault) {
                    let defaultClientPrice = this.pricelists.find(item => item.isClientDefault);
                    defaultClientPrice.isClientDefault = false;
                    await this.$http.post('/prices/pricelist', { pricelist: {...defaultClientPrice} });
                }
                if(this.isVendorDefault) {
                    let defaultVendorPrice = this.pricelists.find(item => item.isVendorDefault);
                    defaultVendorPrice.isVendorDefault = false;
                    await this.$http.post('/prices/pricelist', { pricelist: {...defaultVendorPrice} });
                }
            } catch(err) {
                this.alertToggle({message: "Error on updating Pircelist", isShow: true, type: "error"});
            }
        },
        cancel() {
            this.$emit('cancel');
        },
        setPricelistForCopy({option}) {
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

.new-price {
    width: 60%;
    display: flex;
    flex-direction: column;
    position: relative;
    background-color: $white;
    box-shadow: 0 0 10px $brown-shadow;
    padding: 20px;
    &_top-50 {
        top: 50px;
    }
    &__title {
        margin-bottom: 20px;
    }
    &__row {
        display: flex;
        justify-content: space-between;
    }
    &__col {
        width: 270px;
    }
    &_width-120 {
        width: 120px;
    }
    &__item {
        margin-bottom: 20px;
    }
    &__text {
        width: 191px;
        height: 30px;
        color: $main-color;
        padding: 0 5px;
        box-sizing: border-box;
        border: 1px solid $main-color;
        border-radius: 5px;
        outline: none;
        transition: all 0.2s;
        &:focus {
            box-shadow: 0 0 5px $brown-shadow;
        }
    }
    &__drop-menu {
        position: relative;
        width: 191px;
        height: 30px;
    }
    &__buttons {
        display: flex;
        justify-content: flex-end;
    }
    &__button {
        margin-left: 15px;
    }
}
</style>
