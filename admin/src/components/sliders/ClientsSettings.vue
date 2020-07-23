<template lang="pug">
.clients
    .clients__sidebar
        Sidebar(
            title="CLIENTS" 
            :links="sidebarLinks" 
            linkClass="client-details"
            :activeIndex="currentIndex"
            @onLinkClick="toggleLink"
            )
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
            currentIndex: 0,
            defaultRouteName: "clients"
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
    min-height: 94vh;
    &__sidebar {
        box-shadow: -10px 0 10px 10px $brown-shadow;
    }
    &__all {
        max-width: 1200px;
    }
}

</style>
