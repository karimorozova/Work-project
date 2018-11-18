<template lang="pug">
    .contacts-info
        .contacts-info__add-contact
            input.add-button(type="button" value="Add new contact" @click="addContact")
        .contacts-info__table
            DataTable(
                :fields="fields"
                :tableData="client.contacts"
                @onRowClicked="showContactDetails"
            )
                template(slot="headerName" slot-scope="{ field }")
                    span.contacts-info__header-title {{ field.label }}
                template(slot="headerEmail" slot-scope="{ field }")
                    span.contacts-info__header-title {{ field.label }}
                template(slot="headerPosition" slot-scope="{ field }")
                    span.contacts-info__header-title {{ field.label }}
                template(slot="headerNotes" slot-scope="{ field }")
                    span.contacts-info__header-title {{ field.label }}
                template(slot="headerLead" slot-scope="{ field }")
                    span.contacts-info__header-title {{ field.label }}
                template(slot="headerIcons" slot-scope="{ field }")
                    span.contacts-info__header-title {{ field.label }}
                template(slot="name" slot-scope="{ row }")
                    .contacts-info__data-cell {{ getFullName(row) }}
                template(slot="email" slot-scope="{ row, index }")
                    .contacts-info__active(v-if="currentEditingIndex === index")
                        input.contacts-info__input(type="text" v-model="currentEmail")
                    .contacts-info__data-cell(v-else) {{ row.email }}
                template(slot="position" slot-scope="{ row, index }")
                    .contacts-info__active(v-if="currentEditingIndex === index")
                        input.contacts-info__input(type="text" v-model="currentPosition")
                    .contacts-info__data-cell(v-else) {{ row.position }}
                template(slot="notes" slot-scope="{ row, index }")
                    .contacts-info__active(v-if="currentEditingIndex === index")
                        input.contacts-info__input(type="text" v-model="currentNotes")
                    .contacts-info__data-cell(v-else) {{ row.notes }}
                template(slot="lead" slot-scope="{ row, index }")
                    .contacts-info__radio
                        CustomRadio(:isChecked="row.leadContact" @toggleRadio="setLeadContact(index)")
                template(slot="icons" slot-scope="{ row, index }")
                    .contacts-info__icons
                        img.contacts-info__icon(v-for="(icon, key) in icons" :src="icon.icon" @click.stop="makeAction(index, key)" :class="{'contacts-info_opacity': isIconClass(index, key)}")
        .contacts-info__error(v-if="isErrorShow")
            .contacts-info__error-message
                p Please finish the current edition first!
                span.clients-table__close(@click="closeErrorMessage") +
        .contacts-info__delete-approve(v-if="isDeleteMessageShow")
            p Are you sure you want to delete?
            Button.contacts-info__button(value="Cancel" @clicked="cancelDelete")
            Button.contacts-info__button(value="Delete" @clicked="approveDelete")
        .contacts-info__cancel-edition(v-if="currentEditingIndex !== -1" @click="cancelEdition") Cancel edition
        .contacts-info__valid-errors(v-if="areErrorsExist")
            .contacts-info__messages
                .contacts-info__errors-title Errors:
                li.contacts-info__valid-error(v-for="error in errors") {{ error }}
                span.contacts-info__close(@click="closeValidErrorsBlock") +
</template>

<script>
import DataTable from "../DataTable";
import CustomRadio from "../CustomRadio";
import Button from "../Button";
import { mapGetters, mapActions } from 'vuex';

export default {
    props: {
        client: {
            type: Object
        }
    },
    data() {
        return {
            fields: [
                {label: "Full Name", headerKey: "headerName", key: "name", width: "17%", padding: "0"},
                {label: "Email", headerKey: "headerEmail", key: "email", width: "16%", padding: "0"},
                {label: "Position", headerKey: "headerPosition", key: "position", width: "20%", padding: "0"},
                {label: "Notes", headerKey: "headerNotes", key: "notes", width: "21%", padding: "0"},
                {label: "Lead Contact", headerKey: "headerLead", key: "lead", width: "12%", padding: "0"},
                {label: "", headerKey: "headerIcons", key: "icons", width: "14%", padding: "0"}
            ],
            icons: {
                save: {name: 'save', active: false, icon: require('../../assets/images/Other/save-icon-qa-form.png')},
                edit: {name: 'edit', active: true, icon: require('../../assets/images/Other/edit-icon-qa.png')},
                delete: {name: 'delete', active: true, icon: require('../../assets/images/Other/delete-icon-qa-form.png')}
            },
            currentEditingIndex: -1,
            isErrorShow: false,
            isDeleteMessageShow: false,
            currentEmail: "",
            currentPosition: "",
            currentNotes: "",
            deletingContactIndex: -1,
            areErrorsExist: false,
            errors: []
        }
    },
    methods: {
        cancelDelete() {
            this.isDeleteMessageShow = false;
        },
        cancelEdition() {
            this.setCurrentDefaults();
        },
        closeErrorMessage() {
            this.isErrorShow = false;
        },
        closeValidErrorsBlock() {
            this.areErrorsExist = false;
        },
        approveDelete() {
            this.$emit('approveDelete', { index: this.deletingContactIndex });
            this.isDeleteMessageShow = false;
        },
        isIconClass(index, key) {
            if(this.currentEditingIndex !== index) {
                return key === 'save';
            }
            if(this.currentEditingIndex === index) {
                return key === 'edit'
            }
        },
        setCurrentEditionValues(index) {
            this.currentEditingIndex = index;
            this.currentEmail = this.client.contacts[index].email;
            this.currentPosition = this.client.contacts[index].position;
            this.currentNotes = this.client.contacts[index].notes;
        },
        setCurrentDefaults() {
            this.currentEditingIndex = -1;
            this.currentEmail = "";
            this.currentPosition = "";
            this.currentNotes = "";
        },
        makeAction(index, key) {
            if(this.currentEditingIndex !== -1 && this.currentEditingIndex !== index) {
                return this.isErrorShow = true;
            }
            if(key === 'edit') {
                this.setCurrentEditionValues(index);
            }
            if(key === 'save') {
                this.checkForValidation(index);
            }
            if(key === 'delete') {
                this.deletingContactIndex = index;
                this.isDeleteMessageShow = true;
            }
        },
        checkForValidation(index) {
            this.errors = [];
            const emailValidReg = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            if(!this.currentPosition) this.errors.push("Please, enter contact's position.");
            if(!this.currentEmail || !emailValidReg.test(this.currentEmail)) this.errors.push("Please, enter valid e-mail address.");
            if(this.errors.length) {
                this.areErrorsExist = true;
                return
            }
            this.saveContactUpdates(index);
        },
        saveContactUpdates(index) {
            const contact = {
                ...this.client.contacts[index],
                email: this.currentEmail,
                position: this.currentPosition,
                notes: this.currentNotes
            }
            this.$emit("saveContactUpdates", { index, contact });
            this.setCurrentDefaults();
        },
        getFullName(contact) {
            return `${contact.firstName} ${contact.surname}`;
        },
        showContactDetails({index}) {
            if(this.currentEditingIndex === index) { 
                return
            }
            this.$emit('contactDetails', {contactIndex: index});
        },
        addContact() {
            this.$emit('newContact');
        },
        setLeadContact(index) {
            this.$emit("setLeadContact", { index });
        }
    },
    components: {
        DataTable,
        CustomRadio,
        Button
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.contacts-info {
    font-size: 14px;
    font-weight: normal;
    border: none;
    outline: none;
    margin: 2px;
    padding: 3px 0 3px 5px;
    position: relative;
    &_opacity {
        opacity: 0.5;
    }
    &__data-cell {
        padding: 5px 0 5px 3px;
    }
    &__radio {
        display: flex;
        justify-content: center;
        padding-top: 5px 
    }
    &__icons {
        padding-top: 3px;
        margin-right: 18px;
        display: flex;
        justify-content: space-around;
        align-items: center;
    }
    &__icon {
        cursor: pointer;
    }
    &__active {
        padding: 5px 0 5px 3px;
        box-shadow: inset 0 0 5px $brown-shadow;
        box-sizing: border-box;
    }
    &__input {
        width: 100%;
        border: none;
        outline: none;
        color: $main-color;
        padding: 0 2px;
        background-color: transparent;
    }
    &__add-contact {
        display: flex;
        width: 100%;
        margin-bottom: 15px;
        justify-content: flex-end;
    }
    &__error {
        position: absolute;
        border: 1px solid $orange;
        background-color: $white;
        box-shadow: 0 0 15px $orange;
        width: 300px;
        top: 50%;
        left: 50%;
        margin-left: -150px;
        padding: 0 15px;
        z-index: 50;
        display: flex;
        align-items: center;
    }
    &__error-message {
        position: relative;
        width: 100%;
        height: 100%;
        font-weight: bolder;
        font-size: 14px;
    }
    &__close {
        position: absolute;
        font-size: 24px;
        font-weight: 700;
        top: -2px;
        right: -9px;
        transform: rotate(45deg);
        cursor: pointer;
    }
    &__delete-approve {
        position: absolute;
        width: 332px;
        height: 270px;
        top: 10%;
        left: 50%;
        margin-left: -166px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        box-shadow: 0 0 10px $main-color;
        background-color: $white;
        z-index: 20;
        p {
            font-size: 21px;
            width: 50%;
            text-align: center;
        }
        .approve-block {
            margin-bottom: 15px;
        }
    }
    &__button {
        margin-bottom: 5px;
    }
    &__cancel-edition {
        cursor: pointer;
        position: absolute;
        right: -100px;
        top: 45%;
        padding: 5px;
        border: 1px solid $orange;
        border-radius: 8px;
        color: $orange;
        font-weight: 700;
        z-index: 10;
        background-color: $white;
    }
    &__valid-errors {
        position: absolute;
        top: -25px;
        left: 50%;
        margin-left: -170px;
        width: 300px;
        padding: 15px;
        box-shadow: 0 0 10px $brown-shadow;
        background-color: $white;
        z-index: 50;
    }
    &__errors-title {
        font-size: 18px;
        text-align: center;
        margin-bottom: 10px; 
    }
    &__messages {
        position: relative;
    }
    &__valid-error {
        color: $orange;
        font-size: 16px;
        font-weight: 600;
    }
    &__close {
        transform: rotate(45deg);
        position: absolute;
        top: -12px;
        right: -8px;
        font-size: 24px;
        font-weight: 700;
        cursor: pointer;
    }
}

.editing {
    box-shadow: inset 0 0 8px $brown-shadow;
}

.add-button {
    width: 190px;
    height: 26px;
    color: $white;
    font-size: 14px;
    border-radius: 10px;
    box-shadow: 0 3px 5px $brown-shadow;
    background-color: $orange;
    border: 1px solid $orange;
    cursor: pointer;
}

input {
    color: $main-color;
}

</style>
