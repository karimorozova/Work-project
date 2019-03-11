<template lang="pug">
.navbar
    .navbar__block
        ul.navbar__list
            li.navbar__item(v-for="link in linksArray.firstRow" :class="{'no-border-mobile': link.title === 'Privacy Policy'}")
                a.navbar__link(:href='link.url') {{ link.title }}
    .navbar__block
        ul.navbar__list
            li.navbar__item(v-for="link in linksArray.secondRow" :class="{'no-border': link.title === 'Rewards Program'}")
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
                    {url: 'https://www.pangea.global/career', title: 'Careers'},
                    {url: 'https://www.pangea.global/faq', title: 'FAQ'},
                    {url: 'https://www.pangea.global/privacy-policy', title: 'Privacy Policy'}
                ],
                secondRow: [
                    {url: 'https://www.pangea.global/contact', title: 'Contact Us'},
                    {url: 'https://www.pangea.global/blog', title: 'Blog'},
                    {url: 'https://www.pangea.global/rewards-program', title: 'Rewards Program'}
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
    @media (max-width: 450px) {
        flex-direction: column;
        align-items: center;
        padding-top: 15px;
        padding-bottom: 15px;
    }
    &__list {
        list-style: none;
        padding-left: 0;
        @media (max-width: 450px) {
            margin: 6px 0;
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
</style>
