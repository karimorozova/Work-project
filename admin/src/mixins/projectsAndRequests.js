export default {
	methods: {
		scrollBodyToTop() {
			let tbody = document.querySelector(".all-projects");
			tbody.scrollTop = 0;
		},
		async bottomScrolled({ filters }) {
			if(this.isDataRemain) {
				const result = await this.$http.post(`/api/${ this.endpoint }`, { ...filters, lastDate: this.lastDate });
				this.prop === 'requests' ? this.setRequests([...this.requests, ...result.body]) : this.setAllProjects([...this.projects, ...result.body]);
				this.isDataRemain = result.body.length === 25;
				this.lastDate = result.body && result.body.length ? result.body[result.body.length - 1].startDate : "";
			}
		},
		async getData(filters) {
			this.lastDate = new Date();
			this.lastDate.setDate(this.lastDate.getDate() + 1);
			this.isDataRemain = true;
			let result;
			try {
				result = await this.getProjectResultFormTypeAndFilter(filters)
				this.prop === 'requests' ? this.setRequests([...result.body]) : this.setAllProjects([...result.body]);
				this.lastDate = result.body && result.body.length ? result.body[result.body.length - 1].startDate : "";
				this.scrollBodyToTop();
			} catch (err) {
				this.alertToggle({ message: "Error on getting data", isShow: true, type: "error" });
			}
		},

		async getProjectResultFormTypeAndFilter(filters) {
			const { name } = this.$route;
			let result;
			switch (name) {
				case 'closed-projects':
					result = await this.$http.post(`/api/${ this.endpoint }`, {
						...filters,
						lastDate: this.lastDate,
						projectType: "Closed"
					});
					break;
				case 'quote-projects':
					result = await this.$http.post(`/api/${ this.endpoint }`, {
						...filters,
						lastDate: this.lastDate,
						projectType: "Quote"
					});
					break;
				case 'open-projects':
					result = await this.$http.post(`/api/${ this.endpoint }`, {
						...filters,
						lastDate: this.lastDate,
						projectType: "Open"
					});
					break;
				default:
					result = await this.$http.post(`/api/${ this.endpoint }`, {
						...filters,
						lastDate: this.lastDate
					});
			}
			return result;
		},
	}
}