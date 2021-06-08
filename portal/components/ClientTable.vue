<template lang="pug">
  .contacts
    DataTable(
      :fields="fields"
      :tableData="currentContacts"
      :bodyClass="['review-body', {'tbody_visible-overflow': currentContacts.length < 6}]"
      :tableheadRowClass="currentContacts.length < 6 ? 'tbody_visible-overflow' : ''"
      :headCellClass="'padding-with-check-box'"
      :tableheadClass="'hideHead'"
    )
      //.contacts__header(slot="headerName" slot-scope="{ field }") {{ field.label }}
      //.contacts__header(slot="headerIcon" slot-scope="{ field }") {{ field.label }}

      div(slot="name" slot-scope="{ row, index }")
        .contacts__data(v-if="!!row.firstName") {{row.firstName}} {{row.surname || ''}}
        .contacts__dataDrop(v-else)
          SelectSingle(
            :isTableDropMenu="true"
            :options="availableContacts"
            @chooseOption="(e) => $emit('setContact', index, e)"
          )

      .contacts__dataIcon(slot="icon" slot-scope="{ row, index }")
        span(@click="removeContact(index)")
          i.fas.fa-trash

    Add(@add="$emit('addContact', {})")

</template>

<script>
	import DataTable from "./Tables/DataTable"
	import Add from "./buttons/Add"
	import SelectSingle from "./dropdowns/SelectSingle"
	import { mapActions } from "vuex"

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
					{ label: "Name", headerKey: "headerName", key: "name", width: "70%", padding: 0 },
					{ label: "", headerKey: "headerIcon", key: "icon", width: "30%" }
				]
			}
		},
		computed: {
			availableContacts() {
				return this.clientInfo.contacts
						.map(item => `${ item.firstName } ${ item.surname }`)
						.filter(name => !this.currentContacts.map(item => `${ item.firstName } ${ item.surname }`).includes(name))
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle"
			}),
			removeContact(index) {
				if (this.currentContacts.length === 1) {
					this.alertToggle({ message: 'One contact should remain', isShow: true, type: "error" })
					return
				}
				this.$emit('removeContact', index)
			}
		},
		mounted() {
			if (!this.currentContacts.length) {
				this.$emit('addContact', this.user)
			}
		},
		components: { SelectSingle, Add, DataTable }
	}
</script>

<style lang="scss" scoped>
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