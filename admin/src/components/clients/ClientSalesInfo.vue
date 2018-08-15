<template lang="pug">
    .sales-info
        .lead-info
            label Lead Source:
            .lead-info__menu
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
        }
    },
    data() {
        return {

        }
    },
    methods: {
        chosenLeadsource(data) {
            this.client.leadSource = data;
        }
    },
    components: {
        ClientLeadsourceSelect
    }
}
</script>

<style lang="scss" scoped>

.sales-info {
    font-size: 14px;
    display: flex;
    flex-direction: column;
}

.lead-info, .status-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 280px;
    label {
        margin-bottom: 0;
    }
    &__data {
        display: flex;
        justify-content: flex-start;
        width: 40%;
        opacity: 0.4;
    }
}
.lead-info {
    margin-bottom: 30px;
    &__menu {
        display: flex;
        justify-content: flex-start;
        width: 40%;
    }
    
}

</style>
