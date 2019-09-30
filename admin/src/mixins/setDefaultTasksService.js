import { mapActions } from "vuex";

export default {
    methods: {
        ...mapActions({
            getServices: "getServices",
            alertToggle: "alertToggle"
        }),
        async setDefaultService() {
            try {
                if(!this.services.length) {
                    await this.getServices();
                }
            } catch(err) {
                this.alertToggle({message: "Error on getting services from DB", isShow: true, type: "error"});
            }
            const service = this.services.find(item => {
                const serviceSymbol = this.currentProject.service ? this.currentProject.service.symbol : 'tr';
                return item.symbol === serviceSymbol;
            });
            this.service = service.title;
            this.storeDefaultService(service);
        },
    },
    created() {
        this.setDefaultService()
    }
}