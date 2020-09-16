import { mapActions } from "vuex";

export default {
  methods: {
    ...mapActions({
      getServices: "getServices",
      alertToggle: "alertToggle",
    }),
    clientsServicesForWorkflow: function () {
      const arrayOfClientServices = [
        ...new Set(
          this.currentProject.customer.services
            .map((service) => service.services)
            .flat()
        ),
      ];
      return this.services.filter((a) =>
        arrayOfClientServices.some((b) => a._id.toString() === b)
      );
    },
    setStartedLanguages(languageFormValue){
        if(languageFormValue === undefined){
          languageFormValue = this.clientsServicesForWorkflow().find((i) => true).languageForm
        }
        if(languageFormValue === 'Duo'){
          if(this.getClientLanguagesByServices('sourceLanguage').length){
            // if(this.getClientLanguagesByServices('sourceLanguage').length === 1){
            this.$emit("setSourceLanguage",
              {symbol: this.getClientLanguagesByServices('sourceLanguage')[0].symbol }
            );
          }
        }else if(languageFormValue === 'Mono'){
          if(this.getClientLanguagesByServices('targetLanguages').length){
            // if(this.getClientLanguagesByServices('targetLanguages').length === 1){
            this.$emit("setTargets",
              {targets: this.getClientLanguagesByServices('targetLanguages')}
            );
          }
        }
    },
    async setDefaultService() {
      try {
        if (!this.services.length) {
          await this.getServices();
        }
      } catch (err) {
        this.alertToggle({
          message: "Error on getting services from DB",
          isShow: true,
          type: "error",
        });
      }
      if (this.services.length) {
        const service = this.clientsServicesForWorkflow().find((i) => true);
        this.service = service.title;
        const option = service.steps.length === 1 ? "1 Step" : "2 Steps";
        await this.setWorkflow({ option });
        this.storeDefaultService(service);
      }
      if(this.services.length){
        this.setStartedLanguages();
      }
    },
  },
  created() {
    this.setDefaultService();
  },
};
