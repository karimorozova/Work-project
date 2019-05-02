<template lang="pug">
    .all-clients
        .title(v-if="!clientData") All Clients
        .all-clients__table(v-if="!clientData")
            .filters
                .filters__block
                    .filters-item
                        label Name
                        input.filter__input-field(type="text" placeholder="Company Name" v-model="filterName")
                    .filters-item
                        label Status
                        .filters__drop-menu
                            ClientStatusSelect(:isAllExist="isAllStatusExist" :selectedStatus="filterStatus" @chosenStatus="chosenStatus")
                .filters__block
                    .filters-item
                        label Industry
                        .filters__drop-menu.filters_high-index
                            ClientIndustrySelect(:isAllExist="isAllIndustyFilter" :selectedInd="[industryFilter]" @chosenInd="chosenInd")
                    .filters-item
                        label Lead Source
                        .filters__drop-menu
                            ClientLeadsourceSelect(:isAllExist="isAllLeadExist" :selectedLeadsource="filterLeadsource" @chosenLeadsource="chosenLeadsource")
                .filters__block
                    input.add-button(type="submit" value="Add client" @click="addClient")
            ClientsTable(
                :filterName="filterName"
                :filterStatus="filterStatus"
                :filterLeadsource="filterLeadsource"
                :filterIndustry="industryFilter"
                @showClientDetails="showClientDetails"
            )
</template>

<script>
import ClientsTable from "./ClientsTable";
import ClientIndustrySelect from '../clients/ClientIndustrySelect';
import MultiClientIndustrySelect from '../clients/MultiClientIndustrySelect';
import ClientStatusSelect from '../clients/ClientStatusSelect';
import ClientLeadsourceSelect from '../clients/ClientLeadsourceSelect';
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            clientData: false,
            filterName: "",
            filterStatus: "All",
            industryFilter: {name: 'All'},
            filterLeadsource: "All",
            industrySelected: [],
            isAllIndustyFilter: true,
            isAllStatusExist: true,
            isAllLeadExist: true
        }
    },
    methods: {
        async getCustomers() {
            try {
                if(!this.allClients.length) {
                    let result = await this.$http.get('/all-clients');
                    this.customersGetting(result.body);
                }
            } catch(err) {
                this.alertToggle({message: "Error on getting customers", isShow: true, type: "error"});
            }
        },
        async getXtmCustomers() {
            try {
                if(!this.allXtmCustomers.length) {
                    let result = await this.$http.get('/xtm/xtm-customers');
                    this.xtmCustomersGetting(result.body);
                }
            } catch(err) {
                this.alertToggle({message: "Error on getting XTM customers", isShow: true, type: "error"});
            }
        },
        closeSevLangs(data) {
            this.addSeveral = false
        },
        clientCancel() {
            this.clientData = false;
            this.$emit('clientCancel');
        },
        async showClientDetails({id}) {
            const client = this.allClients.find(item => item._id === id);
            let str = JSON.stringify(client);
            const currentClient = JSON.parse(str);
            await this.storeCurrentClient(currentClient);
            this.$router.push(`/clients/${id}`);
        },
        addClient() {
            this.$router.push('/new-client');
        },
        chosenLeadsource({leadSource}) {
            this.filterLeadsource = leadSource;
        },
        chosenStatus({status}) {
            this.filterStatus = status;
        },
        chosenInd({industry}) {
            this.industryFilter = industry;
        },
        ...mapActions({
            alertToggle: "alertToggle",
            customersGetting: "customersGetting",
            storeCurrentClient: "storeCurrentClient"
        })
    },
    computed: {
        ...mapGetters({
            allClients: "getClients",
            allXtmCustomers: "getXtmCustomers"
        }),
    },
    components: {
        ClientsTable,
        ClientIndustrySelect,
        MultiClientIndustrySelect,
        ClientStatusSelect,
        ClientLeadsourceSelect,
    },
    created() {
        this.getCustomers();
        // this.getXtmCustomers();
    },
    mounted() {
        this.storeCurrentClient({});
    }
}
</script>

<style lang="scss" scoped>

.all-clients {
    margin-top: 20px;
    margin-left: 20px;
    position: relative;
    width: 65%;
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
        width: 24%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        &:nth-of-type(2) {
            width: 28%;
        }
        &:last-child {
            width: 20%;
        }
    }
    &__drop-menu {
        width: 191px;
        height: 28px;
        position: relative;
    }
    &_high-index {
        z-index: 10;
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

.filter__input-field {
    width: 191px;
    height: 28px;
    padding-left: 5px;
    border: 1px solid #67573E;
    border-radius: 5px;
    outline: none;
    box-sizing: border-box;
}

.all-clients__table {
    margin: 40px 40px 40px 0;
    padding: 20px;
    font-size: 14px;
    font-weight: normal;
    box-shadow: 0 0 10px rgba(103, 87, 62, 0.5);
}

.drop-option {
  position: relative;
  .inner-component {
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
