<template lang="pug">
  .externalWrap
    Marketing(v-if="service == 'Marketing'" @thankMark="thankMark")
    Copywriting(v-if="service == 'Copywriting'" @thankCopy="thankCopy")
    Proofing(v-if="service == 'Proofing/QA'" @thankProof='thankProof')
    .mainWrapper(v-if="service == 'Translation' || service == 'Graphic Localization'")
      .container(v-if="!thanks")
        .slideInInfo(@click="orderSlide" :class="{positionChange: infoSlide}") Your Order
        .successAlert(v-if="success")
          .successAlert__message
            p Thanks for your request.
            p We will answer you as soon as possible.
        form.mainForm(ref="myForm" @submit.prevent="checkForm")
          .number.customers(v-click-outside="outsideCustomers")
            label.asterisk CUSTOMER:
            .customers__menu
              span.inner-text(:class="{ color: customerSelected.name != 'Select' }") {{ customerSelected.name }}
                .wrapper(@click.self="showCustomers")
                .icon(:class="{reverse: customerDrop}")
                  i.fa.fa-caret-down
                .customer-search(v-if="customerDrop")
                  input.searchField(type="text" placeholder="Search" v-model="searchCustomer" :value="searchCustomer")
              .menu-drop(v-if="customerDrop")
                .menu-drop__list(v-for="(customer, index) in customers")
                  span.list-item(@click="chooseCustomer(index)") {{ customer.name }}
          .number.projName
            .projName__project
              label.asterisk PROJECT NAME:
              input(type="text" v-model="projectName" value="projectName" maxlength="50" placeholder='50 characters maximum')
            .projName__date.deadline
              label.asterisk SUGGESTED DEADLINE:
              .calendar
                datepicker(ref="programaticOpen" placeholder='dd-mm-yyyy' :format='format' v-model='deadlineSelect' monday-first=true :highlighted='state.highlighted' :disabled='state.disabled')
                .datepick(@click='openPicker')
                    img(src='../../assets/images/calendar.png')
          .number
            label.asterisk TEMPLATE AND WORKFLOW
          .template-workflow
            .lang-source(v-click-outside="outsideTemplates")
              span.langTitle Select Template
              .selectLangs.source
                span.inner-text.clarify(:class="{ color: templateSelect.name != 'Select' }") {{ templateSelect.name }}
                  .wrapper(@click.self='showTemplate')
                  .icon(:class="{ reverse: templateDrop }")
                    i.fa.fa-caret-down
                .source__drop(v-if='templateDrop')
                  .source__drop-list(v-for='template in templates')
                    .pair(@click='changeTemplate(template)')
                      span.list-item(:class="{ active: template.name == templateSelect.name }") {{ template.name }}
            .lang-target(v-click-outside="outsideWorkflow")
              span.langTitle Select Workflow
              .selectLangs.source
                span.inner-text.clarify(:class="{ color: workflowSelect.name != 'Select' }") {{ workflowSelect.name }}
                  .wrapper(@click.self='showWorkflow')
                  .icon(:class="{ reverse: workflowDrop }")
                    i.fa.fa-caret-down
                .source__drop(v-if='workflowDrop')
                  .source__drop-list(v-for='workflow in workflows')
                    .pair(@click='changeWorkflow(workflow)')
                      span.list-item(:class="{ active: workflow.name == workflowSelect.name }") {{ workflow.name }}
          .number 
            label.asterisk SELECT A LANGUAGE
          .language(v-click-outside="outsideLangs")
            .lang-source
              span.langTitle Source Language
              .selectLangs.source
                span.inner-text.clarify(:class="{ color: sourceSelect.name != 'Select' }") {{ sourceSelect.name }}
                  .wrapper(@click.self='showSourceLang')
                  .icon(:class="{ reverse: sourceDrop }")
                    i.fa.fa-caret-down
                .source__drop(v-if='sourceDrop')
                  .source__drop-list(v-for='language in sourceLanguages')
                    .pair(@click='changeSourceSelect(language)')
                      img(:src="'./'+language.icon")
                      span.list-item(:class="{ active: language.name == sourceSelect.name }") {{ language.name }}
            .lang-target
              span.langTitle Target Language(s)
              .selectLangs.target
                span.inner-text.clarify(:class="{ color: targetSelect.length != 0 }") 
                  template(v-if="targetSelect.length > 0" v-for="lang in targetSelect") {{ lang.name }};  
                  template(v-if="targetSelect.length == 0") Select
                  .wrapper(v-on:click.self='showTargetLang')
                  .icon(:class="{ reverse: targetDrop }")
                    i.fa.fa-caret-down
                .target__drop(v-if='targetDrop')
                  .target__drop-list(v-for='language in targetLanguages')
                    .pair(v-if='(sourceSelect.name.includes("English") && serviceSelect.languages[0].target.indexOf(language.symbol) != -1) || serviceSelect.title == "Select" || sourceSelect.name == "Select"' @click='changeTargetSelect(language)')
                      img(:src="'./'+language.icon")
                      span.list-item(:class="{ active: language.check }") {{ language.name }}
          .number
            label PROJECT DETAILS
          .details
            .details__item
              .inner.buttons.upload-file
                // drop.drop(@drop="handleDrop")
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
              //-         img(src='../assets/images/calendar.png')
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
                span.choice &nbsp; {{ sourceSelect.name }} <template v-if="!sourceSelect">Select</template>
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
import { logicalExpression } from "../../node_modules/@types/babel-types";

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
import Datepicker from '../Datepicker.vue';
// import { Drag, Drop } from 'vue-drag-drop';
// import Marketing from './requests/Marketing.vue';
// import Copywriting from './requests/Copywriting.vue';
// import Proofing from './requests/Proofing.vue';

export default {
  name: 'client-form',
  props: {
    thanks: {
      type: Boolean,
      default: false
    },
    clientLanguages: {
      type: Array,
      default: []
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
      templates: [
        {name: 'Excel segment limit', id: 'XLSwithLimit'},
        {name: 'Multilingual Excel', id: 'multiexcel'},
        {name: 'Standard processing', id: '247336FD'},        
      ],
      templateSelect: {name: 'Select', id: 0},
      templateDrop: false,
      workflows: [
        {name: 'Translate', id: 2890},
        {name: 'Translate, review', id: 2929},
      ],
      workflowSelect: {name: 'Select', id: 2890},
      workflowDrop: false,
      customerDrop: false,
      searchCustomer: "",
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
      xtmProjects: [],
      customerSelected: {name: 'Select'},
    }
  },
  methods: {
    showTemplate() {
      this.templateDrop = !this.templateDrop;
    },
    changeTemplate(tem) {
      this.templateSelect = tem;
    },
    outsideTemplates() {
      this.templateDrop = false;
    },
    showWorkflow() {
      this.workflowDrop = !this.workflowDrop;
    },
    changeWorkflow(work) {
      this.workflowSelect = work;
    },
    outsideWorkflow() {
      this.workflowDrop = false;
    },
    chooseCustomer(ind) {
      this.customerSelected = this.customers[ind];
      this.getClientInfo(this.customers[ind].id);
      this.$emit('customerLangs', this.customers[ind]);
    },
    showCustomers() {
      this.customerDrop = !this.customerDrop;
    },
    outsideCustomers() {
      this.customerDrop = false;
    },
    thankProof(data) {
      console.log(data);
      this.$emit('thankProof', data);
    },
    thankCopy(data){
      console.log(data);
      this.$emit('thankCopy', data);
    },
    thankMark(data){
      console.log(data);
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
    async getClientInfo(customerId) {
      let result = await this.$http.get(`../customer-info?customerId=${customerId}`);
      console.log("client-info: " + result);
    },
    clearForm() {
      this.customerSelected = {name: 'Select'};
      this.searchCustomer = '';
      this.templateSelect = {name: 'Select', id: 0};
      this.workflowSelect = {name: 'Select', id: 2890};
      this.projectName = "";
      this.refFiles = [];
      this.detailFiles = [];
      this.request = [];
      this.deadlineDate = '';
      this.deadlineSelect = '';
      this.sourceSelect = {name : 'English (United Kingdom)', id: '73', xtrf: '73', symbol: 'EN-GB', lang: 'English (United Kingdom)', xtm: 'en_GB'};
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
        sendForm.append("customerId", this.request.customerId);
        sendForm.append("accountManager", "None selected");
        sendForm.append("brief", this.request.brief);
        sendForm.append("createdAt", this.request.createdAt);
        sendForm.append("template", this.request.template);
        sendForm.append("workflow", this.request.workflow);
        sendForm.append("dateFormatted", moment(this.request.createdAt).format('YYYY MM DD'));

        // sendForm.append("jsession", this.$store.state.session);
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

        const result = await this.$http.post('../xtm/request', sendForm);
        console.log(result);
        this.xtmProjects = result;
        this.clearForm();
    },
    getServices() {
      this.services = this.$store.state.services;
    },
    getClientLanguages() {
      this.clientLanguages = this.$store.state.clientLangs;
    },
    async checkForm(event) {
      this.request = {
          customerId: this.customerSelected.xtmId,
          projectName: this.projectName,
          date: this.deadlineSelect, 
          contactName: 'testName',//this.$store.state.clientInfo.name, 
          contactEmail: 'test@Email.com', //this.$store.state.clientInfo.email,
          service: 'Translation', //this.$store.state.clientInfo.service, 
          industry: 'General', //this.$store.state.clientInfo.industry, 
          status: 'New',
          template: this.templateSelect.id,
          workflow: this.workflowSelect.id,
          sourceLanguage: this.sourceSelect, 
          targetLanguages: this.targetSelect, 
          web: '', //this.$store.state.clientInfo.web,
          skype: '', //this.$store.state.clientInfo.skype, 
          phone: '1212121212', //this.$store.state.clientInfo.phone, 
          companyName: this.customerSelected.name, //this.$store.state.clientInfo.companyName,
          accountManager: "None selected",
          brief: this.brief,
          files: this.files,
          createdAt: new Date()
    }

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
    }    
  },
  computed: {
    languages() {
      let result = [];
      if(this.$store.state.languages.length) {
        result = this.$store.state.languages;
      }
      return result;
    },
    customers() {
      let result = [];
      
      if(this.$store.state.customers.length) {
        result = this.$store.state.customers;
      }

      if(this.$store.state.xtmCustomers.length) {
        for(let cust of this.$store.state.xtmCustomers) {
          for(let elem of result) {
            if(cust.name == elem.name) {
              elem.xtmId = cust.id
            }
          }
        }
      }

      result = result.filter(item => {
        if(item.name.toLowerCase().indexOf(this.searchCustomer.toLowerCase()) != -1) {
          return item;
        }
      })
      return result;
    },
    sourceLanguages() {
      let result = [];
      if(this.clientLanguages.length) {
        for(let i = 0; i < this.clientLanguages.length; i++) {
          result.push({name: this.clientLanguages[i].sourceLanguage.name, lang: this.clientLanguages[i].sourceLanguage.name, symbol: this.clientLanguages[i].sourceLanguage.symbol, id: this.clientLanguages[i].sourceLanguage.id, xtrf: this.clientLanguages[i].sourceLanguage.id, check: false})   
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
          if (this.clientLanguages[i].sourceLanguage.name == this.sourceSelect.name)
          result.push({name: this.clientLanguages[i].targetLanguage.name, lang: this.clientLanguages[i].targetLanguage.name, symbol: this.clientLanguages[i].targetLanguage.symbol, id: this.clientLanguages[i].targetLanguage.id, xtrf: this.clientLanguages[i].targetLanguage.id, check: false})   
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
      // return this.$store.state.clientInfo.service
      return 'Translation'
    },
    industry() {
      // return this.$store.state.clientInfo.industry
      return 'General'
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
    // Drop,
    // Marketing,
    // Proofing,
    // Copywriting
  },
  mounted(){
    this.getServices();
  }
}

</script>

<style lang='scss'>
@import '../../assets/styles/request-forms/clientrequest.scss';

</style>
