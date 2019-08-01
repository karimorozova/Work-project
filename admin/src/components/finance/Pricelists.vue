<template lang="pug">
.pricelists
    .pricelists__table
        SettingsTable(
            :fields="fields"
            :tableData="vuexPricelists"
        )
            template(slot="headerName" slot-scope="{ field }")
                .pricelists__head-title {{ field.label }}
            template(slot="headerClientDefault" slot-scope="{ field }")
                .pricelists__head-title {{ field.label }}
            template(slot="headerVendorDefault" slot-scope="{ field }")
                .pricelists__head-title {{ field.label }}
            template(slot="headerActive" slot-scope="{ field }")
                .pricelists__head-title {{ field.label }}
            template(slot="headerIcons" slot-scope="{ field }")
                .pricelists__head-title {{ field.label }}
            template(slot="name" slot-scope="{ row, index }")
                .pricelists__data.pricelists_pointer(v-if="currentActive !== index" @click="showRates(index)")
                    .pricelists__rates-link {{ row.name }}
                .pricelists__editing-data(v-else)
                    input.pricelists__text(type="text" v-model="currentName")
            template(slot="clientDefault" slot-scope="{ row, index }")
                .pricelists__data.pricelists_centered
                    CheckBox(:isChecked="row.isClientDefault" 
                        @check="(e) => setDefaultPricelist(e, index, 'isClientDefault')"
                        @uncheck="(e) => setDefaultPricelist(e, index, 'isClientDefault')")
            template(slot="vendorDefault" slot-scope="{ row, index }")
                .pricelists__data.pricelists_centered
                    CheckBox(:isChecked="row.isVendorDefault" 
                        @check="(e) => setDefaultPricelist(e, index, 'isVendorDefault')"
                        @uncheck="(e) => setDefaultPricelist(e, index, 'isVendorDefault')")
            template(slot="active" slot-scope="{ row, index }")
                .pricelists__data.pricelists_centered
                    Toggler(:isDisabled="false" :isActive="row.isActive" @toggle="toggleActive(index)")
            template(slot="icons" slot-scope="{ row, index }")
                .pricelists__icons
                    img.pricelists__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'pricelists_opacity': isActive(key, index)}")
        Add(@add="addPricelist")
        ValidationErrors(v-if="isErrorExist" 
            :errors="errors" 
            :isAbsolute="isErrorExist"
            @closeErrors="closeErrors")
    .pricelists__new(v-if="isNewPricelist")
        NewPricelist(:pricelists="pricelists" @cancel="cancelNewPricelist" @saved="refreshPricelists")
</template>

<script>
import SettingsTable from "../Table/SettingsTable";
import Add from "../Add";
import CheckBox from "../CheckBox";
import Toggler from "../Toggler";
import ValidationErrors from "../ValidationErrors";
import NewPricelist from "./pricelists/NewPricelist";
import { mapGetters, mapActions } from "vuex";
import crudIcons from "@/mixins/crudIcons";

export default {
    mixins: [crudIcons],
    data() {
        return {
            pricelists: [],
            fields: [
                {label: "Name", headerKey: "headerName", key: "name", width: "30%", padding: "0"},
                {label: "Default Client", headerKey: "headerClientDefault", key: "clientDefault", width: "20%", padding: "0"},
                {label: "Default Vendor", headerKey: "headerVendorDefault", key: "vendorDefault", width: "20%", padding: "0"},
                {label: "Active", headerKey: "headerActive", key: "active", width: "10%", padding: "0"},
                {label: "", headerKey: "headerIcons", key: "icons", width: "20%", padding: "0"},
            ],
            icons: {
                save: {icon: require("../../assets/images/Other/save-icon-qa-form.png")}, 
                edit: {icon: require("../../assets/images/Other/edit-icon-qa.png")},
                copy: {icon: require("../../assets/images/duplicate.jpg")},
                cancel: {icon: require("../../assets/images/cancel_icon.jpg")},
                delete: {icon: require("../../assets/images/Other/delete-icon-qa-form.png")}
            },
            isNewPricelist: false,
            currentActive: -1,
            currentName: "",
            isErrorExist: false,
            errors: []
        }
    },
    methods: {
        showRates(index) {
            this.storeCurrentPrice(this.pricelists[index]);
            this.storeMonoRates([...this.pricelists[index].monoRates]);
            this.storeDuoRates([...this.pricelists[index].duoRates]);
            this.$router.push("/settings/rates");
        },
        async makeAction(index, key) {
            if(this.currentActive !== -1 && this.currentActive !== index) {
                return
            }
            if(key === "edit") {
                this.currentActive = index;
                this.currentName = this.pricelists[index].name;
            }
            if(key === "save") {
                await this.checkErrors(index);
            }
            if(key === "copy") {
                await this.addPriceCopy(index);
            }
            if(key === "cancel") {
                await this.cancelEdition(index)
            }
            if(key === "delete") {
                await this.deletePricelist(index);
            }
        },
        isNameUnique(index) {
            const duplicateIndex = this.pricelists.findIndex((item, ind) => {
                return (ind !== index && this.currentName === item.name);
            })
            return duplicateIndex === -1;
        },
        async checkErrors(index) {
            if(this.currentActive === -1) return;
            this.errors = [];
            if(!this.currentName || !this.isNameUnique(index)) this.errors.push("The name should be unique and not empty.");
            if(this.errors.length) {
                return this.isErrorExist = true;
            }
            await this.savePricelist(index);
        },
        async savePricelist(index) {
            const pricelist = {
                ...this.pricelists[index],
                name: this.currentName
            }
            try {
                await this.$http.post("/prices/pricelist", { pricelist });
                await this.getPricelists();
                this.setDefaults();
                this.alertToggle({message: "Pricelist saved.", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: "Error on saving pricelist.", isShow: true, type: "error"});
            }
        },
        async addPriceCopy(index) {
            const name = this.setCopyPriceName(index);
            const pricelist = {
                name,
                copyName: this.pricelists[index].name,
                isDefault: false,
                isActive: false
            }
            try {
                await this.$http.post("/prices/new-pricelist", { pricelist });
                await this.getPricelists();
                this.alertToggle({message: "Pricelist saved.", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: "Error on copying pricelist.", isShow: true, type: "error"});
            }
        },
        setCopyPriceName(index) {
            const name = this.pricelists[index].name;
            const priceCopies = this.pricelists.filter((item, ind) => {
                return ind !== index && item.name.indexOf(`${name}-copy`) !== -1;
            });
            const copyQuantity = priceCopies.length ? priceCopies.length : "";
            return `${name}-copy${copyQuantity}`;
        },
        async deletePricelist(index) {
            const id = this.pricelists[index]._id;
            if(!id) {
                return this.pricelists.slice(index, 1);
            }
            const { isClientDefault, isVendorDefault } = this.pricelists[index];
            try {
                await this.$http.delete(`/prices/pricelist/${id}`, {body: { isClientDefault, isVendorDefault }});
                await this.getPricelists();
                this.alertToggle({message: "Pricelist deleted", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: "Error on deleting pricelist.", isShow: true, type: "error"});
            }
        },
        async setDefaultPricelist(e, index, prop) {
            if(this.pricelists[index][prop]) return;
            const newDefaultPriceId = this.pricelists[index]._id;
            const currentDefaultPrice = this.pricelists.find(item => item[prop]);
            const exDefaultPriceId = currentDefaultPrice._id;
            try {
                await this.$http.post("/prices/set-default", {
                    newDefaultPriceId, exDefaultPriceId, prop
                    });
                await this.getPricelists();
                this.alertToggle({message: "Changes saved", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: "Error: Cannot set the default pricelist", isShow: true, type: "error"});
            }
        },
        async toggleActive(index) {
            const isActive = !this.pricelists[index].isActive;
            try {
                await this.$http.post("/prices/activeness", {id: this.pricelists[index]._id, isActive});
                await this.getPricelists();
            } catch(err) {
                this.alertToggle({message: "Error: Cannot toggle the property", isShow: true, type: "error"});
            }
        },
        async refreshPricelists() {
            await this.getPricelists();
            this.cancelNewPricelist();
        },
        closeErrors() {
            this.isErrorExist = false;
        },
        cancelNewPricelist() {
            this.isNewPricelist = false;
        },
        cancelEdition(index) {
            if(!this.pricelists[index]._id) {
                this.pricelists.splice(index, 1);
            }
            this.setDefaults();
        },
        setDefaults() {
            this.currentActive = -1;
            this.currentName = "";
        },
        addPricelist() {
            this.isNewPricelist = true;
        },
        async getPricelists() {
            try {
                const result = await this.$http.get("/prices/pricelists");
                this.pricelists = result.body;
                await this.storePricelists(result.body);
            } catch(err) {
                this.alertToggle({message: "Error on getting pricelists.", isShow: true, type: "error"});
            }
        },
        ...mapActions({
            alertToggle: "alertToggle",
            storeCurrentPrice: "storeCurrentPrice",
            storeMonoRates: "storeMonoRates",
            storeDuoRates: "storeDuoRates",
            storePricelists: "storePricelists"
        })
    },
    computed: {
        ...mapGetters({
            vuexPricelists: "getPricelists"
        })
    },
    components: {
        SettingsTable,
        Add,
        Toggler,
        CheckBox,
        ValidationErrors,
        NewPricelist
    },
    created() {
        this.getPricelists();
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";
@import "../../assets/styles/settingsTable.scss";

.pricelists {
    margin: 20px;
    margin-left: 0;
    position: relative;
    &__table {
        @extend %setting-table;
        width: 800px;
    }
    &__data {
        @extend %table-data;
    }
    &_pointer {
        cursor: pointer;
        &:hover {
            .pricelists__rates-link {
                transition: all 0.3s;
                text-shadow: 0 0 5px $brown-shadow;
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
