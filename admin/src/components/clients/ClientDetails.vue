<template lang="pug">
.clients-wrap
    .clients-wrap__sidebar(v-if="sidebarShow")
        Sidebar(title="Clients" :links="sidebarLinks" linkClass="client-details")
    .client-info(v-if="clientShow")
        .buttons
            input.button(type="button" value="Save" @click="checkForErrors")
            input.button(type="button" value="Cancel" @click="cancel")
            input.button(type="button" value="Delete" @click="deleteClient")
        .title General Information
        .clients-wrap__gen-info
            .gen-info__block
                .block-item
                    label.block-item__label.block-item_relative Company Name:
                        Asterisk(:customStyle="asteriskStyle")
                    input(type="text" placeholder="Company Name" :value="currentClient.name" @change="(e) => changeProperty(e, 'name')" :class="{'clients-wrap_error-shadow': !currentClient.name && isSaveClicked}")
                .block-item
                    label.block-item__label Website:
                    input(type="text" placeholder="Website" :value="currentClient.website" @change="(e) => changeProperty(e, 'website')")
                .block-item
                    label.block-item__label.block-item_relative Industry:
                        Asterisk(:customStyle="asteriskStyle")
                    .block-item__drop.block-item_high-index(:class="{'clients-wrap_error-shadow': !currentClient.industries.length && isSaveClicked}")
                        MultiClientIndustrySelect(:selectedInd="currentClient.industries" :filteredIndustries="selectedIndNames" @chosenInd="chosenInd")
                .block-item
                    label.block-item__label.block-item_relative Status:
                        Asterisk(:customStyle="asteriskStyle")
                    .block-item__drop(:class="{'clients-wrap_error-shadow': !currentClient.status && isSaveClicked}")
                        ClientStatusSelect(:selectedStatus="currentClient.status" @chosenStatus="setStatus")
            .gen-info__block
                .block-item
                    label.block-item__label Contract:
                    .contract
                        .contract__upload
                            input.upload(type="file" @change="contractLoad")
                        .contract__download
                            a(v-if="currentClient.contract" :href="currentClient.contract")
                                img(src="../../assets/images/Other/Download-icon.png")
                    label.block-item__label NDA:
                    .nda
                        .nda__upload
                            input.upload(type="file" @change="ndaLoad")
                        .nda__download
                            a(v-if="currentClient.nda" :href="currentClient.nda")
                                img(v-if="currentClient.nda" src="../../assets/images/Other/Download-icon.png")
                .block-item
                    label.block-item__label.block-item_relative Account Manager:
                        Asterisk(:customStyle="asteriskStyle")
                    .block-item__drop.block-item_high-index(:class="{'clients-wrap_error-shadow': !currentClient.accountManager && isSaveClicked}")
                        AMSelect(:selectedManager="currentClient.accountManager" @chosenManager="(manager) => setManager(manager, 'accountManager')")
                .block-item
                    label.block-item__label.block-item_relative Sales Manager:
                        Asterisk(:customStyle="asteriskStyle")
                    .block-item__drop.block-item_medium-index(:class="{'clients-wrap_error-shadow': !currentClient.salesManager && isSaveClicked}")
                        AMSelect(:selectedManager="currentClient.salesManager" @chosenManager="(manager) => setManager(manager, 'salesManager')")
                .block-item
                    label.block-item__label.block-item_relative Project Manager:
                        Asterisk(:customStyle="asteriskStyle")
                    .block-item__drop(:class="{'clients-wrap_error-shadow': !currentClient.projectManager && isSaveClicked}")
                        AMSelect(:selectedManager="currentClient.projectManager" @chosenManager="(manager) => setManager(manager, 'projectManager')")
        .title Contact Details
        .clients-wrap__contacts-info
            ContactsInfo(
                :client="currentClient"
                @contactDetails="contactDetails" 
                @saveContactUpdates="saveContactUpdates"
                @setLeadContact="setLeadContact"
                @newContact="addNewContact"
                @approveDelete="approveContactDelete")
        .title(v-if="currentClient._id") Rates    
        .clients-wrap__rates(v-if="currentClient._id")
            ClientRates(:client="currentClient"
                @addSevLangs="addSevLangs"
                @setMatrixData="setMatrixData")
        .title Sales Information
        .clients-wrap__sales
            ClientSalesInfo(:client="currentClient" @setLeadSource="setLeadSource")
        .title Billing Informations
        .clients-wrap__billing
            ClientBillInfo(:client="currentClient" @changeProperty="changeBillingProp")
        .delete-approve(v-if="approveShow")
            p Are you sure you want to delete?
            input.button.approve-block(type="button" value="Cancel" @click="cancelApprove")
            input.button(type="button" value="Delete" @click="approveClientDelete")
        Addseverallangs(v-if="addSeveral"
            :who="currentClient"
            :origin="'client'"
            @closeSeveral="closeSevLangs"
            @severalLangsResult="severalLangsResult")  
    .contact-info(v-if="contactShow")
        ContactDetails(v-if="!newContact" 
            @cancel="contactCancel"
            @contactUpdate="contactUpdate"
            @approveDelete="approveContactDelete"
            :index="contactInd")
        NewContactDetails(v-if="newContact" 
            @contactSave="contactSave"
            @cancel="contactCancel")
    ValidationErrors(v-if="areErrorsExist"
        :errors="errors"
        @closeErrors="closeErrorsBlock"
    )        
</template>

<script>
import Sidebar from '../Sidebar';
import Asterisk from "../Asterisk";
import ValidationErrors from "../ValidationErrors";
import MultiClientIndustrySelect from './MultiClientIndustrySelect';
import ClientStatusSelect from './ClientStatusSelect';
import AMSelect from './AMSelect';
import ContactsInfo from './ContactsInfo';
import ClientRates from './ClientRates';
import ClientSalesInfo from './ClientSalesInfo';
import ClientBillInfo from './ClientBillInfo';
import ContactDetails from '../clients/ContactDetails';
import NewContactDetails from '../clients/NewContactDetails';
import Addseverallangs from "../finance/Addseverallangs";
import { mapGetters, mapActions} from "vuex";

export default {
    data() {
        return {
            approveShow: false,
            clientShow: true,
            contactShow: false,
            contactInd: 0,
            newContact: false,
            contractFile: [],
            ndaFile: [],
            contactsPhotos: [],
            client: {},
            sidebarShow: true,
            sidebarLinks: ["General Information"],
            fromRoute: "/clients",
            areErrorsExist: false,
            errors: [],
            billErrors: [],
            isLeadEmpty: "",
            isSaveClicked: false,
            addSeveral: false,
            addSeveralServiceTitle: "",
            asteriskStyle: {"top": "-4px"}
        }
    },
    methods: {
        contractLoad(e) {
            if(e.target.files && e.target.files[0]) {
                this.contractFile = e.target.files;
            }
        },
        ndaLoad(e) {
            if(e.target.files && e.target.files[0]) {
                this.ndaFile = e.target.files;
            }
        },
        addSevLangs({serviceTitle}) {
            this.addSeveral = true;
            this.addSeveralServiceTitle = serviceTitle;
        },
        closeSevLangs() {
            this.addSeveral = false;
        },
        async severalLangsResult({message, isShow, type}) {
            await this.getDuoCombinations({clientId: this.currentClient._id, serviceTitle: this.addSeveralServiceTitle});
            this.alertToggle({message, isShow, type});
        },
        async setMatrixData({value, key}) {
            let matrix = {...this.currentClient.matrix};
            matrix[key].rate = value;
            try {
                const result = await this.$http.post("/clientsapi/update-matrix", { id: this.currentClient._id, matrix });
                const { updatedClient } = result.body;
                await this.storeClient(updatedClient);
                this.storeClientProperty({prop: "matrix", value: matrix});
                this.alertToggle({message: "Matrix has been updated", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: "Internal server error on updating matrix", isShow: true, type: "error"});
            }
        },
        cancel() {
            if(this.fromRoute === "/new-client") {
                this.$router.push("/clients");
            } else {
                this.$router.push(this.fromRoute);
            }
            this.storeCurrentClient({});
        },
        saveContactUpdates({index, contact}) {
            this.updateClientContact({index, contact});
        },
        contactCancel() {
            this.clientShow = true;
            this.contactShow = false;
        },
        deleteClient() {
            this.approveShow = true;
        },
        contactLeadError() {
            return this.currentClient.contacts.find(item => item.leadContact);
        },
        async approveContactDelete({index}) {
            this.clientShow = true;
            this.contactShow = false;
            try {
                const contacts = this.currentClient.contacts.filter((item, ind) => ind !== index);
                const result = await this.$http.post('/clientsapi/deleteContact', {id: this.currentClient._id, contacts})
                const {updatedClient} = result.body;
                await this.storeClient(updatedClient);
                await this.storeCurrentClient(updatedClient);
                this.alertToggle({message: "Contact has been deleted", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: "Internal server error on deleting contact", isShow: true, type: "error"});
            }
        },
        cancelApprove() {
            this.approveShow = false;
        },
        chosenInd({industry}) {
            let industries = [...this.currentClient.industries];
            const position = industries.findIndex(item => item._id === industry._id);
            if(position !== -1) {
                industries.splice(position, 1);
            } else {
                industries.push(industry);
            }
            this.storeClientProperty({prop: 'industries', value: industries});
        },
        setStatus({status}) {
            this.storeClientProperty({prop: 'status', value: status})
        },
        setLeadSource({leadSource}) {
            this.storeClientProperty({prop: 'leadSource', value: leadSource});
        },
        changeProperty(e, prop) {
            this.storeClientProperty({prop, value: e.target.value});
        },
        changeBillingProp({prop, value}) {
            this.storeClientProperty({prop, value});
        },
        setManager({manager}, prop) {
            this.storeClientProperty({prop, value: manager});
        },
        contactDetails({contactIndex}) {
            this.clientShow = false;
            this.contactShow = true;
            this.newContact = false;
            this.contactInd = contactIndex;
        },
        addNewContact(data) {
            this.clientShow = false;
            this.contactShow = true;
            this.newContact = true;
        },
        closeErrorsBlock() {
            this.areErrorsExist = false;
        },
        clearErrors() {
            this.errors = [];
            this.billErrors = [];
            this.isLeadEmpty = false;
        },
        async checkForErrors() {
            this.clearErrors();
            const emailValidRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;            
            if(!this.currentClient.name) this.errors.push('Company name cannot be empty.');
            if(!this.currentClient.industries.length) this.errors.push('Please, choose at least one industry.');
            if(!this.currentClient.contacts.length) this.errors.push('Please, add at least one contact.');
            if(!this.contactLeadError()) this.errors.push('Please set Lead Contact of the Client.');            
            if(!this.currentClient.status) this.errors.push('Please, choose status.');
            if(!this.currentClient.leadSource) {
                this.errors.push('Please, choose lead source.');
                this.isLeadEmpty = true;
            }
            if(!this.currentClient.email || !emailValidRegex.test(this.currentClient.email.toLowerCase())) {
                this.errors.push('Please provide a valid email.');
                this.billErrors.push('email');
            }
            if(!this.currentClient.accountManager || !this.currentClient.salesManager || !this.currentClient.projectManager) this.errors.push('All managers should be assigned.');
            if(this.errors.length) {
                this.areErrorsExist = true;
                this.isSaveClicked = true;
                return
            }
            await this.updateClient();
        }, 
        async updateClient() {
            let sendData = new FormData();
            sendData.append('client', JSON.stringify(this.currentClient));
            for(let i = 0; i < this.contactsPhotos.length; i++) {
                sendData.append('photos', this.contactsPhotos[i]);
            }
            for(let i = 0; i < this.contractFile.length; i++) {
                sendData.append('contract', this.contractFile[i]);
            }
            for(let i = 0; i < this.ndaFile.length; i++) {
                sendData.append('nda', this.ndaFile[i]);
            }
            try {
                const result = await this.$http.post('/clientsapi/update-client', sendData);
                const { client } = result.body;
                await this.storeClient(client);
                await this.storeCurrentClient(client);
                this.alertToggle({message: "Client info has been updated", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: "Internal server error on updating Client info", isShow: true, type: "error"});
            }  
        },
        async approveClientDelete() {
            const id = this.currentClient._id;
            try {
                const result = await this.$http.delete(`/clientsapi/deleteclient/${id}`);
                await this.removeClient(id);
                this.alertToggle({message: "Client has been removed", isShow: true, type: "success"});
                this.$router.push('/clients');
            } catch(err) {
                this.alertToggle({message: "Internal server error on deleting the Client", isShow: true, type: "error"});
            }
        },
        contactUpdate({index, file, contact}) {
            this.contactsPhotos.push(file);
            this.updateClientContact({index, contact});
            this.contactCancel();
        },
        setLeadContact({index}) {
            this.updateLeadContact(index);
        },
        contactSave({file, contact}) {
            this.contactsPhotos.push(file);
            this.storeClientContact(contact);
            let newContact = {...contact};  
            if(this.currentClient.contacts.length === 1) {
                newContact.leadContact = true;
                this.updateClientContact({index: 0, contact: newContact});
            }
            this.contactCancel();
        },
        async getClientInfo() {
            const client = this.allClients.find(item => item._id === this.$route.params.id);
            let str = JSON.stringify(client);
            const currentClient = JSON.parse(str);
            this.storeCurrentClient(currentClient);
        },
        ...mapActions({
            alertToggle: "alertToggle",
            storeClient: "storeClient",
            storeCurrentClient: "storeCurrentClient",
            storeClientProperty: "storeClientProperty",
            removeClient: "removeClient",
            storeClientContact: "storeClientContact",
            updateClientContact: "updateClientContact",
            updateLeadContact: "updateLeadContact",
            deleteClientContact: "deleteClientContact",
            getDuoCombinations: "getClientDuoCombinations"
        })
    },
    computed: {
        ...mapGetters({
            allClients: "getClients",
            currentClient: "getCurrentClient"
        }),
        selectedIndNames() {
            let result = [];
            if(this.currentClient.industries.length) {
                for(let ind of this.currentClient.industries) {
                    result.push(ind.name);
                }
            }
            return result;
        },
    },
    components: {
        Sidebar,
        Asterisk,
        ValidationErrors,
        MultiClientIndustrySelect,
        ClientStatusSelect,
        AMSelect,
        ContactsInfo,
        ClientRates,
        ClientSalesInfo,
        ClientBillInfo,
        ContactDetails,
        NewContactDetails,
        Addseverallangs
    },
    created() {
        this.getClientInfo();
    },
    beforeRouteEnter (to, from, next) {
        next(vm => {
            vm.fromRoute = from.path;
        })
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.clients-wrap {
    position: relative;
    display: flex;
    width: 100%;
    &__gen-info, &__contacts-info, &__rates, &__sales, &__billing {
        margin: 20px 10px 40px 10px;
        padding: 40px;
        box-shadow: 0 0 15px #67573e9d;
        width: 900px;
        box-sizing: border-box;
    }
    &__rates {
        padding: 10px;
    }
    &__gen-info {
        display: flex;
        justify-content: space-between;
        .gen-info__block {
            width: 40%;
        }
    }
    &_error-shadow {
        box-shadow: 0 0 5px $red;
    }
}

.client-info, .contact-info {
    padding: 40px;
    width: 52%;
}

.client-info {
    position: relative;
}

.title {
    font-size: 22px;
}

.block-item {
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    &__label {
        margin-bottom: 0;
    }
    &_relative {
        position: relative;
    }
    &__drop {
        position: relative;
        width: 191px;
        height: 28px;
    }
    &_high-index {
        z-index: 10;
    }
    &_medium-index {
        z-index: 8;
    }
    input {
        font-size: 14px;
        color: #67573e;
        border: 1px solid #67573e;
        border-radius: 5px;
        box-sizing: border-box;
        padding: 0 5px;
        outline: none;
        width: 191px;
        height: 28px;
    }
    ::-webkit-input-placeholder {
        padding: 10px 5px;
        opacity: 0.5;
    }
}
.contract, .nda {
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
            left: -10px;
        }
    }
    &__download {
        width: 40%;
        cursor: pointer;
    }
}

.buttons {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-left: 10px;
    width: 900px;
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
    background-color: #D15F45;
    border: 1px solid #D15F45;
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
