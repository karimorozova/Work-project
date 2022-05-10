<template lang="pug">
  .container
    .main
      draggable(:value="socialMedia" @input="changeItemPosition" handle=".handle")
        .item(v-for="(item, index) in socialMedia")
          .options-wrapper
            .drop(v-if="item.key !== 'Others'" )
              SelectSingle(
                :options="socialsList"
                placeholder="Option"
                :selectedOption="item.key"
                @chooseOption="({option}) => updateItem(option, 'key', index)"
              )
            .row__value(v-if="item.key !== 'Others'" )
              input.input(type="text" placeholder="Value" :value="item.value" @change="(e) => updateItem(e.target.value,'value', index)")
            .row__value(v-if="item.key === 'Others'" )
              input.input(type="text" placeholder="Value" :value="item.key === 'Others' ? '' : item.key" @change="(e) => updateItem(e.target.value,'key', index)")
            .row__value(v-if="item.key === 'Others'" )
              input.input(type="text" placeholder="Value" :value="item.value" @change="(e) => updateItem(e.target.value,'value', index)")
            .remove-button(@click="remove(index)")
              .remove-button__icon
                i.fas.fa-trash
            .remove-button.handle(style="cursor: grab; margin-left: 10px;")
              .remove-button__icon
                i.fas.fa-arrows-alt-v
    Add(@add="addSocialMedia")


</template>
<script>
import Add from '../../../../../components/general/Add'
import SelectSingle from '../../../../../components/general/SelectSingle'
import draggable from 'vuedraggable'

export default {
  name: 'SocialMediaRow',
  props: {
    socialMedia: {
      type: Array,
      default: () => []
    },
  },
  components: {
    SelectSingle,
    draggable,
    Add

  },
  data() {
    return {
      socialsList: ['Facebook', 'Linkedin', 'Twitter', 'Instagram', 'Telegram', 'WhatsApp', 'Skype', 'Proz', 'Smartcat','Others'],

    }
  },
  methods: {
    changeItemPosition(data) {
      this.$emit('changeItemPosition', data)
    },
    updateItem(value, prop, index) {
      this.$emit('update', {value, prop, index})
    },
    addSocialMedia() {
      this.$emit('add', {key: '', value: '',})
    },
    remove(index) {
      this.$emit('remove', index)
    },
  }

}
</script>
<style lang="scss" scoped>
@import '../../../../../assets/scss/colors';

.options-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.drop {
  position: relative;
  width: 220px;
  height: 32px;
  background-color: white;
  margin-right: 42.5px;
}

.row {
  &__value {
    width: 220px;
    background-color: powderbluer;
    position: relative;
    height: 32px;
    margin-right: 42.5px;
  }
}

.input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 2px;
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

  &:hover {
    color: $text;
  }

  &__icon {
    transition: .2s ease-out;
    font-size: 16px;
    margin-top: 2px;
  }
}
</style>
