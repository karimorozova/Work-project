<template lang="pug">
  .instructions

    .instructions__body
      //.instructions__title Options
      .instructions__cards
        .card(v-for="({id, title, description,isChanged ,  isOpen = false}, index) of selectedInstructions")
          .card__header(@click="() => toggleDescriptionAll(index)")
            .card__toggle_drop-down
              .icon(:class="{'icon__close': isOpen}" )
                i.fas.fa-chevron-right
              span {{title}}
            //IconButton(v-if="isChanged" @clicked="() => openEditModal(index)")
            i(class="fas fa-pen gray-icon" v-if="isChanged")
          transition(name="slide-fade")
            .card__desctiption.animated(v-if="isOpen" v-html="description")

</template>

<script>

export default {
  props: {
    isEditable: {
      type: Boolean,
      default: true
    },
    instructions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      editableInstruction: {},
      editableIndex: '',
      selectedInstructions: this.instructions,
      errors: [],
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
    toggleDescriptionAll(index) {
      this.$set(this.selectedInstructions[index], 'isOpen', !this.selectedInstructions[index].isOpen)
    },
    serEditDescription(e) {
      if (!this.isEditable) return
      this.editableInstruction.description = e
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
    z-index: 300;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  &__title {
    font-size: 14px;
    margin-bottom: 8px;
    font-family: 'Myriad600';
  }

  &__cards {
    width: 100%;
  }

  .modal {
    &__edit-instruction {
      width: 600px;
      margin-bottom: 20px;

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
    padding: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 7px;
    cursor: pointer;
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
  /* .slide-fade-leave-active до версии 2.1.8 */
{
  //transform: translateY(-30px);
  transform: scaleY(0);
  opacity: 0;
}

.gray-icon {
  color: $dark-border;
}
</style>