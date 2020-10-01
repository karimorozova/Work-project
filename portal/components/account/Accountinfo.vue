<template lang="pug">
    .account
        .account__main
            CompanyDetails(:client="client")
            .contact-details
                .title Contact Details
                    img.title__icon(src="../../assets/images/edit-brown.png" @click="editCred")
                .contact-details__info
                    .contact-details__photo
                        .photo(v-if="!user.photo")
                            img.photo__image(v-if="imageExist")
                        .photo(v-else)
                            img.photo__image(:src="domain+user.photo")
                        .upload-button(v-if="!readonly")
                            input.upload-button__input(type="file" @change="previewPhoto")
                            img.upload-button__icon(src="../../assets/images/edit-brown.png")
                        .tip(v-if="!isFileError && !readonly") Maximum file size should be 2Mb (only png/jpg/jpeg types)
                        .file-error(v-if="isFileError && !readonly") Incorrect file type or size
                    .contact-details__data
                        .contact-details__data-item
                            .contact-details__name
                                DetailItem(label="First Name" :value="user.firstName" :isBorder="!readonly" @setValue="(e) => setValue(e, 'firstName')" :isShort="true")
                                DetailItem(label="Surname" :value="user.surname" :isBorder="!readonly" @setValue="(e) => setValue(e, 'surname')" :isShort="true")
                            DetailItem(label="Password" :value="password" :isBorder="!readonly" :isPassword="true" @setPassword="(e) => setValue(e, 'password')")
                            DetailItem(label="Confirm your Password" :value="confirmPassword" :isBorder="!readonly" :isPassword="true" @setPassword="(e) => setValue(e, 'confirmPassword')")
                        .contact-details__data-item
                            DetailItem(label="Email" :value="user.email" :isBorder="!readonly" @setValue="(e) => setValue(e, 'email')")
                            DetailItem(label="Phone Number" :value="user.phone" :isBorder="!readonly" @setValue="(e) => setValue(e, 'phone')")
                            DetailItem(label="Skype Name" :value="user.skype" :isBorder="!readonly" @setValue="(e) => setValue(e, 'skype')")
                .contact-details__buttons(v-if="!readonly")
                    .contact-details__button
                        Button(value="Save" @makeAction="checkErrors")
                    .contact-details__button
                        Button(value="Cancel" @makeAction="cancelEdit")
                ValidationErrors(v-if="areErrors" :errors="errors" @closeErrors="closeErrors" :isAbsolute="true")
</template>

<script>
import Button from "../buttons/Button";
import ValidationErrors from "../ValidationErrors";
import CompanyDetails from "./CompanyDetails";
import DetailItem from "./DetailItem";
import { mapActions } from "vuex";

export default {
    props: {
        client: {
            type: Object
        },
        user: {
            type: Object
        }
    },
    data() {
        return {
            errors: [],
            areErrors: false,
            photoFile: [],
            readonly: true,
            password: "",
            confirmPassword: "",
            email: "",
            firstName: "",
            phone: "",
            skype: "",
            imageExist: false,
            isFileError: false,
            domain: "",
        }
    },
    methods: {
        ...mapActions([
            "alertToggle",
            "saveAccountDetails"
        ]),
        previewPhoto() {
            let input = document.getElementsByClassName('upload-button__input')[0];
            if(this.checkFile(input.files)) {
                this.showPhoto(input);
            } else {
                this.showFileError(input);
            }
        },
        showPhoto(input) {
            this.photoFile = input.files;
            this.imageExist = true;
            let reader = new FileReader();
            reader.onload = (e) => {
                document.getElementsByClassName('photo__image')[0].src = e.target.result;
            }
            reader.readAsDataURL(input.files[0]);
        },
        showFileError(input) {
            this.isFileError = true;
            input.value = "";
            setTimeout(() => {
                this.isFileError = false;
            }, 5000)
        },
        checkFile(files) {
            if(files &&  files[0]) {
                const types = ['jpg', 'jpeg', 'png'];
                const type = files[0].name.split('.').pop();
                return types.indexOf(type.toLowerCase()) !== -1 && files[0].size <= 2000000;
            }
            return false;
        },
        editCred() {
            this.readonly = false;
            this.firstName = this.user.firstName;
            this.surname = this.user.surname;
            this.email = this.user.email;
            this.phone = this.user.phone;
            this.skype = this.user.skype;
        },
        cancelEdit() {
            this.readonly = true;
            this.photoFile = [];
            this.password = "";
            this.confirmPassword = "";
            this.email = "";
            this.firstName = "";
            this.surname = "";
            this.phone = "";
            this.skype = "";
            this.closeErrors();
        },
        setValue({value}, prop) {
            this[prop] = value;
        },
        closeErrors() {
            this.areErrors = false;
        },
        async checkErrors() {
            this.errors = [];
            const phoneReg = /^[1-9][0-9]*$/;
            const namesReg = /^[-\sa-zA-Z]+$/;
            if(!this.firstName || !namesReg.test(this.firstName)) this.errors.push("Enter a valid first name");
            if(this.surname && !namesReg.test(this.surname)) this.errors.push("Enter a valid surname");
            if(this.phone && !phoneReg.test(this.phone)) this.errors.push("Only number are allowed in Phone number field");
            if(this.password && !this.areEqualPasswords()) this.errors.push("The password and confirm password fields do not match");
            await this.checkEmail();
            if(this.errors.length) {
                return this.areErrors = true;
            }
            await this.saveInfo();
        },
        async checkEmail() {
            const emailReg = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            if(!this.email || !emailReg.test(this.email)) this.errors.push("Enter a valid email");
            try {
                const existingUser = await this.$axios.get(`/portal/unique-email?email=${this.email}`);
                if(this.email !== this.user.email && existingUser.data === "exist") this.errors.push("The entered email is already used in our system.")
            } catch(err) {
                this.alertToggle({message: "Error on checking email uniqueness", isShow: true, type: "error"});
            }
        },
        areEqualPasswords() {
            return this.password.trim() === this.confirmPassword.trim();
        },
        async saveInfo() {
            const data = {
                password: this.password,
                email: this.email,
                firstName: this.firstName,
                surname: this.surname,
                phone: this.phone,
                skype: this.skype,
                photo: this.photoFile[0]
            }
            await this.saveAccountDetails(data);
            this.cancelEdit();
        }
    },
    components: {
        Button,
        CompanyDetails,
        DetailItem,
        ValidationErrors
    },
    mounted() {
        this.domain = process.env.domain;
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.account {
    position: relative;
    width: 80%;
    color: #67573e;
    &__main {
        padding: 20px 40px;
        display: flex;
        flex-direction: column;
        max-width: 100%;
    }
}

.contact-details {
    position: relative;
    &__info {
        display: flex;
        flex-direction: column;
        padding-top: 30px;
        padding-right: 20px;
    }
    &__photo {
        padding-left: 20px;
        display: flex;
        align-items: center;
        margin-bottom: 30px;
        position: relative;
        width: 80px;
    }
    &__data {
        padding-left: 20px;
        margin-bottom: 40px;
        width: 100%;
        max-height: 250px;
        display: flex;
        justify-content: space-around;
    }
    &__data-item {
        width: 270px;
    }
    &__name {
        display: flex;
        justify-content: space-between;
        width: 100%;
        box-sizing: border-box;
    }
    &__buttons {
        display: flex;
        justify-content: center;
        margin-top: 50px;
    }
    &__button {
        margin: 0 20px;
    }
}

.photo {
    position: relative;
    width: 68px;
    height: 68px;
    border-radius: 50%;
    box-shadow: 0 0 5px black;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    &__image {
        max-height: 100%;
        max-width: 100%;
    }
}

.upload-button {
    display: flex;
    width: 30px;
    height: 30px;
    justify-content: center;
    align-items: center;
    position: absolute;
    bottom: -5px;
    right: 10px;
    border: 0.5px solid rgba(153, 142, 126, 0.8);
    border-radius: 50%;
    background-color: white;
    cursor: pointer;
    &__input {
        font-size: 0;
        opacity: 0;
        z-index: 10;
        height: 30px;
        position: absolute;
        cursor: pointer;
        width: 30px;
    }
}

.title {
    box-sizing: border-box;
    padding: 0 20px;
    font-size: 20px;
    border-bottom: 2px solid rgba(153, 142, 126, 0.5);
    padding-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    &__icon {
        cursor: pointer;
    }
}

.tip, .file-error {
    position: absolute;
    left: 100px;
    width: 200px;
    font-size: 14px;
}

.file-error {
    color: $red;
}

</style>
