<template lang="pug">
  .content
    .row
      .row__title Project Name:
      .row__value
        input(type="text" v-model="project.projectName" placeholder="Value")
    .row
      .row__title Client:
      .row__value
        .drop
          SelectSingle(
            :selectedOption="project.customer.name || ''"
            :options="clients.map(i => i.name)"
            :hasSearch="true"
            placeholder="Option"
            @chooseOption="setCustomer"
          )
    .row
      .row__title Industry:
      .row__value
        .drop
          SelectSingle(
            placeholder="Option"
            :selectedOption="project.selectedIndustry.name || ''"
            :options="industriesList"
            :isDisabled="!project.customer.name"
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
    .create-btn
      Button(
        :isDisabled="isDisableSubmitButton"
        value="Submit"
        @clicked="createProject"
      )
</template>

<script>
import SelectSingle from "../../SelectSingle"
import DatePicker from 'vue2-datepicker'
import '../../../assets/scss/datepicker.scss'
import { mapActions } from "vuex"
import Button from "../../Button"

export default {
  name: "Classic",
  components: { Button, SelectSingle, DatePicker },
  props: [ 'clients', "industries", 'user', 'extraOptions' ],
  data() {
    return {
      project: {
        customer: {},
        projectName: "",
        selectedIndustry: {},
        deadline: ""
      }
    }
  },
  methods: {
    ...mapActions([ "alertToggle" ]),
    setCustomer({ option }) {
      this.project.customer = this.clients.find(i => i.name === option)
      this.project.selectedIndustry = {}
      if (this.industriesList.length === 1) this.setIndustry({ option: this.industriesList[0] })
    },
    setIndustry({ option }) {
      this.project.selectedIndustry = this.industries.find(i => i.name === option)
    },
    updateProjectDate(date) {
      this.project.deadline = date
    },
    // notBeforeNow(date) {
    //   let now = new Date()
    //   now.setDate(now.getDate() - 1)
    //   return date < now
    // },
    async createProject() {
      this.project.industry = this.project.selectedIndustry._id
      this.project.customer = this.project.customer._id
      this.project = {
        ...this.project,
        ...this.extraOptions
      }
      try {
        const newProject = await this.$http.post("/pm-manage/new-project", { project: this.project, user: this.user })
        await this.$router.push(`/pangea-projects/draft-projects/Draft/details/${ newProject.data._id }`)
        this.alertToggle({ message: "New Project has been created", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Server error on creating a new Project", isShow: true, type: "error" })
      }
    }
  },
  computed: {
    industriesList() {
      if (!this.project.customer.name) return []
      let res = []
      const { customer: { services, clientType } } = this.project
      if (clientType === 'Individual') return this.industries.map(i => i.name)

      for (let industry of services.map(i => i.industries[0])) {
        if (!res.length) res.push(industry)
        if (!res.map(i => i.name).includes(industry.name)) res.push(industry)
      }
      return res.map(i => i.name)
    },
    isDisableSubmitButton() {
      const { customer, projectName, selectedIndustry, deadline } = this.project
      return !customer.name || !projectName.trim() || !selectedIndustry.name || !deadline
    }
  }
}
</script>


<style lang="scss" scoped>
@import "../../../assets/scss/colors";

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
  border-radius: 4px;
}

.create-btn {
  margin-top: 25px;
  display: flex;
  justify-content: center;
}

input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 4px;
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