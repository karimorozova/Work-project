<template lang="pug">
    .sales-info
        .lead-info
            label Lead Source:
            .lead-info__menu(:class="{'sales-info_error-shadow': !client.leadSource && isEmpty}")
                ClientLeadsourceSelect(:selectedLeadsource="client.leadSource" @chosenLeadsource="chosenLeadsource")
        .status-info
            label Sales comission status:
            .status-info__data    
                span {{ client.salesComission }}
</template>

<script>
import ClientLeadsourceSelect from './ClientLeadsourceSelect';

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
        ClientLeadsourceSelect
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
    label {
        margin-bottom: 0;
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
    }
    
}

</style>
