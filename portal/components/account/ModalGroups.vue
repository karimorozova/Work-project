<template lang="pug">
  .modal-group
    .modal__row
      .input
        .input__title Template Name:
        input(v-model="groupName")
      .input
        .input__title Industry:
        .drop
          SelectSingle(
            placeholder="Option",
            :options="mappedIndustries",
            :selectedOption="selectedIndustry.name",
            @chooseOption="setIndustry"
          )
    .modal__row
      .input
        .input__title Service:
        .drop
          SelectSingle(
            :isDisabled="!selectedIndustry.hasOwnProperty('name')"
            placeholder="Option",
            :options="mappedServices",
            :selectedOption="selectedService.title",
            @chooseOption="setService"
          )

      .input(v-if="selectedService.hasOwnProperty('languageForm') && selectedService.languageForm === 'Duo'")
        .input__title Source Language:
        .drop
          SelectSingle(
            :isDisabled="!selectedService.hasOwnProperty('title')"
            placeholder="Option",
            :options="mappedSourceLanguages",
            :selectedOption="selectedSourceLang ? selectedSourceLang.lang : ''",
            @chooseOption="setSourceLang"
          )
    .modal__row
      .tasks-langs
        .disabled-targets(v-if="isTargetsDisabled")
        .target
          .tasks-langs__title-target Target Languages:
          .select-lang-wrapper
            ListManagement(
              :list="clientServices ? mappedTargetLanguages.filter(item => !selectedTargetLang.map(i => i.lang).includes(item)) : mappedTargetLanguages"
              @moveItem="moveFromAll"
            )
            ListManagementButtons(@moveAll="moveAll" @removeAll="removeAll")
            ListManagement(
              :list="clientServices ? selectedTargetLang.map(i => i.lang) : []"
              @moveItem="moveFromChosen"
            )

          .select-target-count Selected languages: {{ selectedTargetLang ? selectedTargetLang.length : 0 }}
    .buttons
      Button(:value="buttonText" @clicked="createClientServiceGroup")
      Button(value="Cancel" :outline="true" @clicked="closeModal")
</template>

<script>
import ListManagementButtons from "../../pages/components/forms/ListManagementButtons"
import ListManagement from "../../pages/components/forms/ListManagement"
import SelectSingle from "../pangea/SelectSingle"
import Button from "../pangea/Button"
import { mapGetters } from "vuex"

export default {
  name: "ModalGroups",
  components: {
    SelectSingle,
    ListManagement,
    ListManagementButtons,
    Button,
  },
  props: {
    buttonText: {
      type: String,
      default: 'Create Group',
    },
    editGroupName: {
      type: String,
      default: '',
    },
    editSelectedService: {
      type: Object,
      default: () => ({})
    },
    editSelectedIndustry: {
      type: Object,
      default: () => ({})
    },
    editSelectedSourceLang: {
      type: Object,
      default: () => ({})
    },
    editSelectedTargetLang: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      groupName: this.editGroupName,
      selectedService: this.editSelectedService,
      selectedIndustry: this.editSelectedIndustry,
      selectedSourceLang: this.editSelectedSourceLang,
      selectedTargetLang: this.editSelectedTargetLang,
      clientServices: [],

    }
  },
  methods: {
    moveFromAll(lang) {
      if (this.isTargetsDisabled) return
      const targets = this.selectedTargetLang || []
      targets.push(this.languages.find(item => item.lang === lang))
      this.selectedTargetLang = targets
    },
    moveFromChosen(lang) {
      if (this.isTargetsDisabled) return
      const targets = this.selectedTargetLang || []
      this.selectedTargetLang = targets.filter(item => item.lang !== lang)
    },
    moveAll() {
      if (this.isTargetsDisabled) return
      this.selectedTargetLang =  this.languages.filter(item => this.mappedTargetLanguages.includes(item.lang))
    },
    removeAll() {
      if (this.isTargetsDisabled) return
      this.selectedTargetLang = []
    },

    setSourceLang({ option }) {
      this.selectedSourceLang = this.languages.find(({lang}) => lang === option)

      this.selectedTargetLang = []
    },
    setService({ option }) {
      this.selectedService = this.services.find(({title}) => title === option)

      this.selectedSourceLang = {}
      this.selectedTargetLang = []
    },
    setIndustry({ option }) {
      this.selectedIndustry = this.industries.find(({name}) => name === option)

      this.selectedService = {}
      this.selectedSourceLang = {}
      this.selectedTargetLang = []
    },
    async getClientServices() {
      const { services } = (await this.$axios.get(`/clientsapi/client-services/${ this.$route.params.id }`)).data
      this.clientServices = services
    },
    closeModal() {
      this.$emit('closeModal')
    },
    createClientServiceGroup() {
      const data = {
          groupName: this.groupName,
          industry: this.selectedIndustry._id,
          service: this.selectedService._id,
          source: this.selectedSourceLang ? this.selectedSourceLang._id : null,
          target: this.selectedTargetLang.map(({_id}) => _id),
          languageForm: this.selectedService.languageForm,
      }

      this.$emit('groupSend', data)
    }
  },
  computed: {
    ...mapGetters({
      languages: 'allLanguages',
      industries: 'getAllIndustries',
      services: 'getAllServices',
      client: 'getClientInfo'
      // services: "getAllServices",
      // industries: "getIndustries",
      // languages: "getAllLanguages",
    }),
    isTargetsDisabled() {
      return (!this.selectedService.hasOwnProperty('title') && this.selectedService.languageForm !== 'Duo' ) || (!(!!this.selectedSourceLang && this.selectedSourceLang.hasOwnProperty('lang')) && this.selectedService.languageForm === 'Duo')

    },
    mappedIndustries() {
      return [...new Set(this.clientServices.map(({industries})=> industries[0].name))]
    },
    mappedServices() {
      return [...new Set(this.clientServices.filter(({industries}) => industries[0].name === this.selectedIndustry.name).map(({services}) => services[0].title))]
    },
    mappedSourceLanguages() {
      return [...new Set(this.clientServices.filter(({industries, services}) => industries[0].name === this.selectedIndustry.name && services[0].title === this.selectedService.title).map(({sourceLanguage})=> sourceLanguage.lang))]
    },
    mappedTargetLanguages() {
      if (!this.selectedSourceLang && this.selectedService.languageForm === 'Duo') return []

      const filter = this.clientServices
          .filter(({industries, services, sourceLanguage}) => {
            return industries[0].name === this.selectedIndustry.name
                && services[0].title === this.selectedService.title
                && (this.selectedService.languageForm !== 'Duo' || (sourceLanguage.lang === this.selectedSourceLang.lang))
          })
      return [...new Set(filter.map(({targetLanguages})=> targetLanguages[0].lang))]
    }

  },

  async created() {
    this.clientServices =  this.client.services
    // await this.getClientServices()
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";
.modal {
  &__row {
    display: flex;
    gap: 55px;
    margin-bottom: 10px;
  }
}
.drop {
  position: relative;
  height: 30px;
  width: 220px;
}
.input {
  &__title {
    margin-bottom: 3px;
  }
}
.buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}
input {
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

.disabled-targets {
  position: absolute;
  top: 5px;
  bottom: 0;
  background-color: #c6c6c636;
  left: -5px;
  right: -5px;
  z-index: 10;
  border-radius: 3px;
}

%flex-row {
  display: flex;
  align-items: center;
}

%flex-column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.tasks-langs {
  position: relative;
  &__title {
    &-source {
      margin-bottom: 3px;
      position: relative;
    }

    &-target {
      margin-bottom: 3px;
      position: relative;
    }
  }
}

.source {
  @extend %flex-column;

  &__drop-menu {
    position: relative;
    width: 220px;
    height: 32px;
  }
}

.target {
  width: 495px;
  margin-top: 30px;

  &__arrows {
  }

  &__from {
    position: relative;
  }

  &__search-value {
    position: absolute;
    top: -20px;
    font-size: 14px;
    left: 100%;
  }
}

.select-lang-wrapper {
  @extend %flex-row;
  justify-content: space-between;
}

.select-target-count {
  margin-top: 6px;
  opacity: .4;
  float: right;
  font-size: 14px;
}

</style>