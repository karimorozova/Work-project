export default {
    methods: {
        //TODO: rewrite this functions
        getLanguagePair(task) {
            //MAX
            // const sourceLang = this.getLangInfoBySymbol(task.sourceLanguage)
            // const targetLang = this.getLangInfoBySymbol(task.targetLanguage)
            return `${task.fullSourceLanguage.lang} >> ${task.fullTargetLanguage.lang}`
            // const unit = task.service.calculationUnit.toLowerCase();
            //
            // let ratesProp = unit === 'packages' ? 'monoRates' : `${unit}Rates`;
            // const taskPair = this.getTaskPair(task, ratesProp, unit);
            //
            // const pair = unit === 'packages' ? `${taskPair.target.lang} / ${taskPair.packageSize}` :
            //     `${taskPair.source.lang} => ${taskPair.target.lang}`
            // return pair;
        },
        getTaskPair(task, ratesProp, unit) {
            // return this.clientLanguages[ratesProp].find(item => {
            //     if(unit === 'packages') {
            //         return item.target.symbol === task.targetLanguage && item.packageSize === task.packageSize;
            //     }
            //     return item.target.symbol === task.targetLanguage && item.source.symbol === task.sourceLanguage;
            // })
        },
        getLangInfoBySymbol(symbol) {
          return this.languages.find((lang) => {
              console.log(lang)
              return lang === symbol
          })
        }
    }
}
