<template lang="pug">
.footer
    .footer__content
        .footer__navbar
            Navbar
        .footer__legal
            a.footer__link(href="http://www.aboutcookies.org/" target="_blank") Use of Cookies
            p.footer__legal-maps
                a.footer__link(href="https://www.google.com/maps/place/Pangea+Localization+Services/@34.6831861,33.0312479,15z/data=!4m5!3m4!1s0x0:0xd80067655ceaa5df!8m2!3d34.6831861!4d33.0312479" target="_blank")
                    img.footer__legal-icon(src="../../assets/images/direction_icon.svg")
                |  Maximos Court A’, Arch. Leontiou A’ 254, 3020, Limassol office : +35725252150 
                | Reg. No. HE362046 ©{{ year }} Pangea Translation Services (Cyprus) LTD
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
    min-height: 145px;
    background-color: #66563d;
    color: #fff;
    text-align: center;
    display: block;
    width: 100%;
    font-size: 12px;
    font-weight: bold;
    line-height: 16px;
    font-family: FuturaStd, "Open Sans", sans-serif;
    &__content {
        margin: 0 auto;
        width: 600px;
        padding: 8px 0 15px 0;
        @media (max-width: 620px) {
            width: 310px;
        }
    }
    &__navbar {
        margin: 15px auto 30px;
    }
    &__link {
        color: #fff;
        margin-bottom: 5px;
    }
    &_font-14 {
        font-size: 14px;
    }
    &__legal {
        width: 580px;
        margin: 0 auto;
        font-weight: normal;
        font-size: 15px;
        text-align: left;
        line-height: 20px;
        margin-bottom: 80px;
        @media (max-width: 620px) {
            width: 310px;
            text-align: center;
            margin-bottom: 100px;
        }
    }
    &__legal-maps {
        align-items: center;
        margin-top: 8px;
        margin-bottom: 0;
        height: 20px;
        line-height: 20px;
    }
    &__legal-icon {
        width: 15;
        height: 18;
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
    }
}

</style>