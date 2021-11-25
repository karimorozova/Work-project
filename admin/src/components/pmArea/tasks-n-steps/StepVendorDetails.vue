<template lang="pug">
  .wrapper(v-if="vendorDetails")
    .wrapper__sender(v-if="isSender && toEmail" )
      MailSender(
        @close="closeSender"
        :to="toEmail"
        :subject="'Regarding: ' + `${ currentProject.projectId }` + ' - ' + `${ currentProject.projectName }`"
      )

    .wrapper__title Vendor
    .wrapper__close(@click="close") &#215;

    .info
      .info__link(@click="openFinanceModal") Go to finance
      .info__link2(@click="openDetailsModal") Go to details
      .info__title {{ currentStep.step.title }}
      .info__value {{ currentStep.stepId }}
      .info__value {{ currentStep.sourceLanguage === currentStep.targetLanguage ? currentStep.fullTargetLanguage.lang : currentStep.fullSourceLanguage.lang + ' to ' + currentStep.fullTargetLanguage.lang }}

    .vendor
      .vendor__row1
        .vendor__user
          .user
            .user__image(v-if="vendorDetails.photo")
              .circle1
              .circle2
              img(:src="domain + vendorDetails.photo")
            .user__fakeImage(:style="{'--bgColor': getBgColor(vendorId)[0], '--color': getBgColor(vendorId)[1]}" v-else) {{ vendorDetails.name[0] }}
              .circle1
              .circle2

            .user__description
              .user__name
                router-link(class="link-to" target= '_blank' :to="{path: `/pangea-vendors/all/details/${vendorId}`}")
                  span {{ vendorDetails.name }}

              .user__email(@click="openSender(vendorDetails.email)")
                span
                  i(class="far fa-envelope")
                span {{ vendorDetails.email }}
              .buttons
                .buttons__btn(@click="openBriefModal" ) Personal Instructions
                .buttons__btn() Extra payables (Soon)

        .vendor__stats
          .stats__row.border-bottom
            .stats__colLong
              .stats__col-bigTitle RATE
              .stats__col-bigValue
                .stats__col-bigValue-num {{ currentStep.vendorRate }}
                  span.currency(v-html="returnIconCurrencyByStringCode(projectCurrency)")
                .stats__col-bigValue-image(v-if="vendorDetails.benchmark - currentStep.vendorRate < 0" )
                  img(:src="icons.down")
                .stats__col-bigValue-image(v-if="vendorDetails.benchmark - currentStep.vendorRate > 0" )
                  img(:src="icons.up")

          .stats__row
            .stats__col.border-right
              .stats__col-smallValue {{vendorDetails.benchmark }}
                span.currency(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
              .stats__col-smallTitle B.MARK
            .stats__col
              .stats__col-smallValue {{ +(vendorDetails.benchmark - currentStep.vendorRate).toFixed(4) }}
                span.currency(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
              .stats__col-smallTitle B.MARGIN

        .vendor__marks
          .marks__row
            .marks__title TQI
            .marks__value {{ vendorDetails.tqi }}
          .marks__row
            .marks__title LQA1
            .marks__value {{ vendorDetails.lqa1 }}
          .marks__row
            .marks__title LQA2
            .marks__value {{ vendorDetails.lqa2 }}
          .marks__row
            .marks__title LQA3
            .marks__value {{ vendorDetails.lqa3 }}

    .notes__modal(v-if="isShowBriefModal")
      .notes__body
        ckeditor(v-model="vendorBrief" :config="editorConfig")
      .notes__buttons
        Button(value="Save" @clicked="changeVendorBrief")
        Button(value="Close" :outline="true" @clicked="closeBriefModal")
</template>

<script>
import { mapActions, mapGetters } from "vuex"
import CKEditor from "ckeditor4-vue"
import Button from "../../Button"
import currencyIconDetected from "../../../mixins/currencyIconDetected"
import getBgColor from "../../../mixins/getBgColor"
import MailSender from "../../MailSender"

export default {
  mixins: [ currencyIconDetected, getBgColor ],
  props: {
    index: {
      type: [ Number, String ]
    },
    vendorId: { type: String },
    currentStep: { type: Object },
    currentIndustry: { type: Object },
    projectCurrency: { type: String }
  },
  data() {
    return {
      icons: {
        up: require("../../../assets/images/latest-version/up.png"),
        down: require("../../../assets/images/latest-version/down.png")
      },
      domain: "http://localhost:3001",
      isShowBriefModal: false,
      vendorDetails: null,
      vendorBrief: this.currentStep.vendorBrief,
      editorConfig: {
        extraPlugins: [ 'colorbutton', 'smiley' ],
        toolbarGroups: [
          { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
          { name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
          { name: 'editing', groups: [ 'find', 'selection', 'spellchecker', 'editing' ] },
          { name: 'forms', groups: [ 'forms' ] },
          { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
          { name: 'clipboard', groups: [ 'clipboard', 'undo' ] },
          { name: 'links', groups: [ 'links' ] },
          { name: 'insert', groups: [ 'insert' ] },
          { name: 'styles', groups: [ 'styles' ] },
          { name: 'colors', groups: [ 'colors' ] },
          { name: 'tools', groups: [ 'tools' ] },
          { name: 'others', groups: [ 'others' ] },
          { name: 'about', groups: [ 'about' ] }
        ],
        removeButtons: 'Source,Save,NewPage,ExportPdf,Preview,Print,Templates,Cut,Copy,Paste,PasteText,PasteFromWord,Find,Replace,SelectAll,Form,Checkbox,Radio,TextField,Textarea,Select,ImageButton,HiddenField,Button,Superscript,Subscript,CopyFormatting,NumberedList,Blockquote,CreateDiv,JustifyLeft,JustifyCenter,JustifyRight,JustifyBlock,BidiLtr,BidiRtl,Language,Anchor,HorizontalRule,Table,Flash,PageBreak,Iframe,Styles,Format,Font,FontSize,ShowBlocks,Maximize,About',
        uiColor: "#ffffff",
        height: 100
      },
      isSender: false,
      toEmail: null

    }
  },
  methods: {
    openSender(to) {
      this.isSender = true
      this.toEmail = to
    },
    closeSender() {
      this.isSender = false
      this.toEmail = null
    },
    openDetailsModal() {
      const { closeVendorDetailsModal, showStepDetails } = this.$parent
      closeVendorDetailsModal()
      showStepDetails(this.index)
    },
    openFinanceModal() {
      const { closeVendorDetailsModal, showFinanceEditing } = this.$parent
      closeVendorDetailsModal()
      showFinanceEditing(this.index)
    },
    close() {
      this.$emit("close")
    },
    async getVendorDetails() {
      this.vendorDetails = (await this.$http.post('/pm-manage/vendors-for-steps-details/', { vendorId: this.vendorId, stepInfo: this.stepInfo })).data
    },
    openBriefModal() {
      this.isShowBriefModal = true
    },
    closeBriefModal() {
      this.isShowBriefModal = false
      this.vendorBrief = this.currentStep.vendorBrief || ''
    },
    async changeVendorBrief() {
      try {
        const result = await this.$http.post('/pm-manage/step-vendor-brief', { projectId: this.$route.params.id, stepId: this.currentStep._id, vendorBrief: this.vendorBrief })
        this.currentStep.vendorBrief = this.vendorBrief
        this.setCurrentProject(result.data)
        this.closeBriefModal()
        this.alertToggle({ message: "Personal brief updated", isShow: true, type: 'success' })
      } catch (err) {
        this.alertToggle({ message: "Error Personal Brief!", isShow: true, type: 'error' })
      }
    },
    ...mapActions({
      alertToggle: "alertToggle",
      setCurrentProject: "setCurrentProject"
    })
  },
  watch: {
    async vendorId() {
      this.vendorDetails = (await this.$http.post('/pm-manage/vendors-for-steps-details/', { vendorId: this.vendorId, stepInfo: this.stepInfo })).data
    }
  },
  mounted() {
    this.domain = __WEBPACK__API_URL__
  },
  created() {
    this.getVendorDetails()
  },
  computed: {
    ...mapGetters({
      currentProject: "getCurrentProject"
    }),
    stepInfo() {
      return {
        source: this.currentStep.fullSourceLanguage._id,
        target: this.currentStep.fullTargetLanguage._id,
        step: this.currentStep.step._id,
        unit: this.currentStep.payablesUnit._id,
        industry: this.currentIndustry._id
      }
    }
  },
  components: {
    MailSender,
    ckeditor: CKEditor.component,
    Button
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.notes {
  &__buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
  }
}

.info {
  border-radius: 4px;
  padding: 12px 20px;
  margin-bottom: 20px;
  border: 1px solid $light-border;
  position: relative;

  &__link {
    position: absolute;
    right: 12px;
    cursor: pointer;
    color: $dark-border;
    transition: .2s ease-out;

    &:hover {
      color: $text;
      text-decoration: underline;
    }
  }

  &__link2 {
    position: absolute;
    right: 12px;
    top: 35px;
    cursor: pointer;
    color: $dark-border;
    transition: .2s ease-out;

    &:hover {
      color: $text;
      text-decoration: underline;
    }
  }


  &__title {
    font-size: 20px;
    color: $red;
    margin-bottom: 10px;
  }

  &__value {
    font-size: 14px;
    margin-top: 6px;
  }
}

.wrapper {
  padding: 25px;
  background: white;
  border-radius: 4px;
  box-shadow: $box-shadow;
  position: relative;

  &__sender {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2000;
    width: 750px;
  }

  &__title {
    font-size: 18px;
    font-family: Myriad600;
    margin-bottom: 20px;
  }

  &__close {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 22px;
    cursor: pointer;
    height: 22px;
    width: 22px;
    justify-content: center;
    display: flex;
    align-items: center;
    font-family: Myriad900;
    opacity: 0.8;
    transition: ease 0.2s;

    &:hover {
      opacity: 1
    }
  }
}

.vendor {
  padding: 10px 15px;
  border: 1px dotted $light-border;
  margin-bottom: 10px;
  border-radius: 4px;

  &__row1 {
    display: flex;
  }

  &__stats {
    border: 1px solid $light-border;
    height: fit-content;
    margin-left: 15px;
  }

  &__marks {
    margin-top: 5px;
    margin-left: 20px;
  }

  &__user {
    display: flex;
  }
}

.stats {
  &__row {
    display: flex;
    justify-content: space-evenly;
  }

  &__col {
    display: flex;
    width: 80px;
    flex-direction: column;
    align-items: center;
    padding: 6px 0 4px 0;
    text-align: center;

    &-bigTitle {
      font-size: 14px;
      color: #3333;
      font-family: Myriad600;
      letter-spacing: .2px;
    }

    &-bigValue {
      display: flex;
      align-items: center;

      &-currency {
        font-size: 14px;
        color: $dark-border;
        margin-left: 3px;
      }

      &-num {
        //font-family: 'Myriad600';
      }

      &-image {
        height: 16px;
        margin-left: 8px;
      }

    }

    &-smallTitle {
      color: #3333;
      font-size: 12px;
      margin-top: 1px;
      letter-spacing: .2px;
    }

    &-smallValue {
      color: $dark-border;
    }
  }

  &__colLong {
    height: fit-content;
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 9px 8px 8px 8px;
    gap: 8px;
    align-items: center;
  }
}

.marks {
  &__row {
    display: flex;
    margin-bottom: 2px;
  }

  &__title {
    color: #3333;
    width: 45px;
  }

  &__value {
    color: $dark-border;
  }
}

.buttons {
  margin-top: 6px;
  display: flex;
  justify-content: start;
  gap: 12px;

  &__btn {
    transition: .2s ease-out;
    text-align: center;
    min-width: 100px;
    padding: 0 6px;
    height: 26px;
    font-size: 14px;
    line-height: 26px;
    border-radius: 2px;
    background-color: #fff;
    outline: none;
    letter-spacing: .2px;
    cursor: pointer;
    box-shadow: $box-shadow;

    &:hover {
      background-color: $light-border;
    }
  }
}

.user {
  display: flex;
  gap: 15px;
  width: 400px;
  align-items: center;

  &__description {
    width: 320px;
  }

  &__rating {
    color: #4ba5a557;
    margin-top: 10px;
  }

  &__name {
    font-family: Myriad600;
    margin-bottom: 3px;
  }

  &__email {
    color: #3333;
    width: fit-content;
    transition: .2s ease-out;
    display: flex;
    gap: 5px;

    i {
      margin-top: 1px;
    }

    &:hover {
      cursor: pointer;
      color: $text;
    }
  }

  &__fakeImage {
    height: 65px;
    width: 65px;
    min-width: 65px;
    border-radius: 8px;
    font-size: 28px;
    background: var(--bgColor);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  &__image {
    height: 65px;
    width: 65px;
    min-width: 65px;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      border-radius: 8px;
      object-fit: cover;
    }
  }
}


.circle1 {
  position: absolute;
  height: 16px;
  width: 16px;
  border-radius: 20px;
  background-color: white;
  right: -8px;
  top: 12px;
}

.circle2 {
  position: absolute;
  height: 10px;
  width: 10px;
  border-radius: 10px;
  background-color: $medium-green;
  right: -5px;
  top: 15px;
}

.border-bottom {
  border-bottom: 1px solid $light-border;
}

.border-right {
  border-right: 1px solid $light-border;
}

a {
  color: inherit;
  text-decoration: none;
  transition: .2s ease-out;

  &:hover {
    text-decoration: underline;
  }
}

.currency {
  font-size: 14px;
  color: $dark-border;
  margin-left: 4px;
}

</style>
