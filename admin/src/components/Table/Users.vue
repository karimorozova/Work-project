<template lang="pug">
  .users
    .table
      GeneralTable(
        :fields="fields"
        :tableData="users"
        :errors="errors"
        :areErrors="areErrors"
        :isApproveModal="isDeleting"
        @closeErrors="closeErrors"
        @approve="deleteUser"
        @notApprove="setDefaults"
        @closeModal="setDefaults"
      )
        template(slot="headerFirstName" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerLastName" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerEmail" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerPosition" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerGroup" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerIsActive" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerIcons" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="firstName" slot-scope="{ row, index }")
          .table__data(v-if="currentActive !== index") {{ row.firstName }}
          .table__data(v-else)
            input.table__data-input(type="text" v-model="currentFirstName")
        template(slot="lastName" slot-scope="{ row, index }")
          .table__data(v-if="currentActive !== index") {{ row.lastName }}
          .table__data(v-else)
            input.table__data-input(type="text" v-model="currentLastName")
        template(slot="email" slot-scope="{ row, index }")
          .table__data(v-if="currentActive !== index") {{ row.email }}
          .table__data(v-else)
            input.table__data-input(type="text" v-model="currentEmail")
        template(slot="position" slot-scope="{ row, index }")
          .table__data(v-if="currentActive !== index") {{ row.position }}
          .table__data(v-else)
            input.table__data-input(type="text" v-model="currentPosition")
        template(slot="isActive" slot-scope="{ row, index }")
          .table__icons( :class="{'filter__opacity': currentActive !== index}")
            img.table__checkbox(v-if="row.isActive" src="../../assets/images/latest-version/checkbox-brown-1.png" @click="toggleActive(index)" :class="{'table__opacity': currentActive === index}")
            img.table__checkbox(v-else src="../../assets/images/latest-version/checkbox-brown-0.png" @click="toggleActive(index)" :class="{'table__opacity': currentActive === index}")
        template(slot="group" slot-scope="{ row, index }")
          .table__data(v-if="currentActive !== index") {{ row.group.name }}
          .table__drop(v-else)
            SelectSingle(
              :isTableDropMenu="isTableDropMenu"
              placeholder="Select"
              :selectedOption="currentGroup.name"
              :options="groupsNames"
              @chooseOption="setGroup"
              @scrollDrop="scrollDrop"
            )
        template(slot="icons" slot-scope="{ row, index }")
          .table__icons
            img.table__icon(v-for="(icon, key) in manageIcons" :src="icon.icon" @click="makeAction(index, key)" :class="{'table__opacity': isActive(key, index)}")
    Add(@add="addUser")
</template>

<script>
	import GeneralTable from "../GeneralTable"
	import SelectSingle from "../SelectSingle"
	import Add from "../Add"
	import scrollDrop from "@/mixins/scrollDrop"
	import { mapGetters, mapActions } from "vuex"
	import crudIcons from "@/mixins/crudIcons"

	export default {
		mixins: [ scrollDrop, crudIcons ],
		data() {
			return {
				fields: [
					{ label: "First Name", headerKey: "headerFirstName", key: "firstName", style: { width: "12%" }, padding: "0" },
					{ label: "Last Name", headerKey: "headerLastName", key: "lastName", style: { width: "12%" }, padding: "0" },
					{ label: "Email", headerKey: "headerEmail", key: "email", style: { width: "20%" }, padding: "0" },
					{ label: "Position", headerKey: "headerPosition", key: "position", style: { width: "18%" }, padding: "0" },
					{ label: "Group", headerKey: "headerGroup", key: "group", style: { width: "16%" }, padding: "0" },
					{ label: "Active", headerKey: "headerIsActive", key: "isActive", style: { width: "6%" }, padding: "0" },
					{ label: "", headerKey: "headerIcons", key: "icons", style: { width: "16%" }, padding: "0" }
				],
				users: [],
				isTableDropMenu: true,
				groups: [],
				currentActive: -1,
				currentFirstName: "",
				currentLastName: "",
				currentEmail: "",
				currentPosition: "",
				currentGroup: null,
				areErrors: false,
				errors: [],
				isDeleting: false,
				deleteIndex: -1
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle",
				saveUser: "saveUser",
				removeUser: "removeUser"
			}),
			isScrollDrop(drop, elem) {
				return drop && this.users.length >= 20
			},
			async makeAction(index, key) {
				if (this.currentActive !== -1 && this.currentActive !== index) {
					return this.isEditing()
				}
				if (key === "save") {
					await this.checkErrors(index)
				}
				if (key === "edit") {
					this.setEditingData(index)
				}
				if (key === "cancel") {
					this.cancelEdition(index)
				}
				if (key === "delete") {
					this.deleteIndex = index
					this.showApprove(index)
				}
			},
			async checkErrors(index) {
				if (this.currentActive === -1) return
				this.errors = []
				if (!this.currentFirstName) this.errors.push("Please, enter user's first name")
				if (!this.currentLastName) this.errors.push("Please, enter user's last name")
				if (!this.currentEmail || !this.isEmailValid() || this.isEmailUnique(index)) this.errors.push("Enter a valid and unique email")
				if (!this.currentPosition) this.errors.push("Please, enter user's position")
				if (!this.currentGroup || !this.currentGroup.name) this.errors.push("Please, select user's group")
				if (this.errors.length) {
					return this.areErrors = true
				}
				await this.saveUserInfo(index)
			},
			async saveUserInfo(index) {
				const _id = this.users[index]._id ? this.users[index]._id : ""
				const user = {
					_id,
					firstName: this.currentFirstName,
					lastName: this.currentLastName,
					email: this.currentEmail,
					position: this.currentPosition,
					group: this.currentGroup,
					isActive: this.users[index].isActive,
				}
				try {
					const result = await this.saveUser({ user })
					await this.getUsers()
					this.alertToggle({ message: "User info saved", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" })
				}
				this.setDefaults()
			},
			isEmailValid() {
				const regex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
				return regex.test(this.currentEmail)
			},
			isEmailUnique(index) {
				return this.users.filter((item, i) => {
					return i !== index && item.email.toLowerCase() === this.currentEmail.toLowerCase().trim()
				}).length
			},
			setEditingData(index) {
				this.currentActive = index
				this.currentFirstName = this.users[index].firstName
				this.currentLastName = this.users[index].lastName
				this.currentEmail = this.users[index].email
				this.currentPosition = this.users[index].position
				this.currentGroup = this.users[index].group
			},
			setGroup({ option }) {
				this.currentGroup = this.groups.find(item => item.name === option)
			},
			addUser() {
				if (this.currentActive !== -1) {
					return this.isEditing()
				}
				this.users.push({
					firstName: "",
					lastName: "",
					email: "",
					position: "",
					group: { name: "" },
          isActive: false
				})
				this.setEditingData(this.users.length - 1)
			},
			showApprove(index) {
				const id = this.users[index]._id
				if (!id) {
					this.setDefaults()
					return this.users.splice(index, 1)
				}
				this.isDeleting = true
			},
			async deleteUser() {
				const id = this.users[this.deleteIndex]._id
				try {
					await this.removeUser(id)
					this.checkToken()
					await this.getUsers()
					this.alertToggle({ message: "User removed", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" })
				}
				this.setDefaults()
			},
			checkToken() {
				if (!localStorage.getItem("token")) {
					this.$router.push("/login")
				}
			},
			cancelEdition(index) {
				if (!this.users[index]._id) {
					this.users.splice(index, 1)
				}
				this.setDefaults()
			},
			setDefaults() {
				this.currentActive = -1
				this.currentFirstName = ""
				this.currentLastName = ""
				this.currentEmail = ""
				this.currentPosition = ""
				this.currentGroup = null
				this.isDeleting = false
        this.getUsers()
			},
			closeErrors() {
				this.areErrors = false
			},
			async getUsers() {
				try {
					const result = await this.$http.get("/users-full")
					this.users = result.body
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" })
				}
			},
			async getGroups() {
				try {
					const result = await this.$http.get("/api/groups")
					this.groups = result.body
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" })
				}
			},
      toggleActive(index) {
        if (this.currentActive !== index) return
        this.users[index].isActive = !this.users[index].isActive
      },
		},
		computed: {
			groupsNames() {
				return this.groups.map(item => item.name)
			},
			manageIcons() {
				const { "delete": del, ...result } = this.icons
				return result
			}
		},
		components: {
      GeneralTable,
			SelectSingle,
			Add
		},
		mounted() {
			this.getUsers()
			this.getGroups()
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";
  @import "../../assets/styles/settingsTable";

  .users {
    background-color: $white;
    padding: 25px;
    box-shadow: $box-shadow;
    position: relative;

    width: 1040px;
    box-sizing: border-box;
    border-radius: 4px;
    margin: 50px;

  }



  .table {
    width: 100%;

    &__data {
      padding: 0 7px;
    }

    &__header {
      padding: 0 7px;
    }

    &__drop {
      position: relative;
      height: 32px;
      max-width: 220px;
      margin: 0 7px;
      width: 100%;
      background: white;
      border-radius: 4px;
    }

    &__icons {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      gap: 8px;
    }

    &__icon {
      cursor: pointer;
      opacity: 0.5;
    }

    &__opacity {
      opacity: 1;
    }

    &__input {
      width: 100%;
      padding: 0 7px;
    }
  }

  input {
    font-size: 14px;
    color: $text;
    border: 1px solid $border;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 0 7px;
    outline: none;
    width: 100%;
    height: 32px;
    transition: .1s ease-out;

    &:focus {
      border: 1px solid $border-focus;
    }
  }

  .filter {
    &__opacity {
      filter: opacity(0.5);
    }
  }


</style>
