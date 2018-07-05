
const languagesDefault = [
    {"lang":"Afrikaans", "icon": "/static/flags31x21pix/Afrikaans[AF].png", "symbol":"AF", "iso1":"af", "iso2":"afr", "direction":"in", "crud": false, "active": true, "check": false,},
    {"lang":"Arabic", "icon":"/static/flags31x21pix/Arabic[AR].png", "symbol":"AR", "iso1":"ar-AA", "iso2":"ara", "direction":"both", "crud": false, "active": true, "check": false, "dialects":[{"lang":"Arabic(Saudi Arabia)", "icon":"/static/flags31x21pix/Arabic[AR-SA].png", "symbol":"AR-SA", "iso1":"ar-SA", "iso2":"ara-SA", "direction":"in", "crud": false, "check": false, "active": true},{"lang":"Arabic (Egypt)", "icon":"/static/flags31x21pix/Arabic[AR-EG].png", "symbol":"AR-EG", "iso1":"ar-EG", "iso2":"ara-EG", "direction":"in", "crud": false, "check": false, "active": true},{"lang":"Arabic (Morocco)", "icon":"/static/flags31x21pix/Arabic[AR-MA].png", "symbol":"AR-MA", "iso1":"ar-MA", "iso2":"ara-MA", "direction":"in", "crud": false, "check": false, "active": true}]},
    {"lang":"Azerbaijani (Latin)", "icon":"/static/flags31x21pix/Azerbaijani[AZ-LN].png", "symbol":"AZ-LN", "iso1":"az-AZ-Latin", "iso2":"aze", "direction":"in", "crud": false, "active": true, "check": false,},
    {"lang":"Bulgarian", "icon":"/static/flags31x21pix/Bulgarian[BG].png", "symbol":"BG", "iso1":"bg-BG", "iso2":"bul", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Bengali (Indida)", "icon":"/static/flags31x21pix/Bengali[BN-IN].png", "symbol":"BN-IN", "iso1":"bn_IN", "iso2":"ben_IN", "direction":"in", "crud": false, "active": true, "check": false,},
    {"lang":"Bosnian", "icon":"/static/flags31x21pix/Bosnian[BS].png", "symbol":"BS", "iso1":"bs", "iso2":"bos", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Czech", "icon":"/static/flags31x21pix/Czech[CS].png", "symbol":"CS", "iso1":"cz-CZ", "iso2":"cze", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Danish", "icon":"/static/flags31x21pix/Danish[DA].png", "symbol":"DA", "iso1":"da-DK", "iso2":"dan", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Dutch", "icon":"/static/flags31x21pix/Dutch[NL].png", "symbol":"NL","direction":"both", "iso1":"nl", "iso2":"dut", "crud": false, "active": true, "check": false, "dialects":[{"lang":"Dutch (Netherlands)", "icon":"/static/flags31x21pix/Dutch[NL-NL].png", "symbol":"NL-NL", "iso1":"nl-NL", "iso2":"dut-NL", "direction":"both", "crud": false, "check": false, "active": true},{"lang":"Flemish", "icon":"/static/flags31x21pix/Flemish[NL-BE].png", "symbol":"NL-BE", "iso1":"nl-BE", "iso2":"dut-BE", "direction":"both", "crud": false, "check": false, "active": true}]},    
    {"lang":"German", "icon":"/static/flags31x21pix/German[DE].png", "symbol":"DE", "iso1":"de", "iso2":"ger", "diraction":"both", "crud": false, "active": true, "check": false, "dialects":[{"lang":"German (Germany)", "icon":"/static/flags31x21pix/German[DE-DE].png", "symbol":"DE-DE", "iso1":"de-DE", "iso2":"ger-DE", "direction":"both", "crud": false, "check": false, "active": true},{"lang":"German (Austria)", "icon":"/static/flags31x21pix/German[DE-AT].png", "symbol":"DE-AT", "iso1":"de-AT", "ger-AT":"afr", "direction":"both", "crud": false, "check": false, "active": true},{"lang":"German (Switzerland)", "icon":"/static/flags31x21pix/German[DE-CH].png", "symbol":"DE-CH", "iso1":"de-CH", "iso2":"ger-CH", "direction":"both", "crud": false, "check": false, "active": true}]},
    {"lang":"Greek", "icon":"/static/flags31x21pix/Greek[EL].png", "symbol":"EL", "iso1":"el-GR", "iso2":"gre", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"English", "symbol":"EN", "icon":"/static/flags31x21pix/English_English[EN-GB].png", "iso1":"en", "iso2":"eng", "direction":"both", "crud": false, "active": true, "check": false, "dialects":[{"lang":"English (United Kingdom)", "icon":"/static/flags31x21pix/English_English[EN-GB].png", "symbol":"EN-GB", "iso1":"en-GB", "iso2":"eng-GB", "direction":"both", "crud": false, "check": false, "active": true},{"lang":"English (United States)", "icon":"/static/flags31x21pix/English[EN-US].png", "symbol":"EN-US", "iso1":"en-US", "iso2":"eng-US", "direction":"both", "crud": false, "check": false, "active": true}]},
    {"lang":"Spanish (Spain)", "icon":"/static/flags31x21pix/Spanish[ES-ES].png", "symbol":"ES-ES", "iso1":"es-ES", "iso2":"spa-ES", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Spanish (Latin America)", "icon":"/static/flags31x21pix/Spanish[ES-419].png", "iso1":"es-AR", "iso2":"spa-419", "direction":"in", "crud": false, "active": true, "check": false, "symbol":"ES-419","dialects":[{"lang":"Spanish (Argentina)", "icon":"/static/flags31x21pix/Spanish[ES-AR].png", "symbol":"ES-AR","direction":"in", "crud": false, "check": false, "active": true},{"lang":"Spanish (Mexico)","symbol":"ES-MX", "icon":"/static/flags31x21pix/Spanish[ES-MX].png", "direction":"both", "crud": false, "check": false, "active": true}]},
    {"lang":"Estonian", "icon":"/static/flags31x21pix/Estonian[ET].png", "symbol":"ET", "iso1":"et-EE", "iso2":"est", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Farsi (Persian)", "icon":"/static/flags31x21pix/Farsi[FA].png", "symbol":"FA", "iso1":"fa-IR", "iso2":"ger", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Finnish", "icon":"/static/flags31x21pix/Finnish[FI].png", "symbol":"FI", "iso1":"fi-FI", "iso2":"fin", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"French", "symbol":"FR", "icon":"/static/flags31x21pix/French[FR-FR].png", "iso1":"fr", "iso2":"fre", "direction":"both", "crud": false, "active": true, "check": false, "dialects":[{"lang":"French (France)", "icon":"/static/flags31x21pix/French[FR-FR].png", "symbol":"FR-FR", "iso1":"fr-FR", "iso2":"fre-FR", "direction":"both", "crud": false, "check": false, "active": true},{"lang":"French (Belgium)", "icon":"/static/flags31x21pix/French[FR-BE].png", "symbol":"FR-BE", "iso1":"fr-BE", "iso2":"fre-BE", "direction":"both", "crud": false, "check": false, "active": true},{"lang":"French (Canada)", "icon":"/static/flags31x21pix/French[FR-CA].png", "symbol":"FR-CA", "iso1":"fr-CA", "iso2":"fre-CA", "direction":"in", "crud": false, "check": false, "active": true},{"lang":"French (Switzerland)", "icon":"/static/flags31x21pix/French[FR-CH].png", "symbol":"FR-CH", "iso1":"fr-CH", "iso2":"fre-CH", "direction":"in", "crud": false, "check": false, "active": true}]},
    {"lang":"Hebrew", "icon":"/static/flags31x21pix/Hebrew[HE].png", "symbol":"HE", "iso1":"he-IL", "iso2":"heb", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Hindi", "icon":"/static/flags31x21pix/Hindi[HI].png", "symbol":"HI", "iso1":"hi-IN", "iso2":"hin", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Croatian", "icon":"/static/flags31x21pix/Croatian[HR].png", "symbol":"HR", "iso1":"hr-HR", "iso2":"hrv", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Hungarian", "icon":"/static/flags31x21pix/Hungarian[HU].png", "symbol":"HU", "iso1":"hu-HU", "iso2":"hun", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Armenian", "icon":"/static/flags31x21pix/Armenian[HY].png", "symbol":"HY", "iso1":"hy-AM", "iso2":"hye", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Indonesian", "icon":"/static/flags31x21pix/Indonesian[ID].png", "symbol":"ID", "iso1":"id-ID", "iso2":"ind", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Icelandic", "icon":"/static/flags31x21pix/Icelandic[IS].png", "symbol":"IS", "iso1":"is-IS", "iso2":"ice", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Italian", "icon":"/static/flags31x21pix/Italian[IT].png", "symbol":"IT", "iso1":"it", "iso2":"ita", "direction":"in", "crud": false, "active": true, "check": false, "dialects":[{"lang":"Italian (Italy)", "icon":"/static/flags31x21pix/Italian[IT-IT].png", "symbol":"IT-IT", "iso1":"it-IT", "iso2":"ita-IT", "direction":"in", "crud": false, "check": false, "active": true},{"lang":"Italian (Switzerland)", "icon":"/static/flags31x21pix/Italian[IT-CH].png", "symbol":"IT-CH", "iso1":"it-CH", "iso2":"ita-CH", "direction":"in", "crud": false, "check": false, "active": true}]},
    {"lang":"Japanese", "icon":"/static/flags31x21pix/Japanese[JA].png", "symbol":"JA", "iso1":"ja-JP", "iso2":"jpn", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Georgian", "icon":"/static/flags31x21pix/Georgian[KA].png", "symbol":"KA", "iso1":"ka-GE", "iso2":"kat", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Kazakh", "icon":"/static/flags31x21pix/Kazakh[KK].png", "symbol":"KK", "iso1":"kk-KZ", "iso2":"kaz", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Korean", "icon":"/static/flags31x21pix/Korean[KO].png", "symbol":"KO", "iso1":"ko-KR", "iso2":"kor", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Lithuanian", "icon":"/static/flags31x21pix/Lithuanian[LT].png", "symbol":"LT", "iso1":"lt-LT", "iso2":"lit", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Latvian", "icon":"/static/flags31x21pix/Latvian[LV].png", "symbol":"LV", "iso1":"lv-LV", "iso2":"lav", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Moldavian", "icon":"/static/flags31x21pix/Moldavian[MO].png", "symbol":"MO", "iso1":"mo-MD", "iso2":"mol", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Marathi", "icon":"/static/flags31x21pix/Marathi[MR].png", "symbol":"MR", "iso1":"mr-IN", "iso2":"mar", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Malay", "icon":"/static/flags31x21pix/Malay[MS].png", "symbol":"MS", "iso1":"ms-MY", "iso2":"msa", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Norwegian (Bokmaal)", "icon":"/static/flags31x21pix/Norwegian[NB].png", "symbol":"NB", "iso1":"nb-NO", "iso2":"nnb", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Punjabi", "icon":"/static/flags31x21pix/Punjabi[PA].png", "symbol":"PA", "iso1":"pa-PA", "iso2":"pan", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Polish", "icon":"/static/flags31x21pix/Polish[PL].png", "symbol":"PL", "iso1":"de", "iso2":"ger", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Portuguese (Brazil)", "icon":"/static/flags31x21pix/Portuguese[PT-BR].png", "symbol":"PT-BR", "iso1":"pt-BR", "iso2":"por-BR", "direction":"both", "crud": false, "active": true, "check": false,},
    {"lang":"Portuguese (Portugal)", "icon":"/static/flags31x21pix/Portuguese[PT-PT].png", "symbol":"PT-PT", "iso1":"pt-PT", "iso2":"por-PT", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Romanian", "icon":"/static/flags31x21pix/Romanian[RO].png", "symbol":"RO", "iso1":"ro-RO", "iso2":"rum", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Russian", "icon":"/static/flags31x21pix/Russian[RU].png", "symbol":"RU", "iso1":"ru-RU", "iso2":"rus", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Slovak", "icon":"/static/flags31x21pix/Slovak[SK].png", "symbol":"SK", "iso1":"sk-SK", "iso2":"slo","direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Slovenian", "icon":"/static/flags31x21pix/Slovenian[SL].png", "symbol":"SL", "iso1":"sl-SL", "iso2":"slv", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Serbian (Latin)", "icon":"/static/flags31x21pix/Serbian[SR-LA].png", "symbol":"SR-LA", "iso1":"sr-LA", "iso2":"scr", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Swedish (Sweden)", "icon":"/static/flags31x21pix/Swedish[SV-SE].png", "symbol":"SV-SE", "iso1":"sv-SE", "iso2":"swe-SE", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Telugu", "symbol":"TE", "icon":"/static/flags31x21pix/Telugu[TE].png", "iso1":"te-IN", "iso2":"tel", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Thai", "icon":"/static/flags31x21pix/Thai[TH].png", "symbol":"TH", "iso1":"th-TH", "iso2":"tai", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Turkmen", "icon":"/static/flags31x21pix/Turkmen[TK].png", "symbol":"TK", "iso1":"tk-TM", "iso2":"tuk", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Tagalog", "icon":"/static/flags31x21pix/Tagalog[TL].png", "symbol":"TL", "iso1":"tl-PH", "iso2":"tgl", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Turkish", "icon":"/static/flags31x21pix/Turkish[TR].png", "symbol":"TR", "iso1":"tr-TR", "iso2":"tur", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Ukrainian", "icon":"/static/flags31x21pix/Ukrainian[UK].png", "symbol":"UK", "iso1":"uk-UA", "iso2":"ukr", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Urdu", "icon":"/static/flags31x21pix/Urdu[UR].png", "symbol":"UR", "iso1":"ur-IN", "iso2":"urd", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Uzbek", "icon":"/static/flags31x21pix/Uzbek[UZ].png", "symbol":"UZ", "iso1":"uz-UZ-Latn", "iso2":"uzb", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Vietnamese", "icon":"/static/flags31x21pix/Vietnamese[VI].png", "symbol":"VI", "iso1":"vi-VN", "iso2":"vie", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Chinese Simplified", "icon":"/static/flags31x21pix/SimplifiedChinese_Chinese[ZH-CN]_TraditionalChinese.png", "symbol":"ZH-CN", "iso1":"zn-CN", "iso2":"zho-CN", "direction":"in", "crud": false, "active": true, "dialects":[{"lang":"Chinese (China)", "symbol":"ZH-CN", "icon":"/static/flags31x21pix/SimplifiedChinese_Chinese[ZH-CN]_TraditionalChinese.png", "iso1":"zn-CN", "iso2":"zho-CN", "direction":"in", "crud": false, "check": false, "active": true},{"lang":"Chinese (Singapore)", "icon":"/static/flags31x21pix/Chinese[ZH-SG].png", "symbol":"ZH-SG", "iso1":"zn-SG", "iso2":"zho-SG", "direction":"in", "crud": false, "check": false, "active": true}]},
    {"lang":"Chinese Traditional","symbol":"ZH-CN", "icon":"/static/flags31x21pix/SimplifiedChinese_Chinese[ZH-CN]_TraditionalChinese.png", "iso1":"zn-CN", "iso2":"zho-CN", "direction":"in", "crud": false, "active": true, "dialects":[{"lang":"Chinese (Hong Kong)", "icon":"/static/flags31x21pix/Chinese[ZH-HK].png", "symbol":"ZH-HK", "iso1":"zn-HK", "iso2":"zho-HK", "direction":"in", "crud": false, "check": false, "active": true},{"lang":"Chinese (Macao)", "icon":"/static/flags31x21pix/Chinese[ZH-MO].png", "symbol":"ZH-MO", "iso1":"zn-MO", "iso2":"zho-MO", "direction":"in", "crud": false, "active": true},{"lang":"Chinese (Taiwan)","icon":"/static/flags31x21pix/Chinese[ZH-TW].png", "symbol":"ZH-TW", "iso1":"zn-TW", "iso2":"zho-TW", "direction":"in", "crud": false, "check": false, "active": true}]},
];
const requestsDefault = [
    {
        date: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        contactName: "Jhon",
        contactEmail: "jhon@email.com", 
        service: {title: "Translation"}, 
        industry: "Games", 
        status: "Open", 
        accountManager: "manager1", 
        web: "ap.com", 
        skype: "asd", 
        phone: "123456789", 
        companyName: "Apple"
    },
    { 
        date: new Date(new Date().setMonth(new Date().getMonth() - 2)), 
        contactName: "Elen", 
        contactEmail: "elen@email.com", 
        service: {title: "Design"}, 
        industry: "Real Estate", 
        status: "Canceled", 
        accountManager: "manager2", 
        web: "sam.com", 
        skype: "qwe", 
        phone: "123456789", 
        companyName: "Samsung" 
    },
    { 
        date: new Date(new Date().setMonth(new Date().getMonth() - 3)), 
        contactName: "Andrew", 
        contactEmail: "andrew@email.com", 
        service: {title: "Translation"}, 
        industry: "Casino", 
        status: "Assigned", 
        accountManager: "manager2", 
        web: "ea.com", 
        skype: "gfd", 
        phone: "123456789", 
        companyName: "EA-Sports" 
    },
    { 
        date: new Date(new Date().setMonth(new Date().getMonth() - 4)), 
        contactName: "George", 
        contactEmail: "george@email.com", 
        service: {title: "Copywriting"}, 
        industry: "Other", 
        status: "Close", 
        accountManager: "manager1", 
        web: "vul.com", 
        skype: "hgfd", 
        phone: "123456789", 
        companyName: "Vulcan" 
    },
    { 
        date: new Date(new Date().setMonth(new Date().getMonth() - 5)), 
        contactName: "Mike", 
        contactEmail: "mike@email.com", 
        service: {title: "Graphic design"}, 
        industry: "Cryptocurrency", 
        status: "Assigned", 
        accountManager: "manager1", 
        web: "cont.com", 
        skype: "rty", 
        phone: "123456879", 
        companyName: "Continental" },
    { 
        date: new Date(new Date().setMonth(new Date().getMonth())), 
        contactName: "Nathan", 
        contactEmail: "nathan@email.com", 
        service: {title: "Copywriting"}, 
        industry: "Games", 
        status: "New", 
        accountManager: "manager3", 
        web: "ms.com", 
        skype: "uyuyu", 
        phone: "123456789", 
        companyName: "Microsoft" 
    }            
];
const usersDefault = [
    { email: 'test@test.com', password: '12345', username: 'Petia' }
];

const servicesDefault = [
    {sortIndex: 1, xtrf: 11, icon: "/static/services/Translation_Localization.png", "active": true, "crud": false, languageForm: "Mono", calculationUnit: "Words", projectType: "regular", title: "Translation", source: true, languages: {source: ["AR", "BG", "DA", "DE", "DE-DE", "DE-AT", "DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "ET", "FA", "FI", "FR", "FR-FR", "FR-BE", "HE", "HY", "ID", "IS", "MO", "MR", "MS", "NL-NL", "NL-BE", "PA", "PT-BR", "SK", "TH"], target: ["AR", "BG", "DA", "DE", "DE-DE", "DE-AT", "DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "ET", "FA", "FI", "FR", "FR-FR", "FR-BE", "HE", "HY", "ID", "IS", "MO", "MR", "MS", "NL-NL", "NL-BE", "PA", "PT-BR", "SK", "TH", "AF", "AR-EG", "AR-MA", "AR-SA", "AZ-LN", "BN-IN", "BS", "CS", "ES-419", "ES-AR", "FR-CA", "FR-CH", "HI", "HR", "HU", "IT", "IT-IT", "IT-CH", "JA", "KA", "KK", "KO", "LT", "LV", "NB", "NL", "PL", "PT-PT", "RO", "RU", "SL", "SR-LA", "SV-SE", "TE", "TK", "TL", "TR", "UK", "UR", "UZ", "VI", "ZH-CN", "ZH-SG", "ZH-HK", "ZH-MO", "ZH-TW"]}},
    {sortIndex: 2, xtrf: 11, icon: "/static/services/Translation_Localization.png", "active": true, "crud": false, languageForm: "Mono", calculationUnit: "Words", projectType: "regular", title: "Localization", source: true, languages: {source: ["AR", "BG", "DA", "DE", "DE-DE", "DE-AT", "DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "ET", "FA", "FI", "FR", "FR-FR", "FR-BE", "HE", "HY", "ID", "IS", "MO", "MR", "MS", "NL-NL", "NL-BE", "PA", "PT-BR", "SK", "TH"], target: ["AR", "BG", "DA", "DE", "DE-DE", "DE-AT", "DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "ET", "FA", "FI", "FR", "FR-FR", "FR-BE", "HE", "HY", "ID", "IS", "MO", "MR", "MS", "NL-NL", "NL-BE", "PA", "PT-BR", "SK", "TH", "AF", "AR-EG", "AR-MA", "AR-SA", "AZ-LN", "BN-IN", "BS", "CS", "ES-419", "ES-AR", "FR-CA", "FR-CH", "HI", "HR", "HU", "IT", "IT-IT", "IT-CH", "JA", "KA", "KK", "KO", "LT", "LV", "NB", "NL", "PL", "PT-PT", "RO", "RU", "SL", "SR-LA", "SV-SE", "TE", "TK", "TL", "TR", "UK", "UR", "UZ", "VI", "ZH-CN", "ZH-SG", "ZH-HK", "ZH-MO", "ZH-TW"]}},
    {sortIndex: 3, xtrf: 35, icon: "/static/services/Translation_Localization.png", "active": true, "crud": false, languageForm: "Mono", calculationUnit: "Words", projectType: "smart", title: "Proofing", source: true, languages: {source: ["AR", "BG", "DA", "DE", "DE-DE", "DE-AT", "DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "ET", "FA", "FI", "FR", "FR-FR", "FR-BE", "HE", "HY", "ID", "IS", "MO", "MR", "MS", "NL-NL", "NL-BE", "PA", "PT-BR", "SK", "TH"], target: ["AR", "BG", "DA", "DE", "DE-DE", "DE-AT", "DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "ET", "FA", "FI", "FR", "FR-FR", "FR-BE", "HE", "HY", "ID", "IS", "MO", "MR", "MS", "NL-NL", "NL-BE", "PA", "PT-BR", "SK", "TH", "AF", "AR-EG", "AR-MA", "AR-SA", "AZ-LN", "BN-IN", "BS", "CS", "ES-419", "ES-AR", "FR-CA", "FR-CH", "HI", "HR", "HU", "IT", "IT-IT", "IT-CH", "JA", "KA", "KK", "KO", "LT", "LV", "NB", "NL", "PL", "PT-PT", "RO", "RU", "SL", "SR-LA", "SV-SE", "TE", "TK", "TL", "TR", "UK", "UR", "UZ", "VI", "ZH-CN", "ZH-SG", "ZH-HK", "ZH-MO", "ZH-TW"]}},
    {sortIndex: 6, xtrf: 11, icon: "/static/services/SEO_Blog_Management.png", "active": true, "crud": false, languageForm: "Mono", calculationUnit: "Words", projectType: "regular", title: "SEO Translation", source: true, languages: {source: ["AR", "BG", "DA", "DE", "DE-DE", "DE-AT", "DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "ET", "FA", "FI", "FR", "FR-FR", "FR-BE", "HE", "HY", "ID", "IS", "MO", "MR", "MS", "NL-NL", "NL-BE", "PA", "PT-BR", "SK", "TH"], target: ["AR", "BG", "DA", "DE", "DE-DE", "DE-AT", "DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "ET", "FA", "FI", "FR", "FR-FR", "FR-BE", "HE", "HY", "ID", "IS", "MO", "MR", "MS", "NL-NL", "NL-BE", "PA", "PT-BR", "SK", "TH", "AF", "AR-EG", "AR-MA", "AR-SA", "AZ-LN", "BN-IN", "BS", "CS", "ES-419", "ES-AR", "FR-CA", "FR-CH", "HI", "HR", "HU", "IT", "IT-IT", "IT-CH", "JA", "KA", "KK", "KO", "LT", "LV", "NB", "NL", "PL", "PT-PT", "RO", "RU", "SL", "SR-LA", "SV-SE", "TE", "TK", "TL", "TR", "UK", "UR", "UZ", "VI", "ZH-CN", "ZH-SG", "ZH-HK", "ZH-MO", "ZH-TW"]}},
    {sortIndex: 8, xtrf: 12, icon: "/static/services/QA_and_Testing.png", "active": true, "crud": false, languageForm: "Mono", calculationUnit: "Words", projectType: "smart", title: "QA and Testing", source: true, languages: {source: ["AR", "BG", "DA", "DE", "DE-DE", "DE-AT", "DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "ET", "FA", "FI", "FR", "FR-FR", "FR-BE", "HE", "HY", "ID", "IS", "MO", "MR", "MS", "NL-NL", "NL-BE", "PA", "PT-BR", "SK", "TH"], target: ["AR", "BG", "DA", "DE", "DE-DE", "DE-AT", "DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "ET", "FA", "FI", "FR", "FR-FR", "FR-BE", "HE", "HY", "ID", "IS", "MO", "MR", "MS", "NL-NL", "NL-BE", "PA", "PT-BR", "SK", "TH", "AF", "AR-EG", "AR-MA", "AR-SA", "AZ-LN", "BN-IN", "BS", "CS", "ES-419", "ES-AR", "FR-CA", "FR-CH", "HI", "HR", "HU", "IT", "IT-IT", "IT-CH", "JA", "KA", "KK", "KO", "LT", "LV", "NB", "NL", "PL", "PT-PT", "RO", "RU", "SL", "SR-LA", "SV-SE", "TE", "TK", "TL", "TR", "UK", "UR", "UZ", "VI", "ZH-CN", "ZH-SG", "ZH-HK", "ZH-MO", "ZH-TW"]}},
    {sortIndex: 9, xtrf: 25, icon: "/static/services/Localized_Graphic_Design.png", "active": true, "crud": false, languageForm: "Mono", calculationUnit: "Words", projectType: "smart", title: "Graphic Localization", source: true, languages: {source: ["AR", "BG", "DA", "DE", "DE-DE", "DE-AT", "DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "ET", "FA", "FI", "FR", "FR-FR", "FR-BE", "HE", "HY", "ID", "IS", "MO", "MR", "MS", "NL-NL", "NL-BE", "PA", "PT-BR", "SK", "TH"], target: ["AR", "BG", "DA", "DE", "DE-DE", "DE-AT", "DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "ET", "FA", "FI", "FR", "FR-FR", "FR-BE", "HE", "HY", "ID", "IS", "MO", "MR", "MS", "NL-NL", "NL-BE", "PA", "PT-BR", "SK", "TH", "AF", "AR-EG", "AR-MA", "AR-SA", "AZ-LN", "BN-IN", "BS", "CS", "ES-419", "ES-AR", "FR-CA", "FR-CH", "HI", "HR", "HU", "IT", "IT-IT", "IT-CH", "JA", "KA", "KK", "KO", "LT", "LV", "NB", "NL", "PL", "PT-PT", "RO", "RU", "SL", "SR-LA", "SV-SE", "TE", "TK", "TL", "TR", "UK", "UR", "UZ", "VI", "ZH-CN", "ZH-SG", "ZH-HK", "ZH-MO", "ZH-TW"]}},
    {sortIndex: 4, xtrf: 13, icon: "/static/services/Marketing_Copywriting.png", "active": true, "crud": false, languageForm: "Mono", calculationUnit: "Words", projectType: "smart", title: "Copywriting", source: false, languages: {source: [], target: ["AR", "AR-EG", "AR-SA", "AR-MA", "DE", "EN", "EN-GB", "EN-US", "ES-ES", "ES-419", "ES-AR", "ES-MX", "FR", "FR-FR", "HE", "IT", "IT-IT", "JA", "NB", "NL", "NL-NL", "PL", "RU", "SV-SE", "TR"]}},
    {sortIndex: 5, xtrf: 13, icon: "/static/services/Market_Research.png", "active": true, "crud": false, languageForm: "Mono", calculationUnit: "Words", projectType: "smart", title: "Blogging", source: false, languages: {source: [], target: ["AR", "AR-EG", "AR-SA", "AR-MA", "DE", "EN", "EN-GB", "EN-US", "ES-ES", "ES-419", "ES-AR", "ES-MX", "FR", "FR-FR", "HE", "IT", "IT-IT", "JA", "NB", "NL", "NL-NL", "PL", "RU", "SV-SE", "TR"]}},
    {sortIndex: 7, xtrf: 13, icon: "/static/services/SEO_Blog_Management.png", "active": true, "crud": false, languageForm: "Mono", calculationUnit: "Words", projectType: "smart", title: "SEO Writing", source: false, languages: {source: [], target: ["AR", "AR-EG", "AR-SA", "AR-MA", "DE", "EN", "EN-GB", "EN-US", "ES-ES", "ES-419", "ES-AR", "ES-MX", "FR", "FR-FR", "HE", "IT", "IT-IT", "JA", "NB", "NL", "NL-NL", "PL", "RU", "SV-SE", "TR"]}},
    {sortIndex: 10, xtrf: 11, icon: "/static/services/Official_Translations.png", "active": true, "crud": false, languageForm: "Mono", calculationUnit: "Words", projectType: "regular", title: "Official Translation", source: true, languages: {source: ["DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "FR", "FR-FR", "FR-BE", "HE", "NL-NL", "NL-BE", "PT-BR", "TH"], target: ["DE", "DE-DE", "DE-AT", "DE-CH", "EL", "EN", "EN-GB", "EN-US", "ES-ES", "ES-MX", "FR", "FR-FR", "FR-BE", "HE", "NL-NL", "NL-BE", "PT-BR", "ES-419", "ES-AR", "FR-CA", "FR-CH", "IT", "IT-IT", "IT-CH", "NB", "NL", "PL", "RO", "RU"]}},
];

const industriesDefault = [
    {name: 'CASINO, POKER & IGAMING', icon: '/static/industries/casino-poker-igaming.png', "crud": false, download: '/static/Download-icon.png', generic: '/static/example.xlsx', active: true},
    {name: 'CFDS & ONLINE TRADING', icon: '/static/industries/cfds-online-tranding.png', "crud": false, download: '/static/Download-icon.png', generic: '/static/example.xlsx',active: true},
    {name: 'HOTEL & REAL ESTATES', icon: '/static/industries/hotel-real-estates.png', "crud": false, download: '/static/Download-icon.png', generic: '/static/example.xlsx', active: true},
    {name: 'ICOS & CRYPTOCURRENCY', icon: '/static/industries/icos-cryptocurrency.png', "crud": false, download: '/static/Download-icon.png', generic: '/static/example.xlsx', active: true},
    {name: 'LEGAL', icon: '/static/industries/legal-icon.png', "crud": false, download: '/static/Download-icon.png', generic: '/static/example.xlsx', active: true},
    {name: 'VIDEO GAMES', icon: '/static/industries/video-games.png', "crud": false, download: '/static/Download-icon.png', generic: ['/static/example.xlsx'], active: true},
    {name: 'MORE', icon: '/static/industries/more-icon.png', "crud": false, download: '/static/Download-icon.png', generic: '/static/example.xlsx', active: true}
];

const defaultValue = {
    languagesDefault,
    requestsDefault,
    usersDefault,
    servicesDefault,
    industriesDefault
};


module.exports = defaultValue;