<template lang="pug">
  .wrapper
    .preview
      span.preview__close(@click="closePreview") &#215;
      .preview__mails
        MailChips(:emails="allMails" @emailAction="getSelectedMails")
      .preview__details
        ckeditor(v-model="editorData" :config="editorConfig")
      .preview__button
        Button(value="Send" :isDisabled="!!requestCounter" v-if="selectedMails.length" @clicked="send")
        Button(value="Send" :isDisabled="true" v-else)
        Button(value="Cancel" :isDisabled="!!requestCounter" @clicked="closePreview" :outline="true")
</template>

<script>
import Button from "../Button"
import CKEditor from "ckeditor4-vue"
import MailChips from "../MailChips"
import { mapGetters } from "vuex"

export default {
  props: {
    message: {
      type: String
    },
    allMails: {
      type: Array
    }
  },
  data() {
    return {
      selectedMails: [],
      editorData: this.message.includes('cid:logo@pan') ?
          this.message.replace('cid:logo@pan', '/static/email-logo2.png') :
          this.message,
      editorConfig: {
        allowedContent: true,
        uiColor: "#ffffff",
        height: 460
      }
    }
  },
  methods: {
    getSelectedMails(data) {
      this.selectedMails = data
    },
    closePreview() {
      this.$emit("closePreview")
    },
    send() {
      this.$emit("send", {
        message: this.editorData.includes('static/email-logo2.png') ?
            this.editorData.replace('/static/email-logo2.png', 'cid:logo@pan') :
            this.editorData,
        arrayOfEmails: this.selectedMails
      })
    }
  },
  computed: {
    ...mapGetters({
      requestCounter: 'getRequestCounter'
    })
  },
  mounted() {
    document.body.style.overflow = "hidden"
    window.scrollTo(0, 0)
  },
  destroyed() {
    document.body.style.overflow = "auto"
  },
  components: {
    Button,
    MailChips,
    ckeditor: CKEditor.component
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";


.preview {
  position: fixed;
  z-index: 1600;
  background-color: #fff;
  width: 1040px;
  box-shadow: $box-shadow;
  height: fit-content;
  padding: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  top: 96px;
  left: 435px;
  //top: 50%;
  //left: 50%;
  //transform: translate(-50%, -50%);


  &__mails {
    width: 100%;
    margin-top: 20px;
    margin-bottom: 10px;
  }

  &__close {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 24px;
    cursor: pointer;
    height: 24px;
    width: 24px;
    justify-content: center;
    font-family: Myriad600;
    opacity: .8;
    transition: .2s ease;

    &:hover {
      opacity: 1
    }
  }

  &__details {
    width: 100%;
    box-sizing: border-box;
    overflow-y: auto;
  }

  &__button {
    margin-top: 25px;
    display: flex;
    gap: 20px;
  }
}

</style>
