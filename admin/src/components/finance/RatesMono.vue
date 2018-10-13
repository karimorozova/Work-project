<template lang="pug">
.duoWrap
  .filters
    .filters__item.sourceMenu
      label Language
      LanguagesSelect(:selectedLang="targetSelect" :addAll="true" @chosenLang="chosenTarget")
    .filters__item.industryMenu
      label Industry
      IndustrySelect(:selectedInd="industryFilter" :filteredIndustries="filterIndustry" @chosenInd="chosenInd")
    .filters__item.serviceMenu
      label Service
      ServiceSingleSelect(:selectedServ="serviceSelect" langForm="Mono" @chosenServ="chosenServ")           
  .tableData
    table.duoFinance(:style="{width: tableWidth}")
      thead
        tr
          th(v-for="head in tableHeader") {{ head.title }}
      tbody.mono-tbody
        template(v-for="(info, index) in fullInfo" v-if="targetSelect.indexOf(info.targetLanguage.symbol) != -1 || targetSelect[0] == 'All'")
          tr(v-for="indus in info.industry" v-if="filterIndustry.indexOf(indus.name) != -1 || industryFilter[0].name == 'All'")
            td.drop-option 
              template(v-if='targetSelect.indexOf(info.targetLanguage.symbol) != -1 || targetSelect[0] == "All"') {{ info.targetLanguage.lang }}
              .inner-component(v-if="currentActive === index && !fullInfo[currentActive].icons.edit.active")
                LanguagesSelect(:parentIndex="index" :addAll="false" :selectedLang="[info.targetLanguage.symbol]" @chosenLang="changeTarget" @scrollDrop="scrollDrop")
            td(:class="{addShadow: currentActive === index && !fullInfo[currentActive].icons.edit.active}")
              input.rates(:value="indus.package" @input="changePackage" :readonly="info.icons.edit.active")
            td.drop-option              
              span(v-if="!indus.icon") {{ indus.name }}
              .drop-option__image
                img(v-if="indus.icon" :src="indus.icon")
                span.titleTooltip {{ indus.name }}
              .inner-component(v-if="currentActive === index && !fullInfo[currentActive].icons.edit.active")
                IndustrySelect(:parentIndex="index" :selectedInd="industrySelected" :filteredIndustries="infoIndustries" @chosenInd="changeIndustry" @scrollDrop="scrollDrop")
            td
              input(type="checkbox" :checked="indus.active" v-model="indus.active" :disabled="info.icons.edit.active")
            td(:class="{addShadow: currentActive === index && !fullInfo[currentActive].icons.edit.active}") 
              input.rates(:value="indus.rate" @input="changeRate" :readonly="info.icons.edit.active")
            td.iconsField
              template(v-for="(icon, key) in info.icons") 
                img.crudIcon(:src="icon.image" @click="action(index, key)" :class="{activeIcon: icon.active}") 
  .addRow
    .addRow__plus(@click="addNewRow")
      span +
  .unique-message(v-if="notUnique")
    .message
      p The combination you want to add already exists!
      .message__info-list
        li Target: 
          span.info-item {{ uniqueCombination.target }}
        li Industry: 
          span.info-item {{ uniqueCombination.industry }}
      span.close(@click="closeUnique") +
  .edition-message(v-if="editing")
    .message
      p Please finish the current edition first!
      span.close(@click="closeEditionMessage") +
  .error-message(v-if="showValidError")
    .message
      p Please finish the current edition first!
      .message__info-list
        li(v-for="error in validError")
          span.info-item {{ error }}
      span.close(@click="closeErrorMessage") +
</template>

<script>
import LanguagesSelect from "../LanguagesSelect";
import IndustrySelect from "../IndustrySelect";
import ServiceSingleSelect from "../ServiceSingleSelect";
import { mapGetters, mapActions } from "vuex";
import { loadingToggle } from '../../vuex/actions';

export default {
  props: {
    services: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      targetSelect: ["All"],
      industryFilter: [{name: "All"}],
      industrySelected: [{name: 'All'}],
      serviceSelect: {title: "Copywriting"},
      heads: [
        { title: "Language" },
        { title: "Package" },
        { title: "Industry" },
        { title: "Active" },
        { title: "" }
      ],
      fullInfo: [],
      changedRate: '',
      changedPackage: '',
      currentActive: -1,
      notUnique: false,
      editing: false,
      uniqueCombination: {target: "", industry: ""},
      showValidError: false,
      validError: []
    }
  },

  methods: {
    closeErrorMessage() {
      this.showValidError = false;
    },
    closeUnique() {
      this.notUnique = false;
    },
    closeEditionMessage() {
      this.editing = false
    },
    changeRate(event) {
      this.changedRate = +event.target.value
    },
    changePackage(event) {
      this.changedPackage = +event.target.value
    },
    handleScroll() {
      let element = document.getElementsByClassName('mono-tbody')[0];
      element.scrollTop = element.scrollHeight;
    },
    scrollDrop(data) {
      if(data.drop) {
        var tbody = document.getElementsByClassName('mono-tbody')[0];
        setTimeout(() => {
          const offsetBottom = data.offsetTop + data.offsetHeight*2;
          const scrollBottom = tbody.scrollTop + tbody.offsetHeight;
          if (offsetBottom > scrollBottom) {
            tbody.scrollTop = offsetBottom + data.offsetHeight*2 - tbody.offsetHeight;
          }
        }, 100)
      }
    },
    changeTarget(data) {
      this.fullInfo[data.index].targetLanguage = data.lang;
    },
    changeIndustry(data) {
      if(this.industrySelected[0].name == 'All') {
        this.industrySelected.splice(0, 1, data.industry)
      } else {
        let hasIndustry = false;
        for(let i in this.industrySelected) {
          if(this.industrySelected[i].name == data.industry.name) {
            this.industrySelected.splice(i, 1);
            hasIndustry = true;
          }
        }
        if(!hasIndustry) {
          this.industrySelected.push(data.industry);
        }
      }
      if(!this.industrySelected.length || data.industry.name == 'All') {
        this.industrySelected = [];
        this.industrySelected.push({
          crud: true,
          name: 'All',
          rate: 0.12,
          package: 200
        })
      }
    },
    chosenServ(data) {
      if(this.serviceSelect.title != data.title) {
        this.loadingToggle(true);
        this.serviceSelect = data;
        this.fullInfo = [];
        this.combinations();
      }
    },
    chosenTarget(data) {
      if(this.targetSelect[0] == 'All') {
        this.targetSelect = [];
        this.targetSelect.push(data.lang.symbol)
      } else {
          let index = this.targetSelect.indexOf(data.lang.symbol);
          if(index != -1) {
            this.targetSelect.splice(index, 1);
          } else {
            this.targetSelect.push(data.lang.symbol)
          }
      }
      if(data.lang.lang == 'All' || !this.targetSelect.length) {
        this.targetSelect = ['All'];
      }
    },
    chosenInd(data) {
      if(this.industryFilter[0].name == 'All') {
        this.industryFilter.splice(0, 1, data.industry);
      } else {
        let hasIndustry = false;
        for(let i in this.industryFilter) {
          if(this.industryFilter[i].name == data.industry.name) {
            this.industryFilter.splice(i, 1);
            hasIndustry = true;
          }
        }
        if(!hasIndustry) {
          this.industryFilter.push(data.industry);
        }
      }
      if(!this.industryFilter.length || data.industry.name == 'All') {
        this.industryFilter = [];
        this.industryFilter.push({
          name: 'All'
        })
      }
    },
    async checkErrors(index) {
      this.validError = [];
      if(!this.fullInfo[index].targetLanguage) this.validError.push("Please, choose the target language!");
      if(this.changedRate <= 0) this.validError.push("Please set the correct rate value!");
      if(this.validError.length) {
        this.showValidError = true;
        this.changedRate = this.fullInfo[index].industry[0].rate;
        return;
      }
      await this.saveRates(index);
    },
    uniqueCheck(index) {
      let exist = false;
      for(let ind in this.fullInfo) {
        if(ind != index) {
          for(let indus of this.industrySelected) {
          if((indus.name == this.fullInfo[ind].industry[0].name || indus.name == 'All') &&
            this.fullInfo[index].targetLanguage.lang == this.fullInfo[ind].targetLanguage.lang) {
              exist = true;
              this.uniqueCombination = {
                target: this.fullInfo[index].targetLanguage.lang,
                industry: indus.name,
              }
              break;
            }
          }
        }
        if(exist) break;
      }
      return exist;
    },
    async action(index, key) {
      if(this.currentActive != -1) {
        if(index != this.currentActive) {
          return this.editing = true;
        }
      }
      if(key === "save") {
        return await this.checkErrors(index);        
      }

      if(key === "edit") {
        return this.edit(index);
      }

      if(key === "delete") {
        return await this.deleteRate(index);
      }
    },
    async saveRates(index) {
      if(!this.uniqueCheck(index)) {
        this.fullInfo[index].icons.save.active = false;
        this.fullInfo[index].icons.edit.active = true;
        this.fullInfo[index].industry = [];
        for(let elem of this.industrySelected) {
          elem.rate = this.changedRate;
          elem.package = this.changedPackage;
          this.fullInfo[index].industry.push(elem)
        };
      try{
        await this.$http.post('/service/rates', this.fullInfo[index]);
        await this.combinations();
        this.alertToggle({message: 'The rate has been saved.', isShow: true, type: 'success'});
      } catch(err) {
          this.alertToggle({message: 'Internal serer error. Cannot save the rate.', isShow: true, type: 'error'});
        }  
        this.currentActive = -1;
        this.refreshServices();
      } else {
        this.notUnique = true;
      }
    },
    edit(index) {
      for(let elem of this.fullInfo[index].industry) {
        this.industrySelected = [];
        this.industrySelected.push(elem)  
      }
      this.changedRate = this.fullInfo[index].industry[0].rate;
      this.changedPackage = this.fullInfo[index].industry[0].package
      this.currentActive = index;
      for(let i in this.fullInfo) {
        if(i == index) {
          this.fullInfo[i].icons.edit.active = false;
          this.fullInfo[i].icons.save.active = true;   
        } else {
            this.fullInfo[i].icons.edit.active = true;
            this.fullInfo[i].icons.save.active = false;
        }
      }
    },
    async deleteRate(index) {
      try {
        const deletedRate = {
          serviceId: this.serviceSelect._id,
          industries: this.fullInfo[index].industry,
        }
        await this.$http.delete(`/service/delete-rate/${this.fullInfo[index].id}`, {body: deletedRate});
        this.fullInfo.splice(index, 1)[0];
        this.alertToggle({message: 'The rate has been deleted.', isShow: true, type: 'success'});
        this.refreshServices();  
      } catch(err) {
        this.alertToggle({message: 'Internal serer error. Cannot delete the rate.', isShow: true, type: 'error'});        
      }
      this.currentActive = -1;
    },
    refreshServices() {
      this.$emit('refreshServices');
    },
    addNewRow() {
      this.targetSelect = ["All"];
      this.industryFilter = [{name: "All"}];
      this.fullInfo.push({
        title: this.serviceSelect.title,
        targetLanguage: "", 
        industry: [{name: "All", rate: 0.1, package: 200}], 
        active: true, 
        icons: {
          save: {image: require("../../assets/images/Other/save-icon-qa-form.png"), active: true}, 
          edit: {image: require("../../assets/images/Other/edit-icon-qa.png"), active: false}, 
          delete: {image: require("../../assets/images/Other/delete-icon-qa-form.png"), active: true}
        }
      });
      this.currentActive = this.fullInfo.length-1;
      this.changedRate = this.fullInfo[this.currentActive].industry[0].rate;
      this.changedPackage = this.fullInfo[this.currentActive].industry[0].changedPackage;
      setTimeout( () => {
        this.handleScroll();
      },100);
    },
    async combinations() {
      const result = await this.$http.get(`/service/parsed-rates?title=${this.serviceSelect.title}&form=Mono`)
      this.fullInfo = result.body;
      this.fullInfo.forEach(item => {
        item.icons = {
          save: {image: require("../../assets/images/Other/save-icon-qa-form.png"), active: false}, 
          edit: {image: require("../../assets/images/Other/edit-icon-qa.png"), active: true}, 
          delete: {image: require("../../assets/images/Other/delete-icon-qa-form.png"), active: true}
        }
      })
      this.services.forEach(item => {
        item.crud = item.title === this.serviceSelect.title
      })
      this.loadingToggle(false);
    },
    defaultService() {
      this.serviceSelect = this.vuexServices.find(item => {
        return item.symbol === 'co'
      })
    },
    ...mapActions({
      loadingToggle: "loadingToggle",
      alertToggle: "alertToggle"
    })
  },
  computed: {
    ...mapGetters({
      vuexServices: "getVuexServices"
    }),
    filterIndustry() {
      let result = [];
      if(this.industryFilter.length) {
        for(let elem of this.industryFilter) {
          result.push(elem.name)
        }
      }
      return result;
    },
    infoIndustries() {
      let result = [];
      if(this.industrySelected.length) {
        for(let elem of this.industrySelected) {
          result.push(elem.name);
        }
      }
      return result;
    },
    tableHeader() {
      let result = [];
      for(let i = 0; i < 5; i++) {
        result.push(this.heads[i]);
      }
      result.splice(-1, 0, this.serviceSelect);
      return result;
    },
    tableWidth() {
      let result = 870;
      let cols = this.tableHeader.length;
      if(cols > 6) {
        let count = cols - 6;
        result += 150*count;
      }
      result += 'px';
      return result;
    }
  },
  components: {
    LanguagesSelect,
    IndustrySelect,
    ServiceSingleSelect
  },
  mounted() {
   this.combinations();
   this.defaultService();
  }
}

</script>

<style lang="scss" scoped>
.duoWrap {
  position: relative;
  font-family: MyriadPro;
  min-width: 872px; 
}
.tableData {
  max-width: 872px;
  overflow-x: scroll;
}
.duoFinance {
  border-collapse: collapse;
  width: 868px;
  thead, tbody {
    border: 1px solid #BFB09D;
    display: block;
    width: 100%;
  }
  tbody {
    height: 184px;
    // max-height: 173px;
    overflow-y: scroll;
    transition: all 0.3s;
  }
}
tr {
  display: block;
}
th, td {
  padding: 5px;
  padding-right: 0;
  font-size: 14px;
  font-weight: normal;
  white-space: nowrap;
  width: 142px;
  &:first-child, &:nth-of-type(2) {
    min-width: 160px;
  }
  &:last-child {
    width: 140px;
  }
  &:nth-of-type(4) {
    min-width: 67px;
    width: 67px;
  }
  &:nth-of-type(3) {
    min-width: 178px;
  }
}
th {
  background-color: #988C7E;
  color: white;
  border-right: 1px solid #FFF;
  &:last-child {
    border-right: none;
    width: 157px;
  }
}
td {
  border-right: 1px solid #BFB09D;
  border-bottom: 1px solid #BFB09D;
}
.iconsField{
  text-align: center;
}
.crudIcon {
  margin: 0 5px;
  opacity: .5;
  cursor: pointer;
}
.activeIcon {
  opacity: 1;
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
.addButton {
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
.addRow {
  margin-top: 10px;
  margin-left: 25px; 
  &__plus {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border: 1px solid #BFB09D;
    span {
      font-size: 28px;
      color: #BFB09D;
      opacity: .7;
    }
  }
}
.rates {
  border: none;
  outline: none;
  width: 114px;
}
.drop-option {
  position: relative;
  .inner-component {
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
      color: #D15F45;
      font-size: 12px;
      top: 8px;
      left: 35px;
    }
    &:hover {
      .titleTooltip {
        display: block;
      }
    }
    img {
      max-width: 21px;
    }
  }
}
.addShadow {
  box-shadow: inset 0 0 8px rgba(191, 176, 157, 1);
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

</style>