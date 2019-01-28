<template lang="pug">
    .contact-wrap
        .contact-wrap__buttons
            input.button(type="button" value="Save" @click="checkForErrors")
            input.button(type="button" value="Cancel" @click="cancel")
        .title 
            span Contact Details
        .details
            .details__item
                .photo-wrap(v-if="!contact.photo")
                    input.photo-file(type="file" @change="previewPhoto")
                    .photo-text(v-if="!imageExist")
                        p upload your photo                          
                    img.photo-image(v-if="imageExist")
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
                input.non-personal(type="text" placeholder="Phone number" v-model="contact.phone")
            .details__item
                label Skype:
                input.non-personal(type="text" placeholder="Skype name" v-model="contact.skype")
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
            input.button(type="button" value="Delete")
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

export default {
    data() {
        return {
            contact: {
                country: "",
                timezone: "",
                name: "",
                surname: "",
                email: "",
                gender: "",
                phone: "",
                photo: "",
                skype: "",
                position: "",
                notes: "",
                leadContact: false
            },
            imageExist: false,
            areErrorsExist: false,
            genderDropped: false,
            approveShow: false,
            photoFile: [],
            errors: [],
            isSaveClicked: false,
            genders: ["Male", "Female"],
            fromRoute: ""
        }
    },
    methods: {
        previewPhoto() {
            let input = document.getElementsByClassName('photo-file')[0];
            if(input.files && input.files[0]) {
                this.contact.file = input.files[0].name;
                this.photoFile = input.files;
                this.imageExist = true;
                let reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementsByClassName('photo-image')[0].src = e.target.result;
                }
                reader.readAsDataURL(input.files[0]);
            }
        },
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
        chosenCountry(data) {
            this.countrySelected = data;
            this.contact.country = data;
        },
        chosenZone(data) {
            this.timezoneSelected = data;
            this.contact.timezone = data;
        },
        checkForErrors() {
            this.errors = [];
            const emailValidReg = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            if(!this.contact.firstName) this.errors.push("Please, enter contact's first name.");
            if(!this.contact.position) this.errors.push("Please, enter contact's position.");
            if(!this.contact.email || !emailValidReg.test(this.contact.email)) this.errors.push("Please, enter valid e-mail address.");
            if(this.errors.length) {
                this.areErrorsExist = true;
                this.isSaveClicked = true;
                return
            }
            this.contactSave();
        },
        contactSave() {
            this.$emit('contactSave', {contact: this.contact, file: this.photoFile[0]})
        },
        closeErrorsBlock() {
            this.areErrorsExist = false;
        },
    },
    computed: {
        isEmailValid() {
            if(this.isSaveClicked) {
                let regex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                return regex.test(this.contact.email);
            }
            return true
        }
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
    font-size: 14px;
    position: relative;
    padding: 40px;
    label {
        margin-bottom: 0;
    }
    &__buttons {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-left: 10px;
        width: 900px;
    }
    &_error-shadow {
        box-shadow: 0 0 5px $red;
    }
}

.title {
    font-size: 22px;
}

.button {
    width: 138px;
    margin-left: 30px;
    height: 33px;
    color: white;
    font-size: 14px;
    border-radius: 10px;
    -webkit-box-shadow: 0 3px 5px rgba(0,0,0,.4);
    box-shadow: 0 3px 5px rgba(0,0,0,.4);
    background-color: #D15F45;
    border: 1px solid #D15F45;
    cursor: pointer;
    outline: none;
}

.details {
    margin: 40px auto;
    box-shadow: 0 0 15px rgba(103, 87, 62, 0.5);
    max-width: 570px;
    display: flex;
    flex-direction: column;
    padding: 40px;
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
            .photo-image {
                max-height: 100%;
                max-width: 100%;
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
    left: -100px;
    height: 180px;
    background-color: transparent;
    outline: none;
    border: none;
    z-index: 5;
}

.photo-text {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    p {
        font-size: 18px;
        opacity: 0.5;
        width: 50%;
        text-align: center;
    }
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
