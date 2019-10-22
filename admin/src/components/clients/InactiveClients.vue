<template lang="pug">
    .inactive-clients
        Allclients(
            statusFilter="Inactive"
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