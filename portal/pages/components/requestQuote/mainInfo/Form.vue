<template lang="pug">
    .form-wrapper
        form.main-form(ref="myForm" @submit.prevent="checkData")
            ServiceType
            Languages
            Industries
            ProjectDetails
            ContactDetails
            Captcha
            .main-form__submit
                Submit
</template>

<script>
import ServiceType from "./ServiceType";
import Languages from "./Languages";
import Industries from "./Industries";
import ProjectDetails from "./ProjectDetails";
import ContactDetails from "./ContactDetails";
import Captcha from "./Captcha";
import Submit from "@/components/buttons/Submit";

export default {
    data() {
        return {
            errors: []
        }
    },
    methods: {
        async checkData() {
            this.$emit("checkData")            
        }
    },
    components: {
        ServiceType,
        Languages,
        Industries,
        ProjectDetails,
        ContactDetails,
        Captcha,
        Submit
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.main-form {
    color: $main-color;
    width: 100%;
    max-width: 740px;
    padding: 40px;
    box-sizing: border-box;
    position: relative;
    box-shadow: 0 0 5px $deep-brown;
    border-radius: 15px;
    margin-bottom: 40px;
    &__submit {
        text-align: center;
        margin-top: 15px;
    }
    @media (max-width: 450px) {
        padding: 10px 15px 20px 30px;
    }
}

</style>
