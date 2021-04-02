<template lang="pug">
  .client-layout
    .client-info(v-if="currentClient._id")

      SaveCancelPopUp(v-if="detectedForSave" text=""  @accept="checkForErrors" @cancel="cancel")

      .title General Information
      .client-info__gen-info
        General(
          :isSaveClicked="isSaveClicked"
          :languages="languages"
          :timezones="timezones"
          :allClientAliases="aliases"
        )

      .title Notes & Comments
      .client-info__notes
        ClientsNotes

      .title Contact Details
      .client-info__contacts-info
        ContactsInfo(
          :client="currentClientOverallData"
          @contactDetails="contactDetails"
          @saveContactUpdates="saveContactUpdates"
          @setLeadContact="setLeadContact"
          @newContact="addNewContact"
          @approveDelete="approveContactDelete"
        )

      .title Services
      .client-info__services
        ClientServices(
          :clientServices="currentClient.services"
          :defaultPricelist="currentClient.defaultPricelist"
          :languages="languages"
          :sourceLanguagesClient="sourceLanguagesClientData"
          :targetLanguagesClient="targetLanguagesClientData"
          :industries="industries"
          :services="services"
          :clientIndustries="currentClient.industries.map(i => i.name)"
          @updateRates="updateRates"
        )

      .title Rates
      .client-info__rates
        RatesParameters
        .client-info__tables-row
          .lang-table
            LangTable(
              :dataArray="currentClient.rates.basicPricesTable"
              :clientId="currentClient._id"
              @refreshResultTable="refreshResultTable"
            )
          .step-table
            StepTable(
              :dataArray="currentClient.rates.stepMultipliersTable"
              :clientId="currentClient._id"
              @refreshResultTable="refreshResultTable"
              :refresh="isRefreshAfterServiceUpdate"
            )
          .industry-table
            IndustryTable(
              :dataArray="currentClient.rates.industryMultipliersTable"
              :clientId="currentClient._id"
              @refreshResultTable="refreshResultTable"
              :refresh="isRefreshAfterServiceUpdate"
            )

        .result-table
          ResultTable(
            :clientId="currentClient._id"
            :languages="languages"
            :steps="steps"
            :units="units"
            :industries="industries"
            :isRefreshResultTable="isRefreshResultTable"
            :refresh="isRefreshAfterServiceUpdate"
          )

      .title Discount Chart
      .client-info__chart
        DiscountChart(:entity="currentClient", @getDefaultValues="getDefaultValuesDC" @setMatrixData="setMatrixData")

      .title Documents
      .client-info__documents
        ClientDocuments(
          :documentsData="currentClient.documents"
        )

      .title Sales Information
      .client-info__sales
        ClientSalesInfo(:client="currentClientOverallData" @setLeadSource="setLeadSource")

      .title Billing Information
      .client-info__billing
        ClientBillInfo(:client="currentClientOverallData" @changeProperty="changeBillingProp")

      .delete-approve(v-if="isApproveModal")
        p Are you sure you want to delete?
        input.button.approve-block(type="button" value="Cancel" @click="cancelApprove")
        input.button(type="button" value="Delete" @click="approveClientDelete")

      ValidationErrors(
        v-if="areErrorsExist"
        :errors="errors"
        @closeErrors="closeErrorsBlock"
      )

    .client-subinfo(v-if="currentClient._id")
      .client-subinfo__general
        SideGeneral(:isSaveClicked="isSaveClicked")

      .client-subinfo__date
        OtherClientInformation

</template>

<script>
	import RatesParameters from "./pricelists/RatesParameters"
	import OtherClientInformation from "./OtherClientInformation"
	import ClientDocuments from "./ClientDocuments"
	import ClientServices from "./ClientServices"
	import General from "./clientInfo/General"
	import SideGeneral from "./clientInfo/SideGeneral"
	import Button from "../Button"
	import ValidationErrors from "../ValidationErrors"
	import ContactsInfo from "./ContactsInfo"
	import ClientSalesInfo from "./ClientSalesInfo"
	import ClientBillInfo from "./ClientBillInfo"
	import IndustryTable from "./pricelists/IndustryTable"
	import StepTable from "./pricelists/StepTable"
	import LangTable from "./pricelists/LangTable"
	import ResultTable from "./pricelists/ResultTable"
	import { mapGetters, mapActions } from "vuex"
	import DiscountChart from "./DiscountChart"
	import ClientsNotes from "./ClientsNotes"
	import vatChecker from "../../mixins/Client/vatChecker"
  import SaveCancelPopUp from "../SaveCancelPopUp";

	export default {
		mixins: [ vatChecker ],
		props: {
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
				aliases: [],
				timezones: [],
				currentDocuments: [],
				clientDataInCreated: {
					sourceLanguages: [],
					targetLanguages: []
				},
				websiteRegEx: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/,

				isApproveModal: false,
				clientShow: true,
				contactShow: false,
				contactInd: 0,
				newContact: false,
				fromRoute: "/clients",
				areErrorsExist: false,
				errors: [],
				billErrors: [],
				isLeadEmpty: "",
				isSaveClicked: false,
				isRefreshResultTable: false,
				isRefreshAfterServiceUpdate: false,

        generalKeys: [
	        'name',
	        'officialCompanyName',
	        'email',
	        'website',
	        'industries',
	        'nativeLanguage',
	        'timeZone',
	        'aliases',
	        'targetLanguages',
	        'sourceLanguages',
	        'status',
	        'accountManager',
	        'salesManager',
	        'projectManager',
	        'otherInfo',
	        'leadGeneration',
	        'leadSource',
	        'contacts'
        ],
        billingKeys: [
					'vat',
					'vatId',
					'address',
					'invoiceSending',
					'officialCompanyName',
					'dueDate',
					'paymentType'
				]
			}
		},
		methods: {
			async setMatrixData({ value, key }) {
				value = value > 100 ? 100 : value < 0 ? 0 : value
				try {
					const result = await this.$http.post(`/clientsapi/update-matrix/${ this.currentClient._id }`, { updatedRowObj: { value, key } })
					this.setUpClientProp({ _id: this.$route.params.id, key: 'matrix', value: result.data })
					this.alertToggle({ message: "Matrix data updated", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Error on setting matrix data", isShow: true, type: "error" })
				}
			},
			async getDefaultValuesDC(discountKey) {
				try {
					const result = await this.$http.post(`/clientsapi/sync-matrix/${ this.currentClient._id }`, { key: discountKey })
					this.setUpClientProp({ _id: this.$route.params.id, key: 'matrix', value: result.data })
					this.alertToggle({ message: "Matrix data updated", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Error on setting matrix data", isShow: true, type: "error" })
				}
			},
			refreshResultTable() {
				this.isRefreshResultTable = true
				setTimeout(() => {
					this.isRefreshResultTable = false
				}, 500)
			},
			updateRates(action) {
				this.isRefreshAfterServiceUpdate = action
				setTimeout(() => {
					this.isRefreshAfterServiceUpdate = !action
				}, 500)
			},
			loadFile({ files, prop }) {
				this.$emit("loadFile", { files, prop })
			},
			cancel() {
        this.storeCurrentClientOverallData(this.currentClient)
			},
			saveContactUpdates({ index, contact }) {
				// this.updateClientContact({ index, contact })
			},
			deleteClient() {
				this.isApproveModal = true
			},
			contactLeadError() {
				return this.currentClient.contacts.find((item) => item.leadContact)
			},
			async approveContactDelete({ index }) {
				this.clientShow = true
				this.contactShow = false
				try {
					if (this.currentClient.contacts.length === 1) {
						return this.alertToggle({ message: "Error! At least one contact should remain!", isShow: true, type: "error" })
					}
					const contacts = this.updateLeadWhenDeleted(index)
					const result = await this.$http.post("/clientsapi/deleteContact", { id: this.currentClient._id, contacts })
					this.setUpClientProp({ _id: this.$route.params.id, key: 'contacts', value: result.data.contacts })
					this.storeCurrentClientOverallData(result.data)
					this.alertToggle({ message: "Contact has been deleted", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Internal server error on deleting contact", isShow: true, type: "error" })
				}
			},
			updateLeadWhenDeleted(index) {
				let contacts = this.currentClient.contacts.filter(
						(item, ind) => ind !== index
				)
				const leadContact = contacts.find((item) => item.leadContact)
				if (!leadContact) {
					contacts[0].leadContact = true
				}
				return contacts
			},
			cancelApprove() {
				this.isApproveModal = false
			},
			setLeadSource({ leadSource }) {
				this.storeClientPropertyOverallData({ prop: "leadSource", value: leadSource })
			},
			changeBillingProp({ prop, value }) {
				this.storeClientPropertyOverallDataBilling({ prop, value })
			},
			contactDetails({ contactIndex }) {
				this.$router.push({ name: "contact", params: { index: contactIndex } })
			},
			addNewContact(data) {
				this.$router.push({ name: "new-contact" })
			},
			closeErrorsBlock() {
				this.areErrorsExist = false
			},
			clearErrors() {
				this.errors = []
				this.billErrors = []
				this.isLeadEmpty = false
			},
			async checkForErrors() {
				this.clearErrors()
				const emailValidRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
				if (!this.currentClientOverallData.name)
					this.errors.push("Company name cannot be empty.")
				if (!this.currentClientOverallData.industries.length)
					this.errors.push("Please, choose at least one industry.")
				if (!this.currentClientOverallData.sourceLanguages.length)
					this.errors.push("Please, choose source language.")
				if (!this.currentClientOverallData.targetLanguages.length)
					this.errors.push("Please, choose target language.")
				if (!this.currentClientOverallData.contacts.length)
					this.errors.push("Please, add at least one contact.")
				if (!this.contactLeadError())
					this.errors.push("Please set Lead Contact of the Client.")
				if (!this.currentClientOverallData.status)
					this.errors.push("Please, choose status.")
				if (!this.currentClientOverallData.leadSource) {
					this.errors.push("Please, choose lead source.")
					this.isLeadEmpty = true
				}
				this.vatChecker({ newClient: false })
				if (!this.currentClientOverallData.email || !emailValidRegex.test(this.currentClientOverallData.email.toLowerCase())) {
					this.errors.push("Please provide a valid email in General Informations.")
				}
				if (!this.currentClientOverallData.accountManager || !this.currentClientOverallData.salesManager || !this.currentClientOverallData.projectManager) this.errors.push("All managers should be assigned.")

				// const isSameEmailsExists = await this.checkSameClientEmails(this.currentClientOverallData.email, this.currentClientOverallData._id)
				// if (isSameEmailsExists) {
				// 	this.errors.push("A client with such Email already exists, the client's Email should be unique!")
				// }
				if (this.currentClientOverallData.website) {
					if (this.websiteRegEx.exec(this.currentClientOverallData.website) === null) {
						this.errors.push("The website field must contain a link")
					}
				}
				if (this.errors.length) {
					this.areErrorsExist = true
					this.isSaveClicked = true
					return
				}
				await this.updateClient()
			},

			async checkSameClientEmails(clientEmail, clientId) {
				const clientMails = await this.$http.get('/clientsapi/all-clients-emails')
				const arrayOfMails = clientMails.body
						.filter(item => item._id.toString() !== clientId)
						.map(key => key.email)
				return arrayOfMails.includes(clientEmail)
			},

			async updateClient() {
        let clientForSave = {...this.currentClient}
				let keys = [ ...this.generalKeys ]
				let billingKeys = [ ...this.billingKeys ]

				for(let key of keys) clientForSave[key] = this.currentClientOverallData[key]
				for(let key of billingKeys) clientForSave.billingInfo[key] = this.currentClientOverallData.billingInfo[key]

				let sendData = new FormData()
				let dataForClient = clientForSave
				this.getClientDocumentInfo().then(
						(result) => (dataForClient.documents = result.data.documents)
				)
				sendData.append("client", JSON.stringify(dataForClient))
				for (let i = 0; i < this.contactsPhotos.length; i++) {
					sendData.append("photos", this.contactsPhotos[i])
				}
				try {
					const result = await this.$http.post("/clientsapi/update-client", sendData)
					const { client } = result.data

					await this.storeClient(client)
					await this.storeCurrentClient(client)
          this.storeCurrentClientOverallData(client)

          this.$socket.emit('updatedClientData', {_id: this.$route.params.id, data: this.currentClientOverallData})

          this.alertToggle({
						message: "Client info has been updated", isShow: true, type: "success"
					})
				} catch (err) {
					this.alertToggle({ message: "Internal server error on updating Client info", isShow: true, type: "error" })
				}
			},
			async approveClientDelete() {
				const id = this.currentClient._id
				this.isApproveModal = false
				try {
					const hasRelatedDocs = await this.$http.get(`/clientsapi/any-doc?id=${ id }`)
					if (hasRelatedDocs.body) {
						return this.alertToggle({
							message: "The client has related documents and cannot be deleted",
							isShow: true,
							type: "error"
						})
					}
					const result = await this.$http.delete(`/clientsapi/deleteclient/${ id }`)
					await this.removeClient(id)
					this.alertToggle({ message: "Client has been removed", isShow: true, type: "success" })
					await this.$router.push("/clients")
				} catch (err) {
					this.alertToggle({ message: "Internal server error on deleting the Client", isShow: true, type: "error" })
				}
			},
			setLeadContact({ index }) {
				// this.updateLeadContact(index)
			},
			async getClientDocumentInfo() {
				return await this.$http.get(`/clientsapi/client?id=${ this.$route.params.id }`)
			},
			async getClientInfoLangs() {
				const client = await this.$http.get(`/clientsapi/client-languages?id=${ this.$route.params.id }`)
				this.clientDataInCreated.sourceLanguages = client.body.sourceLanguages
				this.clientDataInCreated.targetLanguages = client.body.targetLanguages
			},
			async setDocumentsDefaults(category) {
				let defaultDocument = { clientId: this.$route.params.id, category: category }
				try {
					const result = await this.$http.post("/clientsapi/client-document-default", defaultDocument)
				} catch (err) {
					this.alertToggle({ message: "Error in creating default documents", isShow: true, type: "error" })
				}
			},
			async setNewClientDocuments(client) {
				switch (client.documents.length) {
					case 1:
						let category = client.documents[0].category
						category === "NDA" ? await this.setDocumentsDefaults("Contract") : await this.setDocumentsDefaults("NDA")
						break
					case 0:
						await this.setDocumentsDefaults("NDA")
						await this.setDocumentsDefaults("Contract")
						break
				}
			},
			async getClientInfo() {
				if (!this.currentClient._id) {
					const client = await this.$http.get(`/clientsapi/client?id=${ this.$route.params.id }`)
					this.storeCurrentClient(client.data)
					this.storeCurrentClientOverallData(client.data)
					this.setNewClientDocuments(client.data)
				}
			},
			async getClientInfoWithoutOverallData() {
				if (!this.currentClient._id) {
					const client = await this.$http.get(`/clientsapi/client?id=${ this.$route.params.id }`)
					this.storeCurrentClient(client.data)
				}
			},
			...mapActions({
				alertToggle: "alertToggle",
				storeClient: "storeClient",
				storeCurrentClient: "storeCurrentClient",
				storeCurrentClientOverallData: "storeCurrentClientOverallData",
				storeClientProperty: "storeClientProperty",
				removeClient: "removeClient",
				storeClientContact: "storeClientContact",
				updateClientContact: "updateClientContact",
				updateLeadContact: "updateLeadContact",
				deleteClientContact: "deleteClientContact",
				storeClientBillingInfoProperty: "storeClientBillingInfoProperty",
				setUpClientProp: "setUpClientProp",
				storeClientPropertyOverallData: "storeClientPropertyOverallData",
				storeClientPropertyOverallDataBilling: "storeClientPropertyOverallDataBilling"
			}),

			async getAliases() {
				try {
					const result = await this.$http.get("/memoqapi/memoq-client-aliases")
					this.aliases = result.body
				} catch (err) {
					this.alertToggle({
						message: "Error in Aliases",
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
			}
		},
		computed: {
			...mapGetters({
				allClients: "getClients",
				currentClient: "getCurrentClient",
				steps: "getAllSteps",
				units: "getAllUnits",
				services: "getAllServices",
				industries: "getAllIndustries",
				languages: "getAllLanguages",
				currentClientOverallData: "currentClientOverallData"
			}),
			detectedForSave() {
				if (this.currentClient.hasOwnProperty('name')) {
					let keys = [ ...this.generalKeys ]
					let billingKeys = [ ...this.billingKeys ]

					for (let key of keys) {
						if (JSON.stringify(this.currentClientOverallData[key]) !== JSON.stringify(this.currentClient[key])) {
							return true
						}
					}
					for (let key of billingKeys) {
						if (JSON.stringify(this.currentClientOverallData.billingInfo[key]) !== JSON.stringify(this.currentClient.billingInfo[key])) {
							return true
						}
					}
				}
			},
			sourceLanguagesClientData() {
				if (this.clientDataInCreated.sourceLanguages.length) {
					return this.clientDataInCreated.sourceLanguages.map(i => i.lang).sort((a, b) => a.localeCompare(b))
				}
			},
			targetLanguagesClientData() {
				if (this.clientDataInCreated.targetLanguages.length) {
					return this.clientDataInCreated.targetLanguages.map(i => i.lang).sort((a, b) => a.localeCompare(b))
				}
			}

		},
		components: {
      SaveCancelPopUp,
			DiscountChart,
			ClientServices,
			General,
			Button,
			ValidationErrors,
			ContactsInfo,
			IndustryTable,
			ClientSalesInfo,
			ClientBillInfo,
			StepTable,
			LangTable,
			ResultTable,
			SideGeneral,
			ClientDocuments,
			OtherClientInformation,
			RatesParameters,
			ClientsNotes,
		},
		created() {
			this.getClientInfoLangs()
			this.getTimezones()
			this.getAliases()
      this.$socket.on('refreshClientData', ({ _id, data }) => {
        if (_id == this.$route.params.id) {
          this.storeCurrentClient({...this.currentClient, ...data})
          this.storeCurrentClientOverallData(data)
        }
      })
		},
		beforeDestroy() {
			this.storeCurrentClient({})
		},
		beforeRouteEnter(to, from, next) {
			next((vm) => {
				if (from.name !== 'contact') {
					vm.getClientInfo()
				} else {
					vm.getClientInfoWithoutOverallData()
				}
				vm.fromRoute = from.path
			})
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";

  .client-layout {
    display: flex;
    margin-bottom: 50px;
  }

  .client-subinfo {
    &__general {
      margin-top: 66px;
      width: 390px;
      height: 270px;
      box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
      margin-left: 40px;

    }

    &__date {
      margin-top: 65px;
      margin-left: 40px;
      width: 390px;
      height: 270px;
      box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;

    }
  }

  .client-info {
    width: 1000px;
    position: relative;

    &__notes {
      box-sizing: border-box;
      box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    }

    &__gen-info,
    &__services,
    &__contacts-info,
    &__sales,
    &__documents,
    &__chart,
    &__billing {
      padding: 20px;
      box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
      box-sizing: border-box;
    }

    &__rates {
      padding: 0;
      padding: 20px;
      box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;

      box-sizing: border-box;
    }

    &__documents {
      position: relative;
    }

    &__services {
      position: relative;
    }

    &_error-shadow {
      box-shadow: 0 0 5px $red;
    }

    &__tables-row {
      display: flex;
      padding-top: 20px;

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

  .buttons {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-right: 10px;
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

  input {
    color: #67573e;
  }
</style>
