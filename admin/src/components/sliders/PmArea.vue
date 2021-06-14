<template lang="pug">
  .projects-area

    .projects-area__table
      router-view

</template>

<script>
	import Sidebar from '../Sidebar';

	export default {
		data() {
			return {
				sidebarLinksMulti: [
					{
						title: "PROJECTS",
						links: [
							{ arrayIndex: 0, title: 'Open Projects', routeName: 'open-projects' },
							{ arrayIndex: 0, title: 'Quote Sent', routeName: 'quote-projects' },
							{ arrayIndex: 0, title: 'Incoming Requests', routeName: 'requests' },
							{ arrayIndex: 0, title: 'Closed Projects', routeName: 'closed-projects' },
						],
					},
					{
						title: "XTRF PROJECTS",
						links: [
							{ arrayIndex: 1, title: 'Open Projects', status: "In-progress", routeName: 'open-other-projects' },
							{ arrayIndex: 1, title: 'Quote sent', status: "Quote", routeName: 'quote-other-projects' },
							{ arrayIndex: 1, title: 'Closed Projects', status: "Closed", routeName: 'closed-other-projects' },
						],
					},
				],
				currentIndex: [0, 0],
				defaultRouteName: "open-projects",
				requestsCounter: ""
			}
		},
		methods: {
			toggleLink({ arrayIndex, index }) {
				this.currentIndex = [arrayIndex, index];
				const { routeName, status } = this.sidebarLinksMulti[arrayIndex].links[index];
				this.$router.push({ name: routeName, query: { status: status } });
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
					const { routeName, status } = this.sidebarLinksMulti[this.currentIndex[0]].links[this.currentIndex[1]];
					this.$router.push({ name: routeName, query: { status: status } });
				}
			},
			async getRequestsQuantity() {
				try {
					const requests = await this.$http.get('/api/requests-quantity');
					this.requestsCounter = requests.data.quantity;
				} catch (err) {

				}
			}
		},
		computed: {
			sidebarLinks() {
				return this.links.map(item => {
					if(item.routeName === 'requests') {
						item.counter = this.requestsCounter;
					}
					return item
				});
			}
		},
		watch: {
			$route(to, from) {
				if(to.name === 'open-projects') this.currentIndex = [0, 0];
			}
		},
		components: {
			Sidebar
		},
		created() {
			this.getRequestsQuantity();
			this.setDefaultActiveLink();
			this.goToRoute();
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";

  .projects-area {
    display: flex;
    width: 100%;
    box-sizing: border-box;
    min-height: 95vh;

    &__sidebar {
      box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    }
    &__table {
      padding: 40px;
      width: 100%;
    }

  }

</style>
