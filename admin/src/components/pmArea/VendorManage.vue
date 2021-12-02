<template lang="pug">
  .vendor-manage

    .vendor-manage__sender(v-if="isSender && toEmail" )
      MailSender(
        @close="closeSender"
        :to="toEmail"
        :subject="'Regarding: ' + `${ currentProject.projectId }` + ' - ' + `${ currentProject.projectName }`"
      )

    .vendor-manage__errors(v-if="areErrors")
      ValidationErrors(:isAbsolute="true" :errors="errors" @closeErrors="closeErrors")

    .vendor-manage__title
      span Vendor management
      .vendor-manage__close(@click.stop="closeVendorManage") &#215;

    .vendor-manage__body

      .vendor-manage__steps
        .tabs
          .tabs__option(v-for="(tab, index) in listOfStepsTitles" @click="setTab(index)" :class="{'tabs_active': tab === selectedTab}") {{ tab }}

        .blocks
          .block(v-for="stepsGroup of groupedByTaskId")
            .block__language
              .taskId {{ stepsGroup[0].taskId.substring(stepsGroup[0].taskId.length - 3) }}
              span(v-html="getLanguage( stepsGroup[0].sourceLanguage,  stepsGroup[0].targetLanguage)" )

            .block__steps
              .block__step(v-for="step of stepsGroup" @click="chooseStep(step)" :class="{'activeStep': currentStepId === step._id.toString()}")
                .block__name
                  .block__step-title {{ step.step.title }}
                  .block__step-status
                    span(:class="getStatusClass(step.status)") {{ step.status }}

                .block__step-vendor(v-if="step.vendor && !selectedVendors[step._id]") {{ step.vendor.firstName }} {{ step.vendor.surname || '' }}
                .block__step-vendor(v-else-if="selectedVendors[step._id]") {{ selectedVendors[step._id].name }}
                .block__step-vendor.empty(v-else) No vendor...
                //.block__step-vendorDelete(v-if="(step.vendor || selectedVendors[step._id]) && deleteVendorStatuses(step.status)" @click.stop="removeVendor(step._id)")
                  i(class="fas fa-times-circle")

      transition(name="fade")
        .vendor-manage__vendors(v-if="currentStep")
          .vendors__body
            .header
              .header__togglers
                .header__toggler(v-if="isEditable")
                  Toggler(:isDisabled="false" :isActive="isAllVendors" @toggle="toggleAllVendors")
                  .header__toggler-text All vendors

                .header__toggler(v-if="!isAllVendors" )
                  Toggler(:isDisabled="false" :isActive="isEditable" @toggle="toggleEditable")
                  .header__toggler-text Editable

              .header__description
                .header__description-text {{ selectedStep }}
                .header__description-text {{ selectedUnit }}
                .header__description-text {{ selectedIndustry }}
                .header__description-langs {{ currentStep.fullSourceLanguage.lang === selectedTarget ? selectedTarget : currentStep.fullSourceLanguage.lang + ' to ' + selectedTarget }}

              transition(name="fade")
                .header__options(v-if="isEditable && !isAllVendors")
                  .header__option
                    .header__option-title Target:
                    .drop
                      SelectSingle(
                        :hasSearch="true"
                        placeholder="Option"
                        :selectedOption="selectedTarget"
                        :options="allLanguages.map(i => i.lang)"
                        @chooseOption="setFakeTarget"
                      )
                  .header__option
                    .header__option-title Industry:
                    .drop
                      SelectSingle(
                        :hasSearch="true"
                        placeholder="Option"
                        :selectedOption="selectedIndustry"
                        :options="allIndustries.map(i => i.name)"
                        @chooseOption="setFakeIndustry"
                      )
                  .header__option
                    .header__option-title Step:
                    .drop
                      SelectSingle(
                        :hasSearch="true"
                        placeholder="Option"
                        :selectedOption="selectedStep"
                        :options="allSteps.map(i => i.title)"
                        @chooseOption="setFakeStep"
                      )
                  .header__option
                    .header__option-title Unit:
                    .drop
                      SelectSingle(
                        :hasSearch="true"
                        placeholder="Option"
                        :selectedOption="selectedUnit"
                        :options="allUnits.map(i => i.type)"
                        @chooseOption="setFakeUnit"
                      )

            .assignedVendor(v-if="currentStepId && ( steps.find(i => i._id.toString() === currentStepId).vendor || selectedVendors[currentStepId])" )
              .assignedVendor__user
                .assignedVendor__user-image(v-if="getAssignedVendorInfo().photo" )
                  .assignedVendor__user-circle1
                  .assignedVendor__user-circle2
                  img(:src="domain + getAssignedVendorInfo().photo")
                .user__fakeImage(:style="{'--bgColor': getBgColor(getAssignedVendorInfo()._id)[0], '--color': getBgColor(getAssignedVendorInfo()._id)[1]}" v-else) {{ getAssignedVendorInfo().name[0] }}
                  .assignedVendor__user-circle1
                  .assignedVendor__user-circle2

                .assignedVendor__user-description
                  .assignedVendor__user-name
                    router-link(class="link-to" target= '_blank' :to="{path: `/pangea-vendors/all/details/${ getAssignedVendorInfo()._id}`}")
                      span {{ getAssignedVendorInfo().name }}
                    span.assigned(style="margin-left: 10px;") [Assigned]
                  .assignedVendor__user-email(@click="openSender(getAssignedVendorInfo().email)")
                    span
                      i(class="far fa-envelope")
                    span {{ getAssignedVendorInfo().email }}

                  .buttons
                    .buttons__btn(v-if="deleteVendorStatuses(steps.find(i => i._id.toString() === currentStepId))" @click="removeVendor(currentStepId)") Remove
                    .buttons__btn(v-if="progressStepStatuses(steps.find(i => i._id.toString() === currentStepId))" @click="toggleAssignments") Reassign

              .assignedVendor__user(v-if="Object.keys(selectedReassignedVendor).length")
                .assignedVendor__user-image(v-if="getReAssignedVendorInfo().photo" )
                  .assignedVendor__user-circle1
                  .assignedVendor__user-circle3
                  img(:src="domain + getReAssignedVendorInfo().photo")
                .user__fakeImage(:style="{'--bgColor': getBgColor(getReAssignedVendorInfo()._id)[0], '--color': getBgColor(getReAssignedVendorInfo()._id)[1] }" v-else) {{ getReAssignedVendorInfo().name[0] }}
                  .assignedVendor__user-circle1
                  .assignedVendor__user-circle3

                .assignedVendor__user-description
                  .assignedVendor__user-name
                    router-link(class="link-to" target= '_blank' :to="{path: `/pangea-vendors/all/details/${ getReAssignedVendorInfo()._id}`}")
                      span {{ getReAssignedVendorInfo().name }}
                    span.newAssigned(style="margin-left: 10px;") [New assignments]
                  .assignedVendor__user-email(@click="openSender(getReAssignedVendorInfo().email)")
                    span
                      i(class="far fa-envelope")
                    span {{ getReAssignedVendorInfo().email }}

                  .buttons
                    .buttons__btn
                      .buttons__btn( @click="removeVendorAssignments()") Remove
                  //.buttons
                    .buttons__btn(v-if="deleteVendorStatuses(steps.find(i => i._id.toString() === currentStepId))" @click="removeVendor(currentStepId)") Remove
                    .buttons__btn(v-if="progressStepStatuses(steps.find(i => i._id.toString() === currentStepId))" @click="toggleAssignments") Reassign

            .assignmentsOptions(v-if="isReassignment")
              div
                .assignmentsOptions__text Reason:
                .drop2
                  SelectSingle(
                    placeholder="Option"
                    :options="reasons"
                    @chooseOption="setReason"
                    :selectedOption="reason"
                  )

              .assignmentsOptions__row
                .assignmentsOptions__text Start from the beginning?
                .assignmentsOptions__checks
                  .assignmentsOptions__check
                    CheckBox(@check="(e)=>toggle(e, 'isStart', 'yes')" @uncheck="(e)=>toggle(e, 'isStart', 'yes')" :isChecked="isStart.yes")
                    .assignmentsOptions__check-label Yes
                  .assignmentsOptions__check
                    CheckBox(@check="(e)=>toggle(e, 'isStart', 'no')" @uncheck="(e)=>toggle(e, 'isStart', 'no')" :isChecked="isStart.no")
                    .assignmentsOptions__check-label No

              .assignmentsOptions__row
                .assignmentsOptions__text Does this part have to be paid for?
                .assignmentsOptions__checks
                  .assignmentsOptions__check
                    CheckBox(@check="(e)=>toggle(e, 'isPay', 'yes')" @uncheck="(e)=>toggle(e, 'isPay', 'yes')" :isChecked="isPay.yes")
                    .assignmentsOptions__check-label Yes
                  .assignmentsOptions__check
                    CheckBox(@check="(e)=>toggle(e, 'isPay', 'no')" @uncheck="(e)=>toggle(e, 'isPay', 'no')" :isChecked="isPay.no")
                    .assignmentsOptions__check-label No
                  .assignmentsOptions__work
                    input.assignmentsOptions__percent(type="text" :value="progress" @input="setProgress" @click.stop="selectInputVal" ref="progress")
                    span.assignmentsOptions__check-label %  is done

              Button(value="Approve" @clicked="checkAssignmentsErrors"  :isDisabled="!reason || !Object.keys(selectedReassignedVendor).length" :outline="true")

            .vendors__search(v-if="(!cancelledStepStatuses(currentStep) && !progressStepStatuses(currentStep)) || isReassignment")
              .vendors__search-title Vendors:
              .vendors__search-serch
                input(type="text" ref="search" placeholder="🔎︎  Search" v-model="vendorsSearch")
                .clear-icon(v-if="vendorsSearch" @click="removeVendorsSearch")
                  i.fas.fa-backspace

            .vendors(v-if="(!cancelledStepStatuses(currentStep) && !progressStepStatuses(currentStep)) || isReassignment" :style="getMaxHeight()")
              .vendor(v-if="listOfVendors.length" v-for="item in listOfVendors")
                .vendor__row1
                  .vendor__user
                    .user
                      .user__image(v-if="item.photo")
                        img(:src="domain + item.photo")
                      .user__fakeImage(:style="{'--bgColor': getBgColor(item._id)[0], '--color': getBgColor(item._id)[1]  }" v-else) {{ item.name[0] }}

                      .user__description
                        .user__name
                          router-link(class="link-to" target= '_blank' :to="{path: `/pangea-vendors/all/details/${item._id}`}")
                            span {{ item.name }}

                        .user__email(@click="openSender(item.email)")
                          span
                            i(class="far fa-envelope")
                          span {{ item.email }}

                        .buttons
                          .buttons__btn(v-if="!isReassignment" @click="setVendorToStep({_id: item._id, name: item.name, email: item.email, photo: item.photo, nativeRate: item.nativeRate })") Assign
                          .buttons__btn(v-if="isReassignment" @click="setVendorToReassignStep({_id: item._id, name: item.name, email: item.email, photo: item.photo, nativeRate: item.nativeRate })") Assign
                          .buttons__btn() Details (soon)

                  .vendor__stats(v-if="!isReassignment")
                    .stats__row.border-bottom
                      .stats__colLong
                        .stats__col-bigTitle TOTAL PAY.
                        .stats__col-bigValue
                          .stats__col-bigValue-num {{ item.price }}
                          .stats__col-bigValue-currency
                            span.currency(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
                          .stats__col-bigValue-image(v-if="(item.total / 2) < item.price" )
                            img(:src="icons.down")
                          .stats__col-bigValue-image(v-if="item.price > 0 && (item.total / 2) > item.price" )
                            img(:src="icons.up")

                    .stats__row
                      .stats__col.border-right
                        .stats__col-smallValue {{ item.marginPercent }}
                          span.currency %
                        .stats__col-smallTitle MARGIN
                      .stats__col
                        .stats__col-smallValue {{ item.margin }}
                          span.currency(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
                        .stats__col-smallTitle MARGIN

                  .vendor__stats
                    .stats__row.border-bottom
                      .stats__colLong
                        .stats__col-bigTitle RATE
                        .stats__col-bigValue
                          .stats__col-bigValue-num {{ item.rate }}
                          .stats__col-bigValue-currency
                            span.currency(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
                          .stats__col-bigValue-image(v-if="item.benchmarkMargin < 0" )
                            img(:src="icons.down")
                          .stats__col-bigValue-image(v-if="item.benchmarkMargin > 0" )
                            img(:src="icons.up")

                    .stats__row
                      .stats__col.border-right
                        .stats__col-smallValue {{ item.benchmark }}
                          span.currency(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
                        .stats__col-smallTitle B.MARK
                      .stats__col
                        .stats__col-smallValue {{ item.benchmarkMargin }}
                          span.currency(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
                        .stats__col-smallTitle B.MARGIN

                  .vendor__marks
                    .marks__row
                      .marks__title TQI
                      .marks__value {{ item.tqi }}
                    .marks__row
                      .marks__title LQA1
                      .marks__value {{ item.lqa1 }}
                    .marks__row
                      .marks__title LQA2
                      .marks__value {{ item.lqa2 }}
                    .marks__row
                      .marks__title LQA3
                      .marks__value {{ item.lqa3 }}

              .noVendors(v-if="!listOfVendors.length" ) No vendors...

        .vendor-manage__vendors(v-else)
          .logo


    .vendor-manage__footer
      Button(@clicked="saveVendors" :isDisabled="isReassignment" :value="'Approve assignments'")
      Button(:value="'Cancel'" @clicked="closeVendorManage" :outline="true")

</template>

<script>
import Tabs from '../Tabs'
import Button from "../Button"
import { mapActions, mapGetters } from "vuex"
import _ from "lodash"
import { setStepVendors } from "../../vuex/general/actions"
import CheckBox from "../CheckBox"
import Toggler from "../Toggler"
import SelectSingle from "../SelectSingle"
import currencyIconDetected from "../../mixins/currencyIconDetected"
import { rateExchangeVendorOntoProject } from "../../../helpers/commonFunctions"
import ValidationErrors from "../ValidationErrors"
import getBgColor from "../../mixins/getBgColor"
import MailSender from "../MailSender"

export default {
  mounted() {
    this.domain = __WEBPACK__API_URL__
  },
  mixins: [ currencyIconDetected, getBgColor ],
  props: {
    steps: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      isSender: false,
      toEmail: null,
      domain: "http://localhost:3001",
      reasons: [ 'Unresponsive', 'Technical issues', 'Personal issues' ],
      reason: null,
      isStart: { yes: false, no: true },
      isPay: { yes: true, no: false },
      enteredProgress: "",
      errors: [],

      selectedTab: 'All Steps',
      currentStepId: null,
      currentStep: null,

      optionDefault: true,
      optionLanguages: true,
      optionIndustries: true,

      areErrors: false,
      isEditable: false,
      isAllVendors: false,
      isReassignment: false,

      selectedTarget: '',
      selectedUnit: '',
      selectedStep: '',
      selectedIndustry: '',

      allVendors: [],
      selectedVendors: {},
      selectedReassignedVendor: {},
      vendorsSearch: '',
      icons: {
        up: require("../../assets/images/latest-version/up.png"),
        down: require("../../assets/images/latest-version/down.png")
      }
    }
  },
  methods: {
    openSender(to) {
      this.isSender = true
      this.toEmail = to
    },
    closeSender() {
      this.isSender = false
      this.toEmail = null
    },
    closeErrors() {
      this.areErrors = false
    },
    async checkAssignmentsErrors() {
      const { payablesUnit } = this.currentStep
      this.errors = []
      if (payablesUnit.type === 'CAT Wordcount' && this.enteredProgress > this.getCurrentProgress()) {
        this.errors.push("Entered progress cannot be higher than current progress.")
        this.enteredProgress = ""
      }
      if (this.enteredProgress >= 100) {
        this.errors.push("Entered progress cannot be higher than completed progress.")
        this.enteredProgress = ""
      }

      if (this.errors.length) return this.areErrors = true
      await this.saveAssignment()
    },
    async saveAssignment() {
      const reassignData = {
        projectId: this.currentProject._id,
        stepId: this.currentStepId,
        progress: this.enteredProgress || this.getCurrentProgress() || 0,
        isStart: this.isStart.yes,
        isPay: this.isPay.yes,
        reason: this.reason,
        vendor: this.selectedReassignedVendor
      }
      try {
        await this.reassignVendor(reassignData)
        this.setTab(0)
        this.isReassignment = false
      } catch (err) {
      }
    },
    setProgress(e) {
      const { value } = e.target
      const regex = /^[0-9]+$/
      const characters = value.split("").filter(item => regex.test(item))
      const clearedValue = characters.join("")
      this.enteredProgress = clearedValue.length > 3 ? clearedValue.slice(0, 3) : clearedValue
      this.enteredProgress = this.enteredProgress > 100 ? 100 : this.enteredProgress
      this.$refs.progress.value = this.enteredProgress
    },
    getCurrentProgress() {
      const { progress } = this.currentStep
      return progress.totalWordCount
          ? +(progress.wordsDone / progress.totalWordCount * 100).toFixed(2)
          : progress
    },
    selectInputVal() {
      this.$refs.progress.select()
    },
    toggle(e, prop, key) {
      if (this[prop][key]) return
      this[prop] = Object.keys(this[prop]).reduce((acc, prev) => {
        prev === key ? acc[prev] = true : acc[prev] = false
        return { ...acc }
      }, {})
    },
    setReason({ option }) {
      this.reason = option
      this.$refs.progress.value = this.enteredProgress || this.getCurrentProgress() || 0
    },
    toggleAssignments() {
      if (this.isReassignment) this.removeVendorAssignments()
      this.isReassignment = !this.isReassignment
    },
    getMaxHeight() {
      let max = 510
      if (this.isEditable && !this.isAllVendors) max = max - 118
      if (this.currentStepId && (this.steps.find(i => i._id.toString() === this.currentStepId).vendor || this.selectedVendors[this.currentStepId])) max = max - 110
      if (this.isReassignment) max = max - 119
      return 'max-height:' + max + 'px'
    },
    getReAssignedVendorInfo() {
      const { _id, name, email, photo } = this.selectedReassignedVendor[this.currentStepId]
      return {
        _id,
        name,
        email,
        photo
      }
    },
    getAssignedVendorInfo() {
      const step = this.steps.find(i => i._id.toString() === this.currentStepId)
      const res = {}

      if ((!step.vendor && this.selectedVendors[this.currentStepId]) || (step.vendor && this.selectedVendors[this.currentStepId])) {
        resSetter(this.selectedVendors[this.currentStepId])
      } else if (step.vendor && !this.selectedVendors[this.currentStepId]) {
        resSetter(step.vendor)
      }
      return res

      function resSetter(dataIn) {
        const { email, _id, photo } = dataIn
        res._id = _id
        res.photo = photo
        res.name = dataIn.name || `${ dataIn.firstName } ${ dataIn.surname || '' }`
        res.email = email
      }
    },
    deleteVendorStatuses({ status }) {
      const STATUSES = [ 'Created', 'Approved', 'Rejected', 'Request Sent', 'Ready to Start', 'Waiting to Start' ]
      return STATUSES.includes(status)
    },
    progressStepStatuses({ status }) {
      const STATUSES = [ 'In progress' ]
      return STATUSES.includes(status)
    },
    cancelledStepStatuses({ status }) {
      const STATUSES = [ 'Cancelled', 'Cancelled Halfway', 'Completed' ]
      return STATUSES.includes(status)
    },
    removeVendorAssignments() {
      this.selectedReassignedVendor = {}
      this.isStart = { yes: false, no: true }
      this.isPay = { yes: true, no: false }
      this.enteredProgress = ''
    },
    async removeVendor(stepId) {
      if (this.selectedVendors[stepId]) {
        const copy = { ...this.selectedVendors }
        delete copy[stepId]
        this.selectedVendors = copy
      } else {
        try {
          const updatedProject = await this.$http.post('/pm-manage/remove-vendor-from-step', {
            projectId: this.currentProject._id,
            stepId
          })
          this.setCurrentProject(updatedProject.data)
          this.currentStep = updatedProject.data.steps.find(item => item._id.toString() === stepId)
        } catch (err) {
          this.alertToggle({ message: "Error can't remove Vendor from Step", isShow: true, type: 'success' })
        }
      }
    },
    removeVendorsSearch() {
      this.vendorsSearch = ''
    },
    setFakeTarget({ option }) {
      this.selectedTarget = option
    },
    setFakeIndustry({ option }) {
      this.selectedIndustry = option
    },
    setFakeStep({ option }) {
      this.selectedStep = option
    },
    setFakeUnit({ option }) {
      this.selectedUnit = option
    },
    toggleEditable() {
      if (this.isEditable) this.isAllVendors = false
      this.isEditable = !this.isEditable
    },
    toggleAllVendors() {
      if (this.isAllVendors) {
        this.isEditable = false
      }
      this.selectedTarget = this.currentStep.fullTargetLanguage.lang
      this.selectedUnit = this.currentStep.payablesUnit.type
      this.selectedStep = this.currentStep.step.title
      this.selectedIndustry = this.currentProject.industry.name

      this.isAllVendors = !this.isAllVendors
    },
    getLanguage(s, t) {
      return `<span>${ s }</span><span style="font-size: 12px;color: #9c9c9c;margin: 0 4px;"><i class="fas fa-angle-double-right"></i></span><span>${ t }</span>`
    },
    getStatusClass(status) {
      switch (status) {
        case 'Created':
        case 'Request Sent':
          return 'todo'

        case 'Approved':
        case 'Ready to Start':
        case 'Waiting to Start':
        case 'In progress':
          return 'doing'

        case 'Completed':
          return 'done'

        case 'Cancelled':
        case 'Cancelled Halfway':
        case 'Rejected':
          return 'stop'
      }
    },
    async saveVendors() {
      try {
        this.setStepVendors({ projectId: this.$route.params.id, stepsVendors: this.selectedVendors })
        this.selectedVendors = {}
      } catch (err) {
        this.alertToggle({ message: 'Error in assigns vendors', isShow: true, type: "error" })
      } finally {
        this.closeVendorManage()
      }
    },
    setVendorToStep(vendor) {
      this.$set(this.selectedVendors, this.currentStepId, vendor)
    },
    setVendorToReassignStep(vendor) {
      this.selectedReassignedVendor = {
        [this.currentStepId]: vendor
      }
    },
    setTab(index) {
      this.selectedTab = this.listOfStepsTitles[index]
      this.currentStepId = null
      this.currentStep = null
    },
    chooseStep(step) {
      this.isAllVendors = false
      this.isEditable = false
      this.isReassignment = false
      this.removeVendorAssignments()

      if (this.currentStepId === step._id.toString()) {
        this.currentStepId = null
        this.currentStep = null
        this.selectedTarget = ''
        this.selectedUnit = ''
        this.selectedStep = ''
        this.selectedIndustry = ''
      } else {
        this.currentStepId = step._id.toString()
        this.currentStep = step
        this.selectedTarget = step.fullTargetLanguage.lang
        this.selectedUnit = step.payablesUnit.type
        this.selectedStep = step.step.title
        this.selectedIndustry = this.currentProject.industry.name
        this.vendorsSearch = ''
      }
    },
    closeVendorManage() {
      this.$emit('closeVendorManage')
    },
    async getVendorsForSteps() {
      try {
        const allVendors = await this.$http.get('/pm-manage/vendors-for-steps')
        this.allVendors = allVendors.data
      } catch (err) {
        console.log('Error get vendors')
      }
    },
    marginCalcPercent(receivables, payables) {
      let percent = NaN
      percent = 100 - (payables / receivables) * 100
      return Number.isNaN(percent) || !isFinite(percent) ? 0 : percent.toFixed(0)
    },
    ...mapActions({
      alertToggle: 'alertToggle',
      setStepVendors: 'setStepVendors',
      setCurrentProject: 'setCurrentProject',
      reassignVendor: "reassignVendor"
    })
  },
  computed: {
    ...mapGetters({
      currentProject: 'getCurrentProject',
      allLanguages: "getAllLanguages",
      allUnits: "getAllUnits",
      allSteps: "getAllSteps",
      allIndustries: "getAllIndustries"
    }),
    progress() {
      return this.enteredProgress || this.getCurrentProgress()
    },
    groupedByTaskId() {
      const steps = this.selectedTab === 'All Steps' ? this.steps : this.steps.filter(({ step }) => step.title === this.selectedTab)
      return Object.values(_.groupBy(steps, ({ taskId }) => taskId))
    },
    listOfStepsTitles() {
      let list = new Set([ 'All Steps' ])
      for (const item of this.steps) list.add(item.step.title)
      return [ ...list ]
    },
    listOfVendors() {
      if (!this.allVendors.length || !this.currentStepId || !this.currentProject) return []
      let vendors = this.allVendors
      const query = `${ this.currentStep.fullSourceLanguage.lang }-${ this.selectedTarget }-${ this.selectedStep }-${ this.selectedUnit }-${ this.selectedIndustry }`
      const { projectCurrency, crossRate } = this.currentProject
      const { finance, payablesUnit, vendor, taskId } = this.currentStep

      //searching ==>
      if (!this.isAllVendors) {
        vendors = vendors.filter(item => item.rates.pricelistTable
            .map(rate => `${ rate.sourceLanguage.lang }-${ rate.targetLanguage.lang }-${ rate.step.title }-${ rate.unit.type }-${ rate.industry.name }`)
            .includes(query))
      }

      // same Vendor in 2 steps ==>
      const stepsIds = this.steps.filter(i => i.taskId === taskId).map(i => i._id.toString())
      if (stepsIds.length > 1) {
        const selectedVendors = Object.keys(this.selectedVendors).length
            ? Object.entries(this.selectedVendors)
                .map(i => {
                  const [ _id, rest ] = i
                  return { _id, vendor: rest.name }
                })
                .filter(i => stepsIds.includes(i._id.toString()))
                .map(i => i.vendor)
            : []
        const vendorsNames = [
          ...this.steps
              .filter(i => stepsIds.includes(i._id.toString()))
              .map(i => i.vendor && `${ i.vendor.firstName } ${ i.vendor.surname || '' }`)
              .filter(Boolean),
          ...selectedVendors
        ]
        if (vendorsNames.length) {
          vendors = vendors.filter(({ name }) => !vendorsNames.includes(name))
        }
      }
      if (this.vendorsSearch.length) {
        vendors = vendors.filter(({ name }) => name.toUpperCase().includes(this.vendorsSearch.toUpperCase()))
      }
      // same Vendor in 2 steps <==

      if (vendor && !this.selectedVendors[this.currentStepId]) {
        vendors = vendors.filter(({ name }) => name.toUpperCase() !== (`${ vendor.firstName } ${ vendor.surname || '' }`).toUpperCase())
      } else if (vendor && this.selectedVendors[this.currentStepId]) {
        vendors = vendors.filter(({ name }) => name.toUpperCase() !== (this.selectedVendors[this.currentStepId].name).toUpperCase())
      } else if (!vendor && this.selectedVendors[this.currentStepId]) {
        vendors = vendors.filter(({ name }) => name.toUpperCase() !== (this.selectedVendors[this.currentStepId].name).toUpperCase())
      }

      if (this.selectedReassignedVendor[this.currentStepId]) {
        vendors = vendors.filter(({ name }) => name.toUpperCase() !== (this.selectedReassignedVendor[this.currentStepId].name).toUpperCase())
      }
      // searching <==

      vendors = vendors.map(item => {
        const { name, email, rates: { pricelistTable } } = item

        const rates = pricelistTable.find(rate => `${ rate.sourceLanguage.lang }-${ rate.targetLanguage.lang }-${ rate.step.title }-${ rate.unit.type }-${ rate.industry.name }` === query)

        const rate = rates
            ? rateExchangeVendorOntoProject(projectCurrency, 'EUR', +rates.price, crossRate)
            : 0

        const quantity = payablesUnit.type === 'CAT Wordcount' ? finance.Wordcount.receivables : finance.Quantity.payables

        return {
          _id: item._id,
          photo: item.photo,
          rate,
          nativeRate: rates ? rates.price : 0,
          benchmark: rates ? rates.benchmark : 0,
          benchmarkMargin: rates ? rates.benchmarkMargin : 0,
          tqi: rates ? rates.tqi : 0,
          lqa1: rates ? rates.lqa1 : 0,
          lqa2: rates ? rates.lqa2 : 0,
          lqa3: rates ? rates.lqa3 : 0,
          name,
          email,
          marginPercent: rates ? this.marginCalcPercent(finance.Price.receivables, quantity * rate) : 0,
          margin: rates ? +(finance.Price.receivables - (quantity * rate)).toFixed(2) : 0,
          price: rates ? +(quantity * rate).toFixed(2) : 0
        }
      })

      return vendors.sort((a, b) => a.price - b.price)
    }
  },
  async created() {
    await this.getVendorsForSteps()
  },
  components: {
    MailSender,
    ValidationErrors,
    SelectSingle,
    Toggler,
    CheckBox,
    Tabs,
    Button
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";

.assignmentsOptions {
  display: flex;
  justify-content: space-between;
  background: $table-list;
  padding: 15px;
  align-items: center;
  margin-top: 20px;

  &__check-label {
    color: $dark-border;
    margin-top: 1px;
  }

  &__percent {
    width: 70px;
    margin-right: 6px;
  }

  &__text {
    margin-bottom: 6px;
  }

  &__checks {
    display: flex;
    gap: 15px;
  }

  &__check {
    margin-top: 1px;
  }
}

.assignedVendor {
  margin-top: 20px;
  padding: 10px 15px;
  border: 1px dotted $light-border;
  display: flex;
  justify-content: space-between;

  &__user {
    display: flex;
    gap: 15px;
    width: 380px;
    max-width: 380px;
    align-items: center;

    &-circle1 {
      position: absolute;
      height: 16px;
      width: 16px;
      border-radius: 20px;
      background-color: white;
      right: -8px;
      top: 12px;
    }

    &-circle2 {
      position: absolute;
      height: 10px;
      width: 10px;
      border-radius: 10px;
      background-color: $medium-green;
      right: -5px;
      top: 15px;
    }

    &-circle3 {
      position: absolute;
      height: 10px;
      width: 10px;
      border-radius: 10px;
      background-color: $medium-red;
      right: -5px;
      top: 15px;
    }

    &-name {
      font-family: Myriad600;
      margin-bottom: 3px;
    }

    &-email {
      color: #3333;
      width: fit-content;
      transition: .2s ease-out;
      display: flex;
      gap: 5px;

      i {
        margin-top: 1px;
      }

      &:hover {
        cursor: pointer;
        color: $text;
      }
    }

    &-image {
      height: 65px;
      width: 65px;
      min-width: 65px;
      position: relative;

      img {
        width: 100%;
        height: 100%;
        border-radius: 8px;
        object-fit: cover;
      }
    }

  }
}

.assigned {
  margin-left: 5px;
  color: $dark-border;
  font-family: 'Myriad300';
}

.newAssigned {
  margin-left: 5px;
  color: $dark-border;
  font-family: 'Myriad300';
}

.buttons {
  margin-top: 6px;
  display: flex;
  justify-content: start;
  gap: 12px;

  &__btn {
    transition: .2s ease-out;
    text-align: center;
    width: 100px;
    height: 26px;
    font-size: 14px;
    line-height: 26px;
    border-radius: 2px;
    background-color: #fff;
    outline: none;
    letter-spacing: .2px;
    cursor: pointer;
    box-shadow: $box-shadow;

    &:hover {
      background-color: $light-border;
    }
  }
}

.availability {
  color: #4ba5a557;
}

.marks {
  &__row {
    display: flex;
    margin-bottom: 2px;
  }

  &__title {
    color: #3333;
    width: 45px;
  }

  &__value {
    color: $dark-border;
  }
}

.vendor {
  padding: 10px 15px;
  border: 1px dotted $light-border;
  margin-bottom: 10px;
  border-radius: 4px;
  //transition: .2s ease-out;

  //&:hover {
  //  border: 1px solid $light-border;
  //}

  &__row1 {
    display: flex;
  }

  //&__row2 {
  //  margin-top: 15px;
  //  border-top: 1px solid $light-border;
  //  padding-top: 15px;
  //  display: flex;
  //  align-items: center;
  //  justify-content: space-between;
  //}

  &__stats {
    border: 1px solid $light-border;
    height: fit-content;
    margin-left: 15px;
  }

  &__marks {
    margin-top: 5px;
    margin-left: 20px;
  }

  &__user {
    display: flex;
  }
}

.stats {
  &__row {
    display: flex;
    justify-content: space-evenly;
  }

  &__col {
    display: flex;
    width: 80px;
    flex-direction: column;
    align-items: center;
    padding: 6px 0 4px 0;
    text-align: center;

    &-bigTitle {
      font-size: 14px;
      color: #3333;
      font-family: Myriad600;
      letter-spacing: .2px;
    }

    &-bigValue {
      display: flex;
      align-items: center;

      &-currency {
        font-size: 14px;
        color: $dark-border;
        margin-left: 3px;
      }

      &-num {
        //font-family: 'Myriad600';
      }

      &-image {
        height: 16px;
        margin-left: 8px;
      }

    }

    &-smallTitle {
      color: #3333;
      font-size: 12px;
      margin-top: 1px;
      letter-spacing: .2px;
    }

    &-smallValue {
      color: $text;
      display: flex;
      gap: 4px;
    }
  }

  &__colLong {
    height: fit-content;
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 9px 8px 8px 8px;
    gap: 8px;
    align-items: center;
  }
}

.user {
  display: flex;
  gap: 15px;
  width: 330px;
  align-items: center;

  &__description {
    width: 250px;
  }

  &__rating {
    color: #4ba5a557;
    margin-top: 10px;
  }

  &__name {
    font-family: Myriad600;
    margin-bottom: 3px;
  }

  &__email {
    color: #3333;
    width: fit-content;
    transition: .2s ease-out;
    display: flex;
    gap: 5px;

    i {
      margin-top: 1px;
    }

    &:hover {
      cursor: pointer;
      color: $text;
    }
  }

  &__fakeImage {
    height: 65px;
    width: 65px;
    min-width: 65px;
    border-radius: 8px;
    font-size: 28px;
    background: var(--bgColor);
    color: var(--color);
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  &__image {
    height: 65px;
    width: 65px;
    min-width: 65px;

    img {
      width: 100%;
      height: 100%;
      border-radius: 8px;
      object-fit: cover;
    }
  }
}

.logo {
  background-image: url("../../assets/images/balloons-old.png");
  height: 100%;
  width: 100%;
  background-size: 20%;
  background-position: 50%;
  background-repeat: no-repeat;
  min-height: 150px;
  filter: grayscale(100%);
  opacity: 0.2;
}

.header {
  &__togglers {
    display: flex;
    justify-content: end;
    gap: 30px;
  }

  &__toggler {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: end;
    padding-bottom: 6px;

    &-text {
      margin-top: 2px;
      cursor: default;
    }
  }

  &__options {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    border: 2px solid $table-list;
    padding-top: 20px;
    background-color: #fff;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    padding-bottom: 10px;
  }

  &__option {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;

    &-title {
      width: 65px;
    }
  }

  &__description {
    display: flex;
    gap: 12px;
    justify-content: center;
    padding: 12px;
    background: $table-list;

    &-text {
      padding-right: 12px;
      border-right: 1px solid $dark-border;
    }
  }
}

.vendors {
  overflow-y: auto;

  &__body {
    padding-left: 25px;
  }

  &__search {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 20px 0;
    border-bottom: 1px solid $border;
    padding-bottom: 20px;

    &-title {
      font-size: 18px;
      font-family: 'Myriad600';
    }

    &-serch {
      position: relative;
    }
  }
}

.blocks {
  background: white;
}

.block {
  &__name {
    width: 160px;
    margin-right: 15px;
  }

  &__vendorDelete {
    height: 15px;
    width: 15px;
  }

  &__steps {
    margin-left: 20px;
    padding-left: 20px;
    border-left: 1px solid $light-border;
    padding-bottom: 12px;
    padding-top: 12px;
  }

  &__step {
    margin-bottom: 8px;
    padding: 4px 10px 3px 15px;
    border: 1px dotted lightgray;
    transition: .1s ease-out;
    display: flex;
    align-items: center;

    &-title {
      text-align: center;
    }

    &-status {
      text-align: center;
      margin-top: 1px;
    }

    &-vendor {
      width: 170px;
      text-align: center;
    }

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      border: 1px solid lightgray;
      cursor: pointer;
    }

  }

  &__language {
    font-size: 14px;
    width: 150px;
    background: $table-list;
    padding: 4.5px 10px 1px;
    box-sizing: border-box;
    display: flex;
    gap: 12px;
    border-bottom: 2px solid $light-border;

    .taskId {
      color: $border;
    }
  }
}

.vendor-manage {
  position: relative;

  &__sender {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2000;
    width: 750px;
  }

  &__title {
    font-size: 18px;
    font-family: Myriad600;
    margin-bottom: 20px;
  }

  &__close {
    position: absolute;
    top: -10px;
    right: -10px;
    font-size: 22px;
    cursor: pointer;
    height: 22px;
    width: 22px;
    justify-content: center;
    display: flex;
    align-items: center;
    font-family: Myriad900;
    opacity: 0.8;
    transition: ease 0.2s;

    &:hover {
      opacity: 1
    }
  }

  &__body {
    display: flex;
  }

  &__steps {
    width: 43%;
    height: 667px;
    overflow-y: auto;
    display: flex;
  }

  &__vendors {
    width: 57%;
    border-left: 1px solid $border;
  }

  &__step-info,
  &__options {
    display: flex;
    gap: 25px;
  }

  &__step-info {
    margin: 10px 0;
  }

  &__vendor {
    display: flex;
    align-items: center;
    gap: 25px;
    margin: 10px 0;
  }

  &__footer {
    display: flex;
    gap: 20px;
    margin-top: 15px;
  }
}

.tabs {
  width: 160px;
  margin-right: 25px;

  &__option {
    cursor: pointer;
    border-left: none;
    border-top: 1px solid $border;
    border-right: 1px solid $border;
    border-left: 1px solid $border;
    border-bottom: none;
    background-color: $white;
    padding: 11px 10px 10px 15px;
    display: flex;
    align-items: center;
    transition: .1s ease-out;

    &:hover {
      color: $text;
      background-color: $table-list-hover;
    }

    &:last-child {
      border: 1px solid $border;
    }
  }

  &_active {
    background-color: $border;
    color: $text;

    &:hover {
      background-color: $border;
    }
  }
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
  width: 200px;
  font-family: 'Myriad400';

  &:focus {
    border: 1px solid $border-focus;
  }
}

.activeStep {
  border: 1px solid $border-focus;

  &:hover {
    border: 1px solid $border-focus;
  }
}

.todo {
  padding: 1px 5px;
  background: $table-list;
  color: $dark-border;
  font-size: 11px;
  border-radius: 4px;
}

.doing {
  padding: 1px 5px;
  background: $table-list;
  color: $yellow;
  font-size: 11px;
  border-radius: 4px;
}

.done {
  padding: 1px 5px;
  background: $table-list;
  color: $green;
  font-size: 11px;
  border-radius: 4px;
}

.stop {
  padding: 1px 5px;
  background: $table-list;
  color: $red;
  font-size: 11px;
  border-radius: 4px;
}

.empty {
  opacity: .3;
}

.drop {
  height: 32px;
  position: relative;
  width: 220px;
  background-color: white;
  border-radius: 4px;
}

.drop2 {
  height: 32px;
  position: relative;
  width: 200px;
  background-color: white;
  border-radius: 4px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.fa-backspace {
  font-size: 16px;
  transition: .2s ease-out;
  color: $dark-border;
  cursor: pointer;
  position: absolute;
  right: 8px;
  top: 8px;

  &:hover {
    color: $text;
  }
}

.fa-times-circle {
  font-size: 15px;
  transition: .2s ease-out;
  color: $dark-border;
  cursor: pointer;
  //position: absolute;
  //right: 8px;
  //top: 8px;

  &:hover {
    color: $text;
  }
}

.border-bottom {
  border-bottom: 1px solid $light-border;
}

.border-right {
  border-right: 1px solid $light-border;
}

a {
  color: inherit;
  text-decoration: none;
  transition: .2s ease-out;

  &:hover {
    text-decoration: underline;
  }
}

.noVendors {
  opacity: .3;
}

.currency {
  font-size: 14px;
  color: $dark-border !important;
}

</style>