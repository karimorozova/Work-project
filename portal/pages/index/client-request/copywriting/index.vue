<template lang="pug">
    .copywriting    
        FormWrapper
            RequestForm
        OrderInfo
</template>

<script>
import FormWrapper from "@/pages/components/forms/FormWrapper";
import OrderInfo from "@/pages/components/forms/OrderInfo";
import RequestForm from "@/pages/components/forms/copywriting/RequestForm";

export default {
    components: {
        FormWrapper,
        OrderInfo,
        RequestForm
    }    
}
</script>

<style lang="scss" scoped>

.copywriting {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
}

</style>
