<template lang="pug">
  .instructions
    .instructions__modals
      ValidationErrors(
        v-if="errors.length"
        :errors="errors"
        :isAbsolute="true"
        @closeErrors="closeErrors"
      )
      ApproveModal(
        v-if="isDeleting"
        text="Are you sure?"
        approveValue="Yes"
        notApproveValue="No"
        @approve="removeInstruction"
        @close="closeDeleteModal"
        @notApprove="closeDeleteModal"
      )
      .modal__add-instruction.modal__border(v-if="isAddingModalOpen")
        .modal__title Adding
        .modal__input
          .input__title Title:
          input(type="text" placeholder="Title" v-model="newInstructionTitle")
        .modal__input
          .input__title Descriptions:
          WYSIWYG(:editorData="newInstructionDescription" @editorBlur="setNewDescription")
        .modal__footer
          Button(value="Add" @clicked="addCustomInstruction")
          Button(value="Cancel" :outline="true" @clicked="closeAddingModal")
      .modal__edit-instruction.modal__border(v-if="editableIndex !== ''")
        .modal__title Editing
        .modal__input
          .input__title Title:
          input(type="text" placeholder="Title" v-model="editableInstruction.title")
        .modal__input
          .input__title Descriptions:
          WYSIWYG(:editorData="editableInstruction.description" @editorBlur="serEditDescription")
        .modal__footer
          Button(value="Edit" @clicked="changeInstruction")
          Button(value="Cancel" :outline="true" @clicked="closeEditModal")
    .instructions__body
      .col
        .instructions__title Options
        .instructions__cards

          .card(v-for="({id, title, description, isOpen = false}, index) of unselectedInstructions")
            .card__header(@click.stop="() => toggleDescriptionAll(index)")
              .card__toggle_drop-down
                .icon(:class="{'icon__close': isOpen}")
                  i.fas.fa-chevron-right
                span {{title}}
              IconButton(@clicked="selectInstruction(id)")
                i.fas.fa-plus
            transition(name="slide-fade")
              .card__desctiption.animated(v-if="isOpen" v-html="description")

      .col
        .instructions__title Selected Options
        .instructions__cards

          .card(v-for="({ title, description, isOpen = false}, index) of selectedInstructions")
            .card__header(@click="() => toggleDescriptionSelect(index)")
              .card__toggle_drop-down
                .icon(:class="{'icon__close': isOpen}")
                  i.fas.fa-chevron-right
                span {{title}}
              .card__buttons
                IconButton(@clicked="() => openEditModal(index)")
                  i.fas.fa-pen
                IconButton(@clicked="() => openRemoveModal(index)")
                  i.fas.fa-trash
            transition(name="slide-fade")
              .card__desctiption.animated(v-if="isOpen" v-html="description")

            //.card__header(@click="() => removeInstruction(index)") {{title}}
            //.card__desctiption(@click="() => openEditModal(index)")
            //  div(v-html="description")
          .card__add(@click="openAddingModal")
            i.fas.fa-plus
            span Create New

</template>

<script>
import WYSIWYG from "../../../components/overall/WYSIWYG"
import Button from "../../../components/buttons/Button"
import IconButton from "../../../components/pangea/IconButton"
import ValidationErrors from "../../../components/pangea/ValidationErrors"
import ApproveModal from "../../../components/pangea/ApproveModal"

export default {
  name: "Instructions",
  components: {
    WYSIWYG,
    Button,
    IconButton,
    ValidationErrors,
    ApproveModal,
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
      test: false,
      isAddingModalOpen: false,
      newInstructionTitle: '',
      newInstructionDescription: '',
      editableInstruction: {},
      editableIndex: '',
      selectedInstructions: this.selectedStartInstructions !==  '' ?  JSON.parse(this.selectedStartInstructions) : [],
      errors: [],
      isDeleting: false,
    }
  },
  methods: {
    toggleDescriptionSelect(index) {
      this.$set(this.selectedInstructions[index], 'isOpen', !this.selectedInstructions[index].isOpen)
    },
    toggleDescriptionAll(index) {
      console.log(!this.unselectedInstructions[index].isOpen)
      this.$set(this.unselectedInstructions[index], 'isOpen', !this.unselectedInstructions[index].isOpen)
    },
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
      if (this.newInstructionTitle.trim() === '' ) {
        this.errors.push('Please, enter Title')
      }
      if ( this.newInstructionDescription.trim() === '') {
        this.errors.push('Please, enter Description')
      }
      if(this.errors.length) return
      this.selectedInstructions.push({ title: this.newInstructionTitle, description: this.newInstructionDescription })
      this.closeAddingModal()
    },
    selectInstruction(selectedId) {
      if (!this.isEditable) return
      if (this.selectedInstructions.some(({id}) => id === selectedId)) return

      const selectedInstruction = this.instructions.find(({id}) => id === selectedId )
      this.selectedInstructions.push(selectedInstruction)
    },
    removeInstruction() {
      if (!this.isEditable) return
      this.selectedInstructions.splice(this.removeIndex, 1)
      this.closeDeleteModal()
    },
    changeInstruction() {
      if (!this.isEditable) return

      if (this.editableInstruction.title.trim() === '' ) {
        this.errors.push('Please, enter Title')
      }
      if ( this.editableInstruction.description.trim() === '') {
        this.errors.push('Please, enter Description')
      }
      if(this.errors.length) return

      if (this.editableInstruction.hasOwnProperty('id')) {

        const editedId = this.editableInstruction.id
        const {description} = this.instructions.find(({id}) => id === editedId)
        this.editableInstruction.isChanged = this.hasChangedDescription(description)
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
      this.closeEditModal()
      this.closeDeleteModal()
      this.isAddingModalOpen = true
    },
    closeAddingModal() {
      this.newInstructionTitle = ''
      this.newInstructionDescription = ''
      this.isAddingModalOpen = false
    },
    openEditModal(index) {
      if (!this.isEditable) return
      this.closeAddingModal()
      this.closeDeleteModal()
      this.editableIndex = index
      this.editableInstruction = {...this.selectedInstructions[index]}

    },
    closeEditModal() {
      this.editableIndex = ''
      this.editableInstruction = {}
    },
    closeErrors() {
      this.errors = []
    },
    openRemoveModal(removeIndex) {
      if (!this.isEditable) return
      this.closeEditModal()
      this.closeAddingModal()
      this.isDeleting = true
      this.removeIndex = removeIndex
    },
    closeDeleteModal() {
      this.isDeleting = false
    }
  },
  computed: {
    unselectedInstructions() {
      const selectedIds = this.selectedInstructions.map((instruction) => instruction.hasOwnProperty('id') ? instruction.id : '')
      return this.instructions.filter(({id}) => !selectedIds.includes(id))
    },
    isSomeModalOpen() {
      return this.isDeleting || this.isAddingModalOpen || this.editableIndex !== ''
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
      z-index: 1;
    }
    &__title{
      font-size: 14px;
      margin-bottom: 8px;
      font-family: 'Myriad600';
    }
    .modal {
      &__edit-instruction,
      &__add-instruction {
        width: 600px;
        margin-bottom: 60px;

      }
      &__title {
        font-size: 16px;
        margin-bottom: 8px;
        font-family: 'Myriad600';
      }
      &__footer {
        display: flex;
        justify-content: center;
        margin-top: 20px;
        gap: 10px
      }
      &__input {
        margin: 10px 0;
      }
    }
    &__body {
      display: flex;
      width: 100%;
      gap: 1rem;
    }
    .col {
      flex: 1 1 calc((100% / 2) - 1rem);;

    }
  }
  .input {
    &__title {
      margin-bottom: 3px;
    }
  }
  .card {
    box-sizing: border-box;
    border-radius: 4px;
    background-color: $white;
    margin-bottom: 10px;
    &__header {
      border: 1px solid $light-border;
      border-radius: 4px;
      padding: 7px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 5px;
      cursor: pointer;
      //height: 27px;
    }
    &__toggle_drop-down {
      display: flex;
      gap: 15px;
      align-content: center;
      align-items: center;
    }
    &__desctiption {
      padding: 5px 10px 0px;
      transform-origin: top;
      border: 1px solid $light-border;
      border-radius: 0 0 4px 4px;
      border-top: none;
      margin-top: -5px;
    }
    &__buttons {
      display: flex;
      gap: 5px;
    }
  }

  .card__add {
    color: #999999;
    height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    border: 1px solid $light-border;
    cursor: pointer;
    transition: transform .1s;

    &:hover{
      transform: scale(1.04);
    }

    svg {
      font-size: 16px;
      padding: 10px;
      border: 1px solid $light-border;
      border-radius: 4px;
      margin-bottom: 4px;
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
  .icon {
    transition: transform .2s ease;
  }
  .icon__close {
    transform: rotate(90deg);
  }
  .slide-fade-enter-active {
    transition: all .2s ease-out;
  }
  .slide-fade-leave-active {
    transition: all .2s ease-out;
  }
  .slide-fade-enter, .slide-fade-leave-to
    /* .slide-fade-leave-active до версии 2.1.8 */ {
    //transform: translateY(-30px);
    transform: scaleY(0);
    opacity: 0;
  }

</style>