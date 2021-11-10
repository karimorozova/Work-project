<template lang="pug">
  .instructions
    .instructions__modals
      .modal__add-instruction.modal__border(v-if="isAddingModalOpen")
        input(type="text" placeholder="Title" v-model="newInstructionTitle")
        ckeditor(v-model="newInstructionDescription" :config="editorConfig" @blur="setNewDescription")
        .modal__footer
          Button(value="Add" @clicked="addCustomInstruction")
          Button(value="Cancel" @clicked="closeAddingModal")
      .modal__edit-instruction.modal__border(v-if="editableIndex !== ''")
        input(type="text" placeholder="Title" v-model="editableInstruction.title")
        ckeditor(v-model="editableInstruction.description" :config="editorConfig" @blur="serEditDescription")
        .modal__footer
          Button(value="Edit" @clicked="changeInstruction")
          Button(value="Cancel" @clicked="closeEditModal")
    .instructions__body
      .col
        .instructions__title(@click="openAddingModal") Used
        .instructions__cards
          .card(v-for="({ title, description}, index) of selectedInstructions")
            .card__title(@click="() => removeInstruction(index)") {{title}}
            .card__desctiption(@click="() => openEditModal(index)")
              div(v-html="description")
      .col
        .instructions__title all
        .instructions__cards
          .card(v-for="{id, title, description} of instructions")
            .card__title(@click="() => selectInstruction(id)") {{title}}
            .card__desctiption
              div(v-html="description")
</template>

<script>

import CKEditor from "ckeditor4-vue"
import Button from "../../Button"

export default {
  name: "Instructions",
  components: {
    ckeditor: CKEditor.component,
    Button,
  },
  props: {
    isEditable: {
      type: Boolean,
      default: true
    },
    instructions: {
      type: Array,
      default: () => []
    },
    selectedStartInstructions: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isAddingModalOpen: false,
      newInstructionTitle: '',
      newInstructionDescription: '',
      editableInstruction: {},
      editableIndex: '',
      selectedInstructions: this.selectedStartInstructions !==  '' ?  JSON.parse(this.selectedStartInstructions) : [],
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
          // { name: 'insert', groups: [ 'insert' ] },
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
    setNewDescription(e) {
      if (!this.isEditable) return
      this.newInstructionDescription = e
    },
    serEditDescription(e) {
      if (!this.isEditable) return
      this.editableInstruction.description = e
    },
    addCustomInstruction() {
      if (!this.isEditable) return
      this.selectedInstructions.push({ title: this.newInstructionTitle, description: this.newInstructionDescription })
      this.closeAddingModal()
    },
    selectInstruction(selectedId) {
      if (!this.isEditable) return
      if (this.selectedInstructions.some(({id}) => id === selectedId)) return

      const selectedInstruction = this.instructions.find(({id}) => id === selectedId )
      this.selectedInstructions.push(selectedInstruction)
    },
    removeInstruction(removeIndex) {
      if (!this.isEditable) return
      this.selectedInstructions.splice(removeIndex, 1)
    },
    changeInstruction() {
      if (!this.isEditable) return
      if (this.editableInstruction.hasOwnProperty('id')) {

        const editedId = this.editableInstruction.id
        const {description} = this.instructions.find(({id}) => id === editedId)
        this.editableInstruction.isCahnged = this.hasChangedDescription(description)
      }

      this.selectedInstructions.splice(this.editableIndex,1, this.editableInstruction )

      this.editableInstruction = []
      this.editableIndex = ''
    },
    hasChangedDescription(description) {
      return description.replace(/ ?<.*?> ?/g, '').replace(/\s/g, '') !== this.editableInstruction.description.replace(/ ?<.*?> ?/g, '').replace(/\s/g, '')
    },
    openAddingModal() {
      if (!this.isEditable) return
      this.isAddingModalOpen = true
    },
    closeAddingModal() {
      this.isAddingModalOpen = false
      this.newInstructionTitle = ''
      this.newInstructionDescription = ''
    },
    openEditModal(index) {
      if (!this.isEditable) return
      this.editableIndex = index
      this.editableInstruction = {...this.selectedInstructions[index]}

    },
    closeEditModal() {
      this.editableIndex = ''
      this.editableInstruction = {}
    }
  },
  watch: {
    selectedInstructions() {
      this.$emit('changedInstructions', JSON.stringify(this.selectedInstructions))
      // this.$emit('changedInstructions', this.selectedInstructions.map(instruction => JSON.stringify(instruction)).join('\n'))
    }
  }
}
</script>

<style scoped lang="scss">
  @import "../../../assets/scss/colors";
  .instructions {
    position: relative;
    width: 100%;
    &__modals {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .modal {
      &__edit-instruction,
      &__add-instruction {
        width: 550px;
      }
      &__footer {
        display: flex;
        gap: 20px
      }
    }
    &__body {
      display: flex;
      width: 100%;
    }
    .col {
      width: 50%;
    }
  }

  .modal__border {
    padding: 20px;
    box-shadow: $box-shadow;
    background-color: $white;
    border-radius: 4px;
  }

  input {
    font-size: 14px;
    color: $text;
    border: 1px solid $border;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 0 7px;
    outline: none;
    width: 220px;
    height: 32px;
    transition: .1s ease-out;

    &:focus {
      border: 1px solid $border-focus;
    }
  }
</style>