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
                return item.symbol === 'tr'
            });
            this.service = service.title;
            if(this.isNeedToStoreService) {
                this.storeDefaultService(service);
            }
        }
    },
    created() {
        this.setDefaultService()
    }
}