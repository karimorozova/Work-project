<template lang="pug">
.packages
    SettingsTable(
        :fields="fields"
        :tableData="packages"
        :errors="errors"
        :areErrors="areErrors"
        :isApproveModal="isDeleting"
        @closeErrors="closeErrors"
        @approve="deletePackage"
        @notApprove="setDefaults"
        @closeModal="setDefaults"
    )
        template(slot="headerName" slot-scope="{ field }")
            .packages__head-title {{ field.label }}
        template(slot="headerSize" slot-scope="{ field }")
            .packages__head-title {{ field.label }}
        template(slot="headerIcons" slot-scope="{ field }")
            .packages__head-title {{ field.label }}
        template(slot="name" slot-scope="{ row, index }")
            .packages__data(v-if="currentActive !== index") {{ row.name }}
            .packages__editing-data(v-else)
                input.packages__data-input(type="text" v-model="currentName")
        template(slot="size" slot-scope="{ row, index }")
            .packages__data(v-if="currentActive !== index") {{ row.size }}
            .packages__editing-data(v-else)
                input.packages__data-input(type="text" v-model="currentSize")
        template(slot="icons" slot-scope="{ row, index }")
            .packages__icons
                img.packages__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'packages_opacity': isActive(key, index)}")
    Add(@add="addPackage")
</template>

<script>
import SettingsTable from "./SettingsTable";
import Add from "../Add";
import { mapGetters, mapActions } from "vuex";
import crudIcons from "@/mixins/crudIcons";

export default {
    mixins: [crudIcons],
    data() {
        return {
            fields: [
                {label: "Name", headerKey: "headerName", key: "name", width: "38%", padding: "0"},
                {label: "Size", headerKey: "headerSize", key: "size", width: "38%", padding: "0"},
                {label: "", headerKey: "headerIcons", key: "icons", width: "24%", padding: "0"},
            ],
            packages: [],
            currentActive: -1,
            currentName: "",
            currentSize: "",
            areErrors: false,
            errors: [],
            isDeleting: false,
            deleteIndex: -1
        }
    },
    methods: {
        async makeAction(index, key) {
            if(this.currentActive !== -1 && this.currentActive !== index) {
                return this.isEditing();
            }
            if(key === "edit") {
                this.currentActive = index;
                this.currentName = this.packages[index].name;
                this.currentSize = this.packages[index].size
            }
            if(key === "save") {
                await this.checkErrors(index);
            }
            if(key === "cancel") {
                this.cancelEdition(index)
            }
            if(key === "delete") {
                if(!this.packages[index]._id) {
                    this.packages.splice(index, 1);
                    return this.setDefaults();
                }
                this.deleteIndex = index;
                this.isDeleting = true;
            }
        },
        async checkErrors(index) {
            this.errors = [];
            const sizeRegEx = /^[1-9][0-9]*$/;
            if(!this.currentName || !this.isTitleUnique(index)) this.errors.push("Name should not be empty and be unique!");
            if(!this.currentSize || !sizeRegEx.test(this.currentSize)) this.errors.push("Please, set the valid size of the package.");
            if(this.errors.length) {
                this.areErrors = true;
                return
            }
            await this.savePackage(index);
            this.setDefaults();
        },
        isTitleUnique(index) {
            const duplicateIndex = this.packages.findIndex((item, ind) => {
                if(index !== ind && item.name.toLowerCase() === this.currentName.toLowerCase().trim()) {
                    return item;
                }
            })
            return duplicateIndex === -1;
        },
        closeErrors() {
            this.areErrors = false;
        },
        async savePackage(index) {
            if(this.currentActive === -1) return;
            this.packages[index].name = this.currentName;
            this.packages[index].size = this.currentSize;
            try {
                await this.$http.post("/api/package", {package: this.packages[index]});
                this.setDefaults();
                await this.getPackages();
                this.alertToggle({message: "Package saved", isShow: true, type: 'success'})
            } catch(err) {
                this.alertToggle({message: "Error on creating a new package", isShow: true, type: 'error'})
            }
        },
        async deletePackage() {
            const index = this.deleteIndex;
            const id = this.packages[index]._id;
            try {
                await this.$http.delete(`/api/package/${id}`);
                this.packages.splice(index, 1);
                this.setDefaults();
                this.alertToggle({message: "Package deleted", isShow: true, type: 'success'})
            } catch(err) {
                this.alertToggle({message: "Error on package deleting", isShow: true, type: 'error'})
            }
            this.setDefaults();
        },
        cancelEdition(index) {
            if(!this.packages[index]._id) {
                this.packages.splice(index, 1);
            }
            this.setDefaults();
        },
        setDefaults() {
            this.currentActive = -1;
            this.currentName = "";
            this.currentSize = "";
            this.isDeleting = false;
        },
        addPackage() {
            if(this.currentActive !== -1) {
                return this.isEditing();
            }
            this.packages.push({name: "", size: ""});
            this.currentActive = this.packages.length - 1;
        },
        async getPackages() {
            try {
                const result = await this.$http.get("/api/packages");
                this.packages = result.body;
            } catch(err) {
                this.alertToggle({message: "Error on getting packages.", isShow: true, type: "error"});
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
        this.getPackages();
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";
@import "../../assets/styles/settingsTable";

.packages {
    @extend %setting-table;
    width: 600px;
    &__data, &__editing-data {
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
        box-sizing: border-box;
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
}
</style>
