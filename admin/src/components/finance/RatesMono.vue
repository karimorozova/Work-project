<template lang="pug">
.duoWrap
  .filters
    .filters__item.sourceMenu
      label Language
      LanguagesSelect(:selectedLang="sourceSelect" :addAll="true" @chosenLang="chosenSource")
    .filters__item.industryMenu
      label Industry
      IndustrySelect(:selectedInd="industryFilter" :filteredIndustries="filterIndustry" @chosenInd="chosenInd")
    .filters__item.serviceMenu
      label Service
      ServiceSelect(:selectedServ="serviceSelect" @chosenServ="chosenServ" :direction="direction")           
  .tableData
    table.duoFinance(:style="{width: tableWidth}")
      thead
        tr
          th(v-for="head in tableHeader") {{ head.title }}
      tbody
        template(v-for="(info, index) in fullInfo" v-if="(sourceSelect.indexOf(info.sourceLanguage.symbol) != -1 || sourceSelect[0] == 'All') && (targetSelect.indexOf(info.targetLanguage.symbol) != -1 || targetSelect[0] == 'All')")
          tr(v-for="indus in info.industry" v-if="filterIndustry.indexOf(indus.name) != -1")
            td.dropOption 
              template(v-if='sourceSelect.indexOf(info.sourceLanguage.symbol) != -1 || !info.sourceLanguage.symbol || sourceSelect[0] == "All"') {{ info.sourceLanguage.lang }}
              .innerComponent(v-if="!info.icons[1].active")
                LanguagesSelect(:parentIndex="index" :addAll="false" :selectedLang="[info.sourceLanguage.symbol]" @chosenLang="changeSource" @scrollDrop="scrollDrop")
            td.dropOption 
              template(v-if='sourceSelect.indexOf(info.sourceLanguage.symbol) != -1 || !info.targetLanguage.symbol || targetSelect[0] == "All" || sourceSelect[0] == "All"') {{ info.targetLanguage.lang }}
              .innerComponent(v-if="!info.icons[1].active")
                LanguagesSelect(:parentIndex="index" :addAll="false" :selectedLang="[info.targetLanguage.symbol]" @chosenLang="changeTarget" @scrollDrop="scrollDrop")
            td.dropOption              
              span(v-if="!indus.icon") {{ indus.name }}
              .dropOption__image
                img(v-if="indus.icon" :src="indus.icon")
                span.titleTooltip {{ indus.name }}
              .innerComponent(v-if="!info.icons[1].active")
                IndustrySelect(:parentIndex="index" :selectedInd="industrySelected" :filteredIndustries="infoIndustries" @chosenInd="changeIndustry" @scrollDrop="scrollDrop")
            td
              input(type="checkbox" :checked="info.active" v-model="info.active" :disabled="info.icons[1].active")
            td(:class="{addShadow: !info.icons[1].active}") 
              input.rates(:value="indus.rate" @input="changeRate" :readonly="info.icons[1].active")
            td.iconsField
              template(v-for="(icon, iconIndex) in info.icons") 
                img.crudIcon(:src="icon.image" @click="action(index, iconIndex)" :class="{activeIcon: icon.active}") 
  .addRow
    .addRow__plus(@click="addNewRow")
      span +
</template>

<script>
import LanguagesSelect from "../LanguagesSelect";
import IndustrySelect from "../IndustrySelect";
import ServiceSelect from "../ServiceSelect";

export default {
  props: {},
  data() {
    return {
      direction: 'mono',
      sourceSelect: ["EN"],
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
      services: [],
      changedRate: '',
      currentActive: ''
    }
  },

  methods: {
    changeRate(event) {
      this.changedRate = +event.target.value
    },
    handleScroll() {
      let element = document.getElementsByTagName('tbody')[0];
      element.scrollTop = element.scrollHeight;
    },
    scrollDrop(data) {
      if(data.drop) {
        let element = document.getElementsByTagName('tbody')[0];
        setTimeout(() => {
          let elem1 = document.getElementsByClassName('drop')[0];
          elem1.scrollIntoView({behaviour: 'smooth', inline: 'start', block: 'start'});
          // element.scrollTop = element.scrollTop + 50 //element.scrollHeight;
        }, 100)
      }
    },
    changeSource(data) {
      this.fullInfo[data.index].sourceLanguage = data.lang;
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
          rate: 0.1
        })
      }
    },
    chosenServ(data) {
      this.serviceSelect = data;
      // for(let i = 0; i < this.services.length; i++) {
        // if(this.services[i].title == this.serviceSelect.title) {
        //   this.services[i].crud = !this.services[i].crud;
        // }
      this.fullInfo = [];
      this.getServices();
      // }
    },
    chosenSource(data) {
      if(this.sourceSelect[0] == 'All') {
        this.sourceSelect = [];
        this.sourceSelect.push(data.lang.symbol)
      } else {
          let index = this.sourceSelect.indexOf(data.lang.symbol);
          if(index != -1) {
            this.sourceSelect.splice(index, 1);
          } else {
            this.sourceSelect.push(data.lang.symbol)
          }
      }
      if(data.lang.lang == 'All' || !this.sourceSelect.length) {
        this.sourceSelect = ['All'];
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
    action(index, iconIndex) {
      if(iconIndex == 0) {
        this.fullInfo[index].icons[0].active = false;
        this.fullInfo[index].icons[1].active = true;
        this.fullInfo[index].industry = [];
        for(let elem of this.industrySelected) {
          elem.rate = this.changedRate;
          this.fullInfo[index].industry.push(elem)
        };
        this.$http.post('/service/rates', this.fullInfo[index])
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
      }

      if(iconIndex == 1) {
        for(let elem of this.fullInfo[index].industry) {
          this.industrySelected = [];
          this.industrySelected.push(elem)  
        }
        this.changedRate = this.fullInfo[index].industry[0].rate;
        this.currentActive = index;
        for(let i in this.fullInfo) {
          if(i == index) {
            this.fullInfo[i].icons[1].active = false;
            this.fullInfo[i].icons[0].active = true;   
          } else {
              this.fullInfo[i].icons[1].active = true;
              this.fullInfo[i].icons[0].active = false;
          }
        }
      }

      if(iconIndex == 2) {
        this.fullInfo.splice(index, 1);
      }
    },
    addNewRow() {
      this.fullInfo.push({
        language: {lang: "English"}, 
        package: 3000, 
        industry: [{name: "All", rate: 0}], 
        active: true, 
        icons: [{image: require("../../assets/images/Other/save-icon-qa-form.png"), active: true}, {image: require("../../assets/images/Other/edit-icon-qa.png"), active: false}, {image: require("../../assets/images/Other/delete-icon-qa-form.png"), active: true}]
      });
      setTimeout( () => {
        this.handleScroll();
      },100);
    },
    getServices() {
      this.$http.get("api/services")
      .then(res => {
        this.services = res.data.filter(item => {
          if(item.languageForm == "Mono") {
            return item;
          }
        });
        this.services.forEach(item => {
          if(item.title == this.serviceSelect.title) {
            item.crud = true
            for(let i = 0; i < item.rates.length; i++) {
              for(let elem of item.rates[i].industry) {
                this.fullInfo.push({
                  title: item.title,
                  sourceLanguage: item.rates[i].source,
                  targetLanguage: item.rates[i].target,
                  industry: [elem],
                  active: true,
                  icons: [
                    {image: require("../../assets/images/Other/save-icon-qa-form.png"), active: false}, 
                    {image: require("../../assets/images/Other/edit-icon-qa.png"), active: true}, 
                    {image: require("../../assets/images/Other/delete-icon-qa-form.png"), active: true}
                  ]
                })
              }
            }
          } else {
            item.crud = false
          }
        })
      })
      .catch(err => console.log(err))
    },
    getLanguages() {
      this.$http.get('api/languages')
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
  width: 114px;
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