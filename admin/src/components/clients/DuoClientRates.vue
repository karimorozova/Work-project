<template lang="pug">
.duo-wrap
  .filters
    .filters__item
      label Source Language
      LanguagesSelect(:selectedLang="sourceSelect" :addAll="true" @chosenLang="chosenSource")
    .filters__item
      label Target Language
      LanguagesSelect(:selectedLang="targetSelect" :addAll="true" @chosenLang="chosenTarget")
    .filters__item
      label Industry
      IndustrySelect(:selectedInd="industryFilter" :filteredIndustries="filterIndustry" @chosenInd="chosenInd")
    .filters__item
      label Service
      ServiceSingleSelect(:selectedServ="serviceSelect" langForm="Duo" @chosenServ="chosenServ" :direction="direction")
  .add-button
    input(type="button" value="Add several languages" @click="addSevLangs")           
  DuoRatesTable(
    origin="client"
    :entity="client"
    :fullInfo="fullInfo"
    :sourceSelect="sourceSelect"
    :targetSelect="targetSelect"
    :filterIndustry="filterIndustry"
    :industryFilter="industryFilter"
    :serviceSelect="serviceSelect"
    :isErrors="isAnyError"
    @showEditingError="showEditingError"
    @showValidationErrors="showValidationErrors"
    @showNotUniqueWarning="showNotUniqueWarning"
    @addNewRow="addNewRow"
  )
  .edition-message(v-if="isEditing")
    .message
      p Please finish the current edition first!
      span.close(@click="closeEditionMessage") +
  .error-message(v-if="isValidationError")
    .message
      p Please finish the current edition first!
      .message__info-list
        li(v-for="error in validErrors")
          span.info-item {{ error }}
      span.close(@click="CloseValidationErrors") +
</template>

<script>
import DuoRatesTable from "../finance/DuoRatesTable";
import LanguagesSelect from "../LanguagesSelect";
import IndustrySelect from "../IndustrySelect";
import ServiceSingleSelect from "../ServiceSingleSelect";
import { mapGetters, mapActions } from "vuex";

export default {
  props: {
    client: {
        type: Object
    },
    sevLangs: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isEditing: false,
      isValidationError: false,
      validErrors: [],
      direction: 'duo',
      sourceSelect: ["EN-GB"],
      targetSelect: ["All"],
      industryFilter: [{name: "All"}],
      industrySelected: [{name: 'All'}],
      isIndustryActive: true,
      serviceSelect: {title: "Translation"}
    }
  },

  methods: {
    showEditingError() {
      this.isEditing = true;
    },
    addSevLangs() {
      this.$emit('addSevLangs', {serviceTitle: this.serviceSelect.title});
    },
    closeEditionMessage() {
      this.isEditing = false
    },
    showValidationErrors({validErrors}) {
      this.isValidationError = true;
      this.validErrors = [...validErrors];
    },
    CloseValidationErrors() {
      this.isValidationError = false;
      this.validErrors = []
    },
    deleteUnsavedAddedRow({index}) {
      this.fullInfo.splice(index, 1);
    },
    chosenServ(data) {
      this.serviceSelect = data;
      this.clientRates();
    },
    chosenSource({lang}) {
      if(this.sourceSelect[0] == 'All') {
        this.sourceSelect = [];
        this.sourceSelect.push(lang.symbol)
      } else {
          const index = this.sourceSelect.indexOf(lang.symbol);
          if(index !== -1) {
            this.sourceSelect.splice(index, 1);
          } else {
            this.sourceSelect.push(lang.symbol)
          }
      }
      if(lang.lang == 'All' || !this.sourceSelect.length) {
        this.sourceSelect = ['All'];
      }
    },
    chosenTarget({lang}) {
      if(this.targetSelect[0] == 'All') {
        this.targetSelect = [];
        this.targetSelect.push(lang.symbol)
      } else {
          const index = this.targetSelect.indexOf(lang.symbol);
          if(index !== -1) {
            this.targetSelect.splice(index, 1);
          } else {
            this.targetSelect.push(lang.symbol)
          }
      }
      if(lang.lang == 'All' || !this.targetSelect.length) {
        this.targetSelect = ['All'];
      }
    },
    chosenInd({industry}) {
      if(this.industryFilter[0].name == 'All') {
        this.industryFilter.splice(0, 1, industry);
      } else {
          const index = this.industryFilter.findIndex(item => item._id === industry._id);
          if(index !== -1) {
              this.industryFilter.splice(index, 1);
          } else {
              this.industryFilter.push(industry);
          }
      }
      if(!this.industryFilter.length || industry.name == 'All') {
        this.industryFilter = [];
        this.industryFilter.push({
          name: 'All'
        })
      }
    },
    async saveCombination({info}) {
      const combInfo = {
        ...info,
        form: "Duo",
        client: this.client._id
      }
      try {
        const result = await this.$http.post('/clientsapi/client-rates', combInfo);
        await this.updateClientInfo(result.body);
        this.alertToggle({message: 'The rate has been saved.', isShow: true, type: 'success'});
      } catch(err) {
        this.alertToggle({message: 'Internal serer error. Cannot save the rate.', isShow: true, type: 'error'});
      };
    },
    async deleteCombination({industry, index}) {
      const deletedRate = {
        industry,
        form: "Duo",
        clientId: this.client._id
      }
      try {
        const result = await this.$http.delete(`/clientsapi/rate/${this.fullInfo[index].id}`, {body: deletedRate});
        await this.updateClientInfo(result.body);
        this.alertToggle({message: 'The rate has been deleted.', isShow: true, type: 'success'});
      } catch(err) {
        this.alertToggle({message: 'Internal serer error. Cannot delete the rate.', isShow: true, type: 'error'});
      };
    },
    async updateClientInfo(info) {
      const updatedClient = {...info};
      await this.clientRates();
      this.storeClient(updatedClient);
    },
    addNewRow() {
      this.isNewRow = true;
      this.sourceSelect = ["All"];
      this.targetSelect = ["All"];
      this.industryFilter = [{name: "All"}];
      this.fullInfo.push({
        service: this.serviceSelect,
        sourceLanguage: "", 
        targetLanguage: "", 
        industry: [{name: "All", rate: "-"}], 
        active: true
      });
    },
    async clientRates() {
      try {
        await this.getCombinations({serviceTitle: this.serviceSelect.title, clientId: this.client._id});
      } catch(err) {
        this.alertToggle({message: 'Internal serer error. Cannot get rates for client.', isShow: true, type: 'error'});
      }
    },
    defaultService() {
      this.serviceSelect = this.vuexServices.find(item => {
        return item.symbol === 'tr'
      })
    },
    ...mapActions({
      alertToggle: "alertToggle",
      getCombinations: "getClientDuoCombinations",
      storeClient: "storeClient"
    })
  },
  computed: {
    ...mapGetters({
      vuexServices: "getVuexServices",
      fullInfo: "getClientDuoCombs" 
    }),
    services() {
      let result = this.vuexServices.filter(item => {
        return item.languageForm === "Duo"
      }).map(item => {
        item.crud = this.serviceSelect.title === item.title;
        return item;
      });
      return result;
    },
    filterIndustry() {
      let result = [];
      if(this.industryFilter.length) {
          for(let elem of this.industryFilter) {
          result.push(elem.name)
          }
      }
      return result;
    }
  },
  components: {
    DuoRatesTable,
    LanguagesSelect,
    IndustrySelect,
    ServiceSingleSelect
  },
  mounted() {
    this.defaultService();
    this.clientRates();
  }
};
</script>

<style lang="scss" scoped>
.duo-wrap {
  position: relative;
  font-family: MyriadPro;
  min-width: 850px; 
}

.filters {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  &__item {
    width: 23%;
    display: flex;
    flex-direction: column;
    label {
      font-size: 12px;
      margin-bottom: 0;
    }
  }
}
.add-button {
  width: 100%;
  text-align: right;
  margin-bottom: 15px;
  input {
    color: white;
    font-size: 14px;
    width: 180px;
    padding: 5px 10px;
    border-radius: 10px;
    -webkit-box-shadow: 0 3px 5px rgba(0,0,0,.4);
    box-shadow: 0 3px 5px rgba(0,0,0,.4);
    background-color: #D15F45;
    border: 1px solid #D15F45;
    cursor: pointer;
  }
}

.unique-message, .edition-message, .error-message {
  position: absolute;
  border: 1px solid #D15F45;
  background-color: #FFF;
  box-shadow: 0 0 15px #D15F45;
  width: 300px;
  top: 50%;
  left: 50%;
  margin-left: -150px;
  padding: 0 15px;
  z-index: 50;
  display: flex;
  align-items: center;
  .close {
    position: absolute;
    font-size: 24px;
    font-weight: 700;
    top: -2px;
    right: -9px;
    transform: rotate(45deg);
    cursor: pointer;
  }
  .message {
    position: relative;
    width: 100%;
    height: 100%;
    &__info-list {
      li {
        list-style: none;
        .info-item {
          color: #D15F45;
          font-weight: 500;
          font-size: 16px;
        }
      }
    }
  }
  p {
    font-size: 18px;
    font-weight: 700;
  }
}

.unique-message, .error-message {
  height: 150px;
  margin-top: -75px; 
}

.edition-message {
  height: 70px;
  margin-top: -35px;
}

input {
  color: #67573E;
}

</style>