<template lang="pug">
  .select-template
    .select-template__header Start a new Project
    .select-template__type

      .left
        .block__descriptions
          .block__image(@click="toggle('template')")
            img(src="../../../assets/images/from-template.svg")
          .block__check
            CustomRadio(:isChecked="isFromTemplate" @toggleRadio="() => toggle('template')")
          .block__description(@click="toggle('template')") From Template

        .input
          .drop
            SelectSingle(
              :isDisabled="!isFromTemplate"
              :selectedOption="selectedTemplate.groupName"
              :options="clientServicesTemplates.map(({groupName}) => groupName)"
              placeholder="Option"
              @chooseOption="selectTemplate"
            )

      .right
        .block__descriptions
          .block__image(@click="toggle('blank')")
            img(src="../../../assets/images/from-blank.svg")
          .block__check
            CustomRadio(:isChecked="!isFromTemplate" @toggleRadio="() => toggle('blank')")
          .block__description(@click="toggle('blank')") Black Form

    Button(value="Start" style="margin-top: 20px;" :customClass="'middle'" :isDisabled="!someOptionChose" @clicked="setTemplate")
</template>

<script>
import { mapGetters } from "vuex"
import SelectSingle from "../../../components/pangea/SelectSingle"
import Button from "../../../components/pangea/Button"
import CustomRadio from "../../../components/pangea/CustomRadio"

export default {
  components: {
    CustomRadio,
    SelectSingle,
    Button
  },
  props: {
    clientId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isFromTemplate: true,
      // projectType: 'template',
      clientServicesTemplates: [],
      selectedTemplate: {}
    }
  },
  methods: {
    toggle(prop) {
      this.isFromTemplate = prop === 'template'
    },
    async getServiceTemplates() {
      this.clientServicesTemplates = (await this.$axios.get(`/portal/service-templates/${ this.clientId }`)).data
      if (this.clientServicesTemplates.length === 1) {
        this.selectedTemplate = this.clientServicesTemplates[0]
      }
    },
    selectTemplate({ option }) {
      this.selectedTemplate = this.clientServicesTemplates.find(({ groupName }) => groupName === option)
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
      return (this.isFromTemplate && this.selectedTemplate.hasOwnProperty('groupName')) || !this.isFromTemplate
    }
  },
  async created() {
    await this.getServiceTemplates()
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";

.block {
  &__image {
    img {
      height: 30px;
      cursor: pointer;
    }
  }

  &__description {
    cursor: pointer;
  }

  &__descriptions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.left {
  width: 250px;
}

.right {
  width: 150px;
}

.select-template {
  box-shadow: $box-shadow;
  padding: 25px;
  width: fit-content;
  height: fit-content;
  background-color: white;
  border-radius: 4px;

  &__header {
    font-size: 16px;
    padding-bottom: 20px;
    font-family: 'Myriad600';
    border-bottom: 1px solid $light-border;
    margin-bottom: 20px;
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
  margin-top: 10px;

  &__title {
  }
}

.drop {
  position: relative;
  width: 220px;
  height: 32px;
}
</style>