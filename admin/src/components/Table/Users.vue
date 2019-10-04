<template lang="pug">
.users
    .users__table
        SettingsTable(
            :fields="fields"
            :tableData="users"
            :errors="errors"
            :areErrors="areErrors"
            :isApproveModal="isDeleting"
            @closeErrors="closeErrors"
            @approve="deleteUser"
            @notApprove="setDefaults"
            @closeModal="setDefaults"
        )
            template(slot="headerFirstName" slot-scope="{ field }")
                .users__head-title {{ field.label }}
            template(slot="headerLastName" slot-scope="{ field }")
                .users__head-title {{ field.label }}
            template(slot="headerEmail" slot-scope="{ field }")
                .users__head-title {{ field.label }}
            template(slot="headerPosition" slot-scope="{ field }")
                .users__head-title {{ field.label }}
            template(slot="headerGroup" slot-scope="{ field }")
                .users__head-title {{ field.label }}
            template(slot="headerIcons" slot-scope="{ field }")
                .users__head-title {{ field.label }}
            template(slot="firstName" slot-scope="{ row, index }")
                .users__data(v-if="currentActive !== index") {{ row.firstName }}
                .users__editing-data(v-else)
                    input.users__data-input(type="text" v-model="currentFirstName")
            template(slot="lastName" slot-scope="{ row, index }")
                .users__data(v-if="currentActive !== index") {{ row.lastName }}
                .users__editing-data(v-else)
                    input.users__data-input(type="text" v-model="currentLastName")
            template(slot="email" slot-scope="{ row, index }")
                .users__data(v-if="currentActive !== index") {{ row.email }}
                .users__editing-data(v-else)
                    input.users__data-input(type="text" v-model="currentEmail")
            template(slot="position" slot-scope="{ row, index }")
                .users__data(v-if="currentActive !== index") {{ row.position }}
                .users__editing-data(v-else)
                    input.users__data-input(type="text" v-model="currentPosition")
            template(slot="group" slot-scope="{ row, index }")
                .users__data(v-if="currentActive !== index") {{ row.group.name }}
                .users__drop-menu(v-else)
                    SelectSingle(
                        :isTableDropMenu="isTableDropMenu"
                        placeholder="Select"
                        :selectedOption="currentGroup.name"
                        :options="groupsNames"
                        @chooseOption="setGroup"
                        @scrollDrop="scrollDrop"
                    )
            template(slot="icons" slot-scope="{ row, index }")
                .users__icons
                    img.users__icon(v-for="(icon, key) in manageIcons" :src="icon.icon" @click="makeAction(index, key)" :class="{'users_opacity': isActive(key, index)}")
    Add(@add="addUser")
</template>

<script>
import SettingsTable from "./SettingsTable";
import SelectSingle from "../SelectSingle";
import Add from "../Add";
import scrollDrop from "@/mixins/scrollDrop";
import { mapGetters, mapActions } from "vuex";
import crudIcons from "@/mixins/crudIcons";

export default {
    mixins: [scrollDrop, crudIcons],
    data() {
        return {
            fields: [
                {label: "First Name", headerKey: "headerFirstName", key: "firstName", width: "14%", padding: "0"},
                {label: "Last Name", headerKey: "headerLastName", key: "lastName", width: "14%", padding: "0"},
                {label: "Email", headerKey: "headerEmail", key: "email", width: "20%", padding: "0"},
                {label: "Position", headerKey: "headerPosition", key: "position", width: "20%", padding: "0"},
                {label: "Group", headerKey: "headerGroup", key: "group", width: "16%", padding: "0"},
                {label: "", headerKey: "headerIcons", key: "icons", width: "16%", padding: "0"},
            ],
            users: [],
            isTableDropMenu: true,
            groups: [],
            currentActive: -1,
            currentFirstName: "",
            currentLastName: "",
            currentEmail: "",
            currentPosition: "",
            currentGroup: null,
            areErrors: false,
            errors: [],
            isDeleting: false,
            deleteIndex: -1
        }
    },
    methods: {
        ...mapActions({
            alertToggle: "alertToggle",
            saveUser: "saveUser",
            removeUser: "removeUser"
        }),
        isScrollDrop(drop, elem) {
            return drop && this.users.length >= 20;
        },
        async makeAction(index, key) {
            if(this.currentActive !== -1 && this.currentActive !== index) {
                return this.isEditing();
            }
            if(key === "save") {
                await this.checkErrors(index);
            }
            if(key === "edit") {
                this.setEditingData(index);
            }
            if(key === "cancel") {
                this.cancelEdition(index);
            }
            if(key === "delete") {
                this.deleteIndex = index;
                this.showApprove(index);
            }
        },
        async checkErrors(index) {
            if(this.currentActive === -1) return;
            this.errors = [];
            if(!this.currentFirstName) this.errors.push("Please, enter user's first name");
            if(!this.currentLastName) this.errors.push("Please, enter user's last name");
            if(!this.currentEmail || !this.isEmailValid() || this.isEmailUnique(index)) this.errors.push("Enter a valid and unique email");
            if(!this.currentPosition) this.errors.push("Please, enter user's position");
            if(!this.currentGroup || !this.currentGroup.name) this.errors.push("Please, select user's group");
            if(this.errors.length) {
                return this.areErrors = true;
            }
            await this.saveUserInfo(index);
        },
        async saveUserInfo(index) {
            const _id = this.users[index]._id ? this.users[index]._id: "";
            const username = _id ? this.users[index].username : `${this.currentFirstName}.${this.currentLastName.slice(0, 5)}`;
            const user = {
                _id,
                username: username.toLowerCase(),
                firstName: this.currentFirstName,
                lastName: this.currentLastName,
                email: this.currentEmail,
                position: this.currentPosition,
                group: this.currentGroup,
            }
            try {
                const result = await this.saveUser({user});
                await this.getUsers();
                this.alertToggle({message: "User info saved", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: err.message, isShow: true, type: "error"});
            }
            this.setDefaults();
        },
        isEmailValid() {
            const regex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            return regex.test(this.currentEmail);
        },
        isEmailUnique(index) {
            return this.users.filter((item, i) => {
                return i !== index && item.email.toLowerCase() === this.currentEmail.toLowerCase().trim()
            }).length;
        },
        setEditingData(index) {
            this.currentActive = index;
            this.currentFirstName = this.users[index].firstName;
            this.currentLastName = this.users[index].lastName;
            this.currentEmail = this.users[index].email;
            this.currentPosition = this.users[index].position;
            this.currentGroup = this.users[index].group;
        },
        setGroup({option}) {
            this.currentGroup = this.groups.find(item => item.name === option);
        },
        addUser() {
            if(this.currentActive !== -1) {
                return this.isEditing();
            }
            this.users.push({
                firstName: "",
                lastName: "",
                email: "",
                position: "",
                group: {name: ""}
            })
            this.setEditingData(this.users.length -1);
        },
        showApprove(index) {
            const id = this.users[index]._id;
            if(!id) {
                this.setDefaults();
                return this.users.splice(index, 1);
            }
            this.isDeleting = true;
        },
        async deleteUser() {
            const id = this.users[this.deleteIndex]._id;
            try {
                await this.removeUser(id);
                this.checkToken();
                await this.getUsers();
                this.alertToggle({message: "User removed", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: err.message, isShow: true, type: "error"});
            }
            this.setDefaults();
        },
        checkToken() {
            if(!localStorage.getItem("token")) {
                this.$router.push("/login");
            }
        },
        cancelEdition(index) {
            if(!this.users[index]._id) {
                this.users.splice(index, 1);
            }
            this.setDefaults();
        },
        setDefaults() {
            this.currentActive = -1;
            this.currentFirstName = "";
            this.currentLastName = "";
            this.currentEmail = "";
            this.currentPosition = "";
            this.currentGroup = null;
            this.isDeleting = false;
        },
        closeErrors() {
            this.areErrors = false;
        },
        async getUsers() {
            try {
                const result = await this.$http.get("/users-full");
                this.users = result.body;
            } catch(err) {
                this.alertToggle({message: err.message, isShow: true, type: "error"});
            }
        },
        async getGroups() {
            try {
                const result = await this.$http.get("/api/groups");
                this.groups = result.body;
            } catch(err) {
                this.alertToggle({message: err.message, isShow: true, type: "error"});
            }
        }
    },
    computed: {
        groupsNames() {
            return this.groups.map(item => item.name);
        },
        manageIcons() {
            const { "delete": del, ...result } = this.icons;
            return result;
        }
    },
    components: {
        SettingsTable,
        SelectSingle,
        Add
    },
    mounted() {
        this.getUsers();
        this.getGroups();
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";
@import "../../assets/styles/settingsTable";

.users {
    @extend %setting-table;
    width: 900px;
    &__data {
        @extend %table-data;
    }
    &__editing-data {
        @extend %table-data;
        box-shadow: inset 0 0 7px $brown-shadow;
    }
    &__data-input {
        @extend %table-text-input;
    }
    &__icons {
        @extend %table-icons;
    }
    &__icon {
        @extend %table-icon;
    }
    &__drop-menu {
        position: relative;
        box-shadow: inset 0 0 7px $brown-shadow;
    }
    &_opacity {
        opacity: 1;
    }
}

</style>
