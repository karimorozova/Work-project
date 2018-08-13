<template lang="pug">
    .all-clients
        .title All Clients
        .clients-table
            .filters
                .filters__block
                    .filters-item
                        label Name
                        input.filter-field(type="text" placeholder="Company Name")
                    .filters-item
                        label Status
                        ClientStatusSelect(:selectedStatus="filterStatus" @chosenStatus="chosenStatus")
                .filters__block
                    .filters-item
                        label Industry
                        ClientIndustrySelect(:selectedInd="filterIndustry" @chosenInd="chosenInd")
                    .filters-item
                        label Lead Source
                        ClientLeadsourceSelect(:selectedLeadsource="filterLeadsource" @chosenLeadsource="chosenLeadsource")
                .filters__block
                    input.button(type="submit" value="Add client")            
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
                    tr(v-for="(client, ind) in clients" @click="clientDetails(ind)")  
                        td(:class="{editing: !client.icons[0].active}") 
                            input.contact-info(type="text" :readonly="client.icons[0].active" v-model="client.companyName")
                        td(:class="{editing: !client.icons[0].active}") 
                            input.contact-info(type="text" :readonly="client.icons[0].active" v-model="client.status")
                        td(:class="{editing: !client.icons[0].active}") 
                            input.contact-info(type="text" :readonly="client.icons[0].active" v-model="client.website")
                        td.dropOption              
                            span(v-if="!client.industry.icon") {{ client.industry.name }}
                            .dropOption__image
                                img(v-if="client.industry.icon" :src="client.industry.icon")
                                span.titleTooltip {{ client.industry.name }} 
                            .innerComponent(v-if="!client.icons[0].active")
                                ClientIndustrySelect(:selectedInd="industrySelected" :parentInd="ind" @chosenInd="changeIndustry")
                        td
                            input.contact-info(type="text" :readonly="client.icons[0].active" v-model="client.leadSource")                        
                        td
                            .crud-icons
                                img(v-for="(but, i) in client.icons" :src='but.icon' :class="{'not-active': !but.active}" @click="action(ind, i)")
</template>

<script>
import ClientIndustrySelect from '../clients/ClientIndustrySelect';
import ClientStatusSelect from '../clients/ClientStatusSelect';
import ClientLeadsourceSelect from '../clients/ClientLeadsourceSelect';

export default {
    data() {
        return {
            clients: [
                {companyName: "sdfsdfsdfgsf", status: "Active", website: "www.ddd.com", industry: {name: "Finance", icon: ""}, leadSource: "Landing page", icons: [
                    {name: 'edit', active: true, icon: require('../../assets/images/Other/edit-icon-qa.png')},
                    {name: 'delete', active: true, icon: require('../../assets/images/Other/delete-icon-qa-form.png')}]},
                {companyName: "bdbgbgbdfgb", status: "Inactive", website: "www.ddd.com", industry: {name:"Finance",icon:""}, leadSource: "Website", icons: [
                    {name: 'edit', active: true, icon: require('../../assets/images/Other/edit-icon-qa.png')},
                    {name: 'delete', active: true, icon: require('../../assets/images/Other/delete-icon-qa-form.png')}]},
                {companyName: "tyjtjtyjtyjt", status: "Potential", website: "www.ddd.com", industry: {name:"Legal", icon:""}, leadSource: "Website", icons: [
                    {name: 'edit', active: true, icon: require('../../assets/images/Other/edit-icon-qa.png')},
                    {name: 'delete', active: true, icon: require('../../assets/images/Other/delete-icon-qa-form.png')}]}
                
            ],
            filterStatus: "",
            filterIndustry: {},
            filterLeadsource: "",
            industrySelected: {}
        }
    },
    methods: {
        clientDetails(ind) {
            if(this.clients[ind].icons[0].active) {
                this.$emit('chosenClient', this.clients[ind]);
            }
        },
        chosenLeadsource(data) {
            this.filterLeadsource = data;
        },
        chosenStatus(data) {
            this.filterStatus = data;
        },
        chosenInd(data) {
            this.filterIndustry = data.industry;
        },
        changeIndustry(data) {
            this.industrySelected = data.industry;
            this.clients[data.index].industry = data.industry;
        },
        chooseLead(ind) {
            if(!this.clients[ind].icons[0].active) {
                for(let client of this.clients) {
                    client.leadContact = false;
                }
                this.clients[ind].leadContact = true;
            }
        },
        action(ind, i) {
            if(i == 0) {
                for(let client of this.clients) {
                    client.icons[i].active = true;
                }
                this.clients[ind].icons[i].active = false;
            }
            if(i == 1) {
                this.clients.splice(ind, 1);
            }
        }
    },
    components: {
        ClientIndustrySelect,
        ClientStatusSelect,
        ClientLeadsourceSelect
    }
}
</script>

<style lang="scss" scoped>

.all-clients {
    margin-top: 20px;
    margin-left: 20px;
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

.button {
    width: 190px;
    height: 26px;
    color: white;
    font-size: 14px;
    border-radius: 10px;
    -webkit-box-shadow: 0 3px 5px rgba(0,0,0,.4);
    box-shadow: 0 3px 5px rgba(0,0,0,.4);
    background-color: #ff876c;
    border: 1px solid #ff876c;
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
    max-height: 21px;
    width: 30px;
    .titleTooltip {
      position: absolute;
      display: none;
      color: #ff876c;
      font-size: 12px;
      top: 8px;
      left: 35px;
    }
    &:hover {
      .titleTooltip {
        display: block;
      }
    }
  }
}
tr {
    cursor: pointer;
    &:last-child {
        td {
            border-bottom: none;
        }
    }
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

</style>
