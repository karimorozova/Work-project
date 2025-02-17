<template lang="pug">
  .sub-information(v-if="user._id" )
    .sub-information__preview(v-if="isEditAndSend")
      WYSIWYG(@closePreview="closeWYSIWYG", :message="message", @send="sendMessage")

    .sub-information__project
      .sub-information__project-title(id="id") {{ project.projectId }}
      .sub-information__project-icons
        .iconId(class="click-copy" @click="copyId")
          i.far.fa-copy

    .sub-information__row
      .row__title Project Status:
      .row__data {{ project.status }}

    .sub-information__row
      .row__title Urgent:
      .row__data
        .checkbox
          input#urgent(type="checkbox", :checked="project.isUrgent", @change="setUrgentStatus")
          label(for="urgent")

    .client-table
      GeneralTable(
        :fields="fields",
        :tableData="projectClientContacts",
        :errors="errors",
        :areErrors="areErrors",
        :isApproveModal="isDeleting",
        @closeErrors="closeErrors",
        @approve="deleteData",
        @notApprove="setDefaults",
        @closeModal="setDefaults"
      )
        template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
          .client-table__header {{ field.label }}

        template(slot="client", slot-scope="{ row, index }")
          .client-table__data(v-if="currentActive !== index")
            span(v-if="row.firstName") {{ row.firstName }} {{ row.surname || '' }}
          .client-table__drop(v-else)
            SelectSingle(
              placeholder="Select",
              :isTableDropMenu="isTableDropMenu",
              :hasSearch="true",
              :selectedOption="Object.keys(currentClientContact).length ? `${currentClientContact.firstName} ${currentClientContact.surname || ''}` : '' ",
              :options="clientData",
              @chooseOption="setClientContact"
            )

        template(slot="icons", slot-scope="{ row, index }")
          .client-table__icons
            span(v-if="canUpdateRequest")
              i.client-table__icon.fa.fa-envelope(
                @click="openWYSIWYG(index)",
                :class="{ 'client-table_opacity': true }",
                aria-hidden="true"
              )
              img.client-table__icon(
                v-for="(icon, key) in icons",
                :src="icon.icon",
                @click="makeAction(index, key)",
                :class="{ 'client-table_opacity': isActive(key, index) }"
              )
            .client-table__icons(v-else)
              img(src="../../../../assets/images/latest-version/lock.png")

    Add(@add="addData" v-if="canUpdateRequest")
</template>

<script>
import { mapActions, mapGetters } from "vuex"
import Add from "../../../Add"
import scrollDrop from "@/mixins/scrollDrop"
import crudIcons from "@/mixins/crudIcons"
import SettingsTable from "../../../Table/SettingsTable"
import SelectSingle from "@/components/SelectSingle"
import WYSIWYG from "../../../vendors/WYSIWYG"
import GeneralTable from "../../../GeneralTable"

export default {
  mixins: [ scrollDrop, crudIcons ],
  props: {
    project: { type: Object }
  },
  data() {
    return {
      fields: [
        {
          label: "Client Contact",
          headerKey: "headerClient",
          key: "client",
          style: { width: "60%" }
        },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          style: { width: "40%" }
        }
      ],

      projectClientContacts: [],
      currentClientContact: "",
      oldClientContact: "",
      message: "",

      isTableDropMenu: true,
      areErrors: false,
      errors: [],
      isDeleting: false,
      currentActive: -1,
      isEditAndSend: false
    }
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
      setCurrentProject: "setCurrentProject",
      updateClientsRequestsProps: "updateClientsRequestsProps"
    }),
    refreshProject() {
      this.$emit("refreshProject")
    },
    copyId() {
      let id = document.getElementById('id')
      let elementText = id.textContent
      navigator.clipboard.writeText(elementText)
      try {
        document.execCommand('copy')
        this.alertToggle({
          message: "Text copied successfully",
          isShow: true,
          type: "success"
        })
      } catch (err) {
        this.alertToggle({
          message: "Text not copied",
          isShow: true,
          type: "error"
        })
      }
    },
    openWYSIWYG(index) {
      this.isEditAndSend = true
      this.setEditingData(index)
    },
    closeWYSIWYG() {
      this.isEditAndSend = false
      this.setDefaults()
    },
    async sendMessage(message) {
      try {
        const result = await this.$http.post("/clients-requests/contact-email", {
          id: this.project._id,
          contactId: this.currentClientContact._id,
          template: message
        })
        this.alertToggle({
          message: "Message sent successfully",
          isShow: true,
          type: "success"
        })
      } catch (err) {
        this.alertToggle({
          message: "Error! Message not sent",
          isShow: true,
          type: "error"
        })
      } finally {
        this.closeWYSIWYG()
        this.setDefaults()
      }
    },
    async makeAction(index, key) {
      if (this.currentActive !== -1 && this.currentActive !== index) {
        return this.isEditing()
      }
      switch (key) {
        case "edit":
          this.setEditingData(index)
          break
        case "cancel":
          this.manageCancelEdition(index)
          break
        case "delete":
          if (this.projectClientContacts.length <= 1) {
            this.errors = []
            this.errors.push('Can\'t be deleted')
            if (this.errors.length) {
              this.areErrors = true
              return
            }
          } else {
            await this.manageDeleteClick(index)
          }
          break
        default:
          await this.checkErrors(index)
      }
    },
    closeErrors() {
      this.areErrors = false
    },
    setDefaults() {
      this.currentActive = -1
      this.isDeleting = false
      this.currentClientContact = ""
      this.oldClientContact = ""
    },
    async manageDeleteClick(index) {
      if (!this.projectClientContacts[index]._id) {
        this.projectClientContacts.splice(index, 1)
        this.setDefaults()
      } else {
        this.deleteIndex = index
        this.isDeleting = true
      }
    },
    async deleteData() {
      try {
        const result = await this.$http.post(
            `/clients-requests/${ this.project._id }/delete-contact`,
            { contactId: this.projectClientContacts[this.deleteIndex]._id }
        )
        this.setCurrentProject(result.data)
        this.projectClientContacts = result.data.clientContacts
        this.alertToggle({
          message: "Project client contact removed",
          isShow: true,
          type: "success"
        })
      } catch (err) {
        this.alertToggle({
          message: "Error on Deleting project client contact",
          isShow: true,
          type: "error"
        })
      } finally {
        this.setDefaults()
      }
    },
    async checkErrors(index) {
      if (this.currentActive === -1) return
      this.errors = []
      if (this.projectClientContacts.find((item) => `${ item.firstName } ${ item.surname || '' }` === `${ this.currentClientContact.firstName } ${ this.currentClientContact.surname || '' }`)) {
        this.errors.push("Such contact exists")
      }
      if (!this.currentClientContact.hasOwnProperty("firstName")) {
        this.errors.push("Сhoose сlient сontact")
      }
      if (this.errors.length) {
        this.areErrors = true
        return
      }
      await this.manageSaveClick(index)
    },
    async manageSaveClick(index) {
      try {
        const result = await this.$http.post(
            `/clients-requests/${ this.project._id }/update-client-contact`,
            { contact: this.currentClientContact, oldContact: this.oldClientContact }
        )

        this.setCurrentProject(result.data)
        this.projectClientContacts = result.data.clientContacts
        this.alertToggle({ message: "Saved project client contact", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Error on Saving project client contact", isShow: true, type: "error" })
      } finally {
        this.setDefaults()
      }
    },
    manageCancelEdition(index) {
      if (!this.projectClientContacts[index]._id) {
        this.projectClientContacts.splice(index, 1)
        this.setDefaults()
      } else {
        this.setDefaults()
      }
    },
    addData() {
      if (this.currentActive !== -1) {
        return this.isEditing()
      }
      this.projectClientContacts.push({})
      this.setEditingData(this.projectClientContacts.length - 1)
    },
    setEditingData(index) {
      this.currentActive = index
      this.currentClientContact = this.projectClientContacts[index]
      this.oldClientContact = this.currentClientContact
    },
    setClientContact({ option }) {
      this.currentClientContact = this.project.customer.contacts.find((item) => `${ item.firstName } ${ item.surname || '' }` === option)
    },
    async setUrgentStatus(event) {
      if (!this.canUpdateRequest) return
      try {
        await this.updateClientsRequestsProps({ projectId: this.project._id, value: { isUrgent: event.target.checked } })
        this.alertToggle({
          message: "Urgent status updated",
          isShow: true,
          type: "success"
        })
      } catch (err) {
        this.alertToggle({
          message: "Cannot update Urgent status",
          isShow: true,
          type: "error"
        })
      }
    },
    getClientContacts() {
      this.projectClientContacts = this.project.clientContacts
    }
  },
  computed: {
    ...mapGetters({
      user: "getUser"
    }),
    clientData() {
      if (this.project) {
        return this.project.customer.contacts.map((i) => `${ i.firstName } ${ i.surname || '' }`)
      }
    },
    canUpdateRequest() {
      return this.user.group.name === "Administrators"
          || this.user.group.name === "Developers"
          || this.project.projectManager._id === this.user._id
          || this.project.accountManager._id === this.user._id
    }

  },
  created() {
    this.project && this.getClientContacts()
  },
  components: {
    GeneralTable,
    Add,
    SettingsTable,
    SelectSingle,
    WYSIWYG
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";
@import "../../../../assets/styles/settingsTable";

.client-table {
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
    width: 100%;
    margin: 0 7px;
  }

  &__icons {
    display: flex;
    align-items: center;
    padding-left: 7px;
  }

  &__icon {
    @extend %table-icon;
  }

  &_opacity {
    opacity: 1;
  }
}

.sub-information {
  box-sizing: border-box;
  padding: 25px;
  box-shadow: $box-shadow;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 420px;
  width: 420px;
  background: white;
  border-radius: 2px;

  &__row {
    width: 100%;
    display: flex;
    height: 40px;
  }

  .row {
    &__title {
      width: 150px;
    }

    &__data {
      width: 220px;
      position: relative;
    }
  }

  &__project {
    margin-bottom: 20px;
    border-bottom: 1px solid $light-border;
    width: 100%;
    padding-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &-title {
      font-size: 16px;
      font-family: 'Myriad600';
    }

    &-icons {
      display: flex;
    }
  }

  .client-table {
    @extend %setting-table;
    padding: 0;
    box-shadow: none;
    width: 100%;

    &__data {
      @extend %table-data;
      overflow-x: hidden;
    }

    &__editing-data {
      @extend %table-data;
      box-shadow: inset 0 0 7px $brown-shadow;
    }

    &__data-input {
      @extend %table-text-input;
    }

    &__height {
      height: 30px;
    }

    &__icons {
      @extend %table-icons;
      justify-content: center;
      display: flex;
    }

    &__icon {
      @extend %table-icon;
    }

    &__drop-menu {
      position: relative;
      box-shadow: inset 0 0 7px $brown-shadow;
    }

    &_opacity {
      opacity: 1;
    }

    &__form {
      width: 70%;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
}

.fa-info-circle,
.fa-envelope {
  font-size: 19px;
}

.drop {
  margin-top: -5px;
}

#urgent {
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
      border: 1px solid #c1bbb1;
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

.iconId {
  font-size: 15px;
  border-radius: 2px;
  height: 30px;
  width: 30px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: .2s ease-out;
  justify-content: center;
  border: 1px solid $border;
  color: $dark-border;
  margin-left: 10px;

  &:hover {
    color: $text;
  }
}
</style>
