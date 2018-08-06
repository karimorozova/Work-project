<template lang="pug">
.clients
  .adminNavbar__slider.slider
    span CLIENTS
    .slider-inner
      .slider-col General Information
  .clients__data
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
    .contact-details
      ContactDetails
    .title Rates    
    .rates
      ClientRates
    .title Sales Information
    .sales
      ClientSalesInfo
    .title Billing Informations
    .billing
      ClientBillInfo
</template>

<script>
import ClientIndustrySelect from '../clients/ClientIndustrySelect';
import ClientStatusSelect from '../clients/ClientStatusSelect';
import AMSelect from '../clients/AMSelect';
import ContactDetails from '../clients/ContactDetails';
import ClientRates from '../clients/ClientRates';
import ClientSalesInfo from '../clients/ClientSalesInfo';
import ClientBillInfo from '../clients/ClientBillInfo';

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
        projectManager: {}
      }
    };
  },
  methods: {
    chosenInd(data) {
      this.genInfo.industry = data;
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
    }
  },
  components: {
    ClientIndustrySelect,
    ClientStatusSelect,
    AMSelect,
    ContactDetails,
    ClientRates,
    ClientSalesInfo,
    ClientBillInfo
  }
};
</script>

<style lang="scss" scoped>
.clients {
  display: flex;
  &__data {
    margin-top: 20px;
    margin-left: 20px;
  }
}
.gen-info, .contact-details, .rates, .sales, .billing {
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
.adminNavbar {
  position: relative;
  display: flex;
  min-height: 94vh;
  &__slider {
    height: 100%;
    // transform: translate(-50%);
    background-color: #fff;
    width: 175px;
    box-shadow: 7px 1px 10px rgba(103, 87, 62, 0.4);
    display: flex;
    flex-direction: column;
    font-family: MyriadPro;
    color: #67573e;
    font-size: 22px;
    transition: all 1s;
    span {
      display: flex;
      justify-content: center;
      padding: 44px 0;
      font-weight: 700;
    }

    .slider-inner {
      display: flex;
      flex-direction: column;

      .slider-col {
        display: flex;
        justify-content: center;
        border-top: 1px solid #c4beb6;
        border-bottom: 1px solid #c4beb6;
        padding: 5px 0;
        background-color: #c4beb6;
        font-size: 18px;
        cursor: pointer;
      }
    }
  }
  .slider {
    transform: translate(-3%);
    background-color: #fff;
  }
}

</style>
