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
        this.setWorkflow({ option });
        this.storeDefaultService(service);
      }
    },
  },
  created() {
    this.setDefaultService();
  },
};
