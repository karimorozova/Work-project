<template lang="pug">
  .wrapper
    .service-group
      ModalGroups.modal(v-if="addingModal" @groupSend="createClientServiceGroup" @closeModal="closeAddingGroup")
      ModalGroups.modal(
        v-else-if="currentService.hasOwnProperty('groupName')"

        buttonText="Edit Template"
        :editGroupName="currentService.groupName"
        :editSelectedService="currentService.service"
        :editSelectedIndustry="currentService.industry"
        :editSelectedSourceLang="currentService.source"
        :editSelectedTargetLang="currentService.target"

        @groupSend="editClientServiceGroup"
        @closeModal="closeEditingGroup"
      )
      ApproveModal.modal(
        v-if="deleteId"
        text="Are you sure?"
        approveValue="Yes"
        notApproveValue="No"
        @approve="deleteGroup"
        @close="closeDeleteModal"
        @notApprove="closeDeleteModal"
      )
      ValidationErrors(
        v-if="errors.length"
        :errors="errors"
        :isAbsolute="true"
        @closeErrors="closeErrors"
      )
      .group__cards
        .group__card(v-for="{groupName, industry, service, source, target, _id} in clientServicesGroups")
          .buttons
            IconButton(:isDisable="addingModal || currentService.hasOwnProperty('groupName') || !!deleteId" @clicked="editGroup(_id)")
              i(class="fas fa-pen" )
            IconButton(:isDisable="addingModal || currentService.hasOwnProperty('groupName') || !!deleteId" @clicked="showApproveModal(_id)")
              i(class="fas fa-trash" )
          .card__header
            .title {{groupName}}
          .card__industry  {{industry.name}}
          .card__service  {{service.title}}
          .card__lang-pair {{source ? source.symbol : ''}}
            span(v-if="source" style="font-size: 12px;color: #9c9c9c;margin: 0 2px;")
              i(class="fas fa-angle-double-right")
            .tooltip Targets &nbsp;
              .tooltipData(v-html="target.map(({lang}) => lang).join('<br>')")
              span
                i.fas.fa-info-circle

    Add(@add="showAddingModal")

</template>

<script>
import Add from "../../Add"
import ModalGroups from "./ModalGroups"
import ApproveModal from "../../ApproveModal"
import IconButton from "../../IconButton"
import ValidationErrors from "../../ValidationErrors"

export default {
  name: "ServiceGroups",
  components: {
    Add,
    ModalGroups,
    ApproveModal,
    IconButton,
    ValidationErrors,
  },
  props: {
    services: {
      type: Array
    },
    industries: {
      type: Array
    },
  },
  data() {
    return {
      addingModal: false,
      editedId: null,
      deleteId: null,
      clientServicesGroups: [],
      currentService: {},
      errors: [],
    }
  },
  methods: {
    closeErrors() {
      this.errors = []
    },
    showAddingModal() {
      this.addingModal = true
    },
    closeAddingGroup() {
      this.addingModal = false
    },
    closeDeleteModal() {
      this.deleteId = null
    },
    async getClientServicesGroups() {
      const servicesGroups = (await this.$http.get(`/clientsapi/client-group/${ this.$route.params.id }`)).data
      this.clientServicesGroups = servicesGroups
    },
    editGroup(id) {
      this.editedId = id
      this.currentService = this.clientServicesGroups.find(({ _id }) => _id === id)
    },
    closeEditingGroup() {
      this.editedId = null
      this.currentService = {}
    },
    async showApproveModal(id) {
      this.deleteId = id
    },
    async deleteGroup() {
      this.clientServicesGroups = (await this.$http.delete(`/clientsapi/client-group/${this.$route.params.id}/${this.deleteId}`)).data
      this.deleteId = null
    },
    checkError(data) {
      this.errors = []
      if(data.groupName.trim().length <=0) this.errors.push('Please write Template name')
      if(!data.service) this.errors.push('Please select Services')
      if(!data.industry) this.errors.push('Please select Industry')
      if(!data.source && data.languageForm === 'Duo') this.errors.push('Please select Source Language')
      if(data.target.length <= 0) this.errors.push('Please select Target Languages')
    },
    async createClientServiceGroup (data) {
      this.checkError(data)
      if(this.errors.length) return

      this.clientServicesGroups = (await this.$http.post(`/clientsapi/client-group/${ this.$route.params.id }`, data)).data
      this.closeAddingGroup()
    },
    async editClientServiceGroup (data) {
      this.checkError(data)
      if(this.errors.length) return

      this.clientServicesGroups = (await this.$http.post(`/clientsapi/client-group/${ this.$route.params.id }/${ this.editedId }`, data)).data

      this.closeEditingGroup()

    }
  },
  async created() {
    await this.getClientServicesGroups()
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";

.service-group {
  position: relative;
  .modal {
    position: absolute;
    top: 50%;
    left: 50%;
    //box-shadow: $box-shadow;
    border-radius: 4px;
    background-color: white;
    z-index: 5;
    padding: 25px;
    transform: translate(-50%, -50%);
  }
}

.service-group {
  border: 1px solid #bfbfbf;
  padding: 20px;
}

.group__cards {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.group__card {
  position: relative;
  border: 1px solid #bfbfbf;
  border-radius: 4px;
  padding: 15px;
  width: 274px;
}
.buttons {
  position: absolute;
  display: flex;
  gap: 5px;
  right: 10px;
  top: 10px;

}
.card {
  &__header {
    font-family: Myriad600;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid #999;
    font-size: 16px;

    .title {
      margin-right: 55px;
    }
  }
  &__lang-pair {
    display: flex;
    align-items: center;
  }
}

.tooltip {
  position: relative;
  display: flex;

  .tooltipData {
    visibility: hidden;
    font-size: 14px;
    width: max-content;
    background: white;
    border-radius: 4px;
    left: 70px;
    top: -8px;
    padding: 7px 7px 5px 7px;
    position: absolute;
    z-index: 555;
    opacity: 0;
    transition: opacity .3s;
    border: 1px solid $text;

    &::before {
      content: "";
      position: absolute;
      top: 8px;
      left: -12px;
      transform: rotate(270deg);
      border-width: 6px;
      border-style: solid;
      border-color: transparent transparent $text;
    }
  }

  &:hover {
    .tooltipData {
      visibility: visible;
      opacity: 1;
    }
  }
}
</style>