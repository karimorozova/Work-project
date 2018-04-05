<template lang="pug">
.full-order(v-if='visibleOrderInfo')
  .full-order__wrapper
    .full-order__info
      .cross(@click='hideOrderInfo')
        i.fa.fa-times
      .recievedBlock
        h1 NEW ORDER
        .contactDetails
          h4.contactDetails__title CONTACT DETAILS
          .contactDetails__details
            .contactDetails__details-item.person
              .contactName.person-item
                span.title Name: 
                span {{contactName}}
              .contactEmail.person-item
                span.title Email: 
                span {{ contactEmail }}
              .contactPhone.person-item
                span.title Phone Number: 
                span {{ contactPhone }}
            .contactDetails__details-item.company
              .companyWeb.company-item
                span.title Website: 
                span {{companyWeb}}
              .companyName.company-item
                span.title Company Name: 
                span {{ companyName }}
              .contactSkype.company-item 
                span.title Skype Name: 
                span {{ contactSkype }}
        .fieldDetails
          .fieldDetails__item.service 
            h4.service__title SERVICE
            span  {{ service.title }}
          .fieldDetails__item.industry 
            h4.industry__title INDUSTRY  
            span {{ industry }}
        .languageDetails
          h4.languageDetails__title LANGUAGE
          .languageDetails__languages
            .languageDetails__languages-item.source 
              span.title Source Language: 
              span {{ sourceLanguage.lang }}
            .languageDetails__languages-item.target 
              span.title Target Language(s): 
              .target-list
                span.targetLangArray(v-for="language in targetLanguages") {{ language.lang }}
        .projectDetails 
          h4.projectDetails__title PROJECT DETAILS
          .projectDetails__download
            .projectDetails__download-item.file
              .files
                span.title  Files
                img(src="../assets/images/download-big-b.png")
              .reference
                span.title Reference File
                img(src="../assets/images/download-big-b.png")
            .projectDetails__download-item.deadline
              span.title Suggested Deadline
              span.deadline-date {{ date }}
        .brief
          span.brief__title Brief
          p.brief__text
            | {{ brief }}
      .editBlock
        .date
          span.date__title Date Requested: 
          span {{ createdAt }}
        .statusManage
          label Status
          .select.status(@blur='() => statusDrop = false' role='button' tabindex='0')
            span.select__text
              span.text {{ status }}
              .text-wrapper(@click="showStatus")
              .icon
                i.fa.fa-caret-down
            .status__drop(v-if='statusDrop')
              .status__drop-list(v-for="(status, index) in statuses")
                span.list-item(@click="chooseStatus(index)") {{ status }}
        .managerAssignment
          label Account Manager
          .select.manager(@blur='() => managersDrop = false' role='button' tabindex='1')
            span.select__text
              span.text {{ accountManager }}
              .text-wrapper(@click="showManagers")
              .icon
                i.fa.fa-caret-down
            .manager__drop(v-if='managersDrop')
              .manager__drop-list(v-for="(manager, index) in managers")
                span.list-item(@click="chooseManager(index)") {{ manager }}
        .buttons
          input.save(type="submit" value="Save")(@click='saveChanges')
          input.exit(type="button" value="Exit")(@click='hideOrderInfo')
</template>
<script>

export default {
  data() {
    return {
      fullOrder: false,
      statusDrop: false,
      managersDrop: false,
      statuses: [
        'New', 'Assigned', 'Open', 'Close', 'Canceled' 
      ],
      managers: [
        'manager1', 'manager2', 'manager3', 'manager4', 'manager5'
      ]
    }
  },
  props: {
    date: {
      type: String,
      default: ""
    },
    contactName: {
      type: String,
      default: ""
    },
    contactEmail: {
      type: String,
      default: ""
    },
    companyWeb: {
      type: String,
      default: ""
    },
    companyName: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      default: ""
    },
    accountManager: {
      type: String,
      default: ""
    },
    contactPhone: {
      type: String,
      default: ""
    },
    contactSkype: {
      type: String,
      default: ""
    },
    service: {
      type: String,
      default: "English"
    },
    industry: {
      type: String,
      default: ""
    },
    sourceLanguage: {
      type: String,
      default: ""
    },
    targetLanguages: {
      type: Array,
      default: []
    },
    brief: {
      type: String,
      default: ""
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    visibleOrderInfo:{
      type: Boolean,
      default: false
    }
  },
  methods: {
    // formatDate(date){
    //   return moment(date).format("DD-MM-YYYY");
    // },
    saveChanges() {
      this.$emit('save', { message: 'Changes saved' });
    },
    hideOrderInfo(){
      this.$emit('hide', { message: 'Form was hide' });
    },
    showStatus() {
      this.toggleStatus()
    },
    toggleStatus() {
      this.statusDrop = !this.statusDrop;      
    },
    chooseStatus(index) {
      this.$emit('updateStatus', { status: this.statuses[index] });
      this.toggleStatus()
    },
    showManagers() {
      this.toggleManagers() 
    },
    toggleManagers() {
      this.managersDrop = !this.managersDrop
    },
    chooseManager(index) {
      this.$emit('updateManager', { accountManager: this.managers[index] });
      if(this.status == 'New') {
        this.$emit('updateStatus', { status: "Assigned" });
      }
      this.toggleManagers()
    }
  },
  computed: {

  },
    
  mounted() {
    console.log(this);
  },
  components: {}
};
</script>


<style lang="scss">

</style>
