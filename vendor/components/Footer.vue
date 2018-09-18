<template lang="pug">
.footer
    Navbar
    .footer__legal
        p.footer__legal-text YIOTA COURT, Makariou III Ave. 134, 3021, Limassol
        p.footer__legal-text office : +35725252150
        p.footer__legal-text Reg. No. HE362046  VAT. No. 10362046H
        p.footer__legal-text © 2016 
            span.footer__legal-copywrite-text Pangea Translation Services (Cyprus) LTD
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
    height: 218px;
    display: flex;
    flex-direction: column;
    justify-content: center;
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

</style>
