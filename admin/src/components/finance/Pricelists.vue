<template lang="pug">
.pricelists
    .pricelists__table
        SettingsTable(
            :fields="fields"
            :tableData="pricelists"
        )
            template(slot="headerName" slot-scope="{ field }")
                .pricelists__head-title {{ field.label }}
            template(slot="headerDefault" slot-scope="{ field }")
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
            template(slot="default" slot-scope="{ row, index }")
                .pricelists__data.pricelists_centered
                    input.pricelists__check(type="checkbox" :checked="row.isDefault" :disabled="row.isDefault" @change="(e) => setDefaultPricelist(e, index)")
            template(slot="active" slot-scope="{ row, index }")
                .pricelists__data.pricelists_centered
                    input.pricelists__check(type="checkbox" :checked="row.isActive" :disabled="currentActive !== index")
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
import ValidationErrors from "../ValidationErrors";
import NewPricelist from "./pricelists/NewPricelist";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            pricelists: [],
            fields: [
                {label: "Name", headerKey: "headerName", key: "name", width: "40%", padding: "0"},
                {label: "Default", headerKey: "headerDefault", key: "default", width: "15%", padding: "0"},
                {label: "Active", headerKey: "headerActive", key: "active", width: "15%", padding: "0"},
                {label: "", headerKey: "headerIcons", key: "icons", width: "30%", padding: "0"},
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
        isActive(key, index) {
            if(this.currentActive === index) {
                return key !== "edit";
            }
            if(this.currentActive !== index) {
                return key !== "save" && key !== "cancel";
            }
        },
        showRates(index) {
            this.storeCurrentPrice(this.pricelists[index]);
            this.$router.push("/finance/rates");
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
                await this.$http.post("/prices/new-pricelist", pricelist);
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
            try {
                await this.$http.delete(`/prices/pricelist/${id}`, {body: {isDefault: this.pricelists[index].isDefault}});
                await this.getPricelists();
                this.alertToggle({message: "Changes saved", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: "Error on deleting pricelist.", isShow: true, type: "error"});
            }
        },
        async setDefaultPricelist(e, index) {
            const isDefault = e.target.checked;
            if(!isDefault) return;
            try {
                await this.$http.post("/prices/set-default", {id: this.pricelists[index]._id, isDefault});
                await this.getPricelists();
                this.alertToggle({message: "Pricelist deleted.", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: "Error: Cannot set the default pricelist", isShow: true, type: "error"});
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
            } catch(err) {
                this.alertToggle({message: "Error on getting pricelists.", isShow: true, type: "error"});
            }
        },
        ...mapActions({
            alertToggle: "alertToggle",
            storeCurrentPrice: "storeCurrentPrice"
        })
    },
    components: {
        SettingsTable,
        Add,
        ValidationErrors,
        NewPricelist
    },
    mounted() {
        this.getPricelists();
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.pricelists {
    margin: 20px;
    &__table {
        width: 700px;
        box-shadow: 0 0 10px $main-color;
        padding: 20px;
        position: relative;
    }
    &__data, &__editing-data {
        box-sizing: border-box;
        padding: 5px;
        height: 28px;
        display: flex;
        align-items: center;
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
        box-shadow: inset 0 0 7px $brown-shadow;
    }
    &__text {
        box-sizing: border-box;
        padding-left: 3px;
        width: 100%;
        border: none;
        outline: none;
        color: $main-color;
    }
    &__icons {
        padding-top: 3px;
        display: flex;
        justify-content: center;
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
    &_centered {
        display: flex;
        justify-content: center;
    }
    &__new {
        width: 600px;
        margin-top: 20px;
        padding: 20px;
        box-shadow: 0 0 10px $main-color;
    }
}
</style>
