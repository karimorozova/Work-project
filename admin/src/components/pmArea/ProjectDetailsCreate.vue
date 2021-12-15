<template lang="pug">
  .creationProjectArea
    .project-cd
      .project-cd__row
        input.project-cd__name( type="text" v-model="project.projectName" placeholder="Project Name")

      .project-cd__row
        .project-cd__input
          .input-title
            .input-title__text Client Name:
            span.require *
          .project-cd__select-input
            SelectSingle(
              :selectedOption="project.customer.name"
              :options="clients"
              :hasSearch="true"
              placeholder="Name"
              @chooseOption="setCustomer"
            )

        .project-cd__input
          .input-title
            .input-title__text Industry:
            span.require *
          .project-cd__select-input
            SelectSingle(
              placeholder="Industry"
              :selectedOption="project.selectedIndustry.name"
              :options="industriesList"
              :isDisabled="!project.customer.name"
              @chooseOption="setIndustry"
            )
        .project-cd__input
          .input-title
            .input-title__text Billing Information:
            span.require *
          .project-cd__select-input
            SelectSingle(
              placeholder="Option"
              :selectedOption="(project.clientBillingInfo && project.clientBillingInfo.name) || ''"
              :options="billingInfoList.map(({name}) => name)"
              :isDisabled="!project.customer.name"
              @chooseOption="choseBillingInfo"
            )

        .project-cd__input
          .input-title
            .input-title__text Deadline:
            span.require *
          DatePicker(
            :value="new Date(project.deadline)"
            @confirm="updateProjectDate"
            format="DD-MM-YYYY, HH:mm"
            type="datetime"
            ref="deadline"
            :clearable="false"
            :confirm="true"
            confirm-text="Set date"
            :disabled-date="notBeforeNow"
            prefix-class="xmx"
          )

      .project-cd__rowButton
        Button(
          value="Create Project"
          @clicked="checkForErrors"
        )
      ValidationErrors(
        v-if="areErrorsExist"
        :errors="errors"
        :isAbsolute="true"
        @closeErrors="closeErrors"
      )

    .sub-information
      .sub-information__row
        .row__title Test:
        .row__data
          CheckBox(:isChecked="project.isTest", @check="() => setTest(true)",  @uncheck="() => setTest(false)")

      .sub-information__row
        .row__title Urgent:
        .row__data
          CheckBox(:isChecked="project.isUrgent", @check="() => setUrgentStatus(true)", @uncheck="() => setUrgentStatus(false)")

      .sub-information__row
        .row__title Pause:
        .row__data
          CheckBox(:isChecked="project.inPause", @check="() => setPause(true)",  @uncheck="() => setPause(false)")


      .sub-information__row
        .row__title Payment Profile:
        .row__data {{ project.clientBillingInfo.hasOwnProperty('name') ? project.clientBillingInfo.paymentType : '-'  }}

</template>

<script>
import SelectSingle from "../SelectSingle"
import Button from "../Button"
import CheckBox from "../CheckBox"
import ValidationErrors from "../ValidationErrors"

import DatePicker from 'vue2-datepicker'
import '../../assets/scss/datepicker.scss'
import { mapActions, mapGetters } from "vuex"
import moment from "moment"

export default {
  components: {
    SelectSingle,
    Button,
    CheckBox,
    DatePicker,
    ValidationErrors
  },
  props: {},
  data() {
    return {
      project: {
        projectName: "",
        customer: { name: "" },
        industry: "",
        startDate: new Date(),
        deadline: "",
        selectedIndustry: {},
        isTest: false,
        inPause: false,
        isUrgent: false,
        clientBillingInfo: {}
      },
      clients: [],
      areErrorsExist: false,
      errors: []
    }
  },
  methods: {
    ...mapActions([
      "alertToggle",
      "setProjectDate",
      "setCurrentProject"
    ]),
    notBeforeNow(date) {
      let d = new Date()
      d.setDate(d.getDate() - 1)
      return date < d
    },
    setTest(isCheck) {
      this.setValue('isTest', isCheck)
    },
    setUrgentStatus(bool) {
      this.setValue('isUrgent', bool)
    },
    setPause(bool) {
      this.setValue('inPause', bool)
    },
    setCustomer({ option }) {
      this.setValue('customer', option)

      if (this.billingInfoList.length === 1) {
        this.choseBillingInfo({ option: this.billingInfoList[0].name })
        if (this.billingInfoList[0].paymentType === 'PPP') this.project.inPause = true
      } else {
        this.setValue('clientBillingInfo', {})
      }

      const industry = this.industriesList.length === 1
          ? this.industriesList[0]
          : {}

      this.setValue('selectedIndustry', industry)
    },
    setIndustry({ option }) {
      this.setValue('selectedIndustry', option)
    },
    choseBillingInfo({ option }) {
      const billingInfo = this.billingInfoList.find(({ name }) => name === option)
      this.setValue('clientBillingInfo', billingInfo)
      this.project.inPause = billingInfo.paymentType === 'PPP';
    },
    updateProjectDate(date) {
      this.setValue('deadline', date)
    },
    setValue(prop, option) {
      this.project = { ...this.project, [prop]: option }
    },
    async getCustomers() {
      try {
        let result = await this.$http.get(`/active-clients`)
        this.clients = [ ...result.body ].sort((a, b) => {
          return a.name.localeCompare(b.name)
        })
      } catch (err) {
        this.alertToggle({ message: "Error on getting customers", isShow: true, type: "error" })
      }
    },
    async createProject() {
      this.project.dateFormatted = moment(this.project.startDate).format('YYYY MM DD')
      this.project.industry = this.project.selectedIndustry._id
      const customer = { ...this.project.customer }
      this.project.customer = customer._id
      try {
        const newProject = await this.$http.post("/pm-manage/new-project", { project: this.project, user: this.user })
        this.setCurrentProject(newProject.data)
        this.$router.push(`/pangea-projects/draft-projects/Draft/details/${ newProject.data._id }`)
        this.alertToggle({ message: "New Project has been created", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Server error on creating a new Project", isShow: true, type: "error" })
      }
    },
    async checkForErrors() {
      this.errors = []

      try {
        if (!this.project.projectName) {
          this.errors.push("Please, enter valid Project name.")
        }
        if (!this.project.startDate) this.errors.push("Please, set the start date.")
        if (!this.project.deadline) this.errors.push("Please, set the deadline date.")
        if (!this.project.customer.name) this.errors.push("Please, select a Client.")
        if (!this.project.selectedIndustry.hasOwnProperty('name')) this.errors.push("Please, choose an industry.")
        if (!this.project.clientBillingInfo || !this.project.clientBillingInfo.hasOwnProperty('_id')) this.errors.push("Please, choose an Billing Information.")
        if (this.errors.length) {
          this.areErrorsExist = true
          return
        }
        await this.createProject()
      } catch (err) {
        this.alertToggle({ message: "Server error on creating a new Project", isShow: true, type: "error" })
      }
    },
    closeErrors() {
      this.areErrorsExist = false
      this.errors = []
    }
  },
  computed: {
    ...mapGetters({
      industries: "getAllIndustries",
      user: "getUser"
    }),

    industriesList() {
      if (!this.project.customer.name) return []
      let res = []
      const { customer: { services } } = this.project
      for (let industry of services.map(i => i.industries[0])) {
        if (!res.length) res.push(industry)
        if (!res.map(i => i.name).includes(industry.name)) res.push(industry)
      }
      return res
    },

    billingInfoList() {
      if (!this.project.customer.billingInfo || !this.project.customer.billingInfo.length) return []

      const billingInfo = this.project.customer.billingInfo
      return billingInfo.map(({ _id, paymentType, name }) => ({ _id, paymentType, name }))

    }
  },
  async created() {
    await this.getCustomers()
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";

.creationProjectArea {
  display: flex;
}

.sub-information {
  box-sizing: border-box;
  padding: 25px 25px 5px 25px;
  box-shadow: $box-shadow;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 420px;
  width: 420px;
  background: white;
  border-radius: 4px;
  background: white;
  margin-left: 50px;
  height: fit-content;

  &__row {
    width: 100%;
    display: flex;
    height: 20px;
    align-items: center;
    margin-bottom: 20px;
  }

  .row {
    &__title {
      width: 150px;
    }

    &__data {
      width: 220px;
      position: relative;
    }
  }
}


.project-cd {
  padding: 25px;
  width: 1040px;
  box-shadow: $box-shadow;
  position: relative;
  background: white;
  border-radius: 4px;
  box-sizing: border-box;

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  &__input {
    width: 220px;
  }

  &__select-input {
    position: relative;
    height: 32px;
  }

  &__name {
    font-size: 18px;
    padding: 0 10px;
    height: 44px;
    width: 100%;
    border-radius: 4px;
    border: 1px solid $light-border;
    outline: none;
    color: $text;
    transition: .1s ease-out;
    font-family: 'Myriad600';
    display: flex;
    align-items: center;
  }
}

.input-title {
  display: flex;

  &__text {
    margin-bottom: 3px;
  }

  .require {
    color: $red;
    padding-left: 2px;
  }
}

.textCheckbox {
  padding: 0 8px;
  border-radius: 4px;
  height: 42px;
  transition: .2s ease-out;
  justify-content: center;
  color: $dark-border;
  cursor: default;
  display: flex;
  align-items: center;

  &__label {
    display: flex;
    align-items: center;
    margin-left: 6px;
    margin-bottom: 2px;
  }

  &:hover {
    color: $text;
  }
}

</style>