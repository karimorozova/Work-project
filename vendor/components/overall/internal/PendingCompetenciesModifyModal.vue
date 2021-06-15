<template lang="pug">
  Modal.modal(@close="closeModal")
    .modal__row
      .modal__title
        span.language {{pendingCompetency.sourceLanguage.lang}}
        span
          i(class="fas fa-angle-double-right")
        span.language {{pendingCompetency.targetLanguage.lang}}
    .modal__row
      .modal__info
        .info__text
          span.bold Industry: &nbsp;
          span {{pendingCompetency.industry.name}}
        .info__text
          span.bold Step: &nbsp;
          span {{pendingCompetency.step.title}}
    .modal__row
      .modal__rates
        span.bold Rate:
        input.width-191(v-model.lazy="currentRate" type="text" @click="selectInputValue")
    .modal__row
      p.wysiwyg__text Please provide more details about your experience in &nbsp;
        span {{pendingCompetency.industry.name}}
      WYSIWYG(:editorData="pendingCompetency.descriptions.industry" @editorBlur="changeCkeditor")
    .modal__row
      .button
        Button(value="Edit & Save" @clicked="updatePendingCompetency")


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
          industry: null
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
        this.$emit('updated', {data: {...this.pendingCompetency, rate: this.currentRate, descriptions: {industry: this.descriptionNewOrOld} }})
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
      descriptionNewOrOld (){
       return  this.description.industry === '' ||  this.description.industry
          ? this.description.industry
          : this.pendingCompetency.descriptions.industry
      }
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
    width: 700px;
    position: absolute;
    transform: translate(-50%,-13.5%);
    left: 50%;
    top: 50px;
    z-index: 654;

    &__row {
      margin-bottom: 15px;
    }

    &__info{
      display: flex;
      align-items: center;

    }

    &__rates {
      display: flex;
      align-items: center;
      padding-bottom: 15px;
      border-bottom: 1px solid #c5bfb5;

      span {
        margin-right: 10px;
      }

      input {
        padding: 6px 5px;
        border: 1px solid #66563D;
        color: #66563D;
        border-radius: 4px;
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
  .info{
    &__text{
      padding-right: 20px;
    }
  }

  .wysiwyg__text {
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
  .language{
    font-size: 18px;
  }
  .button{
    text-align: center;
  }
</style>
