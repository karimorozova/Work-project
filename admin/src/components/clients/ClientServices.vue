<template lang="pug">
.services

  .services__titles(v-if="clientServices.length")
    .services__title Source Lang
    .services__title Target Lang
    .services__title Services
    .services__title Industry
  .services__titles(v-else)
    | No services...

  .services__rows(v-for="(clientService,index) in clientServices" :key="clientService.id")
    .services__drop-item(@click="setChoosenIndex(index)")
      SelectSingle(
        placeholder="Select"
        :hasSearch="true"
        :selectedOption="clientServices[index].sourceLanguage.lang"
        :options="sourceLanguages"
        @chooseOption="setSource"
        @scrollDrop="scrollDrop"
      )
    .services__drop-item(@click="setChoosenIndex(index)")
      SelectSingle(
        placeholder="Select"
        :hasSearch="true"
        :selectedOption="clientServices[index].targetLanguage.lang"
        :options="targetLanguages"
        @chooseOption="setTarget"
        @scrollDrop="scrollDrop"
      )
    .services__drop-item(@click="setChoosenIndex(index)")
        SelectSingle(
            placeholder="Select"
            :hasSearch="true"
            :selectedOption="clientServices[index].service.title"
            :options="servicesData"
            @chooseOption="setService"
            @scrollDrop="scrollDrop"
        )
    .services__drop-item(@click="setChoosenIndex(index)")
        SelectSingle(
            placeholder="Select"
            :hasSearch="true"
            :selectedOption="clientServices[index].industry.name"
            :options="clientIndustries"
            @chooseOption="setIndustry"
            @scrollDrop="scrollDrop"
        )
    .services__delete(v-if="allFieldsFilled(index)")
        i.fa.fa-times(aria-hidden='true' @click="isDeleted = true; deleteIndex = index")

  .services__delete-approve(v-if="isDeleted" v-click-outside="closeModal")
      ApproveModal(
          text="Are you sure?"
          approveValue="Yes"
          notApproveValue="Cancel"
          @approve="approveAction"
          @notApprove="closeModal"
          @close="closeModal"
      )

  .services__add
      Add(@add="addData")

  ValidationErrors(v-if="areErrors"
      :errors="errors"
      :errorsClass="'validation__errors-client-services'"
      @closeErrors="closeErrorsBlock"
  )

</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Add from "../Add";
import ClickOutside from "vue-click-outside";
import SelectSingle from "../SelectSingle";
import scrollDrop from "@/mixins/scrollDrop";
import ValidationErrors from "../ValidationErrors";
import ApproveModal from "@/components/ApproveModal";

export default {
  mixins: [scrollDrop],

  props: {
    clientIndustries: {
      type: Array
    },
    sourceLanguages: {
      type: Array
    },
    targetLanguages: {
      type: Array
    },
    industries: {
      type: Array
    },
    languages: {
      type: Array
    },
    services: {
      type: Array
    }
  },
  data() {
    return {
      clientServices: [],
      currentIndex: -1,

      areErrors: false,
      errors: [],
      isDeleted: false,
      deleteIndex: -1
    };
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
      storeCurrentClient: "storeCurrentClient"
    }),
    closeModal() {
      return (this.isDeleted = false);
    },
    async getClientInfo() {
      const client = await this.$http.get(
        `/clientsapi/client?id=${this.$route.params.id}`
      );
      this.storeCurrentClient(client.body);
      this.clientServices = client.body.services;
    },
    setChoosenIndex(index) {
      this.currentIndex = index;
    },
    setSource({ option }) {
      let i = this.currentIndex;
      this.clientServices[i].sourceLanguage = this.languages.find(
        item => item.lang == option
      );
      this.checkAllFields(i);
    },
    setTarget({ option }) {
      let i = this.currentIndex;
      this.clientServices[i].targetLanguage = this.languages.find(
        item => item.lang == option
      );
      this.checkAllFields(i);
    },
    setService({ option }) {
      let i = this.currentIndex;
      this.clientServices[i].service = this.services.find(
        item => item.title == option
      );
      this.checkAllFields(i);
    },
    setIndustry({ option }) {
      let i = this.currentIndex;
      this.clientServices[i].industry = this.industries.find(
        item => item.name == option
      );
      this.checkAllFields(i);
    },
    addData() {
      if (this.clientServices.length) {
        let i = this.clientServices.length - 1;
        if (
          !(
            this.clientServices[i].sourceLanguage.hasOwnProperty("lang") &&
            this.clientServices[i].targetLanguage.hasOwnProperty("lang") &&
            this.clientServices[i].service.hasOwnProperty("title") &&
            this.clientServices[i].industry.hasOwnProperty("name")
          )
        ) {
          this.errors = [];
          this.errors.push("Fill in the previous field!");
          return (this.areErrors = true);
        }
      }

      this.clientServices.push({
        sourceLanguage: {},
        targetLanguage: {},
        service: {},
        industry: {}
      });
    },
    closeErrorsBlock() {
      this.areErrors = false;
    },
    async saveData(index) {
      try {
        let currentData = this.clientServices[index];
        const result = this.$http.post("/clientsapi/services", {
          clientId: this.$route.params.id,
          currentData
        });
        this.alertToggle({
          message: "Services are saved",
          isShow: true,
          type: "success"
        });
      } catch (err) {
        this.alertToggle({
          message: "Error in save Services",
          isShow: true,
          type: "error"
        });
      }
    },
    approveAction() {
      this.deleteData();
    },
    deleteData() {
      try {
        let currentData = this.clientServices[this.deleteIndex];
        const result = this.$http.delete(
          `/clientsapi/services/${this.$route.params.id}/${currentData._id}`
        );
        this.clientServices.splice(this.deleteIndex, 1);
        this.closeModal();
        this.alertToggle({
          message: "Services are saved",
          isShow: true,
          type: "success"
        });
      } catch (err) {
        this.alertToggle({
          message: "Error in save Services",
          isShow: true,
          type: "error"
        });
      }
    },
    allFieldsFilled(index) {
      if (this.clientServices.length) {
        return (
          this.clientServices[index].sourceLanguage.hasOwnProperty("lang") &&
          this.clientServices[index].targetLanguage.hasOwnProperty("lang") &&
          this.clientServices[index].service.hasOwnProperty("title") &&
          this.clientServices[index].industry.hasOwnProperty("name")
        );
      }
    },
    checkForUnique(index) {
      return this.clientServices.filter(
        item =>
          item.sourceLanguage.lang ==
            this.clientServices[index].sourceLanguage.lang &&
          item.targetLanguage.lang ==
            this.clientServices[index].targetLanguage.lang &&
          item.service.title == this.clientServices[index].service.title &&
          item.industry.name == this.clientServices[index].industry.name
      );
    },
    checkAllFields(index) {
      let isfield = this.allFieldsFilled(index);
      if (isfield) {
        if (this.checkForUnique(index).length > 1) {
          this.errors = [];
          this.errors.push("All fields must be unique!");
          return (this.areErrors = true);
        } else {
          this.saveData(index);
        }
      }
    }
  },
  directives: {
    ClickOutside
  },
  computed: {
    servicesData() {
      if (this.clientServices) {
        return this.services.map(item => item.title);
      }
    }
  },
  created() {
    this.getClientInfo();
  },
  components: {
    Add,
    SelectSingle,
    scrollDrop,
    ValidationErrors,
    ClickOutside,
    ApproveModal
  }
};
</script>

<style lang="scss" scoped>
.services {
  &__titles {
    display: flex;
  }
  &__title {
    width: 190px;
    margin-left: 15px;
    text-align: center;
    font-size: 18px;
  }
  &__rows {
    display: flex;
    padding-top: 15px;
    border: 1px solid #bfb09d;
    border-radius: 15px;
    margin-top: 15px;
  }
  &__add {
    margin-top: 15px;
  }
  &__delete {
    width: 40px;
    margin-left: 35px;
  }
  &__delete-approve {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  &__drop-item {
    position: relative;
    width: 190px;
    height: 45px;
    margin-left: 15px;
  }
  .fa-times {
    font-size: 28px;
    padding-top: 1px;
  }
}
</style>
