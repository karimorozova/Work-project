<template lang="pug">
    .sales-info
        .lead-info
            label Lead Source:
            .lead-info__menu
                ClientLeadsourceSelect(:selectedLeadsource="leadsourceSelected" @chosenLeadsource="chosenLeadsource")
        .status-info
            label Sales comission status:
            .status-info__data    
                span Passed threshold
</template>

<script>
import ClientLeadsourceSelect from './ClientLeadsourceSelect';

export default {
    data() {
        return {
            leadsourceSelected: ""
        }
    },
    methods: {
        chosenLeadsource(data) {
            this.leadsourceSelected = data;
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
