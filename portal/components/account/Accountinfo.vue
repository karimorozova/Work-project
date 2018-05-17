<template lang="pug">
    .account
        .successModal(v-if="successShow")
            p.successModal__message Your information has been saved
        .account__header My account
        form.account__form(@submit.prevent="saveInfo")
            .companyDetails
                .companyDetails__title.blockTitle
                    span Company Details
                .companyDetails__details
                    .name
                        p Company Name
                        p {{ client.name }}
                    .web
                        p Website
                        p {{ client.contact.www }}
            .contactDetails
                .contactDetails__title.blockTitle
                    span Contact Details
                    .icon
                        img(src="../../assets/images/edit-brown.png" @click="editCred")
                .contactDetails__details
                    .contactDetails__details_image
                        .photo
                            .uploadButton(v-if="!readonly")
                                img(src="../../assets/images/edit-brown.png")
                    .contactDetails__details_credentials
                        .authData.credBlock
                            .name.item
                                label Name
                                input(type="text" :value="user.name" :readonly="readonly" :class="{focus: !readonly}")
                            .pass.item
                                label Password
                                input(placeholder="********" type="password" v-model="password" value="password" :readonly="readonly" :class="{focus: !readonly}")
                                span Change your password
                            .confirm.item
                                label Confirm your Password
                                input(placeholder="********" type="password" v-model="confirmPassword" value="confirmPassword" :readonly="readonly" :class="{focus: !readonly}")
                        .contactData.credBlock
                            .email.item
                                label Email
                                input(type="text" :value="user.email" :readonly="readonly" :class="{focus: !readonly}")
                            .phone.item
                                label Phone Number
                                input(type="text" :value="user.contact.phones[0]" :readonly="readonly" :class="{focus: !readonly}")
                            .skype.item
                                label Skype Name
                                input(type="text" :value="skypeContact" :readonly="readonly" :class="{focus: !readonly}")
                .contactDetails__buttons(v-if="!readonly")
                    input.button(type="submit" value="SAVE")
                    input.button(type="button" value="CANCEL" @click="cancelEdit")
</template>

<script>
export default {
    props: {
        client: {
            type: Object
        },
        user: {
            type: Object
        },
        projects : {
            type: Array
        },
        quotes: {
            type: Array
        }
    },
    data() {
        return {
            readonly: true,
            successShow: false,
            password: "",
            confirmPassword: ""
        }
    },
    methods: {
        editCred() {
            this.readonly = false;
        },
        cancelEdit() {
            this.readonly = true;
        },
        saveInfo() {
            this.readonly = true;
            this.successShow = true;
            setTimeout(() => {
                this.successShow = false;
            }, 3000)
        }
    },
    computed: {
        skypeContact() {
            var skype = "Not provided";
            if(this.user.contact.socialMediaContacts.length) {
                for(let i = 0; i < this.user.contact.socialMediaContacts.length; i++) {
                    if(this.user.contact.socialMediaContacts[i].socialMedia.name == "Skype") {
                        skype = this.user.contact.socialMediaContacts[i].contact
                    }
                }
                return skype
            } else {
                return skype
            }
        }
    }
}
</script>

<style lang="scss">
    .account {
        position: relative;
        width: 80%;
        color: #67573e;
        .successModal {
            position: absolute;
            width: 320px;
            height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
            top: 0;
            left: 50%;
            margin-left: -130px;
            background-color: #DEEFD8;
            color: #7CA47B;
            font-weight: 700;
            font-size: 20px;
        }
        &__header {
            padding: 20px 40px 0;
            font-size: 26px;
        }
        &__form {
            padding: 20px 40px;
            display: flex;
            flex-direction: column;
            .button {
                width: 180px;
                height: 43px;
                color: #fff;
                font-size: 15px;
                box-shadow: 0 5px 8px rgba(103, 87, 62, 0.5);
                background-color: #f5876e;
                border-radius: 18px;
                border: none;
                outline: none;
                cursor: pointer;
            }
            .blockTitle {
                font-size: 20px;
                border-bottom: 2px solid rgba(153, 142, 126, 0.5);
                padding-bottom: 10px;
                span {
                    padding-left: 20px;
                }
            }
            .companyDetails {
                margin-top: 20px;
                margin-bottom: 40px;
                &__details {
                    padding-top: 35px;
                    display: flex;
                    padding-left: 20px;
                    .name {
                        width: 50%;
                    }
                }
            }
            .contactDetails {
                &__title {
                    display: flex;
                    justify-content: space-between;
                    .icon {
                        padding-right: 20px;
                        cursor: pointer;
                    }
                }
                &__details {
                    display: flex;
                    flex-direction: column;
                    padding-top: 30px;
                    padding-right: 20px;
                    &_image {
                        padding-left: 20px;
                        display: flex;
                        align-items: center;
                        margin-bottom: 30px;
                        .photo {
                            position: relative;
                            margin-right: 20px;
                            width: 68px;
                            height: 68px;
                            border-radius: 50%;
                            box-shadow: 0 0 5px black;
                            .uploadButton {
                                position: absolute;
                                bottom: -5px;
                                right: -3px;
                                border: 0.5px solid rgba(153, 142, 126, 0.8);
                                border-radius: 50%;
                                background-color: white;
                                cursor: pointer;
                                img {
                                    padding: 6px 7px 3px;
                                    width: 16px;
                                    height: 16px;
                                }
                            }
                        }
                    }
                    &_credentials {
                        padding-left: 20px;
                        margin-bottom: 40px; 
                        width: 100%;
                        max-height: 250px;
                        display: flex;
                        justify-content: space-around;
                        .credBlock {
                            width: 270px;
                            .item {
                            display: flex;
                            flex-direction: column;
                            margin-bottom: 50px;
                            margin-right: 20px;
                                label {
                                    margin-bottom: 10px;
                                    font-size: 12px;
                                }
                                input {
                                    width: 253px;
                                    padding: 10px;
                                    border-radius: 18px;
                                    border: none;
                                    outline: none;
                                }
                                .focus {
                                    border: 2px solid rgba(153, 142, 126, 0.8);
                                }
                            }
                            .pass {
                                position: relative;
                                span {
                                    position: absolute;
                                    bottom: -16px;
                                    left: 9px;
                                    font-size: 12px;
                                    color: rgba(103, 87, 62, 0.38);
                                }
                            }   
                        }
                    }
                }
                &__buttons {
                    text-align: center;
                    margin-top: 20px;
                    .button {
                        &:first-child {
                            margin-right: 30px;
                        }
                    }
                }
            }
        }
    }
</style>
