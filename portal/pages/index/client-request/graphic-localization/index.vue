<template lang="pug">
  .mainWrapper(v-if="true")
    .container(v-if="!thanks")
      .slideInInfo(@click="orderSlide" :class="{positionChange: infoSlide}") Your Order
      .successAlert(v-if="success")
        .successAlert__message
          p Thanks for your request.
          p We will answer you as soon as possible.
      form.mainForm(ref="myForm" @submit.prevent="checkForm")
        .number.projName
          .projName__project
            label.asterisk PROJECT NAME:
            input(type="text" v-model="projectName" value="projectName" maxlength="50" placeholder='50 characters maximum')
          .projName__date.deadline
            label.asterisk SUGGESTED DEADLINE:
            .calendar
              datepicker(ref="programaticOpen" placeholder='dd-mm-yyyy' :format='format' v-model='deadlineSelect' monday-first=true :highlighted='state.highlighted' :disabled='state.disabled')
              .datepick(@click='openPicker')
                img(src='../../../../assets/images/calendar.png')
        .number
          label.asterisk SELECT A LANGUAGE
        .language(v-click-outside="outsideLangs")
          .lang-source
            span.langTitle Source Language
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
            span.langTitle Target Language(s)
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
              span.clarify Drag &amp; Drop
              .loadedList
                li.loadedList__item(v-if="refFiles.name" @click="refRemove(file)") {{ refFiles.name }}
                  i.fa.fa-times.deleteIcon
            //- .inner.date-file.deadline
            //-   span Suggested Deadline
            //-   .calendar
            //-     datepicker(ref="programaticOpen" placeholder='dd-mm-yyyy' :format='format' v-model='deadlineSelect' monday-first=true :highlighted='state.highlighted' :disabled='state.disabled')
            //-     .datepick(@click='openPicker')
            //-         img(src='../../../../assets/images/calendar.png')
            //-   span.clarify Select
          .details__brief
            span.details__brief-title Enter a short brief
            textarea(rows='4' v-model='brief') {{ brief }}
          .details__quote
            .send(:class="{optionChecked: sendOption}" @click="chooseBegin")
              .send__check
                .checker(:class="{checkerChecked: sendOption}")
              .send__text
                p.head Send a Quote
                p.innerText I approve for the project to begin immediately and I'll review the quote later.
            .start(:class="{optionChecked: startOption}" @click="chooseStart")
              .start__check
                .checker(:class="{checkerChecked: startOption}")
              .start__text
                p.head Start Immediately
                p.innerText I approve for the project to begin immediately and to receive the quote just for reference.
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
            span.choice &nbsp; {{ sourceSelect.name }}
              template(v-if="!sourceSelect.name") &nbsp;Select
          p Target:
            span.choice &nbsp;
              template(v-if="targetSelect.length > 0" v-for="language of targetSelect") {{ language.name }};
              template(v-if="targetSelect.length == 0") Select
        .orderInfo__summary-industry
          span 3
          label INDUSTRY:
          p.choice {{ industry }}
        .orderInfo__summary-deadline
          label SUGGESTED DEADLINE
          p.choice {{ deadlineDate }}
</template>

<script>

  import moment from 'moment';
  import ClickOutside from 'vue-click-outside';
  import Datepicker from '~/components/Datepicker.vue';
  import { Drag, Drop } from 'vue-drag-drop';

  export default {
    name: 'client-form',
    props: {
      thanks: {
        type: Boolean,
        default: false
      }
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
        clientLanguages: [
        ],
        languages: [],
        xtmProjects: []
      }
    },
    methods: {
      thankProof(data) {
        this.$emit('thankProof', data);
      },
      thankCopy(data){
        this.$emit('thankCopy', data);
      },
      thankMark(data){
        this.$emit('thankMark', data);
      },
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
          item.check = false
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
        sendForm.append("status", "Requested");
        sendForm.append("sourceLanguage", JSON.stringify(this.request.sourceLanguage));
        sendForm.append("targetLanguages", JSON.stringify(this.request.targetLanguages));
        sendForm.append("web", this.request.web);
        sendForm.append("skype", this.request.skype);
        sendForm.append("phone", this.request.phone);
        sendForm.append("companyName", this.request.companyName);
        sendForm.append("accountManager", "None selected");
        sendForm.append("brief", this.request.brief);
        sendForm.append("createdAt", this.request.createdAt);
        sendForm.append("dateFormatted", moment(this.request.createdAt).format('YYYY MM DD'));
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

        /////////////////////////////////////
        //Start Comment because of XTM testing
        // if(this.sendOption) {
        //   const result = await this.$axios.$post('api/request', sendForm);
        // }
        // if(this.startOption) {
        //   const result = await this.$axios.$post('api/project-request', sendForm);
        // }
        //End Comment because of XTM testing
        ////////////////////////////////////

        const result = await this.$axios.$post('/portal/request', sendForm);
        console.log(result);
        this.xtmProjects = result;
        this.clearForm();
      },
      getServices() {
        this.services = this.$store.state.services;

      },
      getClientLanguages() {
        this.clientLanguages = this.$store.state.clientLanguages;
      },

      async checkForm(event) {
        this.request = {
          projectName: this.projectName,
          date: this.deadlineSelect,
          contactName: this.$store.state.clientInfo.name,
          contactEmail: this.$store.state.clientInfo.email,
          service: this.$store.state.clientInfo.service,
          industry: this.$store.state.clientInfo.industry,
          status: 'Requested',
          sourceLanguage: this.sourceSelect,
          targetLanguages: this.targetSelect,
          web: this.$store.state.clientInfo.web,
          skype: this.$store.state.clientInfo.skype,
          phone: this.$store.state.clientInfo.phone,
          companyName: this.$store.state.clientInfo.companyName,
          accountManager: "None selected",
          brief: this.brief,
          files: this.files,
          createdAt: new Date()
        };

        this.errors = [];
        if(!this.request.projectName) this.errors.push("Project name required!");
        if(!this.request.targetLanguages.length) this.errors.push("Target language(s) required!");
        if(!this.deadlineSelect) this.errors.push("Deadline required!");
        if(!this.detailFiles.length) this. errors.push("File(s) required!");

        if(!this.errors.length){
          this.sendForm();
          console.log("sent")
          var requestType = "QUOTE";
          if(!this.sendOption) requestType = "PROJECT";
          this.$store.dispatch('loadOrderDetails', this.request);
          this.$store.dispatch('files', this.detailFiles);
          this.$store.dispatch('referFiles', this.refFiles);
          this.$store.dispatch('requestType', requestType);
          this.$emit('thankYou', this.request.service);
          // window.top.location.href = "https://www.pangea.global/thank-you";
        } else {
          this.showError();
          event.preventDefault();
        }
      },
      async getLanguages() {
        let result = await this.$axios.$get('/api/languages');
        this.languages = result;
      },
    },
    computed: {
      sourceLanguages() {
        let result = [];
        if(this.clientLanguages.length) {
          for(let i = 0; i < this.clientLanguages.length; i++) {
            if (this.clientLanguages[i].source) {
              result.push({name: this.clientLanguages[i].source.lang, lang: this.clientLanguages[i].source.lang, symbol: this.clientLanguages[i].source.symbol, id: this.clientLanguages[i].source.id, xtrf: this.clientLanguages[i].source.id, check: false})
            }
          }
        }
        result = result.filter((obj, pos, arr) => {
          return arr.map( mapObj => mapObj.name).indexOf(obj.name) === pos;
        });

        if(this.languages.length) {
          for(let lang of this.languages) {
            for(let elem of result) {
              if(lang.symbol == elem.symbol) {
                elem.icon = lang.icon;
                elem.xtm = lang.xtm;
              }
            }
          }
        }

        return result.sort((a, b) => {
          if (a.name < b.name) return -1;
          if (a.name > b.name) return 1;
        });
      },
      targetLanguages() {
        let result = [];
        if(this.clientLanguages.length) {
          for(let i = 0; i < this.clientLanguages.length; i++) {
            if (this.clientLanguages[i].source) {
              if (this.clientLanguages[i].source.lang == this.sourceSelect.name) {
                result.push({name: this.clientLanguages[i].target.lang, lang: this.clientLanguages[i].target.lang, symbol: this.clientLanguages[i].target.symbol, id: this.clientLanguages[i].target.id, xtrf: this.clientLanguages[i].target.id, check: false});
              }
            }

          }
        }
        result = result.filter((obj, pos, arr) => {
          return arr.map( mapObj => mapObj.name).indexOf(obj.name) === pos;
        });
        result = result.filter(item => {
          return item.name != this.sourceSelect.name;
        })

        if(this.languages.length) {
          for(let lang of this.languages) {
            for(let elem of result) {
              if(lang.symbol == elem.symbol) {
                elem.icon = lang.icon;
                elem.xtm = lang.xtm;
              }
            }
          }
        }

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
      Drop
    },
    mounted(){
      this.getServices();
      this.getClientLanguages();
      this.getLanguages();

    }
  }

</script>

<style lang='scss'>
  @keyframes blink {
    50% { border-color: #ff0000; }
  }

  body {
    margin: 0;
  }

  .top {
    display: flex;
    flex-direction: column;
  }

  .mainWrapper {
    position: relative;
    padding: 0;
    margin: 0 auto;
    max-width: 1320px;
    display: flex;
    align-items: flex-start;
    @media (max-width: 1024px) {
      max-width: 100%;
      min-width: 100%;
    }
    @media (max-width: 767px) {
      margin: 0;
      min-width: 100%;
    }
    .orderInfo {
      font-family: MyriadPro;
      color: #66563D;
      transition: all 0.7s;
      @media (max-width: 1024px) {
        margin-left: 0;
      }
      @media (max-width: 1023px) {
        display: none;
      }
      margin-left: 30px;
      padding-bottom: 20px;
      border: 1px solid;
      border-radius: 15px;
      position: sticky;
      top: calc(6vh + 7px);
      right: 20px;
      width: 250px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      &__title {
        width: 100%;
        border-bottom: 1px solid rgba(0, 0, 0, 0.2);
        h3 {
          font-size: 22px;
          margin-bottom: 5px;
          margin-top: 15px;
          text-align: center;
          font-weight: normal;
        }
      }
      &__summary {
        padding: 10px 20px 0;
        p {
          padding-left: 20px;
        }
        span {
          font-size: 30px;
          padding-right: 5px;
          font-family: MyriadBold;
        }
        label {
          font-size: 18px;
          font-family: MyriadBold;
        }
        .choice {
          margin-top: 5px;
          color: #D15F45;
          font-family: MyriadPro;
        }
        &-languages {
          p {
            .choice {
              font-size: 16px;
              color: #D15F45;
            }
          }
        }
        &-deadline {
          p {
            .choice {
              font-size: 16px;
              color: #D15F45;
            }
          }
        }
      }
    }
    .slideToShow {
      @media (max-width: 1023px) {
        transition: all 1s;
        display: flex;
        transform: translateX(0);
        background-color: white;
        position: fixed;
        right: 3px;
        top: 68px;
        z-index: 5;
      }
    }
  }
  .container {
    margin-bottom: 45px;
    .slideInInfo {
      display: none;
      @media (max-width: 1023px) {
        display: block;
      }
      font-size: 16px;
      font-weight: 700;
      transition: all 1s;
      position: fixed;;
      top: 38px;
      right: -27px;
      border: 1px solid #D15F45;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      padding: 5px;
      transform: rotate(-90deg);
      -webkit-transform-origin: 1;
      z-index: 10;
      background: #D15F45;
      color: white;
      cursor: pointer;
    }
    .positionChange {
      transform: rotate(0);
      transform: translateX(-26px);
    }
    position: relative;
    color: #66563D;
    font-family: MyriadPro;
    margin-left: 20%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px 40px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    border-radius: 15px;
    @media (max-width: 1320px) {
      margin-left: 3%;
      width: 55%;
    }
    @media (max-width: 1070px) {
      margin: 5px;
      justify-content: flex-start;
      align-items: flex-start;
    }
    @media (max-width: 1024px) {
      width: 65%;
    }
    @media (max-width: 868px) {
      width: 80%;
    }
    .successAlert {
      position: fixed;
      top: 5px;
      padding: 20px;
      width: 400px;
      background-color: #96f7c2;
      border-radius: 10px;
      z-index: 5;
      text-align: center;
      font-size: 18px;
      box-shadow: 0 0 25px rgba(0, 0, 0, 0.7);
      @media (max-width: 1070px) {
        left: 20%;
        z-index: 11;
      }
      p {
        margin-top: 3px;
        margin-bottom: 3px;
      }
    }
  }
  form {
    width: 100%;
    max-width: 520px;
    position: relative;
  }
  .selectLangs {
    position: absolute;
    z-index: 10;
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 30px;
    border-radius: 12px;
    background: transparent;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
    margin-top: 4px;
    cursor: default;
    &:hover {
      box-shadow: 0 3px 15px rgba(0, 0, 0, 0.5);
    }
    .inner-text {
      padding-left:10px;
      padding-top: 10px;
      padding-bottom: 10px;
      display: flex;
      justify-content: space-between;
      min-height: 24px;
      align-items: center;
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
    justify-content: space-between;
    margin-top: 10px;
    padding-left: 10px;
    margin-bottom: 90px;
    span {
      padding-bottom: 5px;
    }
    .lang-source {
      width: 48%;
      position: relative;
    }
    .lang-target {
      width: 48%;
      position: relative;
    }
    .source {
      max-height: 430px;
      .inner-text {
        position: relative;
      }
      &__drop {
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        padding-top: 15px;
        padding-left: 10px;
        padding-right: 10px;
        border-top: 1px solid rgba(0,0,0,0.3);
        position: relative;
        max-height: 169px;
        overflow-y: auto;
        background-color: white;
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
        .dialect {
          padding-left: 18px;
          position: absolute;
          opacity: 0;
          transform: translateY(-50px);
          transition: all .3s;
          z-index: -5;
          &_active{
            position: static;
            opacity: 1;
            transform: translateY(0px);
          }
        }
        .dialect-on-hover{
          transition: all .5s;
          transform: translateY(-50px);
          opacity: 0;
          position: absolute;
        }
        .pair {
          padding: 2px;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          .list-item {
            font-size: 14px;
            padding-top: 2px;
            padding-bottom: 0;
          }
          &_dialect {
            &:before, &:after {
              content: "";
              display: block;
              position: absolute;
              background-color: #66563D;
              left: -8px;
            }
            &:before {
              width: 10px;
              height: 1px;
              top: 10px;
            }
            &:after {
              width: 1px;
              height: 11px;
              top: 0;
            }
          }
          img {
            width: 23px;
            margin-right: 3px;
          }
          .openIcon {
            width: 8px;
            padding-left: 5px;
          }
          .reverseOpenIcon {
            transform: rotate(180deg);
            padding-left: 0;
            padding-right: 5px;
          }
          &:hover {
            box-shadow: 0px 0 15px rgba(102, 86, 61, 0.3);
            border-radius: 5px;
            span {
              transition: all 0.4s;
              transform: translateX(3px);
              color: #AAA39B;
            }
          }

        }
      }
    }
    .target {
      max-height: 430px;
      .inner-text {
        position: relative;
      }
      &__drop {
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        padding: 15px 10px 0;
        border-top: 1px solid rgba(0,0,0,0.3);
        max-height: 169px;
        overflow-y: auto;
        background-color: white;
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
        .dialect {
          padding-left: 18px;
          position: absolute;
          opacity: 0;
          transform: translateY(-50px);
          transition: all .3s;
          z-index: -5;
          &_active{
            position: static;
            opacity: 1;
            transform: translateY(0px);
          }
        }
        .dialect-on-hover{
          transition: all .5s;
          transform: translateY(-50px);
          opacity: 0;
          position: absolute;
        }
        .pair {
          padding: 2px;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          .list-item {
            font-size: 14px;
            padding-top: 2px;
            padding-bottom: 0;
          }
          &_dialect {

            &:before, &:after {
              content: "";
              display: block;
              position: absolute;
              background-color: #66563D;
              left: -8px;
            }
            &:before {
              width: 10px;
              height: 1px;
              top: 10px;
            }
            &:after {
              width: 1px;
              height: 11px;
              top: 0;
            }
          }
          img {
            width: 23px;
            margin-right: 3px;
          }
          .openIcon {
            width: 8px;
            padding-left: 5px;
          }
          .reverseOpenIcon {
            transform: rotate(180deg);
            padding-left: 0;
            padding-right: 5px;
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
        max-height: 150px;
        flex-wrap: wrap;
        width: 100%;
        padding: 15px 10px;
      }
      .list-item {
        border: 1px solid #66563D;
        border-radius: 5px;
        padding: 5px;
        margin: 0 6px;
        width: 46%;
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
      border: 1px solid #66563D;
      border-radius: 10px;
      width: 29%;
      padding: 2px;
      padding-left: 10px;
      margin: 5px;
      cursor: pointer;
      .image {
        width: 50px;
        height: 50px;
        background-image: url('../../../../assets/images/Legal.png');
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
      }
      .image-white {
        position: absolute;
        z-index: -1;
        width: 50px;
        height: 50px;
        background-image: url('../../../../assets/images/Legal-white.png');
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
    padding-bottom: 30px;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    position: relative;
    span {
      padding: 5px 0;
    }
    &__files-list {
      position: absolute;
      top: -23px;
      right: -36px;;
      background-color: white;
      width: 70%;
      display: flex;
      flex-direction: column;
      border-radius: 10px;
      box-shadow: 0 0px 15px rgba(0, 0, 0, 0.5);
      padding: 15px;
      .title {
        display: flex;
        justify-content: center;
        label {
          font-size: 22px;
          margin-bottom: 0;
          padding-top: 10px;
        }
        .close {
          position: absolute;
          right: 16px;
          font-size: 22px;
          cursor: pointer;
        }
      }
      .types {
        display: flex;
        flex-wrap: wrap;
        flex-direction: column;
        z-index: 2;
        &__sector {
          display: flex;
          flex-direction: column;
          flex-wrap: wrap;
          .fileTypeTitle {
            margin-top: 0;
            margin-bottom: 0;
            padding: 5px 0;
            font-size: 18px;
            font-family: MyriadBold;
          }
          .list {
            display: flex;
            flex-wrap: wrap;
          }
        }
        li {
          text-shadow: none;
          list-style: none;
          .dot {
            padding-bottom: 3px;
          }
          .type-text {
            font-size: 18px;
            padding-left: 2px;
            padding-right: 8px;
            @media (max-width: 450px) {
              font-size: 14px;
            }
          }
        }
      }
    }

    &__item {
      display: flex;
      padding: 0 40px;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
      .inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 20px;
        padding-bottom: 20px;
        span {
          font-size: 14px;
          padding-top: 9px;
        }
        .supported {
          display: flex;
          justify-content: center;
          align-items: center;
          &__icons {
            display: flex;
            width: 100%;
            padding-left: 50px;
            @media (max-width: 550px) {
              padding-left: 0;
              flex-direction: column;
              align-items: center;
            }
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
              @media (max-width: 550px) {
                padding-left: 2px;
              }
            }
            &_images {
              @media (max-width: 550px) {
                display: flex;
              }
              @media (max-width: 350px) {
                img {
                  width: 16px;
                  height: 16px;
                }
              }
            }
          }
        }
      }
      // .deadline {
      //   .calendar {
      //     display: flex;
      //     align-items: center;
      //     img {
      //       cursor: pointer;
      //       padding-left: 5px;
      //       padding-top: 7px;
      //       width: 20px;
      //       height: 20px;;
      //     }
      //     input {
      //       font-size: 14px;
      //       text-align: center;
      //       opacity: 0.7;
      //       border-radius: 10px;
      //       border: none;
      //       padding: 8px;
      //       width: 150px;
      //       margin-left: 20px;
      //       border: 1px solid rgba(102, 86, 61, 0.5);
      //       box-shadow: 0 2px 7px rgba(0, 0, 0, 0.7);
      //     }
      //   }
      // }
      .date-file {
        &_mobileView {
          display: none;
          @media (max-width: 550px) {
            display: flex;
            margin-right: 80px;
            span {
              padding-right: 24px;
            }
          }
          @media (max-width: 410px) {
            margin-right: 45px;
          }
          @media (max-width: 350px) {
            margin-right: 12px;
          }
        }
      }
      .buttons {
        position: relative;
        .upload-btn{
          overflow: hidden;
          position: relative;
          width: 140px;
          padding: 10px;
          border-radius: 10px;
          box-shadow: 0 3px 5px rgba(0, 0, 0, 0.4);
          background-color: #D15F45;
          &:hover {
            box-shadow: 0 0px 15px rgba(0, 0, 0, 0.4);
          }
          @media (max-width: 550px) {
            width: 100px;
          }
          .upload-btn__txt {
            z-index: 1;
            position: relative;
            color: #fff;
            font-size: 14px;
            font-family: MyriadPro;
            text-align: center;
          }
          input {
            top: -10px;
            right: -40px;
            z-index: 2;
            position: absolute;
            cursor: pointer;
            opacity: 0;
            filter: alpha(opacity=0);
            font-size: 50px;
            font-family: MyriadPro;
            @media (max-width: 550px) {
              width: 120px;
              right: 0;
            }
          }
        }
        .drop {
          position: absolute;
          border: none;
          padding: 50px 120px 40px;
          top: 0;
          background: transparent;
          @media (max-width: 550px) {
            padding: 50px 70px 40px;
          }
        }
      }
      .upload-file {
        @media (max-width: 550px) {
          margin-right: 100px;
        }
        @media (max-width: 410px) {
          margin-right: 65px;
        }
        @media (max-width: 350px) {
          margin-right: 20px;
        }
      }
      .upload-reference {
        @media (max-width: 550px) {
          display: none;
        }
      }
      .btn-mobileview {
        display: flex;
        @media (max-width: 550px) {
          display: flex;
        }
      }
    }
    .loadedList {
      display: flex;
      flex-direction: column;
      padding-bottom: 15px;
      padding-top: 0;
      list-style: none;
      &__item {
        .deleteIcon {
          padding-left: 5px;
          cursor: pointer;
        }
        @media (max-width: 410px) {
          font-size: 10px;
          max-width: 120px;
        }
      }
      @media (max-width: 550px) {
        padding-bottom: 10px;
        align-self: flex-start;
        overflow: scroll;
      }
    }
    .details__brief {
      width: 100%;
      textarea {
        width: 98%;
        border: 1px solid rgba(102, 86, 61, 0.5);
        border-radius: 10px;
        padding: 5px;
        outline: none;
        font-family: MyriadPro;
        transition: all 0.3s;
        &:focus {
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
        }
      }
      &-title {
        font-size: 12px;
        font-family: MyriadPro;
      }
    }
  }

  .contact {
    padding-top: 20px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    span {
      padding-bottom: 3px;
    }
    @media (max-width: 550px) {
      display: block;
    }
    &__col {
      width: 40%;
      display: flex;
      flex-direction: column;
      padding-top: 20px;
      padding-bottom: 20px;
      @media (max-width: 768px) {
        width: 50%;
      }
      @media (max-width: 550px) {
        width: 100%;
        padding-top: 0;
        padding-bottom: 0;
      }
      &-item {
        display: flex;
        flex-direction: column;
        padding: 10px;
        input {
          border: 1px solid #66563D;
          border-radius: 10px;
          padding: 10px 5px;
          font-family: MyriadPro;
        }
      }
    }
  }

  .number {
    position: relative;
    // span {
    //   position: absolute;
    //   left: -3.5%;
    //   top: -14%;
    //   font-size: 28px;
    // }
    label {
      font-size: 22px;
      margin-bottom: 5px;
      @media (max-width: 550px) {
        padding-left: 6px;
      }
    }
  }

  .image {
    .legal & {
      background-image: url('../../../../assets/images/Legal.png');
    }
    .hotel & {
      background-image: url('../../../../assets/images/hotel.png');
    }
    .trading & {
      background-image: url('../../../../assets/images/CFDs-Online-Trading.png');
    }
    .crypto & {
      background-image: url('../../../../assets/images/Cryptocurrency.png');
    }
    .casino & {
      background-image: url('../../../../assets/images/casino-poker-igaming.png');
    }
    .games & {
      background-image: url('../../../../assets/images/Video-Games.png');
    }
    .other & {
      background-image: url('../../../../assets/images/Other.png');
    }
  }
  .image-white {
    .legal & {
      background-image: url('../../../../assets/images/Legal-white.png');
    }
    .hotel & {
      background-image: url('../../../../assets/images/hotel-white.png');
    }
    .trading & {
      background-image: url('../../../../assets/images/CFDs-Online-Trading-white.png');
    }
    .crypto & {
      background-image: url('../../../../assets/images/Cryptocurrency-white.png');
    }
    .casino & {
      background-image: url('../../../../assets/images/casino-poker-igaming-white.png');
    }
    .games & {
      background-image: url('../../../../assets/images/Video-Games-white.png');
    }
    .other & {
      background-image: url('../../../../assets/images/Other-white.png');
    }
  }

  .openIcon {
    width: 10px;
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
    span {
      margin-bottom: 5px;
    }
    input {
      background-color: #D15F45;
      color: white;
      width: 164px;
      height: 40px;
      border-radius: 10px;
      margin-top: 15px;
    }
    @media (max-width: 450px) {
      padding-top: 15px;
    }
  }

  .warning {
    animation-name: blink ;
    animation-duration: .5s ;
    animation-timing-function: step-end ;
    animation-iteration-count: infinite ;
    animation-direction: alternate ;
  }
  .warning {
    position: fixed;
    top: 50%;
    left: 50%;
    margin-left: -150px;
    margin-top: -120px;
    background-color: white;
    z-index: 10;
    width: 300px;
    font-size: 20px;
    padding: 20px;
    border: 2px solid grey;
    border-radius: 10px;
    animation-name: blink ;
    animation-duration: .8s ;
    animation-timing-function: step-end ;
    animation-iteration-count: infinite ;
    animation-direction: alternate ;
    text-align: center;
    .message {
      position: relative;
      .closeWarning {
        position: absolute;
        top: -22px;
        right: 0;
      }
    }
    @media (max-width: 767px) {
      transform: translateX(0);
    }
    @media (max-width: 450px) {
      margin-left: -170px;
    }
    @media (max-width: 380px) {
      width: 250px;
      padding: 5px;
      margin-left: -125px;
    }
  }

  .asterisk {
    .warning & {
      font-size: 20px;
      position: relative;
      padding-right: 15px;
    }
    &:after {
      content: '*';
      color: #F00;
      .warning & {
        position: absolute;
        font-size: 30px;
        right: -1px;
      }
    }
  }

  .wrapper, .wrapperTarget {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    color: rgba(0, 0, 0, 0);
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

  .vdp-datepicker__calendar {
    div {
      .day-header {
        font-weight: bold;
        font-size: 16px;
      }
      .cell {
        background-color: #eaeaea;
      }
    }
  }
  .targetCheck {
    margin-bottom: 0 !important;
  }

  .active {
    color: #D15F45;
  }

  @font-face {
    font-family: MyriadPro;
    src: url('../../../../assets/fonts/MyriadPro-Regular.otf');
  }
  @font-face {
    font-family: MyriadBold;
    src: url('../../../../assets/fonts/MyriadPro-Bold.otf')
  }

  .logo {
    box-shadow: 0 5px 30px rgba(92, 46, 26, 0.4);
    z-index: 5;
    &__image {
      margin-left: 20%;
      img {
        padding: 6px 0 12px 0;
        width: 240px;
        height: 67px;
      }
    }
    @media (max-width: 1600px) {
      &__image {
        width: 65%;
      }
    }

    @media (max-width: 1320px) {
      &__image {
        margin-left: 3%;
      }
    }
    @media (max-width: 1070px) {
      &__image {
        margin-left: 5px;
      }
    };
    @media (max-width: 1024px) {
      justify-content: left;
      &__image {
        img {
          padding: 6px 0 12px;
          width: 240px;
          height: 67px;
        }
      }
    }
    @media (max-width: 768px) {
      justify-content: left;
      &__image {
        width: 28%;
        img {
          padding: 6px 0 12px 0;
          width: 220px;
          height: 57px;
          margin-top: 15px;
        }
      }
    }
    @media (max-width: 450px) {
      justify-content: left;
      &__image {
        margin-left: 22%;
        width: 28%;
        img {
          padding: 6px 0 12px 0;
          width: 200px;
          height: 55px;
        }
      }
    }
    @media (max-width: 330px) {
      justify-content: left;
      &__image {
        width: 28%;
        img {
          padding: 6px 0 12px 0;
          width: 169px;
          height: 50px;
        }
      }
    }

  }

  .header {
    max-height: 273px;
    background-image: url('./../../../../assets/images/header2.jpg');
    background-size: cover;
    padding: 6.3% 0 5.6%;
    margin-bottom: 45px;

    @media (max-width: 768px) {
      margin-bottom: 5px;
    }

    span {
      color: #665741;
      font-size: 56px;
      margin-left: 20%;
      font-weight: bold;
      font-family: 'Open Sans', sans-serif;
      text-shadow:
        -1px -1px 0 #fff,
        1px -1px 0 #fff,
        -1px 1px 0 #fff,
        1px 1px 0 #fff;
      @media (max-width: 1320px) {
        margin-left: 3%;
      };
      @media (max-width: 1070px) {
        margin-left: 5px;
      };
      @media (max-width: 680px) {
        font-size: 46px;
      }
      @media (max-width: 450px) {
        font-size: 30px;
      }
      @media (max-width: 330px) {
        font-size: 26px;
      }
    }
    @media (max-width: 768px) {
      background-position-x: -96px;
    }
    @media (max-width: 450px) {
      background-position-x: -52px;
    }
    @media (max-width: 380px) {
      background-position-x: -69px;
    }
    @media (max-width: 350px) {
      background-position-x: -62px;
    }
  }

  .footer {
    font-family: 'Open Sans';
    background-color: #665741;
    height: 218px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .linkList {
    display: flex;
    justify-content: center;
    @media (max-width: 450px) {
      flex-direction: column;
      align-items: center;
      padding-top: 15px;
      padding-bottom: 15px;
    }
    .first {
      .list {
        li {
          &:last-child {
            @media (max-width: 450px) {
              border-right: none;
            }
          }
        }
      }
    }

    .second {
      .list {
        li {
          &:last-child {
            border-right: none;
          }
        }
      }
    }
  }

  .list {
    list-style: none;
    padding-left: 0;
    @media (max-width: 450px) {
      margin: 6px 0;
    }
  }

  .list li {
    display: inline;
    padding: 0 4px;
    text-shadow: 0 3px 5px black;
    border-right: 1.5px solid #fff;
    font-size: 12px;
    a {
      text-decoration: none;
      color: #fff;
      font-family: 'Open Sans';
      font-size: 15px;
      margin: 9px;

      @media (max-width: 768px) {
        font-size: 13px;
      }
    }
  }

  .legalInfo {
    font-family: 'Open Sans';
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  p.linfo {
    color: #fff;
    font-size: 12px;
    margin-top: 0.5px;
    margin-bottom: 0.5px;
  }

  .pangeaFooterSpan {
    font-weight: bold;
  }

  .socialLinks {
    display: inline;
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin: 0 10px;
    a {
      text-decoration: none;
    }
  }

  .socials {
    padding-left: 0;
  }

  .socials li {
    display: inline;
    list-style: none;
    a {
      img {
        @media (max-width: 400px) {
          width: 31px;
        }
      }
    }
  }

  .socialsImage {
    margin: 5px;
  }

  .projName {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 35px;
    &__project, &__date {
      display: flex;
      flex-direction: column;
      width: 50%;
    }
    &__date {
      width: 44%;
    }
    input {
      margin-left: 10px;
      border-radius: 12px;
      height: 28px;
      padding-right: 5px;
      padding-left: 5px;
      border-radius: 10px;
      border: 1px solid rgba(102, 86, 61, .5);
      outline: none;
      transition: all 0.3s;
      font-family: MyriadPro;
      &:focus {
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
      }
    }
  }
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
      padding-left: 10px;
      flex-direction: column;
      width: initial;
      &__quote {
        margin-top: 30px;
        width: 100%;
        display: flex;
        justify-content: center;
        .send, .start {
          width: 236px;
          height: 105px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          border: 1px solid rgba(102, 86, 61, 0.38);
          padding: 10px;
          margin: 10px;
          margin-right: 0;
          border-radius: 10px;
          cursor: pointer;
          &__check {
            width: 16px;
            height: 16px;
            border: 1px solid #66563D;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            .checker {
              width: 12px;
              height: 12px;
              border-radius: 50%;
            }
            .checkerChecked {
              background-color: #66563D;
            }
          }
          &__text {
            width: 88%;
            display: flex;
            flex-direction: column;
            align-items: center;
            .head {
              margin-bottom: 5px;
              font-size: 14px;
              font-weight: bold;
            }
            .innerText {
              text-align: center;
              font-size: 12px;
              margin-top: 0;
            }
          }
        }
        .optionChecked {
          box-shadow: 0 0 7px rgba(102, 86, 61, 0.6);
          border: 1px solid #66563D;
        }

      }
    }
  }

  .deadline {
    .calendar {
      display: flex;
      align-items: center;
      img {
        cursor: pointer;
        padding-left: 5px;
        padding-top: 7px;
        width: 20px;
        height: 20px;;
      }
      input {
        font-size: 14px;
        text-align: center;
        opacity: 0.7;
        border-radius: 10px;
        border: none;
        height: 34px;
        padding-right: 5px;
        padding-left: 5px;
        width: 190px;
        margin-left: 0;
        border: 1px solid rgba(102, 86, 61, 0.7);
      }
    }
  }

  .langTitle {
    font-size: 12px;
  }

  .container {
    padding: 40px 80px 20px 80px;
    border: 1px solid #66563D;
  }

</style>
