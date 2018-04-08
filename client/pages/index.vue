<template lang='pug'>
  .mainWrapper
    .container
      .slideInInfo(@click="orderSlide" :class="{positionChange: infoSlide}") Your order
      .successAlert(v-if="success")
        .successAlert__message
          p Thanks for your request.
          p We will answer you as soon as possible.
      form.mainForm(@submit.prevent="checkForm")
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
                span.list-item(@click='changeServiceSelect(service)' v-for='service of services') {{ service.title }}
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
            .source__drop(v-if='sourceDrop')
              .source__drop-list(v-for='language in languages')
                .pair(v-if='serviceSelect.languages[0].source.indexOf(language.symbol) != -1 || serviceSelect.title == "Select"' @click='changeSourceSelect(language)')
                  img(:src="'/flags/' + language.symbol + '.png'")
                  span.list-item {{ language.lang }}
                    img.openIcon(src="../assets/images/open-icon.png" v-if="language.dialects.length" :class="{reverseOpenIcon: language == selectLangSource}")
                .source__drop-list.dialect(v-if='language.dialects' :class="{ dialect_active : language.lang == selectLangSource }")
                  template(v-for='(dialect in language.dialects')
                    .pair.pair_dialect(@click='changeSourceSelect(dialect)')
                      img(:src="'/flags/' + dialect.symbol + '.png'")                  
                      span.list-item {{ dialect.lang }}
          span Target Language(s)
          .select.target
            span.inner-text.clarify(:class="{ color: targetSelect.length != 0 }") 
              <template v-if="targetSelect.length > 0" v-for="language in targetSelect"> {{ language.lang }} </template> 
              <template v-if="targetSelect.length == 0">Select</template>
              .wrapper(v-on:click.self='showTargetLang')
              .icon(:class="{ reverse: targetDrop }")
                i.fas.fa-caret-down
            .target__drop(v-if='targetDrop')
              .target__drop-list(v-for='language in languages')
                .pair(v-if='(sourceSelect.lang.includes("English") && serviceSelect.languages[0].target.indexOf(language.symbol) != -1) || serviceSelect.title == "Select" || sourceSelect.lang == "Select"' @click='changeTargetSelect(language)')
                  img(:src="'/flags/' + language.symbol  + '.png'")
                  span.list-item(:class="{ active: language.check }") {{ language.lang }}
                    img.openIcon(src="../assets/images/open-icon.png" v-if="language.dialects.length" :class="{reverseOpenIcon: language == selectLangTarget}")
                .source__drop-list.dialect(v-if='language.dialects && sourceSelect.lang.includes("English") && serviceSelect.languages[0].target.indexOf(language.symbol) != -1 || serviceSelect.title == "Select" || sourceSelect.lang == "Select"' :class="{ dialect_active : language.lang == selectLangTarget }")
                  template(v-for='dialect in language.dialects')
                    .pair.pair_dialect(@click='changeTargetDialect(dialect)')
                      img(:src="'/flags/' + dialect.symbol + '.png'")                  
                      span.list-item(:class="{ active: dialect.check }") {{ dialect.lang }}
                .pair(v-if='!sourceSelect.lang.includes("English") && language.lang.includes("English") && serviceSelect.title != "Select" && sourceSelect.lang != "Select"' @click='changeTargetSelectEnglish(language)')
                  img(:src="'/flags/' + language.symbol  + '.png'")
                  span.list-item(:class="{ active: language.check }") {{ language.lang }}
                    img.openIcon(src="../assets/images/open-icon.png" v-if="language.dialects.length" :class="{reverseOpenIcon: language == selectLangTargetEnglish}")
                .source__drop-list.dialect(v-if='language.dialects && !sourceSelect.lang.includes("English") && language.lang.includes("English") && serviceSelect.title != "Select" && sourceSelect.lang != "Select"' :class="{ dialect_active : language.lang == selectLangTargetEnglish }")
                  template(v-for='dialect in language.dialects')
                    .pair.pair_dialect(@click='changeTargetDialectEnglish(dialect)')
                      img(:src="'/flags/' + dialect.symbol + '.png'")                  
                      span.list-item(:class="{ active: dialect.check }") {{ dialect.lang }}
        .number 
          span 3
          label.asterisk CHOOSE AN INDUSTRY
        .industry
          .industry__item.legal(:class="{activeIndustry: industrySelect == industryList.legal.text}" @click='() => changeIndustry("legal")')
            .image
            .image-white
            p Legal
          .industry__item.hotel(:class="{activeIndustry: industrySelect == industryList.hotel.text}" @click='() => changeIndustry("hotel")')
            .image
            .image-white
            p Hotel &amp;
              br 
              | Real Estates 
          .industry__item.trading(:class="{activeIndustry: industrySelect == industryList.trading.text}" @click='() => changeIndustry("trading")')
            .image
            .image-white
            p CFDs &amp; Online
              br
              | Trading
          .industry__item.crypto(:class="{activeIndustry: industrySelect == industryList.crypto.text}" @click='() => changeIndustry("crypto")')
            .image
            .image-white
            p ICOs &amp; Crypto-
              br
              | Currency
          .industry__item.casino(:class="{activeIndustry: industrySelect == industryList.casino.text}" @click='() => changeIndustry("casino")')
            .image
            .image-white
            p Casino, Poker
              br
              | &amp; IGaming
          .industry__item.games(:class="{activeIndustry: industrySelect == industryList.games.text}" @click='() => changeIndustry("games")')
            .image
            .image-white
            p Video Games
          .industry__item.other(:class="{activeIndustry: industrySelect == industryList.other.text}" @click='() => changeIndustry("other")')
            .image
            .image-white
            p Other
        .number
          span 4
          label PROJECT DETAILS
        .details
          .details__item
            .inner.buttons.upload-file
              span.asterisk Files
              .upload-btn
                .upload-btn__txt Upload files(s)
                input(name="detailFiles" type="file" @change='changeDetailFiles' multiple)
              span.clarify Drag &amp; Drop
              .loadedList(v-if="detailFiles.length")
                li.loadedList__item(v-for="file in detailFiles" @click="detailRemove(file)") {{ file.name }}
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
                datepicker(ref="programaticOpen" placeholder='dd-mm-yyyy' :format='format' v-model='deadlineSelect' monday-first=true :highlighted='state.highlighted' :disabled='state.disabled')
                .datepick(@click='openPicker')
                    img(src='../assets/images/calendar.png')
              span.clarify Select
            .inner.date-file.file-types
              span Supported File Types
              .supported
                .supported__icons
                  img(src='../assets/images/file-types/Artboard1.png')
                  img(src='../assets/images/file-types/Artboard1copy.png')
                  img(src='../assets/images/file-types/Artboard1copy2.png')
                  img(src='../assets/images/file-types/Artboard1copy3.png')
                  img(src='../assets/images/file-types/Artboard1copy4.png')
                  img(src='../assets/images/file-types/Artboard1copy5.png')
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
            .contact__col-item.email
              span.asterisk Email
              input(type='text' name='formContactsMail' v-model='contactEmail')
            .contact__col-item.phone
              span Phone Number
              input(type='text' v-model='phone')
          .contact__col
            .contact__col-item.skype
              span Skype Name
              input(type='text' v-model='contactSkype')
            .contact__col-item.company
              span Company Name
              input(type='text' v-model='companyName')
            .contact__col-item.website
              span Website
              input(type='text' v-model='web')
        .captcha
          span.asterisk Please, confirm that you are not a robot   
          .captcha__google
            vue-recaptcha( sitekey="6LfHMFEUAAAAAJrIpd_0BOsfWqS04aLnEaT3NVOZ" 
              ref="recaptcha"
              @verify="onVerify"
              @expired="onExpired"
              :callback="checkForm")
          input.buttons(type='submit' value='Submit')
        .warning(v-if="error")
          .message
            .closeWarning(@click="closeWarning")
              i.fa.fa-times
            p
              | Please, fill all the required fields (marked with red 
              span.asterisk asterisk
              | )
    .orderInfo(v-if='infoShow' :class="{slideToShow: infoSlide}")
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
              span.choice &nbsp; <template v-for="language of targetSelect" >{{ language.lang }} </template> <template v-if="targetSelect == 0">Select</template>
          .orderInfo__summary-industry
            span 3
            label INDUSTRY: 
            p.choice {{ industrySelect }}
          .orderInfo__summary-deadline
            label SUGGESTED DEADLINE
            p.choice {{ deadlineDate }}

</template>

<script>
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
import Datepicker from './../components/Datepicker.vue';
import VueRecaptcha from 'vue-recaptcha';
// import Clock from './../components/Clock.vue';

export default {
  name: 'pang-form',
  data () {
    return {
      // options: {
      //   acceptedFileTypes: ['image/*', 'text/*'],
      //   clickable: false,
      //   adapterOptions: {
      //     url: './',
      //   },
      // },
      // files: [],
      state: {
        highlighted: {
          days: [6, 0]
          // dates: [new Date()]
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
      deadlineDate: '',
      detailFiles: [],
      refFiles: [],
      serviceDrop:  false,
      sourceDrop: false,
      targetDrop: false,
      filesDrop: false,
      infoShow: true,
      serviceSelect: {title : 'Select', source : true, languages: [{source: [], target: []}]},
      sourceSelect: {lang : 'Select'},
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
      captchaValid : false,
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
      
      ]
    }
  },
  methods: {
    orderSlide() {
      this.infoSlide = !this.infoSlide
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
    changeServiceSelect(event) {
      this.serviceSelect = event;
      this.sourceSelect = {lang : 'Select'};
      if(!event.source) {
        this.sourceSelect = {lang: 'English (United Kingdom)'}
      }
    },
    changeIndustry(name) {
      this.industrySelect = this.industryList[name].text;
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
      if(event.dialects === undefined){
        this.sourceSelect = event;
        this.toggleSource();
      }

      if(event.dialects != undefined && !event.dialects.length){
        this.sourceSelect = event;
        this.toggleSource();
      }
      this.selectLangSource = event.lang;
      this.targetlang = ["Select"],
      this.targetSelect.forEach(item => {
        item.check = false
      })
      this.targetSelect = [];
    },
    changeTargetSelect(event) {
      this.selectLangTarget = '';
      const pos = this.targetSelect.indexOf(event);
      if(pos === -1){
        if(!event.dialects.length) {
          event.check = true;
          this.targetSelect.push(event);
        }
      }
      else{
        event.check = false;
        this.targetSelect.splice(pos,1);
      }    
      this.selectLangTarget = event.lang;
    },
    changeTargetDialect(event) {
      this.selectLangTarget = '';
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
      
      const pos = this.targetSelect.indexOf(event);
      if(pos === -1){
        if(!event.dialects.length) {
          event.check = true;
          this.targetSelect.push(event);
        }
      }
      else{
        event.check = false;
        this.targetSelect.splice(pos,1);
      }    
      this.selectLangTargetEnglish = event.lang;
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
    onVerify: function (response) {
      this.captchaValid = true;
      console.log('Verify: ' + response)
    },
    onExpired: function () {
      console.log('Expired')
    },
    formControl(){
      const check = this.checkForm();
        if(!check){
          return;
        }
        this.sendForm();
        this.clearForm();
    },
    showSuccess(){
      this.success = true;

      setTimeout(() => {
          this.success = !this.success
      }, 4000)
    },
    showError(){
      this.error = true;

      setTimeout(() => {
          this.error = !this.error
      }, 5000)
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
        sendForm.append("service", this.request.service);
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

        const result = await this.$axios.$post('request', sendForm);
    },
    async getServices() {
      const result = await this.$axios.$get('services')
      for (let i = 0; i < result.length; i++) {
        this.services.push(result[i])
      }
      //   else this.services[1].push(result[i])  
        
      // }
    },
    async getLanguages() {
      const result = await this.$axios.$get('languages')
      .then(response => {
        this.languages = response;
      })
      .catch(e => {
        this.errors.push(e)
      })

    },
    
    checkForm() {
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
      if(!this.request.contactEmail) {
        this.errors.push("Email required");
      };
      if(this.serviceSelect == 'Select' || this.industrySelect == 'Select' || (this.source == 'Select' && this.target == 'Select')) {
        this.errors.push("Please, fill the required fields (with red asterisk).")
      }
        else if(!this.validEmail(this.request.contactEmail)) {
        this.errors.push("Email should be like address@email.com");
      }
      if(!this.captchaValid) this.errors.push("captcha required");
      if(!this.errors.length){
        this.sendForm();
        this.clearForm();
        this.showSuccess()
      } else {
        this.showError()
      }
    },
    validEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }
  },
  computed: {
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
    VueRecaptcha
  },
  mounted(){
    this.getServices();
    this.getLanguages();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang='scss'>
@import '../assets/style.scss'

</style>
