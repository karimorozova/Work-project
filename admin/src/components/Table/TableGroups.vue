<template lang="pug">
.groups
    SettingsTable(
        :fields="fields"
        :tableData="groups"
        :errors="errors"
        :areErrors="areErrors"
        :isApproveModal="isDeleting"
        @closeErrors="closeErrors"
        @approve="deleteGroup"
        @notApprove="setDefaults"
        @closeModal="setDefaults"
    )
        template(slot="headerTitle" slot-scope="{ field }")
            span.groups__head-title {{ field.label }}
        template(slot="headerIcons" slot-scope="{ field }")
            span.groups__head-title {{ field.label }}
        template(slot="title" slot-scope="{ row, index }")
            .groups__data(v-if="currentActive !== index") {{ row.name }}
            .groups__editing-data(v-else) 
                input.groups__input(type="text" v-model="currentGroupName")
        template(slot="icons" slot-scope="{ row, index }")
            .groups__icons
                img.groups__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'groups_opacity': isActive(key, index)}")
    Add(@add="addGroup")
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
                {label: "Group", headerKey: "headerTitle", key: "title", width: "65%", padding: "0"},
                {label: "", headerKey: "headerIcons", key: "icons", width: "35%", padding: "0"},
            ],
            groups: [],
            currentActive: -1,
            currentGroupName: "",
            areErrors: false,
            errors: [],
            isDeleting: false,
            deleteIndex: -1
        }
    },
    methods: {
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
                this.currentGroupName = this.groups[index].name;
            }
            if(key === "save") {
                await this.checkErrors(index);
            }
            if(key === "cancel") {
                this.cancelEdition(index);
            }
            if(key === "delete") {
                if(!this.groups[index]._id) {
                    this.groups.splice(index, 1);
                    return this.setDefaults();
                }
                this.deleteIndex = index;
                this.isDeleting = true;
            }
        },
        async checkErrors(index) {
            this.errors = [];
            if(!this.currentGroupName || !this.isTitleUnique(index)) this.errors.push("Title should not be empty and be unique!");
            if(this.errors.length) {
                this.areErrors = true;
                return
            }
            await this.saveGroup(index);
            this.setDefaults();
        },
        isTitleUnique(index) {
            const duplicateIndex = this.groups.findIndex((item, ind) => {
                if(index !== ind && item.name === this.groups[index].name) {
                    return item;
                }
            })
            return duplicateIndex === -1;
        },
        closeErrors() {
            this.areErrors = false;
        },
        cancelEdition(index) {
            if(!this.groups[index]._id) {
                this.groups.splice(index, 1);
            }
            this.setDefaults();
        },
        setDefaults() {
            this.currentActive = -1;
            this.currentGroupName = "";
            this.isDeleting = false;
        },
        async saveGroup(index) {
            if(this.currentActive === -1) return;
            this.groups[index].name = this.currentGroupName;
            try {
                await this.$http.post("/api/group", {group: this.groups[index]});
                await this.getGroups();
                this.alertToggle({message: "Group saved", isShow: true, type: 'success'})
            } catch(err) {
                this.alertToggle({message: "Error on creating new Group", isShow: true, type: 'error'})
            }
        },
        async deleteGroup() {
            const index = this.deleteIndex;
            const id = this.groups[index]._id;
            try {
                const isAnyUserOfGroup = await this.$http.get(`/api/group-user?id=${id}`);
                if(isAnyUserOfGroup.body) {
                    this.alertToggle({message: "ERROR! There is a user of the group in DataBase.", isShow: true, type: 'error'})
                } else {
                    await this.$http.delete(`/api/group/${id}`);
                    this.groups.splice(index, 1);
                    this.alertToggle({message: "Group deleted", isShow: true, type: 'success'})
                }
            } catch(err) {
                this.alertToggle({message: "Error on group deleting", isShow: true, type: 'error'})
            }
            this.setDefaults();
        },
        async getGroups() {
            try {
                const result = await this.$http.get("/api/groups");
                this.groups = result.body;
            } catch(err) {
                this.alertToggle({message: "Error on getting groups.", isShow: true, type: "error"});
            }
        },
        addGroup() {
            if(this.currentActive !== -1) {
                return this.isEditing();
            }
            this.groups.push({name: ""});
            this.currentActive = this.groups.length - 1;
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
        this.getGroups();
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";
@import "../../assets/styles/settingsTable";

.groups {
    @extend %setting-table;
    width: 400px;
    &__data {
        @extend %table-data;
    }
    &__editing-data {
        @extend %table-data;
        box-shadow: inset 0 0 7px $brown-shadow;
    }
    &__input {
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
}
</style>
