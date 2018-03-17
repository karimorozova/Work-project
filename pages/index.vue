<template lang='pug'>
  .container
    .orderInfo(v-if='infoShow')
      .orderInfo__title
        h3 YOUR ORDER
      .orderInfo__summary
        .orderInfo__summary-service
          span 1
          label SERVICE: 
          p.choice {{ serviceSelect }}
        .orderInfo__summary-languages
          span 2
          label LANGUAGE:
          p Source:
            |&nbsp; {{ sourceSelect }}
          p Target: 
            |&nbsp; {{ targetSelect }}
        .orderInfo__summary-industry
          span 3
          label INDUSTRY: 
          p.choice {{ industrySelect }}
        .orderInfo__summary-deadline
          label SUGGESTED DEADLINE
          span.choice {{ deadlineSelect }}
    form.mainForm(@submit.prevent = 'sendForm')
      .number 
        span 1
        label.asterisk SERVICE TYPE      
      .service-type
        .select(v-on:click='showServices')
          span.inner-text.clarify(:class="{ color: serviceSelect != 'Select' }") {{ serviceSelect }}
            i.fas.fa-caret-down.icon(:class="{ reverse: serviceDrop == true }")
          .service-type__drop(v-if='serviceDrop')
            .service-type__drop-list(v-for='service of services')
              span.list-item(@click='changeServiceSelect' v-for='curService of service') {{ curService.value }}
      .number 
        span 2
        label.asterisk SELECT A LANGUAGE
      .language
        span Source Language
        .select.source(v-on:click='showSourceLang')
          span.inner-text.clarify(:class="{ color: sourceSelect != 'Select' }") {{ sourceSelect }}
            i.fas.fa-caret-down.icon
          .source__drop(v-if='sourceDrop')
            .source__drop-list(v-for='language in languages')
              .pair(@click='changeSourceSelect')
                img(src="../assets/images/flags/Afrikaans[AF].png")
                span.list-item {{ language.lang }}
        span Target Language(s)
        .select.target(v-on:click='showTargetLang')
          span.inner-text.clarify(:class="{ color: targetSelect != 'Select' }") {{ targetSelect }}
            i.fas.fa-caret-down.icon
          .target__drop(v-if='targetDrop')
            .target__drop-list(v-for='language in languages')
              .pair(@click='changeTargetSelect')
                img(src="../assets/images/flags/Bengali(India)[BN-IN].png")
                span.list-item {{ language.lang }}  
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
        .industry__item.other
          .image
          .image-white
          p Other
      //- .datepick
      //-   datepicker(placeholder="Select Date")
      .number
        span 4
        label PROJECT DETAILS
      .details
        .details__item
          .inner.buttons.upload-file
            span.asterisk Files
            button Upload File(s)
            span.clarify Drag &amp; Drop
          .inner.buttons.upload-reference
            span Upload Reference File
            button Upload
            span.clarify Type Text
        .details__item
          .inner.date-file.deadline
            span Suggested Deadline
            .calendar
              input#datepicker(type='text' placeholder="dd-mm-yyyy")
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
          .types 
            li(v-for='type in fileTypes') &#9679;{{ type }}
        .details__brief
          span.details__brief-title Enter a short brief
          textarea(rows='10')
      .number
        span 5
        label CONTACT DETAILS
      .contact
        .contact__col
          .contact__col-item.name
            span.asterisk Name
            input(type='text')
          .contact__col-item.email
            span.asterisk Email
            input(type='email')
          .contact__col-item.phone
            span Phone Number
            input(type='text')
        .contact__col
          .contact__col-item.skype
            span Skype Name
            input(type='text')
          .contact__col-item.company
            span Company Name
            input(type='email')
          .contact__col-item.website
            span Website
            input(type='text')
      .captcha
        span.asterisk Enter the message <br> as it shown   
        .captcha__image
          img(src='#')
        input.buttons(type='submit' value='Submit')
</template>

<script>
import ClickOutside from 'vue-click-outside';
import Datepicker from 'vuejs-datepicker';
export default {
  name: 'form',
  data () {
    return {
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
        }
      },
      serviceDrop:  false,
      sourceDrop: false,
      targetDrop: false,
      filesDrop: false,
      infoShow: true,
      serviceSelect: 'Select',
      sourceSelect: 'Select',
      targetSelect: 'Select',
      industrySelect: 'Select',
      deadlineSelect: '',
      services:[
        [
          { value: 'Translation' },
          { value: 'Localization' },
          { value: 'Proofing' },
          { value: 'SEO Translation' },
          { value: 'QA and Testing' },
        ],
        [
          { value: 'Official Translation' },
          { value: 'Graphic Localization' },
          { value: 'Copywriting' },
          { value: 'Blogging' },
          { value: 'SEO Writing' },
        ]
      ],
      fileTypes: [
        'Microsoft Office (doc, docx, xls, xlsx, xlsm, ppt, pptx)',
        'pdf (returns plain text)',
        'xhtml, xht', 'dita', 'Microsoft Visio (vdx)',
        'sdf', 'xlf, xliff, sdlxliff', 'asp, aspx',
        'Open Office (sxw, odt, ods, odp)', 'svg',
        'Trados (ttx)', 'txt', 'Adobe FrameMaker (mif)',
        'yml, yaml', 'Java property files', 'tpl',
        'Adobe InDesign (idml)', 'iPhone apps (strings)', 'html, htm',
        'resx', 'Adobe Illustrator (fxg & svg)', 'php',
        'rtf', 'ini', 'Wordfast (txml)'
      ],
      languages: [
        {flag: '../assets/images/flags/Afrikaans[AF].png', lang: 'Afrikaans'},
        {flag: '../assets/images/flags/Arabic[AR].png', lang: 'Arabic'},
        {flag: '../assets/images/flags/Armenian[HY].png', lang: 'Armenian'},
        {flag: '../assets/images/flags/Azerbaijani(Latin)[AZ-LN].png', lang: 'Azerbaijani'},
        {flag: '../assets/images/flags/Bengali(India)[BN-IN].png', lang: 'Bengali'},
        {flag: '../assets/images/flags/Bosnian[BS].png', lang: 'Bosnian'},
        {flag: '../assets/images/flags/Bulgarian[BG].png', lang: 'Bulgarian'},
        {flag: '../assets/images/flags/Africaans[AF].png', lang: 'Afrikaans'},
        {flag: '../assets/images/flags/Chinese(HongKong)[ZH-HK].png', lang: 'Chinese Simpl'},
        {flag: '../assets/images/flags/Africaans[AF].png', lang: 'Afrikaans'},
        {flag: '../assets/images/flags/Arabic[AR].png', lang: 'Arabic'},
        {flag: '../assets/images/flags/Armenian[HY].png', lang: 'Armenian'},
        {flag: '../assets/images/flags/Azerbaijani(Latin)[AZ-LN].png', lang: 'Azerbaijani'},
        {flag: '../assets/images/flags/Bengali(India)[BN-IN].png', lang: 'Bengali'},
        {flag: '../assets/images/flags/Bosnian[BS].png', lang: 'Bosnian'},
        {flag: '../assets/images/flags/Bulgarian[BG].png', lang: 'Bulgarian'},
        {flag: '../assets/images/flags/Africaans[AF].png', lang: 'Afrikaans'},
        {flag: '../assets/images/flags/Chinese(HongKong)[ZH-HK].png', lang: 'Chinese Simpl'},
        {flag: '../assets/images/flags/Africaans[AF].png', lang: 'Afrikaans'},
        {flag: '../assets/images/flags/Arabic[AR].png', lang: 'Arabic'},
        {flag: '../assets/images/flags/Armenian[HY].png', lang: 'Armenian'},
        {flag: '../assets/images/flags/Azerbaijani(Latin)[AZ-LN].png', lang: 'Azerbaijani'},
        {flag: '../assets/images/flags/Bengali(India)[BN-IN].png', lang: 'Bengali'},
        {flag: '../assets/images/flags/Bosnian[BS].png', lang: 'Bosnian'},
        {flag: '../assets/images/flags/Bulgarian[BG].png', lang: 'Bulgarian'},
        {flag: '../assets/images/flags/Africaans[AF].png', lang: 'Afrikaans'},
        {flag: '../assets/images/flags/Chinese(HongKong)[ZH-HK].png', lang: 'Chinese Simpl'},
        {flag: '../assets/images/flags/Africaans[AF].png', lang: 'Afrikaans'},
        {flag: '../assets/images/flags/Arabic[AR].png', lang: 'Arabic'},
        {flag: '../assets/images/flags/Armenian[HY].png', lang: 'Armenian'},
        {flag: '../assets/images/flags/Azerbaijani(Latin)[AZ-LN].png', lang: 'Azerbaijani'},
        {flag: '../assets/images/flags/Bengali(India)[BN-IN].png', lang: 'Bengali'},
        {flag: '../assets/images/flags/Bosnian[BS].png', lang: 'Bosnian'},
        {flag: '../assets/images/flags/Bulgarian[BG].png', lang: 'Bulgarian'},
        {flag: '../assets/images/flags/Africaans[AF].png', lang: 'Afrikaans'},
        {flag: '../assets/images/flags/Chinese(HongKong)[ZH-HK].png', lang: 'Chinese Simpl'},
        {flag: '../assets/images/flags/Africaans[AF].png', lang: 'Afrikaans'},
        {flag: '../assets/images/flags/Arabic[AR].png', lang: 'Arabic'},
        {flag: '../assets/images/flags/Armenian[HY].png', lang: 'Armenian'},
        {flag: '../assets/images/flags/Azerbaijani(Latin)[AZ-LN].png', lang: 'Azerbaijani'},
        {flag: '../assets/images/flags/Bengali(India)[BN-IN].png', lang: 'Bengali'},
        {flag: '../assets/images/flags/Bosnian[BS].png', lang: 'Bosnian'},
        {flag: '../assets/images/flags/Bulgarian[BG].png', lang: 'Bulgarian'},
        {flag: '../assets/images/flags/Africaans[AF].png', lang: 'Afrikaans'},
        {flag: '../assets/images/flags/Chinese(HongKong)[ZH-HK].png', lang: 'Chinese Simpl'},      
      ]
    }
  },
  methods: {
    showServices() {
      this.toggleServices()
    },
    toggleServices() {
      this.serviceDrop = !this.serviceDrop;
    },
    changeServiceSelect(event) {
      this.serviceSelect = event.target.textContent;
    },
    changeIndustry(name) {
      this.industrySelect = this.industryList[name].text;
      console.log(event)
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
      this.sourceSelect = event.target.textContent;
    },
    changeTargetSelect(event) {
      this.targetSelect = event.target.textContent;
    }
  },

  directives: {
    ClickOutside
  },
  components: {
    Datepicker
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang='scss'>
  .container {
    position: relative;
    color: #66563D;
    font-family: MyriadPro;
    width: 50%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px 40px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    .orderInfo {
      padding-bottom: 20px;
      border: 1px solid #66563D;
      border-radius: 15px;
      position: fixed;
      top: 7px;
      right: 20px;
      width: 250px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      &__title {
        width: 100%;
        font-size: 22px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.2);
        h3 {
          margin-bottom: 5px;
          margin-top: 15px;
          text-align: center;
        }
      }
      &__summary {
        p {
          padding-left: 20px;
        }
        .choice {
          margin-top: 5px;
        }
        span {
          font-size: 30px;
          padding-right: 5px;
        }
        label {
          font-size: 18px;
          font-family: MyriadBold;
        }        
      }
    }
  }
  form {
    width: 100%;
    max-width: 660px;
  }
  .select {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 30px;
    border-radius: 8px;
    background: transparent;
    padding-top: 10px;
    padding-bottom: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
    cursor: default;
    &:hover {
      box-shadow: 0 3px 15px rgba(0, 0, 0, 0.5);
    }
    .inner-text {
      padding-left:10px;
      display: flex;
      justify-content: space-between;
    }
    .icon {
      padding-right: 15px;
      font-size: 20px;
    }
    .reverse {
      transform: rotate(180deg);
      padding-right: 0;
      padding-left: 15px;
    }
  }
  label {
    margin-bottom: 20px;
  }
  .language {
    display: flex;
    flex-direction: column;
    padding-top: 20px;
    .source {
      max-height: 359px;
      &__drop {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        margin-top: 15px;
        padding-top: 15px;
        padding-left: 10px;
        padding-right: 10px;
        border-top: 1px solid rgba(0,0,0,0.3);      
        .pair {
          padding: 2px;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s;
          img {
            width: 23px;
          }
          &:hover {
            box-shadow: 0px 0 15px rgba(102, 86, 61, 0.3);
            border-radius: 5px;
            span {
              transition: all 0.4s;
              transform: translateX(3px);
            }     
          }
        }        
      }
    }
    .target {
       max-height: 359px;
      &__drop {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        margin-top: 15px;
        padding-top: 15px;
        padding-left: 10px;
        padding-right: 10px;
        border-top: 1px solid rgba(0,0,0,0.3);      
        .pair {
          padding: 2px;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s;
          img {
            width: 23px;
          }
          &:hover {
            box-shadow: 0px 0 15px rgba(102, 86, 61, 0.3);
            border-radius: 5px;
            span {
              transition: all 0.4s;
              transform: translateX(3px);
            }     
          }
        }        
      }     
    }
  }
  .service-type {
    padding-top: 20px;
    &__drop {
      display: flex;
      justify-content: space-around;
      border-top: 1px solid rgba(0,0,0,0.3);
      &-list {
        width: 45%;
        display: flex;
        flex-direction: column;
        padding: 20px 5px 10px;     
      }
      .list-item {
        border: 1px solid #66563D;
        border-radius: 5px;
        padding: 5px;
        cursor: pointer;
        &:hover {
          background-color: #66563D;
          color: white; 
        }
      }
    }
  }

  .industry {
    padding-top: 20px;
    padding-bottom: 30px;   
    display: flex;
    flex-wrap: wrap;
    .other {
      padding-top: 10px;
      padding-bottom: 10px;
    }
    &__item {
      position: relative;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      border: 1px solid black;
      border-radius: 10px;
      width: 29%;
      padding: 2px;
      padding-left: 10px;
      margin: 5px;
      cursor: pointer;
      .image {
        width: 50px;
        height: 50px;
        background-image: url('../assets/images/Legal.png');
        background-size: contain;
        background-position: center; 
        background-repeat: no-repeat;
      }
      .image-white {
        position: absolute;
        z-index: -1;
        width: 50px;
        height: 50px;
        background-image: url('../assets/images/Legal-white.png');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center; 
      }
      p {
        padding-top: 5px;
        padding-left: 10px;
      }
      &:hover {
        background-color: #66563D;
        color: white;
        .image-white {
          z-index: 1;
        }
      } 
    }
    .more {
      padding-top: 10px;
      padding-bottom:10px;
    }
  }

  .details {
    padding-top: 20px;
    padding-bottom: 30px;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    position: relative;
    &__files-list {
      position: absolute;
      top: -23px;
      right: -6px;;
      background-color: white;
      width: 49%;
      display: flex;
      flex-direction: column;
      border-radius: 10px;
      box-shadow: 0 0px 15px rgba(0, 0, 0, 0.5);
      padding: 15px;
      .title {
        display: flex;
        justify-content: center;
        label {
          margin-bottom: 0;
          padding-top: 10px;
        }
      }
      .types {
        padding-top: 15px;
        display: flex;
        flex-wrap: wrap;
        li {
          list-style: none;
          padding-left: 10px;
        }
      }
    }
    &__item {
      display: flex;
      flex-direction: column;      
      padding: 20px 40px;
      .inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 20px;
        padding-bottom: 20px;
        span {
          font-size: 12px;
        }
        .supported {
          display: flex;
          justify-content: center;
          align-items: center;
          &__icons {
            display: flex;
            width: 100%;
            padding-left: 50px;
            img {
              width: 18px;
              height: 18px;
              padding-left: 3px;
            }
            .filesLink {
              cursor: pointer;
              text-decoration: underline;
              padding-left: 15px;
              font-size: 12px;
              padding-top: 6px;
            }
          }
        }
      }
      .deadline {
        padding-top: 0;
        padding-bottom: 42px;
        .calendar {
          display: flex;
          align-items: center;
          img {
            padding-left: 5px;
            width: 20px;
            height: 20px;;
          }
          input {
            border-radius: 10px;
            padding: 9px;
            width: 150px;
            margin-left: 20px;
          }
        }
      }
      .buttons {
        button {
          background-color: #FF876C;
          color: white;
          width: 180px;
          padding: 10px;
          border-radius: 10px;
        }
      }
    }
    .details__brief {
      width: 100%;
      textarea {
        width: 100%;
      }
    }
  }

  .contact {
    padding-top: 20px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    &__col {
      width: 40%;
      display: flex;
      flex-direction: column;
      padding-top: 20px;
      padding-bottom: 20px;
      &-item {
        display: flex;
        flex-direction: column;
        padding: 10px;
        input {
          border-radius: 10px;
          padding: 10px 5px;
        }
      }
    }
  }

  .number {
    position: relative;
    span {
      position: absolute;
      left: -4%;
      top: -14%;
      font-size: 28px;
    }
    label {
      font-size: 22px;
    }
  }

  .image {
    .legal & {
      background-image: url('../assets/images/Legal.png');
    }
    .hotel & {
      background-image: url('../assets/images/hotel.png');      
    }
    .trading & {
      background-image: url('../assets/images/CFDs-Online-Trading.png');      
    }
    .crypto & {
      background-image: url('../assets/images/Cryptocurrency.png');      
    }
    .casino & {
      background-image: url('../assets/images/casino-poker-igaming.png');      
    }
    .games & {
      background-image: url('../assets/images/Video-Games.png');      
    }
    .other & {
      background-image: url('../assets/images/Other.png');      
    }
  }
  .image-white {
    .legal & {    
      background-image: url('../assets/images/Legal-white.png');
    }
    .hotel & {
      background-image: url('../assets/images/hotel-white.png');      
    }
    .trading & {
      background-image: url('../assets/images/CFDs-Online-Trading-white.png');      
    }
    .crypto & {
      background-image: url('../assets/images/Cryptocurrency-white.png');      
    }
    .casino & {
      background-image: url('../assets/images/casino-poker-igaming-white.png');      
    }
    .games & {
      background-image: url('../assets/images/Video-Games-white.png'); 
    }
    .other & {
      background-image: url('../assets/images/Other-white.png');      
    }
  }

  .activeIndustry {
    background-color: #66563D;
    color: white;
    .image-white {
      z-index: 1;
    }
  }

  .captcha {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    input {
          background-color: #FF876C;
          color: white;
          padding: 10px;
          border-radius: 10px;
        }
  }
  
  .asterisk {
    &:after {
      content: '*';
      color: #F00;
    }
  }

  span {
    font-size: 12px;
  }

  .clarify {
    color: #66563D;
    opacity: 0.38;
    font-size: 14px;
    .icon {
      opacity: 1;
    }
  }

  .color{
    opacity: 1;
  }

  // .icon-reverse {
  //   transform: rotate(180deg);
  //   padding-right: 0;
  //   padding-left: 15px;
  // }

  @font-face {
    font-family: MyriadPro;
    src: url('../assets/fonts/MyriadPro-Regular.otf');
  }
  @font-face {
    font-family: MyriadBold;
    src: url('../assets/fonts/MyriadPro-Bold.otf')
  }
</style>
