<template lang="pug">
    .contact-details
        SectionTitle(text="CONTACT DETAILS" number="5")
        .contact-details__main
            .contact-details__left
                .contact-details__item
                    LabelValue(title="Name" customClass="pair_column-flex quote-item" labelClass="label_required")
                        input.contact-details__input(type="text" pattern="^[A-Za-z -]+$" @input="(e) => setValue(e, 'contactName')")
                .contact-details__item
                    LabelValue(title="Email" customClass="pair_column-flex quote-item" labelClass="label_required")
                        input.contact-details__input(type="text" @input="(e) => setValue(e, 'contactEmail')")
                .contact-details__item
                    LabelValue(title="Phone Number" customClass="pair_column-flex quote-item" labelClass="label_required")
                        input.contact-details__input(type="text" pattern="^[0-9]+$" ref="phone" @input="(e) => setValue(e, 'phone')")
            .contact-details__right
                .contact-details__item
                    LabelValue(title="Company Name" customClass="pair_column-flex quote-item" labelClass="label_required")
                        input.contact-details__input(type="text" @input="(e) => setValue(e, 'companyName')")
                .contact-details__item
                    LabelValue(title="Website" customClass="pair_column-flex quote-item")
                        input.contact-details__input(type="text" 
                            pattern="^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$" 
                            @input="(e) => setValue(e, 'web')")
                .contact-details__item
                    LabelValue(title="Skype Name" customClass="pair_column-flex quote-item")
                        input.contact-details__input(type="text" @input="(e) => setValue(e, 'skype')")
</template>

<script>
import SectionTitle from "./SectionTitle";
import LabelValue from "@/components/LabelValue";
import { mapActions } from "vuex";

export default {
    methods: {
        ...mapActions({
            setDetail: "setRequestQuoteDetail"
        }),
        setValue(e, prop) {
            const { value } = e.target;
            if(prop === 'phone') {
                return this.setPhone(value);
            }
            this.setDetail({prop, value});
        },
        setPhone(value) {
            const regex = /^[0-9]+$/;
            const characters = value.split("").filter(item => regex.test(item));
            const clearedValue = characters.join("");
            const phoneValue = clearedValue.length > 19 ? clearedValue.slice(0, 19) : clearedValue;
            this.$refs.phone.value = phoneValue;
            this.setDetail({prop: 'phone', value: phoneValue});
        }
    },
    components: {
        LabelValue,
        SectionTitle
    }    
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.contact-details {
    &__main {
        display: flex;
        justify-content: space-between;
        @media (max-width: 540px) {
            display: block;
        }
    }
    &__left, &__right {
        width: 40%;
        box-sizing: border-box;
        padding: 0 10px;
        @media (max-width: 680px) {
            width: 70%;
        }
        @media (max-width: 540px) {
            width: 100%;
        }
    }
    &__item {
        width: 100%;
    }
    &__input {
        width: 100%;
        box-sizing: border-box;
        padding: 10px 5px;
        border: 1px solid $main-color;
        border-radius: 10px;
        outline: none;
        margin: 5px 0 20px 0;
        &:focus {
            box-shadow: 0 0 5px $light-brown;
        }
    }
}

</style>
