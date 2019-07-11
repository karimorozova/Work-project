<template lang="pug">
.project-details
    .project-details__project-id {{ project.projectId }}
    .project-details__status Project Status:
        span.project-details__text {{ project.status }}
    .project-details__additional
        .project-details__item(v-for="(obj, key) in additional")
            input.project-details__check(type="checkbox" v-model="project[key]" @change="toggleCheck(key)")
            span.project-details__option {{ obj.title }}
    .project-details__contacts
        .project-details__contact-title Client Contact
        .project-details__contact-info(v-for="(contact, index) in selectedContacts")
            .project-details__contact-name {{ contact.firstName }} {{ contact.surname }}
            .project-details__contact-icons
                .project-details__icon(@click="removeContact(index)" v-if="selectedContacts.length > 1")
                    span.project-details__remove remove
                .project-details__icon
                    i.fa.fa-info-circle
                .project-details__icon(@click="sendEmailToContact(index)")
                    i.fa.fa-envelope
                .project-details__icon
                    i.fa.fa-skype
    .project-details__add-contact
        .project-details__drop-menu
            PersonSelect(
                :persons="project.customer.contacts"
                :selectedPerson="selectedPerson"
                @setPerson="addContact"
            )

</template>

<script>
import PersonSelect from "./PersonSelect";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        project: {
            type: Object
        }
    },
    data() {
        return {
            additional: {
                isUrgent: {title: "Urgent"},
                isAutoDelivery: {title: "Auto Delivery"},
                isStartAccepted: {title: "Start when accepted"},
                isInvoice: {title: "Invoice"}
            },
            selectedContact: "",
            selectedContacts: []
        }
    },
    methods: {
        toggleCheck(key) {
            this.$emit('toggleCheck', { key });
        },
        setDefaultContact() {
            const contact = this.project.customer.contacts.find(item => item.leadContact); 
            this.selectedContacts.push({
                firstName: contact.firstName,
                surname: contact.surname,
                email: contact.email
            })
        },
        addContact({person}) {
            this.selectedContact = person;
            const index = this.selectedContacts.findIndex(item => item.email === person.email);
            if(index === -1) {
                this.selectedContacts.push(person);
            }
        },
        removeContact(index) {
            if(this.selectedContacts.length !== 1) {
                this.selectedContacts.splice(index, 1);
            }
        },
        async sendEmailToContact(index) {
            const contact = this.selectedContacts[index];
            try {
                await this.$http.post("/pm-manage/contact-mailing", { projectId: this.project._id, contact });
                this.alertToggle({message: "Email has been sent", isShow: true, type: "success"})
            } catch(err) {
                this.alertToggle({message: "Internal server error / Cannot send email", isShow: true, type: "error"})
            }
        },
        ...mapActions({
            alertToggle: "alertToggle"
        })
    },
    computed: {
        selectedPerson() {
            return this.selectedContact ? this.selectedContact.firstName + " " + this.selectedContact.surname
            : "";
        }
    },
    components: {
        PersonSelect
    },
    mounted() {
        this.setDefaultContact();
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.project-details {
    box-sizing: border-box;
    width: 20%;
    margin-top: 20px;
    padding: 10px 20px;
    box-shadow: 0 3px 20px $brown-shadow;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    @media (max-width: 1600px) {
        width: 23%;
    }
    &__project-id {
        font-size: 26px;
        display: flex;
        justify-content: center;
        margin-bottom: 15px;
        align-self: center;
    }
    &__status {
        width: 100%;
        margin-bottom: 15px;
    }
    &__text {
        margin-left: 5px;
        font-weight: 700;
    }
    &__contacts {
        width: 100%;
    }
    &__contact-title {
        font-weight: 700;
        font-size: 20px;
        border-bottom: 1px solid $brown-border;
    }
    &__contact-info {
        padding-top: 5px;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    &__contact-icons {
        display: flex;
    }
    &__drop-menu {
        position: relative;
        height: 28px;
        width: 191px;
    }
    &__additional {
        margin-bottom: 15px;
    }
    &__item {
        display: flex;
        align-items: center;
        margin-bottom: 2px;
    }
    &__option {
        margin-left: 5px;
    }
    &__add-contact {
        margin-top: 10px;
    }
    &__icon {
        margin-left: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 28px;
        i {
            font-size: 22px;
            padding-bottom: 2px;
            cursor: pointer;
        }
        &:first-child {
            margin-left: 0;
        }
    }
    &__remove {
        border: 1px solid $brown-border;
        border-radius: 8px;
        padding: 2px 5px;
        background-color: $white;
        color: $main-color;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 12px;
        margin-right: 10px;
        &:hover {
            background-color: $main-color;
            color: $white;
        }
    }
}
</style>
