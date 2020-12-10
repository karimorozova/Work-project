<template lang="pug">
  div
    .preview
      span.preview__close(@click="closePreview") &#10006;
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
					uiColor: "#F4F0EE",
					allowedContent: true
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
    background-color: black;
    opacity: 0.5;
    overflow: hidden;
  }

  .preview {
    position: fixed;
    z-index: 1600;
    background-color: $white;
    min-width: 1000px;
    max-width: 100%;
    top: 10%;
    left: 20%;
    right: 20%;
    margin: 0 auto;
    padding: 20px;
    box-shadow: 0 0 10px $brown-shadow;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;

    &__mails {
      width: 100%;
      margin-top: 10px;
      margin-bottom: -12px;
    }

    &__close {
      position: absolute;
      top: 8px;
      right: 20px;
      font-size: 16px;
      cursor: pointer;
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
