<template lang="pug">
.footer
    .footer__navbar
        Navbar
    .footer__legal
        .footer__item
            a.footer__cookies(href="http://www.aboutcookies.org/" target="_blank") Use cookies
            p.footer__legal-text YIOTA COURT, Makariou III Ave. 134, 3021, Limassol
            p.footer__legal-text office : +35725252150
            p.footer__legal-text Reg. No. HE362046  VAT. No. 10362046H
            p.footer__legal-text © 2016 
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
        &:first-child {
            @media (max-width: 450px) {
                margin-bottom: 15px;
                text-align: center;
            }            
        }
    }
    &__cookies {
        color: #fff;
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
    }
    &-text {
        color: #fff;
        font-size: 12px;
        margin-top: 0.5px;
        margin-bottom: 0.5px;
    }
    &-copywrite-text {
        font-weight: bold;
    }
}

</style>
