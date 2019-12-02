export default {
    data() {
        return {
            isNewVendorForm: false
        }
    },
    methods: {
        showNewVendorForm() {
            this.isNewVendorForm = true;
        },
        closeForm() {
            this.isNewVendorForm = false;
        },
        async saveVendor({industriesData, name, language}) {
            try {
                await this.$http.post("/reportsapi/new-xtrf-vendor", { industriesData, name, language });
                await this.getReport();
                this.alertToggle({message: "Saved", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: "Error on saving new vendor data", isShow: true, type: "error"});
            } finally {
                this.closeForm();
            }
        }
    }
}