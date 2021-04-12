<template lang="pug">
.clients-wrap
    router-view(
        :index="contactInd"
        :contactsPhotos="contactsPhotos"
        :contractFiles="contractFiles"
        :ndaFiles="ndaFiles"
        @loadFile="loadFile"
        @contactSave="contactSave"
        @contactUpdate="contactUpdate"
        @approveDelete="approveContactDelete"
    )     
</template>

<script>
import { mapGetters, mapActions} from "vuex";

export default {
    data() {
        return {
            fromRoute: "/clients",
            contactsPhotos: [],
            contractFiles: [],
            ndaFiles: []
        }
    },
    methods: {
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
        contactUpdate({index, file, contact}) {
            this.contactsPhotos.push(file);
            this.updateClientContact({index, contact});
            this.$router.go(-1);
        },
        contactSave({file, contact}) {
            this.contactsPhotos.push(file);
            this.storeClientContactOverAll(contact);
            // let newContact = {...contact};
            // if(this.currentClient.contacts.length === 1) {
            //     newContact.leadContact = true;
            // }
            // this.updateClientContact({index: this.currentClient.contacts.length - 1, contact: newContact});
            this.$router.go(-1);
        },
        loadFile({files, prop}) {
            this[prop] = [...files];
        },
        ...mapActions({
            alertToggle: "alertToggle",
            storeClient: "storeClient",
            storeCurrentClient: "storeCurrentClient",
            storeClientContact: "storeClientContact",
            updateClientContact: "updateClientContact",
	          storeClientContactOverAll: "storeClientContactOverAll"
        })
    },
    computed: {
        ...mapGetters({
            allClients: "getClients",
            currentClient: "getCurrentClient"
        })
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
    min-height: 95vh;
}

</style>
