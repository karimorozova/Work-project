import Vue from "vue";

Vue.filter("firstEnglishLanguage", (arr) => {
	if (arr.length) {
		if (typeof arr[0] === "string") {
			const englishLanguageIndex = arr.findIndex(
					(item) => item === "English (United Kingdom)"
			);
			if (englishLanguageIndex !== -1) {
				const firstElem = arr.splice(englishLanguageIndex, 1);
				arr.unshift(firstElem[0]);
				return arr;
			} else {
				return arr;
			}
		}
	}
});

Vue.filter("maxRateCount", (num) => {
	let newNum = parseInt(num);
	if (newNum > 100) {
		newNum = 100;
	} else if (newNum < 0) {
		newNum = 0;
	} else if ("" === newNum) {
		newNum = 0;
	}
	return newNum;
});

Vue.filter("stepsAndTasksStatusFilter", (status) => {
	let newStatus = status;
	if (status === "Started") {
		newStatus = "In progress"
	}
	// } else if (status === "Waiting to Start") {
	// 	newStatus = "Ready to Start"
	// }
	// console.log(status)
	return newStatus;
});