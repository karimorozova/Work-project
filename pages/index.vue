<template lang='pug'>
  .container
    .successAlert(v-if="success")
      .successAlert__message
        p Thanks for your request.
        p We will answer you as soon as possible.
    .orderInfo(v-if='infoShow')
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
            span.choice &nbsp; {{ sourceSelect }}
          p Target: 
            span.choice &nbsp; {{ targetSelect }}
        .orderInfo__summary-industry
          span 3
          label INDUSTRY: 
          p.choice {{ industrySelect }}
        .orderInfo__summary-deadline
          label SUGGESTED DEADLINE
          p.choice {{ deadlineDate }}
    form.mainForm(@submit.prevent="checkForm")
      .number 
        span 1
        label.asterisk SERVICE TYPE      
      .service-type
        .select(v-on:click='showServices')
          span.inner-text.clarify(:class="{ color: serviceSelect != 'Select' }") {{ serviceSelect.title }}
            .icon(:class="{ reverse: serviceDrop }")
              i.fas.fa-caret-down
          .service-type__drop(v-if='serviceDrop')
            .service-type__drop-list(v-for='service of services')
              span.list-item(@click='changeServiceSelect(curService)' v-for='curService of service') {{ curService.title }}
      .number 
        span 2
        label.asterisk SELECT A LANGUAGE
      .language
        span(v-if='serviceSelect.source') Source Language
        .select.source(v-if='serviceSelect.source')
          span.inner-text.clarify(:class="{ color: sourceSelect != 'Select' }") {{ sourceSelect }}
            .wrapper(v-on:click.self='showSourceLang')
            .icon(:class="{ reverse: sourceDrop }")
              i.fas.fa-caret-down
          .source__drop(v-if='sourceDrop')
            .source__drop-list(v-for='(language, index) in languages')
              .pair(@click='changeSourceSelect($event, { show: true }, index)')
                img(:src="language.flag")
                span.list-item {{ language.lang }}
              .source__drop-list.dialect(v-if='language.dialects' :class="{ dialect_active : language == selectLang }")
                template(v-for='(dialect, dialectIndex) in language.dialects')
                  .pair.pair_dialect(@click='changeSourceDialect(index, dialectIndex)')
                    img(:src="dialect.flag")                  
                    span.list-item {{ dialect.lang }}
        span Target Language(s)
        .select.target
          span.inner-text.clarify(:class="{ color: targetSelect != 'Select' }") {{ targetSelect }}
            .wrapper(v-on:click.self='showTargetLang')
            .icon(:class="{ reverse: targetDrop }")
              i.fas.fa-caret-down
          .target__drop(v-if='targetDrop')
            .target__drop-list(v-for='(language, index) in languages')
              .pair(@click='changeTargetSelect($event, { show: true }, index)')
                img(:src="language.flag")
                span.list-item {{ language.lang }}
                  input.targetCheck(type="checkbox" v-if="!language.dialects" :checked="language.check")
              .source__drop-list.dialect(v-if='language.dialects' :class="{ dialect_active : language == selectLang }")
                template(v-for='(dialect, dialectIndex) in language.dialects')
                  .pair.pair_dialect(@click='changeTargetDialect(index, dialectIndex)')
                    img(:src="dialect.flag")                  
                    span.list-item {{ dialect.lang }}
                      input.targetCheck(type="checkbox" :checked="dialect.check")
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
              input(name="files" type="file")
            span.clarify Drag &amp; Drop
          .inner.buttons.upload-reference
            span Upload Reference File
            .upload-btn
              .upload-btn__txt Upload
              input(name="files" type="file")
            span.clarify Type Text
        .details__item
          .inner.date-file.deadline
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
        span.asterisk Enter the message <br> as it shown   
        .captcha__image
          img(src='#')
        input.buttons(type='submit' value='Submit')
      .warning(v-if="errors.length")
        p.message
          | Please, fill all the required fields (marked with red 
          span.asterisk asterisk
          | )
    //- .test
    //-   vue-transmit.col-12(tag='section', v-bind='options', upload-area-classes='bg-faded', ref='uploader')
    //-     .d-flex.align-items-center.justify-content-center.w-100(style='height:50vh; border-radius: 1rem;')
    //-       button.btn.btn-primary(@click='triggerBrowse') Upload Files
    //-     template(slot='files', slot-scope='props')
    //-       div(v-for='(file, i) in props.files', :key='file.id', :class="{'mt-5': i === 0}")
    //-         .media
    //-           img.img-fluid.d-flex.mr-3(:src='file.dataUrl')
    //-           .media-body
    //-             h3 {{ file.name }}
    //-             .progress(style='width: 50vw;')
    //-               .progress-bar.bg-success(:style="{width: file.upload.progress + '%'}")
    //-             pre.
    
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
// import Clock from './../components/Clock.vue';

export default {
  name: 'form',
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
      deadlineDate: '',
      serviceDrop:  false,
      sourceDrop: false,
      targetDrop: false,
      filesDrop: false,
      infoShow: true,
      serviceSelect: {title : 'Select', source : false},
      sourceSelect: 'Select',
      selectLang: '',
      targetlang: ["Select"],
      // targetSelect: ['Select'],
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
      error: '',
      success: false,
      services:[
        [
          { title: 'Translation', source: false },
          { title: 'Localization', source: false },
          { title: 'Proofing', source: false },
          { title: 'SEO Translation', source: false },
          { title: 'QA and Testing', source: false },
        ],
        [
          { title: 'Official Translation', source: true },
          { title: 'Graphic Localization', source: true },
          { title: 'Copywriting', source: true },
          { title: 'Blogging', source: true },
          { title: 'SEO Writing', source: true },
        ]
      ],
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
        {flag: require('../assets/images/flags/Afrikaans[AF].png'), lang: 'Afrikaans', check: false},
        {flag: require('../assets/images/flags/Arabic[AR].png'), lang: 'Arabic', 
        dialects:
        [ {flag: require('../assets/images/flags/Afrikaans[AF].png'), lang: 'Afrikaans', check: false},
          {flag: require('../assets/images/flags/Afrikaans[AF].png'), lang: 'Afrikaans', check: false},
          {flag: require('../assets/images/flags/Afrikaans[AF].png'), lang: 'Afrikaans', check: false}
        ]},
        {flag: require('../assets/images/flags/Armenian[HY].png'), lang: 'Armenian',
        dialects:
        [ {flag: require('../assets/images/flags/Afrikaans[AF].png'), lang: 'Afrikaans', check: false},
          {flag: require('../assets/images/flags/Afrikaans[AF].png'), lang: 'Afrikaans', check: false},
          {flag: require('../assets/images/flags/Afrikaans[AF].png'), lang: 'Afrikaans', check: false}
        ]},
        {flag: require('../assets/images/flags/Azerbaijani(Latin)[AZ-LN].png'), lang: 'Azerbaijani', check: false},
        {flag: require('../assets/images/flags/Bengali(India)[BN-IN].png'), lang: 'Bengali', check: false},
        {flag: require('../assets/images/flags/Bosnian[BS].png'), lang: 'Bosnian', check: false},
        {flag: require('../assets/images/flags/Bulgarian[BG].png'), lang: 'Bulgarian', check: false},
        {flag: require('../assets/images/flags/Afrikaans[AF].png'), lang: 'Afrikaans', check: false},
        {flag: require('../assets/images/flags/Arabic[AR].png'), lang: 'Arabic', check: false},
        {flag: require('../assets/images/flags/Armenian[HY].png'), lang: 'Armenian',
        dialects:
        [ {flag: require('../assets/images/flags/Afrikaans[AF].png'), lang: 'Afrikaans', check: false},
          {flag: require('../assets/images/flags/Afrikaans[AF].png'), lang: 'Afrikaans', check: false},
          {flag: require('../assets/images/flags/Afrikaans[AF].png'), lang: 'Afrikaans', check: false}
        ]},
        {flag: require('../assets/images/flags/Azerbaijani(Latin)[AZ-LN].png'), lang: 'Azerbaijani', check: false},
        {flag: require('../assets/images/flags/Bengali(India)[BN-IN].png'), lang: 'Bengali', check: false},
        {flag: require('../assets/images/flags/Bosnian[BS].png'), lang: 'Bosnian', check: false},
        {flag: require('../assets/images/flags/Bulgarian[BG].png'), lang: 'Bulgarian', check: false},
        {flag: require('../assets/images/flags/Afrikaans[AF].png'), lang: 'Afrikaans', check: false},
        {flag: require('../assets/images/flags/Arabic[AR].png'), lang: 'Arabic', check: false},
        {flag: require('../assets/images/flags/Armenian[HY].png'), lang: 'Armenian', check: false},
        {flag: require('../assets/images/flags/Azerbaijani(Latin)[AZ-LN].png'), lang: 'Azerbaijani', check: false},
        {flag: require('../assets/images/flags/Bengali(India)[BN-IN].png'), lang: 'Bengali', check: false},
        {flag: require('../assets/images/flags/Bosnian[BS].png'), lang: 'Bosnian', check: false},
        {flag: require('../assets/images/flags/Bulgarian[BG].png'), lang: 'Bulgarian', check: false},
        {flag: require('../assets/images/flags/Afrikaans[AF].png'), lang: 'Afrikaans',
        dialects:
        [ {flag: require('../assets/images/flags/Afrikaans[AF].png'), lang: 'Afrikaans', check: false},
          {flag: require('../assets/images/flags/Afrikaans[AF].png'), lang: 'Afrikaans', check: false},
          {flag: require('../assets/images/flags/Afrikaans[AF].png'), lang: 'Afrikaans', check: false}
        ]},
        {flag: require('../assets/images/flags/Arabic[AR].png'), lang: 'Arabic', check: false},
        {flag: require('../assets/images/flags/Armenian[HY].png'), lang: 'Armenian', check: false},
        {flag: require('../assets/images/flags/Azerbaijani(Latin)[AZ-LN].png'), lang: 'Azerbaijani', check: false},
        {flag: require('../assets/images/flags/Bengali(India)[BN-IN].png'), lang: 'Bengali', check: false},
        {flag: require('../assets/images/flags/Bosnian[BS].png'), lang: 'Bosnian', check: false},
        {flag: require('../assets/images/flags/Bulgarian[BG].png'), lang: 'Bulgarian', check: false},
        {flag: require('../assets/images/flags/Afrikaans[AF].png'), lang: 'Afrikaans', check: false},
        {flag: require('../assets/images/flags/Arabic[AR].png'), lang: 'Arabic', check: false},
        {flag: require('../assets/images/flags/Armenian[HY].png'), lang: 'Armenian', check: false},
        {flag: require('../assets/images/flags/Azerbaijani(Latin)[AZ-LN].png'), lang: 'Azerbaijani', check: false},
        {flag: require('../assets/images/flags/Bengali(India)[BN-IN].png'), lang: 'Bengali', check: false},
        {flag: require('../assets/images/flags/Bosnian[BS].png'), lang: 'Bosnian', check: false},
        {flag: require('../assets/images/flags/Bulgarian[BG].png'), lang: 'Bulgarian', check: false},
        {flag: require('../assets/images/flags/Afrikaans[AF].png'), lang: 'Afrikaans', check: false},
        {flag: require('../assets/images/flags/Arabic[AR].png'), lang: 'Arabic', check: false},
        {flag: require('../assets/images/flags/Armenian[HY].png'), lang: 'Armenian', check: false},
        {flag: require('../assets/images/flags/Azerbaijani(Latin)[AZ-LN].png'), lang: 'Azerbaijani', check: false},
        {flag: require('../assets/images/flags/Bengali(India)[BN-IN].png'), lang: 'Bengali', check: false},
        {flag: require('../assets/images/flags/Bosnian[BS].png'), lang: 'Bosnian', check: false},
        {flag: require('../assets/images/flags/Bulgarian[BG].png'), lang: 'Bulgarian', check: false},
      ]
    }
  },
  // filters: {
  //   json(value) {
  //     return JSON.stringify(value, null, 2)
  //   }
  // },
  methods: {
    // triggerBrowse() {
    //   this.$refs.uploader.triggerBrowseFiles()
    // },
    showServices() {
      this.toggleServices()
    },
    toggleServices() {
      this.serviceDrop = !this.serviceDrop;
    },
    changeServiceSelect(event) {
      console.log(event);
      this.serviceSelect = event;
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
    changeSourceSelect($event, { show } = { show: false}, index) {
      let dialect = this.languages[index];

      if(this.selectLang != dialect) {

        if(!dialect.dialects){
          this.sourceSelect = dialect.lang;
          this.selectLang = '';
          this.toggleSource()
        }
        else {
          this.selectLang = dialect;
        }
      } else {
        this.selectLang = ''
      }
    },
    changeSourceDialect(mainIndex, dialectIndex) {
      this.sourceSelect = this.languages[mainIndex].dialects[dialectIndex].lang
      this.selectLang = '';
      this.toggleSource();
    },
    changeTargetSelect($event, { show } = { show: false}, index) {
      let dialect = this.languages[index];

      if(this.selectLang != dialect) {

        if(!dialect.dialects){
          // this.targetSelect.push(dialect.lang);
          dialect.check = !dialect.check;
          this.selectLang = '';
          // this.toggleTarget()
        }
        else {
          this.selectLang = dialect;
          
        }
      } else {
        this.selectLang = ''
      }
    },
    changeTargetDialect(mainIndex, dialectIndex) {
      // this.targetSelect.push(this.languages[mainIndex].dialects[dialectIndex].lang)
      this.languages[mainIndex].dialects[dialectIndex].check = !this.languages[mainIndex].dialects[dialectIndex].check;
      this.selectLang = '';
      // this.toggleTarget();
    },

    openPicker () {
      this.$refs.programaticOpen.showCalendar()
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
      }, 4000)
    },
    clearForm() {
      this.request = [];
      this.deadlineDate = '',
      this.deadlineSelect = '',
      this.contactName = '',
      this.contactEmail ='',
      this.serviceSelect = {title : 'Select', source : false},
      this.industrySelect = 'Select',
      this.sourceSelect = 'Select',
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
      const result = await this.$axios.$post('http://localhost:3001/request', this.request )
      console.log(result)   
    },
    async getServices() {
      const result = await this.$axios.$get('http://localhost:3001/services')
      console.log(result)   
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
      if(!this.errors.length){
        this.sendForm();
        this.clearForm();
        this.showSuccess()
      }
    },
    validEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }
  },
  computed: {
    targetSelect() {
      let result = [];
      let arrayWithDialects = this.languages.filter(item => {
        if(item.dialects) { return item }
      });

      let filterArray = this.languages.filter(item => {
        return item.check == true
      });

      arrayWithDialects.map(item => {
        for(let i = 0; i < item.dialects.length; i++) {
          if(item.dialects[i].check == true) {
            filterArray.push(item.dialects[i]);
          }
        }
      });

      if (!filterArray.length) {
        result.push("Select")
      } else {
        filterArray.map(item => {
          result.push(item.lang)
        });
      }
      console.log(filterArray.toString())
      return result.join(", ");
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
    Datepicker
  },
  mounted(){
    this.getServices();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang='scss'>
@import '../assets/style.scss'

</style>
