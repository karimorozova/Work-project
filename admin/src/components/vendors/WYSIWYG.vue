<template lang="pug">
  div
    .preview
      span.preview__close(@click="closePreview") &#215;
      .preview__header
        .preview__drop-menu(v-if="previewDropMenu")
          SelectSingle(
            placeholder="Choose Email Template"
            :selectedOption="currentTemplate.title"
            :options="templatesData"
            @chooseOption="setTemplate"
            @scrollDrop="scrollDrop"
          )
        //.preview__title Preview
      .preview__details
        ckeditor(v-model="editorData" :config="editorConfig")
      .preview__button
        Button(value="Send" @clicked="send")
    .background
</template>

<script>
	import Button from "../Button";
	import CKEditor from "ckeditor4-vue";
	import scrollDrop from "@/mixins/scrollDrop";
	import SelectSingle from "../SelectSingle";

	export default {
		mixins: [scrollDrop],
		props: {
			message: {
				type: String
			},
			templates: {
				type: Array
			},
			previewDropMenu: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				isTableDropMenu: true,
				currentTemplate: "",
				editorData: this.message.includes('cid:logo@pan') ?
						this.message.replace('cid:logo@pan', '/static/email-logo2.png') :
						this.message,
				editorConfig: {
					allowedContent: true,
					uiColor: "#f7f7f7",
					height: 350,
				}
			};
		},
		methods: {
			closePreview() {
				this.$emit("closePreview");
			},
			send() {
				this.$emit("send",
						this.editorData.includes('static/email-logo2.png') ?
								this.editorData.replace('/static/email-logo2.png', 'cid:logo@pan') :
								this.editorData
				);
			},
			setTemplate({ option }) {
				this.currentTemplate = this.templates.find(item => item.title === option);
			}
		},
		mounted() {
			document.body.style.overflow = "hidden";
		},
		destroyed() {
			document.body.style.overflow = "auto";
		},
		// watch: {
		// 	currentTemplate: {
		// 		handler(val) {
		// 			this.editorData = val.message
		// 		},
		// 		deep: true
		// 	}
		// },
		computed: {
			templatesData() {
				return this.templates.map(item => item.title);
			}
		},
		components: {
			Button,
			SelectSingle,
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
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    max-height: 720px;

    &__close {
      position: absolute;
      top: 10px;
      right: 15px;
      font-size: 21px;
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

    /*&__title {*/
    /*  font-size: 21px;*/
    /*  text-align: center;*/
    /*  padding-top: 5px;*/
    /*}*/

    &__header {
      margin-top: 20px;
    }

    &__drop-menu {
      width: 300px;
      box-shadow: inset 0 0 7px $brown-shadow;
      position: relative;
      float: right;
    }

    &__button {
      margin-top: 20px;
    }
  }
</style>
