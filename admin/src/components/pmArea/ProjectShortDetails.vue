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
        .project-details__contact-name(v-for="contact in selectedContacts") {{ contact.firstName }} {{ contact.surname }}
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
            statuses: ["Accepted", "Draft", "Open", "Ready"],
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
            const index = this.selectedContacts.findIndex(item => {
                return item.email === person.email
            })
            if(index === -1) {
                this.selectedContacts.push(person);
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
    &__contact-title {
        font-weight: 700;
        font-size: 20px;
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
}
</style>
