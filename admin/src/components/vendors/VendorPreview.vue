<template lang="pug">
.preview
    span.preview__close(@click="closePreview") +
    .preview__header
        .preview__drop-menu
            SelectSingle(
                placeholder="Choose Email Template"
                :selectedOption="currentTemplate"
                :options="templates"
                @chooseOption="setTemplate"
                @scrollDrop="scrollDrop"
            )
        .preview__title Quote Preview
    .preview__details
        ckeditor(v-model="editorData" :config="editorConfig")
    .preview__button
        Button(value="Send" @clicked="send")
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
    }
  },
  data() {
    return {
      isTableDropMenu: true,
      templates: ["None","Test template1", "Test template2", "Test template3"],
      currentTemplate: "",
      editorData: this.message,
    };
  },
  methods: {
    closePreview() {
      this.$emit("closePreview");
    },
    send() {
      this.$emit("send", this.editorData);
    },
    setTemplate({ option }) {
      this.currentTemplate = this.templates.find(item => item === option);
    }
  },
  components: {
    Button,
    SelectSingle,
    ckeditor: CKEditor.component
  },
};
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.preview {
  position: sticky;
  background-color: $white;
  min-width: 80%;
  top: 10%;
  margin-left: 10%;
  padding: 20px;
  box-shadow: 0 0 10px $brown-shadow;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;

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
    font-size: 20px;
    text-align: center;
    padding-top: 5px;
  }

  &__header {
    height: 50px;
    width: 100%;
    margin-top: 20px;
    display: block;
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
