<template lang="pug">
  .content
    .clientsNotes
      .clientsNotes__modal(v-if="isAlert")
        ApproveModal(
          text="Delete message?"
          approveValue="Yes"
          notApproveValue="Cancel"
          @approve="deleteNote(deleteIndex)"
          @notApprove="setDefault"
          @close="setDefault"
        )
      .clientsNotes__commentsBody(v-if="currentClient.notes.length")
        .clientsNotes__comments(v-for="({user, message, updatedAT}, index) in currentClient.notes" )
          .comment__image
            img(:src="require('../../assets/images/signin-background.jpg')")
          .comment__body
            .comment__triangle
            .comment__titleRow
              .comment__nameAndTime
                .name {{ user.firstName || ""}} {{ user.lastName || "" }}
                .time {{ formateDate(updatedAT) }}

              .comment__icons(v-if="getUser._id.toString() === user._id.toString() || getUser.group.name === 'Administrators'")
                span
                  .icon(v-if="editableNoteIndex !== index" @click="setEditorData(index)")
                    img(:src="icons.edit.icon")
                  .icon-cancel(v-else @click="setDefault")
                    img(:src="icons.cancel.icon")
                .icon(@click="openAlert(index)")
                  img(:src="icons.delete.icon")

            .comment__text( id="editor" v-html="message")

      .clientsNotes__input
        ckeditor(v-model="editorData" :config="editorConfig")
        .clientsNotes__button(v-if="!!editorData || currentEditableNote !== null" @click="sendMessage") Send &nbsp;
          i.fa.fa-paper-plane(aria-hidden='true')

</template>

<script>
	import CKEditor from "ckeditor4-vue"
	import { mapGetters, mapActions } from "vuex"
	import moment from "moment"
	import ApproveModal from "../ApproveModal"

	export default {
		data() {
			return {
				icons: {
					edit: { icon: require('../../assets/images/latest-version/i-edit.png') },
					cancel: { icon: require('../../assets/images/latest-version/i-cancel.png') },
					delete: { icon: require('../../assets/images/latest-version/i-delete.png') }
				},
				isAlert: false,
				isNotesShow: false,
				currentEditableNote: null,
				editableNoteIndex: null,
				deleteIndex: null,
				editorData: "",
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
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle",
				updateClientNotes: "updateClientNotes",
				deleteClientNotes: "deleteClientNotes"
			}),
			openAlert(index) {
				this.deleteIndex = index
				this.isAlert = true
			},
			setEditorData(index) {
				this.editableNoteIndex = index
				this.currentEditableNote = this.currentClient.notes[index]
				this.editorData = this.currentEditableNote.message
			},
			formateDate(updatedAT) {
				return moment(updatedAT).format("DD-MM-YYYY LT")
			},
			setDefault() {
				this.editorData = ""
				this.currentEditableNote = null
				this.editableNoteIndex = null
				this.deleteIndex = null
				this.isAlert = false
			},
			async sendMessage() {
				const notesId = this.currentEditableNote ? this.currentEditableNote._id : null
				const { _id, photo, firstName, lastName, position } = this.getUser
				try {
					await this.updateClientNotes({
						user: { _id, photo, firstName, lastName, position },
						notesId,
						message: this.editorData,
						clientId: this.currentClient._id
					})
				} catch (err) {
					this.alertToggle({ message: "Error in send message", isShow: true, type: "error" })
				} finally {
					this.setDefault()
					!notesId && this.$nextTick(() => this.scrollToEnd())
				}
			},
			async deleteNote(index) {
				try {
					await this.deleteClientNotes({ index, clientId: this.currentClient._id })
				} catch (err) {
					this.alertToggle({ message: "Error in delete message", isShow: true, type: "error" })
				} finally {
					this.setDefault()
				}
			},
			scrollToEnd() {
				const element = this.$el.querySelector('.clientsNotes__commentsBody')
				element.scrollTop = element.scrollHeight
			}
		},
		computed: {
			...mapGetters({
				currentClient: "getCurrentClient",
				getUser: "getUser"
			})
		},
		components: {
			ApproveModal,
			ckeditor: CKEditor.component
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors";

  .clientsNotes {
    position: relative;

    &__modal {
      position: absolute;
      z-index: 999;
      transition: auto;
      left: 50%;
      margin-left: -170px;
      top: 50%;
      margin-top: -60px;
    }

    &__commentsBody {
      background: white;
      padding: 20px 20px 0;
      max-height: 500px;
      overflow-y: auto;
      border-top: 1px solid #ccc;
      border-left: 1px solid #ccc;
      border-right: 1px solid #ccc;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }

    &__input {
      position: relative;
    }

    &__button {
      position: absolute;
      left: 82%;
      bottom: 45px;
      width: 140px;
      height: 30px;
      border-radius: 2px;
      font-size: 14px;
      background-color: #fff;
      outline: none;
      transition: .2s ease-out;
      text-align: center;
      line-height: 30px;
      letter-spacing: .2px;
      border: 1px solid $border;

      &:active {
        transform: scale(.98);
      }

      &:hover {
        cursor: pointer;
        border: 1px solid $border-focus;
      }
    }

    &__comments {
      display: flex;
      padding-bottom: 20px;
    }
  }

  .comment {
    &__text {
      padding: 10px;
    }

    &__icons {
      display: flex;
      gap: 10px;
    }

    &__titleRow {
      display: flex;
      padding: 10px;
      justify-content: space-between;
    }

    &__nameAndTime {
      display: flex;
      align-items: baseline;
    }

    &__triangle {
      width: 0;
      height: 0;
      border-top: 10px solid transparent;
      border-bottom: 10px solid transparent;
      border-right: 10px solid $table-list;
      position: absolute;
      margin-left: -10px;
      margin-top: 7px;
    }

    &__body {
      min-width: 360px;
      background: $table-list;
      margin-left: 20px;
      border-radius: 2px;
      position: relative;
    }

    &__image {
      img {
        height: 32px;
        width: 32px;
        object-fit: cover;
        border-radius: 32px;
      }
    }
  }

  .name {
    font-size: 16px;
    font-family: Myriad600;
    margin-right: 10px;
  }

  .time {
    margin-right: 10px;
    opacity: 0.5;
  }

  .icon {
    cursor: pointer;

    img {
      width: 100%;
    }
  }

  .icon-cancel {
    margin-left: 7px;
    cursor: default;
    height: 17px;
    width: 17px;
    cursor: pointer;
    margin-top: 1px;
    opacity: .9;

    img {
      width: 100%;
    }
  }

  #editor /deep/ p {
    margin: 0;
  }


</style>