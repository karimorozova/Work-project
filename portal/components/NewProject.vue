<template lang="pug">
    .newRow
        table.table
            tr.header
                th.wordcount Wordcount
                th.key Key
                th.summary Summary
                th.lang.asterisk Target Lang
                th.file.asterisk File Type
                th.source Source
                th.target Target
                th
            tr(v-for="(project, index) in projects")
                td 
                    input.infoInput.savedDisable(value="" v-model="project.wordcount" readonly)
                td
                    input.infoInput(value="" v-model="project.key" :readonly="project.readonly" :class='{savedDisable: projects[index].icons[0].status}')
                td
                    input.infoInput(value="" v-model="project.summary.text" :readonly="project.readonly" :class='{errorActive: !project.summary.exist && !project.summary.text, savedDisable: projects[index].icons[0].status}')
                td.lang-options
                    .select
                        target-lang(
                            :projects="projects"
                            :index='index'
                            @addLanguage='changeLanguage'
                        )
                td
                    .select
                        files(
                            :projects="projects"
                            :index="index"
                            @addFile="chooseFile"
                        )
                td
                    input.infoInput(value="" v-model="project.source.text" :readonly="project.readonly" :class='{errorActive: !project.source.exist && !project.source.text, savedDisable: projects[index].icons[0].status}')
                td
                    input.infoInput(value="" v-model="project.target.text" :readonly="project.readonly" :class='{errorActive: !project.target.exist && !project.target.text, savedDisable: projects[index].icons[0].status}')
                td.icons 
                    span.icons__item(v-for="(icon, iconIndex) in project.icons" :class="{[`disabled-${iconIndex + 1}`]: icon.status }") 
                        img(:src='icon.icon' @click="projectAction(index, iconIndex)")
</template>

<script>
import axios from "axios";
import Datepicker from "./Datepicker.vue";
import moment from "moment";
import Multiselect from "vue-multiselect";
import VueLodash from "vue-lodash";
import TargetLang from "./TargetLang.vue";
import Files from "./Files.vue";
import Company from "./Company.vue";

export default {
  props: {
    projects: {
      type: Array
    },
    errors: {
      type: Array
    }
  },
  data() {
    return {
      languages: [],
      format: "dd/MM/yyyy",
      createDisable: true,
      fileTypeSelect: "",
      contactPerson: "",
      iconsStatus: [false, false, false],
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
      showErrors: false
    };
  },
  methods: {
    openPicker() {
      this.$refs.programaticOpen.showCalendar();
    },
    changeLanguage(data) {
      this.projects[data.index].targetLang.text = data.lang.symbol;
      this.projects[data.index].targetLang.xtrf = data.lang.xtrf;
      this.targetLangSelect = data.lang.symbol;
    },
    chooseFile(data) {
      this.projects[data.index].fileType.text = data.type;
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
    projectAction(index, iconIndex) {
      if (iconIndex == 2) {
        // if (this.projects.length > 1)
          this.$emit("projectManage", { index, element: this.projects[index] });
      } else if (iconIndex == 0 && !this.projects[index].icons[iconIndex].status) {
        this.$emit("errorsEmpty", { errors: [], index: index });
        if (!this.projects[index].summary.text) {
          this.$emit("newError", { error: "Please, fill the summary field.", title: "summary" });
        }
        if (!this.projects[index].targetLang.text) {
          this.$emit("newError", {
            error: "Please, choose the target language.", title: "targetLang"
          });
        }
        if (!this.projects[index].fileType.text) {
          this.$emit("newError", { error: "Please, choose the file type.", title: "fileType" });
        }
        if (!this.projects[index].source.text) {
          this.$emit("newError", { error: "Please, fill the source field.", title: "source" });
        }
        if (!this.projects[index].target.text) {
          this.$emit("newError", { error: "Please, fill the target field.", title: "target" });
        }
        if (this.errors.length) {
          this.showErrors = true;
          this.$emit("showWarning", {show: this.showErrors, index: index});
        } else {
          const url = "http://localhost:3005/request-qa";
          let value = this.projects[index].source.text;

          if (value.indexOf("http") == -1) {
            value = "http://" + value;
          }

          this.projects[index].wordcount = "Counting..";

          this.$axios
            .$post(url, { site: value })
            .then(res => {
              this.projects[index].wordcount = res.word;
            })
            .catch(err => {
              console.log(err);
            });
          this.projects[index].readonly = true;
          this.$emit("projectSave", {
            index,
            element: this.projects[index],
            saveIndex: 0,
            editIndex: 1
          });
        }
      } else if (iconIndex == 1 && !this.projects[index].icons[iconIndex].status) {
        this.projects[index].readonly = false;
        this.$emit('projectSave', {index, editIndex: 1, saveIndex: 0})
      }
    }
  },
  computed: {},
  mounted() {},
  components: {
    Datepicker,
    Multiselect,
    VueLodash,
    "target-lang": TargetLang,
    files: Files,
    company: Company
  }
};
</script>

<style lang="scss">

</style>

