<template lang="pug">
  .content
    .clientCloseNotes(@click="toggleNotes")
      img.clientCloseNotes__icon(src="../../assets/images/open-close-arrow-brown.png" :class="{'clientCloseNotes__reverse': isNotesShow}")
    .clientsNotes(v-if="isNotesShow")
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
            img(:src="'https://pbs.twimg.com/profile_images/1323162426897010689/o8A3lLhv_400x400.jpg'")
          .comment__body
            .comment__triangle
            .comment__titleRow
              .comment__nameAndTime
                .name {{ user.firstName || ""}} {{ user.lastName || "" }}
                .time {{ formateDate(updatedAT) }}

              .comment__icons(v-if="getUser._id.toString() === user._id.toString() || getUser.position === 'Administrator'")
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
	import CKEditor from "ckeditor4-vue";
	import { mapGetters, mapActions } from "vuex";
	import moment from "moment";
	import ApproveModal from "../ApproveModal";

	export default {
		data() {
			return {
				icons: {
					edit: { icon: require('../../assets/images/Other/edit-icon-qa.png') },
					cancel: { icon: require('../../assets/images/Other/cancel-icon.png') },
					delete: { icon: require('../../assets/images/Other/delete-icon-qa-form.png') }
				},
				isAlert: false,
				isNotesShow: false,
				currentEditableNote: null,
				editableNoteIndex: null,
				deleteIndex: null,
				editorData: "",
				editorConfig: {
					extraPlugins: ['colorbutton', 'smiley'],
					toolbarGroups: [
						{ name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
						{ name: 'document', groups: ['mode', 'document', 'doctools'] },
						{ name: 'editing', groups: ['find', 'selection', 'spellchecker', 'editing'] },
						{ name: 'forms', groups: ['forms'] },
						{ name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi', 'paragraph'] },
						{ name: 'clipboard', groups: ['clipboard', 'undo'] },
						{ name: 'links', groups: ['links'] },
						{ name: 'insert', groups: ['insert'] },
						{ name: 'styles', groups: ['styles'] },
						{ name: 'colors', groups: ['colors'] },
						{ name: 'tools', groups: ['tools'] },
						{ name: 'others', groups: ['others'] },
						{ name: 'about', groups: ['about'] }
					],
					removeButtons: 'Source,Save,NewPage,ExportPdf,Preview,Print,Templates,Cut,Copy,Paste,PasteText,PasteFromWord,Find,Replace,SelectAll,Form,Checkbox,Radio,TextField,Textarea,Select,ImageButton,HiddenField,Button,Superscript,Subscript,CopyFormatting,NumberedList,Blockquote,CreateDiv,JustifyLeft,JustifyCenter,JustifyRight,JustifyBlock,BidiLtr,BidiRtl,Language,Anchor,HorizontalRule,Table,Flash,PageBreak,Iframe,Styles,Format,Font,FontSize,ShowBlocks,Maximize,About',
					uiColor: "#F2EFEB",
					height: 70,
				}
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle",
				updateClientNotes: "updateClientNotes",
				deleteClientNotes: "deleteClientNotes"
			}),
			toggleNotes() {
				this.isNotesShow = !this.isNotesShow;
			},
			openAlert(index) {
				this.deleteIndex = index;
				this.isAlert = true;
			},
			setEditorData(index) {
				this.editableNoteIndex = index;
				this.currentEditableNote = this.currentClient.notes[index];
				this.editorData = this.currentEditableNote.message;
			},
			formateDate(updatedAT) {
				return moment(updatedAT).format("DD-MM-YYYY LT")
			},
			setDefault() {
				this.editorData = "";
				this.currentEditableNote = null;
				this.editableNoteIndex = null;
				this.deleteIndex = null;
				this.isAlert = false;
			},
			async sendMessage() {
				const notesId = this.currentEditableNote ? this.currentEditableNote._id : null;
				const { _id, photo, firstName, lastName, position } = this.getUser;
				try {
					await this.updateClientNotes({
						user: { _id, photo, firstName, lastName, position },
						notesId,
						message: this.editorData,
						clientId: this.currentClient._id,
					});
					console.log(this.editorData)
				} catch (err) {
					this.alertToggle({ message: "Error in send message", isShow: true, type: "error" });
				} finally {
					this.setDefault();
					!notesId && this.$nextTick(() => this.scrollToEnd());
				}
			},
			async deleteNote(index) {
				try {
					await this.deleteClientNotes({ index, clientId: this.currentClient._id });
				} catch (err) {
					this.alertToggle({ message: "Error in delete message", isShow: true, type: "error" });
				} finally {
					this.setDefault();
				}
			},
			scrollToEnd() {
				const element = this.$el.querySelector('.clientsNotes__commentsBody');
				element.scrollTop = element.scrollHeight
			},
		},
		computed: {
			...mapGetters({
				currentClient: "getCurrentClient",
				getUser: "getUser"
			}),
		},
		components: {
			ApproveModal,
			ckeditor: CKEditor.component
		}
	}
</script>

<style lang="scss" scoped>
  .clientCloseNotes {
    height: 60px;
    cursor: pointer;
    position: relative;

    &__reverse {
      transform: rotate(180deg);
    }

    &__icon {
      position: absolute;
      height: 14px;
      right: 40px;
      bottom: 20px;
      transition: .1s ease;
    }
  }

  .clientsNotes {
    position: relative;
    padding: 0 40px 40px;

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
      border-top: 1px solid #d1d1d1;
      border-left: 1px solid #d1d1d1;
      border-right: 1px solid #d1d1d1;
      background: #F7F5F3;
      padding: 20px 20px 0;
      max-height: 500px;
      overflow-y: auto;
    }

    &__input {
      position: relative;
    }

    &__button {
      position: absolute;
      left: 86%;
      bottom: 45px;
      width: 100px;
      height: 30px;
      border-radius: 7px;
      font-size: 14px;
      background-color: #fff;
      color: #938676;
      outline: none;
      border: none;
      transition: 0.2s ease-out;
      text-align: center;
      line-height: 30px;
      letter-spacing: 0.2px;
      border: 2px solid #938676;

      &:active {
        transform: scale(.98);
      }

      &:hover {
        cursor: pointer;
        background: #f2efeb;
      }
    }

    &__comments {
      display: flex;
      padding-bottom: 20px;
    }
  }

  .comment {
    &__text {
      padding: 5px 10px 10px;
    }

    &__icons {
      display: flex;
    }

    &__titleRow {
      display: flex;
      padding: 10px 10px 5px;
      justify-content: space-between;
    }

    &__nameAndTime {
      display: flex;
      align-items: baseline;
    }

    &__triangle {
      width: 0;
      height: 0;
      border-top: 12px solid transparent;
      border-bottom: 12px solid transparent;
      border-right: 12px solid white;
      position: absolute;
      margin-left: -12px;
      margin-top: 15px;
    }

    &__body {
      min-width: 360px;
      background: white;
      margin-left: 20px;
      border-radius: 8px;
      position: relative;
    }

    &__image {
      img {
        height: 50px;
        width: 50px;
        object-fit: cover;
        border-radius: 50%;
      }
    }
  }

  .name {
    font-size: 16px;
    font-weight: bold;
    margin-right: 10px;
  }

  .time {
    color: #c2baaf;
    margin-right: 10px;
  }

  .icon {
    margin-left: 5px;
    cursor: pointer;
    opacity: .9;

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