<template lang="pug">
.duoWrap
  .filters
    .filters__item.sourceMenu
      label Source Language
        LanguagesSelect(:selectedLang="sourceSelect" @chosenLang="chosenSource")
    .filters__item.targetMenu
      label Target Language
        LanguagesSelect(:selectedLang="targetSelect" @chosenLang="chosenTarget")
    .filters__item.industryMenu
      label Industry
        IndustrySelect(:selectedInd="industrySelect" @chosenInd="chosenInd")
    .filters__item.serviceMenu
      label Service
        ServiceSelect(:selectedServ="serviceSelect" @chosenServ="chosenServ")
  .addButton
    input(type="button" value="Add several languages")           
  .tableData
    table.duoFinance
      thead
        th(v-for="head in tableHeader") {{ head.title }}
      tbody
        tr(v-for="(info, index) in fullInfo")
          td.dropOption {{ info.sourceLanguage }}
            .innerComponent(v-if="!info.icons[1].active")
              LanguagesSelect(:selectedLang="{lang: info.sourceLanguage}")
          td.dropOption {{ info.targetLanguage }}
            .innerComponent(v-if="!info.icons[1].active")
              LanguagesSelect(:selectedLang="{lang: info.targetLanguage}")
          td.dropOption {{ info.industry }}
            .innerComponent(v-if="!info.icons[1].active")
              IndustrySelect(:selectedInd="{name: info.industry}")
          td
            input(type="checkbox" :checked="info.active" v-model="fullInfo[index].active" :disabled="info.icons[1].active")
          template(v-for="(rate, rateInd) in info.rates")
            td 
              input.rates(:value="rate" v-model="info.rates[rateInd]" :readonly="info.icons[1].active")
          td.iconsField
            template(v-for="(icon, iconIndex) in info.icons") 
              img.crudIcon(:src="icon.image" @click="action(index, iconIndex)" :class="{activeIcon: icon.active}") 
  .addRow
    .addRow__plus(@click="addNewRow")
      span +
</template>

<script>
import CalculationUnite from "./ratesduoRows/CalculationUnite";
import LanguagesSelect from "../LanguagesSelect";
import IndustrySelect from "../IndustrySelect";
import ServiceSelect from "../ServiceSelect";

export default {
  props: {},
  data() {
    return {
      sourceSelect: {lang: "English"},
      targetSelect: {lang: "All"},
      industrySelect: {name: "All"},
      serviceSelect: {title: "Translation"},
      heads: [
        { title: "Source Language" },
        { title: "Target Language" },
        { title: "Industry" },
        { title: "Active" },
        { title: "" }
      ],
      fullInfo: [
        {sourceLanguage: "English", targetLanguage: "French", industry: "All", active: true, rates: [0.15], icons: [{image: require("../../assets/images/Other/save-icon-qa-form.png"), active: false}, {image: require("../../assets/images/Other/edit-icon-qa.png"), active: true}, {image: require("../../assets/images/Other/delete-icon-qa-form.png"), active: true}]},
        {sourceLanguage: "English", targetLanguage: "French", industry: "All", active: true, rates: [0.4], icons: [{image: require("../../assets/images/Other/save-icon-qa-form.png"), active: false}, {image: require("../../assets/images/Other/edit-icon-qa.png"), active: true}, {image: require("../../assets/images/Other/delete-icon-qa-form.png"), active: true}]},
        {sourceLanguage: "English", targetLanguage: "French", industry: "All", active: true, rates: [0.11], icons: [{image: require("../../assets/images/Other/save-icon-qa-form.png"), active: false}, {image: require("../../assets/images/Other/edit-icon-qa.png"), active: true}, {image: require("../../assets/images/Other/delete-icon-qa-form.png"), active: true}]},
        {sourceLanguage: "English", targetLanguage: "French", industry: "All", active: true, rates: [0.15], icons: [{image: require("../../assets/images/Other/save-icon-qa-form.png"), active: false}, {image: require("../../assets/images/Other/edit-icon-qa.png"), active: true}, {image: require("../../assets/images/Other/delete-icon-qa-form.png"), active: true}]}
      ],
      services: [],
    }
  },

  methods: {
    chosenServ(data) {
      this.serviceSelect = data;
    },
    chosenSource(data) {
      this.sourceSelect = data;
    },
    chosenTarget(data) {
      this.targetSelect = data;
    },
    chosenInd(data) {
      this.industrySelect = data;
    },
    action(index, iconIndex) {
      if(iconIndex == 0) {
        this.fullInfo[index].icons[0].active = false;
        this.fullInfo[index].icons[1].active = true;
      }

      if(iconIndex == 1) {
        this.fullInfo[index].icons[1].active = false;
        this.fullInfo[index].icons[0].active = true;
      }

      if(iconIndex == 2) {
        this.fullInfo.splice(index, 1);
      }
    },
    addNewRow() {
      this.fullInfo.push({
        sourceLanguage: "", 
        targetLanguage: "", 
        industry: "", 
        active: true, 
        rates: [' '], 
        icons: [{image: require("../../assets/images/Other/save-icon-qa-form.png"), active: true}, {image: require("../../assets/images/Other/edit-icon-qa.png"), active: false}, {image: require("../../assets/images/Other/delete-icon-qa-form.png"), active: true}]
      })
    },
    async getServices() {
      await this.$http.get("api/services")
      .then(res => {
        this.services = res.data.filter(item => {
          if(item.languageForm == "Duo") {
            return item;
          }
        });
        this.services.forEach(item => {
          if(item.title == 'Translation') {
            item.crud = true
          } else {
            item.crud = false
          }
        })
      })
      .catch(err => console.log(err))
    },
    async getLanguages() {
      await this.$http.get('api/languages')
      .then(response => {
        let sortedArray = response.body;
        sortedArray.sort( (a,b) => {
          if(a.lang < b.lang) return -1;
          if(a.lang > b.lang) return 1;
        });
      this.languages = sortedArray;
        for(let i = 0; i < sortedArray.length; i++) {
          if(sortedArray[i].lang == 'English') {
            this.sourceSelect = sortedArray[i];
          }
        }
      })
      .catch(e => {
        this.errors.push(e)
      })
    },
  },

  computed: {
    tableHeader() {
      let result = [];
      for(let i = 0; i < 5; i++) {
        result.push(this.heads[i])
      }
      for(let j = 0; j < this.services.length; j++) {
        if(this.services[j].crud) {
          result.splice(-1, 0, {title: this.services[j].title} )
        }
      }
      return result;
    }
  },
  components: {
    CalculationUnite,
    LanguagesSelect,
    IndustrySelect,
    ServiceSelect
  },
  mounted() {
    this.getServices();
  }
};
</script>

<style lang="scss" scoped>
.duoWrap {
  font-family: MyriadPro;
  min-width: 850px; 
}
.duoFinance {
  border-collapse: collapse;
  width: 100%;
  thead, tbody {
    border: 1px solid #BFB09D;
    display: block;
    width: 100%;
  }
  tbody {
    height: 151px;
    max-height: 173px;
    overflow-y: scroll;
  }
}
tr {
  display: block;
}
th, td {
  padding: 5px;
  font-size: 14px;
  font-weight: normal;
  white-space: nowrap;
  width: 127px;
  &:last-child {
    width: 180px;
  }
  &:nth-of-type(4) {
    width: 100px;
  }
  &:nth-of-type(3) {
    width: 180px;
  }
}
th {
  padding-right: 20px;
  background-color: #988C7E;
  color: white;
  border-right: 1px solid #FFF;
  &:last-child {
    border-right: none;
    width: 196px;
  }
}
td {
  border: 1px solid #BFB09D;
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
    width: 22%;
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
    background-color: #ff876c;
    border: 1px solid #ff876c;
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
  width: 50px;
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
}
</style>