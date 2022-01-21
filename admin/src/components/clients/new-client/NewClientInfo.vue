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
          :timezones="timezones"
          :languages="languages"
        )

      .new-client-info__block(v-if="!isIndividual" :class="{'new-client-info_error-shadow': !client.contacts.length && isSaveClicked}")
        .block__header(@click="toggleBlock('isContactDetails')")
          .title Contact Details
          .icon(v-if="!isContactDetails")
            i.fas.fa-chevron-down
          .icon(v-else)
            i.fas.fa-chevron-right
        .block__data(v-if="isContactDetails")
          ContactsTable(
            :contacts="client.contacts"
            @setLeadContact="setLeadContact"
            @contactSave="contactSave"
            @contactUpdate="contactUpdate"
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

      //.new-client-info__block
      //  .block__header(@click="toggleBlock('isDocuments')")
      //    .title Documents
      //    .icon(v-if="!isDocuments")
      //      i.fas.fa-chevron-down
      //    .icon(v-else)
      //      i.fas.fa-chevron-right
      //  .block__data(v-if="isDocuments")
      //    NewClientDocuments(
      //      @uploadFiles="uploadFiles"
      //    )

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

      ValidationErrors(
        v-if="areErrorsExist"
        :errors="errors"
        @closeErrors="closeErrorsBlock"
      )

      .button-group
        .button
          Button(value="Save" @clicked="checkForErrors")
        .button
          Button(value="Cancel" @clicked="cancel" :outline="true")

    .new-client-subinfo
      .new-client-subinfo__general
        NewSideGeneral(
          :client="client"
          :isSaveClicked="isSaveClicked"
          :clientType="clientType"
        )
</template>

<script>
	import NewRates from './NewRates'
	// import NewClientDocuments from './NewClientDocuments'
	import NewGeneral from './NewGeneral'
	import Button from "../../Button"
	import ValidationErrors from "../../ValidationErrors"
	import NewClientSalesInfo from './NewClientSalesInfo'
	import NewSideGeneral from './NewSideGeneral'
	import { mapGetters, mapActions } from "vuex"
	import RadioButton from "../../RadioButton"
	import ContactsTable from "../ContactsTable"

	export default {
		data() {
			return {
				client: {
					name: "",
					status: "",
					clientType: "Company",
					website: "",
					contract: "",
					isTest: false,
					nda: "",
					accountManager: "",
					salesManager: null,
					projectManager: "",
					leadSource: "",
					languageCombinations: [],
					nativeLanguage: '',
					timeZone: '',
					contacts: [],
					currency: '',
					defaultPricelist: '',
					officialCompanyName: '',
					email: ''
				},
				contactsPhotos: [],

				isContactDetails: true,
				isRatesParameters: true,
				// isDocuments: true,
				isSalesInformation: true,
				timezones: [],
				errors: [],
				areErrorsExist: false,
				isSaveClicked: false,
				isLeadEmpty: false,
				clientShow: true,
				contactShow: false,
				contactInd: 0,
				contractFile: [],
				ndaFile: [],
				// documentsFiles: [],
				clientType: 'Company',
				websiteRegEx: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/
			}
		},
		created() {
			this.getTimezones()
		},
		methods: {
			contactUpdate({ contact, file, index }) {
				this.contactsPhotos.push(file)
				this.client.contacts[index] = contact
			},
			contactSave({ contact, file }) {
				this.contactsPhotos.push(file)
				this.client.contacts.push(contact)
				if (this.client.contacts.length === 1) this.client.contacts[0].leadContact = true
			},
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
				this.client.leadSource = "Online Search"
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
				this[prop] = [ files[0] ]
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
			setLeadContact({ index }) {
				for (let contact of this.client.contacts) {
					contact.leadContact = false
				}
				this.client.contacts[index].leadContact = true
			},
			closeErrorsBlock() {
				this.areErrorsExist = false
			},
			clearErrors() {
				this.errors = []
				this.isLeadEmpty = false
			},
			contactLeadError() {
				return this.client.contacts.find(item => item.leadContact)
			},
			async checkForErrors() {
				this.clearErrors()
				const emailValidRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
				if (!this.client.name) this.errors.push('Company name cannot be empty.')
				// if (this.clientType !== "Individual" && !this.client.contacts.length) this.errors.push('Please, add at least one contact.')
				if (!this.client.currency.length) this.errors.push('Please, add currency.')
				if (this.client.defaultPricelist === '') this.errors.push('Please, add pricelist.')
				if (this.clientType !== "Individual" && !this.contactLeadError()) this.errors.push('Please set Lead Contact of the Client.')
				if (!this.client.status) this.errors.push('Please, choose status.')
				if (!this.client.leadSource) {
					this.errors.push('Please, choose lead source.')
					this.isLeadEmpty = true
				}
				if (!this.client.email || !emailValidRegex.test(this.client.email.toLowerCase())) this.errors.push('Please provide a valid email in General Information.')
        //TODO: refactor | Client PaymentType
				// if (this.clientType === "Individual") this.client.paymentType = 'PPP'

				// if (this.clientType !== "Individual" && this.client.paymentType === '') {
				// 	this.errors.push('Please, add Payment type.')
				// }
				if (!this.client.accountManager || !this.client.projectManager) this.errors.push('All managers should be assigned.')

				const isSameEmailsExists = await this.checkSameClientEmails(this.client.email)
				if (isSameEmailsExists) this.errors.push("A client with such Email already exists, the client's Email should be unique!")

				if (this.clientType !== "Individual" && this.client.website) {
					if (this.websiteRegEx.exec(this.client.website) === null) {
						this.errors.push("The website field must contain a link")
					}
				}
				// const filesSize = this.documentsFiles.filter(item => item.file)
				// if (filesSize.length) {
				// 	if (filesSize.map(item => item.file).map(item => item.size).some(item => item > 40000000)) {
				// 		this.errors.push("The file should not exceed 40 MB!")
				// 	}
				// }
				if (this.errors.length) {
					this.areErrorsExist = true
					this.isSaveClicked = true
					return
				}
				this.clientType === "Company" ? await this.saveClient() : await this.saveClientIndividual()
			},

			async checkSameClientEmails(clientEmail) {
				const clientMails = await this.$http.get('/clientsapi/all-clients-emails')
				const arrayOfMails = clientMails.body.map(key => key.email)
				return arrayOfMails.includes(clientEmail)
			},
			// uploadFiles(data) {
			// 	this.documentsFiles = data
			// },
			async saveClientIndividual() {
				let sendData = new FormData()

				this.client.nativeLanguage = null
				this.client.timeZone = null
				this.client.website = ""
				this.client.officialCompanyName = this.client.name
				this.client.clientType = "Individual"

				this.client.contacts = [ {
					leadContact: true,
					firstName: this.client.name,
					surname: "",
					password: "",
					email: this.client.email,
					gender: "",
					position: "Manager",
					phone: "",
					photo: "",
					country: "",
					notes: ""
				} ]

        this.client.billingInfo = {
          name: this.client.name || '-',
          officialName: this.client.officialCompanyName || this.client.name,
          paymentType: "PPP",
          paymentTerms: '',
          address: {
            country: '',
            street1: '',
            street2: '',
            city: '',
            state: '',
            zipCode: '',
            vat: '',
          },
          notes: '',
          reports: [],
        }

				sendData.append('client', JSON.stringify(this.client))
				for (let i = 0; i < this.contactsPhotos.length; i++) {
					sendData.append('photos', this.contactsPhotos[i])
				}
				// for (const document of this.documentsFiles) {
				// 	sendData.append(document.category, document.file)
				// }
				try {
					const result = await this.$http.post('/clientsapi/update-client', sendData)
					const newClient = { ...result.data.client }
					await this.addNewClient(newClient)
					this.alertToggle({ message: "New Client saved", isShow: true, type: "success" })
					// await this.$router.push(`/pangea-clients/all/details/${ newClient._id }`)
				} catch (err) {
					this.alertToggle({ message: "Internal server error on updating Client info", isShow: true, type: "error" })
				}
			},
			async saveClient() {
				let sendData = new FormData()

				if (this.client.timeZone === '') this.client.timeZone = null
				if (this.client.nativeLanguage === '') this.client.nativeLanguage = null
        this.client.billingInfo = {

          name: this.client.name || '-',
          officialName: this.client.officialCompanyName || this.client.name,
          paymentType: this.client.paymentType,
          paymentTerms: '',
          address: {
            country: '',
            street1: '',
            street2: '',
            city: '',
            state: '',
            zipCode: '',
            vat: '',
          },
          notes: '',
          reports: [],
        }
				delete this.client.paymentType

				sendData.append('client', JSON.stringify(this.client))
				for (let i = 0; i < this.contactsPhotos.length; i++) sendData.append('photos', this.contactsPhotos[i])
				// for (const document of this.documentsFiles) sendData.append(document.category, document.file)

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
				languages: "getAllLanguages"
			}),
			isIndividual() {
				return this.clientType === 'Individual'
			}
		},
		components: {
			ContactsTable,
			RadioButton,
			NewGeneral,
			Button,
			ValidationErrors,
			NewClientSalesInfo,
			// NewClientDocuments,
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
      box-shadow: $box-shadow;
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
      box-shadow: $box-shadow;
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
    width: 1040px;

    &__gen-info {
      padding: 20px;
      box-shadow: $box-shadow;
      box-sizing: border-box;
      margin-bottom: 25px;
      position: relative;
      border-radius: 4px;
      background-color: white;
    }

    &__block {
      box-sizing: border-box;
      margin-bottom: 25px;
      box-shadow: $box-shadow;
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
        margin-right: 15px;
      }
    }
  }

  .button-group {
    display: flex;
    align-items: center;
    width: 1040px;
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
      font-size: 18px;
      width: 50%;
      text-align: center;
    }

    .approve-block {
      margin-bottom: 15px;
    }
  }

</style>
