<template lang="pug">
    .drops
        DataTable(
            :fields="fields"
            :tableData="['']"
            bodyRowClass="delivery_no-hover-change"
            bodyClass="tbody_visible-overflow"
            tableheadRowClass="tbody_visible-overflow"
        )
            .drops__header(slot="headerDr1" slot-scope="{ field }") {{ field.label }}
            .drops__header(slot="headerDr2" slot-scope="{ field }") {{ field.label }}
            .drops__header(slot="headerContacts" slot-scope="{ field }") {{ field.label }}
            .drops__data(slot="dr1" slot-scope="{ row }") 
                .drops__name {{ user.firstName + ' ' + user.lastName }}    
                    .drops__timestamp(v-if="timestamp")
                        img.drops__time-icon(src="../../../assets/images/time_icon.png")
                        .drops__time-data {{ getDeliveredTime() }} 
            .drops__data(slot="dr2" slot-scope="{ row }")
                .drops__menu
                    SelectSingle(
                        :options="managersNames"
                        :selectedOption="selectedManager"
                        @chooseOption="setManager"
                    )
            .drops__data(slot="contacts" slot-scope="{ row }")
                .drops__menu
                    SelectMulti(
                        :options="contactsNames"
                        :selectedOptions="slectedContacts"
                        @chooseOptions="setContacts"
                    )
</template>

<script>
import SelectSingle from "@/components/SelectSingle";
import SelectMulti from "@/components/SelectMulti";
import DataTable from "@/components/DataTable";
import moment from "moment";
import { mapActions } from "vuex";

export default {
    props: {
        project: {type: Object},
        user: {type: Object},
        assignedManager: {type: Object},
        timestamp: {type: String, default: ""}
    },
    data() {
        return {
            managers: [],
            contacts: [],
            slectedContacts: [],
            fields: [
                {label: "Delivery 1", headerKey: "headerDr1", key: "dr1", width: "33%", padding: 0},
                {label: "Delivery 2", headerKey: "headerDr2", key: "dr2", width: "34%", padding: 0},
                {label: "Contacts", headerKey: "headerContacts", key: "contacts", width: "33%", padding: 0},
            ]
        }
    },
    methods: {
        ...mapActions(["alertToggle"]),
        getDeliveredTime(date) {
            return date ? moment(date).format("YYYY-MM-DD, HH:mm Z") : "";
        },
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
        SelectMulti,
        DataTable
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
    width: 100%;
    box-sizing: border-box;
    margin-top: 20px;
    &__menu {
        position: relative;
        height: 30px;
        width: 191px;
    }
    &__header {
        text-align: center;
    }
    &__data {
        display: flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        height: 50px;
        padding: 10px;
    }
    &__name {
        position: relative;
    }
    &__timestamp {
        cursor: pointer;
        margin-left: 10px;
        &:hover {
            .drops__time-data {
                opacity: 1;
                z-index: 5;
            }
        }
    }
    &__time-data {
        position: absolute;
        top: -2px;
        width: 150px;
        background-color: $white;
        padding: 3px;
        border-radius: 3px;
        margin-left: 22px;
        box-shadow: 0 0 10px $brown-shadow;
        opacity: 0;
        z-index: -2;
        transition: all 0.2s;
    }
}

</style>
