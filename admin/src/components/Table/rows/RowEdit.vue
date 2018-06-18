<template lang="pug">
  .b-edit
    img.b-edit__tool(:src="saveImg" :class='{"b-edit__tool_active": status[0]}' @click="handleSave")
    img.b-edit__tool(:src="editImg"  :class='{"b-edit__tool_active": status[1]}' @click='handleEdit')
    img.b-edit__tool(:src="deleteImg"  :class='{"b-edit__tool_active": status[2]}' @click="hadleRemove")
</template>

<script>
export default {
  props: {
    status: {
      type: Array,
      default: () => {
        return [false, true, true];
      }
    },
    saveImg: {
      type: String,
      default: require("../../../assets/images/Other/save-icon-qa-form.png")
    },
    editImg: {
      type: String,
      default: require("../../../assets/images/Other/save-icon-qa.png")
    },
    deleteImg: {
      type: String,
      default: require("../../../assets/images/Other/delete-icon-qa-form.png")
    }
  },
  data() {
    return {};
  },
  methods: {
    handleEdit() {
      this.$emit("onEdit");
    },
    hadleRemove(){
      this.$emit("onRemove");
    },
    handleSave(){
      this.$emit("onSave");
    }
  },

  computed: {},
  components: {}
};
</script>

<style lang="scss" scoped>
.b-edit {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  &__tool {
    opacity: 0.3;
    cursor: pointer;
    &_active {
      opacity: 1;
    }
  }
}
</style>