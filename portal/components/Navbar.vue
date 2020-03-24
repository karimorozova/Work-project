<template lang="pug">
.navbar
    ul.navbar__list
        li.navbar__item(v-for="link in links")
            a.navbar__link(:href='link.url') {{ link.title }}
</template>

<script>
export default {
    data() {
        return {
            links:
            [
                {url: 'https://www.pangea.global', title: 'Home'},
                {url: 'https://www.pangea.global/careers', title: 'Careers'},
                {url: 'https://www.pangea.global/faq', title: 'FAQ'},
                {url: 'https://www.pangea.global/privacy-policy', title: 'Privacy Policy'},
                {url: 'https://www.pangea.global/wp-content/uploads/2019/11/Pangea-Terms-Conditions.pdf', title: 'Clients Terms & Conditions'},
                {url: 'https://www.pangea.global/blog', title: 'Blog'},
                {url: 'https://www.pangea.global/contact-us', title: 'Contact Us'}
            ]
        }
    }
}
</script>

<style lang="scss" scoped>
.navbar {
    padding: 0 10px;
    &__list {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        list-style: none;
        margin: 0;
        padding: 0;
    }
    &__item {
        margin: auto 20px auto 0;
        position: relative;
        padding: 5px 0 5px 0;
        flex-grow: 1;
        font-weight: bold;
        &::after {
            content: "";
            position: absolute;
            display: block;
            background-color: #fff;
            width: 2px;
            height: 19px;
            top: 2px;
            right: -12px;
        }
        &:last-child, &:nth-child(6) {
            &::after {
                display: none;
            }   
        }
        &:nth-child(3), 
        &:nth-child(4) {
            @media (max-width: 620px) {
                &::after {
                    display: none;
                }   
            }
        }
    }
    &__link {
        text-decoration: none;
        color: white;
        font-size: 17px;
        transition: color .2s;
        &:hover {
            color: #4BA5A5;
        }
    }
}
</style>
