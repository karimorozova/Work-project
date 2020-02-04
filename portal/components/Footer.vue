<template lang="pug">
.footer
    .footer__navbar
        Navbar
    .footer__legal
        .footer__item
            a.footer__link.footer_font-14(href="http://www.aboutcookies.org/" target="_blank") Use cookies
            p.footer__legal-maps
                a.footer__link(href="https://www.google.com/maps/place/Pangea+Localization+Services/@34.6831861,33.0312479,15z/data=!4m5!3m4!1s0x0:0xd80067655ceaa5df!8m2!3d34.6831861!4d33.0312479" target="_blank")
                    img.footer__legal-icon(src="../assets/images/direction_icon.svg")
                span.footer__legal-text Maximos Court A’, Arch. Leontiou A’ 254, 3020, Limassol
            p.footer__legal-text office : +35725252150
            p.footer__legal-text Reg. No. HE362046  VAT. No. 10362046H
            p.footer__legal-text © {{ year }} 
                span.footer__legal-copywrite-text Pangea Translation Services (Cyprus) LTD
        .footer__item
            img(border="0" src="https://twb.translationcenter.org/workspace/display-badge/index/id/61931/Volunteer_Translator.jpg" alt="English to French & English to Arabic & English to Chinese volunteer translator")
    SocialIcons
    .footer__privacy-text *Pangea Translation Services LTD (CY) respects your privacy and are committed to protecting your personal data. 
        | This is to inform you that your personal data will be used, namely for the purposes of the professional performance of our services 
        | only and to stated that Pangea Translation Services LTD (CY) operates under the General Data Protection Regulation ((EU) 2016/679) (GDPR) and the local data protection law.
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
    box-sizing: border-box;
    padding-bottom: 15px;
    &__item {
        &:first-child {
            @media (max-width: 450px) {
                margin-bottom: 15px;
                text-align: center;
            }            
        }
    }
    &__link {
        color: #fff;
    }
    &_font-14 {
        font-size: 14px;
    }
    &__legal {
        width: 600px;
        font-family: 'Open Sans';
        display: flex;
        justify-content: space-between;
        align-items: center;
        @media (max-width: 620px) {
            flex-direction: column;
            width: 100%;
            .footer__item {
                &:last-child {
                    margin-top: 5px;
                }
            }
        }
    }
    &__legal-maps {
        display: flex;
        align-items: center;
        margin-top: 8px;
        margin-bottom: 0;
        height: 20px;
    }
    &__legal-text {
        color: #fff;
        font-size: 12px;
        margin: 5px 0;
    }
    &__legal-copywrite-text {
        font-weight: bold;
    }
    &__privacy-text {
        color: #fff;
        font-size: 10px;
        max-width: 600px;
        text-align: justify;
        line-height: normal;
        @media (max-width: 620px) {
            max-width: 310px;
        }
    }
}

</style>
