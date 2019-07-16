<template lang="pug">
.clients-table
    DataTable(
        :fields="fields"
        :tableData="filteredClients"
        @onRowClicked="onRowClicked"
        :bodyClass="['clients__table', {'tbody_visible-overflow': filteredClients.length < 36}]"
    )
        template(slot="headerName" slot-scope="{ field }")
            span.clients-table__header-title {{ field.label }}
        template(slot="headerStatus" slot-scope="{ field }")
            span.clients-table__header-title {{ field.label }}
        template(slot="headerWeb" slot-scope="{ field }")
            span.clients-table__header-title {{ field.label }}
        template(slot="headerIndustry" slot-scope="{ field }")
            span.clients-table__header-title {{ field.label }}
        template(slot="headerLead" slot-scope="{ field }")
            span.clients-table__header-title {{ field.label }}
        template(slot="headericons" slot-scope="{ field }")
            span.clients-table__header-title {{ field.label }}
        template(slot="name" slot-scope="{ row, index }")
            .clients-table__active-cell(v-if="currentEditingIndex === index")
                input.clients-table__input(type="text" v-model="currentName" @click.stop="stopPropagation")
            .clients-table__data-cell(v-else) {{ row.name }}
        template(slot="status" slot-scope="{ row, index }")
            .clients-table__drop-menu(v-if="currentEditingIndex === index")
                ClientStatusSelect(
                    :isAllExist="isAllStatusExist"
                    :selectedStatus="selectedStatus"
                    @chosenStatus="setStatus"
                    @scrollDrop="scrollDrop"
                )
            .clients-table__data-cell(v-else) {{ row.status }}
        template(slot="industry" slot-scope="{ row, index }")
            .clients-table__drop-menu(v-if="currentEditingIndex === index")
                MultiClientIndustrySelect(
                    :selectedInd="industrySelected"
                    :filteredIndustries="selectedIndNames" 
                    :parentInd="index" 
                    @chosenInd="setIndustry"
                    @scrollDrop="scrollDrop"
                )
            .clients-table__data-cell(v-else)
                img.clients-table__industry-icon(v-for="industry in row.industries" :src="industry.icon")
        template(slot="web" slot-scope="{ row, index }")
            .clients-table__active-cell(v-if="currentEditingIndex === index")
                input.clients-table__input(type="text" v-model="currentWebsite" @click.stop="stopPropagation")
            .clients-table__data-cell(v-else) {{ row.website }}
        template(slot="lead" slot-scope="{ row, index }")
            .clients-table__drop-menu(v-if="currentEditingIndex === index")
                ClientLeadsourceSelect(
                    :isAllExist="isAllLeadExist"
                    :selectedLeadsource="selectedLeadsource"
                    @chosenLeadsource="setLeadsource"
                    @scrollDrop="scrollDrop"
                )
            .clients-table__data-cell(v-else) {{ row.leadSource }}
        template(slot="icons" slot-scope="{ row, index }")
            .clients-table__icons
                img.clients-table__icon(@click.stop="makeAction(index, key)" v-for="(icon, key) in icons" :src="icon.icon" :class="{'clients-table_opacity': isIconClass(index, key)}")
    .clients-table__error(v-if="isErrorShow")
        .clients-table__error-message
            p Please finish the current edition first!
            span.clients-table__close(@click="closeErrorMessage") +
    .clients-table__delete-approve(v-if="isDeleteMessageShow")
            p Are you sure you want to delete?
            Button.clients-table__button(value="Cancel" @clicked="cancelDelete")
            Button.clients-table__button(value="Delete" @clicked="approveDelete")
</template>

<script>
import DataTable from "../DataTable";
import ClientStatusSelect from "./ClientStatusSelect";
import ClientLeadsourceSelect from "./ClientLeadsourceSelect";
import MultiClientIndustrySelect from "./MultiClientIndustrySelect";
import Button from "../Button";
import scrollDrop from "@/mixins/scrollDrop";
import { mapGetters, mapActions } from 'vuex';

export default {
    mixins: [scrollDrop],
    props: {
        filterName: {
            type: String
        },
        filterStatus: {
            type: String
        },
        filterLeadsource: {
            type: String
        },
        filterIndustry: {
            type: [String, Object],
            default: ""
        }
    },
    data() {
        return {
            fields: [
                {label: "Company Name", headerKey: "headerName", key: "name", width: "17%", padding: "0"},
                {label: "Status", headerKey: "headerStatus", key: "status", width: "12%", padding: "0"},
                {label: "Website", headerKey: "headerWeb", key: "web", width: "20%", padding: "0"},
                {label: "Industry", headerKey: "headerIndustry", key: "industry", width: "21%", padding: "0"},
                {label: "Lead Source", headerKey: "headerLead", key: "lead", width: "16%", padding: "0"},
                {label: "", headerKey: "headerIcons", key: "icons", width: "14%", padding: "0"}
            ],
            icons: {
                save: {icon: require('../../assets/images/Other/save-icon-qa-form.png')},
                edit: {icon: require('../../assets/images/Other/edit-icon-qa.png')},
                cancel: {icon: require('../../assets/images/cancel-icon.png')},
                delete: {active: true, icon: require('../../assets/images/Other/delete-icon-qa-form.png')}
            },
            currentEditingIndex: -1,
            isErrorShow: false,
            industrySelected: [],
            selectedStatus: "",
            selectedLeadsource: "",
            isDeleteMessageShow: false,
            deletingClientIndex: -1,
            currentName: "",
            currentWebsite: "",
            isErrorShow: false,
            isAllLeadExist: false,
            isAllStatusExist: false
        }
    },
    methods: {
        async getClients() {
            if(!this.allClients.length) {
                await this.getAllClients();
            }
        },
        isScrollDrop(drop, elem) {
            return drop && elem.clientHeight >= 600;
        },
        isIconClass(index, key) {
            if(this.currentEditingIndex !== index) {
                return key === 'save' || key === 'cancel';
            }
            if(this.currentEditingIndex === index) {
                return key === 'edit'
            }
        },
        setStatus({status}) {
            this.selectedStatus = status;
        },
        setLeadsource({leadSource}) {
            this.selectedLeadsource = leadSource;
        },
        setIndustry({industry, index}) {
            const position = this.industrySelected.findIndex(item => {
                return item._id === industry._id
            })
            if(position !== -1) {
                return this.industrySelected.splice(position, 1);
            }
            this.industrySelected.push(industry);
        },
        setCurrentEditionValues(index) {
            this.currentEditingIndex = index;
            this.industrySelected = this.filteredClients[index].industries;
            this.selectedStatus = this.filteredClients[index].status;
            this.selectedLeadsource = this.filteredClients[index].leadSource;
            this.currentWebsite = this.filteredClients[index].website;
            this.currentName = this.filteredClients[index].name;
        },
        setCurrentDefaults() {
            this.currentEditingIndex = -1;
            this.industrySelected = [];
            this.selectedStatus = "";
            this.selectedLeadsource = "";
            this.currentWebsite = "";
            this.currentName = "";
            const tbody = document.querySelector('.table__tbody');
            tbody.style.minHeight = this.currentTableHeight + 'px';
        },
        async updateClient(index) {
            if(this.currentEditingIndex === -1) return;
            let sendData = new FormData();
            const updatingClient = {
                ...this.filteredClients[index],
                name: this.currentName,
                website: this.currentWebsite,
                status: this.selectedStatus,
                leadSource: this.selectedLeadsource,
                industries: this.industrySelected
            }
            sendData.append("client", JSON.stringify(updatingClient));
            try{
                const updatedClient = await this.$http.post("/clientsapi/update-client", sendData);
                const { client } = updatedClient.body;
                await this.storeClient(client);
                this.alertToggle({message: "Client info has been updated", isShow: true, type: "success"})
            } catch(err) {
                this.alertToggle({message: "Server error / Cannot update Client info", isShow: true, type: "error"})
            }
        },
        async makeAction(index, key) {
            if(this.currentEditingIndex !== -1 && this.currentEditingIndex !== index) {
                return this.isErrorShow = true;
            }
            if(key === 'edit') {
                this.setCurrentEditionValues(index);
            }
            if(key === 'save') {
                await this.updateClient(index);
                this.setCurrentDefaults();
            }
            if(key === 'cancel') {
                this.setCurrentDefaults();
            }
            if(key === 'delete') {
                this.deletingClientIndex = index;
                this.isDeleteMessageShow = true;
            }
        },
        async approveDelete() {
            this.isDeleteMessageShow = false;
            this.currentEditingIndex = -1;
            const client = this.filteredClients[this.deletingClientIndex];
            try {
                const hasRelatedDocs = await this.$http.get(`/clientsapi/any-doc?id=${client._id}`);
                if(hasRelatedDocs.body) {
                    return this.alertToggle({message: "The client has related documents and cannot be deleted", isShow: true, type: "error"});
                }
                const result = await this.$http.delete(`/clientsapi/deleteclient/${client._id}`);
                await this.removeClient(client._id);
                this.alertToggle({message: "Client removed", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: "Server error / Cannot delete the Client", isShow: true, type: "error"});
            }
        },
        cancelDelete() {
            this.deletingClientIndex = -1;
            this.isDeleteMessageShow = false;
        },
        onRowClicked({index}) {
            if(this.currentEditingIndex === index || this.currentEditingIndex !== -1 && this.currentEditingIndex !== index) {
                return
            }
            this.$router.push(`/clients/details/${this.filteredClients[index]._id}`);
        },
        stopPropagation() {
            return
        },
        closeErrorMessage() {
            this.isErrorShow = false;
        },
        ...mapActions({
            getAllClients: "getAllClients",
            alertToggle: "alertToggle",
            storeClient: "storeClient",
            removeClient: "removeClient"
        })
    },
    created() {
        this.getClients();
    },
    computed: {
        ...mapGetters({
            allClients: "getClients"
        }),
        filteredClients() {
            let result = this.allClients;
            if(this.filterName) {
                result = result.filter(item => item.name.toLowerCase().indexOf(this.filterName.toLowerCase()) !== -1);
            }
            if(this.filterStatus && this.filterStatus !== "All") {
                result = result.filter(item => item.status === this.filterStatus);
            }
            if(this.filterLeadsource && this.filterLeadsource !== "All") {
                result = result.filter(item => item.leadSource === this.filterLeadsource);
            }
            if(this.filterIndustry && this.filterIndustry.name !== "All") {
                result = result.filter(item => {
                    const industryIds = item.industries.map(industry => industry._id);
                    return industryIds.indexOf(this.filterIndustry._id) !== -1
                })
            }
            return result
        },
        selectedIndNames() {
            let result = [];
            for(let ind of this.industrySelected) {
                result.push(ind.name);
            }
            return result;
        },
    },
    components: {
        DataTable,
        ClientStatusSelect,
        ClientLeadsourceSelect,
        MultiClientIndustrySelect,
        Button
    } 
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.clients-table {
    position: relative;
    &__data-cell {
        padding: 6px 0 0 5px;
        max-height: 28px;
    }
    &__drop-menu {
        position: relative;
    }
    &__industry-icon {
        width: 19px;
        height: 19px;
        margin-right: 3px;
    }
    &__icons {
        padding-top: 5px;
        margin-right: 18px;
        display: flex;
        justify-content: space-around;
        align-items: center;
    }
    &__icon {
        cursor: pointer;
    }
    &_opacity {
        opacity: 0.5;
    }
    &__active-cell {
        padding: 5px;
        box-shadow: inset 0 0 5px $brown-shadow;
        box-sizing: border-box;
    }
    &__input {
        width: 100%;
        border: none;
        outline: none;
        color: $main-color;
        padding: 2px;
        background-color: transparent;
    }
    &__error {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background: transparent;
        padding: 0 15px;
        z-index: 50;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    &__error-message {
        position: relative;
        width: 300px;
        padding: 0 20px;
        border: 1px solid $orange;
        box-shadow: 0 0 5px $orange;
        background-color: $white;
        font-weight: bolder;
        font-size: 14px;
    }
    &__close {
        position: absolute;
        font-size: 24px;
        font-weight: 700;
        top: -2px;
        right: 5px;
        transform: rotate(45deg);
        cursor: pointer;
    }
    &__delete-approve {
        position: absolute;
        width: 332px;
        height: 270px;
        top: 10%;
        left: 50%;
        margin-left: -166px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        box-shadow: 0 0 10px $main-color;
        background-color: $white;
        z-index: 20;
        p {
            font-size: 21px;
            width: 50%;
            text-align: center;
        }
        .approve-block {
            margin-bottom: 15px;
        }
    }
    &__button {
        margin-bottom: 5px;
    }
    &__cancel-edition {
        cursor: pointer;
        position: absolute;
        right: -100px;
        top: 45%;
        padding: 5px;
        border: 1px solid $orange;
        border-radius: 8px;
        color: $orange;
        font-weight: 700;
        z-index: 10;
        background-color: $white;
    }
}
</style>
