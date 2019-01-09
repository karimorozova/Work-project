<template lang='pug'>
  .externalWrap
    noscript
      iframe(src="https://www.googletagmanager.com/ns.html?id=GTM-KM2S59F" height="0" width="0" style="display:none;visibility:hidden")
    .top
      .logo
        .mainWrapper
          .logo__image
            a(href="https://www.pangea.global/")
              img(src='./../assets/images/new-logo.png')
      .header
        .mainWrapper
          span Request a Quote
    .mainWrapper  
      .container
        .slideInInfo(@click="orderSlide" :class="{positionChange: infoSlide && !isHelpSlide}") Your Order
        .slideInHelp(@click="helpSlide" :class="{positionChange: isHelpSlide && !infoSlide}") Need Help?
        .successAlert(v-if="success")
          .successAlert__message
            p Thanks for your request.
            p We will answer you as soon as possible.
        form.mainForm(ref="myForm" @submit.prevent="checkForm")
          .number 
            span 1
            label.asterisk SERVICE TYPE      
          .service-type
            .select(v-on:click='showServices')
              span.inner-text.clarify(:class="{ color: serviceSelect.title != 'Select' }") {{ serviceSelect.title }}
                .icon(:class="{ reverse: serviceDrop }")
                  i.fas.fa-caret-down
              .service-type__drop(v-if='serviceDrop')
                .service-type__drop-list
                  span.list-item(@click='changeServiceSelect(service)' v-for='service of services' ) {{ service.title }}
          .number 
            span 2
            label.asterisk SELECT A LANGUAGE 
          .language
            span(v-if='serviceSelect.source') Source Language
            .select.source(v-if='serviceSelect.source')
              span.inner-text.clarify(:class="{ color: sourceSelect.lang != 'Select' }") {{ sourceSelect.lang }}
                .wrapper(v-on:click.self='showSourceLang')
                .icon(:class="{ reverse: sourceDrop }")
                  i.fas.fa-caret-down
              .source__drop(v-if='sourceDrop' :style="{'max-height': maxSourceHeight + 'px'}")
                .source__drop-list(v-for='language in sourceLangsArray')
                  .pair(@click='changeSourceSelect(language)')
                    img(:src="'https://admin.pangea.global' + language.icon")
                    span.list-item(:class="{ active: language.lang == sourceSelect.lang }") {{ language.lang }}
                      img.openIcon(src="../assets/images/open-icon.png" v-if="language.dialects" :class="{reverseOpenIcon: language.lang == selectLangSource}")
                  .source__drop-list.dialect(v-if='language.dialects' :class="{ dialect_active : language.lang == selectLangSource }")
                    template(v-for='(dialect in language.dialects')
                      .pair.pair_dialect(@click='changeSourceDialect(dialect)')
                        img(:src="'https://admin.pangea.global' + dialect.icon")
                        span.list-item(:class="{ active: dialect.lang == sourceSelect.lang }") {{ dialect.lang }}
            span Target Language(s)
            .select.target
              span.inner-text.clarify(:class="{ color: targetSelect.length != 0 }") 
                template(v-if="targetSelect.length > 0" v-for="language in targetSelect") {{ language.lang }}; 
                template(v-if="targetSelect.length == 0") Select
                .wrapper(v-on:click.self='showTargetLang')
                .icon(:class="{ reverse: targetDrop }")
                  i.fas.fa-caret-down
              .target__drop(v-if='targetDrop' :style="{'max-height': maxTargetHeight + 'px'}")
                .target__drop-list(v-for='language in targetLangsArray')
                  .pair(@click='changeTargetSelect(language)')
                    img(:src="'https://admin.pangea.global' + language.icon")
                    span.list-item(:class="{ active: language.check }") {{ language.lang }}
                      img.openIcon(src="../assets/images/open-icon.png" v-if="language.dialects" :class="{reverseOpenIcon: language.lang == selectLangTarget}")
                  .source__drop-list.dialect(v-if='language.dialects' :class="{ dialect_active : language.lang == selectLangTarget }")
                    template(v-for='dialect in language.dialects')
                      .pair.pair_dialect(@click='changeTargetDialect(dialect)')
                        img(:src="'https://admin.pangea.global' + dialect.icon")              
                        span.list-item(:class="{ active: dialect.check }") {{ dialect.lang }}
          .number 
            span 3
            label.asterisk CHOOSE AN INDUSTRY 
          .industry
            .industry__item.casino(v-for="industry in dbIndustry" :class="{activeIndustry: industrySelect == industry.name}" @click='() => changeIndustry(industry)')
              .image(:style="{ backgroundImage: 'url(' + 'https://admin.pangea.global' + industry.icon + ')' }")
              p.industry__name {{ industry.name }}
          .number
            span 4
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
              textarea(rows='10' v-model='brief')
          .number
            span 5
            label CONTACT DETAILS
          .contact
            .contact__col
              .contact__col-item.name
                span.asterisk Name
                input(type='text' name='formContactsName' v-model='contactName')
              .contact__col-item.e-mail
                span.asterisk Email
                input(type='text' name='formContactsMail' v-model='contactEmail')
              .contact__col-item.phones
                span Phone Number
                input(type='text' v-model='phone')
            .contact__col
              .contact__col-item.company-name
                span.asterisk Company Name
                input(type='text' v-model='companyName')
              .contact__col-item.website
                span Website
                input(type='text' v-model='web')
              .contact__col-item.skype
                span Skype Name
                input(type='text' v-model='contactSkype')
          .captcha
            span.asterisk Please, confirm that you are not a robot   
            .captcha__google
              .g-recaptcha(data-sitekey="6LfHMFEUAAAAAJrIpd_0BOsfWqS04aLnEaT3NVOZ"
                style= {"transform": "scale(0.77)",
                  "-webkit-transform": "scale(0.77)",
                  "transform-origin": "150px 0",
                  "-webkit-transform-origin": "150px 0" })
            input.buttons(type='submit' value='Submit' name="submit")
          .warning(v-if="error")
            .message
              .closeWarning(@click="closeWarning")
                i.fa.fa-times
              p
                | Please, fill all the required fields (marked with red 
                span.asterisk asterisk
                | )
      .orderInfo(:class="{'orderInfo_block': infoSlide || isHelpSlide}")
        .orderInfo__info(:class="{slideToShow: infoSlide}")
          .orderInfo__title
            h3 YOUR ORDER
          .orderInfo__summary
            .orderInfo__summary-service
              span 1
              label SERVICE: 
              p.choice {{ serviceSelect.title }}
            .orderInfo__summary-languages
              span 2
              label LANGUAGE:
              p(v-if='serviceSelect.source') Source:
                span.choice &nbsp; {{ sourceSelect.lang }} <template v-if="!sourceSelect">Select</template>
              p Target: 
                span.choice &nbsp;
                  template(v-if="targetSelect.length > 0" v-for="language of targetSelect") {{ language.lang }}; 
                  template(v-if="targetSelect.length == 0") Select
            .orderInfo__summary-industry
              span 3
              label INDUSTRY: 
              p.choice {{ industrySelect }}
            .orderInfo__summary-deadline
              label SUGGESTED DEADLINE
              p.choice {{ deadlineDate }}
        .orderInfo__help(:class="{'orderInfo_help-slide': isHelpSlide}")
          .orderInfo__contacts-link
            .orderInfo__title
              h3 NEED HELP?
            .orderInfo__help-message
              p.orderInfo__text Having problems submitting a form? <br> Access our
                a.orderInfo__help-link(href="https://www.pangea.global/contact-us") Contact Us 
                | page for assistance.
      transition(name="slide-fade")
        .server-err(v-if="isServerError")
          ServerError(:errorMessage="serverErrMessage")
    .footer
      .linkList
        .linkList__item.first
          ul.list
            li(v-for="link in linksArray[0]")
              a(:href='link.link') {{ link.title }}
        .linkList__item.second
          ul.list
            li(v-for="link in linksArray[1]")
              a(:href='link.link') {{ link.title }}
      .legalInfo
        .legalInfo__item
          a.cookies-link(href="http://www.aboutcookies.org/" target="_blank") Use cookies
          p.linfo YIOTA COURT, Makariou III Ave. 134, 3021, Limassol
          p.linfo office : +35725252150
          p.linfo Reg. No. HE362046  VAT. No. 10362046H
          p.linfo © 2016 
            span.pangeaFooterSpan Pangea Translation Services (Cyprus) LTD
        .legalInfo__item
          img(border="0" src="https://twb.translationcenter.org/workspace/display-badge/index/id/61931/Volunteer_Translator.jpg" alt="English to French & English to Arabic & English to Chinese volunteer translator")
      .socialLinks
        ul.socials
          li(v-for="social in socialsArray")
            a(:href="social.socialLink")
              img.socialsImage(:src="social.image")
    script(src='https://www.google.com/recaptcha/api.js', defer=true, async=true)
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
import ServerError from '../components/ServerError';
import moment from 'moment';
import ClickOutside from 'vue-click-outside';
import Datepicker from './../components/Datepicker.vue';
import { Drag, Drop } from 'vue-drag-drop';

var sbjs = require('sourcebuster');

export default {
  name: 'pang-form',
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
      request: [],
      industryList: {
        legal: {
          text: 'Legal'
        },
        hotel: {
          text: 'Hotel & Real Estates'
        },
        trading: {
          text: 'CFDs & Online Trading'
        },
        crypto: {
          text: 'ICOs & Crypto-Currency'
        },
        casino: {
          text: 'Casino, Poker & IGaming'
        },
        games: {
          text: 'Video Games'
        },
        other: {
          text: 'Other'
        }
      },
      infoSlide: false,
      isHelpSlide: false,
      deadlineDate: '',
      detailFiles: [],
      refFiles: [],
      serviceDrop:  false,
      sourceDrop: false,
      targetDrop: false,
      filesDrop: false,
      serviceSelect: {title : 'Select', source : true, languages: [{source: [], target: []}]},
      sourceSelect: {lang : 'Select'},
      selectLangSource: '',
      selectLangTarget: '',
      selectLangTargetEnglish: '',
      targetlang: ["Select"],
      targetSelect: [],
      dialectsDrop: false,
      industries: [],
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
      languages: [],
      linksArray: [
        [
          {
          link: 'https://www.pangea.global', title: 'Home'
          },
          {
          link: 'https://www.pangea.global/career', title: 'Careers'
          },
          {
          link: 'https://www.pangea.global/faq', title: 'FAQ'
          },
          {
          link: 'https://www.pangea.global/privacy-policy', title: 'Privacy Policy'
          }
        ],
        [
          {
          link: 'https://www.pangea.global/contact', title: 'Contact Us'
          },
          {
          link: 'https://www.pangea.global/blog', title: 'Blog'
          },
          {
          link: 'https://www.pangea.global/rewards-program', title: 'Rewards Program'
          }
        ]
      ],
      socialsArray: [
        {
          socialLink: 'https://www.facebook.com/PangeaLocalizationServices/', image: require('../assets/images/social/facebook.png')
        },
        {
          socialLink: 'https://www.linkedin.com/company/pangea-language-service', image: require('../assets/images/social/linkedin.png')
        },
        {
          socialLink: 'https://twitter.com/Pangea_Local', image: require('../assets/images/social/twitter.png')
        },
        {
          socialLink: 'https://plus.google.com/116520029165216678356', image: require('../assets/images/social/google +.png')
        },
        {
          socialLink: 'https://www.youtube.com/channel/UCKlcUH-8dbg7eZy-nZyDREw', image: require('../assets/images/social/youtube.png')
        },
        {
          socialLink: 'https://www.instagram.com/pangea_local/', image: require('../assets/images/social/instagram.png')
        },
        {
          socialLink: 'https://www.pinterest.com/pangealocalizat/', image: require('../assets/images/social/pinterest.png')
        }
      ],
      serverErrMessage: "",
      isServerError: false
    }
  },
  methods: {
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
      this.infoSlide = !this.infoSlide;
      if(this.infoSlide) this.isHelpSlide = false;
    },
    helpSlide() {
      this.isHelpSlide = !this.isHelpSlide;
      if(this.isHelpSlide) this.infoSlide = false;
    },
    showServices() {
      this.toggleServices()
    },
    toggleServices() {
      this.serviceDrop = !this.serviceDrop;
    },
    changeDetailFiles(event) {
      for(var i = 0; i < event.target.files.length; i++){
        this.detailFiles.push(event.target.files[i]);
      }      
    },
    detailRemove(event) {   
      this.detailFiles.splice(this.detailFiles.indexOf(event),1)
    },
    refRemove(event) {   
      this.refFiles = [];
    },
    changeRefFiles(event) {
      this.refFiles = event.target.files[0];
    },
    changeServiceSelect(event) {
      this.serviceSelect = event;
      this.sourceSelect = {lang : 'Select'};
      if(!event.source) {
        this.sourceSelect = {lang: 'English (United Kingdom)', xtrf : 61}
      }
    },
    changeIndustry(indus) {
      this.industrySelect = indus.name;
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
    showDialects(event) {
      this.toggleDialects()
    },
    toggleDialects() {
      this.dialectsDrop = !this.dialectsDrop
    },
    showFiles() {
      this.toggleFiles()
    },
    toggleFiles() {
      this.filesDrop = !this.filesDrop
    },
    changeSourceSelect(event) {
      if(event.lang == this.selectLangSource) {
        this.selectLangSource = '';
      } else {
        if(!event.dialects) {
          this.sourceSelect = event;
          this.toggleSource();
        } 
        else {
          this.selectLangSource = event.lang;
        }
      }
      this.targetlang = ["Select"];
      this.targetSelect.forEach(item => {
        item.check = false
      })
      this.targetSelect = [];
    },
    changeSourceDialect(event) {
      this.sourceSelect = event;
      this.selectLangSource = '';
      this.toggleSource();
      this.targetlang = ["Select"];
      this.targetSelect.forEach(item => {
        item.check = false
      })
      this.targetSelect = [];
    },
    changeTargetSelect(event) {
      if(event.lang == this.selectLangTarget) {
        this.selectLangTarget = ''        
      } else {
        this.selectLangTarget = '';
        const pos = this.targetSelect.indexOf(event);
        if(pos === -1) {
          if(!event.dialects) {
            event.check = true;
            this.targetSelect.push(event);
          } else {
              this.selectLangTarget = event.lang;            
          }
        }
        else{
          event.check = false;
          this.targetSelect.splice(pos,1);
        }   
      }
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
          if(!event.dialects) {
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
      this.sourceSelect = {lang: 'Select'},
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
          sendForm.append("detailFiles", this.detailFiles[i]);
        }
        sendForm.append("refFiles", this.refFiles, this.refFiles.name);
        try {
          const result = await this.$axios.$post('/api/request', sendForm);
        } catch(err) {
          this.isServerError = true;
          this.serverErrMessage = 'Error on sending the request form (sendForm func)';
          setTimeout(()=> {
            this.isServerError = false;
          }, 5000);
          console.log(err);
        }
    },
    async getServices() {
      try {
        const result = await this.$axios.$get('/api/services')
        result.sort((a, b) => {return a.sortIndex - b.sortIndex});
        for (let i = 0; i < result.length; i++) {
          this.services.push(result[i])
        }
      } catch(err) {
        this.isServerError = true;
        this.serverErrMessage = 'Error on getting services';
        setTimeout(()=> {
          this.isServerError = false;
        }, 5000);
        console.log(err);
      }
    },
    async getLanguages() {
      try {
        const result = await this.$axios.$get('/api/languages');
        this.languages = result.filter(item => {
          return item.active
        });
        for(let lang of this.languages) {
          if(lang.children) {
            lang.dialects = [];
            for(let i = 0; i < this.languages.length;) {
              if(this.languages[i].parent == lang.symbol) {
                  lang.dialects.push(this.languages[i]);
                  this.languages.splice(i, 1);
                  i--;
              } else {
                i++
              }
            }
          }
        }
      } catch(err) {
        this.isServerError = true;
        this.serverErrMessage = 'Error on getting languages';
        setTimeout(()=> {
          this.isServerError = false;
        }, 5000);
        console.log(err);
      }
    },
    async getIndustries() {
      try {
        const result = await this.$axios.$get('/api/industries');
        this.industries = result;
      } catch(err) {
        this.isServerError = true;
        this.serverErrMessage = 'Error on getting industries';
        setTimeout(()=> {
          this.isServerError = false;
        }, 5000)
        console.log(err);
      }
    },
    
    async checkForm(event) {
      this.request = {
          date: this.deadlineSelect, 
          contactName: this.contactName, 
          contactEmail: this.contactEmail,
          service: this.serviceSelect, 
          industry: this.industrySelect, 
          status: 'New', 
          sourceLanguage: this.sourceSelect, 
          targetLanguages: this.targetSelect, 
          web: this.web,
          skype: this.contactSkype, 
          phone: this.phone, 
          companyName: this.companyName,
          accountManager: "None selected",
          brief: this.brief,
          files: this.files,
          createdAt: Date.now    
    }

      this.errors = [];
      
      if(!this.request.contactName) this.errors.push("Name required");
      if(!this.request.contactEmail) this.errors.push("Email required");
      if(!this.request.companyName) this.errors.push("Company Name required");
      if(this.serviceSelect == 'Select' || this.industrySelect == 'Select' || (this.source == 'Select' && this.target == 'Select')) {
        this.errors.push("Please, fill the required fields (with red asterisk).")
      }
        else if(!this.validEmail(this.request.contactEmail)) {
        this.errors.push("Email should be like address@email.com");
      }
      try {
        let captchaValidation = await grecaptcha.getResponse();
        if(captchaValidation.length === 0) this.errors.push("captcha required");
        if(!this.errors.length){
          await this.sendForm();
          console.log("sent")
          window.top.location.href = "https://www.pangea.global/thank-you"; 
        } else {
          this.showError();        
          event.preventDefault();
        }
      } catch(err) {
        this.isServerError = true;
        this.serverErrMessage = 'Error on sending the request form (checkForm func)';
        setTimeout(()=> {
          this.isServerError = false;
        }, 5000)
        console.log(err);
      }
    },
    validEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    },
    google() {
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-KM2S59F');
    },
    go(sb) {
      console.log('Cookies are set! Your current source is: ' + sb.current.src);
    }
  },
  computed: {
    sortedLanguages() {
      if(this.languages.length) {
        let moveToStart;
        this.languages = this.languages.sort((a, b) => {
          if(a.lang > b.lang) return 1;
          if(a.lang < b.lang) return -1;
        });
        
        for(let i = 0; i < this.languages.length; i++) {
          if(this.languages[i].lang == 'English') {
            moveToStart = this.languages.splice(i, 1);
            this.languages.unshift(moveToStart[0]);
          }
        }  
      }
      
      return this.languages;
    },
    maxSourceHeight() {
      let height = 465;
      if(this.sourceLangsArray.length < 45) {
        height = 250;
      }
      return height;
    },
    maxTargetHeight() {
      let height = 465;
      if(this.targetLangsArray.length < 45) {
        height = 258;
      }
      return height;
    },
    sourceLangsArray() {
      let result = this.languages;
      
      if(this.serviceSelect.title != 'Select') {
        result = [];
        for(let serv of this.services) {
          if(serv.title == this.serviceSelect.title) {
            if(serv.languageForm == 'Duo') {
              for(let lang of serv.languageCombinations) {
                result.push(lang.source);
              }
            }
          }
        }
      }

      result = result.filter((obj, pos, arr) => {
        return arr.map( mapObj => mapObj.lang).indexOf(obj.lang) === pos;
      });

      result = result.sort((a, b) => {
        if(a.lang > b.lang) return 1;
        if(a.lang < b.lang) return -1;
      })
      
      return result;
    },
    targetLangsArray() {
      let result = this.languages;
      
      if(this.serviceSelect.title != 'Select') {
        result = [];
        for(let serv of this.services) {
          if(serv.title == this.serviceSelect.title) {
            if(serv.languageForm == 'Duo') {
              for(let lang of serv.languageCombinations) {
                if( (this.sourceSelect.lang == lang.source.lang && this.sourceSelect.lang != lang.target.lang) || this.sourceSelect.lang == 'Select' ) {
                  result.push(lang.target);
                }
              }
            }
            if(serv.languageForm == 'Mono') {
              for(let lang of serv.languageCombinations) {
                result.push(lang.target);
              }
            }
          }
        }
      }

      result = result.filter((obj, pos, arr) => {
        return arr.map( mapObj => mapObj.lang).indexOf(obj.lang) === pos;
      });

      result = result.sort((a, b) => {
        if(a.lang > b.lang) return 1;
        if(a.lang < b.lang) return -1;
      })
      
      return result;
    },
    dbIndustry() {
      let result = [{name: "", icon: ""}];
      if(this.industries.length) {
        result = this.industries;
      }
      return result;
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
    ServerError
  },
  mounted(){
    this.google();
    this.getServices();
    this.getLanguages();
    this.getIndustries();
    sbjs.init({ callback: this.go });
    console.log(sbjs.get.current.src);
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang='scss'>
@import '../assets/request-quote.scss';

.server-err {
  position: fixed;
  right: 40px;
}

.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .4s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}

</style>
