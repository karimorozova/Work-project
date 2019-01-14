<template lang="pug">
.lead-sources
    SettingsTable(
        :fields="fields"
        :tableData="sources"
        :errors="errors"
        :areErrors="areErrors"
        :isApproveModal="isDeleting"
        @closeErrors="closeErrors"
        @approve="deleteSource"
        @notApprove="setDefaults"
        @closeModal="setDefaults"
    )
        template(slot="headerTitle" slot-scope="{ field }")
            span.lead-sources__head-title {{ field.label }}
        template(slot="headerIcons" slot-scope="{ field }")
            span.lead-sources__head-title {{ field.label }}
        template(slot="title" slot-scope="{ row, index }")
            .lead-sources__data(v-if="currentActive !== index") {{ row.source }}
            .lead-sources__editing-data(v-else) 
                input.lead-sources__input(type="text" v-model="currentSourceName")
        template(slot="icons" slot-scope="{ row, index }")
            .lead-sources__icons
                img.lead-sources__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'lead-sources_opacity': isActive(key, index)}")
    Add(@add="addSource")
</template>

<script>
import SettingsTable from "./SettingsTable";
import Add from "../Add";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            fields: [
                {label: "Source", headerKey: "headerTitle", key: "title", width: "65%", padding: "0"},
                {label: "", headerKey: "headerIcons", key: "icons", width: "35%", padding: "0"},
            ],
            sources: [],
            icons: {
                save: {icon: require("../../assets/images/Other/save-icon-qa-form.png"), active: false}, 
                edit: {icon: require("../../assets/images/Other/edit-icon-qa.png"), active: true},
                cancel: {icon: require("../../assets/images/cancel_icon.jpg"), active: true},
                delete: {icon: require("../../assets/images/Other/delete-icon-qa-form.png"), active: true}
            },
            currentActive: -1,
            currentSourceName: "",
            areErrors: false,
            errors: [],
            isDeleting: false,
            deleteIndex: -1
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
        isEditing() {
            this.errors = ["Please, finish current edition first."];
            this.areErrors = true;
        },
        async makeAction(index, key) {
            if(this.currentActive !== -1 && this.currentActive !== index) {
                return this.isEditing();
            }
            if(key === "edit") {
                this.currentActive = index;
                this.currentSourceName = this.sources[index].source;
            }
            if(key === "save") {
                await this.checkErrors(index);
            }
            if(key === "cancel") {
                this.cancelEdition(index);
            }
            if(key === "delete") {
                if(!this.sources[index]._id) {
                    this.sources.splice(index, 1);
                    return this.setDefaults();
                }
                this.deleteIndex = index;
                this.isDeleting = true;
            }
        },
        async checkErrors(index) {
            this.errors = [];
            if(!this.currentSourceName || !this.isTitleUnique(index)) this.errors.push("Title should not be empty and be unique!");
            if(this.errors.length) {
                this.areErrors = true;
                return
            }
            await this.saveSource(index);
            this.setDefaults();
        },
        isTitleUnique(index) {
            const duplicateIndex = this.sources.findIndex((item, ind) => {
                if(index !== ind && item.source === this.sources[index].source) {
                    return item;
                }
            })
            return duplicateIndex === -1;
        },
        closeErrors() {
            this.areErrors = false;
        },
        cancelEdition(index) {
            if(!this.sources[index]._id) {
                this.sources.splice(index, 1);
            }
            this.setDefaults();
        },
        setDefaults() {
            this.currentActive = -1;
            this.currentSourceName = "";
            this.isDeleting = false;
        },
        async saveSource(index) {
            if(this.currentActive === -1) return;
            this.sources[index].source = this.currentSourceName;
            try {
                await this.$http.post("/api/leadsource", {leadSource: this.sources[index]});
                await this.getSources();
                this.alertToggle({message: "Lead source saved", isShow: true, type: 'success'})
            } catch(err) {
                this.alertToggle({message: "Error on creating new lead source", isShow: true, type: 'error'})
            }
        },
        async deleteSource() {
            const index = this.deleteIndex;
            const id = this.sources[index]._id;
            try {
                await this.$http.delete(`/api/leadsource/${id}`);
                this.sources.splice(index, 1);
                this.alertToggle({message: "Lead source deleted", isShow: true, type: 'success'})
            } catch(err) {
                this.alertToggle({message: "Error on lead source deleting", isShow: true, type: 'error'})
            }
            this.setDefaults();
        },
        async getSources() {
            try {
                const result = await this.$http.get("/api/leadsources");
                this.sources = result.body;
            } catch(err) {
                this.alertToggle({message: "Error on getting lead sources.", isShow: true, type: "error"});
            }
        },
        addSource() {
            if(this.currentActive !== -1) {
                return this.isEditing();
            }
            this.sources.push({source: ""});
            this.currentActive = this.sources.length - 1;
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
        this.getSources();
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.lead-sources {
    width: 400px;
    background-color: $white;
    padding: 20px;
    box-shadow: 0 0 10px $main-color;
    position: relative;
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
    &__input {
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
