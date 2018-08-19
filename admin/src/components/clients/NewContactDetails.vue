<template lang="pug">
    .contact-wrap
        .title 
            span Contact Details
            .title__buttons
                input.button(type="button" value="Save" @click="contactSave")
                input.button(type="button" value="Cancel" @click="cancel")
                input.button(type="button" value="Delete" @click="deleteContact")
        .details
            .details__item
                .photo-wrap
                    input.photo-file(type="file" @change="previewPhoto")
                    .photo-text(v-if="!imageExist")
                        p upload your photo                          
                    img.photo-image(v-if="imageExist")    
                .names-gender
                    .names-gender__item
                        label Name:
                        input.personal(type="text" placeholder="Name" v-model="contact.name")
                    .names-gender__item
                        label Surname:
                        input.personal(type="text" placeholder="Surname" v-model="contact.surname")
                    .names-gender__item
                        label Email:
                        input.personal(type="text" placeholder="email" v-model="contact.email")
                    .names-gender__item
                        label Gender:
                        .dropSelect(v-click-outside="outGenders")
                            .select
                                template(v-if="contact.gender")
                                    .selected
                                        span {{ contact.gender }}
                                template(v-if="!contact.gender")
                                    span.selected.no-gender Gender
                                .arrowButton(@click="openGenders")
                                    img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseIcon: genderDropped}")
                            .drop(v-if="genderDropped")
                                .drop__item(@click="() => contact.gender = 'Male'")
                                    span Male
                                .drop__item(@click="() => contact.gender = 'Female'")
                                    span Female
            .details__item
                label Position:
                input.non-personal(type="text" placeholder="Position" v-model="contact.position")
            .details__item
                label Phone:
                input.non-personal(type="text" placeholder="Phone number" v-model="contact.phone")
            .details__item
                label Skype:
                input.non-personal(type="text" placeholder="Skype name" v-model="contact.skype")
            .details__item
                label Country:
                CountriesSelect(:countrySelected="contact.country" :countries="countries" @chosenCountry="chosenCountry")
            .details__item
                label Time Zone:
                TimezoneSelect(:timezoneSelected="contact.timezone" :timezones="timezones" @chosenZone="chosenZone")
            .details__item
                label Notes:
                textarea.non-personal(type="text" placeholder="Type" v-model="contact.notes")
        .delete-approve(v-if="approveShow")
            p Are you sure you want to delete?
            input.button.approve-block(type="button" value="Cancel" @click="cancelApprove")
            input.button(type="button" value="Delete")
</template>

<script>
import ClickOutside from "vue-click-outside";
import CountriesSelect from './CountriesSelect';
import TimezoneSelect from './TimezoneSelect';

export default {
    props: {
        client: {
            type: Object
        }
    },
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
                icons:[
                    {name: 'edit', active: true, icon: require('../../assets/images/Other/edit-icon-qa.png')},
                    {name: 'delete', active: true, icon: require('../../assets/images/Other/delete-icon-qa-form.png')}
                    ]
                ,
                photo: "",
                skype: "",
                position: "",
                notes: "",
                leadContact: false
            },
            countries: [],
            timezones: [],
            imageExist: false,
            genderDropped: false,
            approveShow: false
        }
    },
    methods: {
        previewPhoto() {
            let input = document.getElementsByClassName('photo-file')[0];
            if(input.files && input.files[0]) {
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
        cancel() {
            this.$emit('cancel');
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
        contactSave() {
            this.$emit('contactSave', this.contact)
        },
        getCountries() {
            this.$http.get('https://restcountries.eu/rest/v2/all')
            .then(res => {
                this.countries = res.body;
            })
            .catch(err => {
                console.log(err)
            })
        },
        getTimezones() {
            this.$http.get('/timezones')
            .then(res => {
                this.timezones = res.body;
            })
            .catch(err => {
                console.log(err)
            })
        }
    },
    computed: {
        
    },
    components: {
        CountriesSelect,
        TimezoneSelect
    },
    directives: {
        ClickOutside
    },
    mounted() {
        this.getCountries();
        this.getTimezones();
    }
}
</script>

<style lang="scss" scoped>

.contact-wrap {
    width: 1066px;
    font-size: 14px;
    position: relative;
    label {
        margin-bottom: 0;
    }
}

.title {
    font-size: 22px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    &__buttons {
        width: 474px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
}

.button {
    width: 138px;
    height: 33px;
    color: white;
    font-size: 14px;
    border-radius: 10px;
    -webkit-box-shadow: 0 3px 5px rgba(0,0,0,.4);
    box-shadow: 0 3px 5px rgba(0,0,0,.4);
    background-color: #ff876c;
    border: 1px solid #ff876c;
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
        }
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
}

.personal, .non-personal {
    width: 230px;
    height: 28px;
    padding: 0 5px;
    border: 1px solid #67573E;
    border-radius: 5px;
    outline: none;
}

.non-personal {
    width: 460px;
}

textarea.non-personal {
    height: 60px;
    resize: none;
    padding-top: 5px;
}

::-webkit-input-placeholder {
    opacity: 0.5;
}

.dropSelect {
    position: relative;
    .drop {
        position: absolute;
        width: 100%;
        border: 1px solid #BFB09D;
        max-height: 150px;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        background-color: white;
        z-index: 6;
        &__item {
            padding: 5px 2px;
            border-bottom: .5px solid #BFB09D;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.4s;
            &:last-child {
                border: none;
            }
            &:hover {
                background-color: rgba(191, 176, 157, 0.5);
            }
        }
        .chosen {
            background-color: rgba(191, 176, 157, 0.5);
        }
    }
}

.select {
    border: 1px solid #67573E;
    border-radius: 5px;
    width: 240px;
    height: 28px;
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    .selected {
        border-right: 1px solid #BFB09D;
        width: 84%;
        padding: 0 5px;
        font-size: 14px;
        max-height: 28px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        overflow: auto;
        position: relative;
    }
    .no-gender {
        opacity: 0.5;
    }
    .arrowButton {
        width: 18%;
        display: flex;
        justify-content: center;
        align-items: center;
        img {
            padding-right: 2px;
        }
        .reverseIcon {
            transform: rotate(180deg);
        }
    }
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
