<template lang="pug">
  .active-clients
    .active-clients__table
      .clients-filters
        .clients-filters__row
          .clients-filters__item
            label Name:
            input.clients-filters__input-field(type="text" placeholder="Company Name" v-model="nameFilter" @keyup="filterByName")
          //.clients-filters__item
            //label Industry:
            //.clients-filters__drop-menu
              //ClientIndustrySelect(:isAllExist="isAllIndustyFilter" :selectedInd="[industryFilter]" @chosenInd="chosenInd")
          //.clients-filters__item
            //label Lead Source:
            //.clients-filters__drop-menu
              //ClientLeadsourceSelect(:isAllExist="isAllLeadExist" :selectedLeadsource="leadSourceFilter" @chosenLeadsource="chosenLeadsource")
          //.clients-filters__item
          //.clients-filters__itemButton
            //input.add-button(type="submit" value="Add client" @click="addClient")

      ClientsTable(
        :clients="allClients"
        :nameFilter="nameFilter"
        :statusFilter="statusFilter"
        :leadSourceFilter="leadSourceFilter"
        :filterIndustry="industryFilter"
        @showClientDetails="showClientDetails"
        @update="update"
        @bottomScrolled="bottomScrolled"
      )
</template>

<script>
	import ClientsTable from "../ClientsTable"
	import { mapGetters, mapActions } from "vuex"

	export default {
		data() {
			return {
				nameFilter: "",
				industryFilter: { name: 'All' },
				leadSourceFilter: "All",
				isAllIndustyFilter: true,
				isAllStatusExist: true,
				isAllLeadExist: true,
				isDataRemain: true,
				lastId: "",
				typingTimer: "",
				doneTypingInterval: 800,
				statusFilter: 'Active'
			}
		},
		methods: {
			scrollBodyToTop() {
				let tbody = document.querySelector(".clients__table")
				tbody.scrollTop = 0
			},
			async bottomScrolled() {
				if (this.isDataRemain) {
					const result = await this.$http.post('/all-clients', { filters: this.filters })
					this.setAllCustomers([ ...this.allClients, ...result.body ])
					this.isDataRemain = result.data.length === 25
					this.lastId = result.data && result.body.length ? result.body[result.body.length - 1]._id : ""
				}
			},
			async update({ status }) {
				if (this.statusFilter !== status) {
					await this.getCustomers()
				}
			},
			async getCustomers() {
				this.lastId = ""
				this.isDataRemain = true
				try {
					let result = await this.$http.post('/all-clients', { filters: this.filters })
					this.setAllCustomers(result.body)
					this.lastId = result.body && result.body.length ? result.body[result.body.length - 1]._id : ""
					this.scrollBodyToTop()
				} catch (err) {
					this.alertToggle({ message: "Error on getting customers", isShow: true, type: "error" })
				}
			},
			closeSevLangs(data) {
				this.addSeveral = false
			},
			clientCancel() {
				this.$emit('clientCancel')
			},
			showClientDetails({ id }) {
				this.$router.push(`/pangea-clients/active/details/${ id }`)
			},
			addClient() {
				this.$router.push('/pangea-clients/new-client')
			},
			filterByName(e) {
				const { value } = e.target
				clearTimeout(this.typingTimer)
				this.typingTimer = setTimeout(doneTyping, this.doneTypingInterval)
				const vm = this

				async function doneTyping() {
					await vm.getCustomers()
				}
			},
			async chosenLeadsource({ leadSource }) {
				this.leadSourceFilter = leadSource
				await this.getCustomers()
			},
			async chosenStatus({ status }) {
				this.statusFilter = status
				await this.getCustomers()
			},
			async chosenInd({ industry }) {
				this.industryFilter = industry
				await this.getCustomers()
			},
			...mapActions([
				"alertToggle",
				"setAllCustomers",
				"storeCurrentClient"
			])
		},
		computed: {
			...mapGetters({
				allClients: "getClients"
			}),
			filters() {
				return {
					nameFilter: this.nameFilter,
					industryFilter: this.industryFilter,
					leadSourceFilter: this.leadSourceFilter,
					statusFilter: this.statusFilter,
					lastId: this.lastId
				}
			}
		},
		components: {
			ClientsTable,
		},
		created() {
			this.getCustomers()
		},
		mounted() {
			this.storeCurrentClient({})
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors";

  .active-clients {
    position: relative;
    width: 1200px;
    margin: 50px;
    background: white;

    &__table {
      border-radius: 4px;
      padding: 20px;
      box-sizing: border-box;
      box-shadow: $box-shadow;
    }
  }

  .title {
    font-size: 28px;
  }

  label {
    margin-bottom: 3px;
  }

  .clients-filters {
    margin-bottom: 20px;

    &__row-button {
      display: flex;
      margin-bottom: 20px;
    }

    &__row {
      display: flex;
      margin-bottom: 20px;
      height: 50px;
      align-items: flex-end;
    }

    &__drop-menu {
      width: 220px;
      height: 32px;
      position: relative;
    }

    &__input-field {
      font-size: 14px;
      color: $text;
      border: 1px solid $border;
      border-radius: 4px;
      box-sizing: border-box;
      padding: 0 7px;
      outline: none;
      width: 220px;
      height: 32px;
      transition: .1s ease-out;

      &:focus {
        border: 1px solid $border-focus;
      }
    }

    &__itemButton {
      display: grid;
      width: 232px;
      align-items: flex-end;
      justify-content: end;
    }

    &__item {
      display: grid;
      width: 232px;
      align-items: flex-end;

      ::-webkit-input-placeholder {
        opacity: 0.5;
      }
    }

    &_high-index {
      z-index: 10;
    }

    &_flex-end {
      justify-content: flex-end;
    }
  }

  .add-button {
    width: 140px;
    padding: 0 24px 0 24px;
    height: 32px;
    color: #fff;
    font-size: 14px;
    border-radius: 4px;
    background-color: #d15f45;
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
  }

  .add-button:active, .add-button:focus {
    transform: scale(.98);
    outline: none !important;
    outline-color: none;
    border: none;
  }

</style>
