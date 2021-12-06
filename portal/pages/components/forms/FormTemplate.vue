<template lang="pug">
  .select-template
    .select-template__header Start a new Project
    .select-template__type
      .radio__group
        input(type="radio" id="contactChoice1" v-model="projectType" value="template")
        label(for="contactChoice1") From Template
      .radio__group
        input(type="radio" id="contactChoice2" v-model="projectType" value="scratch" @click="clearSelected")
        label(for="contactChoice2") From Scratch
    .input
      //.input__title Template:
      .drop
        SelectSingle(
          :isDisabled="projectType !== 'template'"
          :selectedOption="selectedTemplate.groupName"
          :options="clientServicesTemplates.map(({groupName}) => groupName)"
          placeholder="Option"
          @chooseOption="selectTemplate"
        )
    Button(value="Start" :isDisabled="!someOptionChose" @clicked="setTemplate")
</template>

<script>
import { mapGetters } from "vuex"
import SelectSingle from "../../../components/pangea/SelectSingle"
import Button from "../../../components/pangea/Button"
export default {
  components: {
    SelectSingle,
    Button,
  },
  props: {
    clientId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      projectType: 'template',
      clientServicesTemplates: [],
      selectedTemplate: {},
    }
  },
  methods: {
    async getServiceTemplates() {
      this.clientServicesTemplates = (await this.$axios.get(`/portal/service-templates/${ this.clientId }`)).data
      if (this.clientServicesTemplates.length === 1) {
        this.selectedTemplate = this.clientServicesTemplates[0]
      }
    },
    selectTemplate({ option }) {
      this.selectedTemplate = this.clientServicesTemplates.find(({groupName})=> groupName === option)
    },
    setTemplate() {
      this.$emit('selectedTemplate', this.selectedTemplate)
    },
    clearSelected() {
      this.selectedTemplate = {}
    }
  },
  computed: {
    someOptionChose() {
      return (this.projectType === "template" && this.selectedTemplate.hasOwnProperty('groupName')) || this.projectType === 'scratch'
    }
  },
  async created() {
    await this.getServiceTemplates()
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";

.select-template {
  box-shadow: $box-shadow;
  padding: 0 20px 20px 20px;
  width: 460px;
  height: fit-content;
  background-color: white;
  border-radius: 4px;

  &__header {
    font-size: 14px;
    padding-top: 20px;
    padding-bottom: 15px;
    font-family: 'Myriad600';
    border-bottom: 1px solid $border;
    margin-bottom: 15px;
  }
  &__type {
    display: flex;
    justify-content: space-between;
  }
}

.radio {
  &__group {
    width: 220px;
    margin-bottom: 3px;
  }
}
.input {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  &__title {
  }
}
.drop {
  position: relative;
  width: 220px;
  height: 32px;
}
</style>