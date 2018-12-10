<template lang="pug">
.pricelists
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
            .pricelists__data(v-if="currentActive !== index") {{ row.name }}
            .pricelists__editing-data(v-else)
                input.pricelists__text(type="text" v-model="currentName")
        template(slot="default" slot-scope="{ row, index }")
            .pricelists__data.pricelists_centered
                input.pricelists__check(type="checkbox" v-model="row.default" :disabled="currentActive !== index")
        template(slot="active" slot-scope="{ row, index }")
            .pricelists__data.pricelists_centered
                input.pricelists__check(type="checkbox" v-model="row.active" :disabled="currentActive !== index")
        template(slot="icons" slot-scope="{ row, index }")
            .pricelists__icons
                img.pricelists__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'pricelists_opacity': isActive(key, index)}")
    Add(@add="addPricelist")
</template>

<script>
import SettingsTable from "./SettingsTable";
import Add from "../Add";
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
        async makeAction(index, key) {
            if(this.currentActive !== -1 && this.currentActive !== index) {
                return
            }
            if(key === "edit") {
                this.currentActive = index;
                this.currentName = this.pricelists[index].name;
            }
            if(key === "save") {
                this.currentActive = -1;
                await this.checkErrors(index);
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
            if(!this.currentName && !this.isNameUnique) this.errors.push("The name should be unique and not empty.");
            if(this.errors.length) {
                return this.isErrorExist = true;
            }
            await this.savePackage(index);
        },
        async savePackage(index) {
            const pricelist = {
                ...this.pricelists[index],
                name: this.currentName
            }
            try {
                await this.$http.post("/prices/pricelist", { pricelist });
                await this.getPricelists();
                this.alertToggle({message: "Pricelist saved.", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: "Error on saving pricelist.", isShow: true, type: "error"});
            }
        },
        async deletePricelist(index) {
            const id = this.pricelists[index]._id;
            if(!id) {
                return this.pricelists.slice(index, 1);
            }
            try {
                await this.$http.delete(`/prices/pricelist/${id}`);
                this.alertToggle({message: "Pricelist deleted.", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: "Error on deleting pricelist.", isShow: true, type: "error"});
            }
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
            alertToggle: "alertToggle"
        })
    },
    components: {
        SettingsTable,
        Add
    },
    mounted() {
        this.getPricelists();
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.pricelists {
    width: 700px;
    box-shadow: 0 0 10px $main-color;
    padding: 20px;
    &__data {
        padding: 5px 3px;
    }
    &__editing-data {
        padding: 4px 0;
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
}
</style>
