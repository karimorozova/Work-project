<template lang="pug">
.client-layout
    .new-client-info(v-if="clientShow")
        .buttons
            .button
                Button(value="Save" @clicked="checkForErrors")
            .button
                Button(value="Cancel" @clicked="cancel")
        .title General Information
        .new-client-info__gen-info
            NewGeneral(
                :client="client"
                :isSaveClicked="isSaveClicked"
                :languages="languages"
                :timezones="timezones"
            )
        .title Contact Details
        .new-client-info__contacts-info(:class="{'new-client-info_error-shadow': !client.contacts.length && isSaveClicked}")
            ContactsInfo(
                :client="client" 
                @contactDetails="contactDetails" 
                @setLeadContact="setLeadContact"
                @saveContactUpdates="saveContactUpdates"
                @newContact="addNewContact"
                @approveDelete="approveContactDelete")
        .title Rates Parameters
        .new-client-info__rates
            NewRates(
                :client="client"
                :isSaveClicked="isSaveClicked"
            )

        .title Documents
        .new-client-info__documents
            NewClientDocuments(
                @uploadFiles="uploadFiles"
            )
        .title Sales Information
        .new-client-info__sales
            ClientSalesInfo(:client="client" @setLeadSource="setLeadSource" :isEmpty="isLeadEmpty")
        .title Billing Informations
        .new-client-info__billing
            ClientBillInfo(:client="client" :errorFields="billErrors" @changeProperty="setBillInfo")
        ValidationErrors(v-if="areErrorsExist"
            :errors="errors"
            @closeErrors="closeErrorsBlock"
        )
    .new-client-subinfo
        .new-client-subinfo__general
            NewSideGeneral(
                :client="client"
                :isSaveClicked="isSaveClicked"
            )
</template>

<script>
import NewRates from './clientInfo/NewRates';
import NewClientDocuments from './NewClientDocuments';
import NewGeneral from './clientInfo/NewGeneral'
import Button from "../Button";
import ValidationErrors from "../ValidationErrors";
import ContactsInfo from './ContactsInfo';
import ClientSalesInfo from './ClientSalesInfo';
import ClientBillInfo from './ClientBillInfo';
import NewSideGeneral from './clientInfo/NewSideGeneral'
import { mapGetters, mapActions} from "vuex";

export default {
    props: {
        client: {
            type: Object
        },
        contactsPhotos: {
            type: Array,
            default: () => []
        },
        contractFiles: {
            type: Array,
            default: () => []
        },
        ndaFiles: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            timezones: [],
            languages: [],
            errors: [],
            areErrorsExist: false,
            isSaveClicked: false,
            billErrors: [],
            isLeadEmpty: false,
            clientShow: true,
            contactShow: false,
            contactInd: 0,
            contractFile: [],
            ndaFile: [],
            documentsFiles: [],
        }
    },
    created(){
        this.getLangs();
        this.getTimezones();
    },
    methods: {
        async getLangs() {
            try {
            const result = await this.$http.get("/api/languages");
            this.languages = Array.from(result.body);
            } catch (err) {
            this.alertToggle({
                message: "Error in Languages",
                isShow: true,
                type: "error"
            });
            }
        },
        async getTimezones() {
            try {
            const result = await this.$http.get("/api/timezones");
            this.timezones = result.body;
            } catch (err) {
            this.alertToggle({
                message: "Error in Timezones",
                isShow: true,
                type: "error"
            });
            }
        },
        loadFile({files, prop}) {
            this.$emit("loadFile", {files, prop});
        },
        cancel() {
            this.$router.push("/clients");
        },
        approveContactDelete({index}) {
            this.client.contacts.splice(index, 1);
            if(this.client.contacts.length === 1) {
                this.client.contacts[0].leadContact = true;
            } else {
                const lead = this.client.contacts.find(item => item.leadContact);
                if(!lead) this.setLeadContact({index: 0});
            }
        },
        setLeadSource({leadSource}) {
            this.client.leadSource = leadSource;
        },
        setBillInfo({prop, value}) {
            this.client[prop] = value;
        },
        contactDetails({contactIndex}) {
            this.$router.push({name: "_contact", params: {index: contactIndex}});

        },
        addNewContact() {
            this.$router.push({name: "new_contact"})
        },
        setLeadContact({index}) {
            for(let contact of this.client.contacts) {
                contact.leadContact = false;
            } 
            this.client.contacts[index].leadContact = true;
        },
        saveContactUpdates({index, contact}) {
            this.client.contacts[index] = contact;
        },
        closeErrorsBlock() {
            this.areErrorsExist = false;
        },
        clearErrors() {
            this.errors = [];
            this.billErrors = [];
            this.isLeadEmpty = false;
        },
        contactLeadError() {
            return this.client.contacts.find(item => item.leadContact);
        },
        async checkForErrors() {
            this.clearErrors();
            const emailValidRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;            
            if(!this.client.name) this.errors.push('Company name cannot be empty.');
            if(!this.client.industries.length) this.errors.push('Please, choose at least one industry.');
            if(!this.client.sourceLanguages.length) this.errors.push('Please, choose at least one source language.');
            if(!this.client.targetLanguages.length) this.errors.push('Please, choose at least one target language.');
            if(!this.client.contacts.length) this.errors.push('Please, add at least one contact.');
            if(!this.client.currency.length) this.errors.push('Please, add currency.');
            if(this.client.defaultPricelist == '') this.errors.push('Please, add pricelist.');
            if(!this.contactLeadError()) this.errors.push('Please set Lead Contact of the Client.');
            if(!this.client.status) this.errors.push('Please, choose status.');
            if(!this.client.leadSource) {
                this.errors.push('Please, choose lead source.');
                this.isLeadEmpty = true;
            }
            if(!this.client.email || !emailValidRegex.test(this.client.email.toLowerCase())) {
                this.errors.push('Please provide a valid email.');
                this.billErrors.push('email');
            }
            if(!this.client.accountManager || !this.client.salesManager || !this.client.projectManager) this.errors.push('All managers should be assigned.');
            if(this.errors.length) {
                this.areErrorsExist = true;
                this.isSaveClicked = true;
                return
            }
            await this.saveClient();
        },
        uploadFiles(data){
            this.documentsFiles = data;
        },
        async saveClient() {            
            let sendData = new FormData();

            if(this.client.timeZone == ''){
                this.client.timeZone = null
            } 
            if(this.client.nativeLanguage == ''){
                this.client.nativeLanguage = null
            }
            
            sendData.append('client', JSON.stringify(this.client));
            for(let i = 0; i < this.contactsPhotos.length; i++) {
                sendData.append('photos', this.contactsPhotos[i]);
            }
            for (const document of this.documentsFiles) {
                sendData.append(document.category, document.file)
            }
            try {
                const result = await this.$http.post('/clientsapi/update-client', sendData);
                const newClient = {...result.body.client};
                await this.addNewClient(newClient);
                this.alertToggle({message: "New Client saved", isShow: true, type: "success"});
                this.$router.push(`/clients/details/${newClient._id}`);
            } catch(err) {
                this.alertToggle({message: "Internal server error on updating Client info", isShow: true, type: "error"})
            }  
        },
        ...mapActions({
            alertToggle: "alertToggle",
            addNewClient: "addNewClient"
        })
    },
    computed: {
        ...mapGetters({
            allClients: "getClients"
        }),
        selectedIndNames() {
            let result = [];
            if(this.client.industries.length) {
                for(let ind of this.client.industries) {
                    result.push(ind.name);
                }
            }
            return result;
        },
    },
    components: {
        NewGeneral,
        Button,
        ValidationErrors,
        ContactsInfo,
        ClientSalesInfo,
        ClientBillInfo,
        NewClientDocuments,
        NewSideGeneral,
        NewRates
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";
.client-layout {
  display: flex;
}
.new-client-subinfo {
  &__general {
    margin-top: 120px;
    width: 390px;
    height: 270px;
    box-shadow: 0 0 10px #67573e9d;
  }
  &__date {
    margin-top: 40px;
    width: 390px;
    height: 270px;
    box-shadow: 0 0 10px #67573e9d;
  }
}
.new-client-info {
    position: relative;
    padding: 40px;
    width: 1020px;
    &__gen-info, &__rates, &__documents, &__contacts-info, &__sales, &__billing {
        margin: 20px 10px 40px 10px;
        padding: 40px;
        box-shadow: 0 0 10px #67573e9d;
        box-sizing: border-box;
    }
    &_error-shadow {
        box-shadow: 0 0 5px $red;
    }
}

.title {
    font-size: 22px;
}

.buttons {
  margin-right: 10px;
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
