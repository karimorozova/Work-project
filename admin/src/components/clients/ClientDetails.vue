<template lang="pug">
    .clients-wrap
        .client-info(v-if="clientShow")
            .buttons
                input.button(type="button" value="Save" @click="updateClient")
                input.button(type="button" value="Cancel" @click="cancel")
                input.button(type="button" value="Delete" @click="deleteContact")
            .title General Information
            .gen-info
                .gen-info__block
                    .block-item
                        label Company Name:
                        input(type="text" placeholder="Company Name" v-model="client.name")
                    .block-item
                        label Website:
                        input(type="text" placeholder="Website" v-model="client.website")
                    .block-item
                        label Industry:
                        ClientIndustrySelect(:selectedInd="client.industry" @chosenInd="chosenInd")
                    .block-item
                        label Status:
                        ClientStatusSelect(:selectedStatus="client.status" @chosenStatus="chosenStatus")
                .gen-info__block
                    .block-item
                        label Contract:
                        .contract
                            .contract__upload
                                input.upload(type="file")
                            .contract__download
                                img(src="../../assets/images/Other/Download-icon.png")
                        label NDA:
                        .contract
                            .contract__upload
                                input.upload(type="file")
                            .contract__download
                                img(src="../../assets/images/Other/Download-icon.png")
                    .block-item
                        label Account Manager:
                        AMSelect(:selectedManager="client.accountManager" @chosenManager="chosenAccManager")
                    .block-item
                        label Sales Manager:
                        AMSelect(:selectedManager="client.salesManager" @chosenManager="chosenSalesManager")
                    .block-item
                        label Project Manager:
                        AMSelect(:selectedManager="client.projectManager" @chosenManager="chosenProjManager")
            .title Contact Details
            .contacts-info
                ContactsInfo(:client="client" @contactDetails="contactDetails" @newContact="addNewContact")
            .title Rates    
            .rates
                ClientRates(:client="client" @addSevLangs="addSevLangs")
            .title Sales Information
            .sales
                ClientSalesInfo(:client="client" @deleteContact="approveDelete")
            .title Billing Informations
            .billing
                ClientBillInfo(:client="client")
            .delete-approve(v-if="approveShow")
                p Are you sure you want to delete?
                input.button.approve-block(type="button" value="Cancel" @click="cancelApprove")
                input.button(type="button" value="Delete" @click="approveClientDelete")  
        .contact-info(v-if="contactShow")
            ContactDetails(v-if="!newContact" 
                @cancel="contactCancel"
                @contactUpdate="contactUpdate"
                @approveDelete="approveDelete"
                :client="client"
                :ind="contactInd")
            NewContactDetails(v-if="newContact" :client="client" @contactSave="contactSave")           
</template>

<script>
import ClientIndustrySelect from './ClientIndustrySelect';
import ClientStatusSelect from './ClientStatusSelect';
import AMSelect from './AMSelect';
import ContactsInfo from './ContactsInfo';
import ClientRates from './ClientRates';
import ClientSalesInfo from './ClientSalesInfo';
import ClientBillInfo from './ClientBillInfo';
import ContactDetails from '../clients/ContactDetails';
import NewContactDetails from '../clients/NewContactDetails';


export default {
    props: {
        client: {
            type: Object
        },
        newClient: {
            type: Boolean
        }
    },
    data() {
        return {
            approveShow: false,
            clientShow: true,
            contactShow: false,
            contactInd: 0,
            newContact: false
        }
    },
    methods: {
        addSevLangs(data) {
            this.$emit('addSevLangs')
        },
        cancel() {
            this.$emit('cancel')
        },
        contactCancel(data) {
            this.clientShow = true;
            this.contactShow = false;
            this.$emit('contactCancel');
        },
        deleteContact() {
            this.approveShow = true;
        },
        approveDelete(data) {
            this.clientShow = true;
            this.contactShow = false;
            this.$emit('deleteContact', data)
        },
        cancelApprove() {
            this.approveShow = false;
        },
        chosenInd(data) {
            this.$emit('chosenInd', data.industry);
        },
        chosenStatus(data) {
            this.$emit('chosenStatus', data);
        },
        chosenAccManager(data) {
            this.$emit('chosenAccManager', data);
        },
        chosenSalesManager(data) {
            this.$emit('chosenSalesManager', data);
        },
        chosenProjManager(data) {
            this.$emit('chosenProjManager', data);
        },
        contactDetails(data) {
            this.clientShow = false;
            this.contactShow = true;
            this.newContact = false;
            this.contactInd = data.contactIndex;
        },
        addNewContact(data) {
            this.clientShow = false;
            this.contactShow = true;
            this.newContact = true;
        },
        updateClient() {
            if(!this.newClient) {
                this.$http.post('clientsapi/update-client', this.client)
                .then(res => {
                    console.log(res)
                })
                .catch(err => {
                    console.log(err)
                })
                this.$emit('refreshClients');
            } else {
                this.$http.post('clientsapi/new-client', this.client)
                .then(res => {
                    console.log(res)
                })
                .catch(err => {
                    console.log(err)
                })
                this.$emit('refreshClients');
            }
        },
        approveClientDelete() {
            if(this.newClient) {
                this.cancel()
            } else {
                this.$emit('clientDelete', this.client)
            }
        },
        contactUpdate(data) {
            this.updateClient();
            this.clientShow = true;
            this.contactShow = false;
        },
        contactSave(data) {
            this.$emit('newContact', {contact: data});
            this.clientShow = true;
            this.contactShow = false;
        }
    },
    components: {
    ClientIndustrySelect,
    ClientStatusSelect,
    AMSelect,
    ContactsInfo,
    ClientRates,
    ClientSalesInfo,
    ClientBillInfo,
    ContactDetails,
    NewContactDetails
  }
}
</script>

<style lang="scss" scoped>

.clients-wrap {
    position: relative;
}

.title {
    font-size: 22px;
}
.gen-info, .contacts-info, .rates, .sales, .billing {
    margin: 20px 10px 40px 10px;
    padding: 40px;
    box-shadow: 0 0 15px #67573e9d;
    width: 800px;
}
.rates {
    padding: 10px;
    width: 860px;
}
.gen-info {
    display: flex;
    justify-content: space-between;
    &__block {
        width: 40%;
    }
}
.block-item {
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    label {
        margin-bottom: 0;
    }
    input {
        font-size: 14px;
        color: #67573e;
        border: 1px solid #67573e;
        border-radius: 5px;
        padding: 0 3px;
        outline: none;
        width: 185px;
        height: 28px;
    }
    ::-webkit-input-placeholder {
        padding: 10px 5px;
        opacity: 0.5;
    }
}
.contract {
    display: flex;
    align-items: center;
    width: 22%;
    justify-content: space-between;
    &__upload {
        position: relative;
        background: url("../../assets/images/Other/upload-icon.png");
        background-repeat: no-repeat;
        width: 40%;
        height: 22px;
        overflow: hidden;
        .upload {
        padding-left: 0;
        padding-right: 0;
        width: 33px;
        height: 22px;
        border: none;
        outline: none;
        margin-top: -3px;
        margin-right: 2px;
        opacity: 0;
        z-index: 2;
        position: absolute;
        cursor: pointer;
        left: -10px;
        }
    }
    &__download {
        width: 40%;
        cursor: pointer;
    }
}

.buttons {
  width: 99%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.button {
    margin-left: 30px;
    width: 138px;
    height: 33px;
    color: white;
    font-size: 14px;
    border-radius: 10px;
    -webkit-box-shadow: 0 3px 5px rgba(0,0,0,.4);
    box-shadow: 0 3px 5px rgba(0,0,0,.4);
    background-color: #ff876c;
    border: 1px solid #ff876c;
    cursor: pointer;
    outline: none;
    .delete-approve & {
        margin-left: 0;
    }
}

.delete-approve {
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
    box-shadow: 0 0 10px #67573E;
    background-color: #FFF;
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

input {
    color: #67573E;
}

</style>
