<template lang="pug">
.users
    .users__table
        SettingsTable(
            :fields="fields"
            :tableData="users"
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
                .users__data {{ row.firstName }}
            template(slot="lastName" slot-scope="{ row, index }")
                .users__data {{ row.lastName }}
            template(slot="email" slot-scope="{ row, index }")
                .users__data {{ row.email }}
            template(slot="position" slot-scope="{ row, index }")
                .users__data {{ row.position }}
            template(slot="group" slot-scope="{ row, index }")
                .users__data {{ row.group }}
            template(slot="icons" slot-scope="{ row, index }")
                .users__icons
                    img.users__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'users_opacity': isActive(key, index)}")
    Add
</template>

<script>
import SettingsTable from "./SettingsTable";
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
            currentActive: -1,
        }
    },
    methods: {
        ...mapActions({
            alertToggle: "alertToggle"
        }),
        isActive(key, index) {
            if(this.currentActive === index) {
                return key !== "edit";
            }
            if(this.currentActive !== index) {
                return key !== "save" && key !== "cancel";
            }
        },
        makeAction(index, key) {
            return
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
    &__data {
        height: 32px;
        padding: 0 5px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
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
