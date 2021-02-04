const defaultTierInfo = [
  {
    tier: 1,
    lqas: [
      {
        minWordCount: 0,
        allowSteps: ['tqi'],
        lqaName: 'tqi',
      },
      {
        minWordCount: 10000,
        allowSteps: ['tqi', 'Lqa1'],
        lqaName: 'Lqa 1',
      },
      {
        minWordCount: 50000,
        allowSteps: ['tqi','Lqa1', 'Lqa2'],
        lqaName: 'Lqa 2',
      },
      {
        minWordCount: 100000,
        allowSteps: ['tqi','Lqa1', 'Lqa2', 'Lqa3'],
        lqaName: 'Lqa 3',
      }
    ]
  },
  {
    tier: 2,
    lqas: [
      {
        minWordCount: 0,
        allowSteps: ['tqi'],
        lqaName: 'tqi',
      },
      {
        minWordCount: 5000,
        allowSteps: ['tqi', 'Lqa1'],
        lqaName: 'Lqa 1',
      },
      {
        minWordCount: 25000,
        allowSteps: ['tqi','Lqa1', 'Lqa2'],
        lqaName: 'Lqa 2',
      },
      {
        minWordCount: 50000,
        allowSteps: ['tqi','Lqa1', 'Lqa2', 'Lqa3'],
        lqaName: 'Lqa 3',
      }
    ]
  },
  {
    tier: 3,
    lqas: [
      {
        minWordCount: 0,
        allowSteps: ['tqi'],
        lqaName: 'tqi',
      },
      {
        minWordCount: 1000,
        allowSteps: ['tqi', 'Lqa1'],
        lqaName: 'Lqa 1',
      },
      {
        minWordCount: 5000,
        allowSteps: ['tqi','Lqa1', 'Lqa2'],
        lqaName: 'Lqa 2',
      },
      {
        minWordCount: 10000,
        allowSteps: ['tqi','Lqa1', 'Lqa2', 'Lqa3'],
        lqaName: 'Lqa 3',
      }
    ]
  }
];

module.exports = { defaultTierInfo };
