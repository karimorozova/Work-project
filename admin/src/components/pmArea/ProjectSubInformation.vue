<template lang="pug">
  .sub-information
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
      .row__title Test:
      .row__data
        CheckBox(:isChecked="project.isTest", :isDisabled="isProjectFinished" @check="() => setTest(true)",  @uncheck="() => setTest(false)")

    .sub-information__row
      .row__title Urgent:
      .row__data
        CheckBox(:isChecked="project.isUrgent", :isDisabled="isProjectFinished" @check="() => setUrgentStatus(true)", @uncheck="() => setUrgentStatus(false)")

    .sub-information__row(v-if="project.requestId")
      .row__title Request:
      .row__data
        .link
          router-link(class="link-to" :to="{path: `/pangea-projects/requests/closed-requests/Closed/details/${project.requestId._id}`}")
            span {{ project.requestId.projectId }}

    .sub-information__row
      .row__title Payment Profile:
      .row__data {{ project.paymentProfile || 'Not assigned' }}

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
          .client-table__data(v-if="currentActive !== index") {{ row.firstName }} {{ row.surname || '' }}
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
          .client-table__icons(v-if="!isProjectFinished")
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
            img(src="../../assets/images/latest-version/lock.png")

    Add(@add="addData" v-if="!isProjectFinished")
</template>

<script>
import { mapActions } from "vuex"
import Add from "../Add"
import scrollDrop from "@/mixins/scrollDrop"
import crudIcons from "@/mixins/crudIcons"
import SelectSingle from "@/components/SelectSingle"
import WYSIWYG from "../vendors/WYSIWYG"
import GeneralTable from "../GeneralTable"
import CheckBox from "../CheckBox"

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
      setCurrentProject: "setCurrentProject"
    }),
    async setTest(bool) {
      await this.setProjectProp({ prop: 'isTest', value: bool })
    },
    async setProjectProp({ prop, value }) {
      try {
        const result = await this.$http.put("/pm-manage/project-prop", { projectId: this.project._id, prop, value })
        await this.setCurrentProject(result.body)
        this.alertToggle({ message: "Project updated", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Server Error / Cannot update Project", isShow: true, type: "error" })
      }
    },
    copyId() {
      let id = document.getElementById('id')
      let elementText = id.textContent
      navigator.clipboard.writeText(elementText)
      try {
        document.execCommand('copy')
        this.alertToggle({ message: "Text copied successfully", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Text not copied", isShow: true, type: "error" })
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
        const result = await this.$http.post("/pm-manage/contact-email", {
          projectId: this.project._id,
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
            this.manageDeleteClick(index)
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
        const result = await this.$http.delete(
            `/pm-manage/client-contact/${ this.project._id }/${ this.projectClientContacts[this.deleteIndex]._id }`
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
        const result = await this.$http.post("/pm-manage/client-contact", {
          projectId: this.project._id,
          contact: this.currentClientContact,
          oldContact: this.oldClientContact
        })
        this.setCurrentProject(result.data)
        this.projectClientContacts = result.data.clientContacts
        this.alertToggle({
          message: "Saved project client contact",
          isShow: true,
          type: "success"
        })
      } catch (err) {
        this.alertToggle({
          message: "Error on Saving project client contact",
          isShow: true,
          type: "error"
        })
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
    async setUrgentStatus(bool) {
      try {
        const result = await this.$http.post("/pm-manage/urgent", { projectId: this.project._id, isUrgent: bool })
        this.setCurrentProject(result.data)
        this.alertToggle({ message: "Urgent status updated", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Cannot update Urgent status", isShow: true, type: "error" })
      }
    },
    getClientContacts() {
      this.projectClientContacts = this.project.clientContacts
    }
  },
  computed: {
    clientData() {
      if (this.project) {
        return this.project.customer.contacts.map((i) => `${ i.firstName } ${ i.surname || '' }`)
      }
    },
    isProjectFinished() {
      const { status } = this.project
      return status === 'Closed' || status === 'Cancelled Halfway' || status === 'Cancelled'
    }
  },
  created() {
    this.project && this.getClientContacts()
  },
  components: {
    CheckBox,
    GeneralTable,
    Add,
    SelectSingle,
    WYSIWYG
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";
@import "../../assets/styles/settingsTable";


.iconId {
  font-size: 15px;
  border-radius: 4px;
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
  border-radius: 4px;
  background: white;

  &__row {
    width: 100%;
    display: flex;
    height: 20px;
    align-items: center;
    margin-bottom: 20px;
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
      font-size: 18px;
      font-family: 'Myriad600';
    }

    &-icons {
      display: flex;
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

//.checkbox {
//  display: flex;
//  height: 30px;
//
//  input[type="checkbox"] {
//    opacity: 0;
//
//    + {
//      label {
//        &::after {
//          content: none;
//        }
//      }
//    }
//
//    &:checked {
//      + {
//        label {
//          &::after {
//            content: "";
//          }
//        }
//      }
//    }
//  }
//
//  label {
//    position: relative;
//    display: inline-block;
//    padding-left: 22px;
//    padding-top: 4px;
//
//    &::before {
//      position: absolute;
//      content: "";
//      display: inline-block;
//      height: 16px;
//      width: 16px;
//      border: 1px solid $border;
//      left: 0px;
//      top: 3px;
//    }
//
//    &::after {
//      position: absolute;
//      content: "";
//      display: inline-block;
//      height: 5px;
//      width: 9px;
//      border-left: 2px solid;
//      border-bottom: 2px solid;
//      transform: rotate(-45deg);
//      left: 4px;
//      top: 7px;
//    }
//  }
//}

.icon {
  display: flex;
  justify-content: center;
  color: $text;
  margin-left: 12px;
  font-size: 16px;
  transition: .2s ease;
  align-items: flex-end;
  cursor: pointer;
}

.link {
  a {
    color: $text;
    text-decoration: none;
    transition: .2s ease-out;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
