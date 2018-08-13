<template lang="pug">
    .contact-wrap
        .title 
            span Contact Details
            .title__buttons
                input.button(type="button" value="Save")
                input.button(type="button" value="Cancel" @click="cancel")
                input.button(type="button" value="Delete")
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
                        input.personal(type="text" placeholder="Name")
                    .names-gender__item
                        label Surname:
                        input.personal(type="text" placeholder="Surname")
                    .names-gender__item
                        label Email:
                        input.personal(type="text" placeholder="email")
                    .names-gender__item
                        label Gender:
                        .dropSelect(v-click-outside="outGenders")
                            .select
                                template(v-if="genderSelected")
                                    .selected
                                        span {{ genderSelected }}
                                template(v-if="!genderSelected")
                                    span.selected.no-gender Gender
                                .arrowButton(@click="openGenders")
                                    img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseIcon: genderDropped}")
                            .drop(v-if="genderDropped")
                                .drop__item(@click="() => genderSelected = 'Male'")
                                    span Male
                                .drop__item(@click="() => genderSelected = 'Female'")
                                    span Female
            .details__item
                label Position:
                input.non-personal(type="text" placeholder="Position")
            .details__item
                label Phone:
                input.non-personal(type="text" placeholder="Phone number")
            .details__item
                label Skype:
                input.non-personal(type="text" placeholder="Skype name")
            .details__item
                label Country:
                .dropSelect(v-click-outside="outCountries")
                    .select.country-select
                        template(v-if="countrySelected")
                            .selected
                                span {{ countrySelected }}
                        template(v-if="!countrySelected")
                            span.selected.no-gender Country
                        .arrowButton(@click="openCountries")
                            img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseIcon: countriesDropped}")
                    .search-country(v-if="countriesDropped")
                        input.search(type="text" v-model="countrySearch" placeholder="Search")
                    .drop(v-if="countriesDropped")
                        .drop__item.country-name(v-for="(country, ind) in foundCountries" @click="chooseCountry(ind)")
                            span {{ country.name }}
            .details__item
                label Time Zone:
                input.non-personal(type="text")
            .details__item
                label Notes:
                textarea.non-personal(type="text" placeholder="Type")
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
    props: {
        countries: {
            type: Array
        }
    },
    data() {
        return {
            imageExist: false,
            genderDropped: false,
            genderSelected: "",
            countrySelected: "",
            countriesDropped: false,
            countrySearch: ""
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
        chooseCountry(ind) {
            this.countrySelected = this.foundCountries[ind].name;
        },
        openCountries() {
            this.countriesDropped = !this.countriesDropped;
        },
        outCountries() {
            this.countriesDropped = false;
        }
    },
    computed: {
        foundCountries() {
            let result = this.countries;
            if(this.countrySearch) {
                result = result.filter(item => {
                    if(item.name.toLowerCase().indexOf(this.countrySearch.toLowerCase()) != -1) {
                        return item
                    }
                })
            }
            return result;
        }
    },
    directives: {
        ClickOutside
    },
    mounted() {
        
    }
}
</script>

<style lang="scss" scoped>

.contact-wrap {
    width: 1066px;
    font-size: 14px;
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
    .search-country {
        position: absolute;
        width: 100%;
        border: 1px solid #BFB09D;
        z-index: 10;
        .search {
            width: 99%;
            outline: none;
            border: none;
            padding: 5px 2px;
        }
    }
    .drop {
        margin-top: 27px;
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

.country-select {
    width: 470px;
    .selected {
        width: 91%;
    }
    .arrowButton {
        width: 9%;
    }
}

</style>
