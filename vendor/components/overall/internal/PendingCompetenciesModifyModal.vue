<template lang="pug">
  Modal.modal(@close="closeModal")
    .modal__row
      .modal__info
        .info__text
          span.bold {{pendingCompetency.sourceLanguage.lang}} &nbsp;
          | >> &nbsp;
          span.bold {{pendingCompetency.targetLanguage.lang}} &nbsp;
          | for &nbsp;
          span.bold {{pendingCompetency.industry.name}} &nbsp;
          | for step: &nbsp;
          span.bold {{pendingCompetency.step.title}}
    .modal__row
      .modal__rates
        span Rate:
        input.width-191(v-model.lazy="currentRate" type="text" @click="selectInputValue")
    .modal__row
      p.wysiwyg__text Please provide more details about your experience in &nbsp;
        span.bold {{pendingCompetency.industry.name}}
      WYSIWYG(:editorData="pendingCompetency.descriptions.industry" @editorBlur="changeCkeditor")
    .modal__row
      Button(value="Edit" @clicked="updatePendingCompetency")


</template>

<script>
import Modal from "../Modal"
import WYSIWYG from "../WYSIWYG"
import Button from "../Button"
import SelectSingle from "../SelectSingle";
	export default {
    components: {SelectSingle, Modal,WYSIWYG, Button},
    props: {
      pendingCompetency: {
				type: Object,
				default: () => []
			}
		},
    data() {
      return {
        description: {
          industry: ''
        },
        currentRate: (0).toFixed(4)
      }
    },
    watch: {
      currentRate(value) {
        const regex = /[^0-9\.,]/g
        value = parseFloat((value.toString()).replace(regex,'').replace(',','.') ) || 0
        this.currentRate = (+value).toFixed(4)
      },
    },
    methods: {
      updatePendingCompetency() {
        this.$emit('updated', {data: {...this.pendingCompetency, rate: this.currentRate, descriptions: {industry: this.description.industry} }})
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
    }
  }
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors";
  @import "../../../assets/scss/SettingsTable";

  .modal {
    box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    box-sizing: border-box;
    padding: 20px 20px 0 20px;
    width: 750px;
    position: absolute;
    transform: translate(-50%,0);
    left: 50%;
    top: 50px;

    &__row {
      margin-bottom: 15px;
    }

    &__info{
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    &__rates {
      display: flex;
      align-items: center;

      span {
        margin-right: 15px;
      }

      input {
        padding: 7px 10px;
        border: 1px solid #66563D;
        color: #66563D;
        border-radius: 7px;
        outline: none;
        box-sizing: border-box;
      }

      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      /* Firefox */
      input[type=number] {
        -moz-appearance: textfield;
      }
    }
  }

  .wysiwyg__text {
    opacity: .6;
    margin-top: 0;
    margin-bottom: 5px;
    font-size: 14px;
  }
  .width-191 {
    width: 191px;
  }

  .bold {
    font-family: Myriad600;
  }
</style>
