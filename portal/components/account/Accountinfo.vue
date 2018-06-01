<template lang="pug">
    .account
        .successModal(v-if="successShow")
            p.successModal__message Your information has been saved
        form.account__form(@submit.prevent="saveInfo")
            .companyDetails
                .companyDetails__title.blockTitle
                    span Company Details
                .companyDetails__details
                    .name
                        p.name__title Company Name
                        p {{ client.name }}
                    .web
                        p.name__title Website
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
            confirmPassword: "",
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
    },
    computed: {
       
    }
}
</script>

<style lang="scss" src="../../assets/styles/account/accountinfo.scss" scoped>
// @import "../../assets/styles/account/accountinfo.scss";

</style>
