<template lang="pug">
    .all-clients
        .all-clients__table
            .clients-filters
                .clients-filters__row
                    .clients-filters__item
                        label Name
                        input.clients-filters__input-field(type="text" placeholder="Company Name" v-model="filterName")
                    .clients-filters__item
                        label Industry
                        .clients-filters__drop-menu
                            ClientIndustrySelect(:isAllExist="isAllIndustyFilter" :selectedInd="[industryFilter]" @chosenInd="chosenInd")
                    .clients-filters__item
                        label Lead Source
                        .clients-filters__drop-menu
                            ClientLeadsourceSelect(:isAllExist="isAllLeadExist" :selectedLeadsource="filterLeadsource" @chosenLeadsource="chosenLeadsource")
                .clients-filters__row.clients-filters_flex-end
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
import ClientLeadsourceSelect from '../clients/ClientLeadsourceSelect';
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        filterStatus: {
            type: String,
            default: "All"
        }
    },
    data() {
        return {
            filterName: "",
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
        closeSevLangs(data) {
            this.addSeveral = false
        },
        clientCancel() {
            this.$emit('clientCancel');
        },
        async showClientDetails({id}) {
            const client = this.allClients.find(item => item._id === id);
            let str = JSON.stringify(client);
            const currentClient = JSON.parse(str);
            await this.storeCurrentClient(currentClient);
            this.$router.push(`/clients/details/${id}`);
        },
        addClient() {
            this.$router.push('/clients/new-client');
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
            allClients: "getClients"
        }),
    },
    components: {
        ClientsTable,
        ClientIndustrySelect,
        MultiClientIndustrySelect,
        ClientLeadsourceSelect,
    },
    created() {
        this.getCustomers();
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
    &__table {
        margin: 40px 40px 40px 0;
        padding: 20px;
        font-size: 14px;
        font-weight: normal;
        box-shadow: 0 0 10px rgba(103, 87, 62, 0.5);
    }
}

.title {
    font-size: 22px;
}

label {
    margin-bottom: 0;
}

.clients-filters {
    margin-bottom: 20px;
    &__row {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    &__drop-menu {
        width: 191px;
        height: 28px;
        position: relative;
        margin-left: 15px;
    }
    &__input-field {
        margin-left: 15px;
        width: 191px;
        height: 28px;
        padding-left: 5px;
        border: 1px solid #67573E;
        color: #67573E;
        border-radius: 5px;
        outline: none;
        box-sizing: border-box;
    }
    &__item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        ::-webkit-input-placeholder {
            opacity: 0.5;
        }
    }
    &_high-index {
        z-index: 10;
    }
    &_flex-end {
       justify-content: flex-end;
    }
}

.add-button {
    margin-top: 20px;
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

</style>
