const { languagesDefault } = require('./defaults/index');

const requestsDefault = [];

const usersDefault = [
    {
      "email" : "illy@pangea.global",
      "username" : "illy.dim",
      "group" : "Sales",
      "firstName" : "Illy",
      "lastName" : "Dimitrova",
      "gender" : "FEMALE",
      "phone" : "",
      "position" : "Business Development Manager",
      "password" : "12345",
      "photo": ""
    },
    {
      "email" : "kriti@pangea-langs.com",
      "username" : "kriti.chris",
      "group" : "Project Managers",
      "firstName" : "Kriti",
      "lastName" : "Christoforidou",
      "gender" : "FEMALE",
      "phone" : "",
      "position" : "Senior Project Manager",
      "password" : "12345",
      "photo": ""
    },
    {
      "email" : "sergey@galuza.com",
      "username" : "sergey.galuza",
      "group" : "Developers",
      "firstName" : "Sergey",
      "lastName" : "Galuza",
      "gender" : "MALE",
      "phone" : "",
      "position" : "Development Manager",
      "password" : "12345",
      "photo": ""
    },
    {
      "email" : "michal@pangea.global",
      "username" : "admin",
      "group" : "Administrators",
      "firstName" : "Michal",
      "lastName" : "Shinitzky",
      "gender" : "FEMALE",
      "phone" : "",
      "position" : "Administrator",
      "password" : "12345",
      "photo": ""
    },
    {
      "email" : "rafaella@pangea.global",
      "username" : "rafaella",
      "group" : "Vendor Managers",
      "firstName" : "Rafaella",
      "lastName" : "Athanasiadi",
      "gender" : "FEMALE",
      "phone" : "",
      "position" : "Vendor Manager & Translation Technologist",
      "password" : "12345",
      "photo": ""
    },
    {
      "email" : "sakis@pangea.global",
      "username" : "sakis.k",
      "group" : "Project Managers",
      "firstName" : "Sakis",
      "lastName" : "Koulos",
      "gender" : "MALE",
      "phone" : "",
      "position" : "Project Manager",
      "password" : "12345",
      "photo": ""
    },
    {
      "email" : "eirini@pangea-langs.com",
      "username" : "eirini.loi",
      "group" : "Account Managers",
      "firstName" : "Eri",
      "lastName" : "Loi",
      "gender" : "FEMALE",
      "phone" : "",
      "position" : "Bookkeeper",
      "password" : "12345",
      "photo": ""
    },
    {
      "email" : "arans@pangea.global",
      "username" : "aran.s",
      "group" : "Vendor Managers",
      "firstName" : "Aran",
      "lastName" : "S",
      "gender" : "FEMALE",
      "phone" : "",
      "position" : "Team Lead",
      "password" : "12345",
      "photo": ""
    },
    {
      "email" : "angela@pangea-langs.com",
      "username" : "angela.st",
      "group" : "Project Managers",
      "firstName" : "Angela",
      "lastName" : "Stephanou",
      "gender" : "FEMALE",
      "phone" : "",
      "position" : "Copywriter",
      "password" : "12345",
      "photo": ""
    },
    {
      "email" : "alexia@pangea-langs.com",
      "username" : "alexia.m",
      "group" : "Project Managers",
      "firstName" : "Alexia",
      "lastName" : "Mavronicola",
      "gender" : "FEMALE",
      "phone" : "",
      "position" : "Project Coordinator",
      "password" : "12345",
      "photo": ""
    }
]

const leadSourcesDefault = ["Advertising", "Friend", "Landing Pages", "Internet", "Social Media", "Website"]

const groupsDefault = ["Administrators", "Account Managers", "Developers", "Project Managers", "Sales", "Vendor Managers"]

const stepsDefault = [
    {title: "Translation", symbol: "translation", isStage1: true, isStage2: false, isEditor: true, isActive: true},
    {title: "Revising", symbol: "revising", isStage1: false, isStage2: true, isEditor: true, isActive: true},
    {title: "Editing", symbol: "editing", isStage1: true, isStage2: false, isEditor: true, isActive: true},
    {title: "QA", symbol: "qa", isStage1: true, isStage2: true, isEditor: true, isActive: true},
    {title: "Copywriting", symbol: "copywriting", isStage1: true, isStage2: false, isEditor: true, isActive: true},
    {title: "Proofreading", symbol: "proofreading", isStage1: true, isStage2: true, isEditor: true, isActive: true},
    {title: "Graphic Design", symbol: "graphic_design", isStage1: true, isStage2: true, isEditor: false, isActive: true},
]

const servicesDefault = [
    {sortIndex: 1, xtrf: 11, symbol: "tr", formType: "Translation", icon: "/static/services/Translation_Localization.png", "active": true, "crud": false, languageForm: "Duo", projectType: "regular", title: "Translation", source: true, languages: {source: ["AR", "BG", "DA", "DE", "DE-DE", "DE-AT", "DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "ET", "FA", "FI", "FR", "FR-FR", "FR-BE", "HE", "HY", "ID", "IS", "MO", "MR", "MS", "NL-NL", "NL-BE", "PA", "PT-BR", "SK", "TH"], target: ["AR", "BG", "DA", "DE", "DE-DE", "DE-AT", "DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "ET", "FA", "FI", "FR", "FR-FR", "FR-BE", "HE", "HY", "ID", "IS", "MO", "MR", "MS", "NL-NL", "NL-BE", "PA", "PT-BR", "SK", "TH", "AF", "AR-EG", "AR-MA", "AR-SA", "AZ-LN", "BN-IN", "BS", "CS", "ES-419", "ES-AR", "FR-CA", "FR-CH", "HI", "HR", "HU", "IT", "IT-IT", "IT-CH", "JA", "KA", "KK", "KO", "LT", "LV", "NB", "NL", "PL", "PT-PT", "RO", "RU", "SL", "SR-LA", "SV-SE", "TE", "TK", "TL", "TR", "UK", "UR", "UZ", "VI", "ZH-CN", "ZH-SG", "ZH-HK", "ZH-MO", "ZH-TW"]}},
    {sortIndex: 2, xtrf: 11, symbol: "lo", formType: "Translation", icon: "/static/services/Translation_Localization.png", "active": true, "crud": false, languageForm: "Duo", projectType: "regular", title: "Localization", source: true, languages: {source: ["AR", "BG", "DA", "DE", "DE-DE", "DE-AT", "DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "ET", "FA", "FI", "FR", "FR-FR", "FR-BE", "HE", "HY", "ID", "IS", "MO", "MR", "MS", "NL-NL", "NL-BE", "PA", "PT-BR", "SK", "TH"], target: ["AR", "BG", "DA", "DE", "DE-DE", "DE-AT", "DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "ET", "FA", "FI", "FR", "FR-FR", "FR-BE", "HE", "HY", "ID", "IS", "MO", "MR", "MS", "NL-NL", "NL-BE", "PA", "PT-BR", "SK", "TH", "AF", "AR-EG", "AR-MA", "AR-SA", "AZ-LN", "BN-IN", "BS", "CS", "ES-419", "ES-AR", "FR-CA", "FR-CH", "HI", "HR", "HU", "IT", "IT-IT", "IT-CH", "JA", "KA", "KK", "KO", "LT", "LV", "NB", "NL", "PL", "PT-PT", "RO", "RU", "SL", "SR-LA", "SV-SE", "TE", "TK", "TL", "TR", "UK", "UR", "UZ", "VI", "ZH-CN", "ZH-SG", "ZH-HK", "ZH-MO", "ZH-TW"]}},
    {sortIndex: 3, xtrf: 35, symbol: "pr", icon: "/static/services/Translation_Localization.png", "active": true, "crud": false, languageForm: "Duo", projectType: "smart", title: "Proofing", source: true, languages: {source: ["AR", "BG", "DA", "DE", "DE-DE", "DE-AT", "DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "ET", "FA", "FI", "FR", "FR-FR", "FR-BE", "HE", "HY", "ID", "IS", "MO", "MR", "MS", "NL-NL", "NL-BE", "PA", "PT-BR", "SK", "TH"], target: ["AR", "BG", "DA", "DE", "DE-DE", "DE-AT", "DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "ET", "FA", "FI", "FR", "FR-FR", "FR-BE", "HE", "HY", "ID", "IS", "MO", "MR", "MS", "NL-NL", "NL-BE", "PA", "PT-BR", "SK", "TH", "AF", "AR-EG", "AR-MA", "AR-SA", "AZ-LN", "BN-IN", "BS", "CS", "ES-419", "ES-AR", "FR-CA", "FR-CH", "HI", "HR", "HU", "IT", "IT-IT", "IT-CH", "JA", "KA", "KK", "KO", "LT", "LV", "NB", "NL", "PL", "PT-PT", "RO", "RU", "SL", "SR-LA", "SV-SE", "TE", "TK", "TL", "TR", "UK", "UR", "UZ", "VI", "ZH-CN", "ZH-SG", "ZH-HK", "ZH-MO", "ZH-TW"]}},
    {sortIndex: 6, xtrf: 11, symbol: "st", formType: "Translation", icon: "/static/services/SEO_Blog_Management.png", "active": true, "crud": false, languageForm: "Duo", projectType: "regular", title: "SEO Translation", source: true, languages: {source: ["AR", "BG", "DA", "DE", "DE-DE", "DE-AT", "DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "ET", "FA", "FI", "FR", "FR-FR", "FR-BE", "HE", "HY", "ID", "IS", "MO", "MR", "MS", "NL-NL", "NL-BE", "PA", "PT-BR", "SK", "TH"], target: ["AR", "BG", "DA", "DE", "DE-DE", "DE-AT", "DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "ET", "FA", "FI", "FR", "FR-FR", "FR-BE", "HE", "HY", "ID", "IS", "MO", "MR", "MS", "NL-NL", "NL-BE", "PA", "PT-BR", "SK", "TH", "AF", "AR-EG", "AR-MA", "AR-SA", "AZ-LN", "BN-IN", "BS", "CS", "ES-419", "ES-AR", "FR-CA", "FR-CH", "HI", "HR", "HU", "IT", "IT-IT", "IT-CH", "JA", "KA", "KK", "KO", "LT", "LV", "NB", "NL", "PL", "PT-PT", "RO", "RU", "SL", "SR-LA", "SV-SE", "TE", "TK", "TL", "TR", "UK", "UR", "UZ", "VI", "ZH-CN", "ZH-SG", "ZH-HK", "ZH-MO", "ZH-TW"]}},
    {sortIndex: 8, xtrf: 12, symbol: "qt", icon: "/static/services/QA_and_Testing.png", "active": true, "crud": false, languageForm: "Duo", projectType: "smart", title: "QA and Testing", source: true, languages: {source: ["AR", "BG", "DA", "DE", "DE-DE", "DE-AT", "DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "ET", "FA", "FI", "FR", "FR-FR", "FR-BE", "HE", "HY", "ID", "IS", "MO", "MR", "MS", "NL-NL", "NL-BE", "PA", "PT-BR", "SK", "TH"], target: ["AR", "BG", "DA", "DE", "DE-DE", "DE-AT", "DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "ET", "FA", "FI", "FR", "FR-FR", "FR-BE", "HE", "HY", "ID", "IS", "MO", "MR", "MS", "NL-NL", "NL-BE", "PA", "PT-BR", "SK", "TH", "AF", "AR-EG", "AR-MA", "AR-SA", "AZ-LN", "BN-IN", "BS", "CS", "ES-419", "ES-AR", "FR-CA", "FR-CH", "HI", "HR", "HU", "IT", "IT-IT", "IT-CH", "JA", "KA", "KK", "KO", "LT", "LV", "NB", "NL", "PL", "PT-PT", "RO", "RU", "SL", "SR-LA", "SV-SE", "TE", "TK", "TL", "TR", "UK", "UR", "UZ", "VI", "ZH-CN", "ZH-SG", "ZH-HK", "ZH-MO", "ZH-TW"]}},
    {sortIndex: 9, xtrf: 25, symbol: "gl", icon: "/static/services/Localized_Graphic_Design.png", "active": true, "crud": false, languageForm: "Duo", projectType: "smart", title: "Graphic Localization", source: true, languages: {source: ["AR", "BG", "DA", "DE", "DE-DE", "DE-AT", "DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "ET", "FA", "FI", "FR", "FR-FR", "FR-BE", "HE", "HY", "ID", "IS", "MO", "MR", "MS", "NL-NL", "NL-BE", "PA", "PT-BR", "SK", "TH"], target: ["AR", "BG", "DA", "DE", "DE-DE", "DE-AT", "DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "ET", "FA", "FI", "FR", "FR-FR", "FR-BE", "HE", "HY", "ID", "IS", "MO", "MR", "MS", "NL-NL", "NL-BE", "PA", "PT-BR", "SK", "TH", "AF", "AR-EG", "AR-MA", "AR-SA", "AZ-LN", "BN-IN", "BS", "CS", "ES-419", "ES-AR", "FR-CA", "FR-CH", "HI", "HR", "HU", "IT", "IT-IT", "IT-CH", "JA", "KA", "KK", "KO", "LT", "LV", "NB", "NL", "PL", "PT-PT", "RO", "RU", "SL", "SR-LA", "SV-SE", "TE", "TK", "TL", "TR", "UK", "UR", "UZ", "VI", "ZH-CN", "ZH-SG", "ZH-HK", "ZH-MO", "ZH-TW"]}},
    {sortIndex: 4, xtrf: 13, symbol: "co", icon: "/static/services/Marketing_Copywriting.png", "active": true, "crud": false, languageForm: "Mono", projectType: "smart", title: "Copywriting", source: false, languages: {source: [], target: ["AR", "AR-EG", "AR-SA", "AR-MA", "DE", "EN", "EN-GB", "EN-US", "ES-ES", "ES-419", "ES-AR", "ES-MX", "FR", "FR-FR", "HE", "IT", "IT-IT", "JA", "NB", "NL", "NL-NL", "PL", "RU", "SV-SE", "TR"]}},
    {sortIndex: 5, xtrf: 13, symbol: "bl", icon: "/static/services/Market_Research.png", "active": true, "crud": false, languageForm: "Mono", projectType: "smart", title: "Blogging", source: false, languages: {source: [], target: ["AR", "AR-EG", "AR-SA", "AR-MA", "DE", "EN", "EN-GB", "EN-US", "ES-ES", "ES-419", "ES-AR", "ES-MX", "FR", "FR-FR", "HE", "IT", "IT-IT", "JA", "NB", "NL", "NL-NL", "PL", "RU", "SV-SE", "TR"]}},
    {sortIndex: 7, xtrf: 13, symbol: "sw", icon: "/static/services/SEO_Blog_Management.png", "active": true, "crud": false, languageForm: "Mono", projectType: "smart", title: "SEO Writing", source: false, languages: {source: [], target: ["AR", "AR-EG", "AR-SA", "AR-MA", "DE", "EN", "EN-GB", "EN-US", "ES-ES", "ES-419", "ES-AR", "ES-MX", "FR", "FR-FR", "HE", "IT", "IT-IT", "JA", "NB", "NL", "NL-NL", "PL", "RU", "SV-SE", "TR"]}},
    {sortIndex: 10, xtrf: 11, symbol: "ot", formType: "Translation", icon: "/static/services/Official_Translations.png", "active": true, "crud": false, languageForm: "Duo", projectType: "regular", title: "Official Translation", source: true, languages: {source: ["DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "FR", "FR-FR", "FR-BE", "HE", "NL-NL", "NL-BE", "PT-BR", "TH"], target: ["DE", "DE-DE", "DE-AT", "DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "FR", "FR-FR", "FR-BE", "HE", "NL-NL", "NL-BE", "PT-BR", "ES-419", "ES-AR", "FR-CA", "FR-CH", "IT", "IT-IT", "IT-CH", "NB", "NL", "PL", "RO", "RU"]}},
];

const industriesDefault = [
    {name: 'iGaming (Casino, Slot games, Gambling, etc.)', rate: 0, icon: '/static/industries/casino-poker-igaming.png', generic: '/static/example.xlsx', active: true},
    {name: 'Poker', rate: 0, icon: '/static/industries/casino-poker-igaming.png', generic: '/static/example.xlsx', active: true},
    {name: 'CFDs & Online Trading', rate: 0,  icon: '/static/industries/cfds-online-tranding.png', generic: '/static/example.xlsx',active: true},
    {name: 'Hotel & Real Estates', rate: 0,  icon: '/static/industries/hotel-real-estates.png', generic: '/static/example.xlsx', active: true},
    {name: 'ICOs & Cryptocurrency', rate: 0,  icon: '/static/industries/icos-cryptocurrency.png', generic: '/static/example.xlsx', active: true},
    {name: 'Legal', rate: 0,  icon: '/static/industries/legal-icon.png', generic: '/static/example.xlsx', active: true},
    {name: 'Video Games', rate: 0,  icon: '/static/industries/video-games.png', generic: ['/static/example.xlsx'], active: true},
    {name: 'More', rate: 0,  icon: '/static/industries/more-icon.png', generic: '/static/example.xlsx', active: true}
];

const projectsDefault = [];

const clientsDefault = [
    {name: "DDD-default", website: "www.ddd.com", status: "Active", contract: "", nda: "", accountManager: "aran.s", salesManager: "eirini.loi", projectManager: "illy.dim", leadSource: "Website", salesComission: "Passed threshold", officialName: "DDD LTD", contactName: "Jack Di", email: "ddd@ddd.com", vat: "", address: "345 DSD Street, Moscow, Russia", wordsRates: [], hoursRates: [], monoRates: [], industries: [{name: "Hotel & Real Estates"}], contacts: [{
        photo: "", firstName: "Sam", surname: "Nolan", email: "sam@ddd.com", gender: "Male", position: "Manager", phone: 12345678, skype: "samNol", country: "Australia", timezone: "(UTC+10:00) Canberra, Melbourne, Sydney", leadContact: true, notes: "", password:"$2a$10$HRZ.Ba0HGe.cIZ8iJN5o4efPszCR5O.nq/evyLxkSVj/Pd8lTIryi"}]
    },
    {name: "EEE-default", website: "www.eee.com", status: "Active", contract: "", nda: "", accountManager: "angela.st", salesManager: "eirini.loi", projectManager: "illy.dim", leadSource: "Internet", salesComission: "Passed threshold", officialName: "EEE LTD", contactName: "Mark Brenson", email: "eee@eee.com", vat: "", address: "Old Street, Warsaw, Poland", wordsRates: [], hoursRates: [], monoRates: [], industries: [{name: "Legal"}], contacts: [{
        photo: "", firstName: "Ella", surname: "Johns", email: "el@eee.com", gender: "Female", position: "Manager", phone: 12345678, skype: "el-jo", country: "Bahamas", timezone: "(UTC-04:00) Georgetown, La Paz, Manaus, San Juan", leadContact: true, notes: "",password:"$2a$10$HRZ.Ba0HGe.cIZ8iJN5o4efPszCR5O.nq/evyLxkSVj/Pd8lTIryi"}]
    },
    {name: "FFF-default", website: "www.fff.com", status: "Inactive", contract: "", nda: "", accountManager: "aran.s", salesManager: "eirini.loi", projectManager: "alexia.m", leadSource: "Friend", salesComission: "Passed threshold", officialName: "FFF LTD", contactName: "Bruce Lee", email: "fff@fff.com", vat: "", address: "32 Ave, Seattle WA, USA", wordsRates: [], hoursRates: [], monoRates: [], industries: [{name: "CFDs & Online Trading"}], contacts: [{
        photo: "", firstName: "Chen", surname: "Dong", email: "chen@fff.com", gender: "Male", position: "Manager", phone: 12345678, skype: "dong", country: "United States of America", timezone: "(UTC-06:00) Central America", leadContact: true, notes: "",password:"$2a$10$HRZ.Ba0HGe.cIZ8iJN5o4efPszCR5O.nq/evyLxkSVj/Pd8lTIryi"}]
    }
];

const vendorsDefault = [
    {photo: "", firstName: "asda-default", surname: "gfglk", status: "Active", email: "asda@ddf.com", phone: "12345678", timezone: "(UTC-04:00) Asuncion", native: "Spanish (Spain)", gender: "Male", skype: "asdadWW", linkedin: "www.linkedin.com/asda", whatsapp: "+4343423423", basicRate: 0.07, tqi: "0-100", website: "ddd.com", companyName: "DDD Ltd", industries: [{name: 'ICOs & Cryptocurrency', rate: 0,  icon: '/static/industries/icos-cryptocurrency.png', "crud": false, download: '/static/Download-icon.png', generic: '/static/example.xlsx', active: true}], wordsRates: [], hoursRates: [], monoRates: []},
    {photo: "", firstName: "gffg-default", surname: "fdbdfb", status: "Active", email: "vdfvasda@bdff.com", phone: "12388968", timezone: "(UTC-04:30) Caracas", native: "English", gender: "Male", skype: "vssdvvwev", linkedin: "www.linkedin.com/fsdf", whatsapp: "+48678678576", basicRate: 0.075, tqi: "0-400", website: "bdfd.com", companyName: "TTT Ltd", industries: [{name: 'Legal', rate: 0,  icon: '/static/industries/legal-icon.png', "crud": false, download: '/static/Download-icon.png', generic: '/static/example.xlsx', active: true}], wordsRates: [], hoursRates: [], monoRates: []},
    {photo: "", firstName: "asetert-default", surname: "bdbcvbe", status: "Inactive", email: "berberber@ytrtdf.com", phone: "15487678", timezone: "(UTC) Casablanca", native: "French (France)", gender: "Female", skype: "hjghjty", linkedin: "www.linkedin.com/fwefwe", whatsapp: "+97674845567", basicRate: 0.068, tqi: "0-300", website: "uuytt.com", companyName: "GTR Ltd", industries: [{name: 'ICOs & Cryptocurrency', rate: 0,  icon: '/static/industries/icos-cryptocurrency.png', "crud": false, download: '/static/Download-icon.png', generic: '/static/example.xlsx', active: true}], wordsRates: [], hoursRates: [], monoRates: []}
];

const timezonesDefault = [
    "(UTC-12:00) International Date Line West",
    "(UTC-11:00) Coordinated Universal Time-11",
    "(UTC-10:00) Hawaii",
    "(UTC-09:00) Alaska",
    "(UTC-08:00) Baja California",
    "(UTC-07:00) Pacific Time (US & Canada)",
    "(UTC-08:00) Pacific Time (US & Canada)",
    "(UTC-07:00) Arizona",
    "(UTC-07:00) Chihuahua, La Paz, Mazatlan",
    "(UTC-07:00) Mountain Time (US & Canada)",
    "(UTC-06:00) Central America",
    "(UTC-06:00) Central Time (US & Canada)",
    "(UTC-06:00) Guadalajara, Mexico City, Monterrey",
    "(UTC-06:00) Saskatchewan",
    "(UTC-05:00) Bogota, Lima, Quito",
    "(UTC-05:00) Eastern Time (US & Canada)",
    "(UTC-05:00) Indiana (East)",
    "(UTC-04:30) Caracas",
    "(UTC-04:00) Asuncion",
    "(UTC-04:00) Atlantic Time (Canada)",
    "(UTC-04:00) Cuiaba",
    "(UTC-04:00) Georgetown, La Paz, Manaus, San Juan",
    "(UTC-04:00) Santiago",
    "(UTC-03:30) Newfoundland",
    "(UTC-03:00) Brasilia",
    "(UTC-03:00) Buenos Aires",
    "(UTC-03:00) Cayenne, Fortaleza",
    "(UTC-03:00) Greenland",
    "(UTC-03:00) Montevideo",
    "(UTC-03:00) Salvador",
    "(UTC-02:00) Coordinated Universal Time-02",
    "(UTC-02:00) Mid-Atlantic - Old",
    "(UTC-01:00) Azores",
    "(UTC-01:00) Cape Verde Is.",
    "(UTC) Casablanca",
    "(UTC) Coordinated Universal Time",
    "(UTC) Edinburgh, London",
    "(UTC+01:00) Edinburgh, London",
    "(UTC) Dublin, Lisbon",
    "(UTC) Monrovia, Reykjavik",
    "(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna",
    "(UTC+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague",
    "(UTC+01:00) Brussels, Copenhagen, Madrid, Paris",
    "(UTC+01:00) Sarajevo, Skopje, Warsaw, Zagreb",
    "(UTC+01:00) West Central Africa",
    "(UTC+01:00) Windhoek",
    "(UTC+02:00) Athens, Bucharest",
    "(UTC+02:00) Beirut",
    "(UTC+02:00) Cairo",
    "(UTC+02:00) Damascus",
    "(UTC+02:00) E. Europe",
    "(UTC+02:00) Harare, Pretoria",
    "(UTC+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius",
    "(UTC+03:00) Istanbul",
    "(UTC+02:00) Jerusalem",
    "(UTC+02:00) Tripoli",
    "(UTC+03:00) Amman",
    "(UTC+03:00) Baghdad",
    "(UTC+03:00) Kaliningrad, Minsk",
    "(UTC+03:00) Kuwait, Riyadh",
    "(UTC+03:00) Nairobi",
    "(UTC+03:00) Moscow, St. Petersburg, Volgograd",
    "(UTC+04:00) Samara, Ulyanovsk, Saratov",
    "(UTC+03:30) Tehran",
    "(UTC+04:00) Abu Dhabi, Muscat",
    "(UTC+04:00) Baku",
    "(UTC+04:00) Port Louis",
    "(UTC+04:00) Tbilisi",
    "(UTC+04:00) Yerevan",
    "(UTC+04:30) Kabul",
    "(UTC+05:00) Ashgabat, Tashkent",
    "(UTC+05:00) Yekaterinburg",
    "(UTC+05:00) Islamabad, Karachi",
    "(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi",
    "(UTC+05:30) Sri Jayawardenepura",
    "(UTC+05:45) Kathmandu",
    "(UTC+06:00) Astana",
    "(UTC+06:00) Dhaka",
    "(UTC+06:30) Yangon (Rangoon)",
    "(UTC+07:00) Bangkok, Hanoi, Jakarta",
    "(UTC+07:00) Novosibirsk",
    "(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi",
    "(UTC+08:00) Krasnoyarsk",
    "(UTC+08:00) Kuala Lumpur, Singapore",
    "(UTC+08:00) Perth",
    "(UTC+08:00) Taipei",
    "(UTC+08:00) Ulaanbaatar",
    "(UTC+09:00) Irkutsk",
    "(UTC+09:00) Osaka, Sapporo, Tokyo",
    "(UTC+09:00) Seoul",
    "(UTC+09:30) Adelaide",
    "(UTC+09:30) Darwin",
    "(UTC+10:00) Brisbane",
    "(UTC+10:00) Canberra, Melbourne, Sydney",
    "(UTC+10:00) Guam, Port Moresby",
    "(UTC+10:00) Hobart",
    "(UTC+10:00) Yakutsk",
    "(UTC+11:00) Solomon Is., New Caledonia",
    "(UTC+11:00) Vladivostok",
    "(UTC+12:00) Auckland, Wellington",
    "(UTC+12:00) Coordinated Universal Time+12",
    "(UTC+12:00) Fiji",
    "(UTC+12:00) Magadan",
    "(UTC+12:00) Petropavlovsk-Kamchatsky - Old",
    "(UTC+13:00) Nuku'alofa",
    "(UTC+13:00) Samoa"
]

const emptyMatrix = {
    xTranslated: {text: "X translated", value: 0},
    repeat: {text: "Repetition", value: 0},
    contextMatch: {text: "Context match", value: 0},
    repeat100: {text: "100%", value: 0},
    repeat50: {text: "50-74%", value: 0},
    repeat75: {text: "75-84%", value: 0},
    repeat85: {text: "85-94%", value: 0},
    repeat95: {text: "95-99%", value: 0},
    noMatch: {text: "No match", value: 1}
}

const instructionsDefault = [
    {type: "Test", content: "Test content", isSpecific: false},
    {type: "Test specified", content: "Test content specified", isSpecific: true},
]

const cancelReasonsDefault = [
    {reason: "Reason 1"}, {reason: "Reason 2"}, {reason: "Reason 3"}
]

const tierLqasDefault = [
    {category: "1", lqa1: "10000", lqa2: "50000", lqa3: "100000"},
    {category: "2", lqa1: "5000", lqa2: "25000", lqa3: "50000"},
    {category: "3", lqa1: "1000", lqa2: "5000", lqa3: "10000"}
]

const unitsDefault = [
  {
    type: 'CAT Wordcount', active: true, editable: false,
  },
  {
    type: 'Packages', active: true, editable: false,
  },
  {
    type: 'Hours', active: true, editable: false,
  },
]

const defaultValue = {
    languagesDefault,
    requestsDefault,
    projectsDefault,
    usersDefault,
    servicesDefault,
    industriesDefault,
    timezonesDefault,
    clientsDefault,
    vendorsDefault,
    leadSourcesDefault,
    groupsDefault,
    stepsDefault,
    emptyMatrix,
    instructionsDefault,
    cancelReasonsDefault,
    tierLqasDefault,
    unitsDefault
};

module.exports = defaultValue;
