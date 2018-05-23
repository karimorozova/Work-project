<template lang="pug">
  .externalWrap
    .mainWrapper  
      .container
        .slideInInfo(@click="orderSlide" :class="{positionChange: infoSlide}") Your Order
        .successAlert(v-if="success")
          .successAlert__message
            p Thanks for your request.
            p We will answer you as soon as possible.
        form.mainForm(ref="myForm" @submit.prevent="checkForm")
          .number 
            label.asterisk SELECT A LANGUAGE
          .language
            span(v-if='serviceSelected') Source Language
            .select.source(v-if='serviceSelected')
              span.inner-text.clarify(:class="{ color: sourceSelect.lang != 'Select' }") {{ sourceSelect.lang }}
                .wrapper(v-on:click.self='showSourceLang')
                .icon(:class="{ reverse: sourceDrop }")
                  i.fas.fa-caret-down
              .source__drop(v-if='sourceDrop')
                .source__drop-list(v-for='language in sourceLanguages')
                  .pair(v-if='serviceSelect.languages[0].source.indexOf(language.symbol) != -1 || serviceSelect.title == "Select"' @click='changeSourceSelect(language)')
                    img(:src="'/flags/' + language.symbol + '.png'")
                    span.list-item(:class="{ active: language.name == sourceSelect.lang }") {{ language.name }}
                      //- img.openIcon(src="../assets/images/open-icon.png" v-if="language.dialects.length" :class="{reverseOpenIcon: language.lang == selectLangSource}")
                  //- .source__drop-list.dialect(v-if='language.dialects' :class="{ dialect_active : language.lang == selectLangSource }")
                  //-   template(v-for='(dialect in language.dialects')
                  //-     .pair.pair_dialect(@click='changeSourceDialect(dialect)')
                  //-       img(:src="'/flags/' + dialect.symbol + '.png'")                  
                  //-       span.list-item(:class="{ active: dialect.lang == sourceSelect.lang }") {{ dialect.lang }}
            span Target Language(s)
            .select.target
              span.inner-text.clarify(:class="{ color: targetSelect.length != 0 }") 
                <template v-if="targetSelect.length > 0" v-for="lang in targetSelect"> {{ lang.name }},  </template> 
                <template v-if="targetSelect.length == 0">Select</template>
                .wrapper(v-on:click.self='showTargetLang')
                .icon(:class="{ reverse: targetDrop }")
                  i.fas.fa-caret-down
              .target__drop(v-if='targetDrop')
                .target__drop-list(v-for='language in targetLanguages')
                  .pair(v-if='(sourceSelect.lang.includes("English") && serviceSelect.languages[0].target.indexOf(language.symbol) != -1) || serviceSelect.title == "Select" || sourceSelect.lang == "Select"' @click='changeTargetSelect(language)')
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
            .details__item
              .inner.buttons.upload-reference
                span Upload Reference File
                .upload-btn
                  .upload-btn__txt Upload
                  input(name="refFiles" type="file" @change='changeRefFiles')
                span.clarify Type Text
                .loadedList
                  li.loadedList__item(v-if="refFiles.name" @click="refRemove(file)") {{ refFiles.name }}
                    i.fa.fa-times.deleteIcon
              .inner.date-file_mobileView.deadline
                span Suggested Deadline
                .calendar
                  datepicker(ref="programaticOpen1" placeholder='dd-mm-yyyy' :format='format' v-model='deadlineSelect' monday-first=true :highlighted='state.highlighted' :disabled='state.disabled')
                  .datepick(@click='openPicker1')
                      img(src='../assets/images/calendar.png')
                span.clarify Select
              .inner.date-file.file-types
                span Supported File Types
                .supported
                  .supported__icons
                    .supported__icons_images
                      img(src='../assets/images/file-types/in.png')
                      img(src='../assets/images/file-types/excel1.png')
                      img(src='../assets/images/file-types/word1.png')
                      img(src='../assets/images/file-types/ini.png')
                      img(src='../assets/images/file-types/powerpoint1.png')
                      img(src='../assets/images/file-types/photoshop1.png')
                    span.filesLink(v-on:click='showFiles') Full List
            .details__files-list(v-click-outside='showFiles' v-if='filesDrop')
              .title
                label SUPPORTED FILE TYPES
                .crossButton(@click="showFiles")
                  i.fa.fa-times.close
              .types
                .textFiles.types__sector
                  .fileTypeTitle Text files
                  .list
                    li(v-for='type in fileTypes.text') 
                      span.dot &#9679;
                      span.type-text {{ type }}
                .designFiles.types__sector
                  .fileTypeTitle Design files
                  .list
                    li(v-for='type in fileTypes.design') 
                      span.dot &#9679;
                      span.type-text {{ type }}
                .webFiles.types__sector
                  .fileTypeTitle Web files
                  .list
                    li(v-for='type in fileTypes.web')
                      span.dot &#9679;
                      span.type-text {{ type }}
                .translationFiles.types__sector
                  .fileTypeTitle Translation files
                  .list
                    li(v-for='type in fileTypes.translation')
                      span.dot &#9679;
                      span.type-text {{ type }}
                .devFiles.types__sector
                  .fileTypeTitle Dev files
                  .list
                    li(v-for='type in fileTypes.dev')
                      span.dot &#9679;
                      span.type-text {{ type }}
            .details__brief
              span.details__brief-title Enter a short brief
              textarea(rows='4' v-model='brief')
            .details__quote
              .send(:class="{optionChecked: sendOption}" @click="chooseBegin")
                .send__check
                  .checker(:class="{checkerChecked: sendOption}")
                .send__text
                  p.head Send a Quote
                  p.insideText I approve for the project to begin immediately and I'll review the quote later.
              .start(:class="{optionChecked: startOption}" @click="chooseStart")
                .start__check
                  .checker(:class="{checkerChecked: startOption}")
                .start__text
                  p.head Start Immediately
                  p.insideText I approve for the project to begin immediately and to receive the quote just for reference.                
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
                span.choice &nbsp; {{ sourceSelect.lang }} <template v-if="!sourceSelect">Select</template>
              p Target: 
                span.choice &nbsp; <template v-for="language of targetSelect" >{{ language.name }},  </template> <template v-if="targetSelect == 0">Select</template>
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
      hasTargetChosen: [],
      infoSlide: false,
      deadlineDate: '',
      detailFiles: [],
      refFiles: [],
      serviceDrop:  false,
      sourceDrop: false,
      targetDrop: false,
      filesDrop: false,
      infoShow: true,
      serviceSelect: {title : 'Select', source : true, languages: [{source: [], target: []}]},
      sourceSelect: {lang : 'English (United Kingdom)'},
      selectLangSource: '',
      selectLangTarget: '',
      selectLangTargetEnglish: '',
      targetlang: ["Select"],
      targetSelect: [],
      dialectsDrop: false,
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
      this.sourceSelect.lang = event.name;
      this.targetlang = ["Select"];
      this.targetSelect.forEach(item => {
        item.check = false
      })
      this.targetSelect = [];
    },
    changeTargetSelect(event) {
      console.log(event);
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
      console.log(this.targetSelect);
    },
    changeTargetDialect(event) {
     const pos = this.targetSelect.indexOf(event);
      if(pos === -1){
        event.check = true;
        this.targetSelect.push(event);
      }
      else{
        event.check = false;
        this.targetSelect.splice(pos,1);
      }
    },
    changeTargetSelectEnglish(event) {
      if(event.lang == this.selectLangTargetEnglish) {
        this.selectLangTargetEnglish = ''           
      } else {
        const pos = this.targetSelect.indexOf(event);
        if(pos === -1){
          if(!event.dialects.length) {
            event.check = true;
            this.targetSelect.push(event);
          } else {
              this.selectLangTargetEnglish = event.lang;            
              let firstLang = event.dialects[0]; 
              firstLang.check = true;
              if(!this.targetSelect.includes(firstLang)) {
                this.targetSelect.push(firstLang);
              }
            }
        }
        else{
          event.check = false;
          this.targetSelect.splice(pos,1);
        }    
      }
    },
    changeTargetDialectEnglish(event) {
       
     const pos = this.targetSelect.indexOf(event);
      if(pos === -1){
        event.check = true;
        this.targetSelect.push(event);
      }
      else{
        event.check = false;
        this.targetSelect.splice(pos,1);
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
      this.refFiles = [];
      this.detailFiles = [];
      this.request = [];
      this.deadlineDate = '',
      this.deadlineSelect = '',
      this.contactName = '',
      this.contactEmail ='',
      this.serviceSelect = {title : 'Select', source : true, languages: [{source: [], target: []}]},
      this.industrySelect = 'Select',
      this.sourceSelect = {lang: 'English (United Kingdom)'},
      this.targetlang = ["Select"],
      this.targetDrop = false,
      this.targetSelect = [],
      this.web = '',
      this.contactSkype = '',
      this.phone = '',
      this.companyName = '',
      this.brief = '',
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

        var sendForm = new FormData();

        sendForm.append("date", this.request.date);
        sendForm.append("contactName", this.request.contactName);
        sendForm.append("contactEmail", this.request.contactEmail);
        sendForm.append("service", JSON.stringify(this.serviceSelect));
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
        for(var i = 0; i < this.detailFiles.length; i++){
          console.log(this.detailFiles[i]);
          sendForm.append("detailFiles", this.detailFiles[i]);
        }
        sendForm.append("refFiles", this.refFiles, this.refFiles.name);
        /*`for(var i = 0; i < this.refFiles.length; i++){
          console.log(this.refFiles[i]);
          sendForm.append("refFiles", this.refFiles[i]);
        }*/
        
        const result = await this.$axios.$post('api/request', sendForm);
    },
    async getServices() {
      const result = await this.$axios.$get('api/services')
      result.sort((a, b) => {return a.sortIndex - b.sortIndex});
      for (let i = 0; i < result.length; i++) {
        this.services.push(result[i])
      }
    },
    getLanguages() {
      this.languages = this.$store.state.clientLanguages;
    },
    
    async checkForm(event) {
      this.request = {
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
      
      if(!this.request.targetLanguages.length) this.errors.push("Target language(s) required!");
            
      if(!this.errors.length){
        this.sendForm();
        console.log("sent")
        window.top.location.href = "https://www.pangea.global/thank-you"; 
      } else {
        this.showError();
        event.preventDefault();
      }
    }    
  },
  computed: {
    serviceSelected() {
      if(this.service == "Copywriting") {
        return false
      }
      return true
    },
    sourceLanguages() {
      let result = [];
      if(this.languages.length) {
        for(let i = 0; i < this.languages.length; i++) {
          result.push({name: this.languages[i].sourceLanguage.name, symbol: this.languages[i].sourceLanguage.symbol, check: false})   
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
          result.push({name: this.languages[i].targetLanguage.name, symbol: this.languages[i].targetLanguage.symbol, check: false})   
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
    targetLangForSales() {
      let result = '';
      this.targetSelect.forEach(item => {
        result += item.lang + ', '
      })
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
    Drop
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
      .send, .start {
        display: flex;
        align-items: center;
        border: 1px solid #66563D;        
        padding-left: 10px;
        padding-right: 10px;
        margin: 10px;
        margin-right: 0;
        cursor: pointer;
        &__check {
          width: 18px;
          height: 18px;
          margin-right: 20px;
          border: 1px solid #66563D;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          .checker {
            width: 78%;
            height: 78%;
            border-radius: 50%;
          }
          .checkerChecked {
            background-color: #66563D;
          }
        }
        &__text {
          width: 88%;
          .head {
            margin-bottom: 5px;
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
