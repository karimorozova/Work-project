<template lang="pug">
  div
    .preview
      span.preview__close(@click="closePreview") +
      .preview__header
        .preview__title Preview
        .preview__row
          .preview__rowDrop
            .preview__rowDrop-title
              span List of Mailboxes:
            .preview__rowDrop-select
              SelectMulti(
                :selectedOptions="selectedMails"
                :options="allMails"
                :placeholder="'Select'"
                @chooseOptions="setMailBoxes"
              )
          .preview__rowInput
            .preview__rowInput-title
              span Add another Mailbox to the list:
            .preview__rowInput-input(v-bind:class="classErrorObject")
              input(type="text" :placeholder="'Enter mail'" ref="mail" v-model="mailInputValue" v-on:keyup.enter="addMailToList")

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
	import scrollDrop from "@/mixins/scrollDrop";
	import SelectMulti from "../SelectMulti";

	export default {
		mixins: [scrollDrop],
		props: {
			message: {
				type: String
			},
			allMails: {
				type: Array
			},
			previewDropMenu: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				mailInputValue: '',
				isInputError: false,
				selectedMails: [],
				currentTemplate: "",
				editorData: this.message,
				editorConfig: {
					uiColor: "#F4F0EE",
					allowedContent: true
				}
			};
		},
		methods: {
			closePreview() {
				this.$emit("closePreview");
			},
			send() {
				this.$emit("send", {
					message: this.editorData,
					arrayOfEmails: this.selectedMails,
				});
			},
			emptyRow(e) {
				console.log(e)
			},
			addMailToList(e) {
				const emailValidReg = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
				const newEmail = this.$refs.mail.value;
				if(!emailValidReg.test(newEmail)) {
					this.isInputError = true;
				} else {
					this.isInputError = false;
					if(!this.allMails.includes(newEmail)) this.allMails.push(newEmail);
					this.mailInputValue = '';
				}
			},
			setMailBoxes({ option }) {
				const position = this.selectedMails.indexOf(option);
				if(position !== -1) {
					this.selectedMails.splice(position, 1);
				} else {
					this.selectedMails.push(option);
				}
			},
		},
		mounted() {
			document.body.style.overflow = "hidden";
		},
		destroyed() {
			document.body.style.overflow = "auto";
		},

		computed: {
			classErrorObject() {
				const errObj = { 'error-input': this.isInputError };
				if(!this.mailInputValue) this.isInputError = false;
				if(this.mailInputValue) return errObj
			}
		},
		components: {
			SelectMulti,
			Button,
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

    &__row {
      display: flex;
      padding-bottom: 20px;
      min-height: 30px;
      justify-content: space-evenly;
    }

    &__rowDrop {
      display: flex;

      &-title {
        margin-right: 15px;
        line-height: 30px;
      }

      &-select {
        width: 250px;
        position: relative;
      }
    }

    &__rowInput {
      display: flex;

      input::placeholder {
        color: #67573E;
        opacity: .5;
        font-size: 14px;
      }

      input {
        width: 250px;
        height: 30px;
        padding-left: 5px;
        color: #67573E;
        outline: none;
        box-sizing: border-box;
        border: 1px solid #67573E;
        border-radius: 5px;

        &:focus {
          outline: none;
        }
      }

      &-title {
        margin-right: 15px;
        line-height: 30px;
      }
    }

    &__close {
      position: absolute;
      top: 5px;
      right: 10px;
      transform: rotate(45deg);
      font-weight: 600;
      font-size: 24px;
      cursor: pointer;
    }

    &__details {
      width: 100%;
      box-sizing: border-box;
      overflow-y: auto;
    }

    &__title {
      font-size: 22px;
      text-align: center;
      margin-bottom: 20px;
    }

    &__header {
      width: 100%;
      margin-top: 20px;
      display: block;
    }

    &__button {
      margin-top: 20px;
    }
  }

  .error-input {
    input {
      width: 250px;
      height: 30px;
      padding-left: 5px;
      color: #67573E;
      outline: none;
      box-sizing: border-box;
      border: 1px solid #D15F45;
      border-radius: 5px;
      background: #d15f4521;

      &:focus {
        outline: none;
      }
    }
  }
</style>
