<template lang="pug">
    .server-errors
        p.server-errors__message {{ errorMessage }}
</template>

<script>
export default {
    props: {
        errorMessage: {
            type: String
        }
    }
}
</script>

<style lang="scss" scoped>
.server-errors {
    width: 250px;
    padding: 15px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
}
</style>


