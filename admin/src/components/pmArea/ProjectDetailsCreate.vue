<template lang="pug">
  .project-cd
    .project-cd__row
      input.project-cd__name( type="text" v-model="project.projectName" placeholder="Project Name" style="margin-bottom: 10px")
      .project-cd__checkbox
        CheckBox(
          :isChecked="project.isTest"
          :isWhite="true"
          @check="() => setTest(true)" @uncheck="() => setTest(false)"
        )
        .checkbox__label Test
    .project-cd__row
      .project-cd__input
        .input-title
          .input-title__text Client Name:
          span.require *
        .project-cd__input-icons
          //i.fas.fa-external-link-alt.icon-link(aria-hidden='true' @click="goToClientInfo")
          //input.project-cd__input-text2.project-cd__input-client(@click="goToClientInfo" type="text" :value="project.customer.name" readonly)

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
        //input.project-cd__input-text( v-if="project.industry.name"  type="text" :value="project.industry.name" disabled)
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
        // TODO: delete false!
        //input.project-cd__input-text(v-if="(isProjectFinished && project.clientBillingInfo) || (project._id && project.clientBillingInfo) " type="text" :value="(project.clientBillingInfo.name) " disabled)
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
          :disabled-date="notBeforeStartDate"
          :disabled="isBilling && isProjectFinished"
          prefix-class="xmx"
        )
      //.project-cd__input.checkbox
      //  CheckBox(
      //    :isChecked="project.isTest"
      //    @check="() => setTest(true)" @unCheck="() => setTest(false)"
      //  )
      //  span Test


        //input(type="checkbox" id="test" :checked="project.isTest" @change="setTest")
      //label(for="test") Test
    .project-cd__row
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

</template>

<script>
import SelectSingle from "../SelectSingle"
import Button from "../Button"
import CheckBox from "../CheckBox"
import ValidationErrors from "../ValidationErrors"

import DatePicker from 'vue2-datepicker';
import '../../assets/scss/datepicker.scss';
import { mapActions, mapGetters } from "vuex"
import moment from "moment"
export default {
  components: {
    SelectSingle,
    Button,
    CheckBox,
    DatePicker,
    ValidationErrors,
  },
  props: {

  },
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
        billingInfo: {},
        // clientProjectNumber: "",
        // template: "",
        // brief: "",
        // notes: "",
        // billingDate: "",
      },
      clients: [],
      areErrorsExist: false,
      errors: [],
    }
  },
  methods: {
    ...mapActions([
      "alertToggle",
      "setProjectDate",
      "setCurrentProject"
    ]),
    setTest(isCheck) {
      this.setValue('isTest',isCheck)
    },
    setCustomer({option}) {
      this.setValue('customer',option)

      if (this.billingInfoList.length === 1) {
        this.choseBillingInfo({ option: this.billingInfoList[0].name})
      } else {
        this.setValue('clientBillingInfo', {})
      }

      const industry = this.industriesList.length === 1
        ? this.industriesList[0]
        : {}

      this.setValue('selectedIndustry',industry)

    },
    setIndustry({option}) {
      console.log(option)
      this.setValue('selectedIndustry',option)
    },
    choseBillingInfo({option}) {
      const billingInfo = this.billingInfoList.find(({ name }) => name === option)
      this.setValue('clientBillingInfo', billingInfo)
    },
    updateProjectDate(date) {
      this.setValue('deadline', date)
    },
    setValue( prop, option ) {
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
        this.projectCreated({ project: newProject.data, customer: customer })
        this.alertToggle({ message: "New Project has been created", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Server error on creating a new Project", isShow: true, type: "error" })
      }
    },
    projectCreated({ project, customer }) {
      this.project = project
      this.project.customer = customer
      this.setCurrentProject(this.project)
      this.$router.push(`/pangea-projects/draft-projects/Draft/details/${ project._id }`)
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
    closeErrors () {
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

    },
  },
  async created() {
    await this.getCustomers()
  }
}
</script>

<style scoped lang="scss">
  @import "../../assets/scss/colors";
  .project-cd {
    padding: 20px;
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
      font-size: 19px;
      padding: 0 5px;
      height: 42px;
      width: 488px;
      border-radius: 4px;
      border: 1px solid $border;
      outline: none;
      color: $text;
      transition: .1s ease-out;

      &:focus {
        border: 1px solid $border-focus;
      }
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

  .project-cd__checkbox {
    display: flex;
    width: 120px;
  }

  .checkbox{
    &__label {
      display: flex;
      align-items: center;
      margin-left: 5px;
    }
  }

</style>