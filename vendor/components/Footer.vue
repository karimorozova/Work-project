<template lang="pug">
.footer
    .footer__navbar
        Navbar
    .footer__legal
        .footer__item
            a.footer__link.footer_font-14(href="http://www.aboutcookies.org/" target="_blank") Use cookies
            p.footer__legal-text
                a.footer__link(href="https://www.google.com/maps/place/Pangea+Localization+Services/@34.6831861,33.0312479,15z/data=!4m5!3m4!1s0x0:0xd80067655ceaa5df!8m2!3d34.6831861!4d33.0312479" target="_blank") Maximos Court A’, Arch. Leontiou A’ 254, 3020, Limassol
            p.footer__legal-text office : +35725252150
            p.footer__legal-text Reg. No. HE362046  VAT. No. 10362046H
            p.footer__legal-text © {{ year }} 
                span.footer__legal-copywrite-text Pangea Translation Services (Cyprus) LTD
        .footer__item
            img(border="0" src="https://twb.translationcenter.org/workspace/display-badge/index/id/61931/Volunteer_Translator.jpg" alt="English to French & English to Arabic & English to Chinese volunteer translator")
    SocialIcons
</template>

<script>
import Navbar from './Navbar';
import SocialIcons from './SocialIcons';

export default {
    data() {
        return {
            year: new Date().getFullYear()
        }
    },
    components: {
        Navbar,
        SocialIcons
    }
}
</script>

<style lang="scss" scoped>

.footer {
    width: 100%;
    font-family: 'Open Sans';
    background-color: #665741;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    &__item {
        font-family: 'Open Sans';
        &:first-child {
            @media (max-width: 450px) {
                margin-bottom: 15px;
                text-align: center;
            }            
        }
    }
    &__link {
        color: #fff;
        font-family: 'Open Sans';
    }
    &_font-14 {
        font-size: 14px;
    }
}

.footer__legal {
    width: 600px;
    font-family: 'Open Sans';
    display: flex;
    justify-content: space-between;
    align-items: center;
    @media (max-width: 450px) {
        flex-direction: column;
        width: 100%;
    }
    &-text {
        color: #fff;
        font-size: 12px;
        margin-top: 0.5px;
        margin-bottom: 0.5px;
        font-family: 'Open Sans';
    }
    &-copywrite-text {
        font-weight: bold;
        font-family: 'Open Sans';
    }
}

</style>
