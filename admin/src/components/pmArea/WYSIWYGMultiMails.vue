<template lang="pug">
  div
    .preview
      span.preview__close(@click="closePreview") &#215;
      .preview__mails
        MailChips(:emails="allMails" @emailAction="getSelectedMails")
      .preview__details
        ckeditor(v-model="editorData" :config="editorConfig")
      .preview__button
        Button(value="Send" v-if="selectedMails.length" @clicked="send")
        Button(value="Send" :isDisabled="true" v-else)
    .background
</template>

<script>
	import Button from "../Button";
	import CKEditor from "ckeditor4-vue";
	import MailChips from "../MailChips"

	export default {
		props: {
			message: {
				type: String
			},
			allMails: {
				type: Array
			},
		},
		data() {
			return {
				selectedMails: [],
				editorData: this.message.includes('cid:logo@pan') ?
						this.message.replace('cid:logo@pan', '../../../static/email-logo.png') :
						this.message,
				editorConfig: {
					allowedContent: true,
					uiColor: "#ffffff",
					height: 380,
				}
			};
		},
		methods: {
			getSelectedMails(data) {
				this.selectedMails = data;
			},
			closePreview() {
				this.$emit("closePreview");
			},
			send() {
				this.$emit("send", {
					message: this.editorData.includes('static/email-logo.png') ?
							this.editorData.replace('../../../static/email-logo.png', 'cid:logo@pan') :
							this.editorData,
					arrayOfEmails: this.selectedMails,
				});
			},
		},
		mounted() {
			document.body.style.overflow = "hidden";
		},
		destroyed() {
			document.body.style.overflow = "auto";
		},
		components: {
			Button,
			MailChips,
			ckeditor: CKEditor.component
		}
	};
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";

  .background {
    position: fixed;
    z-index: 1500;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: $text;
    opacity: 0.3;
    overflow: hidden;
  }

  .preview {
    position: fixed;
    z-index: 1600;
    background-color: #fff;
    min-width: 950px;
    max-width: 100%;
    right: 20%;
    margin: 0 auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    max-height: 720px;
    top: 45%;
    left: 50%;
    transform: translate(-50%,-50%);
    border-radius: 4px;
    box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;

    &__mails {
      width: 100%;
      margin-top: 20px;
      margin-bottom: 10px;
    }

    &__close {
      position: absolute;
      top: 8px;
      right: 10px;
      font-size: 22px;
      cursor: pointer;
      height: 22px;
      width: 22px;
      justify-content: center;
      font-family: Myriad900;
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
      margin-top: 20px;
    }
  }

</style>
