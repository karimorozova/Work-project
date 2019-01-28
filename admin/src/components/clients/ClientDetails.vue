<template lang="pug">
.clients-wrap
    .clients-wrap__sidebar(v-if="sidebarShow")
        Sidebar(title="CLIENTS" :links="sidebarLinks" linkClass="client-details")
    router-view(
        :index="contactInd"
        :contactsPhotos="contactsPhotos"
        @contactSave="contactSave"
        @contactUpdate="contactUpdate"
        @approveDelete="approveContactDelete"
    )     
</template>

<script>
import Sidebar from '../Sidebar';
import { mapGetters, mapActions} from "vuex";

export default {
    data() {
        return {
            sidebarShow: true,
            sidebarLinks: ["General Information"],
            fromRoute: "/clients",
            contactsPhotos: []
        }
    },
    methods: {
        saveContactUpdates({index, contact}) {
            this.updateClientContact({index, contact});
        },
        async approveContactDelete({index}) {
            this.clientShow = true;
            this.contactShow = false;
            try {
                const contacts = this.updateLeadWhenDeleted(index);
                const result = await this.$http.post('/clientsapi/deleteContact', {id: this.currentClient._id, contacts})
                const {updatedClient} = result.body;
                await this.storeClient(updatedClient);
                await this.storeCurrentClient(updatedClient);
                this.$router.go(-1);
                this.alertToggle({message: "Contact has been deleted", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: "Internal server error on deleting contact", isShow: true, type: "error"});
            }
        },
        updateLeadWhenDeleted(index) {
            let contacts = this.currentClient.contacts.filter((item, ind) => ind !== index);
            const leadContact = contacts.find(item => item.leadContact);
            if(!leadContact) {
                contacts[0].leadContact = true;
            } 
            return contacts;
        },
        contactDetails({contactIndex}) {
            this.contactInd = contactIndex;
            this.$router.push({name: "contact"});
        },
        contactUpdate({index, file, contact}) {
            this.contactsPhotos.push(file);
            this.updateClientContact({index, contact});
            this.$router.go(-1);
        },
        contactSave({file, contact}) {
            this.contactsPhotos.push(file);
            this.storeClientContact(contact);
            let newContact = {...contact};  
            if(this.currentClient.contacts.length === 1) {
                newContact.leadContact = true;
            }
            this.updateClientContact({index: this.currentClient.contacts.length - 1, contact: newContact});
            this.$router.go(-1);
        },
        ...mapActions({
            alertToggle: "alertToggle",
            storeClient: "storeClient",
            storeCurrentClient: "storeCurrentClient",
            storeClientContact: "storeClientContact",
            updateClientContact: "updateClientContact",
        })
    },
    computed: {
        ...mapGetters({
            allClients: "getClients",
            currentClient: "getCurrentClient"
        })
    },
    components: {
        Sidebar
    },
    beforeRouteEnter (to, from, next) {
        next(vm => {
            vm.fromRoute = from.path;
        })
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.clients-wrap {
    position: relative;
    display: flex;
    width: 100%;
    min-height: 94vh;
}

</style>
