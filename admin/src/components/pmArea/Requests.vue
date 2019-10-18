<template lang="pug">
    .requests
        .requests__table
            Allprojects(
                projectsType="requests"
            )
</template>

<script>
import Allprojects from './Allprojects';
import { mapActions } from 'vuex';

export default {
    methods: {
        ...mapActions(["setRequests", "alertToggle"]),
        async getRequests() {
            try {
                const requests = await this.$http.get('/api/all-requests');
                await this.setRequests([...requests.body]);
            } catch(err) {
                this.alertToggle({message: "Error on getting Requests", isShow: true, type: "error"});
            }
        }
    },
    components: {
        Allprojects
    },
    created() {
        this.getRequests();
    }
};

</script>

<style lang="scss" scoped>

.requests {
    width: calc(100% - 150px);
}

</style>
