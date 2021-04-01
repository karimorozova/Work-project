<template lang="pug">
  .vendor-wrap
    PopUpWindow(v-if="isChangedVendorGeneralInfo" text="test a  or b ?"  @accept="checkForErrors" @cancel="cancel")
    .vendor-info(v-if="currentVendor._id")
      .title General Information
      .vendor-details(v-if="getVendorUpdatedData.industries")
        VendorMainInfo

      .vendor-info__preview(v-if="isEditAndSend")
        WYSIWYG(
          @closePreview="closePreview",
          :previewDropMenu="true",
          :templates="templatesWysiwyg",
          :message="'<p>Message...</p>'",
          @send="sendQuote"
        )

      .title Pending Competencies
      .vendor-info__competencies
        PendingCompetencies(:pendingCompetenciesData="currentVendor.pendingCompetencies" @updateRates="updateRates")

      .title Competencies
      .vendor-info__competencies
        VendorCompetencies(
          :competenciesData="currentVendor.competencies"
          :languages="languages",
          :steps="steps",
          :industries="industries",
          :vendorIndustries="currentVendor.industries.map((i) => i.name)",
          @updateRates="updateRates"
        )

      .title Qualifications
      TableQualifications(
        :qualificationData="currentVendor.qualifications",
        :assessmentData="assessmentData",
        :currentVendor="currentVendor",
        @updateRates="updateRates"
      )

      .title Assessment
      TableAssessment(:assessmentData="currentVendor.assessments", :currentVendor="currentVendor",)

      .title Rates
      .vendor-info__rates
        .vendor-info__tables-row
          .lang-table(v-if="languages.length")
            LangTable(
              :dataArray="currentVendor.rates.basicPricesTable",
              :vendorId="currentVendor._id",
              :vendor="currentVendor"
              @refreshResultTable="refreshResultTable",
            )
          .step-table(v-if="steps.length && units.length")
            StepTable(
              :dataArray="currentVendor.rates.stepMultipliersTable",
              :vendorId="currentVendor._id",
              :vendor="currentVendor"
              @refreshResultTable="refreshResultTable",
            )
          .industry-table(v-if="industries.length")
            IndustryTable(
              :dataArray="currentVendor.rates.industryMultipliersTable",
              :vendorId="currentVendor._id",
              :vendor="currentVendor"
              @refreshResultTable="refreshResultTable",
            )
        .result-table
          ResultTable(
            :vendorId="currentVendor._id",
            :languages="languages.map((i) => i.lang).sort((a, b) => a.localeCompare(b))",
            :steps="steps.map((i) => i.title)",
            :units="units.map((i) => i.type)",
            :industries="industries.map((i) => i.name)",
            :isRefreshResultTable="isRefreshResultTable",
            :refresh="isRefreshAfterServiceUpdate"
          )

      .title Discount Chart
      .vendor-info__drop-matrix
        FinanceMatrixWithReset(:entity="currentVendor" @getDefaultValues="getDefaultValuesDC" @setMatrixData="setMatrixData")

      .title Documents
      TableDocuments(:documentsData="currentVendor.documents", :vendorId="vendorId")

      .title Professional experience
      TableProfessionalExperience(:professionalExperienceData="currentVendor.profExperiences", :vendorId="vendorId",)

      .title Education
      TableEducation(:educationData="currentVendor.educations", :vendorId="vendorId")

      .title Notes & Comments
      .vendor-info__notes-block
        .vendor-info__notes
          VendorCandidate(:candidateData="currentVendor")
        .vendor-info__editor
          ckeditor(v-model="getVendorUpdatedData.notes", :config="editorConfig")

      //.title Vendor to memoq
        //div
          //h3(@click="openMemoqModal('Saved')") SAVE
          //h3(@click="openMemoqModal('Deleted')") DELETE

      .approve-action(v-if="approveMemoqVendorAction")
        ApproveModal(
          text="Are you sure?"
          approveValue="Yes"
          notApproveValue="No"
          @approve="approveModal"
          @close="approveMemoqVendorAction = false"
          @notApprove="approveMemoqVendorAction = false"
        )

      .delete-approve(v-if="isApproveModal")
        p Are you sure you want to delete?
        input.button.approve-block(type="button", value="Cancel", @click="cancelApprove")
        input.button(type="button", value="Delete", @click="approveVendorDelete")

    .vendor-subinfo(v-if="currentVendor._id")
      .vendor-subinfo__general
        .block-item-subinfo
          label.block-item-subinfo__label Vendor Status:
            span.require *
          .block-item-subinfo__drop.block-item-subinfo_maxhigh-index(
            :class="{ 'block-item-subinfo_error-shadow': isSaveClicked && !getVendorUpdatedData.status }"
          )
            VendorStatusSelect(isAllExist="no", :selectedStatus="getVendorUpdatedData.status", @chosenStatus="chosenStatus")
        .block-item-subinfo
          label.block-item-subinfo__label Professional level:
          .block-item-subinfo__drop.block-item-subinfo_high-index
            SelectSingle(
              :options="['level1', 'level2']",
              placeholder="Level",
              :selectedOption="optionProfessionalLevel",
              @chooseOption="updateProfessionalLevel"
            )
        .block-item-subinfo
          label.block-item-subinfo__label Test:
          .block-item-subinfo__check-item.checkbox
            input#test(type="checkbox", :checked="currentVendor.isTest", @change="setTest")
            label(for="test")

      .vendor-subinfo__action
        VendorAction(@openPreview="openPreview")

    ValidationErrors(v-if="areErrorsExist", :errors="errors", @closeErrors="closeErrors")
</template>

<script>
	import { mapGetters, mapActions } from "vuex"
	import FinanceMatrixWithReset from "../FinanceMatrixWithReset"
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
	import VendorStatusSelect from "./VendorStatusSelect"
	import VendorLeadsourceSelect from "./VendorLeadsourceSelect"
	import MultiVendorIndustrySelect from "./MultiVendorIndustrySelect"
	import NativeLanguageSelect from "./NativeLanguageSelect"
	import TimezoneSelect from "../clients/TimezoneSelect"
	import ValidationErrors from "../ValidationErrors"
	import SelectSingle from "../SelectSingle"
	import Asterisk from "../Asterisk"
	import Addseverallangs from "../finance/Addseverallangs"
	import AvailablePairs from "../finance/pricelists/AvailablePairs"
	import photoPreview from "@/mixins/photoPreview"
	import ApproveModal from "../ApproveModal"
	import SelectMulti from "../SelectMulti"
	import PendingCompetencies from "./pending-competencies/PendingCompetencies"
  import VendorMainInfo from "./VendorGeneralInfo";
  import PopUpWindow from "../PopUpWindow";

	export default {
		mixins: [ photoPreview ],
		data() {
			return {
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
				updateIndustry: "updateIndustry",
				getDuoCombinations: "getVendorDuoCombinations",
				updateVendorStatus: "updateVendorStatus",
				setVendorsMatrixData: "setVendorsMatrixData",
				setDefaultValuesMatrixData: "setDefaultValuesMatrixData",
        initCurrentVendorGeneralData: "initCurrentVendorGeneralData",
        updateCurrentVendorGeneralData: "updateCurrentVendorGeneralData",
        updateVendorGeneralData: "updateVendorGeneralData"
			}),
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
					this.alertToggle({
						message: `Vendor in Memoq are ${ action }`,
						isShow: true,
						type: "success"
					})
				} catch (err) {
					this.alertToggle({
						message: "Error on action with Memoq & Vendor",
						isShow: true,
						type: "error"
					})
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
				this.isRefreshResultTable = true
				setTimeout(() => {
					this.isRefreshResultTable = false
				}, 1000)
			},
			updateRates(action) {
				this.isRefreshAfterServiceUpdate = action
				setTimeout(() => {
					this.isRefreshAfterServiceUpdate = !action
				}, 1000)
			},
			async setTest(event) {
				const vendor = {
					id: this.currentVendor._id,
					isTest: event.target.checked
				}
				try {
					await this.updateVendorStatus(vendor)
					this.alertToggle({
						message: "Vendor status updated",
						isShow: true,
						type: "success"
					})
				} catch (err) {
					this.alertToggle({
						message: "Server error / Cannot update Vendor status",
						isShow: true,
						type: "error"
					})
				}
			},
			closePreview() {
				this.isEditAndSend = false
			},
			openPreview() {
				this.isEditAndSend = true
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
			closeLangPairs() {
				this.isAvailablePairs = false
			},
			deleteVendor() {
				this.isApproveModal = true
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
						isUnique ? "" : this.errors.push("The email you've entered is already used in our system!")
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
				const textReg = /^[-\sa-zA-Z]+$/
				try {
					this.errors = []
					if (!this.getVendorUpdatedData.firstName || !textReg.test(this.getVendorUpdatedData.firstName))
						this.errors.push("Please, enter valid first name.")
					if (/^\s+$/.exec(this.getVendorUpdatedData.firstName)) {
						this.errors.push("Please, enter valid first name.")
					}
					if (this.getVendorUpdatedData.surname && !textReg.test(this.getVendorUpdatedData.surname))
						this.errors.push("Please, enter valid surname.")
					if (!this.getVendorUpdatedData.industries.length) this.errors.push("Please, choose at least one industry.")
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
				sendData.append("vendor", JSON.stringify({...this.getVendorUpdatedData, _id: this.$route.params.id}))
				sendData.append("photo", this.photoFile[0])
				try {
					await this.updateCurrentVendor(sendData)
					this.oldEmail = this.getVendorUpdatedData.email
          this.$socket.emit('updatedVendorData', {id:  this.$route.params.id})
          // this.$socket.emit('updatedVendorData', {id:  this.$route.params.id, newData: this.getVendorUpdatedData})
					this.alertToggle({
						message: "Vendor info updated",
						isShow: true,
						type: "success"
					})
				} catch (err) {
					this.alertToggle({
						message: "Server error / Cannot update Vendor info",
						isShow: true,
						type: "error"
					})
				} finally {
					this.closeErrors()
				}
			},
			updateProfessionalLevel({ option }) {
				this.updateCurrentVendorGeneralData({ key: "professionalLevel", value: option })
			},
			chosenStatus({ option }) {
				this.updateCurrentVendorGeneralData({ key: "status", value: option })
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
						return this.alertToggle({
							message: "The vendor was assigned to a step and cannot be deleted.",
							isShow: true,
							type: "error"
						})
					}
					await this.deleteCurrentVendor({ id: this.currentVendor._id })
					this.alertToggle({
						message: "Vendor removed",
						isShow: true,
						type: "success"
					})
					this.$router.go(-1)
				} catch (err) {
					this.alertToggle({
						message: "Server error / Cannot delete the Vendor",
						isShow: true,
						type: "error"
					})
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
				} catch (err) {
					this.alertToggle({
						message: "Error on getting Vendor's info",
						isShow: true,
						type: "error"
					})
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
			vendorAliases() {
				if (this.aliases) {
					return this.aliases
				}
			},
      isChangedVendorGeneralInfo() {
        if (this.currentVendor.hasOwnProperty('firstName')) {
          let keys = [ 'firstName', 'surname', 'email','phone', 'timezone', 'native', 'companyName', 'website', 'skype', 'linkedin', 'whatsapp', 'industries', 'aliases', 'gender','status','matrix','professionalLevel','notes']
          for (let key of keys) {
            if (JSON.stringify(this.getVendorUpdatedData[key]) !== JSON.stringify(this.currentVendor[key])) {
              return true
            }
          }
        }
      },
			selectedIndNames() {
				let result = []
				if (this.currentVendor.industries && this.currentVendor.industries.length) {
					for (let ind of this.currentVendor.industries) {
						result.push(ind.name)
					}
				}
				return result
			},
			optionProfessionalLevel() {
				return this.getVendorUpdatedData.hasOwnProperty("professionalLevel") ? this.getVendorUpdatedData.professionalLevel : ""
			}
		},
		components: {
      PopUpWindow,
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
			VendorLeadsourceSelect,
			VendorStatusSelect,
			MultiVendorIndustrySelect,
			NativeLanguageSelect,
			TimezoneSelect,
			ValidationErrors,
			Asterisk,
			Addseverallangs,
			AvailablePairs,
			SelectSingle,
			ckeditor: CKEditor.component,
			LangTable,
			StepTable,
			IndustryTable,
			ResultTable,
			FinanceMatrixWithReset
		},
		directives: {
			ClickOutside
		},
		created() {
			this.getVendor()

      this.$socket.on('setFreshVendorData', ({ id}) => {
        if (id == this.$route.params.id){
          this.getVendor()
        }
      })

      this.$socket.on('socketUpdateVendorProp', ({id, key, value}) => {
        if (this.$route.params.id === id) {
          this.updateWithOutSocketVendorProp({key,value})
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

  .block-item-subinfo {
    display: flex;
    height: 50px;

    &__error-shadow {
      height: 30px;
    }

    &__check-item {
      width: 190px;
    }

    &__last {
      height: 30px;
    }

    &_maxhigh-index {
      z-index: 12;
    }

    &_high-index {
      z-index: 10;
    }

    &__label {
      width: 160px;
      padding-top: 6px;
    }

    &__drop {
      position: relative;
      width: 190px;
    }
  }

  .block-item-subinfo:last-child {
    height: 30px;
  }

  .vendor-wrap {
    position: relative;
    width: 100%;
    display: flex;
  }

  .vendor-subinfo {
    &__general {
      padding: 20px;
      margin-top: 100px;
      width: 350px;
      box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
      margin-left: 40px;
    }

    &__action {
      margin-top: 40px;
      width: 390px;
      margin-left: 40px;
      box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    }
  }

  .vendor-info {
    position: relative;
    width: 1000px;

    &__competencies {
      box-sizing: border-box;
      padding: 20px;
      box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
      position: relative;
    }

    &__drop-matrix {
      box-sizing: border-box;
      padding: 20px;
      box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
      position: relative;
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

    &__rates {
      box-sizing: border-box;
      padding: 20px;
      box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    }

    &__tables-row {
      display: flex;

      .lang-table {
        width: 33%;
      }

      .industry-table {
        width: 26%;
      }

      .step-table {
        width: 42%;
      }
    }
  }

  .title {
    font-size: 22px;
    padding: 30px 0 10px;
  }

  .gen-info {
    box-sizing: border-box;
    padding: 20px;
    box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
  }

  .gen-info {
    display: flex;
    justify-content: space-between;

    &__block {
      width: 35%;

      &:first-child {
        width: 22%;
        text-align: center;
      }
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
      width: 191px;
      height: 28px;
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

    &__input-filed {
      font-size: 14px;
      color: #67573e;
      border: 1px solid #67573e;
      border-radius: 5px;
      padding: 0 5px;
      outline: none;
      width: 191px;
      height: 30px;
      box-sizing: border-box;
    }

    ::-webkit-input-placeholder {
      opacity: 0.5;
    }

    &_error-shadow {
      box-shadow: 0 0 5px red;
      border-radius: 5px;
    }
  }

  #test {
    width: 0;
  }

  .checkbox {
    display: flex;
    height: 28px;

    input[type="checkbox"] {
      opacity: 0;

      + {
        label {
          &::after {
            content: none;
          }
        }
      }

      &:checked {
        + {
          label {
            &::after {
              content: "";
            }
          }
        }
      }
    }

    label {
      position: relative;
      display: inline-block;
      padding-left: 22px;
      padding-top: 4px;

      &::before {
        position: absolute;
        content: "";
        display: inline-block;
        height: 16px;
        width: 16px;
        border: 1px solid;
        left: 0px;
        top: 3px;
      }

      &::after {
        position: absolute;
        content: "";
        display: inline-block;
        height: 5px;
        width: 9px;
        border-left: 2px solid;
        border-bottom: 2px solid;
        transform: rotate(-45deg);
        left: 4px;
        top: 7px;
      }
    }
  }

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
    height: 34px;
    color: $white;
    font-size: 14px;
    border-radius: 7px;
    background-color: $orange;
    border: none;
    transition: .1s ease;
    outline: none;
    letter-spacing: 0.2px;

    &:hover {
      cursor: pointer;
      box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
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
    border: 1px solid #67573e;
    position: relative;
    overflow: hidden;
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
    align-items: center;

    .photo-image {
      max-width: 100%;
      max-height: 100%;
    }
  }

  .photo-file {
    position: absolute;
    top: -25px;
    left: -100px;
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
    box-shadow: 0 0 10px #67573e;
    background-color: #fff;
    z-index: 20;

    p {
      font-size: 21px;
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
