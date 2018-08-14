<template lang="pug">
    .clients-wrap
        .buttons
            input.button(type="button" value="Save")
            input.button(type="button" value="Cancel" @click="cancel")
            input.button(type="button" value="Delete" @click="deleteContact")
        .title General Information
        .gen-info
            .gen-info__block
                .block-item
                    label Company Name:
                    input(type="text" placeholder="Company Name" v-model="genInfo.companyName")
                .block-item
                    label Website:
                    input(type="text" placeholder="Website" v-model="genInfo.website")
                .block-item
                    label Industry:
                    ClientIndustrySelect(:selectedInd="genInfo.industry" @chosenInd="chosenInd")
                .block-item
                    label Status:
                    ClientStatusSelect(:selectedStatus="genInfo.status" @chosenStatus="chosenStatus")
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
                    AMSelect(:selectedManager="genInfo.accountManager" @chosenManager="chosenAccManager")
                .block-item
                    label Sales Manager:
                    AMSelect(:selectedManager="genInfo.salesManager" @chosenManager="chosenSalesManager")
                .block-item
                    label Project Manager:
                    AMSelect(:selectedManager="genInfo.projectManager" @chosenManager="chosenProjManager")
        .title Contact Details
        .contacts-info
            ContactsInfo(@contactDetails="contactDetails")
        .title Rates    
        .rates
            ClientRates
        .title Sales Information
        .sales
            ClientSalesInfo
        .title Billing Informations
        .billing
            ClientBillInfo
        .delete-approve(v-if="approveShow")
            p Are you sure you want to delete?
            input.button.approve-block(type="button" value="Cancel" @click="cancelApprove")
            input.button(type="button" value="Delete")  
</template>

<script>
import ClientIndustrySelect from './ClientIndustrySelect';
import ClientStatusSelect from './ClientStatusSelect';
import AMSelect from './AMSelect';
import ContactsInfo from './ContactsInfo';
import ClientRates from './ClientRates';
import ClientSalesInfo from './ClientSalesInfo';
import ClientBillInfo from './ClientBillInfo';

export default {
    data() {
        return {
            genInfo: {
                companyName: '',
                website: '',
                industry: {},
                status: '',
                contract: '',
                nda: '',
                accountManager: {},
                salesManager: {},
                projectManager: {},
            },
            approveShow: false
        }
    },
    methods: {
        cancel() {
            this.$emit('cancel')
        },
        deleteContact() {
            console.log('deleting.....')
            this.approveShow = true;
        },
        cancelApprove() {
            this.approveShow = false;
        },
        chosenInd(data) {
            this.genInfo.industry = data.industry;
        },
        chosenStatus(data) {
            this.genInfo.status = data;
        },
        chosenAccManager(data) {
            this.genInfo.accountManager = data;
        },
        chosenSalesManager(data) {
            this.genInfo.salesManager = data;
        },
        chosenProjManager(data) {
            this.genInfo.projectManager = data;
        },
        contactDetails(data) {
            this.$emit('contactDetails', data)
        }
    },
    components: {
    ClientIndustrySelect,
    ClientStatusSelect,
    AMSelect,
    ContactsInfo,
    ClientRates,
    ClientSalesInfo,
    ClientBillInfo
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

</style>
