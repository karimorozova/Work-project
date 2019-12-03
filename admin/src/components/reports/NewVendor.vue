<template lang="pug">
    .new-vendor
        span.new-vendor__close(@click="close") +
        h3.new-vendor__title New Vendor for Reporting
        .main
            .main__error-message.main_left-0(v-if="isVendorExists") Error: Vendor {{ name }} already exists!
            .main__item
                LabelVal(text="First Name:" customClass="new-chart-label" :isRequired="true")
                    input.main__text(type="text" v-model="firstName" @input="isVendorExists = false")
                    .main__error-message(v-if="isSaveClicked && !firstName.trim()") Required
            .main__item
                LabelVal(text="Surname:" customClass="new-chart-label")
                    input.main__text(type="text" v-model="surname" @input="isVendorExists = false")
            .main__item
                LabelVal(text="Language:" customClass="new-chart-label" :isRequired="true")
                    .main__drop
                        SelectSingle(
                            placeholder="Select"
                            :hasSearch="true"
                            :options="targets"
                            :selectedOption="language"
                            @chooseOption="setLanguage"
                        )
                    .main__error-message(v-if="isSaveClicked && !language") Required
            .table
                DataTable(
                    :fields="fields"
                    :tableData="industriesData"
                    bodyClass="tbody_visible-overflow"
                    tableheadRowClass="tbody_visible-overflow"
                )
                    .table__head(slot="headerIndustry" slot-scope="{ field }") {{ field.label }}
                    .table__head(slot="headerTqi" slot-scope="{ field }") {{ field.label }}
                    .table__head(slot="headerBasic" slot-scope="{ field }") {{ field.label }}
                    .table__data(slot="industry" slot-scope="{ row }") {{ row.industry }}
                    .table__data(slot="tqi" slot-scope="{ row, index }")
                        input.table__text(type="text" :value="row.tqi" @input="(e) => setTqi(e, index)")
                    .table__data(slot="basicPrice" slot-scope="{ row, index }")
                        input.table__text(type="text" :value="row.basicPrice" @input="(e) => setPrice(e, index)")
            .buttons
                .buttons__button
                    Button(value="Save" @clicked="checkData")
                .buttons__button
                    Button(value="Cancel" @clicked="close")
</template>

<script>
import LabelVal from "@/components/LabelVal";
import SelectSingle from "@/components/SelectSingle";
import DataTable from "@/components/DataTable";
import Button from "@/components/Button";
import { mapActions } from "vuex";

export default {
    props: {
        languages: {type: Array, default: () => []}
    },
    data() {
        return {
            language: "",
            firstName: "",
            surname: "",
            fields: [
                {label: "Industry", headerKey: "headerIndustry", key: "industry", width: "40%"},
                {label: "TQI", headerKey: "headerTqi", key: "tqi", width: "30%"},
                {label: "Basic Price", headerKey: "headerBasic", key: "basicPrice", width: "30%"}
            ],
            industriesData: [
                {industry: "iGaming", tqi: "", basicPrice: ""},
                {industry: "Finance", tqi: "", basicPrice: ""},
            ],
            isSaveClicked: false,
            isVendorExists: false
        }
    },
    methods: {
        ...mapActions(["alertToggle"]),
        setLanguage({option}) {
            this.language = option;
        },
        close() {
            this.$emit("close")
        },
        async checkData() {
            if(!this.firstName || !this.language) {
                return this.isSaveClicked = true;
            }
            try {
                const result = await this.$http.get(`/reportsapi/check-vendor?name=${this.name}`);
                if(result.body.length) {
                    return this.isVendorExists = true;
                }
                this.$emit("saveVendor", {industriesData: this.industriesData, name: this.name, language:this.language});
            } catch(err) {
                this.alertToggle({message: "Error on checking Vendor for exictence", isShow: true, type: "error"});
            }
        },
        setTqi(e, index) {
            const { value } = e.target;
            const regex = /^[0-9]+$/;
            let characters = value.split("").filter(item => regex.test(item));
            characters = characters[0] === "0" ? characters.slice(1) : characters;
            const clearedValue = characters.join("");
            const tqiValue = +clearedValue > 100 ? 100 : clearedValue;
            e.target.value = tqiValue;
            this.industriesData[index].tqi = tqiValue;            
        },
        setPrice(e, index) {
            let { value } = e.target;
            let values = value.split(".");
            if(values.length > 2) {
                values = values.slice(0, 2);
            }
            values = values.map((val, i) => {
                const regex = /^[0-9]+$/;
                let characters = val.split("").filter(item => regex.test(item));
                const validValue = i === 0 && characters.length > 1 ? +characters.join("") : characters.join("");
                return validValue;
            })
            e.target.value = values.join(".");
            this.industriesData[index].basicPrice = values.join(".");
        }
    },
    computed: {
        targets() {
            return this.languages.filter(item => item !== 'All');
        },
        name() {
            let firstName = this.firstName.trim();
            let surname = this.surname.trim();
            if(firstName) {
                firstName = firstName.split("")[0].toUpperCase() + firstName.split("").slice(1).join("");
            }
            if(surname) {
                surname = surname.split("")[0].toUpperCase() + surname.split("").slice(1).join("");
            }
            return `${firstName} ${surname}`; 
        }
    },
    components: {
        LabelVal,
        SelectSingle,
        DataTable,
        Button
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.new-vendor {
    width: 500px;
    position: absolute;
    top: 25%;
    left: 35%;
    margin-left: -250px;
    background-color: $white;
    padding: 20px;
    box-sizing: border-box;
    border: 1px solid $main-color;
    box-shadow: 0 0 10px $main-color;
    &__close {
        position: absolute;
        top: 0;
        right: 10px;
        font-size: 28px;
        font-weight: 700;
        transform: rotate(45deg);
        cursor: pointer;
    }
    &__title {
        text-align: center;
    }
}

.main {
    display: flex;
    flex-direction: column;
    margin-top: 30px;
    position: relative;
    &__item {
        margin-bottom: 20px;
        width: 60%;
        position: relative;
    }
    &__drop {
        position: relative;
        width: 191px;
        height: 30px;
    }
    &__text {
        width: 191px;
        height: 30px;
        box-sizing: border-box;
        padding: 0 5px;
        color: $main-color;
        outline: none;
        border: 1px solid $main-color;
        border-radius: 5px;
    }
    &__error-message {
        color: $red;
        position: absolute;
        right: -60px;
        top: 8px;
    }
    &_left-0 {
        left: 0;
        top: -25px;
    }
}

.table {
    &__text {
        box-sizing: border-box;
        height: 100%;
        width: 100%;
        padding: 0 5px;
        color: $main-color;
        outline: none;
        border: none;
        background: transparent;
    }
}

.buttons {
    display: flex;
    justify-content: center;
    &__button {
        margin: 0 10px;
    }
}

</style>
