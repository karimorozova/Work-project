<template lang="pug">
  .table
    GeneralTable(
      :fields="fields"
      :tableData="currentContacts"
      :bodyClass="['review-body', {'tbody_visible-overflow': currentContacts.length < 6}]"
      :tableheadRowClass="currentContacts.length < 6 ? 'tbody_visible-overflow' : ''"
      :headCellClass="'padding-with-check-box'"
      :tableheadClass="'hideHead'"
    )
      .table__header(slot="headerName" slot-scope="{ field }") {{ field.label }}
      .table__header(slot="headerIcon" slot-scope="{ field }") {{ field.label }}

      .col(slot="name" slot-scope="{ row, index }")
        .table__data(v-if="!!row.firstName") {{row.firstName}} {{row.surname || ''}}
        .table__dataDrop(v-else)
          SelectSingle(
            :hasSearch="true"
            :isTableDropMenu="true"
            :options="availableContacts"
            @chooseOption="(e) => $emit('setContact', index, e)"
          )

      .table__dataIcon(slot="icon" slot-scope="{ row, index }")
        span(@click="removeContact(index)")
          i.fas.fa-trash

    Add(@add="$emit('addContact', {})")

</template>

<script>
	import Add from "./pangea/Add"
	import SelectSingle from "./pangea/SelectSingle"
	import { mapActions } from "vuex"
	import GeneralTable from "./pangea/GeneralTable"

	export default {
		props: {
			clientInfo: {
				type: Object
			},
			currentContacts: {
				type: Array
			},
			user: {
				type: Object
			}
		},
		data() {
			return {
				fields: [
					{
						label: "Project contacts",
						headerKey: "headerName",
						key: "name",
						style: { width: "70%" }
					},
					{
						label: "",
						headerKey: "headerIcon",
						key: "icon",
						style: { width: "30%" }
					}
				]
			}
		},
		computed: {
			availableContacts() {
				return this.clientInfo.contacts
						.map(item => `${ item.firstName } ${ item.surname || '' }`)
						.filter(
								name =>
										!this.currentContacts
												.map(item => `${ item.firstName } ${ item.surname || '' }`)
												.includes(name)
						)
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle"
			}),
			removeContact(index) {
				if (this.currentContacts.length === 1) {
					this.alertToggle({
						message: "One contact should remain",
						isShow: true,
						type: "error"
					})
					return
				}
				this.$emit("removeContact", index)
			}
		},
		mounted() {
			if (!this.currentContacts.length) {
				this.$emit("addContact", this.user)
			}
		},
		components: { GeneralTable, SelectSingle, Add }
	}
</script>

<style lang="scss" scoped>
  .col {
    width: 100%;
  }

  .table {
    width: 100%;

    &__header {
      padding: 0 0 0 7px;
    }

    &__data {
      padding: 0 7px;
      width: 100%;
      display: flex;
      justify-content: space-between;
    }

    &__dataDrop {
      position: relative;
      height: 32px;
      margin: 0 7px;
    }

    &__dataIcon {
      width: 100%;
      display: flex;
      justify-content: center;
    }

    .fa-trash {
      cursor: pointer;
    }
  }

  .contacts {
    &__data {
      display: flex;
      align-items: center;
      padding-left: 5px;
      min-height: 30px;
    }

    &__dataIcon {
      text-align: center;
      cursor: pointer;
      margin-top: 2px;
    }

    &__dataDrop {
      position: relative;
    }
  }
</style>
