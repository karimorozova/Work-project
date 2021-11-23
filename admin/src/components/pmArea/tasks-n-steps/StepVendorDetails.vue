<template lang="pug">
.vendor(v-if="vendorDetails")
  .vendor__close(@click="close") &#215;
  .vendor__brief-modal(v-if="isShowBriefModal")
    .vendor__close(@click="closeBriefModal") &#215;
    ckeditor(v-model="vendorBrief" :config="editorConfig")
    .modal__buttons
      Button(value="Save" @clicked="changeVendorBrief")
  .vendor__info-block
    .vendor__user
      .user
        .user__image
          img(src="https://images.pexels.com/photos/6498272/pexels-photo-6498272.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500")
        .user__description
          .user__name
            router-link(class="link-to" target= '_blank' :to="{path: `/pangea-vendors/all/details/${vendorId}`}")
              span {{ vendorDetails.name }}

          .user__email {{ vendorDetails.email }} (клик письмо)
          .buttons
            .buttons__btn(@click="openBriefModal" ) Vendor Brief
            //.buttons__btn(v-if="isReassignment" @click="setVendorToReassignStep({_id: item._id, name: item.name, email: item.email, nativeRate: item.nativeRate })") Assign
            .buttons__btn() Additional
    .vendor__stats
      .stats__row.border-bottom
        .stats__colLong
          .stats__col-bigTitle RATE
          .stats__col-bigValue
            .stats__col-bigValue-num {{ vendorDetails.price }}
            .stats__col-bigValue-currency(v-if="vendorDetails.price !== '-'")
              span.currency(v-html="returnIconCurrencyByStringCode(projectCurrency)")
            .stats__col-bigValue-image(v-if="vendorDetails.benchmarkMargin < 0" )
              img(:src="icons.down")
            .stats__col-bigValue-image(v-if="vendorDetails.benchmarkMargin > 0" )
              img(:src="icons.up")

      .stats__row
        .stats__col.border-right
          .stats__col-smallValue {{vendorDetails.benchmark }}
          .stats__col-smallTitle B.MARK
        .stats__col
          .stats__col-smallValue {{ vendorDetails.benchmarkMargin }}
          .stats__col-smallTitle MARGIN

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
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import CKEditor from "ckeditor4-vue"
import Button from "../../Button"
import currencyIconDetected from "../../../mixins/currencyIconDetected"

export default {
  mixins: [currencyIconDetected],
  props: {
    vendorId: { type: String },
    currentStep: { type: Object },
    currentIndustry: { type: Object },
    projectCurrency: { type: String },
  },
  data() {
    return {
      icons: {
        up: require("../../../assets/images/latest-version/up.png"),
        down: require("../../../assets/images/latest-version/down.png")
      },
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
        height: 80
      }

    };
  },
  methods: {
    close() {
      this.$emit("close");
    },
    async getVendorDetails() {
     this.vendorDetails =  (await this.$http.post('/pm-manage/vendors-for-steps-details/', { vendorId: this.vendorId, stepInfo: this.stepInfo })).data
    },
    openBriefModal () {
      this.isShowBriefModal = true
    },
    closeBriefModal () {
      this.isShowBriefModal = false
      this.vendorBrief = this.currentStep.vendorBrief || ''
    },
    async changeVendorBrief() {
      // console.log(this.stepInfo.vendorBrief)
     const result = await this.$http.post('/pm-manage/step-vendor-brief', {projectId: this.$route.params.id, stepId: this.currentStep._id, vendorBrief: this.vendorBrief })
      this.currentStep.vendorBrief = this.vendorBrief
      this.setCurrentProject(result.data)
    },
    ...mapActions({
      //   alertToggle: "alertToggle",
        setCurrentProject: "setCurrentProject"
    }),
  },
  watch: {
    async vendorId() {
      this.vendorDetails =  (await this.$http.post('/pm-manage/vendors-for-steps-details/', { vendorId: this.vendorId, stepInfo: this.stepInfo })).data
    }
  },
  created() {
    this.getVendorDetails();
  },
  computed: {
    ...mapGetters({
      currentProject: "getCurrentProject",
    }),
    stepInfo() {
      return  {
        source: this.currentStep.fullSourceLanguage._id,
        target: this.currentStep.fullTargetLanguage._id,
        step: this.currentStep.step._id,
        unit: this.currentStep.payablesUnit._id,
        industry: this.currentIndustry._id,
      }
    }
  },
  components: {
    ckeditor: CKEditor.component,
    Button,
  },
};
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";
.vendor {
  padding: 25px;
  background: white;
  border-radius: 4px;
  box-shadow: $box-shadow;
  &__brief-modal {
    position: absolute;
    top: 0;
    right: 0;
    padding: 25px;
    background: white;
    border-radius: 4px;
    box-shadow: $box-shadow;
  }
  &__info-block {
    display: flex;
    gap: 10px;
  }
  &__user {
    display: flex;
  }
  &__stats {
    border: 1px solid $light-border;
    height: fit-content;
    border-radius: 8px;
    margin-left: 15px;
  }
  &__close {
    position: absolute;
    top: 0;
    right: 3px;
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
     padding: 6px 0;
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
.user {
  display: flex;
  gap: 15px;
  width: 310px;
  align-items: center;

  &__description {
    width: 230px;
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
  }

  &__image {
    height: 65px;
    width: 65px;
    min-width: 65px;

    img {
      width: 100%;
      height: 100%;
      border-radius: 8px;
      object-fit: cover;
    }
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
    width: 100px;
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
.modal__buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}
a {
  color: inherit;
  text-decoration: none;
  transition: .2s ease-out;

  &:hover {
    text-decoration: underline;
  }
}
</style>
