<template lang="pug">
    .inactive-clients
        Allclients(
            filterStatus="Inactive"
            )
</template>

<script>
import Allclients from "./Allclients";

export default {
    components: {
        Allclients
    }
}
</script>

<style lang="scss" scoped>

</style>