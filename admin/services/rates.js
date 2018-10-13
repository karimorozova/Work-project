function deleteServiceRate(service, industries, id) {
    const combIndex = service.languageCombinations.findIndex(item => {
        return item.id === id;
      });
      let combination = {...service.languageCombinations[combIndex]._doc};
      let allZero = [];
      for(let indus of combination.industries) {
        for(let ind of industries) {
          if(ind._id === indus.industry.id) {
            indus.rate = 0
            indus.industry.active = false;
          }
        }
        allZero.push(indus.rate);
      }
      service.languageCombinations.splice(combIndex, 1, combination);
      const sum = allZero.reduce((init, cur) => {return init + cur}, 0);
      const updatedCombinations = sum ? service.languageCombinations 
      : service.languageCombinations.filter(item => {return item.id !== id});
      return updatedCombinations;
}

module.exports = { deleteServiceRate };