<template lang="pug">
  .modal
    .modal__title--wrapper
      p.modal__title Type:
      span.modal__descr {{ editItem.type }}
    .modal__title--wrapper
      p.modal__title.modal__title--from From:
      span.modal__descr {{ editItem.start.toLocaleString() }}
    .modal__title--wrapper
      p.modal__title To:
      span.modal__descr {{ editItem.end.toLocaleString() }}
    .action__buttons--wrapper
      .remove-button(@click="remove")
        .remove-button__icon
          i.fas.fa-trash
      .edit-button(@click="edit")
        .edit-button__icon
          i.fa-solid.fa-pen

    //.modal__title--wrapper
      //p.modal__title Days:
      //span.modal__descr {{ days }} WD ({{ days }} CD)


</template>

<script>
export default {
  name: 'EditModal',
  props: [ 'editItem' ],
  methods: {
    remove() {
      this.$emit('remove', this.editItem)
    },
    edit() {
      this.$emit('edit', this.editItem)
    },
    close() {
      this.$emit('close', this.editItem)
    },
  }

}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.remove-button {
  width: 25px;
  height: 25px;
  border: 1px solid $border;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  color: $dark-border;
  margin-right: 10px;

  &__icon {
    transition: .2s ease-out;
    font-size: 16px;
    margin-top: 2px;

    &:hover {
      color: $text;
    }
  }
}

.edit-button {
  width: 25px;
  height: 25px;
  border: 1px solid $border;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  color: $dark-border;
  margin-right: 10px;

  &__icon {
    transition: .2s ease-out;
    font-size: 16px;
    margin-top: 2px;

    &:hover {
      color: $text;
    }
  }
}
.add-button {
  margin-top: 0;
}
.modal {
  z-index: 8;
  background: white;
  padding: 10px;
  border: 1px solid $border;
  margin-right: 10px;
  width: 200px;

  &__close {
    font-size: 16px;
    cursor: pointer;
    opacity: 0.8;
    transition: .1s ease-out;
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      opacity: 1;
    }
  }

}

.action__buttons--wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.modal__title--wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.modal__title {
  color: $dark-border;
  font-weight: 500;
  font-size: 14px;
  margin: 0;
  &--from {
    margin-right: 4px;
  }
}

.modal__descr {
  color: $dark-border;
  font-size: 14px;
}
</style>
