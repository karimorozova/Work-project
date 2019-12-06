<template lang="pug">
    .drops
        .block
            h4.block__title Delivery Review 1
            .block__text {{ user.firstName + ' ' + user.lastName }}
        .block
            h4.block__title Delivery Review 2
            .block__menu
                SelectSingle(
                    :options="managersNames"
                    :selectedOption="selectedManager"
                    @chooseOption="setManager"
                )
        .block
            h4.block__title Contacts
            .block__menu
                SelectMulti(
                    :options="contactsNames"
                    :selectedOptions="slectedContacts"
                    @chooseOptions="setContacts"
                )
</template>

<script>
import SelectSingle from "@/components/SelectSingle";
import SelectMulti from "@/components/SelectMulti";
import { mapActions } from "vuex";

export default {
    props: {
        project: {type: Object},
        user: {type: Object},
        assignedManager: {type: Object}
    },
    data() {
        return {
            managers: [],
            contacts: [],
            slectedContacts: []
        }
    },
    methods: {
        ...mapActions(["alertToggle"]),
        setContacts({option}) {
            const position = this.slectedContacts.indexOf(option);
            if(position === -1) {
                this.slectedContacts.push(option);
            } else {
                this.slectedContacts.splice(position, 1);
            }
            if(!this.slectedContacts.length) {
                this.setDefaultContact();
            }
        },
        setDefaultContact() {
            this.slectedContacts = this.project.customer.contacts.filter(item => item.leadContact)
                .map(item => `${item.firstName} ${item.surname}`);
        },
        setManager({option}) {
            const managerIndex = this.managersNames.indexOf(option);
            this.$emit("assignManager", {manager: this.managers[managerIndex]});
        },
        async getManagers() {
            try {
                const groups = ["Project Managers", "Account Managers"];
                const result = await this.$http.get("/users");
                this.managers = result.body.filter(item => groups.indexOf(item.group.name) !== -1);
            } catch(err) {
                this.alertToggle({message: "Error on getting mangers", isShow: true, type: "error"});
            }
        }
    },
    computed: {
        contactsNames() {
            return this.project.customer.contacts.map(item => `${item.firstName} ${item.surname}`);
        },
        managersNames() {
            let result = [];
            if(this.managers.length) {
                result = this.managers.map(item => {
                    const position = item.group.name === "Account Managers" ? "[AM]" : "[PM]";
                    return `${item.firstName} ${item.lastName} ${position}`
                })
            }
            return result;
        },
        selectedManager() {
            return this.assignedManager ? `${this.assignedManager.firstName} ${this.assignedManager.lastName}` : "";
        }
    },
    components: {
        SelectSingle,
        SelectMulti
    },
    created() {
        this.getManagers();
    },
    mounted() {
        this.setDefaultContact();
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.drops {
    display: flex;
    width: 100%;
    box-sizing: border-box;
    border: 1px solid $main-color;
    margin: 20px 0;
}

.block {
    flex: 1;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-right: 1px solid $main-color;
    padding-bottom: 10px;
    &:last-child {
        border-right: none;
    }
    &__menu {
        position: relative;
        height: 30px;
        width: 191px;
    }
}

</style>
