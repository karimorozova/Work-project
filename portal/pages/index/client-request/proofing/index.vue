<template lang="pug">
  .proofingQa
    .table-block
      .proof-newProject
        .proof-newProject__row
          .name
            label.asterisk PROJECT NAME:
            input(:class="classes('projectName')" type="text" placeholder="Project Name" v-model="projectName")
        .proof-newProject__row
          .deadline
            label.asterisk SUGGESTED DEADLINE:
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
                  img(src="../../../../assets/images/calendar.png")
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
              span.choice(v-if="selectedLangs.length > 0" v-for="lang in selectedLangs") {{ lang.lang }};
              span.choice(v-if="selectedLangs.length == 0") Select
          .orderInfo__summary-deadline
            label SUGGESTED DEADLINE
            p.choice {{ deadlineSelect }}
</template>

<script>
  import axios from "axios";
  import Datepicker from "~/components/Datepicker.vue";
  import moment from "moment";
  import Multiselect from "vue-multiselect";
  import NewProject from "~/components/NewProject.vue";

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
              { icon: require("../../../../assets/images/save-icon-qa.png"), status: false },
              { icon: require("../../../../assets/images/edit-icon-qa.png"), status: true },
              { icon: require("../../../../assets/images/delete-icon-qa.png"), status: false }
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
            { icon: require("../../../../assets/images/save-icon-qa.png"), status: false },
            { icon: require("../../../../assets/images/edit-icon-qa.png"), status: true },
            { icon: require("../../../../assets/images/delete-icon-qa.png"), status: false }
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
                { icon: require("../../../../assets/images/save-icon-qa.png"), status: false },
                { icon: require("../../../../assets/images/edit-icon-qa.png"), status: true },
                { icon: require("../../../../assets/images/delete-icon-qa.png"), status: false }
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
          var obj = {};
          obj.projectName = this.projectName;
          obj.date = this.deadline;
          let sorted = this.projects.sort( (a, b) => {
            if (a.targetLang.lang < b.targetLang.lang) return -1;
            if (a.targetLang.lang > b.targetLang.lang) return 1;
          })
          var result = [];
          sorted.forEach( function(a) {
            if (!this[a.targetLang.lang]) {
              this[a.targetLang.lang] = { lang: a.targetLang.lang, wordcount: 0 };
              result.push(this[a.targetLang.lang]);
            }
            this[a.targetLang.lang].wordcount += a.wordcount;
          }, Object.create(null));

          obj.countPairs = result;
          this.$store.dispatch('loadOrderDetails', obj);
          this.$emit('thankProof', this.service);
          // const result = await this.$axios.$post('project',{
          // "name" : this.projectName,
          // "serviceId" : 13,
          // "deadline": this.deadline,
          // "clientId": this.company.id,
          // "person": this.personSelected.id,
          // "jobs" : this.projects
          //   }).then(req => {
          //         console.log('Req done: ', req)
          //       }).catch(err => {
          //         console.error('Error: ', err)
          //       })
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
  .proofingQa {
    width: 100%;
    max-width: 1320px;
    margin: 0 auto;
    display: flex;
    align-items: flex-start;
    margin-bottom: 30px;
    .table-block {
      margin-top: 40px;
      padding: 0 20px;
    }
    .orderInfo {
      font-family: MyriadPro;
      color: #66563D;
      transition: all 0.7s;
      @media (max-width: 1424px) {
        margin-left: 0;
      }
      @media (max-width: 1423px) {
        display: none;
      }
      padding-bottom: 20px;
      border: 1px solid;
      border-radius: 15px;
      position: sticky;
      top: 7px;
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
            margin-top: 5px;
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
  }
  .proof-newProject {
    color: #67573E;
    width: 919px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    &__row {
      width: 50%;
      label {
        font-size: 22px;
      }
      ::-webkit-input-placeholder {
        opacity: 0.6;
      }
      .name {
        width: 100%;
        display: flex;
        flex-direction: column;
        input {
          width: 306px;
          height: 28px;
          padding-left: 5px;
          padding-right: 5px;
          border-radius: 7px;
          border: 1px solid rgba(102, 86, 61, 0.6);
        }
        label {
          margin-bottom: 5px;
        }
      }
      .deadline {
        display: flex;
        flex-direction: column;
        label {
          margin-bottom: 5px;
        }
        input {
          width: 190px;
          height: 34px;
          padding: 5px;
          border: 1px solid rgba(102, 86, 61, 0.6);
          border-radius: 10px;
        }
        .date {
          display: flex;
          position: relative;
          width: 180px;
          .icon-arrow {
            position: absolute;
            right: 0;
            font-size: 18px;
            color: #BFB09D;
            border-left: 1px solid #BFB09D;
            padding-left: 5px;
            padding-top: 6px;
            height: 28px;
            cursor: pointer;
          }
          .icon {
            display: flex;
            align-items: center;
            &__picker {
              display: flex;
              align-items: center;
              margin-left: 10px;
              cursor: pointer;
              img {
                width: 18px;
                height: 18px;
              }
            }
          }
        }
      }
    }
  }

  .proof-table-wrapper {
    width: 919px;
    margin-top: 30px;
    padding: 10px;
    box-shadow: 0 2px 12px rgba(102, 86, 61, 0.6);
    .table {
      margin-bottom: 10px;
      width: 100%;
      border: 1px solid #BFB09D;
      border-collapse: collapse;
      tr {
        th {
          text-align: left;
          color: white;
          background-color: #978D7E;
          border-right: 1px solid white;
          font-weight: normal;
          padding: 5px;
          &:last-child {
            border-right: none;
          }
        }
        td {
          padding-top: 0;
          padding-bottom: 0;
          border: 1px solid #978D7E;
          width: 10%;
          .select {
            position: relative;
            height: 25px;
            .tableSelect, .filesSelect {
              height: 100%;
            }
            &__selected {
              color: #67573E;
              height: 100%;
              padding-left: 3px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              .icon {
                display: flex;
                align-items: center;
                justify-content: center;
                border-left: 1px solid #67573E;
                height: 100%;
                cursor: pointer;
                width: 20%;
                color: #67573E;
                font-size: 23px;
                opacity: 0.4;
                .filesSelect & {
                  padding-right: 8px;
                }
              }
            }
            .drop {
              position: absolute;
              background-color: #FFF;
              border: 1px solid #BFB09D;
              padding-top: 5px;
              max-height: 200px;
              position: absolute;
              z-index: 5;
              overflow-y: auto;
              width: 100%;
              display: flex;
              flex-direction: column;
              font-size: 14px;
              top: 26px;
              left: -2px;
              &_item {
                color: #67573E;
                transition: all 0.3s;
                padding: 4px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.3);
                cursor: pointer;
                &:hover {
                  padding-left: 5px;
                  background-color: #978D7E;
                  color: white;
                }
                &:last-child {
                  border-bottom: none;
                }
              }
            }
          }
        }
        input {
          color: #67573E;
          padding-top: 4px;
          padding-bottom: 5px;
        }
        input.infoInput {
          width: 100%;
          box-sizing: border-box;
          border: none;
          outline: none;
        }
      }
      .icons {
        text-align: center;
        padding-top: 2px;
        &__item {
          margin-right: 16px;
          cursor: pointer;
          &:last-child {
            margin-right: 0;
          }
        }
      }
      .summary {
        width: 23%;
      }
      .lang {
        width: 17%;
      }
      .lang-options {
        .select {
          .drop {
            padding-top: 30px;
          }
        }
      }
    }
    .addLine {
      &__button {
        cursor: pointer;
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        font-size: 35px;
        border: 1px solid #978D7E;
        opacity: 0.5;
        .plus {
          opacity: 0.5;
        }
      }
    }
  }

  .search {
    width: 98%;
    position: absolute;
    top: 28px;
    left: -2px;
    z-index: 10;
    border-left: 1px solid black;
    border-top: none;
    box-shadow: 0 2px 5px rgba(102, 86, 61, 0.6);
    padding: 3px 0 2px 2px;
  }

  .disabled{
    &-1,
    &-2,
    &-3{
      opacity: 0.5;
    }
  }

  .errorActive {
    background-color: #FEB4B0;
  }

  .errorsMessage {
    width: 300px;
    max-height: 250px;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    background-color: white;
    color: red;
    z-index: 20;
    border: 1px solid red;
    box-shadow: 0 0 15px red;
    text-align: center;
    padding-bottom: 15px;
    padding-top: 0;
    font-size: 18px;
    .message {
      position: relative;
      li {
        list-style: none;
        padding: 5px;
      }
      &__close {
        position: absolute;
        top: -15px;
        right: 7px;
        cursor: pointer;
      }
    }
  }

  .startProject {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 25px;
  }

  .createButton {
    text-align: center;
    background-color: #D15F45;
    color: white;
    width: 170px;
    height: 35px;
    border: none;
    border-radius: 10px;
    margin-top: 15px;
    box-shadow: 0 3px 5px rgba(102, 86, 61, 0.6);
    font-size: 15px;
  }

  .customClass {
    .vdp-datepicker__calendar {
      box-shadow: 0 0 5px rgba(102, 86, 61, 0.6);
      width: 250px;
      position: absolute;
      top: 0;
      left: 230px;
    }
    .vdp-datepicker__calendar .cell {
      height: 24px;
      line-height: 27px;
      font-size: 13px;
    }
  }

  .summaryInfo {
    margin-left: 30px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    position: sticky;
    top: calc(6vh + 7px);
    transition: all 0.7s;
    @media (max-width: 1024px) {
      margin-left: 0;
    }
    @media (max-width: 1400px) {
      display: none;
    }
    .orderSummary {
      color: #D15F45;
      font-weight: 800;
      font-size: 26px;
      margin-top: 5px;
    }
  }

</style>

