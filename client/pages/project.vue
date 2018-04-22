<template lang="pug">
    .container
        .newProject
            .newProject__row
                .name
                    label Project Name: 
                    input(type="text" placeholder="Project Name" v-model="projectName")
            .newProject__row
                .deadline
                    label Deadline: 
                    .date
                        datepicker(ref="programaticOpen" v-model="deadline" placeholder='dd/mm/yyyy' :format='format' monday-first=true :highlighted='state.highlighted' :disabled='state.disabled')
                    .icon(@click="openPicker")
                        .icon__picker
                            i.far.fa-calendar-alt.datePicker 
                        .icon__arrow 
                            i.fas.fa-caret-down
                company(
                    @companyChanged="companySelect"
                )
                .contact-person
                    label Contact person: 
                    .select
                        .select__selected 
                            span {{ personSelected.name }} {{ personSelected.lastName }}
                            .icon(@click="showPersons")
                                i.fa.fa-caret-down
                        .drop(v-if="droppedPersons && company")
                            span.drop_item(@click="changePerson(personIndex)" v-for="(person, personIndex) in persons" ) {{ person.name }} {{ person.lastName }}
            .newProject__row
                input.createButton(@click="newProject" type="button" value="Create Project" :disabled="createDisable")
        .table-wrapper
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
            input(@click="addProject" type="button" value="ADD")
        .errorsMessage(v-if="showErrors")
            .message
                .message__close(@click="messageClose")
                    i.fas.fa-times
                h3 Error(s)!            
                li(v-for='error in errors') {{ error.error }}

</template>

<script>
import axios from "axios";
import querystring from "querystring";
import Datepicker from "./../components/Datepicker.vue";
import moment from "moment";
import Multiselect from "vue-multiselect";
import VueLodash from "vue-lodash";
import Company from "./../components/Company.vue";
import NewProject from "./../components/NewProject.vue";

export default {
  name: "request-qa",
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
            { icon: require("../assets/images/save.png"), status: false },
            { icon: require("../assets/images/edit.png"), status: true },
            { icon: require("../assets/images/delete.png"), status: false }
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
      showErrors: false
    };
  },
  methods: {
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
          { icon: require("../assets/images/save.png"), status: false },
          { icon: require("../assets/images/edit.png"), status: true },
          { icon: require("../assets/images/delete.png"), status: false }
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
              { icon: require("../assets/images/save.png"), status: false },
              { icon: require("../assets/images/edit.png"), status: true },
              { icon: require("../assets/images/delete.png"), status: false }
            ],
            readonly: false
          } 
        );
        this.createDisable = true;
      } else {
          this.projects.splice(data.index, 1);
      }
    },
    projectSaving(data) {
      let currentForSave = this.projects[data.index].icons.slice(data.saveIndex, data.saveIndex + 1);
      let currentForEdit = this.projects[data.index].icons.slice(data.editIndex, data.editIndex + 1);
      currentForSave[0].status = !currentForSave[0].status;
      currentForEdit[0].status = !currentForEdit[0].status;
      this.projects[data.index].icons.splice(data.saveIndex, 1, currentForSave[0]);
      this.projects[data.index].icons.splice(data.editIndex, 1, currentForEdit[0]);
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
      // if(!this.projectName) {
      //   this.errors.unshift('Fill the "Project Name" field.')
      // }
      // if(!this.deadline) {
      //   this.errors.unshift('Choose deadline date.')
      // }
      // if(!this.company) {
      //   this.errors.unshift('Choose company.')
      // }
      // if(!this.personSelected) {
      //   this.errors.unshift('Choose person.')
      // }

      // if(this.errors.length) {
      //   this.showErrors = true
      // } else {
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
  },
  computed: {},
  mounted() {},
  components: {
    Datepicker,
    Multiselect,
    VueLodash,
    company: Company,
    newproject: NewProject
  }
};
</script>

<style lang="scss">
@import "./assets/project.scss";
</style>

