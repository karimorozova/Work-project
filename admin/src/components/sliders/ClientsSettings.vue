<template lang="pug">
.clients

    .clients__all
        router-view
</template>

<script>
import Sidebar from '../Sidebar';
import defaultSidebarLinks from "@/mixins/defaultSidebarLinks";
import { mapGetters, mapActions } from "vuex";


export default {
    mixins: [defaultSidebarLinks],
    data() {
        return {
            isSidebar: false,
            sidebarLinks: [
                {title: "All", routeName: "all-clients"},
                {title: "Active", routeName: "active-clients"},
                {title: "Inactive", routeName: "inactive-clients"},
                {title: "Potential", routeName: "potential-clients"}
            ],
            currentIndex: -1,
            defaultRouteName: "active-clients",
        }
    },
    components: {
        Sidebar
    }
};
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.clients {
    display: flex;
    width: 100%;
    box-sizing: border-box;
    min-height: 95vh;
    &__sidebar {
        box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    }
    &__all {
        width: 100%;
        padding: 40px;
    }
}

</style>
