<template lang="pug">
.new-price
    .new-price__title Add a new Pricelist
    .new-price__main
        .new-price__block
            .new-price__item
                LabelVal(text="Name:")
                    input.new-price__text(type="text" v-model="pricelistName")
            .new-price__item
                LabelVal(text="Copy from:")
                    .new-price__drop-menu
                        SelectSingle(
                            :options="pricesNames"
                            :selectedOption="selectedPircelist"
                            @chooseOption="setPricelistForCopy"
                            placeholder="Select"
                        )
        .new-price__block
            .new-price__item.new-price_less-width
                LabelVal(text="Default:")
                    Toggler(
                        :isDisabled="isTogglerDisabled" 
                        :isActive="isPricelistDefault"
                        @toggle="toggleDefault")
            .new-price__item.new-price_less-width
                LabelVal(text="Active:")
                    Toggler(
                        :isDisabled="isTogglerDisabled"
                        :isActive="isPricelistActive"
                        @toggle="toggleActive")
    .new-price__buttons
        .new-price__save
            Button(value="Save" @clicked="savePricelist")
        .new-price__cancel
            Button(value="Cancel" @clicked="cancel")
</template>

<script>
import LabelVal from "../../LabelVal";
import Toggler from "../../Toggler";
import SelectSingle from "../../SelectSingle";
import Button from "../../Button";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        prices: {
            type: Array
        }
    },
    data() {
        return {
            pricelistName: "",
            isTogglerDisabled: false,
            isPricelistDefault: false,
            isPricelistActive: false,
            selectedPircelist: ""
        }
    },
    methods: {
        toggleDefault() {
            this.isPricelistDefault = !this.isPricelistDefault;
        },
        toggleActive() {
            this.isPricelistActive = !this.isPricelistActive;
        },
        async savePricelist() {
            const pricelist = {
                name: this.pricelistName,
                copyName: this.selectedPircelist,
                isDefault: this.isPricelistDefault,
                isActive: this.isPricelistActive
            } 
            try {
                await this.$http.post("/prices/new-pricelist", pricelist);
                this.$emit('saved');
                this.alertToggle({message: "Pricelist saved", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: "Error: Cannot save pricelist", isShow: true, type: "error"});
            }
        },
        cancel() {
            this.$emit('cancel');
        },
        setPricelistForCopy({option}) {
            this.selectedPircelist = option;
        },
        ...mapActions({
            alertToggle: "alertToggle",
            saveNewPricelist: "saveNewPricelist"
        })
    },
    computed: {
        pricesNames() {
            return this.prices.map(item => item.name);
        }
    },
    components: {
        LabelVal,
        Toggler,
        SelectSingle,
        Button
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.new-price {
    display: flex;
    flex-direction: column;
    &__title {
        font-size: 24px;
        margin-bottom: 20px;
    }
    &__main {
        display: flex;
        justify-content: space-between;
    }
    &__block {
        width: 46%;
        &:last-child {
            width: 30%;
        }
    }
    &__item {
        margin-bottom: 20px;
    }
    &__text {
        width: 191px;
        height: 28px;
        color: $main-color;
        padding-left: 5px;
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
        height: 28px;
    }
    &_less-width {
        width: 80%;
    }
    &__buttons {
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
    }
    &__save {
        margin-right: 15px;
    }
}
</style>
