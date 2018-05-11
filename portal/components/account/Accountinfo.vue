<template lang="pug">
    .account
        form.account__form
            .companyDetails
                .companyDetails__title.blockTitle
                    span Company Details
                .companyDetails__details
                    .name
                        p Company Name
                        p Mary Jones ltd.
                    .web
                        p Website
                        p www.maryjones.com
            .contactDetails
                .contactDetails__title.blockTitle
                    span Contact Details
                    .icon
                        img(src="../../assets/images/edit-brown.png" @click="editCred")
                .contactDetails__details
                    .contactDetails__details_image
                        .photo
                        input.button(type="button" value="Change Image")
                    .contactDetails__details_credentials
                        .authData.credBlock
                            .name.item
                                label Name
                                input(type="text" value="Mary Jones" :readonly="readonly" :class="{focus: !readonly}")
                            .pass.item
                                label Password
                                input(type="password" value="12345678" :readonly="readonly" :class="{focus: !readonly}")
                            .confirm.item
                                label Confirm your Password
                                input(type="password" value="12345678" :readonly="readonly" :class="{focus: !readonly}")
                        .contactData.credBlock
                            .email.item
                                label Email
                                input(type="text" value="mary.j@gmail.com" :readonly="readonly" :class="{focus: !readonly}")
                            .phone.item
                                label Phone Number
                                input(type="text" value="+357 2464646" :readonly="readonly" :class="{focus: !readonly}")
                            .skype.item
                                label Skype Name
                                input(type="text" value="mary.j" :readonly="readonly" :class="{focus: !readonly}")
                .contactDetails__buttons
                    input.button(type="submit" value="SAVE")
                    input.button(type="button" value="CANCEL" @click="cancelEdit")
</template>

<script>
export default {
    data() {
        return {
            readonly: true,
        }
    },
    methods: {
        editCred() {
            this.readonly = false;
        },
        cancelEdit() {
            this.readonly = true;
        }
    }
}
</script>

<style lang="scss">
    .account {
        width: 80%;
        &__form {
            color: #67573e;
            padding: 20px;
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
                            margin-right: 20px;
                            width: 68px;
                            height: 68px;
                            border-radius: 50%;
                            box-shadow: 0 0 5px black;
                        }
                    }
                    &_credentials {
                        padding-left: 20px;
                        margin-bottom: 40px; 
                        width: 100%;
                        max-height: 250px;
                        display: flex;
                        justify-content: space-between;
                        .credBlock {
                            width: 47%;
                            .item {
                            display: flex;
                            flex-direction: column;
                            margin-bottom: 40px;
                            margin-right: 20px;
                                label {
                                    margin-bottom: 10px;
                                }
                                input {
                                    padding: 10px;
                                    border-radius: 18px;
                                    border: none;
                                    outline: none;
                                }
                                .focus {
                                    border: 2px solid rgba(153, 142, 126, 0.8);
                                }
                            }   
                        }
                    }
                }
                &__buttons {
                    text-align: center;
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
