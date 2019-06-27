<template lang="pug">
    .service-type
        SectionTitle(text="SERVICE TYPE" number="1" isAsterisk)
        ServicesMenu(:selectedService="selectedService" @selectService="selectService")
</template>

<script>
import SectionTitle from "./SectionTitle";
import ServicesMenu from "./ServicesMenu";
import { mapActions } from "vuex";

export default {
    data() {
        return {
            selectedService: {title: "Select"}
        }
    },
    methods: {
        ...mapActions({
            setDetail: "setRequestQuoteDetail"
        }),
        selectService({service}) {
            this.selectedService = service;
            this.setDetail({prop: 'service', value: service});
            this.setDetail({prop: 'sourceLanguage', value: {lang: "Select"}});
            this.setDetail({prop: 'targetLanguages', value: []});
        }
    },
    components: {
        SectionTitle,
        ServicesMenu
    }    
}
</script>

<style lang="scss" scoped>

.service-type {
    margin-bottom: 30px;
}

</style>
