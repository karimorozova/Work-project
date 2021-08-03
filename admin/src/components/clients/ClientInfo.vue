<template lang="pug">
  .client-layout
    .client-info(v-if="currentClient._id")
      Sidebar(
        @createTask="createTask"
        @createNote="createNote"
        @openAllActivities="openAllActivitiesModal"
        @editActivityDetailsTask="editActivityDetailsTask"
        :isSaveClicked="isSaveClicked"
      )
      .client-activity__addTask(v-if="createTaskModal")
        AddTask(
          :clientTask="clientTask"
          @close="closeTaskModal"
        )
      .client-activity__addNote(v-if="createNoteModal")
        AddNote(
          :clientNote="clientNote"
          @close="closeNoteModal"
        )
      .client-activity__all-activities(v-if="allActivitiesModal")
        AllActivitiesModal(
          @openModalFullSize="toggleModalFullSize"
          @close="closeAllActivities"
          @editActivityDetailsTask="editActivityDetailsTask"
          @editActivityDetailsNote="editActivityDetailsNote"
          :rowCount="3"
        )

      SaveCancelPopUp(v-if="detectedForSave" text=""  @accept="checkForErrors" @cancel="cancel")

      .client-info__layoutActivities(v-if="fullActivityModal")

        .title-with-action
          span All Activities

        AllActivitiesFullScrean(
          @editActivityDetailsTask="editActivityDetailsTask"
          @editActivityDetailsNote="editActivityDetailsNote"
          @closeModalFullSize="closeModalFullSize"
          @backToMainPage="backToMainPage"
        )

      .client-info__layout(v-else)
        .client-info__main-row
          .client-info__radio
            RadioButton.radio(name="Company" :selected="currentClientOverallData.clientType" @toggleRadio="toggleRadio")
            RadioButton.radio(name="Individual" :selected="currentClientOverallData.clientType" @toggleRadio="toggleRadio")
          .title General Information
          .client-info__gen-info
            General(
              :isSaveClicked="isSaveClicked"
              :isIndividual="isIndividual"
              :languages="languages"
              :timezones="timezones"
              :allClientAliases="aliases"
            )

          .title Notes & Comments
          .client-info__notes
            ClientsNotes

          .title(v-if="!isIndividual") Contact Details
          .client-info__contacts-info(v-if="!isIndividual")
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
            .rates__icons
              .rates__mainIcon(v-if="!paramsIsEdit" @click="crudActions('edit'), setNewStepCombination()")
                i.fas.fa-pen#pen
              .rates__mainIcon(v-if="paramsIsEdit" @click="crudActions('cancel')")
                i.fas.fa-times-circle#close

            RatesParameters(:isEdit="isEdit")
            Tabs(
              :tabs="tabs"
              :selectedTab="selectedTab"
              @setTab="setTab"
            )
            .lang-table(v-if="selectedTab === 'Basic Price'")
              LangTable(
                :dataArray="currentClient.rates.basicPricesTable"
                :clientId="currentClient._id"
                @refreshResultTable="refreshResultTable"
                :isEdit="isEdit"
                @toggleCheck="toggleCheck"
                @toggleAll="toggleAll"
              )
            .step-table(v-if="selectedTab === 'Steps / Units'")
              StepTable(
                :dataArray="currentClient.rates.stepMultipliersTable"
                :clientId="currentClient._id"
                @refreshResultTable="refreshResultTable"
                :refresh="isRefreshAfterServiceUpdate"
                :isEdit="isEdit"
                @toggleCheck="toggleCheck"
                @toggleAll="toggleAll"
              )
            .industry-table(v-if="selectedTab === 'Industries'")
              IndustryTable(
                :dataArray="currentClient.rates.industryMultipliersTable"
                :clientId="currentClient._id"
                @refreshResultTable="refreshResultTable"
                :refresh="isRefreshAfterServiceUpdate"
                :isEdit="isEdit"
                @toggleCheck="toggleCheck"
                @toggleAll="toggleAll"
              )
            .result-table(v-if="selectedTab === 'Overall Prices'")
              ResultTable(
                :dataArray="currentClient.rates.pricelistTable"
                :clientId="currentClient._id"
                :languages="languages"
                :steps="steps"
                :units="units"
                :industries="industries"
                :isRefreshResultTable="isRefreshResultTable"
                :refresh="isRefreshAfterServiceUpdate"
                :isEdit="isEdit"
                @toggleCheck="toggleCheck"
                @toggleAll="toggleAll"
              )
            .chart(v-if="selectedTab === 'Discount & Surcharge / Discount Chart'")
              DiscountChart(
                :entity="currentClient",
                @getDefaultValues="getDefaultValuesDC"
                @setMatrixData="setMatrixData"
                :isEdit="isEdit"
              )
              .discounts
                Discounts(
                  :paramsIsEdit="isEdit",
                  :enum="'client'"
                )

          .title Documents
          .client-info__documents
            ClientDocuments(
              :documentsData="currentClient.documents"
            )

          .title Sales Information
          .client-info__sales
            ClientSalesInfo(:client="currentClientOverallData" @setLeadSource="setLeadSource")

          .title(v-if="!isIndividual") Billing Information
          .client-info__billing(v-if="!isIndividual")
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
          //.client-subinfo__general
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
	import SaveCancelPopUp from "../SaveCancelPopUp"
	import Sidebar from "./sidebar/SidebarMenu"
	import AddTask from "./activity/AddTask"
	import AddNote from "./activity/AddNote"
	import AllActivitiesModal from "./activity/AllActivitiesModal"
	import AllActivitiesFullScrean from "./activity/AllActivitiesFullScrean"
	import RadioButton from "../RadioButton"
	import Tabs from "../Tabs"
	import Discounts from "./pricelists/Discounts"

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
				icons: {
					edit: { icon: require("../../assets/images/latest-version/edit.png") },
					cancel: { icon: require("../../assets/images/cancel-icon.png") }
				},
				tabs: [ 'Basic Price', 'Steps / Units', 'Industries', 'Discount & Surcharge / Discount Chart', 'Overall Prices' ],
				selectedTab: 'Overall Prices',
				clientTask: {},
				clientNote: {},
				aliases: [],
				timezones: [],
				currentDocuments: [],
				clientDataInCreated: {
					sourceLanguages: [],
					targetLanguages: []
				},
				paramsIsEdit: false,

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
					'clientType',
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
				],

				createTaskModal: false,
				createNoteModal: false,
				allActivitiesModal: false,
				fullActivityModal: false,
				isEdit: false
			}
		},
		methods: {
			async setNewStepCombination() {
				try {
					const updatedClient = await this.$http.post('/clientsapi/updated-retest-from-settings', { clientId: this.$route.params.id })
					this.setUpClientProp({ _id: this.$route.params.id, key: 'rates', value: updatedClient.data.rates })
					this.refreshResultTable()
				} catch (err) {
					this.alertToggle({ message: "Rates not Updated!", isShow: true, type: "error" })
				}
			},
			toggleCheck({ row, val, prop }) {
				const index = getIndex(this.currentClient.rates[prop], row._id)
				const obj = this.currentClient.rates[prop][index]
				obj.isCheck = val
				this.currentClient.rates[prop].splice(index, 1, obj)

				function getIndex(arr, id) {
					return arr.findIndex(({ _id }) => `${ _id }` === `${ id }`)
				}
			},
			toggleAll({ val, prop }) {
				this.currentClient.rates[prop] = this.currentClient.rates[prop].reduce((acc, cur) => {
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
			toggleRadio({ value }) {
				this.storeClientPropertyOverallData({ prop: "clientType", value })
			},
			backToMainPage() {
				this.fullActivityModal = false
			},
			toggleModalFullSize(data) {
				this.fullActivityModal = data
			},
			closeModalFullSize() {
				this.fullActivityModal = false
				this.openAllActivitiesModal()
			},
			editActivityDetailsTask(taskData) {
				const { _id, priority, title, dateTime, details, assignedTo, associatedTo } = taskData
				this.clientTask = { _id, priority, title, dateTime, details, assignedTo, associatedTo, stage: 'update' }
				this.createTaskModal = true
			},
			editActivityDetailsNote(noteData) {
				const { _id, priority, title, dateTime, details, assignedTo, associatedTo } = noteData
				this.clientNote = { _id, priority, title, dateTime, details, assignedTo, associatedTo, stage: 'update' }
				this.createNoteModal = true
			},
			closeTaskModal() {
				this.createTaskModal = false
			},
			closeNoteModal() {
				this.createNoteModal = false
			},
			closeAllActivities() {
				this.allActivitiesModal = false
			},
			createTask() {
				this.clientTask = {
					priority: "",
					title: "",
					dateTime: "",
					details: "",
					assignedTo: {},
					associatedTo: [],
					stage: 'create'
				}
				this.createTaskModal = true
			},
			createNote() {
				this.clientNote = {
					priority: "",
					title: "",
					dateTime: "",
					details: "",
					assignedTo: {},
					associatedTo: [],
					stage: 'create'
				}
				this.createNoteModal = true
			},
			openAllActivitiesModal() {
				this.allActivitiesModal = true
				this.fullActivityModal = false
			},
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
				this.updateClientRatesProp({ key: "pricelistTable" })
			},
			updateRates(action) {
				this.updateClientRatesProp({ key: "pricelistTable" })
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
			setLeadSource({ option }) {
				this.storeClientPropertyOverallData({ prop: "leadSource", value: option })
			},
			changeBillingProp({ prop, value }) {
				this.storeClientPropertyOverallDataBilling({ prop, value })
			},
			contactDetails({ contactIndex }) {
				const name = this.$route.name.split('-').shift()
				this.$router.push({ name: `${ name }-contact`, params: { index: contactIndex } })
			},
			addNewContact(data) {
				const name = this.$route.name.split('-').shift()
				this.$router.push({ name: `${ name }-new-contact` })
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
				if (
						!this.currentClientOverallData.accountManager ||
						// !this.currentClientOverallData.salesManager ||
						!this.currentClientOverallData.projectManager) this.errors.push("All managers should be assigned.")

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
				this.currentClientOverallData.clientType !== 'Individual'
						? await this.updateClient()
						: await this.updateClientIndividual()
				this.refreshResultTable()
			},

			async checkSameClientEmails(clientEmail, clientId) {
				const clientMails = await this.$http.get('/clientsapi/all-clients-emails')
				const arrayOfMails = clientMails.body
						.filter(item => item._id.toString() !== clientId)
						.map(key => key.email)
				return arrayOfMails.includes(clientEmail)
			},

			async updateClient() {
				let clientForSave = { ...this.currentClient }
				let keys = [ ...this.generalKeys ]
				let billingKeys = [ ...this.billingKeys ]
				for (let key of keys) clientForSave[key] = this.currentClientOverallData[key]
				for (let key of billingKeys) clientForSave.billingInfo[key] = this.currentClientOverallData.billingInfo[key]

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

					this.$socket.emit('updatedClientData', { _id: this.$route.params.id, data: this.currentClientOverallData })

					this.alertToggle({
						message: "Client info has been updated", isShow: true, type: "success"
					})
				} catch (err) {
					this.alertToggle({ message: "Internal server error on updating Client info", isShow: true, type: "error" })
				}
			},

			async updateClientIndividual() {
				let clientForSave = { ...this.currentClient }
				let keys = [ ...this.generalKeys ]
				// let billingKeys
				for (let key of keys) clientForSave[key] = this.currentClientOverallData[key]
				// for (let key of billingKeys) clientForSave.billingInfo[key] = this.currentClientOverallData.billingInfo[key]

				clientForSave.nativeLanguage = null
				clientForSave.timeZone = null
				clientForSave.website = ""
				clientForSave.officialCompanyName = this.currentClientOverallData.name

				clientForSave.contacts = [ {
					leadContact: true,
					firstName: this.currentClientOverallData.name,
					surname: "",
					password: "12345",
					email: this.currentClientOverallData.email,
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

				clientForSave.billingInfo = {
					officialCompanyName: this.currentClientOverallData.name,
					vat: false,
					vatId: '',
					dueDate: '',
					address: '',
					invoiceSending: false,
					paymentType: "PPP"
				}

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

					this.$socket.emit('updatedClientData', { _id: this.$route.params.id, data: this.currentClientOverallData })

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
					await this.$router.push("/pangea-clients/all")
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
					const client = await this.$http.get(`/clientsapi/client-with-activities?id=${ this.$route.params.id }`)
					this.storeCurrentClient(client.data)
					this.storeCurrentClientOverallData(client.data)
					this.setNewClientDocuments(client.data)
				}
			},
			async getClientInfoWithoutOverallData() {
				if (!this.currentClient._id) {
					const client = await this.$http.get(`/clientsapi/client-with-activities?id=${ this.$route.params.id }`)
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
				storeClientPropertyOverallDataBilling: "storeClientPropertyOverallDataBilling",
				updateClientRatesProp: 'updateClientRatesProp'
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
			// mutateRatesFields() {
			// 	const { rates: { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } } = this.currentClient
			// 	this.currentClient.rates.basicPricesTable = basicPricesTable.map(i => ({ ...i, isCheck: false }))
			// 	this.currentClient.rates.stepMultipliersTable = stepMultipliersTable.map(i => ({ ...i, isCheck: false }))
			// 	this.currentClient.rates.industryMultipliersTable = industryMultipliersTable.map(i => ({ ...i, isCheck: false }))
			// 	this.currentClient.rates.pricelistTable = pricelistTable.map(i => ({ ...i, isCheck: false }))
			// }
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
			},
			isIndividual() {
				return this.currentClientOverallData.clientType === 'Individual'
			}

		},
		components: {
			Discounts,
			Tabs,
			AllActivitiesFullScrean,
			AllActivitiesModal,
			Sidebar,
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
			AddTask,
			AddNote,
			RadioButton
		},
		created() {
			this.getClientInfoLangs()
			this.getTimezones()
			this.getAliases()
			this.$socket.on('refreshClientData', ({ _id, data }) => {
				if (_id.toString() === this.$route.params.id.toString()) {
					this.storeCurrentClient({ ...this.currentClient, ...data })
					this.storeCurrentClientOverallData(data)
				}
			})
		},
		// mounted() {
		// 	this.mutateRatesFields()
		// },
		beforeDestroy() {
			this.storeCurrentClient({})
		},
		beforeRouteEnter(to, from, next) {
			next((vm) => {
				if (from.name && from.name.includes('contact')) {
					vm.getClientInfoWithoutOverallData()
				} else {
					vm.getClientInfo()
				}
				vm.fromRoute = from.path
			})
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";

  .discounts {
    margin-top: 20px;
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
      border-radius: 4px;
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

  .client-activity {
    &__addTask {
      position: fixed;
      top: 5%;
      left: 50%;
      transform: translate(-50%, 25%);
      z-index: 55;
    }

    &__addNote {
      position: fixed;
      top: 5%;
      left: 50%;
      transform: translate(-50%, 25%);
      z-index: 55;
    }

    &__all-activities {
      position: fixed;
      top: 15%;
      left: 50%;
      z-index: 50;
      transform: translate(-50%, 0%);
      width: 820px;
    }

  }

  .client-layout {
    display: flex;
    margin-bottom: 50px;
  }

  .client-subinfo {
    &__general {
      margin-top: 66px;
      width: 390px;
      height: 270px;
      box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
      margin-left: 40px;
      background: white;
      border-radius: 4px;

    }

    &__date {
      margin-top: 80px;
      margin-left: 40px;
      width: 390px;
      height: 270px;
      background: white;
      border-radius: 4px;
      box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
    }
  }

  .client-info {
    position: relative;

    &__main-row {
      width: 1000px;
    }

    &__layout {
      display: flex;
      margin: 50px;
    }

    &__notes {
      background: white;
      border-radius: 4px;
      box-sizing: border-box;
      box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
    }

    &__radio {
      display: flex;

      .radio {
        margin-right: 10px;
      }
    }

    &__gen-info,
    &__services,
    &__contacts-info,
    &__sales,
    &__documents,
    &__billing {
      padding: 20px;
      box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
      box-sizing: border-box;
      background: white;
      border-radius: 4px;
    }

    &__rates {
      background: white;
      border-radius: 4px;
      padding: 0;
      padding: 20px;
      box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
      position: relative;
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
  }

  .title {
    font-size: 21px;
    padding: 30px 0 10px;
  }

  .title-with-action {
    font-size: 21px;
    padding: 30px 0 10px;
    display: flex;
    justify-content: space-between;
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
    box-shadow: 0 0 10px #66563d;
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
    color: #66563d;
  }
</style>
