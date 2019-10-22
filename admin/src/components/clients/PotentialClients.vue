<template lang="pug">
    .potential-clients
        Allclients(
            statusFilter="Potential"
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