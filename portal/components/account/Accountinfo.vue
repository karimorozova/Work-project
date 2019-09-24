<template lang="pug">
    .account
        form.account__form(@submit.prevent="saveInfo")
            .company-details
                .company-details__title.block-title
                    span Company Details
                .company-details__details
                    .name
                        p.name__title Company Name
                        p {{ client.name }}
                    .web
                        p.name__title Website
                        p {{ client.website }}
            .contact-details
                .contact-details__title.block-title
                    span Contact Details
                    .icon
                        img(src="../../assets/images/edit-brown.png" @click="editCred")
                .contact-details__details
                    .contact-details__details_image
                        .photo
                            .upload-button(v-if="!readonly")
                                img(src="../../assets/images/edit-brown.png")
                    .contact-details__details_credentials
                        .auth-data.cred-block
                            .name.item
                                label Name
                                input(type="text" :value="user.firstName" :readonly="readonly" :class="{focus: !readonly}")
                            .pass.item
                                label Password
                                input(placeholder="********" type="password" v-model="password" :readonly="readonly" :class="{focus: !readonly}")
                                span Change your password
                            .confirm.item
                                label Confirm your Password
                                input(placeholder="********" type="password" v-model="confirmPassword" :readonly="readonly" :class="{focus: !readonly}")
                        .contact-data.cred-block
                            .email.item
                                label Email
                                input(type="text" :value="user.email" :readonly="readonly" :class="{focus: !readonly}")
                            .phone.item
                                label Phone Number
                                input(type="text" :value="user.phone" :readonly="readonly" :class="{focus: !readonly}")
                            .skype.item
                                label Skype Name
                                input(type="text" :value="user.skype" :readonly="readonly" :class="{focus: !readonly}")
                .contact-details__buttons(v-if="!readonly")
                    .contact-details__button
                        Button(value="Save" @makeAction="saveInfo")
                    .contact-details__button
                        Button(value="Cancel" @makeAction="cancelEdit")
</template>

<script>
import Button from "../buttons/Button"
import { mapActions } from "vuex";

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
            password: "",
            confirmPassword: "",
        }
    },
    methods: {
        ...mapActions([
            "alertToggle"
        ]),
        editCred() {
            this.readonly = false;
        },
        cancelEdit() {
            this.readonly = true;
        },
        async saveInfo() {
            if(this.password.trim() !== this.confirmPassword.trim()) {
                return this.alertToggle({message: "The password and confirm password fields do not match.", isShow: true, type: "error"});
            }
            this.readonly = true;
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
    },
    components: {
        Button
    }
}
</script>

<style lang="scss" scoped>

.account {
    position: relative;
    width: 80%;
    color: #67573e;
    &__header {
        padding: 20px 0 0 80px;
        font-size: 21px;
        .arrows {
            font-size: 18px;
            padding: 0 5px;
            opacity: 0.5;
        }
    }
    &__form {
        padding: 20px 40px;
        display: flex;
        flex-direction: column;
        max-width: 100%;
        .block-title {
            font-size: 20px;
            border-bottom: 2px solid rgba(153, 142, 126, 0.5);
            padding-bottom: 10px;
            span {
                padding-left: 20px;
            }
        }
        .company-details {
            margin-top: 20px;
            margin-bottom: 40px;
            &__details {
                padding-top: 35px;
                display: flex;
                padding-left: 20px;
                display: flex;
                justify-content: space-around;
                
                .name {
                    width: 270px;
                    &__title {
                        font-size: 12px;
                    }
                }
                .web {
                    width: 270px;
                }
            }
        }
        .contact-details {
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
                        .upload-button {
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
                    .cred-block {
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
                display: flex;
                justify-content: center;
                margin-top: 50px;
            }
            &__button {
                margin: 0 20px;
            }
        }
    }
}

</style>
