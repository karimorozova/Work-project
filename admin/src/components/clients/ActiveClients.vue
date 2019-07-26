<template lang="pug">
    .active-clients
        Allclients(
            filterStatus="Active"
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