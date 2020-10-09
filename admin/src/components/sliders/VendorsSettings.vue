<template lang="pug">
  .vendors
    .vendors__sidebar
      Sidebar(
        @onLinkClickMulti="toggleLink",
        :isMultiLinks="true",
        :multiLinks="sidebarLinksMulti",
        :multiActiveIndex="currentIndex"
      )
    .vendors__all
      router-view
</template>

<script>
	import Sidebar from "../Sidebar";

	export default {
		data() {
			return {
				sidebarLinksMulti: [
					{
						title: "VENDORS",
						links: [
							{ arrayIndex: 0, title: "All", routeName: "all-vendors" },
							{ arrayIndex: 0, title: "Active", routeName: "active-vendors" },
							{ arrayIndex: 0, title: "Inactive", routeName: "inactive-vendors" },
						],
					},
					{
						title: "CANDIDATES",
						links: [
							{
								arrayIndex: 1,
								title: "Potential",
								routeName: "potential-vendors",
							},
							{ arrayIndex: 1, title: "Tests", routeName: "tests-vendors" },
						],
					},
				],
				currentIndex: [0, 1],
				defaultRouteName: "active-vendors",
			};
		},
		methods: {
			toggleLink({ arrayIndex, index }) {
				this.currentIndex = [arrayIndex, index];
				const { routeName } = this.sidebarLinksMulti[arrayIndex].links[index];
				this.$router.push({ name: routeName });
			},
			setDefaultActiveLink() {
				const { name } = this.$route;

				let indexesSideBar = [];
				this.sidebarLinksMulti.forEach((title) => {
					const currentSideBar = title.links.filter((item) => item.routeName === name);
					const currentSideBarIndex = title.links.findIndex((item) => item.routeName === name);
					if(currentSideBar.length) indexesSideBar = [currentSideBar[0].arrayIndex, currentSideBarIndex];
				});

				this.currentIndex = indexesSideBar;
			},
			goToRoute() {
				if(this.currentIndex.length) {
					const { routeName } = this.sidebarLinksMulti[this.currentIndex[0]].links[this.currentIndex[1]];
					this.$router.push({ name: routeName });
				}
			},
		},
		watch: {
			$route(to, from) {
				if(to.name === 'active-vendors') this.currentIndex = [0, 1];
			}
		},
		components: {
			Sidebar,
		},
		mounted() {
			this.setDefaultActiveLink();
			this.goToRoute();
		},

	};
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";

  .vendors {
    display: flex;
    width: 100%;
    box-sizing: border-box;
    min-height: 94vh;

    &__sidebar {
      box-shadow: -10px 0 10px 10px $brown-shadow;
    }

    &__all {
      width: 100%;
    }
  }
</style>
