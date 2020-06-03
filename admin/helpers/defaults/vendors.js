const { Vendors } = require('../../models');
const vendors = [
  {
    "Legal Name": "Mohamed Saeed",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 98,
      }
    ],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 81,
    }
  },
  {
    "Legal Name": "Takashi Kimura",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 98,
      },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 68,
      }
    ],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 100,
    }
  },
  {
    "Legal Name": "Marcus Voller",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 97,
      },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 97
      }
    ],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 74
    }
  },
  {
    "Legal Name": "Lenka Skolnikova",
    TQI: [
      {
        industry: 'Finance',
        score: 95
      }
    ]
  },
  {
    "Legal Name": "Genadijs Lefands",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 95
      },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 95
      }
    ],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 100,
    },
    LQA2: {
      industry: 'CFDs and Online Trading',
      score: 66,
    }
  },
  {
    "Legal Name": "Anne Schoendorff",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 95
      }
    ]
  },
  {
    "Legal Name": "Ruta Slavinskaite",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 95
      }
    ]
  },
  {
    "Legal Name": "Fedja Imamovic",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 94
      },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 89
      }
    ]
  },
  {
    "Legal Name": "Ayşe Kıvılcım Karazor",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 94,
      }
    ]
  },
  {
    "Legal Name": "Ziyan Tian",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 94,
      }
    ]
  },
  {
    "Legal Name": "Sumie Tanaka",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 94
      },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 94
      }
    ],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 94
    }
  },
  {
    "Legal Name": "Kristina Korvas",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 94,
      }
    ]
  },
  {
    "Legal Name": "Mélanie LEHALLE",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 94
      }
    ],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 74,
    }
  },
  {
    "Legal Name": "Roman Briquet",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 94
      }
    ]
  },
  {
    "Legal Name": "Álvaro de Marcos Peirotén",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 100,
      },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 88
      }
    ]
  },
  {
    "Legal Name": "Davide Terrana",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 94
      }
    ],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 89,
    },
    LQA2: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 100,
    }
  },
  {
    "Legal Name": "Tsiuri Pilauri",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 94
      },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 94
      }
    ]
  },
  {
    "Legal Name": "Kire Dimik Kire Dimik",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 94,
      }
    ]
  },
  {
    "Legal Name": "Antonia Syrianou",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 93
      }
    ]
  },
  {
    "Legal Name": "Salvatore Guarna",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 93
      }
    ]
  },
  {
    "Legal Name": "Ivan Nedeljkovic",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 93
      }
    ]
  },
  {
    "Legal Name": "Sikarnt Skoolisariyaporn",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 93
      }
    ]
  },
  {
    "Legal Name": "Le Nguyen Quynh",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 93,
      },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 93
      }
    ],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 69,
    },
    LQA2: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 61
    }
  },
  {
    "Legal Name": "Lee Anne",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 93
      }
    ]
  },
  {
    "Legal Name": "Vasco Batalha",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 93,
      },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 93,
      }
    ],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 93
    },
    LQA2: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 95,
    },
    LQA3: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 73
    }
  },
  {
    "Legal Name": "Teh Kee Lim",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 93,
      }
    ]
  },
  {
    "Legal Name": "Thor Penthin Grumløse",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 92,
      },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 92
      }
    ],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 51
    }
  },
  {
    "Legal Name": "Petar Tsanev",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 92
    },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 92
      }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 92
    },
    LQA2: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 100
    }
  },
  {
    "Legal Name": "Catherine Johnson",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 92
    }]
  },
  {
    "Legal Name": "Bojana Vujanovic",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 92
    }]
  },
  {
    "Legal Name": "Janusz Kubow",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 92
    },
      {
        industry: 'CFDs and Online Trading',
        score: 92
      }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 90
    }
  },
  {
    "Legal Name": "Muhamed Durmic",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 92
    },
      {
        industry: 'CFDs and Online Trading',
        score: 92
      }],
  },
  {
    "Legal Name": "Isabel Valencia",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 92
    }],
  },
  {
    "Legal Name": "Tim Goossens",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 92
    }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 52,
    }
  },
  {
    "Legal Name": "Théotime MILVOY",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 91
    },
      {
        industry: 'CFDs and Online Trading',
        score: 91
      }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 72,
    }
  },
  {
    "Legal Name": "Can Aydemir",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 91
    }],
  },
  {
    "Legal Name": "Hana Abusedu",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 90
    }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 90,
    }
  },
  {
    "Legal Name": "Anastasia Shugusheva",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 90
    }],
  },
  {
    "Legal Name": "Christian Brandstötter",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 90
    },
      {
        industry: 'CFDs and Online Trading',
        score: 90
      }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 90,
    },
    LQA2: {
      industry: 'CFDs and Online Trading',
      score: 86,
    }
  },
  {
    "Legal Name": "Cecilia Chicu",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 90
    },
      {
        industry: 'Video Games',
        score: 90
      }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 93,
    },
  },
  {
    "Legal Name": "Sabrina Martins",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 90
    }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 100,
    },
  },
  {
    "Legal Name": "Susanne Schoof",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 89
    },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 95
      }],
  },
  {
    "Legal Name": "Michael Remus",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 89
    }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 82,
    },
    LQA2: {
      industry: 'CFDs and Online Trading',
      score: 100
    }
  },
  {
    "Legal Name": "Christiane Eidam",
    TQI: [{
      industry: 'Medical Devices',
      score: 89
    }],
  },
  {
    "Legal Name": "Omar Mear",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 89
    },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 89
      }],
  },
  {
    "Legal Name": "Tijana Dmitrović",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 89
    },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 89
      }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 90,
    }
  },
  {
    "Legal Name": "Samreen Hamzah",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 89
    }],
  },
  {
    "Legal Name": "Isamu Kobayashi",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 89
    },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 89
      }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 63,
    }
  },
  {
    "Legal Name": "Juan Pintado Busto",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 89
    },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 95
      }],
  },
  {
    "Legal Name": "Zuzana Suchá",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 89
    }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 83,
    }
  },
  {
    "Legal Name": "Robert Pruszczak",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 89
    }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 75,
    },
    LQA2: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 82
    }
  },
  {
    "Legal Name": "Domenico Trimboli",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 89
    }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 75,
    },
  },
  {
    "Legal Name": "Hanne Jensen",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 89
    }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 91,
    },
    LQA2: {
      industry: 'CFDs and Online Trading',
      score: 80
    }
  },
  {
    "Legal Name": "Natasja Engholm",
    TQI: [{
      industry: 'Finance',
      score: 89
    }],
  },
  {
    "Legal Name": "Duarte Bras",
    TQI: [{
      industry: 'Finance',
      score: 88
    }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 100,
    },
  },
  {
    "Legal Name": "Jan Kovačič",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 88
    }],
  },
  {
    "Legal Name": "Eric Hernandez",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 88
    }, {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 88
    }],
  },
  {
    "Legal Name": "Pelle Person",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 88
    }, {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 88
    }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 57,
    },
    LQA2: {
      industry: 'CFDs and Online Trading',
      score: 91
    }
  },
  {
    "Legal Name": "Emanuel Stroia",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 88
    }],
  },
  {
    "Legal Name": "Odil Gaipnazarov",
    TQI: [{
      industry: 'Finance',
      score: 88
    }],
  },
  {
    "Legal Name": "Milan Kohút",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 88
    }],
  },
  {
    "Legal Name": "Abida Muttaqiena",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 88
    }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 90,
    },
    LQA2: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 90
    }
  },
  {
    "Legal Name": "Johan Bergman",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 87
    }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 100,
    },
  },
  {
    "Legal Name": "Samu Lampiranta",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 87
    }],
  },
  {
    "Legal Name": "Bart Meertens",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 87
    }],
  },
  {
    "Legal Name": "Laurie Drai",
    TQI: [{
      industry: 'Finance',
      score: 87
    }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 90,
    },
  },
  {
    "Legal Name": "Tina Paatashvili",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 78
    }],
  },
  {
    "Legal Name": "Sandra Suca",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 87
    }],
  },
  {
    "Legal Name": "Laura Crıng",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 86
    }],
  },
  {
    "Legal Name": "Elena Mazzetto",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 86
    },
      {
        industry: 'CFDs and Online Trading',
        score: 86
      }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 94
    },
    LQA2: {
      industry: 'CFDs and Online Trading',
      score: 94
    },
    LQA3: {
      industry: 'CFDs and Online Trading',
      score: 91
    }
  },
  {
    "Legal Name": "Baki",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 86
      }],
  },
  {
    "Legal Name": "Takeshi Suda",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 86
      }],
  },
  {
    "Legal Name": "Jihye Kim",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 86
      }],
  },
  {
    "Legal Name": "David Lomidze",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 85
    },
      {
        industry: 'CFDs and Online Trading',
        score: 85
      }],
  },
  {
    "Legal Name": "Madara Miezīte",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 85
      }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 100,
    }
  },
  {
    "Legal Name": "Agnese Šulte",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 85
      }],
  },
  {
    "Legal Name": "Deniz Giray",
    TQI: [
      {
        industry: 'Finance',
        score: 84
      }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 84
    },
    LQA2: {
      industry: 'CFDs and Online Trading',

      score: 70
    },
    LQA3: {
      industry: 'CFDs and Online Trading',
      score: 94
    }
  },
  {
    "Legal Name": "Saqib Ali Haider",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 84
    },
      {
        industry: 'CFDs and Online Trading',
        score: 84
      }],
  },
  {
    "Legal Name": "Giovanni Fichera",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 84
    },
      {
        industry: 'CFDs and Online Trading',
        score: 84
      }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 77
    },
    LQA2: {
      industry: 'CFDs and Online Trading',
      score: 100
    },
    LQA3: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 92
    }
  },
  {
    "Legal Name": "Christian Hensen",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 83
      }
    ],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 100
    }
  },
  {
    "Legal Name": "Possawee Nateetaweesak",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 83
      }
    ],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 82
    }
  },
  {
    "Legal Name": "Robert Norinder",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 83
    },
      {
        industry: 'CFDs and Online Trading',
        score: 83
      }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 83
    },
    LQA2: {
      industry: 'CFDs and Online Trading',
      score: 83
    },
  },
  {
    "Legal Name": "Laura Jurinich",
    TQI: [
      {
        industry: 'Finance',
        score: 83
      }
    ],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 100
    },
    LQA2: {
      industry: 'CFDs and Online Trading',
      score: 89
    }
  },
  {
    "Legal Name": "Lenka Schumacher",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 83
      }
    ],
  },
  {
    "Legal Name": "Jana Hodson",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 83
      }
    ],
  },
  {
    "Legal Name": "Martyna Spyra",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 82
      }
    ],
  },
  {
    "Legal Name": "Magdalena Keitz",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 82
      }
    ],
  },
  {
    "Legal Name": "Dung Pham",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 82
      },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 82
      }
    ],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 100
    },
    LQA2: {
      industry: 'Trading',
      score: 90
    }
  },
  {
    "Legal Name": "Miro Hämäläinen",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 82
      }
    ],
  },
  {
    "Legal Name": "Marta Adamiuk",
    TQI: [
      {
        industry: 'Finance',
        score: 82
      }
    ],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 81
    },
    LQA2: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 47
    },
    LQA3: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 62
    }
  },
  {
    "Legal Name": "Joe Zhu",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 82
    }, {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 82
    }]
  },
  {
    "Legal Name": "Karen Wu",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 82
    }]
  },
  {
    "Legal Name": "Ivan Vatovic",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 82
    }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 59
    }
  },
  {
    "Legal Name": "Violaine Courbon",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 82
      }
    ]
  },
  {
    "Legal Name": "Mehmet Öztan",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 82
      }
    ]
  },
  {
    "Legal Name": "Christina Kafoe",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 82
      }
    ]
  },
  {
    "Legal Name": "Alexandra Dimitriadi",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 81
      },{
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 81
      }
    ],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 90
    }
  },
  {
    "Legal Name": "Kathy Way",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 81
    }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 100
    }
  },
  {
    "Legal Name": "Navarut Yenprasert",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 80
    }]
  },
  {
    "Legal Name": "Neyf Almeida",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 80
    }]
  },
  {
    "Legal Name": "Hakki Erdem Dincer",
    TQI: [{
      industry: 'Finance',
      score: 80
    }]
  },
  {
    "Legal Name": "Raluca Stanculet",
    TQI: [{
      industry: 'Finance',
      score: 80
    }]
  },
  {
    "Legal Name": "Hyeongmin Jeon",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 79
    }]
  },
  {
    "Legal Name": "Toby Houben",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 79
    }]
  },
  {
    "Legal Name": "David Lee",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 79
    }]
  },
  {
    "Legal Name": "Danijel Merkaš",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 78,
    },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 94
      }]
  },
  {
    "Legal Name": "Ryutaro Yamashita",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 78,
    },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 78
      }]
  },
  {
    "Legal Name": "Naho Miyamoto",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 78,
    },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 78
      }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 78
    }
  },
  {
    "Legal Name": "Simonas Valionis",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 76
    }]
  },
  {
    "Legal Name": "Hua Zhou",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 76
      },{
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 76
      }
    ],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 76
    },
    LQA2: {
      industry: 'CFDs and Online Trading',
      score: 90
    }
  },
  {
    "Legal Name": "Frederik Klingenschmid",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 76
    }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 80
    },
    LQA2: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 66
    },
    LQA3: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 66
    }
  },
  {
    "Legal Name": "Keren Ng",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 76
    },{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 76
    }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 39
    },
    LQA2: {
      industry: 'CFDs and Online Trading',
      score: 36
    },
  },
  {
    "Legal Name": "Maxim Tolstov",
    TQI: [{
      industry: 'Medical Devices',
      score: 75
    }]
  },
  {
    "Legal Name": "Maurizio Varriale",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 75
    }]
  },
  {
    "Legal Name": "Nadia Anabel Cannizzaro",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 75
    }, {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 75
    }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 37
    },
    LQA2: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 81
    }
  },
  {
    "Legal Name": "Ricky Tevet",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 74
    }, {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 74
    }],
    LQA1: {
      industry: 'Legal',
      score: 81
    }
  },
  {
    "Legal Name": "José A. Hombrados Castro",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 74
    }, {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 74
    }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 93
    },
    LQA2: {
      industry: 'CFDs and Online Trading',
      score: 100
    }
  },
  {
    "Legal Name": "Saibal Ray",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 74
    }, {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 74
    }],
  },
  {
    "Legal Name": "Gu Jun",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 74
    }, {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 74
    }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 74
    },
  },
  {
    "Legal Name": "Ondrej SEMERAK",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 73
    }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 100,
    },
    LQA2: {
      industry: 'CFDs and Online Trading',
      score: 80
    },
    LQA3: {
      industry: 'CFDs and Online Trading',
      score: 52
    }
  },
  {
    "Legal Name": "Samid Vahidov",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 73
    }]
  },
  {
    "Legal Name": "Antonin Gala",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 72
    }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 72
    },
    LQA2: {
      industry: 'CFDs and Online Trading',
      score: 100
    }
  },
  {
    "Legal Name": "Patric Tsayo",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 71
    }, {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 71
    }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 71
    },
    LQA2: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 82
    },
    LQA3: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 91
    }
  },
  {
    "Legal Name": "Markus Sammer",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 68
    }, {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 68
    }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 68
    }
  },
  {
    "Legal Name": "Manuela Cravotta",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 68
    }]
  },
  {
    "Legal Name": "Dheeraj Dhawan",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 68
    }, {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 68
    }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 68
    }
  },
  {
    "Legal Name": "Stefanie Boehm",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 65
    }, {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 65
    }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 65
    },
    LQA2: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 94
    },
    LQA3: {
      industry: 'CFDs and Online Trading',
      score: 100
    }
  },
  {
    "Legal Name": "Milena Ferrante",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 65
    }, {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 65
    }],
  },
  {
    "Legal Name": "Matheus R. Mattos",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 65
    }, {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 65
    }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 63
    },
    LQA2: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 94
    },
  },
  {
    "Legal Name": "Satyam Varma",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 62
    }, {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 62
    }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 62
    },
  },
  {
    "Legal Name": "Mari Karhunen",
    TQI: [{
      industry: 'Finance',
      score: 61
    }]
  },
  {
    "Legal Name": "Marianne Kjolstad Robson",
    TQI: [{
      industry: 'Finance',
      score: 60
    }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 60
    },
    LQA2: {
      industry: 'CFDs and Online Trading',
      score: 100
    }
  },
  {
    "Legal Name": "Kotaro Aoki",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 59
    }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 53
    },
    LQA2: {
      industry: 'CFDs and Online Trading',
      score: 17
    },
    LQA3: {
      industry: 'CFDs and Online Trading',
      score: 90
    }
  },
  {
    "Legal Name": "Nina Scutelnic",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 58
    }, {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 58
    }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 0
    },
    LQA2: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 49
    },
    LQA3: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 91
    }
  },
  {
    "Legal Name": "Gardenia Zeng",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 57
    }, {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 57
    }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 57
    },
    LQA2: {
      industry: 'CFDs and Online Trading',
      score: 90
    },
    LQA3: {
      industry: 'CFDs and Online Trading',
      score: 89
    }
  },
  {
    "Legal Name": "Amy Kim",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 56
    }, {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 56
    }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 56
    },
    LQA2: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 38
    },
  },
  {
    "Legal Name": "Jaru Hirsso",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 54
    }, {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 54
    }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 54
    },
    LQA2: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 91
    },
  },
  {
    "Legal Name": "Stanislava Tretyak",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 52
    }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 35
    },
    LQA2: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 42
    }
  },
  {
    "Legal Name": "Mònica Muñoz Llop",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 50
    }, {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 50
    }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 69
    },
    LQA2: {
      industry: 'CFDs and Online Trading',
      score: 90
    }
  },
  {
    "Legal Name": "Gerd Tarand",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 48
    },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 48
      }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 48
    }
  },
  {
    "Legal Name": "Theis Jensen",
    TQI: [{
      industry: 'Finance',
      score: 47
    }]
  },
  {
    "Legal Name": "Seulki Lee",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 46
    },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 46
      }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 46
    }
  },
  {
    "Legal Name": "Tomas Martelli",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 33
    }]
  },
  {
    "Legal Name": "Claryssa Suci Puspa Dewi",
    TQI: [{
      industry: 'Finance',
      score: 32
    }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 82
    },
    LQA2: {
      industry: 'CFDs and Online Trading',
      score: 9
    }
  },
  {
    "Legal Name": "Maria Dimitrova",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 31
    },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 31
      }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 31
    },
  },
  {
    "Legal Name": "Nouri Adam",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 24
    },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 24
      }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 24
    },
    LQA2: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 73
    }
  },
  {
    "Legal Name": "Rasa Damasauskaite",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 21
    }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 21
    }
  },
  {
    "Legal Name": "Diego Sibilia",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 17
    },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 17
      }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 17
    },
    LQA2: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 19
    },
    LQA3: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 90
    }
  },
  {
    "Legal Name": "Michal Fabian",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 13
    },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 13
      }],
  },
  {
    "Legal Name": "André Costa",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 100,
    }, {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 94,
    }]
  },
  {
    "Legal Name": "Carol-Ann Mimeault",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 100,
    }, {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 92,
    }]
  },
  {
    "Legal Name": "Kian Korki",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 100,
    }, {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 89,
    }]
  },
  {
    "Legal Name": "Christian Wally",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 100,
    }]
  },
  {
    "Legal Name": "Cagdas Mandali",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 100,
    }, {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 100,
    }]
  },
  {
    "Legal Name": "Jakov Milicevic",
    TQI: [{
      industry: 'Finance',
      score: 100,
    }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 94
    },
    LQA2: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 60
    }
  },
  {
    "Legal Name": "Dario Di Franco",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 100
    },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 100
    },
    LQA2: {
      industry: 'CFDs and Online Trading',
      score: 88
    }
  },
  {
    "Legal Name": "Szilvia Ferenczy",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 100,
    }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 92
    },
    LQA2: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 94
    }
  },
  {
    "Legal Name": "Helena Fjellstedt Nunn",
    TQI: [{
      industry: 'Finance',
      score: 100,
    }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 95
    },
    LQA2: {
      industry: 'CFDs and Online Trading',
      score: 87
    }
  },
  {
    "Legal Name": "Dana Grinbauma",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 100,
    }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 100
    },
  },
  {
    "Legal Name": "Paolo Trotta",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 100
    },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      }],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 60,
    }
  },
  {
    "Legal Name": "Carina Reisenhofer",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      },
    ]
  },
  {
    "Legal Name": "Sara Farouk",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 100
    }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 100
    },
    LQA2: {
      industry: 'CFDs and Online Trading',
      score: 100
    }
  },
  {
    "Legal Name": "Pavel Constantinov",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 100
    },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      }],
  },
  {
    "Legal Name": "Tural Afandi",
    TQI: [
      {
        industry: 'Finance',
        score: 100,
      }
    ]
  },
  {
    "Legal Name": "Omar Aly",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 100
    }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 100
    },
    LQA2: {
      industry: 'CFDs and Online Trading',
      score: 100
    }
  },
  {
    "Legal Name": "Ahmed Samir",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 100
    }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 100
    },
  },
  {
    "Legal Name": "Olga Dimitrova",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 100
    },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      }],
  },
  {
    "Legal Name": "Gregory Kopylov",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 100
    },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 94
    },
    LQA2: {
      industry: 'CFDs and Online Trading',
      score: 73
    },
    LQA3: {
      industry: 'CFDs and Online Trading',
      score: 90
    }
  },
  {
    "Legal Name": "Anni Tervonen",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      }
    ],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 91
    }
  },
  {
    "Legal Name": "Borbala Kemeny",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      }
    ],
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 84
    }
  },
  {
    "Legal Name": "Luigi Argentino",
    TQI: [
      {
        industry: 'Medical Devices',
        score: 100
      }
    ],
  },
  {
    "Legal Name": "Tamar Sagi",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      }
    ],
  },
  {
    "Legal Name": "Karoline Arberg",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      }
    ],
  },
  {
    "Legal Name": "Carlotta Borelli",
    TQI: [
      {
        industry: 'Medical Devices',
        score: 100
      }
    ],
  },
  {
    "Legal Name": "Nadia AZIM",
    TQI: [
      {
        industry: 'Medical Devices',
        score: 100
      }
    ],
  },
  {
    "Legal Name": "Liliana Pereira",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      }
    ],
  },
  {
    "Legal Name": "Roland Jüptner",
    TQI: [
      {
        industry: 'Medical Devices',
        score: 100
      }
    ],
  },
  {
    "Legal Name": "Jasmin Festi",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      }
    ],
  },
  {
    "Legal Name": "Biljana Bojchev",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      }
    ],
  },
  {
    "Legal Name": "Fernanda Meyer Pereira",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 100
      }
    ],
  },
  {
    "Legal Name": "Petr Hrabe",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 100
      }
    ],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 79
    }
  },
  {
    "Legal Name": "Green Yoo",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      }
    ],
  },
  {
    "Legal Name": "Mihai Parjol",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      }
    ],
  },
  {
    "Legal Name": "Egil Imenes",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      }
    ],
  },
  {
    "Legal Name": "Dmytro Dobryanskiy",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      },
    ],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 85
    },
    LQA2: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 84
    }
  },
  {
    "Legal Name": "Chiara Santoriello",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 100
      }
    ],
  },
  {
    "Legal Name": "Alina CĂLUGĂRU",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      }
    ],
  },
  {
    "Legal Name": "Tom Grimaud",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      }
    ],
  },
  {
    "Legal Name": "Eddy Hazoume",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      }
    ],
  },
  {
    "Legal Name": "Elodie Bourry",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      },
    ],
  },
  {
    "Legal Name": "Vanessa Duarte Silveira",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 100
      }
    ],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 89
    },
    LQA2: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 61
    }
  },
  {
    "Legal Name": "Jorge Francisco Luz",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 100
      }
    ],
  },
  {
    "Legal Name": "Antje Spiller",
    TQI: [
      {
        industry: 'Medical Devices',
        score: 100
      }
    ],
  },
  {
    "Legal Name": "Youness Ajbilou",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 100
      }
    ],
  },
  {
    "Legal Name": "Mari O'keefe",
    TQI: [
      {
        industry: 'Finance',
        score: 100
      }
    ],
  },
  {
    "Legal Name": "Bora Taşdemir",
    TQI: [{
      industry: 'CFDs and Online Trading',
      score: 100
    },
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      }],
    LQA1: {
      industry: 'CFDs and Online Trading',
      score: 100
    },
    LQA2: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 93
    },
    LQA3: {
      industry: 'CFDs and Online Trading',
      score: 100
    }
  },
  {
    "Legal Name": "Claudia Langreiter",
    TQI: [
      {
        industry: 'CFDs and Online Trading',
        score: 100
      }
    ],
  },
  {
    "Legal Name": "Georgios Anagnostou",
    LQA1: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 29
    },
    LQA2: {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 90
    }
  },
  {
    "Legal Name": "Olga Buongiorno",
    TQI: [
      {
        industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
        score: 100
      }
    ],
  },
  {
    "Legal Name": "Hanan Edwar",
    TQI: [{
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 83,
    }, {
      industry: 'iGaming (Casino, Slot games, Gambling, etc.)',
      score: 94
    }]
  }
];

const vendorsTqiAdder = async () => {
  const vendorsTqi = vendors.reduce((acc, curr) => {
    const name = curr['Legal Name'].split(' ');
    const firstName = name[0];
    const surname = name[2] ? `${name[1]} ${name[2]}` : name[1];
    acc.push({
      assessments: [{
        TQI: curr.TQI ? curr.TQI : [],
        LQA1: curr.LQA1 ? curr.LQA1 : {},
        LQA2: curr.LQA2 ? curr.LQA2 : {},
        LQA3: curr['LQA3'] ? curr['LQA3'] : {}
      }],
    })
    return acc;
  }, []);
  for (let vendor of vendorsTqi) {
    await Vendors.updateOne({ firstName: vendor.firstName }, vendor, { upsert: true });
  }
};

module.exports = { vendorsTqiAdder };
