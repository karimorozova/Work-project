<template lang="pug">
  .client-layout
    .new-client-info(v-if="clientShow")
      .buttons
        .button
          Button(value="Save" @clicked="checkForErrors")
        .button
          Button(value="Cancel" @clicked="cancel")
      .title General Information
      .new-client-info__gen-info
        NewGeneral(
          :client="client"
          :isSaveClicked="isSaveClicked"
          :languages="languages"
          :timezones="timezones"
        )
      .title Contact Details
      .new-client-info__contacts-info(:class="{'new-client-info_error-shadow': !client.contacts.length && isSaveClicked}")
        NewContactsInfo(
          :client="client"
          @contactDetails="contactDetails"
          @setLeadContact="setLeadContact"
          @saveContactUpdates="saveContactUpdates"
          @newContact="addNewContact"
          @approveDelete="approveContactDelete"
        )
      .title Rates Parameters
      .new-client-info__rates
        NewRates(
          :client="client"
          :isSaveClicked="isSaveClicked"
        )

      .title Documents
      .new-client-info__documents
        NewClientDocuments(
          @uploadFiles="uploadFiles"
        )

      .title Sales Information
      .new-client-info__sales
        NewClientSalesInfo(
          :client="client"
          @setLeadSource="setLeadSource"
          :isEmpty="isLeadEmpty"
        )

      .title Billing Information
      .new-client-info__billing
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
				websiteRegEx: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/
			}
		},
		created() {
			this.getLangs()
			this.getTimezones()
		},
		methods: {
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
				this.$router.push("/clients")
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
			setLeadSource({ leadSource }) {

				this.client.leadSource = leadSource
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
				if (!this.client.industries.length) this.errors.push('Please, choose at least one industry.')
				if (!this.client.sourceLanguages.length) this.errors.push('Please, choose at least one source language.')
				if (!this.client.targetLanguages.length) this.errors.push('Please, choose at least one target language.')
				if (!this.client.contacts.length) this.errors.push('Please, add at least one contact.')
				if (!this.client.currency.length) this.errors.push('Please, add currency.')
				if (this.client.defaultPricelist === '') this.errors.push('Please, add pricelist.')
				if (!this.contactLeadError()) this.errors.push('Please set Lead Contact of the Client.')
				if (!this.client.status) this.errors.push('Please, choose status.')
				if (!this.client.leadSource) {
					this.errors.push('Please, choose lead source.')
					this.isLeadEmpty = true
				}

				this.vatChecker({ newClient: true })

				if (!this.client.email || !emailValidRegex.test(this.client.email.toLowerCase())) {
					this.errors.push('Please provide a valid email in General Information.')
				}
				if (this.client.billingInfo.paymentType === '') {
					this.errors.push('Please, add Payment type.')
					this.billErrors.push('payment')
				}
				// if (!this.client.billingInfo.email || !emailValidRegex.test(this.client.billingInfo.email.toLowerCase())) {
				// 	this.errors.push('Please provide a valid email in Billing Informations.')
				// 	this.billErrors.push('email')
				// }
				if (!this.client.accountManager || !this.client.salesManager || !this.client.projectManager) this.errors.push('All managers should be assigned.')

				const isSameEmailsExists = await this.checkSameClientEmails(this.client.email)
				if (isSameEmailsExists) {
					this.errors.push("A client with such Email already exists, the client's Email should be unique!")
				}
				if (this.client.website) {
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
				await this.saveClient()
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
					await this.$router.push(`/clients/details/${ newClient._id }`)
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
				allClients: "getClients"
			}),
			selectedIndNames() {
				let result = []
				if (this.client.industries.length) {
					for (let ind of this.client.industries) {
						result.push(ind.name)
					}
				}
				return result
			}
		},
		components: {
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
  }

  .new-client-subinfo {
    &__general {
      margin-top: 100px;
      width: 390px;
      height: 270px;
      box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
      margin-left: 40px;
    }

    &__date {
      margin-top: 40px;
      width: 390px;
      height: 270px;
      box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    }
  }

  .new-client-info {
    position: relative;
    width: 1000px;

    &__gen-info, &__rates, &__documents, &__contacts-info, &__sales, &__billing {
      padding: 20px;
      box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
      box-sizing: border-box;
    }

    &_error-shadow {
      box-shadow: 0 0 5px $red;
    }
  }

  .title {
    font-size: 22px;
    padding: 30px 0 10px;
  }

  .buttons {
    margin-right: 10px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
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
    box-shadow: 0 0 10px #67573E;
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
    color: #67573E;
  }

</style>
