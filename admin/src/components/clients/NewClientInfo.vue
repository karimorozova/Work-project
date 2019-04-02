<template lang="pug">
    .new-client-info(v-if="clientShow")
        .buttons
            input.button(type="button" value="Save" @click="checkForErrors")
            input.button(type="button" value="Cancel" @click="cancel")
        .title General Information
        .new-client-info__gen-info
            .gen-info__block
                .block-item
                    label.block-item__label.block-item_relative Company Name:
                        Asterisk(:customStyle="asteriskStyle")
                    input(type="text" placeholder="Company Name" v-model="client.name" :class="{'new-client-info_error-shadow': !client.name && isSaveClicked}")
                .block-item
                    label.block-item__label Website:
                    input(type="text" placeholder="Website" v-model="client.website")
                .block-item
                    label.block-item__label.block-item_relative Industry:
                        Asterisk(:customStyle="asteriskStyle")
                    .block-item__drop.block-item_high-index(:class="{'new-client-info_error-shadow': !client.industries.length && isSaveClicked}")
                        MultiClientIndustrySelect(:selectedInd="client.industries" :filteredIndustries="selectedIndNames" @chosenInd="chosenInd")
                .block-item
                    label.block-item__label.block-item_relative Status:
                        Asterisk(:customStyle="asteriskStyle")
                    .block-item__drop(:class="{'new-client-info_error-shadow': !client.status && isSaveClicked}")
                        ClientStatusSelect(:selectedStatus="client.status" @chosenStatus="setStatus")
            .gen-info__block
                .block-item
                    label.block-item__label Contract:
                    .contract
                        .contract__upload
                            input.upload(type="file" @change="contractLoad")
                        .contract__download
                            img(v-if="client.contract" src="../../assets/images/Other/Download-icon.png")
                    label.block-item__label NDA:
                    .nda
                        .nda__upload
                            input.upload(type="file" @change="ndaLoad")
                        .nda__download
                            img(v-if="client.nda" src="../../assets/images/Other/Download-icon.png")
                .block-item
                    label.block-item__label.block-item_relative Account Manager:
                        Asterisk(:customStyle="asteriskStyle")
                    .block-item__drop.block-item_high-index(:class="{'new-client-info_error-shadow': !client.accountManager && isSaveClicked}")
                        AMSelect(:selectedManager="client.accountManager" @chosenManager="(manager) => setManager(manager, 'accountManager')")
                .block-item
                    label.block-item__label.block-item_relative Sales Manager:
                        Asterisk(:customStyle="asteriskStyle")
                    .block-item__drop.block-item_medium-index(:class="{'new-client-info_error-shadow': !client.salesManager && isSaveClicked}")
                        AMSelect(:selectedManager="client.salesManager" @chosenManager="(manager) => setManager(manager, 'salesManager')")
                .block-item
                    label.block-item__label.block-item_relative Project Manager:
                        Asterisk(:customStyle="asteriskStyle")
                    .block-item__drop(:class="{'new-client-info_error-shadow': !client.projectManager && isSaveClicked}")
                        AMSelect(:selectedManager="client.projectManager" @chosenManager="(manager) => setManager(manager, 'projectManager')")
        .title Contact Details
        .new-client-info__contacts-info(:class="{'new-client-info_error-shadow': !client.contacts.length && isSaveClicked}")
            ContactsInfo(
                :client="client" 
                @contactDetails="contactDetails" 
                @setLeadContact="setLeadContact"
                @saveContactUpdates="saveContactUpdates"
                @newContact="addNewContact"
                @approveDelete="approveContactDelete")
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
</template>

<script>
import Asterisk from "../Asterisk";
import ValidationErrors from "../ValidationErrors";
import MultiClientIndustrySelect from './MultiClientIndustrySelect';
import ClientStatusSelect from './ClientStatusSelect';
import AMSelect from './AMSelect';
import ContactsInfo from './ContactsInfo';
import ClientSalesInfo from './ClientSalesInfo';
import ClientBillInfo from './ClientBillInfo';
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
            asteriskStyle: {"top": "-4px"}
        }
    },
    methods: {
        contractLoad(e) {
            if(e.target.files && e.target.files[0]) {
                this.$emit('loadFile', {files: e.target.files, prop: 'contractFiles'})
            };
        },
        ndaLoad(e) {
            if(e.target.files && e.target.files[0]) {
                this.$emit('loadFile', {files: e.target.files, prop: 'ndaFiles'})
            }
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
        chosenInd({industry}) {
            if(!this.client.industries.length) {
                return this.client.industries.push(industry);
            }
            const position = this.client.industries.findIndex(item => item._id === industry._id);
            if(position !== -1) {
                return this.client.industries.splice(position, 1);
            }
            this.client.industries.push(industry);
        },
        setLeadSource({leadSource}) {
            this.client.leadSource = leadSource;
        },
        setStatus({status}) {
            this.client.status = status;
        },
        setBillInfo({prop, value}) {
            this.client[prop] = value;
        },
        setManager({manager}, prop) {
            this.client[prop] = manager;
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
            if(!this.client.contacts.length) this.errors.push('Please, add at least one contact.');
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
        async saveClient() {            
            let sendData = new FormData();
            sendData.append('client', JSON.stringify(this.client));
            for(let i = 0; i < this.contactsPhotos.length; i++) {
                sendData.append('photos', this.contactsPhotos[i]);
            }
            for(let i = 0; i < this.contractFiles.length; i++) {
                sendData.append('contract', this.contractFiles[i]);
            }
            for(let i = 0; i < this.ndaFiles.length; i++) {
                sendData.append('nda', this.ndaFiles[i]);
            }
            try {
                const result = await this.$http.post('/clientsapi/update-client', sendData);
                const newClient = {...result.body.client};
                await this.addNewClient(newClient);
                this.alertToggle({message: "New Client saved", isShow: true, type: "success"});
                this.$router.push(`/clients/${newClient._id}`);
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
    Asterisk,
    ValidationErrors,
    MultiClientIndustrySelect,
    ClientStatusSelect,
    AMSelect,
    ContactsInfo,
    ClientSalesInfo,
    ClientBillInfo
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.new-client-info {
    position: relative;
    padding: 40px;
    width: 52%;
    &__gen-info, &__contacts-info, &__sales, &__billing {
        margin: 20px 10px 40px 10px;
        padding: 40px;
        box-shadow: 0 0 15px #67573e9d;
        width: 900px;
        box-sizing: border-box;
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

.title {
    font-size: 22px;
}

.block-item {
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    &__drop {
        border-radius: 5px;
    }
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
        padding: 0 5px;
        outline: none;
        width: 191px;
        height: 30px;
        box-sizing: border-box;
    }
    ::-webkit-input-placeholder {
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
  width: 900px;
  margin-left: 10px;
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
