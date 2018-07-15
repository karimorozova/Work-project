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
    table.duoFinance(:style="{width: tableWidth}")
      thead
        th(v-for="head in tableHeader") {{ head.title }}
      tbody
        tr(v-for="(info, index) in fullInfo")
          td.dropOption {{ info.sourceLanguage.lang }}
            .innerComponent(v-if="!info.icons[1].active")
              LanguagesSelect(:parentIndex="index" :selectedLang="info.sourceLanguage" @chosenLang="changeSource" @scrollDrop="scrollDrop")
          td.dropOption {{ info.targetLanguage.lang }}
            .innerComponent(v-if="!info.icons[1].active")
              LanguagesSelect(:parentIndex="index" :selectedLang="info.targetLanguage" @chosenLang="changeTarget")
          td.dropOption
            span(v-if="info.industry.name == 'All'") {{ info.industry.name }}
            .dropOption__image
              img(v-if="info.industry.name != 'All'" :src="info.industry.icon")
              span.titleTooltip(v-if="info.industry.name != 'All'") {{ info.industry.name }}
            .innerComponent(v-if="!info.icons[1].active")
              IndustrySelect(:parentIndex="index" :selectedInd="info.industry" @chosenInd="changeIndustry")
          td
            input(type="checkbox" :checked="info.active" v-model="fullInfo[index].active" :disabled="info.icons[1].active")
          template(v-for="(rate, rateInd) in rates")
            td(:class="{addShadow: !info.icons[1].active}") 
              input.rates(:value="rate.value"  :readonly="info.icons[1].active")
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
        {sourceLanguage: {lang: "English"}, targetLanguage: {lang: "French"}, industry: {name: "All"}, active: true, rates: [" "], icons: [{image: require("../../assets/images/Other/save-icon-qa-form.png"), active: false}, {image: require("../../assets/images/Other/edit-icon-qa.png"), active: true}, {image: require("../../assets/images/Other/delete-icon-qa-form.png"), active: true}]},
        {sourceLanguage: {lang: "English"}, targetLanguage: {lang: "Spanish"}, industry: {name: "All"}, active: true, rates: [" "], icons: [{image: require("../../assets/images/Other/save-icon-qa-form.png"), active: false}, {image: require("../../assets/images/Other/edit-icon-qa.png"), active: true}, {image: require("../../assets/images/Other/delete-icon-qa-form.png"), active: true}]},
        {sourceLanguage: {lang: "English"}, targetLanguage: {lang: "Russian"}, industry: {name: "All"}, active: true, rates: [" "], icons: [{image: require("../../assets/images/Other/save-icon-qa-form.png"), active: false}, {image: require("../../assets/images/Other/edit-icon-qa.png"), active: true}, {image: require("../../assets/images/Other/delete-icon-qa-form.png"), active: true}]}
      ],
      services: [],
    }
  },

  methods: {
    handleScroll() {
      let element = document.getElementsByTagName('tbody')[0];
      element.scrollTop = element.scrollHeight;
    },
    scrollDrop(data) {
      if(data.drop) {
        let element = document.getElementsByTagName('tbody')[0];
        setTimeout(() => {
          element.scrollTop = element.scrollHeight;
        }, 100)
      }
    },
    changeSource(data) {
      this.fullInfo[data.index].sourceLanguage = data.data;
    },
    changeTarget(data) {
      this.fullInfo[data.index].targetLanguage = data.data;
    },
    changeIndustry(data) {
      this.fullInfo[data.index].industry = data.data;
    },
    chosenServ(data) {
      this.serviceSelect = data;
      for(let i = 0; i < this.services.length; i++) {
        if(this.services[i].title == this.serviceSelect.title) {
          this.services[i].crud = !this.services[i].crud;
        }
      }
    },
    chosenSource(data) {
      this.sourceSelect = data.data;
    },
    chosenTarget(data) {
      this.targetSelect = data.data;
    },
    chosenInd(data) {
      this.industrySelect = data.data;
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
    async addNewRow() {
      let ratesFields = this.fullInfo[0].rates.length;
      let rates = [];
      if(ratesFields) {
        for(let i = 0; i < ratesFields; i++) {
          rates.push(" ");
        }
      }

      this.fullInfo.push({
        sourceLanguage: {lang: ""}, 
        targetLanguage: {lang: ""}, 
        industry: {name: ""}, 
        active: true, 
        rates: rates, 
        icons: [{image: require("../../assets/images/Other/save-icon-qa-form.png"), active: true}, {image: require("../../assets/images/Other/edit-icon-qa.png"), active: false}, {image: require("../../assets/images/Other/delete-icon-qa-form.png"), active: true}]
      });
      setTimeout( () => {
        this.handleScroll();
      },100);
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
    }
  },
  computed: {
    rates() {
      let result = [];
      for(let i = 0; i < this.services.length; i++) {
        if(this.services[i].crud) {
          let title = this.services[i].title;
          result.push({
            title: title,
            value: title + 11 
            })
        }
      }
      
      return result;
    },
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
    },
    tableWidth() {
      let result = 850;
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
.tableData {
  max-width: 850px;
  overflow-x: scroll;
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
    height: 168px;
    max-height: 173px;
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
  width: 150px;
  &:first-child, &:nth-of-type(2) {
    min-width: 150px;
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
  padding-right: 20px;
  background-color: #988C7E;
  color: white;
  border-right: 1px solid #FFF;
  &:last-child {
    border-right: none;
    width: 157px;
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
.addShadow {
  box-shadow: inset 0 0 8px rgba(191, 176, 157, 1);
}
</style>