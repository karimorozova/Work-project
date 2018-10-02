<template lang="pug">
    .all-clients
        .title(v-if="!clientData") All Clients
        .clients-table(v-if="!clientData")
            .filters
                .filters__block
                    .filters-item
                        label Name
                        input.filter-field(type="text" placeholder="Company Name" v-model="filterName")
                    .filters-item
                        label Status
                        ClientStatusSelect(:selectedStatus="filterStatus" @chosenStatus="chosenStatus")
                .filters__block
                    .filters-item
                        label Industry
                        ClientIndustrySelect(:selectedInd="industryFilter" @chosenInd="chosenInd")
                    .filters-item
                        label Lead Source
                        ClientLeadsourceSelect(:selectedLeadsource="filterLeadsource" @chosenLeadsource="chosenLeadsource")
                .filters__block
                    input.add-button(type="submit" value="Add client" @click="addClient")            
            table
                thead
                    tr
                        th 
                            .head-title
                                span Company Name
                        th
                            .head-title
                                span Status
                        th
                            .head-title
                                span Website
                        th
                            .head-title
                                span Industry
                        th
                            .head-title
                                span Lead Source                   
                        th
                tbody
                    tr(v-for="(client, ind) in allClients")  
                        td(:class="{editing: !client.icons[0].active}" @click="clientDetails(ind)") 
                            input.contact-info(type="text" :readonly="client.icons[0].active" v-model="client.name")
                        td(:class="{editing: !client.icons[0].active}" @click="clientDetails(ind)") 
                            input.contact-info(type="text" :readonly="client.icons[0].active" v-model="client.status")
                        td(:class="{editing: !client.icons[0].active}" @click="clientDetails(ind)") 
                            input.contact-info(type="text" :readonly="client.icons[0].active" v-model="client.website")
                        td.dropOption(@click="clientDetails(ind)")              
                            //- span(v-if="!client.industry.icon") {{ client.industry.name }}
                            .dropOption__image
                                img(v-for="indus in client.industry" :src="indus.icon")
                                //- span.titleTooltip {{ client.industry.name }} 
                            .innerComponent(v-if="!client.icons[0].active")
                                MultiClientIndustrySelect(:selectedInd="industrySelected" :filteredIndustries="selectedIndNames" :parentInd="ind" @chosenInd="changeIndustry")
                        td(@click="clientDetails(ind)")
                            input.contact-info(type="text" :readonly="client.icons[0].active" v-model="client.leadSource")                        
                        td
                            .crud-icons
                                img(v-for="(but, i) in client.icons" :src='but.icon' :class="{'not-active': !but.active}" @click="action(ind, i)")
        .clients__data(v-if="clientData")
            ClientDetails(:client="client"
                :newClient="newClient"
                :addSeveral="addSeveral"
                @clientDelete="clientDelete"
                @newContact="addNewContact"
                @refreshClients="refreshClients"
                @cancel="clientCancel"
                @contactCancel="contactCancel"
                @deleteContact="deleteContact"
                @chosenInd="changeIndustry"
                @chosenStatus="changeStatus"
                @chosenAccManager="changeAccManager"
                @chosenSalesManager="changeSalesManager"
                @chosenProjManager="changeProjManager"
                @addSevLangs="addSevLangs")
        Addseverallangs(v-if="addSeveral"
            :who="client"
            :origin="'client'"
            @closeSeveral="closeSevLangs"
            @refreshServices="refreshClients")
</template>

<script>
import ClientIndustrySelect from '../clients/ClientIndustrySelect';
import MultiClientIndustrySelect from '../clients/MultiClientIndustrySelect';
import ClientStatusSelect from '../clients/ClientStatusSelect';
import ClientLeadsourceSelect from '../clients/ClientLeadsourceSelect';
import ClientDetails from '../clients/ClientDetails';
import Addseverallangs from "../finance/Addseverallangs";
import { mapGetters, mapActions } from "vuex";
import { bus } from "../../main";

export default {
    data() {
        return {
            newClient: false,
            client: {},
            clients: [],
            clientData: false,
            filterName: "",
            filterStatus: "",
            industryFilter: [{name: 'All'}],
            filterLeadsource: "",
            industrySelected: [],
            addSeveral: false
        }
    },
    methods: {
        addSevLangs(data) {
            this.addSeveral = true
        },
        closeSevLangs(data) {
            this.addSeveral = false
        },
        changeInd(data) {
            this.client.industry = data;
        },
        changeStatus(data) {
            this.client.status = data;
        },
        changeAccManager(data) {
            this.client.accountManager = data;
        },
        changeSalesManager(data) {
            this.client.salesManager = data;
        },
        changeProjManager(data) {
            this.client.projectManager = data;
        },
        clientCancel(data) {
            this.clientData = false;
            this.refreshClients();
            this.$emit('clientCancel');
        },
        contactCancel(data) {
            // if(!this.newClient) {
            //     this.refreshClients();
            // }
        },
        clientDetails(ind) {
            if(this.allClients[ind].icons[0].active) {
                this.client = this.allClients[ind];
                this.clientData = true;
                this.newClient = false;
                this.$emit('chosenClient');
            }
        },
        addClient() {
            this.client = {
                name: "",
                officialName: "",
                status: "",
                website: "",
                contract: "",
                nda: "",
                accountManager: "",
                salesManager: "",
                projectManager: "",
                leadSource: "",
                salesComission: "",
                contactName: "",
                email: "",
                vat: "",
                address: "",
                languageCombinations: [],
                industry: [],
                contacts: []
            };
            this.clientData = true;
            this.newClient = true;
            this.$emit('chosenClient');
        },
        addNewContact(data) {
            this.client.contacts.push(data.contact)
        },
        deleteContact(data) {
            let id = this.client._id;
            this.client.contacts.splice(data, 1);
            this.$http.post('clientsapi/deleteContact', {id: id, contacts: this.client.contacts})
            .then(res => {
                console.log("contact deleted")
            })
            .catch(err => {
                consol.elog(err)
            })
        },
        chosenLeadsource(data) {
            this.filterLeadsource = data;
        },
        chosenStatus(data) {
            this.filterStatus = data;
        },
        chosenInd(data) {
            this.industryFilter = [data.industry];
        },
        changeIndustry(data) {
            if(!this.clientData) {
                let exist = false;
                for(let ind in this.industrySelected) {
                    if(this.industrySelected[ind].name == data.industry.name) {
                        this.industrySelected.splice(ind, 1);
                        exist = true;
                    }
                }
                if(!exist) {
                    this.industrySelected.push(data.industry);
                }
                let client = this.allClients[data.index];
                for(let cli of this.clients) {
                    if(client._id == cli._id && !cli.icons[1].active) {
                        cli.industry = this.industrySelected;
                    }
                }
            } else {
                let exist = false;
                for(let ind in this.client.industry) {
                    if(this.client.industry[ind].name == data.industry.name) {
                        this.client.industry.splice(ind, 1);
                        exist = true;
                    }
                }
                if(!exist) {
                    this.client.industry.push(data.industry);
                }
            }
        },
        chooseLead(ind) {
            if(!this.allClients[ind].icons[0].active) {
                for(let client of this.allClients) {
                    client.leadContact = false;
                }
                this.allClients[ind].leadContact = true;
            }
        },
        action(ind, i) {
            if(i == 0) {
                for(let client of this.allClients) {
                    client.icons[0].active = true;
                }
                this.allClients[ind].icons[0].active = false;
            }
            if(i == 1) {
                let id = this.allClients[ind]._id;
                this.allClients.splice(ind, 1);
                this.$http.post('clientsapi/deleteclient', {id: id})
                .then(res => {
                    console.log('deleted')
                })
                .catch(err => {
                    console.log(err)
                })
            }
        },
        clientDelete(data) {
            let id = data._id;
            this.$http.post('clientsapi/deleteclient', {id: id})
            .then(res => {
                console.log('deleted');
            })
            .catch(err => {
                console.log(err)
            })
            this.clientData = false;
            this.getclients();
            this.$emit('clientCancel');
        },
        async refreshClients(data) {
            let result = await this.getclients();
            if(data && data.clientId) {
                this.client = this.clients.find(item => {
                    if(item._id == data.clientId) {
                        return item
                    }
                })
            }
        },
        async getclients() {
            this.clients = [];
            let result = await this.$http.get('/all-clients');
            for(let client of result.body) {
                client.icons = [{name: 'edit', active: true, icon: require('../../assets/images/Other/edit-icon-qa.png')},
                    {name: 'delete', active: true, icon: require('../../assets/images/Other/delete-icon-qa-form.png')}];
                for(let cont of client.contacts) {
                    cont.icons = [{name: 'edit', active: true, icon: require('../../assets/images/Other/edit-icon-qa.png')},
                        {name: 'delete', active: true, icon: require('../../assets/images/Other/delete-icon-qa-form.png')}]
                }
                this.clients.push(client);
            }
            this.loadingToggle(false);
        },
        ...mapActions({
            loadingToggle: "loadingToggle"
        })
    },
    computed: {
        allClients() {
            let result = this.clients;
            if(this.filterName) {
                result = result.filter(item => {
                    return item.name.toLowerCase().indexOf(this.filterName.toLowerCase()) != -1;
                })
            }
            if(this.filterStatus) {
                result = result.filter(item => {
                    return item.status == this.filterStatus;
                })
            }
            if(this.industryFilter[0].name != 'All') {
                result = result.filter(item => {
                    let exist = false;
                    for(let indus of item.industry) {
                        if(indus.name == this.industryFilter[0].name) {
                            exist = true;
                            break;
                        }
                    }
                    if(exist) {
                        return item
                    }
                })
            }
            if(this.filterLeadsource) {
                result = result.filter(item => {
                    return item.leadSource == this.filterLeadsource;
                })
            }
            return result;
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
        ClientIndustrySelect,
        MultiClientIndustrySelect,
        ClientStatusSelect,
        ClientLeadsourceSelect,
        ClientDetails,
        Addseverallangs
    },
    mounted() {
        this.getclients();
    }
}
</script>

<style lang="scss" scoped>

.all-clients {
    margin-top: 20px;
    margin-left: 20px;
    position: relative;
}

.title {
    font-size: 22px;
}

label {
    margin-bottom: 0;
}

.filters {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 20px;
    &__block {
        width: 27%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        &:nth-of-type(2) {
            width: 30%;
        }
        &:last-child {
            width: 22%;
        }
    }
}

.filters-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    &:first-child {
        margin-bottom: 20px;
    }
    ::-webkit-input-placeholder {
        opacity: 0.5;
    }
}

.add-button {
    width: 190px;
    height: 26px;
    color: white;
    font-size: 14px;
    border-radius: 10px;
    -webkit-box-shadow: 0 3px 5px rgba(0,0,0,.4);
    box-shadow: 0 3px 5px rgba(0,0,0,.4);
    background-color: #D15F45;
    border: 1px solid #D15F45;
    cursor: pointer;
}

.filter-field {
    width: 188px;
    height: 28px;
    padding-left: 3px;
    border: 1px solid #67573E;
    border-radius: 5px;
    outline: none;
}

.clients-table {
    width: 900px;
    margin: 40px;
    padding: 30px;
    font-size: 14px;
    font-weight: normal;
    box-shadow: 0 0 10px rgba(103, 87, 62, 0.5);
    table {
        width: 100%;
        border: 1px solid #67573E;
        border-collapse: collapse;
        thead {
            background-color: #968A7E;
            color: #FFF;
        }
    }
}
thead, tbody {
    width: 100%;
    display: block;
}
tbody {
    overflow-y: scroll;
}
th, td {
    width: 135px;
    &:nth-of-type(3), &:nth-of-type(4) {
        width: 180px;
    }
}
th {
    border-right: 1px solid #FFF;
    padding: 5px 1px;
    &:last-child {
        border-right: none;
        width: 117px
    }
    &:first-child {
        padding-left: 0;
    }
}
td {
    border-right: 1px solid #67573E;
    border-bottom: 1px solid #67573E;
    &:last-child {
        width: 102px;
        border-right: none;
    }
    &:first-child {
        padding-right: 0;
    }
    input {
        color: #67573E;
    }
}
.dropOption {
  position: relative;
  .innerComponent {
    position: absolute;
    background-color: #fff;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 5;
  }
  &__image {
    display: flex;
    align-items: center;
    max-height: 21px;
    .titleTooltip {
      position: absolute;
      display: none;
      color: #D15F45;
      font-size: 12px;
      top: 8px;
      left: 35px;
    }
    &:hover {
      .titleTooltip {
        display: block;
      }
    }
    img {
        max-width: 21px;
    }
  }
}
tr {
    cursor: pointer;
}
.head-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 5px;
}

.contact-info {
    border: none;
    outline: none;
    width: 109px;
    margin: 2px;
    padding: 3px 0 3px 5px;
}

.editing {
    box-shadow: inset 0 0 8px rgba(103, 87, 62, 0.75);
}

.outer-check {
    margin: 0 auto;
    width: 14px;
    height: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    border: 1px solid #67573E;
    cursor: pointer;
    .inner-check {
        width: 68%;
        height: 68%;
        border-radius: 50%;
        background-color: #FFF;
    }
    .checked {
        background-color: #67573E;
    }
}

.crud-icons {
    display: flex;
    align-items: center;
    justify-content: space-around;
    img {
        cursor: pointer;
    }
}

.not-active {
    opacity: 0.5;
}

input {
    color: #67573E;
}

</style>
