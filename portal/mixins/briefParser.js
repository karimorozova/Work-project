export default {
    methods: {
        setRequestBrief() {
            let { genBrief } = this.orderDetails;
            const bools = ['isNotSure', 'isFreedom', 'isOutline', 'isCta'];
            let brief = this.parseGenBrief(genBrief, bools);
            if(genBrief.isNotSure) {
                brief += genBrief.isFreedom ? 'Topics: Give the copywriter freedom' : 'Topics: Request an outline from the copywriter';
            }
            if(genBrief.isCta) {
                brief += 'CTA: Yes'
            }
            return brief;
        },
        parseGenBrief(genBrief, bools) {
            return Object.keys(genBrief).reduce((acc, cur) => {
                if(bools.indexOf(cur) === -1) {
                    acc += `${cur}: ${genBrief[cur]}\n`
                }
                return acc;
            }, "")
        },
    }
}