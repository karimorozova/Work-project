<template lang="pug">
div
  .preview
      span.preview__close(@click="closePreview") +
      .preview__header
          .preview__drop-menu(v-if="previewDropMenu")
              SelectSingle(
                  placeholder="Choose Email Template"
                  :selectedOption="currentTemplate.title"
                  :options="templatesData"
                  @chooseOption="setTemplate"
                  @scrollDrop="scrollDrop"
              )
          .preview__title Preview
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
      editorData: this.message,
      editorConfig: {
        uiColor: "#F4F0EE",
        allowedContent: true
      }
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
      this.currentTemplate = this.templates.find(item => item.title === option);
    }
  },
  mounted() {
    document.body.style.overflow = "hidden";
  },
  destroyed() {
    document.body.style.overflow = "auto";
  },
  watch: {
    currentTemplate: {
      handler(val) {
        this.editorData = val.message
      },
      deep: true
    }
  },
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
  z-index: 100;
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
  z-index: 200;
  background-color: $white;
  min-width: 1000px;
  max-width: 100%;
  top: 20%;
  left: 20%;
  right: 20%;
  margin: 0 auto;
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
