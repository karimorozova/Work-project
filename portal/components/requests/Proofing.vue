<template lang="pug">
    .proofingQa
        .table-block
            .proof-newProject
                .proof-newProject__row
                    .name
                        label.asterisk Project Name: 
                        input(:class="classes('projectName')" type="text" placeholder="Project Name" v-model="projectName")
                .proof-newProject__row
                    .deadline
                        label.asterisk Deadline: 
                        .date(:class="classes('deadline')")
                            datepicker.customClass(ref="programaticOpen" v-model="deadline" placeholder='dd/mm/yyyy' 
                                :format='format' 
                                monday-first=true 
                                :highlighted='state.highlighted' 
                                :disabled='state.disabled'
                                :errors='errors'
                              )
                            .icon-arrow(@click="openPicker")
                                  i.fas.fa-caret-down
                            .icon(@click="openPicker")
                              .icon__picker
                                  img(src="../../assets/images/calendar.png")
            .proof-table-wrapper
                newproject(
                    :projects='projects'
                    :errors='errors'
                    @newError='errorsPush'
                    @showWarning='warningMessage'
                    @projectManage='projectsChanges'
                    @projectSave='projectSaving'
                    @errorsEmpty='errorsExist'
                    )
                .addLine
                    .addLine__button(@click="addProject")
                      span.plus +
            .errorsMessage(v-if="showErrors")
                .message
                    .message__close(@click="messageClose")
                        i.fas.fa-times
                    h3 Error(s)!            
                    li(v-for='error in errors') {{ error.error }}
            .startProject
                input.createButton(@click="newProject" type="button" value="Create Project" :disabled="createDisable")
        .summaryInfo
            .orderInfo
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
                        p
                          span.choice(v-if="selectedLangs.length > 0" v-for="lang in selectedLangs") {{ lang.lang }} 
                          span.choice(v-if="selectedLangs.length == 0") Select
                    .orderInfo__summary-deadline
                        label SUGGESTED DEADLINE
                        p.choice {{ deadlineSelect }}
            p.orderSummary ORDER SUMMARY
</template>

<script>
import axios from "axios";
import querystring from "querystring";
import Datepicker from "../Datepicker.vue";
import moment from "moment";
import Multiselect from "vue-multiselect";
import NewProject from "../NewProject.vue";

export default {
  name: "project",
  data() {
    return {
      languages: [],
      projects: [
        {
          wordcount: "",
          key: "",
          summary: {text: "", exist: true},
          targetLang: {text: "", exist: true},
          fileType: {text: "", exist: true},
          source: {text: "", exist: true},
          target: {text: "", xtrf: "", exist: true},
          icons: [
            { icon: require("../../assets/images/save-icon-qa.png"), status: false },
            { icon: require("../../assets/images/edit-icon-qa.png"), status: true },
            { icon: require("../../assets/images/delete-icon-qa.png"), status: false }
          ],
          readonly: false
        }
      ],
      format: "dd/MM/yyyy",
      createDisable: true,
      fileTypeSelect: "",
      contactPerson: "",
      state: {
        highlighted: {
          days: [6, 0]
        },
        disabled: {
          to: moment()
            .add(-1, "day")
            .endOf("day")
            .toDate()
        }
      },
      projectName: "",
      company: "",
      persons: [],
      personSelected: { name: "Options" },
      droppedPersons: false,
      deadline: "",
      droppedFile: false,
      targetLangSelect: "Options",
      selectedFile: "Options",
      readonly: false,
      errors: [],
      showErrors: false,
      selectedLangs: []
    };
  },
  methods: {
    classes(err) {
      for(let i = 0; i < this.errors.length; i++ ) {
        if(this.errors[i].title == err) {
          return 'errorActive'
        }
      }
    },
    openPicker() {
      this.$refs.programaticOpen.showCalendar();
    },
    addProject() {
      this.projects.push({
        wordcount: "",
        key: "",
        summary: {text: "", exist: true},
        targetLang: {text: "", exist: true},
        fileType: {text: "", exist: true},
        source: {text: "", exist: true},
        target: {text: "", xtrf: "", exist: true},
        icons: [
          { icon: require("../../assets/images/save-icon-qa.png"), status: false },
          { icon: require("../../assets/images/edit-icon-qa.png"), status: true },
          { icon: require("../../assets/images/delete-icon-qa.png"), status: false }
        ],
        readonly: false
      });
    },
    changeLanguage(data) { 
      this.projects[data.index].targetLang.text = data.lang;
      this.targetLangSelect = data.lang.text;
    },
    chooseFile(data) {
      this.projects[data.index].fileType = data.type;
      this.selectedFile = data.type;
    },
    messageClose() {
      this.showErrors = false;
    },
    companySelect(data) {
      this.company = data;
      this.personSelected = { name: "Options" };
      if (this.company.id) {
        let homeApi = axios.create({
          baseURL: "https://pangea.s.xtrf.eu/home-api/",
          headers: {
            "X-AUTH-ACCESS-TOKEN": "U0mLa6os4DIBAsXErcSUvxU0cj"
          }
        });
        return new Promise(resolve => {
          homeApi
            .get(`customers/${this.company.id}?embed=persons`)
            .then(response => {
              resolve(response.data);
              this.persons = response.data.persons;
            })
            .catch(error => {
              resolve(error);
            });
        });
      }
    },
    showPersons() {
      this.droppedPersons = !this.droppedPersons;
    },
    changePerson(ind) {
      this.personSelected = this.persons[ind];
    },
    projectsChanges(data) {
      if(this.projects.length == 1) {
        this.projects.splice(data.index, 1,
          {
            wordcount: "",
            key: "",
            summary: {text: "", exist: true},
            targetLang: {text: "", exist: true},
            fileType: {text: "", exist: true},
            source: {text: "", exist: true},
            target: {text: "", xtrf: "", exist: true},
            icons: [
              { icon: require("../../assets/images/save-icon-qa.png"), status: false },
              { icon: require("../../assets/images/edit-icon-qa.png"), status: true },
              { icon: require("../../assets/images/delete-icon-qa.png"), status: false }
            ],
            readonly: false
          } 
        );
        this.createDisable = true;
        this.selectedLangs = [];
      } else {
          this.projects.splice(data.index, 1);
          var arrayOfLangs = [];
          for (let i = 0; i < this.projects.length; i++) {
            arrayOfLangs.push(this.projects[i].targetLang.lang)
          }
          this.selectedLangs = this.selectedLangs.filter( item => {
            if (arrayOfLangs.indexOf(item.lang) >= 0) {
              return item
            }
          })
      }
    },
    projectSaving(data) {
      let currentForSave = this.projects[data.index].icons.slice(data.saveIndex, data.saveIndex + 1);
      let currentForEdit = this.projects[data.index].icons.slice(data.editIndex, data.editIndex + 1);
      currentForSave[0].status = !currentForSave[0].status;
      currentForEdit[0].status = !currentForEdit[0].status;
      this.projects[data.index].icons.splice(data.saveIndex, 1, currentForSave[0]);
      this.projects[data.index].icons.splice(data.editIndex, 1, currentForEdit[0]);
      
      var contain = false;
      if(this.selectedLangs.length) {
        for(let i = 0; i < this.selectedLangs.length; i++) {
          if (this.selectedLangs[i].lang == this.projects[data.index].targetLang.lang) {
            contain = true;
            break
          }
        }
      }
      
      if (!contain) {
        this.selectedLangs.push(this.projects[data.index].targetLang)        
      }   
      
      if(currentForSave[0].status) {
        this.createDisable = false
      }
    },
    errorsExist(data) {
      this.errors.splice(0);
      for(let key in this.projects[data.index]) {
        if(typeof this.projects[data.index][key] === "object") {
          this.projects[data.index][key].exist = true
        }
      }
    },
    errorsPush(data) {
      this.errors.push({error: data.error, title: data.title});
    },
    warningMessage(data) {
      this.showErrors = true;
      for(let i = 0; i < this.errors.length; i++) {
        for(let key in this.projects[data.index]) {
          if(key == this.errors[i].title && typeof this.projects[data.index][key] === "object") {
            this.projects[data.index][key].exist = false
          }
        }
      }
    },
    async newProject() {
      this.errors = [];
      if(!this.projectName) {
        this.errors.push({error: 'Fill the "Project Name" field.', title: 'projectName'})
      }
      if(!this.deadline) {
        this.errors.push({error: 'Choose deadline date.', title: 'deadline'})
      }
      if(this.errors.length) {
          this.showErrors = true
      } else {
          const result = await this.$axios.$post('project',{
          "name" : this.projectName,
          "serviceId" : 13,
          "deadline": this.deadline,
          "clientId": this.company.id,
          "person": this.personSelected.id,
          "jobs" : this.projects
            }).then(req => {
                  console.log('Req done: ', req)
                }).catch(err => {
                  console.error('Error: ', err)
                })
      }
    }
  },
  computed: {
    service() {
        return this.$store.state.clientInfo.service
    },
    deadlineSelect() {
      if (this.deadline) {
        return moment(this.deadline).format("DD-MM-YYYY");
      }
    }
  },
  mounted() {},
  components: {
    Datepicker,
    Multiselect,
    "newproject": NewProject
  }
};
</script>

<style lang="scss">
@import "../../assets/styles/clientrequest/proofingQa.scss";

</style>

