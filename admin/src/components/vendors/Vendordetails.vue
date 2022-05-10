<template lang="pug">
  .vendor-wrap
    SaveCancelPopUp(v-if="isChangedVendorGeneralInfo" text=""  @accept="checkForErrors" @cancel="cancel")
    .vendor-info(v-if="currentVendor._id")
      .vendor-info__radio
        RadioButton.radio(name="Agency" :selected="currentVendor.vendorType" @toggleRadio="toggleRadio")
        RadioButton.radio(name="Individual" :selected="currentVendor.vendorType" @toggleRadio="toggleRadio")

      .vendor-info__block
        VendorMainInfo
        .block__header.block__header--main-info(@click="toggleBlock('isMoreVendorInfo')" :class="{'block__header-grey': !isMoreVendorInfo}")
          .title.title--main-info More information about the Vendor
          .icon(v-if="!isMoreVendorInfo")
            i.fas.fa-chevron-down
          .icon(v-else)
            i.fas.fa-chevron-right
        .block__data.block__data--main-info(v-if="isMoreVendorInfo")
          VendorMoreInfo(:is-agency="isAgency")

      .vendor-info__preview(v-if="isEditAndSend")
        WYSIWYG(
          @closePreview="closePreview",
          :previewDropMenu="true",
          :templates="templatesWysiwyg",
          :message="'<p>Message...</p>'",
          @send="sendQuote"
        )
      .vendor-info__block
        .block__header(@click="toggleBlock('isSocialMedia')" :class="{'block__header-grey': !isSocialMedia}")
          .title Social Media & Communication
          .icon(v-if="!isSocialMedia")
            i.fas.fa-chevron-down
          .icon(v-else)
            i.fas.fa-chevron-right
        .block__data(v-if="isSocialMedia")
          SocialMedia

      .vendor-info__block
        .block__header(@click="toggleBlock('isRates')" :class="{'block__header-grey': !isRates}")
          .title Rates
          .icon(v-if="!isRates")
            i.fas.fa-chevron-down
          .icon(v-else)
            i.fas.fa-chevron-right
        .block__data(v-if="isRates")
          .rates__icons
            .rates__mainIcon(v-if="!paramsIsEdit" @click="crudActions('edit'), setNewStepCombination()")
              i.fas.fa-pen#pen
            .rates__mainIcon(v-if="paramsIsEdit" @click="crudActions('cancel')")
              i.fas.fa-times-circle#close

          Tabs(
            :tabs="tabs"
            :selectedTab="selectedTab"
            @setTab="setTab"
          )
          .lang-table(v-if="selectedTab === 'Basic Price'")
            LangTable(
              :dataArray="currentVendor.rates.basicPricesTable",
              :vendorId="currentVendor._id",
              :vendor="currentVendor"
              @refreshResultTable="refreshResultTable",
              :isEdit="isEdit"
              @toggleCheck="toggleCheck"
              @toggleAll="toggleAll"
            )
          .step-table(v-if="selectedTab === 'Steps / Units'")
            StepTable(
              :dataArray="currentVendor.rates.stepMultipliersTable",
              :vendorId="currentVendor._id",
              :vendor="currentVendor"
              @refreshResultTable="refreshResultTable",
              :isEdit="isEdit"
              @toggleCheck="toggleCheck"
              @toggleAll="toggleAll"
            )
          .industry-table(v-if="selectedTab === 'Industries'")
            IndustryTable(
              :dataArray="currentVendor.rates.industryMultipliersTable",
              :vendorId="currentVendor._id",
              :vendor="currentVendor"
              @refreshResultTable="refreshResultTable",
              :isEdit="isEdit"
              @toggleCheck="toggleCheck"
              @toggleAll="toggleAll"
            )
          .result-table(v-if="selectedTab === 'Overall Prices'")
            ResultTable(
              :dataArray="currentVendor.rates.pricelistTable"
              :vendorId="currentVendor._id",
              :languages="languages.map((i) => i.lang).sort((a, b) => a.localeCompare(b))",
              :steps="steps.map((i) => i.title)",
              :units="units.map((i) => i.type)",
              :industries="industries.map((i) => i.name)",
              :isRefreshResultTable="isRefreshResultTable",
              :refresh="isRefreshAfterServiceUpdate"
              :isEdit="isEdit"
              @toggleCheck="toggleCheck"
              @toggleAll="toggleAll"
            )
          .chart(v-if="selectedTab === 'Discount Chart'")
            FinanceMatrixWithReset(
              :entity="currentVendor"
              @getDefaultValues="getDefaultValuesDC"
              @setMatrixData="setMatrixData"
              :isEdit="isEdit"
            )

      .vendor-info__block
        .block__header(@click="toggleBlock('isPendingCompetencies')" :class="{'block__header-grey': !isPendingCompetencies}")
          .title Pending Competencies
          .icon(v-if="!isPendingCompetencies")
            i.fas.fa-chevron-down
          .icon(v-else)
            i.fas.fa-chevron-right
        .block__data(v-if="isPendingCompetencies")
          PendingCompetencies(:pendingCompetenciesData="currentVendor.pendingCompetencies" @updateRates="updateRates")

      .vendor-info__block
        .block__header(@click="toggleBlock('isCompetencies')" :class="{'block__header-grey': !isCompetencies}")
          .title Competencies
          .icon(v-if="!isCompetencies")
            i.fas.fa-chevron-down
          .icon(v-else)
            i.fas.fa-chevron-right
        .block__data(v-if="isCompetencies")
          VendorCompetencies(
            :competenciesData="currentVendor.competencies"
            :languages="languages",
            :steps="steps",
            :industries="industries",
            :vendorIndustries="industries.map((i) => i.name)",
            @updateRates="updateRates"
            @updateRateCombinationFromSettings="setNewStepCombination"
          )

      .vendor-info__block
        .block__header(@click="toggleBlock('isQualifications')" :class="{'block__header-grey': !isQualifications}")
          .title Qualifications
          .icon(v-if="!isQualifications")
            i.fas.fa-chevron-down
          .icon(v-else)
            i.fas.fa-chevron-right
        .block__data(v-if="isQualifications")
          TableQualifications(
            :qualificationData="currentVendor.qualifications",

            :currentVendor="currentVendor",
            @updateRates="updateRates"
          )

      .vendor-info__block
        .block__header(@click="toggleBlock('isAssessment')" :class="{'block__header-grey': !isAssessment}")
          .title Assessment
          .icon(v-if="!isAssessment")
            i.fas.fa-chevron-down
          .icon(v-else)
            i.fas.fa-chevron-right
        .block__data(v-if="isAssessment")
          TableAssessment(:assessmentData="currentVendor.assessments", :currentVendor="currentVendor",)


      .vendor-info__block
        .block__header(@click="toggleBlock('isDocuments')" :class="{'block__header-grey': !isDocuments}")
          .title Documents
          .icon(v-if="!isDocuments")
            i.fas.fa-chevron-down
          .icon(v-else)
            i.fas.fa-chevron-right
        .block__data(v-if="isDocuments")
          TableDocuments(:documentsData="currentVendor.documents", :vendorId="vendorId")

      .vendor-info__block
        .block__header(@click="toggleBlock('isProfessionalExperience')" :class="{'block__header-grey': !isProfessionalExperience}")
          .title Professional Experience
          .icon(v-if="!isProfessionalExperience")
            i.fas.fa-chevron-down
          .icon(v-else)
            i.fas.fa-chevron-right
        .block__data(v-if="isProfessionalExperience")
          TableProfessionalExperience(:professionalExperienceData="currentVendor.profExperiences", :vendorId="vendorId",)

      .vendor-info__block
        .block__header(@click="toggleBlock('isEducation')" :class="{'block__header-grey': !isEducation}")
          .title Education
          .icon(v-if="!isEducation")
            i.fas.fa-chevron-down
          .icon(v-else)
            i.fas.fa-chevron-right
        .block__data(v-if="isEducation")
          TableEducation(:educationData="currentVendor.educations", :vendorId="vendorId")

      .vendor-info__block
        .block__header(@click="toggleBlock('isBillingInformation')" :class="{'block__header-grey': !isBillingInformation}")
          .title Billing Information
          .icon(v-if="!isBillingInformation")
            i.fas.fa-chevron-down
          .icon(v-else)
            i.fas.fa-chevron-right
        .block__data(v-if="isBillingInformation")
          VendorBillingInfo

      .vendor-info__block
        .block__header(@click="toggleBlock('isNotes')" :class="{'block__header-grey': !isNotes}")
          .title Candidate & Notes
          .icon(v-if="!isNotes")
            i.fas.fa-chevron-down
          .icon(v-else)
            i.fas.fa-chevron-right
        .block__data(v-if="isNotes")
          .vendor-info__notes-block
            //.vendor-info__notes
            //  VendorCandidate(:candidateData="currentVendor")
            .vendor-info__editor
              ckeditor(v-model="getVendorUpdatedData.notes", :config="editorConfig")

      .vendor-info__block
        .block__header(@click="toggleBlock('isAvailable')" :class="{'block__header-grey': !isAvailable}")
          .title Availability
          .icon(v-if="!isAvailable")
            i.fas.fa-chevron-down
          .icon(v-else)
            i.fas.fa-chevron-right
        .block__data(v-if="isAvailable")
          indexAvailability



      //.title Vendor to memoq
        //div
          //h3(@click="openMemoqModal('Saved')") SAVE
          //h3(@click="openMemoqModal('Deleted')") DELETE

      .approve-action(v-if="approveMemoqVendorAction")
        ApproveModal(
          text="Are you sure?"
          approveValue="Yes"
          notApproveValue="Cancel"
          @approve="approveModal"
          @close="approveMemoqVendorAction = false"
          @notApprove="approveMemoqVendorAction = false"
        )

      .delete-approve(v-if="isApproveModal")
        p Are you sure you want to delete?
        input.button.approve-block(type="button", value="Cancel", @click="cancelApprove")
        input.button(type="button", value="Delete", @click="approveVendorDelete")

    .vendor-subinfo(v-if="currentVendor._id")
      VendorSubDetails(
        :vendor="currentVendor"
        @setVendorProp="setVendorProp"
      )
      VendorAction(
        @openPreview="openPreview"
        @openVendor="openVendor"
      )
      VendorCurrentTime(v-if="this.currentVendor.timezone" :timezone="this.currentVendor.timezone" )
      //.vendor-subinfo__general
      //  .vendor-subinfo__title {{getVendorUpdatedData.vendorId}}
      //  .block-item-subinfo
      //    label.block-item-subinfo__label Vendor Status:
      //      span.require *
      //    .block-item-subinfo__drop.block-item-subinfo_maxhigh-index(
      //      :class="{ 'block-item-subinfo_error-shadow': isSaveClicked && !getVendorUpdatedData.status }"
      //    )
      //      SelectSingle(:options="statuses"
      //        placeholder="Vendor Status"  :selectedOption="getVendorUpdatedData.status", @chooseOption="chosenStatus")
      //
      //  .block-item-subinfo
      //    label.block-item-subinfo__label Test:
      //    .block-item-subinfo__check-item.checkbox
      //      input#test(type="checkbox", :checked="currentVendor.isTest", @change="setTest")
      //      label(for="test")



    ValidationErrors(v-if="areErrorsExist", :errors="errors", @closeErrors="closeErrors")
</template>

<script>
import { mapGetters, mapActions } from "vuex"
import VendorCompetencies from "./VendorCompetencies"
import ResultTable from "./pricelists/ResultTable"
import IndustryTable from "./pricelists/IndustryTable"
import StepTable from "./pricelists/StepTable"
import LangTable from "./pricelists/LangTable"
import CKEditor from "ckeditor4-vue"
import WYSIWYG from "./WYSIWYG"
import VendorAction from "./VendorAction"
import VendorCandidate from "./VendorCandidate"
import TableQualifications from "./TableQualifications"
import TableProfessionalExperience from "./TableProfessionalExperience"
import TableEducation from "./TableEducation"
import TableDocuments from "./TableDocuments"
import TableAssessment from "./TableAssessment"
import ClickOutside from "vue-click-outside"
import ValidationErrors from "../ValidationErrors"
import SelectSingle from "../SelectSingle"
import Asterisk from "../Asterisk"
import AvailablePairs from "../finance/pricelists/AvailablePairs"
import photoPreview from "@/mixins/photoPreview"
import ApproveModal from "../ApproveModal"
import SelectMulti from "../SelectMulti"
import PendingCompetencies from "./pending-competencies/PendingCompetencies"
import VendorMainInfo from "./VendorGeneralInfo"
import SaveCancelPopUp from "../SaveCancelPopUp"
import Tabs from "../Tabs"
import FinanceMatrixWithReset from "./pricelists/FinanceMatrixWithReset"
import VendorBillingInfo from "./VendorBillingInfo"
import VendorSubDetails from "./VendorSubDetails"
import indexAvailability from "./availability/indexAvailability"
import VendorMoreInfo from './vendorMoreInfo/VendorMoreInfo'
import VendorCurrentTime from "./VendorCurrentTime"
import SocialMedia from "./vendorMoreInfo/SocialMedia"
import RadioButton from "../RadioButton"


export default {
  mixins: [ photoPreview ],
  data() {
    return {
      isAgency: '',
      isMoreVendorInfo: false,
      isPendingCompetencies: false,
      isCompetencies: false,
      isQualifications: false,
      isAssessment: false,
      isRates: false,
      isDocuments: false,
      isProfessionalExperience: false,
      isEducation: false,
      isBillingInformation: false,
      isNotes: false,
      isAvailable: false,
      isSocialMedia: false,


      icons: {
        edit: { icon: require("../../assets/images/latest-version/edit.png") },
        cancel: { icon: require("../../assets/images/cancel-icon.png") }
      },
      statuses: [ "Active", "Inactive", "Potential" ],
      paramsIsEdit: false,
      isEdit: false,
      tabs: [ 'Basic Price', 'Steps / Units', 'Industries', 'Discount Chart', 'Overall Prices' ],
      selectedTab: 'Basic Price',
      aliases: [],
      currentVendorAliases: [],
      memoqAction: "",
      approveMemoqVendorAction: false,
      isRefreshAfterServiceUpdate: false,
      isRefreshResultTable: false,
      vendorId: "",
      areErrorsExist: false,
      isSaveClicked: false,
      vendorShow: true,
      imageExist: false,
      isApproveModal: false,
      asteriskStyle: { top: "0px" },
      photoFile: [],
      genders: [ "Male", "Female", "Other" ],
      errors: [],
      langPairs: [],
      addSeveralPriceId: "",
      oldEmail: "",
      isFileError: false,
      isEditAndSend: false,
      editorConfig: {
        allowedContent: true,
        uiColor: "#F4F0EE",
        resize_minHeight: "130",
        height: 167
      },
      templatesWysiwyg: [
        {
          title: "tempate",
          message: "<p>test message</p>"
        }
      ]
    }
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
      updateVendorProp: "updateVendorProp",
      updateWithOutSocketVendorProp: "updateWithOutSocketVendorProp",
      updateCurrentVendor: "updateCurrentVendor",
      deleteCurrentVendor: "deleteCurrentVendor",
      storeCurrentVendor: "storeCurrentVendor",
      updateVendorStatus: "updateVendorStatus",
      setVendorsMatrixData: "setVendorsMatrixData",
      setDefaultValuesMatrixData: "setDefaultValuesMatrixData",
      initCurrentVendorGeneralData: "initCurrentVendorGeneralData",
      updateCurrentVendorGeneralData: "updateCurrentVendorGeneralData",
      updateVendorRatesByKey: 'updateVendorRatesFromServer',
      updateCurrentVendorGeneralDataBillingInfo: 'updateCurrentVendorGeneralDataBillingInfo'
    }),
    async toggleRadio({ value }) {

      const vendor = this.currentVendor
      vendor.vendorType = value
      await this.updateCurrentVendor({ vendor: JSON.stringify(vendor) })
      this.alertToggle({ message: "Updated", isShow: true, type: "success" })
      this.isAgency = vendor.vendorType

    },
    async setVendorProp({ prop, value }) {
      if (prop === 'isTest') {
        await this.setTest(value)
        return
      }
      try {
        this.currentVendor[prop] = value

        await this.updateCurrentVendor({ vendor: JSON.stringify(this.currentVendor) })
        this.alertToggle({ message: "Updated", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Not Updated", isShow: true, type: "error" })
      }
    },
    toggleBlock(prop) {
      this[prop] = !this[prop]
    },
    async setNewStepCombination() {
      try {
        const updatedVendor = await this.$http.post('/vendorsapi/updated-retest-from-settings', { vendorId: this.$route.params.id })
        await this.storeCurrentVendor(updatedVendor.data)
        this.refreshResultTable()
      } catch (err) {
        this.alertToggle({ message: "Rates not Updated!", isShow: true, type: "error" })
      }
    },
    toggleCheck({ row, val, prop }) {
      const index = getIndex(this.currentVendor.rates[prop], row._id)
      const obj = this.currentVendor.rates[prop][index]
      obj.isCheck = val
      this.currentVendor.rates[prop].splice(index, 1, obj)

      function getIndex(arr, id) {
        return arr.findIndex(({ _id }) => `${ _id }` === `${ id }`)
      }
    },
    toggleAll({ val, prop }) {
      this.currentVendor.rates[prop] = this.currentVendor.rates[prop].reduce((acc, cur) => {
        cur.isActive ? acc.push({ ...cur, isCheck: val }) : acc.push({ ...cur, isCheck: false })
        return acc
      }, [])
    },
    crudActions(actionType) {
      this.paramsIsEdit = actionType !== 'cancel'
      this.isEdit = this.paramsIsEdit

      this.toggleAll({ val: false, prop: 'basicPricesTable' })
      this.toggleAll({ val: false, prop: 'stepMultipliersTable' })
      this.toggleAll({ val: false, prop: 'industryMultipliersTable' })
      this.toggleAll({ val: false, prop: 'pricelistTable' })
    },
    setTab({ index: i }) {
      this.selectedTab = this.tabs.find((item, index) => index === i)
    },
    setAlias({ option }) {
      if (this.currentVendor.hasOwnProperty('aliases')) {
        if (this.currentVendor.aliases.length) {
          this.currentVendorAliases = this.currentVendor.aliases
        }
      }
      const position = this.currentVendorAliases.indexOf(option)

      if (position !== -1) {
        this.currentVendorAliases.splice(position, 1)
        this.updateVendorProp({ prop: "aliases", value: this.currentVendorAliases })
      } else {
        this.currentVendorAliases.push(option)
        this.updateVendorProp({ prop: "aliases", value: this.currentVendorAliases })
      }
    },
    async approveModal() {
      await this.memoqVendorAction(this.memoqAction)
      this.approveMemoqVendorAction = false
      this.memoqAction = ''
    },
    openMemoqModal(action) {
      this.memoqAction = action
      this.approveMemoqVendorAction = !!action
    },
    async memoqVendorAction(action) {
      if (action === 'Saved') {
        await this.sendVendorToMemoq(`/vendorsapi/create-memoq-vendor/${ this.currentVendor._id }`, action)
      } else {
        await this.sendVendorToMemoq(`/vendorsapi/delete-memoq-vendor/${ this.currentVendor._id }`, action)
      }
    },
    async sendVendorToMemoq(link, action) {
      try {
        await this.$http.get(link)
        this.alertToggle({ message: `Vendor in Memoq are ${ action }`, isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Error on action with Memoq & Vendor", isShow: true, type: "error" })
      }
    },
    async setMatrixData({ value, key }) {
      try {
        await this.setVendorsMatrixData({ value, key })
        this.alertToggle({ message: "Matrix data updated", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Error on setting matrix data", isShow: true, type: "error" })
      }
    },
    async getDefaultValuesDC(key) {
      try {
        await this.setDefaultValuesMatrixData({ key })
        this.alertToggle({ message: "Matrix data updated", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Error on setting matrix data", isShow: true, type: "error" })
      }
    },
    refreshResultTable() {
      this.updateVendorRatesByKey({ key: 'pricelistTable' })
    },
    updateRates(action) {
      this.isRefreshAfterServiceUpdate = action
      setTimeout(() => {
        this.isRefreshAfterServiceUpdate = !action
      }, 1000)
    },
    async setTest(bool) {
      const vendor = {
        id: this.currentVendor._id,
        isTest: bool
      }
      try {
        await this.updateVendorStatus(vendor)
        this.alertToggle({ message: "Updated", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Server error / Cannot update Vendor TEST status", isShow: true, type: "error" })
      }
    },
    closePreview() {
      this.isEditAndSend = false
    },
    openPreview() {
      this.isEditAndSend = true
    },
    async openVendor() {
      const { data } = await this.$http.post("/service-login/vendor", { vendorId: this.vendorId })
      const domain = window.location.origin.indexOf('pangea') !== -1 ? '.pangea.global' : 'localhost'
      const redirectTo = this.$domains.vendor
      document.cookie = `vendor=${ data }; path=/; domain=${ domain }`
      window.open(redirectTo, '_blank')
    },
    async sendQuote(message) {
      try {
        await this.$http.post(`/vendorsapi/send-email`, {
          message,
          vendorId: this.vendorId
        })
        this.alertToggle({ message: 'Message sent!' })
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: 'error' })
      }
      this.closePreview()
    },
    cancelApprove() {
      this.isApproveModal = false
    },
    closeErrors() {
      this.areErrorsExist = false
    },
    validateEmail() {
      const emailValidRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
      return !this.getVendorUpdatedData.email || !emailValidRegex.test(this.getVendorUpdatedData.email.toLowerCase())
    },
    async checkEmail() {
      if (this.validateEmail()) {
        return this.errors.push("Please provide a valid email.")
      }
      if (this.oldEmail.toLowerCase() !== this.currentVendor.email.toLowerCase()) {
        try {
          const result = await this.$http.get(`/vendors/application/unique-email?email=${ this.currentVendor.email }`)
          const isUnique = !result.data
          if (!isUnique) {
            this.errors.push("The email you've entered is already used in our system!")
          }
        } catch (err) {
          this.alertToggle({
            message: "Error on email uniqueness checking",
            isShow: true,
            type: "error"
          })
        }
      }
    },
    async checkForErrors() {
      try {
        this.errors = []
        // TODO: don't delete commits
        if (!this.getVendorUpdatedData.firstName)
          this.errors.push("Please, enter valid first name.")
        if (/^\s+$/.exec(this.getVendorUpdatedData.firstName)) {
          this.errors.push("Please, enter valid first name.")
        }
        if (!this.getVendorUpdatedData.surname) this.errors.push("Please, enter valid surname.")
        if (!this.getVendorUpdatedData.status) this.errors.push("Please, choose status.")
        await this.checkEmail()
        if (this.errors.length) {
          this.areErrorsExist = true
          this.isSaveClicked = true
          return
        }
        await this.updateVendor()
      } catch (err) {
      }
    },
    async updateVendor() {
      let sendData = new FormData()
      const data = { ...this.getVendorUpdatedData }
      data.billingInfo.paymentMethods = this.currentVendor.billingInfo.paymentMethods

      sendData.append("vendor", JSON.stringify({ ...data, _id: this.$route.params.id }))
      sendData.append("photo", this.photoFile[0])

      try {
        await this.updateCurrentVendor(sendData)
        this.initCurrentVendorGeneralData(this.currentVendor)
        this.oldEmail = this.getVendorUpdatedData.email
        this.$socket.emit('updatedVendorData', { id: this.$route.params.id })
        this.alertToggle({ message: "Vendor info updated", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Server error / Cannot update Vendor info", isShow: true, type: "error" })
      } finally {
        this.closeErrors()
      }
    },
    cancel() {
      this.initCurrentVendorGeneralData(this.currentVendor)
    },
    async approveVendorDelete() {
      this.isApproveModal = false
      if (!this.currentVendor._id) {
        return this.cancel()
      }
      try {
        const isAssigned = await this.$http.get(`/vendorsapi/any-step?id=${ this.currentVendor._id }`)
        if (isAssigned.body) {
          return this.alertToggle({ message: "The vendor was assigned to a step and cannot be deleted.", isShow: true, type: "error" })
        }
        await this.deleteCurrentVendor({ id: this.currentVendor._id })
        this.alertToggle({ message: "Vendor removed", isShow: true, type: "success" })
        this.$router.go(-1)
      } catch (err) {
        this.alertToggle({ message: "Server error / Cannot delete the Vendor", isShow: true, type: "error" })
      }
    },
    async getVendor() {
      this.vendorId = this.$route.params.id
      const id = this.$route.params.id
      try {
        const vendor = await this.$http.get(`/vendorsapi/vendor?id=${ id }`)
        await this.storeCurrentVendor(vendor.data)
        this.initCurrentVendorGeneralData(vendor.data)
        this.oldEmail = this.currentVendor.email
        this.isAgency = this.currentVendor.vendorType
      } catch (err) {
        this.alertToggle({ message: "Error on getting Vendor's info", isShow: true, type: "error" })
      }
    }
  },
  computed: {
    ...mapGetters({
      currentVendor: "getCurrentVendor",
      languages: "getAllLanguages",
      steps: "getAllSteps",
      services: "getAllServices",
      units: "getAllUnits",
      industries: "getAllIndustries",
      getVendorUpdatedData: "getCurrentVendorGeneralData"
    }),
    isChangedVendorGeneralInfo() {
      if (this.currentVendor.hasOwnProperty('firstName')) {
        let keys = [
          'firstName',
          'surname',
          'email',
          'facebook',
          "experienceYears",
          'availability',
          'catExperience',
          'twitter',
          'softwares',
          'instagram',
          'telegram',
          'socialMedia',
          'proz',
          'website',
          'smartcat',
          'secondaryEmail',
          'whatsapp',
          'phone', 'timezone', 'native', 'companyName', 'website', 'skype', 'linkedin', 'currency', 'gender', 'professionalLevel', 'notes' ]

        let billKeys = [ 'officialName', 'paymentTerm', 'address', 'email' ]

        for (let key of keys) if (JSON.stringify(this.getVendorUpdatedData[key]) !== JSON.stringify(this.currentVendor[key])) {
          return true
        }
        for (let key of billKeys) if (JSON.stringify(this.getVendorUpdatedData.billingInfo[key]) !== JSON.stringify(this.currentVendor.billingInfo[key])) {
          return true
        }
      }
    },
    optionProfessionalLevel() {
      return this.getVendorUpdatedData.hasOwnProperty("professionalLevel") ? this.getVendorUpdatedData.professionalLevel : ""
    }
  },
  components: {
    RadioButton,
    VendorCurrentTime,
    VendorSubDetails,
    FinanceMatrixWithReset,
    Tabs,
    SaveCancelPopUp,
    VendorMainInfo,
    PendingCompetencies,
    SelectMulti,
    ApproveModal,
    VendorCompetencies,
    WYSIWYG,
    VendorCandidate,
    VendorAction,
    TableQualifications,
    TableAssessment,
    TableDocuments,
    TableEducation,
    TableProfessionalExperience,
    ValidationErrors,
    Asterisk,
    AvailablePairs,
    SelectSingle,
    ckeditor: CKEditor.component,
    LangTable,
    StepTable,
    IndustryTable,
    ResultTable,
    VendorBillingInfo,
    indexAvailability,
    VendorMoreInfo,
    SocialMedia
  },
  directives: {
    ClickOutside
  },
  created() {

    this.getVendor()

    this.$socket.on('setFreshVendorData', ({ id }) => {
      if (id.toString() === this.$route.params.id.toString()) {
        this.getVendor()
      }
    })

    this.$socket.on('socketUpdateVendorProp', ({ id, key, value }) => {
      if (this.$route.params.id === id) {
        this.updateWithOutSocketVendorProp({ key, value })
      }
    })
  },
  mounted() {
    this.oldEmail = this.currentVendor.email
  },
  beforeDestroy() {
    this.storeCurrentVendor({})
  }
}
</script>


<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

#close {
  font-size: 15px;
}

.vendor-info__radio {
  display: flex;
  padding-bottom: 20px;
}

.radio {
  margin-right: 15px;
}

.rates {
  &__icons {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 9px;
  }

  &__mainIcon {
    background: #fff;
    border: 1px solid $border;
    border-radius: 2px;
    cursor: pointer;
    transition: .2s ease-out;
    z-index: 20;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $dark-border;

    &:hover {
      #pen,
      #close {
        color: $text;
      }
    }
  }
}

.block-item-subinfo {
  display: flex;
  height: 50px;

  &__error-shadow {
    height: 32;
  }

  &__check-item {
    width: 220px;
  }

  &__last {
    height: 32px;
  }

  &_maxhigh-index {
    z-index: 12;
  }

  &_high-index {
    z-index: 10;
  }

  &__label {
    width: 130px;
    padding-top: 6px;
  }

  &__drop {
    position: relative;
    width: 220px;
  }
}

.block-item-subinfo:last-child {
  height: 32px;
}

.vendor-wrap {
  position: relative;
  display: flex;
  margin: 50px;
}

.vendor-subinfo {

  &__title {
    font-size: 18px;
    border-bottom: 1px solid $light-border;
    padding-bottom: 5px;
    margin-bottom: 25px;
    font-family: 'Myriad600';
  }

  &__general {
    padding: 20px;
    width: 350px;
    box-shadow: $box-shadow;
    margin-left: 40px;
    border-radius: 2px;
    background-color: white;
  }

}

.block {
  &__header {
    display: flex;
    justify-content: space-between;
    padding: 20px;
    cursor: pointer;
    align-items: center;
    transition: .2s ease;
    align-items: center;
    letter-spacing: 0.2px;
    border-radius: 2px;

    &-grey {
      background-color: white;
    }

    &--main-info {
      width: 770px;
      margin-left: auto;
      padding: 25px 25px 25px 0;
      box-sizing: border-box;
    }

    .title {
      font-size: 14px;

    }

    .icon {
      font-size: 15px;
      color: $text;
    }
  }

  &__data {
    padding: 20px 20px 20px;
    border-top: 2px solid $light-border;

    &--main-info {
      padding: 0;
    }
  }
}

.vendor-info {
  position: relative;
  width: 1040px;
  min-width: 1040px;

  &__block {
    box-sizing: border-box;
    margin-bottom: 20px;
    box-shadow: $box-shadow;
    position: relative;
    border-radius: 2px;
    background-color: white;
  }


  &__notes-block {
    display: flex;
  }

  &__editor {
    width: 100%;
  }

  &__preview {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 100;
  }

}

.block-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  &__label {
    margin-bottom: 0;
  }

  &_relative {
    position: relative;
  }

  &__drop-menu {
    position: relative;
    width: 220px;
    height: 32px;
    box-sizing: border-box;
  }

  &_high-index {
    z-index: 10;
  }

  &_medium-index {
    z-index: 8;
  }

  label {
    margin-bottom: 0;
  }

  ::-webkit-input-placeholder {
    opacity: 0.5;
  }

  &_error-shadow {
    box-shadow: $box-shadow;
    border-radius: 2px;
  }
}

//#test {
//  width: 0;
//}

//.checkbox {
//  display: flex;
//  height: 28px;
//
//  input[type="checkbox"] {
//    opacity: 0;
//
//    + {
//      label {
//        &::after {
//          content: none;
//        }
//      }
//    }
//
//    &:checked {
//      + {
//        label {
//          &::after {
//            content: "";
//          }
//        }
//      }
//    }
//  }
//
//  label {
//    position: relative;
//    display: inline-block;
//    padding-left: 22px;
//    padding-top: 4px;
//
//    &::before {
//      position: absolute;
//      content: "";
//      display: inline-block;
//      height: 16px;
//      width: 16px;
//      border: 1px solid $border;
//      left: 0px;
//      top: 3px;
//    }
//
//    &::after {
//      position: absolute;
//      content: "";
//      display: inline-block;
//      height: 5px;
//      width: 9px;
//      border-left: 2px solid;
//      border-bottom: 2px solid;
//      transform: rotate(-45deg);
//      left: 4px;
//      top: 7px;
//    }
//  }
//}

.buttons {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 10px;
  box-sizing: border-box;
  width: 1020px;
}

.button {
  min-width: 120px;
  padding: 0 24px 0 24px;
  margin: 0 10px;
  height: 32px;
  color: $white;
  font-size: 14px;
  border-radius: 2px;
  background-color: $orange;
  border: none;
  transition: .1s ease;
  outline: none;
  letter-spacing: 0.2px;

  &:hover {
    cursor: pointer;
    box-shadow: $box-shadow;
  }

  &:active {
    transform: scale(.98);
  }

  .delete-approve & {
    margin-left: 0;
  }
}

.photo-wrap {
  width: 195px;
  height: 160px;
  border: 1px solid $border;
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 2px;

  .photo-image {
    max-width: 100%;
    max-height: 100%;
  }
}

.photo-file {
  position: absolute;
  top: -25px;
  left: 0px;
  height: 180px;
  background-color: transparent;
  outline: none;
  border: none;
  z-index: 5;
  cursor: pointer;
}

.photo-text {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;

  &__message {
    font-size: 18px;
    opacity: 0.5;
    width: 50%;
    text-align: center;
  }

  &__error-message {
    position: absolute;
    bottom: 30%;
    z-index: 10;
    background-color: $white;
    padding: 3px;
    box-sizing: border-box;
    color: $orange;
  }
}

.photo-extensions,
.photo-size {
  display: block;
  font-size: 12px;
  margin-top: 10px;
}

.require {
  font-size: 14px;
  color: red;
  margin-left: 2px;
}

.delete-approve {
  position: absolute;
  width: 332px;
  height: 270px;
  top: 10%;
  left: 50%;
  margin-left: -166px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: $box-shadow;
  background-color: #fff;
  z-index: 20;

  p {
    font-size: 18px;
    width: 50%;
    text-align: center;
  }

  .approve-block {
    margin-bottom: 15px;
  }
}

.no-margin {
  margin-bottom: 0;
}
</style>
