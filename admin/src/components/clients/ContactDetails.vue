<template lang="pug">
    .contact-wrap
        .contact-wrap__buttons
            .title
                span Contact Details
            .buttons
                input.button(type="button" value="Continue" @click="checkForErrors")
                input.button(type="button" value="Cancel" @click="cancel")
                input.button(type="button" value="Delete" @click="deleteContact")
        .details
            .details__item
                .photo-wrap(v-if="!contact.photo")
                    input.photo-file(type="file" @change="previewPhoto")
                    .photo-text(v-if="!imageExist")
                        p.photo-text__message(v-if="!isFileError") upload your photo
                            span.photo-extensions *.jpg/jpeg/png
                            span.photo-size <= 2MB
                    img.photo-image(v-if="imageExist")
                    p.photo-text__error-message(v-if="isFileError") Incorrect file type or size
                .photo-wrap(v-if="contact.photo")
                    input.photo-file(type="file" @change="previewPhoto")                       
                    img.photo-image(:src="contact.photo")   
                .names-gender
                    .names-gender__item
                        label.details_relative Name:
                            Asterisk
                        input.personal(type="text" placeholder="Name" v-model="contact.firstName" :class="{'contact-wrap_error-shadow': !contact.firstName && isSaveClicked}")
                    .names-gender__item
                        label Surname:
                        input.personal(type="text" placeholder="Surname" v-model="contact.surname")
                    .names-gender__item
                        label.details_relative Email:
                            Asterisk
                        input.personal(type="text" placeholder="email" v-model="contact.email" :class="{'contact-wrap_error-shadow': !contact.email && !isEmailValid}")
                    .names-gender__item
                        label Gender:
                        .names-gender__drop-menu
                            SelectSingle(
                                :options="genders"
                                :selectedOption="contact.gender"
                                placeholder="Gender"
                                @chooseOption="setGender"
                            )
            .details__item.details_no-space
                label Lead Contact:
                input.check(type="checkbox" v-model="contact.leadContact")
            .details__item
                label.details_relative Position:
                    Asterisk
                input.non-personal(type="text" placeholder="Position" v-model="contact.position" :class="{'contact-wrap_error-shadow': !contact.position && isSaveClicked}")
            .details__item
                label Phone:
                input.non-personal(type="text" placeholder="Phone number" :value="contact.phone" @input="setPhone" ref="phone")
            .details__item
                label WhatsApp:
                input.non-personal(type="text" placeholder="WhatsApp" v-model="contact.whatsApp")
            .details__item
                label Skype:
                input.non-personal(type="text" placeholder="Skype name" v-model="contact.skype")
            .details__item
                label LinkedIn:
                input.non-personal(type="text" placeholder="LinkedIn" v-model="contact.linkedIn")
            .details__item
                label Country:
                .details__drop-menu
                    CountriesSelect(:countrySelected="contact.country" @chosenCountry="chosenCountry")
            .details__item
                label Time Zone:
                .details__drop-menu
                    TimezoneSelect(:timezoneSelected="contact.timezone" @chosenZone="chosenZone")
            .details__item
                label Notes:
                textarea.non-personal(type="text" placeholder="Type" v-model="contact.notes")
        .delete-approve(v-if="approveShow")
            p Are you sure you want to delete?
            input.button.approve-block(type="button" value="Cancel" @click="cancelApprove")
            input.button(type="button" value="Delete" @click="approveDelete")
        ValidationErrors(v-if="areErrorsExist"
            :errors="errors"
            @closeErrors="closeErrorsBlock"
        )
</template>

<script>
import ValidationErrors from "../ValidationErrors";
import Asterisk from "../Asterisk";
import SelectSingle from "../SelectSingle";
import ClickOutside from "vue-click-outside";
import CountriesSelect from './CountriesSelect';
import TimezoneSelect from './TimezoneSelect';
import { mapGetters } from 'vuex';
import photoPreview from '@/mixins/photoPreview';

export default {
    mixins: [photoPreview],
    props: {
        index: {
            type: [Number, String]
        },
        newClient: {
            type: Object
        },
        isNewClient: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            countries: [],
            timezones: [],
            imageExist: false,
            approveShow: false,
            photoFile: [],
            contact: {},
            areErrorsExist: false,
            errors: [],
            isSaveClicked: false,
            genders: ["Male", "Female"],
            fromRoute: "",
            oldEmail: "",
            isFileError: false
        }
    },
    methods: {
        
        openGenders() {
            this.genderDropped = !this.genderDropped;
        },
        outGenders() {
            this.genderDropped = false;
        },
        setGender({option}) {
            this.contact.gender = option;
        },
        cancel() {
            this.$router.push({path: this.fromRoute});
        },
        cancelApprove() {
            this.approveShow = false;
        },
        deleteContact() {
            this.approveShow = true;            
        },
        approveDelete() {
            this.$emit('approveDelete', {index: this.index});
        },
        chosenCountry(data) {
            this.countrySelected = data;
            this.contact.country = data;
        },
        chosenZone(data) {
            this.timezoneSelected = data;
            this.contact.timezone = data;
        },
        checkInNewCLient() {
            const { contacts } = this.newClient;
            const sameEmail = contacts.find((item, index) => {
                return this.index !== index && item.email === this.contact.email
            })
            if(sameEmail) this.errors.push("The email you entered is already used.")
        },
        setPhone(e) {
            const { value } = e.target;
            const regex = /^[0-9]+$/;
            const characters = value.split("").filter(item => regex.test(item));
            const clearedValue = characters.join("");
            this.contact.phone = clearedValue.length > 19 ? clearedValue.slice(0, 19) : clearedValue;
            this.$refs.phone.value = this.contact.phone;
        },
        async checkEmailUniquenes() {
            if(this.oldEmail === this.contact.email) return;
            if(this.isNewClient) {
                return checkInNewCLient();
            }
            try {
                const result = await this.$http.get(`/clientsapi/unique-email?email=${this.contact.email}`);
                if(result.body === "exist") {
                    this.errors.push("The email you entered is already used in our system.")
                }
            } catch(err) {

            }
        },
        async checkForErrors() {
            this.errors = [];
            const emailValidReg = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            const textReg = /^[-\sa-zA-Z]+$/;
            if(!this.contact.firstName || !textReg.test(this.contact.firstName)) this.errors.push("Please, enter valid contact's first name.");
            if(!this.contact.position || !textReg.test(this.contact.position)) this.errors.push("Please, enter valid contact's position.");
            if(this.contact.surname && !textReg.test(this.contact.surname)) this.errors.push("Please, enter valid contact's surname.");
            if(!this.contact.email || !emailValidReg.test(this.contact.email)) this.errors.push("Please, enter valid e-mail address.");
            if(this.contact.email && emailValidReg.test(this.contact.email)) {
                await this.checkEmailUniquenes();
            }
            if(this.errors.length) {
                this.areErrorsExist = true;
                this.isSaveClicked = true;
                return
            }
            this.contactUpdate();
        },
        contactUpdate() {
            this.$emit('contactUpdate', {file: this.photoFile[0], index: this.index, contact: this.contact})
        },
        getContact() {
            const index = this.index || this.$route.params.index;
            if(!this.isNewClient) {
                this.contact = {...this.currentClient.contacts[index]};
            } else {
                this.contact = {...this.newClient.contacts[index]};
            }
            this.oldEmail = this.contact.email;
        },
        closeErrorsBlock() {
            this.areErrorsExist = false;
        },
    },
    computed: {
        ...mapGetters({
            currentClient: "getCurrentClient"
        }),
         isEmailValid() {
            if(this.isSaveClicked) {
                let regex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                return regex.test(this.contact.email);
            }
            return true
        }
    },
    mounted() {
        this.getContact();
    },
    components: {
        CountriesSelect,
        TimezoneSelect,
        ValidationErrors,
        Asterisk,
        SelectSingle
    },
    directives: {
        ClickOutside
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

.contact-wrap {
    position: relative;
    width: 700px;

    label {
        margin-bottom: 0;
    }
    &__buttons {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 20px;

    }
    &_error-shadow {
        box-shadow: 0 0 5px $red;
    }
}

.title {
    font-size: 22px;
}

.button {
    min-width: 120px;
    padding: 0 24px 0 24px;
    height: 34px;
    color: $white;
    font-size: 14px;
    border-radius: 7px;
    background-color: $orange;
    border: none;
    transition: .1s ease;
    outline: none;
    letter-spacing: 0.2px;
    margin-left: 10px;

    &:hover {
      cursor: pointer;
      box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
    }

    &:active {
      transform: scale(.98);
    }
}

.details {
    box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    display: flex;
    flex-direction: column;
    padding: 20px;
    &__item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        &:first-child {
            margin-bottom: 35px;
        }
        &:last-child {
            margin-bottom: 0;
        }
        .photo-wrap {
            width: 180px;
            height: 157px;
            border: 1px solid #67573E;
            position: relative;
            overflow: hidden;
            display: flex;
            justify-content: center;
            display: flex;
            justify-content: center;
            align-items: center;
            .photo-image {
                max-width: 100%;
                max-height: 100%;
            }
        }
    }
    &__drop-menu {
        position: relative;
        width: 470px;
        height: 28px;
    }
    &_no-space {
        justify-content: flex-start;
    }
    &_relative {
        position: relative;
    }
}

.photo-file {
    position: absolute;
    top: -25px;
    left: -65px;
    height: 180px;
    background-color: transparent;
    outline: none;
    border: none;
    z-index: 5;
    cursor: pointer;
}

.photo-text {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    &__message {
        font-size: 18px;
        opacity: 0.5;
        width: 50%;
        text-align: center;
    }
    &__error-message {
        position: absolute;
        bottom: 30%;
        z-index: 10;
        background-color: $white;
        padding: 3px;
        box-sizing: border-box;
        color: $orange;
    }
}

.photo-extensions, .photo-size {
    display: block;
    font-size: 12px;
    margin-top: 10px;
}

.names-gender {
    width: 55%;
    display: flex;
    flex-direction: column;
    &__item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        &:last-child {
            margin-bottom: 0;
        }
    }
    &__drop-menu {
        position: relative;
        width: 240px;
        height: 28px;
    }
}

.check {
    height: 18px;
    width: 18px;
    margin-left: 20px;
    cursor: pointer;
}

.personal, .non-personal {
    box-sizing: border-box;
    width: 240px;
    height: 28px;
    padding: 0 5px;
    border: 1px solid #67573E;
    border-radius: 5px;
    outline: none;
}

.non-personal {
    width: 470px;
}

textarea.non-personal {
    height: 60px;
    resize: none;
    padding-top: 5px;
    color: #67573E;
}

::-webkit-input-placeholder {
    opacity: 0.5;
}

.delete-approve {
    position: absolute;
    width: 332px;
    height: 270px;
    top: 20%;
    left: 50%;
    margin-left: -166px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-shadow: 0 0 10px #67573E;
    background-color: #FFF;
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

input {
    color: #67573E;
}

</style>
