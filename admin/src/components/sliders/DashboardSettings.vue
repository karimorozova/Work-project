<template lang="pug">
    .dashboard
        Activities
</template>

<script>
import Activities from "../reports/Activities"

export default {
    components: {
        Activities
    }
};
</script>

<style lang="scss" scoped>

.dashboard {
    width: 100%;
    box-sizing: border-box;
    padding-left: 40px;
}

</style>
