<template lang="pug">
    .sales-info
        .lead-info
            label.lead-info__label.lead-info_relative Lead Source:
                Asterisk(:customStyle="{top: '-4px'}")
            .lead-info__menu(:class="{'sales-info_error-shadow': !client.leadSource && isEmpty}")
                ClientLeadsourceSelect(:selectedLeadsource="client.leadSource" @chosenLeadsource="chosenLeadsource")
        .status-info
            label.lead-info__label Sales comission status:
            .status-info__data    
                span {{ client.salesComission }}
</template>

<script>
import ClientLeadsourceSelect from './ClientLeadsourceSelect';
import Asterisk from "../Asterisk";

export default {
    props: {
        client: {
            type: Object
        },
        isEmpty: {
            type: Boolean
        }
    },
    data() {
        return {

        }
    },
    methods: {
        chosenLeadsource({leadSource}) {
            this.$emit("setLeadSource", { leadSource });
        }
    },
    components: {
        ClientLeadsourceSelect,
        Asterisk
    }
}
</script>

<style lang="scss" scoped>

.sales-info {
    width: 40%;
    font-size: 14px;
    display: flex;
    flex-direction: column;
    &_error-shadow {
        box-shadow: 0 0 5px red;
        border-radius: 5px;
    }
}

.lead-info, .status-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    &__label {
        margin-bottom: 0;
    }
    &_relative {
        position: relative;
    }
    &__data {
        display: flex;
        justify-content: flex-start;
        opacity: 0.4;
    }
}
.lead-info {
    margin-bottom: 30px;
    &__menu {
        display: flex;
        justify-content: flex-start;
        position: relative;
        width: 191px;
        height: 28px;
    }
    
}

</style>
