<template lang="pug">
.project-details
    .project-details__project-id {{ project.projectId }}
    .project-details__status
        LabelValue(label="Project Status")
            .project-details__drop-menu
                SelectSingle(
                    :selectedOption="project.status"
                    :options="statuses"
                    @chooseOption="setStatus"
                )
    .project-details__additional
        .project-details__item(v-for="obj of additional")
            input.project-details__check(type="checkbox" v-model="obj.check")
            span.project-details__option {{ obj.title }}
    .project-details__contacts
        .project-details__contact-title Client Contact
        .project-details__contact-info(v-for="(contact, index) in selectedContacts")
            .project-details__contact-name {{ contact.firstName }} {{ contact.surname }}
            .project-details__contact-icons
                .project-details__icon(@click="removeContact(index)" v-if="index")
                    span.project-details__remove remove
                .project-details__icon
                    i.fa.fa-info-circle
                .project-details__icon
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
import SelectSingle from "../SelectSingle";
import LabelValue from "./LabelValue";
import PersonSelect from "./PersonSelect";

export default {
    props: {
        project: {
            type: Object
        }
    },
    data() {
        return {
            statuses: ["Draft", "Quote sent", "Started", "Closed", "Cancelled", "Requested", "Rejected"],
            additional: {
                urgent: {check: false, title: "Urgent"},
                autoDelivery: {check: false, title: "Auto Delivery"},
                acceptedStart: {check: false, title: "Start when accepted"},
                invoice: {check: false, title: "Invoice"}
            },
            selectedContact: "",
            selectedContacts: []
        }
    },
    methods: {
        setStatus({option}) {
            this.$emit('setStatus', {option: option})
        },
        setDefaultContact() {
            this.selectedContacts.push({
                firstName: this.project.customer.contactName,
                surname: "",
                email: this.project.customer.email
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
        }
    },
    computed: {
        selectedPerson() {
            return this.selectedContact ? this.selectedContact.firstName + " " + this.selectedContact.surname
            : "";
        }
    },
    components: {
        SelectSingle,
        LabelValue,
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
    box-shadow: 0 3px 20px rgba(104, 87, 62, 0.5);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
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
