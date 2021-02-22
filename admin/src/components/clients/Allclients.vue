<template lang="pug">
    .all-clients
        .all-clients__table
            .clients-filters
                .clients-filters__row
                    .clients-filters__item
                        label Name:
                        input.clients-filters__input-field(type="text" placeholder="Company Name" v-model="nameFilter" @keyup="filterByName")
                    .clients-filters__item
                        label Industry:
                        .clients-filters__drop-menu
                            ClientIndustrySelect(:isAllExist="isAllIndustyFilter" :selectedInd="[industryFilter]" @chosenInd="chosenInd")
                    .clients-filters__item
                        label Lead Source:
                        .clients-filters__drop-menu
                            ClientLeadsourceSelect(:isAllExist="isAllLeadExist" :selectedLeadsource="leadSourceFilter" @chosenLeadsource="chosenLeadsource")
                .clients-filters__row-button
                    input.add-button(type="submit" value="Add client" @click="addClient")
            ClientsTable(
                :clients="allClients"
                :nameFilter="nameFilter"
                :statusFilter="statusFilter"
              :leadSourceFilter="leadSourceFilter"
                :filterIndustry="industryFilter"
                @showClientDetails="showClientDetails"
                @update="update"
                @bottomScrolled="bottomScrolled"
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
        statusFilter: {
            type: String,
            default: "All"
        }
    },
    data() {
        return {
          nameFilter: "",
          industryFilter: { name: 'All' },
          leadSourceFilter: "All",
          isAllIndustyFilter: true,
          isAllStatusExist: true,
          isAllLeadExist: true,
          isDataRemain: true,
          lastId: "",
          typingTimer: "",
          doneTypingInterval: 800
        }
    },
    methods: {
        scrollBodyToTop() {
            let tbody = document.querySelector(".clients__table");
            tbody.scrollTop = 0;
        },
        async bottomScrolled() {
            if(this.isDataRemain) {
                const result = await this.$http.post('/all-clients', {filters: this.filters});
                this.setAllCustomers([...this.allClients, ...result.body]);
                this.isDataRemain = result.body.length === 25;
                this.lastId = result.body && result.body.length ? result.body[result.body.length - 1]._id : "";
            }
        },
        async update({status}) {
            if(this.statusFilter !== status) {
                await this.getCustomers();
            }
        },
        async getCustomers() {
            this.lastId = "";
            this.isDataRemain = true;
            try {
                let result = await this.$http.post('/all-clients', { filters: this.filters });
                this.setAllCustomers(result.body);
                this.lastId = result.body && result.body.length ? result.body[result.body.length - 1]._id : "";
                this.scrollBodyToTop();
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
        showClientDetails({id}) {
            const client = this.allClients.find(item => item._id === id);
            let str = JSON.stringify(client);
            const currentClient = JSON.parse(str);
            this.storeCurrentClient(currentClient);
            this.$router.push(`/clients/details/${id}`);
        },
        addClient() {
            this.$router.push('/clients/new-client');
        },
        filterByName(e) {
            const { value } = e.target;
            clearTimeout(this.typingTimer);
            this.typingTimer = setTimeout(doneTyping, this.doneTypingInterval);
            const vm = this;
            async function doneTyping () {
                await vm.getCustomers();
            }
        },
        async chosenLeadsource({leadSource}) {
          this.leadSourceFilter = leadSource;
          await this.getCustomers();
        },
        async chosenStatus({status}) {
            this.statusFilter = status;
            await this.getCustomers();
        },
        async chosenInd({industry}) {
            this.industryFilter = industry;
            await this.getCustomers();
        },
        ...mapActions([
            "alertToggle",
            "setAllCustomers",
            "storeCurrentClient"
        ])
    },
    computed: {
        ...mapGetters({
            allClients: "getClients"
        }),
        filters() {
            return {
              nameFilter: this.nameFilter,
              industryFilter: this.industryFilter,
              leadSourceFilter: this.leadSourceFilter,
              statusFilter: this.statusFilter,
              lastId: this.lastId
            }
        }
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
    width: 1180px;
    &__table {
        margin: 40px 40px 40px 0;
        padding: 20px;
        font-size: 14px;
        font-weight: normal;
        box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
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
    &__row-button{
      display: flex;
      margin-bottom: 20px;
    }
    &__row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 30px;
        margin-bottom: 20px;
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
        height: 30px;
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
  min-width: 120px;
  padding: 0 24px 0 24px;
  height: 34px;
  color: #fff;
  font-size: 14px;
  border-radius: 7px;
  background-color: #d15f45;
  border: none;
  transition: .1s ease;
  outline: none;
  letter-spacing: 0.2px;

  &:hover {
    cursor: pointer;
    box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
  }

  &:active {
    transform: scale(.98);
  }
}

.add-button:active, .add-button:focus{
    transform: scale(.98);
     outline: none!important;
     outline-color: none;
    border: none;
}

</style>
