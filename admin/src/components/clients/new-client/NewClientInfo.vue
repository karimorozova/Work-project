<template lang="pug">
  .client-layout
    .new-client-info(v-if="clientShow")
      .buttons
        .buttons__radio
          RadioButton.radio(name="Company" :selected="clientType" @toggleRadio="toggleRadio")
          RadioButton.radio(name="Individual" :selected="clientType" @toggleRadio="toggleRadio")

      .new-client-info__gen-info
        NewGeneral(
          :client="client"
          :isIndividual="isIndividual"
          :isSaveClicked="isSaveClicked"
          :languages="languages"
          :timezones="timezones"
        )

      .new-client-info__block(v-if="!isIndividual" :class="{'new-client-info_error-shadow': !client.contacts.length && isSaveClicked}")
        .block__header(@click="toggleBlock('isContactDetails')")
          .title Contact Details
          .icon(v-if="!isContactDetails")
            i.fas.fa-chevron-down
          .icon(v-else)
            i.fas.fa-chevron-right
        .block__data(v-if="isContactDetails")
          NewContactsInfo(
            :client="client"
            @contactDetails="contactDetails"
            @setLeadContact="setLeadContact"
            @saveContactUpdates="saveContactUpdates"
            @newContact="addNewContact"
            @approveDelete="approveContactDelete"
          )

      .new-client-info__block
        .block__header(@click="toggleBlock('isRatesParameters')")
          .title Rates Parameters
          .icon(v-if="!isRatesParameters")
            i.fas.fa-chevron-down
          .icon(v-else)
            i.fas.fa-chevron-right
        .block__data(v-if="isRatesParameters")
          NewRates(
            :client="client"
            :isSaveClicked="isSaveClicked"
          )

      .new-client-info__block
        .block__header(@click="toggleBlock('isDocuments')")
          .title Documents
          .icon(v-if="!isDocuments")
            i.fas.fa-chevron-down
          .icon(v-else)
            i.fas.fa-chevron-right
        .block__data(v-if="isDocuments")
          NewClientDocuments(
            @uploadFiles="uploadFiles"
          )

      .new-client-info__block
        .block__header(@click="toggleBlock('isSalesInformation')")
          .title Sales Information
          .icon(v-if="!isSalesInformation")
            i.fas.fa-chevron-down
          .icon(v-else)
            i.fas.fa-chevron-right
        .block__data(v-if="isSalesInformation")
          NewClientSalesInfo(
            :client="client"
            @setLeadSource="setLeadSource"
            :isEmpty="isLeadEmpty"
          )

      .new-client-info__block(v-if="!isIndividual")
        .block__header(@click="toggleBlock('isBillingInformation')")
          .title Billing Information
          .icon(v-if="!isBillingInformation")
            i.fas.fa-chevron-down
          .icon(v-else)
            i.fas.fa-chevron-right
        .block__data(v-if="isBillingInformation")
          NewClientBillInfo(
            :client="client"
            :errorFields="billErrors"
            @changeProperty="setBillInfo"
          )

      ValidationErrors(
        v-if="areErrorsExist"
        :errors="errors"
        @closeErrors="closeErrorsBlock"
      )

      .button-group
        .button
          Button(value="Save" @clicked="checkForErrors")
        .button
          Button(value="Cancel" @clicked="cancel")

    .new-client-subinfo
      .new-client-subinfo__general
        NewSideGeneral(
          :client="client"
          :isSaveClicked="isSaveClicked"
        )
</template>

<script>
	import NewRates from './NewRates'
	import NewClientDocuments from './NewClientDocuments'
	import NewGeneral from './NewGeneral'
	import Button from "../../Button"
	import ValidationErrors from "../../ValidationErrors"
	import ContactsInfo from '../ContactsInfo'
	import NewClientSalesInfo from './NewClientSalesInfo'
	import NewClientBillInfo from './NewClientBillInfo'
	import NewSideGeneral from './NewSideGeneral'
	import { mapGetters, mapActions } from "vuex"
	import vatChecker from "../../../mixins/Client/vatChecker"
	import NewContactsInfo from "./NewContactsInfo"
	import RadioButton from "../../RadioButton"

	export default {
		mixins: [ vatChecker ],
		props: {
			client: {
				type: Object
			},
			contactsPhotos: {
				type: Array,
				default: () => []
			},
			contractFiles: {
				type: Array,
				default: () => []
			},
			ndaFiles: {
				type: Array,
				default: () => []
			}
		},
		data() {
			return {
				isContactDetails: true,
				isRatesParameters: true,
				isDocuments: true,
				isSalesInformation: true,
				isBillingInformation: true,

				timezones: [],
				languages: [],
				errors: [],
				areErrorsExist: false,
				isSaveClicked: false,
				billErrors: [],
				isLeadEmpty: false,
				clientShow: true,
				contactShow: false,
				contactInd: 0,
				contractFile: [],
				ndaFile: [],
				documentsFiles: [],
				clientType: 'Company',
				websiteRegEx: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/
			}
		},
		created() {
			this.getLangs()
			this.getTimezones()
		},
		methods: {
			toggleBlock(prop) {
				this[prop] = !this[prop]
			},
			toggleRadio({ value }) {
				this.clientType = value
				if (value === "Individual") {
					this.resetFieldsToIndividualType()
				}
			},
			resetFieldsToIndividualType() {
				this.client.industries = [ this.industries.find(({ name }) => name === "Other") ]
				this.client.leadSource = "Online Search"
			},
			async getLangs() {
				try {
					const result = await this.$http.get("/api/languages")
					this.languages = Array.from(result.body)
				} catch (err) {
					this.alertToggle({
						message: "Error in Languages",
						isShow: true,
						type: "error"
					})
				}
			},
			async getTimezones() {
				try {
					const result = await this.$http.get("/api/timezones")
					this.timezones = result.body
				} catch (err) {
					this.alertToggle({
						message: "Error in Timezones",
						isShow: true,
						type: "error"
					})
				}
			},
			loadFile({ files, prop }) {
				this.$emit("loadFile", { files, prop })
			},
			cancel() {
				this.$router.push("/pangea-clients/all")
			},
			approveContactDelete({ index }) {
				this.client.contacts.splice(index, 1)
				if (this.client.contacts.length === 1) {
					this.client.contacts[0].leadContact = true
				} else {
					const lead = this.client.contacts.find(item => item.leadContact)
					if (!lead) this.setLeadContact({ index: 0 })
				}
			},
			setLeadSource({ option }) {
				this.client.leadSource = option
			},
			setBillInfo({ prop, value }) {
				this.client.billingInfo[prop] = value
			},
			contactDetails({ contactIndex }) {
				this.$router.push({ name: "_contact", params: { index: contactIndex } })
			},
			addNewContact() {
				this.$router.push({ name: "new_contact" })
			},
			setLeadContact({ index }) {
				for (let contact of this.client.contacts) {
					contact.leadContact = false
				}
				this.client.contacts[index].leadContact = true
			},
			saveContactUpdates({ index, contact }) {
				this.client.contacts[index] = contact
			},
			closeErrorsBlock() {
				this.areErrorsExist = false
			},
			clearErrors() {
				this.errors = []
				this.billErrors = []
				this.isLeadEmpty = false
			},
			contactLeadError() {
				return this.client.contacts.find(item => item.leadContact)
			},
			async checkForErrors() {
				this.clearErrors()
				const emailValidRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
				if (!this.client.name) this.errors.push('Company name cannot be empty.')
				// if (!this.client.industries.length) this.errors.push('Please, choose at least one industry.')
				// if (!this.client.sourceLanguages.length) this.errors.push('Please, choose at least one source language.')
				// if (!this.client.targetLanguages.length) this.errors.push('Please, choose at least one target language.')
				if (this.clientType !== "Individual" && !this.client.contacts.length) this.errors.push('Please, add at least one contact.')
				if (!this.client.currency.length) this.errors.push('Please, add currency.')
				if (this.client.defaultPricelist === '') this.errors.push('Please, add pricelist.')
				if (this.clientType !== "Individual" && !this.contactLeadError()) this.errors.push('Please set Lead Contact of the Client.')
				if (!this.client.status) this.errors.push('Please, choose status.')
				if (!this.client.leadSource) {
					this.errors.push('Please, choose lead source.')
					this.isLeadEmpty = true
				}

				this.vatChecker({ newClient: true })

				if (!this.client.email || !emailValidRegex.test(this.client.email.toLowerCase())) {
					this.errors.push('Please provide a valid email in General Information.')
				}
				if (this.clientType !== "Individual" && this.client.billingInfo.paymentType === '') {
					this.errors.push('Please, add Payment type.')
					this.billErrors.push('payment')
				}
				// if (!this.client.billingInfo.email || !emailValidRegex.test(this.client.billingInfo.email.toLowerCase())) {
				// 	this.errors.push('Please provide a valid email in Billing Informations.')
				// 	this.billErrors.push('email')
				// }
				if (
						!this.client.accountManager ||
						// !this.client.salesManager ||
						!this.client.projectManager) this.errors.push('All managers should be assigned.')

				const isSameEmailsExists = await this.checkSameClientEmails(this.client.email)
				if (isSameEmailsExists) {
					this.errors.push("A client with such Email already exists, the client's Email should be unique!")
				}
				if (this.clientType !== "Individual" && this.client.website) {
					if (this.websiteRegEx.exec(this.client.website) === null) {
						this.errors.push("The website field must contain a link")
					}
				}
				const filesSize = this.documentsFiles.filter(item => item.file)
				if (filesSize.length) {
					if (filesSize.map(item => item.file).map(item => item.size).some(item => item > 40000000)) {
						this.errors.push("The file should not exceed 40 MB!")
					}
				}

				if (this.errors.length) {
					this.areErrorsExist = true
					this.isSaveClicked = true
					return
				}
				this.clientType === "Company" ? await this.saveClient() : await this.saveClientIndividual()

			},

			async checkSameClientEmails(clientEmail) {
				const clientMails = await this.$http.get('/clientsapi/all-clients-emails')
				const arrayOfMails = clientMails.body
						.map(key => key.email)
				return arrayOfMails.includes(clientEmail)
			},

			uploadFiles(data) {
				this.documentsFiles = data
			},
			async saveClientIndividual() {
				let sendData = new FormData()


				this.client.nativeLanguage = null
				this.client.timeZone = null
				this.client.website = ""
				this.client.officialCompanyName = this.client.name
				this.client.clientType = "Individual"

				this.client.billingInfo = {
					officialCompanyName: this.client.name,
					vat: false,
					vatId: '',
					dueDate: '',
					address: '',
					invoiceSending: false,
					paymentType: "PPP"
				}

				this.client.contacts = [ {
					leadContact: true,
					firstName: this.client.name,
					surname: "",
					password: "12345",
					email: this.client.email,
					gender: "",
					position: "Manager",
					phone: "",
					photo: "",
					whatsApp: "",
					skype: "",
					linkedIn: "",
					country: "",
					notes: ""
				} ]

				sendData.append('client', JSON.stringify(this.client))
				for (let i = 0; i < this.contactsPhotos.length; i++) {
					sendData.append('photos', this.contactsPhotos[i])
				}
				for (const document of this.documentsFiles) {
					sendData.append(document.category, document.file)
				}
				try {
					// console.log(this.client)
					const result = await this.$http.post('/clientsapi/update-client', sendData)
					const newClient = { ...result.data.client }
					await this.addNewClient(newClient)
					this.alertToggle({ message: "New Client saved", isShow: true, type: "success" })
					await this.$router.push(`/pangea-clients/all/details/${ newClient._id }`)
				} catch (err) {
					this.alertToggle({ message: "Internal server error on updating Client info", isShow: true, type: "error" })
				}
			},
			async saveClient() {
				let sendData = new FormData()

				if (this.client.timeZone === '') {
					this.client.timeZone = null
				}
				if (this.client.nativeLanguage === '') {
					this.client.nativeLanguage = null
				}

				sendData.append('client', JSON.stringify(this.client))
				for (let i = 0; i < this.contactsPhotos.length; i++) {
					sendData.append('photos', this.contactsPhotos[i])
				}
				for (const document of this.documentsFiles) {
					sendData.append(document.category, document.file)
				}
				try {
					const result = await this.$http.post('/clientsapi/update-client', sendData)
					const newClient = { ...result.data.client }
					await this.addNewClient(newClient)
					this.alertToggle({ message: "New Client saved", isShow: true, type: "success" })
					await this.$router.push(`/pangea-clients/all/details/${ newClient._id }`)
				} catch (err) {
					this.alertToggle({ message: "Internal server error on updating Client info", isShow: true, type: "error" })
				}
			},
			...mapActions({
				alertToggle: "alertToggle",
				addNewClient: "addNewClient"
			})
		},
		computed: {
			...mapGetters({
				allClients: "getClients",
				industries: "getAllIndustries"
			}),
			selectedIndNames() {
				let result = []
				if (this.client.industries.length) {
					for (let ind of this.client.industries) {
						result.push(ind.name)
					}
				}
				return result
			},
			isIndividual() {
				return this.clientType === 'Individual'
			}
		},
		components: {
			RadioButton,
			NewContactsInfo,
			NewGeneral,
			Button,
			ValidationErrors,
			ContactsInfo,
			NewClientSalesInfo,
			NewClientBillInfo,
			NewClientDocuments,
			NewSideGeneral,
			NewRates
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors";

  .client-layout {
    display: flex;
    margin: 50px;
  }

  .new-client-subinfo {
    &__general {
      margin-top: 40px;
      width: 390px;
      box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
      margin-left: 40px;
      background: white;
      border-radius: 4px;
    }

    &__date {
      margin-top: 40px;
      width: 390px;
      height: 270px;
      background: white;
      border-radius: 4px;
      box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
      background: white;
      border-radius: 4px;
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

      .title {
        font-size: 15px;
        font-family: Myriad600;
      }

      .icon {
        font-size: 15px;
        color: $text;
      }
    }

    &__data {
      padding: 20px 20px 20px;
      border-top: 2px solid $light-border;
    }
  }

  .new-client-info {
    position: relative;
    width: 1000px;

    &__gen-info {
      padding: 20px;
      box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
      box-sizing: border-box;
      margin-bottom: 25px;
      position: relative;
      border-radius: 4px;
      background-color: white;
    }

    &__block {
      box-sizing: border-box;
      margin-bottom: 25px;
      box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
      position: relative;
      border-radius: 4px;
      background-color: white;
    }

    &_error-shadow {
      box-shadow: 0 0 5px $red;
    }
  }

  .buttons {
    margin-right: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &__radio {
      display: flex;
      margin-bottom: 20px;

      .radio {
        margin-right: 10px;
      }
    }
  }

  .button-group {
    display: flex;
    align-items: center;
    width: 1000px;
    justify-content: center;
    margin-top: 30px;
  }

  .button {
    margin: 0 10px;
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
    box-shadow: 0 0 10px #66563d;
    background-color: #FFF;
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

  input {
    color: #66563d;
  }

</style>
