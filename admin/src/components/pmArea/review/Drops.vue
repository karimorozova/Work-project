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
                .drops__name(v-if="!isAdmin") {{ getDr1Name() }}    
                    .drops__timestamp(v-if="timestamp")
                        img.drops__time-icon(src="../../../assets/images/time_icon.png")
                        .drops__time-data {{ getDeliveredTime() }} 
                .drops__menu(v-else)
                    SelectSingle(
                        :options="managersNames"
                        :selectedOption="selectedDr1Manager"
                        @chooseOption="(e) => setManager(e, 'dr1Manager')"
                    )
            .drops__data(slot="dr2" slot-scope="{ row }")
                .drops__name(v-if="timestamp && !isAdmin") {{ dr2Manager.firstName + ' ' + dr2Manager.lastName }}
                .drops__menu(v-else)
                    SelectSingle(
                        :options="managersNames"
                        :selectedOption="selectedDr2Manager"
                        @chooseOption="(e) => setManager(e, 'dr2Manager')"
                    )
            .drops__data(slot="contacts" slot-scope="{ row }")
                .drops__menu
                    SelectMulti(
                        :options="contactsNames"
                        :selectedOptions="slectedContacts"
                        @chooseOptions="setContacts"
                    )
        .drops__forbidden(v-if="isReviewing")
</template>

<script>
import SelectSingle from "@/components/SelectSingle";
import SelectMulti from "@/components/SelectMulti";
import DataTable from "@/components/DataTable";
import moment from "moment";
import { mapActions } from "vuex";
import reviewManagers from "@/mixins/reviewManagers";

export default {
    mixins: [reviewManagers],
    props: {
        project: {type: Object},
        user: {type: Object},
        dr1Manager: {type: Object},
        dr2Manager: {type: Object},
        timestamp: {type: String, default: ""},
        isReviewing: {type: Boolean}
    },
    data() {
        return {
            managers: [],
            slectedContacts: [],
            fields: [
                {label: "Delivery Review 1", headerKey: "headerDr1", key: "dr1", width: "33%", padding: 0},
                {label: "Delivery Review 2", headerKey: "headerDr2", key: "dr2", width: "34%", padding: 0},
                {label: "Contacts", headerKey: "headerContacts", key: "contacts", width: "33%", padding: 0},
            ]
        }
    },
    methods: {
        ...mapActions(["alertToggle"]),
        getDr1Name() {
            let result = `${this.user.firstName} ${this.user.lastName}`;
            if(this.timestamp) {
                result = `${this.dr1Manager.firstName} ${this.dr1Manager.lastName}`;
            }
            return result;
        },
        getDeliveredTime() {
            return this.timestamp ? moment(this.timestamp).format("YYYY-MM-DD, HH:mm Z") : "";
        },
        setContacts({option}) {
            const position = this.slectedContacts.indexOf(option);
            position === -1 ? this.slectedContacts.push(option) : this.slectedContacts.splice(position, 1);
            if(!this.slectedContacts.length) {
                this.setDefaultContact();
            } else {
                const contacts = this.project.customer.contacts
                    .filter(item => this.slectedContacts.indexOf(`${item.firstName} ${item.surname}`) !== -1)
                    .map(item => item.email);
                this.$emit("setContacts", { contacts })
            }
        },
        setDefaultContact() {
            const leads = this.project.customer.contacts.filter(item => item.leadContact);
            this.slectedContacts = leads.map(item => `${item.firstName} ${item.surname}`);
            this.$emit("setContacts", { contacts: [leads[0].email] })
        },
        setManager({option}, prop) {
            const managerIndex = this.managersNames.indexOf(option);
            this.$emit("assignManager", {manager: this.managers[managerIndex], prop});
        },
    },
    computed: {
        contactsNames() {
            return this.project.customer.contacts.map(item => `${item.firstName} ${item.surname}`);
        },
        selectedDr1Manager() {
            return this.dr1Manager ? `${this.dr1Manager.firstName} ${this.dr1Manager.lastName}` : "";
        },
        selectedDr2Manager() {
            return this.dr2Manager ? `${this.dr2Manager.firstName} ${this.dr2Manager.lastName}` : "";
        },
        isAdmin() {
            return this.user.group.name === "Administrators" || this.user.group.name === "Developers";
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
    position: relative;
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
        display: flex;
        align-items: center;
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
    &__forbidden {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
    }
}

</style>
