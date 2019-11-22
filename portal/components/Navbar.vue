<template lang="pug">
.navbar
    .navbar__block
        .navbar__list
            .navbar__item(v-for="link in linksArray.firstRow" :class="{'no-border': link.title === 'Package Prices & Rewards Program'}")
                a.navbar__link(:href='link.url') {{ link.title }}
    .navbar__block.navbar_margin-bottom-20
        .navbar__list
            .navbar__item(v-for="link in linksArray.secondRow" :class="{'no-border': link.title === 'Contact Us'}")
                a.navbar__link(:href='link.url') {{ link.title }}    
</template>

<script>
export default {
    data() {
        return {
            linksArray: {
                firstRow:
                [
                    {url: 'https://www.pangea.global', title: 'Home'},
                    {url: 'https://www.pangea.global/careers', title: 'Careers'},                    
                    {url: 'https://www.pangea.global/wp-content/uploads/2019/11/Pangea-Terms-Conditions.pdf', title: 'Clients Terms & Conditions'},
                    {url: 'https://www.pangea.global/package-prices-rewards-program/', title: 'Package Prices & Rewards Program'}
                ],
                secondRow: [
                    {url: 'https://www.pangea.global/faq', title: 'FAQ'},
                    {url: 'https://www.pangea.global/privacy-policy', title: 'Privacy Policy'},
                    {url: 'https://www.pangea.global/blog', title: 'Blog'},
                    {url: 'https://www.pangea.global/contact-us', title: 'Contact Us'}
                ]
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.navbar {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    flex-wrap: wrap;
    @media (max-width: 580px) {
        flex-direction: column;
        align-items: center;
        padding-top: 15px;
        padding-bottom: 15px;
    }
    &__block {
        max-width: 700px;
    }
    &__list {
        margin-top: 10px;
        padding-left: 0; 
        @media (max-width: 450px) {
            margin: 0;
            box-sizing: border-box;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
        }
        .no-border {
            border-right: none;
        }
        .no-border-mobile {
            @media (max-width: 450px) {
                border-right: none;
            }
        }
    }
    &__item {
        display: inline;
        padding: 0 4px;
        text-shadow: 0 3px 5px black;
        border-right: 1.5px solid #fff;
        font-size: 12px;
        margin: 10px 0;
        @media (max-width: 450px) {
            margin: 5px 0;
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
    &_margin-bottom-20 {
        margin-bottom: 20px;
        @media (max-width: 450px) {
            margin-bottom: 0;
        }
    }
}
</style>
