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
                .users__data(v-if="currentActive !== index") {{ row.group }}
                .users__drop-menu(v-else)
                    SelectSingle(
                        :isTableDropMenu="isTableDropMenu"
                        placeholder="Select"
                        :selectedOption="currentGroup"
                        :options="groups"
                        @chooseOption="(e) => setProp(e, 'currentGroup')"
                        @scrollDrop="scrollDrop"
                    )
            template(slot="icons" slot-scope="{ row, index }")
                .users__icons
                    img.users__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'users_opacity': isActive(key, index)}")
    Add(@add="addUser")
</template>

<script>
import SettingsTable from "./SettingsTable";
import SelectSingle from "../SelectSingle";
import Add from "../Add";
import { mapGetters, mapActions } from "vuex";

export default {
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
            icons: {
                save: {icon: require("../../assets/images/Other/save-icon-qa-form.png"), active: false}, 
                edit: {icon: require("../../assets/images/Other/edit-icon-qa.png"), active: true},
                cancel: {icon: require("../../assets/images/cancel_icon.jpg"), active: true},
                delete: {icon: require("../../assets/images/Other/delete-icon-qa-form.png"), active: true}
            },
            isTableDropMenu: true,
            groups: ["Administrators", "Accounting", "Developers", "Sales", "Project Managers", "Vendor Managers"],
            currentActive: -1,
            currentFirstName: "",
            currentLastName: "",
            currentEmail: "",
            currentPosition: "",
            currentGroup: "",
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
        isActive(key, index) {
            if(this.currentActive === index) {
                return key !== "edit";
            }
            if(this.currentActive !== index) {
                return key !== "save" && key !== "cancel";
            }
        },
        scrollDrop({drop, offsetTop, offsetHeight}) {
            if(drop && this.users.length >= 20) {
                let tbody = document.querySelector('.table__tbody');
                setTimeout(() => {
                    const offsetBottom = offsetTop + offsetHeight*2;
                    const scrollBottom = tbody.scrollTop + tbody.offsetHeight;
                    if (offsetBottom > scrollBottom) {
                        tbody.scrollTop = offsetBottom + offsetHeight*2 - tbody.offsetHeight;
                    }
                }, 100)
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
                this.isDeleting = true;
                this.deleteIndex = index;
            }
        },
        async checkErrors(index) {
            if(this.currentActive === -1) return;
            this.errors = [];
            if(!this.currentFirstName) this.errors.push("Please, enter user's first name");
            if(!this.currentLastName) this.errors.push("Please, enter user's last name");
            if(!this.currentEmail || !this.isEmailValid() || !this.isEmailUnique(index)) this.errors.push("Email should be unique and not empty");
            if(!this.currentPosition) this.errors.push("Please, enter user's position");
            if(!this.currentGroup) this.errors.push("Please, select user's group");
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
            const emails = this.users.map((item, i) => {
                if(i !== index) return item.email
            } );
            return emails.indexOf(this.currentEmail.trim()) === -1;
        },
        setEditingData(index) {
            this.currentActive = index;
            this.currentFirstName = this.users[index].firstName;
            this.currentLastName = this.users[index].lastName;
            this.currentEmail = this.users[index].email;
            this.currentPosition = this.users[index].position;
            this.currentGroup = this.users[index].group;
        },
        setProp({option}, prop) {
            this[prop] = option;
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
                group: ""
            })
            this.setEditingData(this.users.length -1);
        },
        async deleteUser() {
            const id = this.users[this.deleteIndex]._id;
            if(!id) {
                return this.users.splice(this.deleteIndex, 1);
            }
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
            this.currentGroup = "";
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
        }
    },
    components: {
        SettingsTable,
        SelectSingle,
        Add
    },
    mounted() {
        this.getUsers();
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.users {
    width: 900px;
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
    &__editing-data, &__drop-menu {
        box-shadow: inset 0 0 7px $brown-shadow;
    }
    &__drop-menu {
        position: relative;
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
