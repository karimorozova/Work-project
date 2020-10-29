const getCompetenciesForCheck = (competencies, currentCompetenceId, tests) => (
  competencies.filter(item => item._id.toString() !== currentCompetenceId.toString())
    .filter(item => (
      tests.find(test =>
        test.source.toString() === item.sourceLanguage.toString() &&
        test.targets.find(target => target.toString() === item.targetLanguage.toString()) &&
        test.industries.find(industry => industry.toString() === item.industry.toString()) &&
        test.steps.find(step => step.toString() === item.step.toString())
      ) === undefined && item
    ))
);

module.exports = { getCompetenciesForCheck };
