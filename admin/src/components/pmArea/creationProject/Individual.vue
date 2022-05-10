<template lang="pug">
  .content
    .cols
      .col
        .row
          .row__title Project Name:
          .row__value
            input(type="text" v-model="project.projectName" placeholder="Value")
        .row
          .row__title Industry:
          .row__value
            .drop
              SelectSingle(
                :hasSearch="true"
                placeholder="Option"
                :selectedOption="project.selectedIndustry.name || ''"
                :options="industries.map(i => i.name)"
                @chooseOption="setIndustry"
              )
        .row
          .row__title Deadline:
          .row__value
            .drop
              DatePicker(
                :value="new Date(project.deadline)"
                @confirm="updateProjectDate"
                format="DD-MM-YYYY, HH:mm"
                type="datetime"
                ref="deadline"
                :clearable="false"
                :confirm="true"
                confirm-text="Set date"
                prefix-class="xmx"
                placeholder="Date"
              )
      .splitter
      .col
        .row
          .row__title Client:
          .row__value
            input(type="text" v-model="client.name" placeholder="Value")
        .row
          .row__title Email:
          .row__value
            input(type="text" v-model="client.email" placeholder="Value")

    .create-btn
      Button(
        :isDisabled="isDisableSubmitButton || !!requestCounter"
        value="Submit"
        @clicked="createProject"
      )
</template>

<script>
import SelectSingle from "../../SelectSingle"
import DatePicker from 'vue2-datepicker'
import '../../../assets/scss/datepicker.scss'
import { mapActions, mapGetters } from "vuex"
import Button from "../../Button"

export default {
  name: "Individual",
  components: { Button, SelectSingle, DatePicker },
  props: [ "industries", 'user', 'extraOptions' ],
  data() {
    return {
      emailValidRegex: /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
      project: {
        projectName: "",
        selectedIndustry: {},
        deadline: ""
      },
      client: {
        name: '',
        email: ''
      }
    }
  },
  methods: {
    ...mapActions([ "alertToggle" ]),
    setIndustry({ option }) {
      this.project.selectedIndustry = this.industries.find(i => i.name === option)
    },
    updateProjectDate(date) {
      this.project.deadline = date
    },
    async createProject() {
      this.project.industry = this.project.selectedIndustry._id
      this.project = {
        ...this.project,
        ...this.extraOptions
      }
      const result = await this.$http.post("/pm-manage/new-project-individual", { project: this.project, client: this.client, user: this.user })
      const { data } = result
      if (data.status === 'success') {
        await this.$router.push(`/pangea-projects/draft-projects/Draft/details/${ data.data._id }`)
        this.alertToggle({ message: "New Project has been created", isShow: true, type: "success" })
        this.isRequestNow = false
      } else {
        this.alertToggle({ ...data, type: data.status, isShow: true })
        this.isRequestNow = false
      }
    }
  },
  computed: {
    ...mapGetters({
      requestCounter: 'getRequestCounter'
    }),
    isDisableSubmitButton() {
      const { projectName, selectedIndustry, deadline } = this.project
      const { name, email } = this.client

      return !projectName.trim()
          || !selectedIndustry.name
          || !deadline
          || !name.trim()
          || !this.emailValidRegex.test(email.toLowerCase())
    }
  }
}
</script>


<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.cols {
  display: flex;
  justify-content: space-between;
}

.row {
  display: flex;
  align-items: center;
  height: 32px;
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0px;
  }

  &__title {
    width: 100px;
    margin-right: 20px;
  }

  &__value {
    min-width: 220px;
  }
}

.drop {
  height: 32px;
  position: relative;
  width: 220px;
  background-color: white;
  border-radius: 2px;
}

.create-btn {
  margin-top: 25px;
  display: flex;
  justify-content: center;
}

.splitter {
  width: 1px;
  height: auto;
  background: $light-border;
}

input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 2px;
  box-sizing: border-box;
  padding: 0 7px;
  outline: none;
  height: 32px;
  transition: .1s ease-out;
  width: 220px;
  font-family: 'Myriad400';

  &:focus {
    border: 1px solid $border-focus;
  }
}
</style>