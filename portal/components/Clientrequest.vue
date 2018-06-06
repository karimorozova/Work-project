<template lang="pug">
  .externalWrap
    Marketing(v-if="service == 'Marketing'")
    Copywriting(v-if="service == 'Copywriting'")
    Proofing(v-if="service == 'Proofing/QA'")
    .mainWrapper(v-if="service == 'Translation' || service == 'Graphic Localization'")
      .container
        .slideInInfo(@click="orderSlide" :class="{positionChange: infoSlide}") Your Order
        .successAlert(v-if="success")
          .successAlert__message
            p Thanks for your request.
            p We will answer you as soon as possible.
        form.mainForm(ref="myForm" @submit.prevent="checkForm")
          .number.projName
            label.asterisk PROJECT NAME
            input(type="text" v-model="projectName" value="projectName" maxlength="50" placeholder='50 characters maximum')
          .number 
            label.asterisk SELECT A LANGUAGE
          .language(v-click-outside="outsideLangs")
            .lang-source
              span Source Language
              .selectLangs.source
                span.inner-text.clarify(:class="{ color: sourceSelect.name != 'Select' }") {{ sourceSelect.name }}
                  .wrapper(v-on:click.self='showSourceLang')
                  .icon(:class="{ reverse: sourceDrop }")
                    i.fas.fa-caret-down
                .source__drop(v-if='sourceDrop')
                  .source__drop-list(v-for='language in sourceLanguages')
                    .pair(@click='changeSourceSelect(language)')
                      img(:src="'/flags/' + language.symbol + '.png'")
                      span.list-item(:class="{ active: language.name == sourceSelect.name }") {{ language.name }}
            .lang-target
              span Target Language(s)
              .selectLangs.target
                span.inner-text.clarify(:class="{ color: targetSelect.length != 0 }") 
                  template(v-if="targetSelect.length > 0" v-for="lang in targetSelect") {{ lang.name }};  
                  template(v-if="targetSelect.length == 0") Select
                  .wrapper(v-on:click.self='showTargetLang')
                  .icon(:class="{ reverse: targetDrop }")
                    i.fas.fa-caret-down
                .target__drop(v-if='targetDrop')
                  .target__drop-list(v-for='language in targetLanguages')
                    .pair(v-if='(sourceSelect.name.includes("English") && serviceSelect.languages[0].target.indexOf(language.symbol) != -1) || serviceSelect.title == "Select" || sourceSelect.name == "Select"' @click='changeTargetSelect(language)')
                      img(:src="'/flags/' + language.symbol  + '.png'")
                      span.list-item(:class="{ active: language.check }") {{ language.name }}
          .number
            label PROJECT DETAILS
          .details
            .details__item
              .inner.buttons.upload-file
                drop.drop(@drop="handleDrop")
                span Files
                .upload-btn
                  .upload-btn__txt Upload files(s)
                  input(name="detailFiles" type="file" @change='changeDetailFiles' multiple)
                span.clarify Drag &amp; Drop
                .loadedList(v-if="detailFiles.length")
                  li.loadedList__item(v-for="file in detailFiles" @click="detailRemove(file)") {{ file.name }}
                    i.fa.fa-times.deleteIcon
              .inner.buttons.btn-mobileview
                span Upload Reference File
                .upload-btn
                  .upload-btn__txt Upload
                  input(name="refFiles" type="file" @change='changeRefFiles')
                span.clarify Type Text
                .loadedList
                  li.loadedList__item(v-if="refFiles.name" @click="refRemove(file)") {{ refFiles.name }}
                    i.fa.fa-times.deleteIcon
              .inner.date-file.deadline
                span Suggested Deadline
                .calendar
                  datepicker(ref="programaticOpen" placeholder='dd-mm-yyyy' :format='format' v-model='deadlineSelect' monday-first=true :highlighted='state.highlighted' :disabled='state.disabled')
                  .datepick(@click='openPicker')
                      img(src='../assets/images/calendar.png')
                span.clarify Select
            .details__brief
              span.details__brief-title Enter a short brief
              textarea(rows='4' v-model='brief') {{ brief }}
            .details__quote
              .send(:class="{optionChecked: sendOption}" @click="chooseBegin")
                .send__check
                  .checker(:class="{checkerChecked: sendOption}")
                .send__text
                  p.head Send a Quote
                  //- p.insideText I approve for the project to begin immediately and I'll review the quote later.
              .start(:class="{optionChecked: startOption}" @click="chooseStart")
                .start__check
                  .checker(:class="{checkerChecked: startOption}")
                .start__text
                  p.head Start Immediately
                  //- p.insideText I approve for the project to begin immediately and to receive the quote just for reference.                
            .captcha
              input.buttons(type='submit' value='Submit' name="submit")          
          .warning(v-if="error")
            .message
              .closeWarning(@click="closeWarning")
                i.fa.fa-times
              p(v-for="err in errors") {{ err }}
      .orderInfo(v-if='infoShow' :class="{slideToShow: infoSlide}")
          .orderInfo__title
            h3 YOUR ORDER
          .orderInfo__summary
            .orderInfo__summary-service
              span 1
              label SERVICE: 
              p.choice {{ service }}
            .orderInfo__summary-languages
              span 2
              label LANGUAGE:
              p(v-if='serviceSelect.source') Source:
                span.choice &nbsp; {{ sourceSelect.name }} <template v-if="!sourceSelect">Select</template>
              p Target: 
                span.choice &nbsp; 
                  template(v-for="language of targetSelect") {{ language.name }};
                  template(v-if="targetSelect == 0") Select
            .orderInfo__summary-industry
              span 3
              label INDUSTRY: 
              p.choice {{ industry }}
            .orderInfo__summary-deadline
              label SUGGESTED DEADLINE
              p.choice {{ deadlineDate }}
</template>

<script>
import { logicalExpression } from "../../admin/node_modules/@types/babel-types";

  let state = {
    highlighted: {
      to: new Date(2016, 0, 5), // Highlight all dates up to specific date
      from: new Date(2016, 0, 26), // Highlight all dates after specific date
      days: [6, 0]
    }
  }
</script>

<script>

import moment from 'moment';
import ClickOutside from 'vue-click-outside';
import Datepicker from './Datepicker.vue';
import { Drag, Drop } from 'vue-drag-drop';
import Marketing from './requests/Marketing.vue';
import Copywriting from './requests/Copywriting.vue';
import Proofing from './requests/Proofing.vue';

export default {
  name: 'client-form',
  head: {
  },
  data () {
    return {
      state: {
        highlighted: {
          days: [6, 0]
        },
        disabled: {
          to: moment().add(-1, 'day').endOf('day').toDate()
        }
      },
      sendOption: true,
      startOption: false,
      request: [],
      activeLanguage: '',
      infoSlide: false,
      deadlineDate: '',
      detailFiles: [],
      refFiles: [],
      serviceDrop:  false,
      sourceDrop: false,
      targetDrop: false,
      filesDrop: false,
      infoShow: true,
      projectName: "",
      serviceSelect: {title : 'Select', source : true, languages: [{source: [], target: []}]},
      sourceSelect: {name : 'English (United Kingdom)', id: '73', xtrf: '73', symbol: 'EN-GB', lang: 'English (United Kingdom)'},
      selectLangSource: '',
      selectLangTarget: '',
      targetlang: ["Select"],
      targetSelect: [],
      industrySelect: 'Select',
      deadlineSelect: '',
      contactName: '',
      contactEmail: '',
      contactSkype: '',
      phone: '',
      companyName: '',
      web: '',
      format: 'dd-MM-yyyy',
      brief: '',
      errors: [],
      error: false,
      success: false,
      services:[],
      fileTypes: {
        text:
          [
            'Microsoft Office (doc, docx, xls, xlsx, xlsm, ppt, pptx)',
            'Open Office (sxw, odt, ods, odp)', 'Microsoft Visio (vdx)',
            'pdf (returns plain text)', 'rtf', 'txt'
          ]
        ,
        design:
          [ 
            'Adobe Illustrator (fxg & svg)', 'Adobe FrameMaker (mif)',
            'Adobe InDesign (idml)', 'sdf', 'svg',
          ]
        ,
        web:
          [
            'html, htm', 'xhtml, xht', 'asp, aspx', 'php', 'dita', 'tpl'
          ]
        ,
        translation:
          [
            'xlf, xliff, sdlxliff', 'Wordfast (txml)', 'Trados (ttx)',
          ]
        ,
        dev:          
          [
            'yml, yaml', 'Java property files', 'iPhone apps (strings)',
            'resx', 'ini'
          ]    
      },
      languages: [
      
      ],
    }
  },
  methods: {
    outsideLangs() {
      this.targetDrop = false;
      this.sourceDrop = false;
    },
    chooseBegin() {
      this.sendOption = true;
      this.startOption = false
    },
    chooseStart() {
      this.sendOption = false;
      this.startOption = true
    },
    handleDrop(data, event) {
      event.preventDefault();
      const files = event.dataTransfer.files;
      const filenames = [];
      for (let i = 0; i < files.length; i++) {
        filenames.push(files.item(i).name);
        this.detailFiles.push(files[i]);
      }
    },
    orderSlide() {
      this.infoSlide = !this.infoSlide
    },
    changeDetailFiles(event) {
      for(var i = 0; i < event.target.files.length; i++){
        this.detailFiles.push(event.target.files[i]);
      }      
      console.log(this.detailFiles);
    },
    detailRemove(event) {   
      this.detailFiles.splice(this.detailFiles.indexOf(event),1)
    },
    refRemove(event) {   
      this.refFiles = [];
    },
    changeRefFiles(event) {
      this.refFiles = event.target.files[0];
      console.log(this.refFiles);
    },
    showSourceLang() {
      this.toggleSource()
    },
    toggleSource() {
      this.sourceDrop = !this.sourceDrop
    },
    showTargetLang() {
      this.toggleTarget()
    },
    toggleTarget() {
      this.targetDrop = !this.targetDrop
    },
    showFiles() {
      this.toggleFiles()
    },
    toggleFiles() {
      this.filesDrop = !this.filesDrop
    },
    changeSourceSelect(event) {
      this.toggleSource();
      this.sourceSelect.name = event.name;
      this.targetlang = ["Select"];
      this.targetSelect.forEach(item => {
        item.check = false
      })
      let targetArray = this.targetLanguages;
      if (targetArray.length == 1) {
        this.targetSelect = [targetArray[0]]
        this.targetSelect[0].check = true;
      } else {
        this.targetSelect = [];
      }
    },
    changeTargetSelect(event) {
      if(event == this.selectLangTarget) {
        this.selectLangTarget = ''        
      } else {
        this.selectLangTarget = '';
        const pos = this.targetSelect.indexOf(event);
        if(pos === -1) {
          event.check = true;
          this.targetSelect.push(event);
        }
          else {
            event.check = false;
            this.targetSelect.splice(pos,1);
          }    
      }
    },
    openPicker () {
      this.$refs.programaticOpen.showCalendar()
    },
    openPicker1 () {
      this.$refs.programaticOpen1.showCalendar()
    },
    showSuccess(){
      this.success = true;

      setTimeout(() => {
          this.success = false
      }, 4000)
    },
    showError(){
      this.error = true;

      setTimeout(() => {
          this.error = false
      }, 4000)
    },
    closeWarning() {
      this.error = false;
    },
    clearForm() {
      this.projectName = "";
      this.refFiles = [];
      this.detailFiles = [];
      this.request = [];
      this.deadlineDate = '';
      this.deadlineSelect = '';
      this.sourceSelect = {name : 'English (United Kingdom)', id: '73', xtrf: '73', symbol: 'EN-GB', lang: 'English (United Kingdom)'};
      this.targetlang = ["Select"];
      this.targetDrop = false;
      this.targetSelect = [];
      this.brief = '';
      this.languages.map(item => {
        if(!item.dialects) {
          item.check = false
        } else {
          item.dialects.map(ditem => {
            ditem.check = false
          })
        }
      })
    },
    async sendForm() {
        var serviceFull;
        for(let i = 0; i < this.services.length; i++) {
          if(this.request.service == this.services[i].title)
            serviceFull = this.services[i];
        }
        var typeOfRequest = "quote";
        if (this.startOption) {
          typeOfRequest = "project";
        }
        var sendForm = new FormData();

        sendForm.append("typeOfRequest", typeOfRequest);        
        sendForm.append("projectName", this.request.projectName);
        sendForm.append("date", this.request.date);
        sendForm.append("contactName", this.request.contactName);
        sendForm.append("contactEmail", this.request.contactEmail);
        sendForm.append("service", JSON.stringify(serviceFull));
        sendForm.append("industry", this.request.industry); 
        sendForm.append("status", "New");
        sendForm.append("sourceLanguage", JSON.stringify(this.request.sourceLanguage));
        sendForm.append("targetLanguages", JSON.stringify(this.request.targetLanguages)); 
        sendForm.append("web", this.request.web);
        sendForm.append("skype", this.request.skype);
        sendForm.append("phone", this.request.phone);
        sendForm.append("companyName", this.request.companyName);
        sendForm.append("accountManager", "None selected");
        sendForm.append("brief", this.request.brief);
        sendForm.append("createdAt", this.request.createdAt);
        sendForm.append("jsession", this.$store.state.session);
        for(var i = 0; i < this.detailFiles.length; i++){
          console.log(this.detailFiles[i]);
          sendForm.append("detailFiles", this.detailFiles[i]);
        }
        sendForm.append("refFiles", this.refFiles, this.refFiles.name);
        /*`for(var i = 0; i < this.refFiles.length; i++){
          console.log(this.refFiles[i]);
          sendForm.append("refFiles", this.refFiles[i]);
        }*/
        if(this.sendOption) {
          const result = await this.$axios.$post('api/request', sendForm);         
        }
        if(this.startOption) {
          const result = await this.$axios.$post('api/project-request', sendForm);
        }
        this.clearForm();
    },
    getServices() {
      this.services = this.$store.state.services;
      
    },
    getLanguages() {
      this.languages = this.$store.state.clientLanguages;
    },
    
    async checkForm(event) {
      this.request = {
          projectName: this.projectName,
          date: this.deadlineSelect, 
          contactName: this.$store.state.clientInfo.name, 
          contactEmail: this.$store.state.clientInfo.email,
          service: this.$store.state.clientInfo.service, 
          industry: this.$store.state.clientInfo.industry, 
          status: 'New',
          sourceLanguage: this.sourceSelect, 
          targetLanguages: this.targetSelect, 
          web: this.$store.state.clientInfo.web,
          skype: this.$store.state.clientInfo.skype, 
          phone: this.$store.state.clientInfo.phone, 
          companyName: this.$store.state.clientInfo.companyName,
          accountManager: "None selected",
          brief: this.brief,
          files: this.files,
          createdAt: Date.now    
    }

      this.errors = [];
      if(!this.request.projectName) this.errors.push("Project name required!");
      if(!this.request.targetLanguages.length) this.errors.push("Target language(s) required!");
      if(!this.deadlineSelect) this.errors.push("Deadline required!");
      if(!this.detailFiles.length) this. errors.push("File(s) required!");
            
      if(!this.errors.length){
        this.sendForm();         
        console.log("sent")
        // window.top.location.href = "https://www.pangea.global/thank-you"; 
      } else {
        this.showError();
        event.preventDefault();
      }
    }    
  },
  computed: {
    sourceLanguages() {
      let result = [];
      if(this.languages.length) {
        for(let i = 0; i < this.languages.length; i++) {
          result.push({name: this.languages[i].sourceLanguage.name, lang: this.languages[i].sourceLanguage.name, symbol: this.languages[i].sourceLanguage.symbol, id: this.languages[i].sourceLanguage.id, xtrf: this.languages[i].sourceLanguage.id, check: false})   
        }
      }
      result = result.filter((obj, pos, arr) => {
        return arr.map( mapObj => mapObj.name).indexOf(obj.name) === pos;
      });

      return result.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
      });
    },
    targetLanguages() {
      let result = [];
      if(this.languages.length) {
        for(let i = 0; i < this.languages.length; i++) {
          if (this.languages[i].sourceLanguage.name == this.sourceSelect.name)
          result.push({name: this.languages[i].targetLanguage.name, lang: this.languages[i].targetLanguage.name, symbol: this.languages[i].targetLanguage.symbol, id: this.languages[i].targetLanguage.id, xtrf: this.languages[i].targetLanguage.id, check: false})   
        }
      }
      result = result.filter((obj, pos, arr) => {
        return arr.map( mapObj => mapObj.name).indexOf(obj.name) === pos;
      });
      result = result.filter(item => {
        return item.name != this.sourceSelect.name;
      })
      result.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
      });
      
      return result;
    },
    service() {
      return this.$store.state.clientInfo.service
    },
    industry() {
      return this.$store.state.clientInfo.industry
    }
  },
  watch: {
    deadlineSelect() {
      const date = moment(this.deadlineSelect);
      if(this.deadlineSelect) {
        this.deadlineDate = date.format('DD-MM-YYYY');
      }
    }
  },

  directives: {
    ClickOutside
  },
  components: {
    Datepicker,
    Drop,
    Marketing,
    Proofing,
    Copywriting
  },
  mounted(){
    this.getServices();
    this.getLanguages();
    
  }
}

</script>

<style lang='scss'>
@import '../assets/styles/clientrequest/clientrequest.scss';
.externalWrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  &__title {
    margin-left: 3%;
    width: 100%;
    text-align: center;
    margin: 20px 0 10px;
    span {
      font-family: MyriadPro;
      font-size: 26px;
      color: #66563D;
    }
  }
  .mainWrapper {
    width: 100%;
    margin: 0 auto;
  }
  .captcha {
    input {
      border: none;
      box-shadow: 0 3px 5px rgba(0, 0, 0, .4);
    }
  }
  .details {
    padding-bottom: 0;
    flex-direction: column;
    &__quote {
      margin-top: 30px;
      width: 100%;
      display: flex;
      justify-content: center;
      .send, .start {
        width: 128px;
        height: 120px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        border: 1px solid #66563D;        
        padding: 10px;
        margin: 10px;
        margin-right: 0;
        border-radius: 10px;
        cursor: pointer;
        &__check {
          width: 16px;
          height: 16px;
          // margin-right: 20px;
          border: 1px solid #66563D;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          .checker {
            width: 76%;
            height: 76%;
            border-radius: 50%;
          }
          .checkerChecked {
            background-color: #66563D;
          }
        }
        &__text {
          width: 88%;
          text-align: center;
          .head {
            margin-bottom: 5px;
            font-size: 14px;
          }
          .insideText {
            font-size: 12px;
            margin-top: 0;
          }
        }
      }
      .optionChecked {
        box-shadow: 0 0 7px rgba(0, 0, 0, .6);
      }

    }
  }
}
</style>
