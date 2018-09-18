<template lang="pug">
.footer
    .footer__navbar
        .navbar-item
            ul.navbar-item__list
                li.navbar-item__li(v-for="link in linksArray.firstRow")
                    a.navbar-item__link(:href='link.link') {{ link.title }}
        .navbar-item
            ul.navbar-item__list
                li.navbar-item__li(v-for="link in linksArray.secondRow")
                    a.navbar-item__link(:href='link.link') {{ link.title }}
    .footer__legal
        p.footer__legal-text YIOTA COURT, Makariou III Ave. 134, 3021, Limassol
        p.footer__legal-text office : +35725252150
        p.footer__legal-text Reg. No. HE362046  VAT. No. 10362046H
        p.footer__legal-text © 2016 
            span.footer__legal-copywrite-text Pangea Translation Services (Cyprus) LTD
    .footer__social
        ul.footer__social-list
            li.footer__social-li(v-for="social in socialsArray")
                a.footer__social-link(:href="social.socialLink")
                    img.footer__social-image(:src="social.image")
</template>

<script>
export default {
    data() {
        return {
            linksArray: {
                firstRow:
                [
                    {link: 'https://www.pangea.global', title: 'Home'},
                    {link: 'https://www.pangea.global/career', title: 'Careers'},
                    {link: 'https://www.pangea.global/faq', title: 'FAQ'},
                    {link: 'https://www.pangea.global/privacy-policy', title: 'Privacy Policy'}
                ],
                secondRow: [
                    {link: 'https://www.pangea.global/contact', title: 'Contact Us'},
                    {link: 'https://www.pangea.global/blog', title: 'Blog'},
                    {link: 'https://www.pangea.global/rewards-program', title: 'Rewards Program'}
                ]
            },
            socialsArray: [
                {socialLink: 'https://www.facebook.com/PangeaLocalizationServices/', image: require('../assets/images/social/facebook.png')},
                {socialLink: 'https://www.linkedin.com/company/pangea-language-service', image: require('../assets/images/social/linkedin.png')},
                {socialLink: 'https://twitter.com/Pangea_Local', image: require('../assets/images/social/twitter.png')},
                {socialLink: 'https://plus.google.com/116520029165216678356', image: require('../assets/images/social/google +.png')},
                {socialLink: 'https://www.youtube.com/channel/UCKlcUH-8dbg7eZy-nZyDREw', image: require('../assets/images/social/youtube.png')},
                {socialLink: 'https://www.instagram.com/pangea_local/', image: require('../assets/images/social/instagram.png')},
                {socialLink: 'https://www.pinterest.com/pangealocalizat/', image: require('../assets/images/social/pinterest.png')}
            ]
        }
    }
}
</script>

<style lang="scss" scoped>

.footer {
    width: 100%;
    font-family: 'Open Sans';
    background-color: #665741;
    height: 218px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.footer__navbar {
    display: flex;
    justify-content: center;
    @media (max-width: 450px) {
        flex-direction: column;
        align-items: center;
        padding-top: 15px;
        padding-bottom: 15px;
    }
    .navbar-item {
        &__list {
            list-style: none;
            padding-left: 0;
            @media (max-width: 450px) {
                margin: 6px 0;
            } 
        }
        &__li {
            display: inline;
            padding: 0 4px;
            text-shadow: 0 3px 5px black;
            border-right: 1.5px solid #fff;
            font-size: 12px;
            &:first-child {
                @media (max-width: 450px) {
                    border-right: none;
                }
            }
            &:last-child {
                border-right: none;
            }
        }
        &__link {
            text-decoration: none;
            color: #fff;
            font-family: 'Open Sans';
            font-size: 15px;
            margin: 9px;
            @media (max-width: 768px) {
                font-size: 13px;
            }
        }
    }
}
.footer__legal {
    font-family: 'Open Sans';
    display: flex;
    flex-direction: column;
    align-items: center;
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

.footer__social {
    display: inline;
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin: 0 10px;
    &-list {
        padding-left: 0;
    }
    &-li {
        display: inline;
        list-style: none;
    }
    &-link {
        text-decoration: none;
    }
    &-image {
        margin: 5px;
        @media (max-width: 400px) {
            width: 31px;
        }
    }
}

</style>
