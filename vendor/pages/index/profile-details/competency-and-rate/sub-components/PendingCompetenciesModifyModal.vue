<template lang="pug">
  Modal.modal(@close="closeModal")
    .modal__row
      .modal__title
        span.language {{pendingCompetency.sourceLanguage.lang}}
        span &nbsp;&nbsp;
          i(class="fas fa-angle-double-right")
        span &nbsp;&nbsp;
        span.language {{pendingCompetency.targetLanguage.lang}}
    .modal__row
      .modal__info
        .info__text
          span.bold Industry: &nbsp;&nbsp;
          span {{pendingCompetency.industry.name}}
        .info__text
          span.bold Step: &nbsp;&nbsp;
          span {{pendingCompetency.step.title}}
    .modal__row
      .modal__rates
        span.bold Rate:
        input.width-191(v-model.lazy="currentRate" type="text" @click="selectInputValue")
    .modal__row
      p.wysiwyg__text Please provide more details about your experience in &nbsp;
        span.bold {{pendingCompetency.industry.name}}
      WYSIWYG(:editorData="pendingCompetency.descriptions.industry" @editorBlur="changeCkeditor")


    Button(value="Edit & Save" :customClass="'middle'" @clicked="updatePendingCompetency")


</template>

<script>
import Modal from "../../../../../components/sub-components/Modal"
import WYSIWYG from "../../../../../components/sub-components/WYSIWYG"
import Button from "../../../../../components/general/Button"
import SelectSingle from "../../../../../components/general/SelectSingle"

export default {
  components: { SelectSingle, Modal, WYSIWYG, Button },
  props: {
    pendingCompetency: {
      type: Object,
      default: () => []
    }
  },
  data() {
    return {
      description: {
        industry: null
      },
      currentRate: (0).toFixed(4)
    }
  },
  watch: {
    currentRate(value) {
      const regex = /[^0-9\.,]/g
      value = parseFloat((value.toString()).replace(regex, '').replace(',', '.')) || 0
      this.currentRate = (+value).toFixed(4)
    }
  },
  methods: {
    updatePendingCompetency() {
      this.$emit('updated', { data: { ...this.pendingCompetency, rate: this.currentRate, descriptions: { industry: this.descriptionNewOrOld } } })
    },
    changeCkeditor(data) {
      this.description.industry = data
    },
    closeModal() {
      this.$emit('close')
    },
    selectInputValue(e) {
      e.target.select()
    }
  },
  created() {
    this.currentRate = this.pendingCompetency.rate
  },
  computed: {
    descriptionNewOrOld() {
      return this.description.industry === '' || this.description.industry
          ? this.description.industry
          : this.pendingCompetency.descriptions.industry
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../../assets/scss/colors";

.modal {
  box-shadow: $box-shadow;
  box-sizing: border-box;
  padding: 25px;
  width: 600px;
  position: absolute;
  transform: translate(-50%, 0%);
  left: 50%;
  top: 0%;
  z-index: 654;

  &__row {
    margin-bottom: 20px;
  }

  &__info {
    display: flex;
    align-items: center;

  }

  &__rates {
    display: flex;
    align-items: center;
    padding-bottom: 15px;
    border-bottom: 1px solid $light-border;

    span {
      margin-right: 10px;
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

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    input[type=number] {
      -moz-appearance: textfield;
    }
  }
}

.info {
  &__text {
    padding-right: 30px;
  }
}

.wysiwyg__text {
  margin-bottom: 10px;
  font-size: 14px;
  color: $dark-border;

}

.bold {
  font-family: Roboto600;
}

.language {
  font-size: 16px;
  font-family: 'Roboto600';
}

.button {
  text-align: center;
}
</style>
