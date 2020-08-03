export default {
    methods: {
        toggleLink({ index }) {
            this.currentIndex = index;
            const { routeName } = this.sidebarLinks[index];
            this.$router.push({ name: routeName });
        },
        setDefaultActiveLink() {
            const { name } = this.$route;
            if (name === this.defaultRouteName) return this.currentIndex = 1;
            this.currentIndex = this.sidebarLinks.findIndex(item => item.routeName === name);
        },
        goToRoute() {
            if (this.currentIndex !== -1) {
                this.$router.push({ name: this.sidebarLinks[this.currentIndex].routeName });
            }
        }
    },
    mounted() {
        this.setDefaultActiveLink();
        this.goToRoute();
    },
}