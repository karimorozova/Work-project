
const languagesDefault = [
    {"lang":"Afrikaans", "icon": "/static/flags31x21pix/Afrikaans[AF].png", "symbol":"AF", "xtm": "af_ZA", "iso1":"af", "iso2":"afr", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Amharic", "icon": "/static/flags31x21pix/Amharic[AM].jpg", "symbol":"AM", "xtm": "am_ET", "iso1":"am", "iso2":"amh", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Macedonian", "icon": "/static/flags31x21pix/Macedonian[MK].jpg", "symbol":"MK", "xtm": "mk_MK", "iso1":"mk", "iso2":"mac (B) mkd (T)", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Mongolian", "icon": "/static/flags31x21pix/Mongolian[MN].jpg", "symbol":"MN", "xtm": "mn_MN", "iso1":"mn", "iso2":"mon", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Swahili", "icon": "/static/flags31x21pix/Swahili[SW].jpg", "symbol":"SW", "xtm": "sw_SO", "iso1":"sw", "iso2":"swa", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Yoruba", "icon": "/static/flags31x21pix/Yoruba[YO].jpg", "symbol":"YO", "xtm": "yo_NG", "iso1":"yo", "iso2":"yor", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Zulu", "icon": "/static/flags31x21pix/Zulu[ZU].jpg", "symbol":"ZU", "xtm": "zu_ZA", "iso1":"zu", "iso2":"zul", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Hausa", "icon": "/static/flags31x21pix/Hausa[HA].jpg", "symbol":"HA", "xtm": "ha_NG", "iso1":"ha", "iso2":"hau", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Arabic", "icon":"/static/flags31x21pix/Arabic[AR].png", "symbol":"AR", "xtm": "ar_AA", "iso1":"ar-AA", "iso2":"ara", "direction":"both", "crud": false, "active": true, "check": false, children: true},
    {"lang":"Arabic (Morocco)", "icon":"/static/flags31x21pix/Arabic[AR-MA].png", "symbol":"AR-MA", "xtm": "ar_MA", "iso1":"ar-MA", "iso2":"ara-MA", "direction":"in", "crud": false, "check": false, "active": true, parent: "AR"},
    {"lang":"Arabic (Egypt)", "icon":"/static/flags31x21pix/Arabic[AR-EG].png", "symbol":"AR-EG", "xtm": "ar_EG", "iso1":"ar-EG", "iso2":"ara-EG", "direction":"in", "crud": false, "check": false, "active": true, parent: "AR"},
    {"lang":"Arabic (Saudi Arabia)", "icon":"/static/flags31x21pix/Arabic[AR-SA].png", "symbol":"AR-SA", "xtm": "ar_SA", "iso1":"ar-SA", "iso2":"ara-SA", "direction":"in", "crud": false, "check": false, "active": true, parent: "AR"},
    {"lang":"Azerbaijani (Latin)", "icon":"/static/flags31x21pix/Azerbaijani[AZ-LN].png", "symbol":"AZ-LN", "xtm": "az_AZ_Latn", "iso1":"az-AZ-Latin", "iso2":"aze", "direction":"in", "crud": false, "active": true, "check": false,},
    {"lang":"Bulgarian", "icon":"/static/flags31x21pix/Bulgarian[BG].png", "symbol":"BG", "xtm": "bg_BG", "iso1":"bg-BG", "iso2":"bul", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Bengali (India)", "icon":"/static/flags31x21pix/Bengali[BN-IN].png", "symbol":"BN-IN", "xtm": "bn_IN", "iso1":"bn_IN", "iso2":"ben_IN", "direction":"in", "crud": false, "active": true, "check": false,},
    {"lang":"Bosnian (Cyrillic)", "icon":"/static/flags31x21pix/Bosnian[BS].png", "symbol":"BS", "xtm": "bs_BA_Cyrl", "iso1":"bs", "iso2":"bos", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Bosnian (Latin)", "icon":"/static/flags31x21pix/Bosnian[BS].png", "symbol":"BS-LAT", "xtm": "bs_BA_Latn", "iso1":"bs-lat", "iso2":"bos-lat", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Czech", "icon":"/static/flags31x21pix/Czech[CS].png", "symbol":"CS", "xtm": "cs_CZ", "iso1":"cz-CZ", "iso2":"cze", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Danish", "icon":"/static/flags31x21pix/Danish[DA].png", "symbol":"DA", "xtm": "da_DK", "iso1":"da-DK", "iso2":"dan", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Dutch", "icon":"/static/flags31x21pix/Dutch[NL].png", "symbol":"NL", "xtm": "nl_NL", "direction":"both", "iso1":"nl", "iso2":"dut", "crud": false, "active": true, "check": false, children: true},
    {"lang":"Flemish", "icon":"/static/flags31x21pix/Flemish[NL-BE].png", "symbol":"NL-BE", "xtm": "nl_BE", "iso1":"nl-BE", "iso2":"dut-BE", "direction":"both", "crud": false, "check": false, "active": true, parent: "NL"},
    {"lang":"Dutch (Netherlands)", "icon":"/static/flags31x21pix/Dutch[NL-NL].png", "symbol":"NL-NL", "xtm": "nl_NL", "iso1":"nl-NL", "iso2":"dut-NL", "direction":"both", "crud": false, "check": false, "active": true, parent: "NL"},
    {"lang":"German", "icon":"/static/flags31x21pix/German[DE].png", "symbol":"DE", "xtm": "de_DE", "iso1":"de", "iso2":"ger", "diraction":"both", "crud": false, "active": true, "check": false, children: true},
    {"lang":"German (Switzerland)", "icon":"/static/flags31x21pix/German[DE-CH].png", "symbol":"DE-CH", "xtm": "de_CH", "iso1":"de-CH", "iso2":"ger-CH", "direction":"both", "crud": false, "check": false, "active": true, parent: "DE"},
    {"lang":"German (Austria)", "icon":"/static/flags31x21pix/German[DE-AT].png", "symbol":"DE-AT", "xtm": "de_AT", "iso1":"de-AT", "iso2": "ger-AT", "direction":"both", "crud": false, "check": false, "active": true, parent: "DE"},
    {"lang":"German (Germany)", "icon":"/static/flags31x21pix/German[DE-DE].png", "symbol":"DE-DE", "xtm": "de_DE", "iso1":"de-DE", "iso2":"ger-DE", "direction":"both", "crud": false, "check": false, "active": true,  parent: "DE"},
    {"lang":"Greek", "icon":"/static/flags31x21pix/Greek[EL].png", "symbol":"EL", "xtm": "el_GR", "iso1":"el-GR", "iso2":"gre", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"English", "icon":"/static/flags31x21pix/English[EN-GB].png", "symbol":"EN", "xtm": "en_GB", "iso1":"en", "iso2":"eng", "direction":"both", "crud": false, "active": true, "check": false, children: true},
    {"lang":"English (United States)", "icon":"/static/flags31x21pix/English[EN-US].png", "symbol":"EN-US", "xtm": "en_US", "iso1":"en-US", "iso2":"eng-US", "direction":"both", "crud": false, "check": false, "active": true, parent: "EN"},
    {"lang":"English (United Kingdom)", "icon":"/static/flags31x21pix/English[EN-GB].png", "symbol":"EN-GB", "xtm": "en_GB", "iso1":"en-GB", "iso2":"eng-GB", "direction":"both", "crud": false, "check": false, "active": true, parent: "EN"},
    {"lang":"Spanish (Spain)", "icon":"/static/flags31x21pix/Spanish[ES-ES].png", "symbol":"ES-ES", "xtm": "es_ES", "iso1":"es-ES", "iso2":"spa-ES", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Spanish (Latin America)", "icon":"/static/flags31x21pix/Spanish[ES-419].png", "xtm": "es_419", "iso1":"es-AR", "iso2":"spa-419", "direction":"in", "crud": false, "active": true, "check": false, "symbol":"ES-419", children: true},
    {"lang":"Spanish (Argentina)", "icon":"/static/flags31x21pix/Spanish[ES-AR].png", "symbol":"ES-AR", "xtm": "es_AR", "iso1": "es-AR", "direction":"in", "crud": false, "check": false, "active": true, parent: "ES-419"},
    {"lang":"Spanish (Mexico)","symbol":"ES-MX", "xtm": "es_MX", "iso1": "es-MX", "icon":"/static/flags31x21pix/Spanish[ES-MX].png", "direction":"both", "crud": false, "check": false, "active": true, parent: "ES-419"},
    {"lang":"Estonian", "icon":"/static/flags31x21pix/Estonian[ET].png", "symbol":"ET", "xtm": "et_EE", "iso1":"et-EE", "iso2":"est", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Farsi (Persian)", "icon":"/static/flags31x21pix/Farsi[FA].png", "symbol":"FA", "xtm": "fa_IR", "iso1":"fa-IR", "iso2":"ger", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Finnish", "icon":"/static/flags31x21pix/Finnish[FI].png", "symbol":"FI", "xtm": "fi_FI", "iso1":"fi-FI", "iso2":"fin", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"French", "icon":"/static/flags31x21pix/French[FR-FR].png", "symbol":"FR", "xtm": "fr_FR", "iso1":"fr", "iso2":"fre", "direction":"both", "crud": false, "active": true, "check": false, children: true},
    {"lang":"French (France)", "icon":"/static/flags31x21pix/French[FR-FR].png", "symbol":"FR-FR", "xtm": "fr_FR", "iso1":"fr-FR", "iso2":"fre-FR", "direction":"both", "crud": false, "check": false, "active": true, parent: "FR"},
    {"lang":"French (Belgium)", "icon":"/static/flags31x21pix/French[FR-BE].png", "symbol":"FR-BE", "xtm": "fr_BE", "iso1":"fr-BE", "iso2":"fre-BE", "direction":"both", "crud": false, "check": false, "active": true, parent: "FR"},
    {"lang":"French (Canada)", "icon":"/static/flags31x21pix/French[FR-CA].png", "symbol":"FR-CA", "xtm": "fr_CA", "iso1":"fr-CA", "iso2":"fre-CA", "direction":"in", "crud": false, "check": false, "active": true, parent: "FR"},
    {"lang":"French (Switzerland)", "icon":"/static/flags31x21pix/French[FR-CH].png", "symbol":"FR-CH", "xtm": "fr_CH", "iso1":"fr-CH", "iso2":"fre-CH", "direction":"in", "crud": false, "check": false, "active": true, parent: "FR"},
    {"lang":"Hebrew", "icon":"/static/flags31x21pix/Hebrew[HE].png", "symbol":"HE", "xtm": "he_IL", "iso1":"he-IL", "iso2":"heb", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Hindi", "icon":"/static/flags31x21pix/Hindi[HI].png", "symbol":"HI", "xtm": "hi_IN", "iso1":"hi-IN", "iso2":"hin", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Croatian", "icon":"/static/flags31x21pix/Croatian[HR].png", "symbol":"HR", "xtm": "hr_HR", "iso1":"hr-HR", "iso2":"hrv", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Hungarian", "icon":"/static/flags31x21pix/Hungarian[HU].png", "symbol":"HU", "xtm": "hu_HU", "iso1":"hu-HU", "iso2":"hun", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Armenian", "icon":"/static/flags31x21pix/Armenian[HY].png", "symbol":"HY", "xtm": "hy_AM", "iso1":"hy-AM", "iso2":"hye", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Indonesian", "icon":"/static/flags31x21pix/Indonesian[ID].png", "symbol":"ID", "xtm": "id_ID", "iso1":"id-ID", "iso2":"ind", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Icelandic", "icon":"/static/flags31x21pix/Icelandic[IS].png", "symbol":"IS", "xtm": "is_IS", "iso1":"is-IS", "iso2":"ice", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Italian", "icon":"/static/flags31x21pix/Italian[IT].png", "symbol":"IT", "xtm": "it_IT", "iso1":"it", "iso2":"ita", "direction":"in", "crud": false, "active": true, "check": false, children: true},
    {"lang":"Italian (Italy)", "icon":"/static/flags31x21pix/Italian[IT-IT].png", "symbol":"IT-IT", "xtm": "it_IT", "iso1":"it-IT", "iso2":"ita-IT", "direction":"in", "crud": false, "check": false, "active": true, parent: "IT"},
    {"lang":"Italian (Switzerland)", "icon":"/static/flags31x21pix/Italian[IT-CH].png", "symbol":"IT-CH", "xtm": "it_CH", "iso1":"it-CH", "iso2":"ita-CH", "direction":"in", "crud": false, "check": false, "active": true, parent: "IT"},
    {"lang":"Japanese", "icon":"/static/flags31x21pix/Japanese[JA].png", "symbol":"JA", "xtm": "ja_JP", "iso1":"ja-JP", "iso2":"jpn", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Georgian", "icon":"/static/flags31x21pix/Georgian[KA].png", "symbol":"KA", "xtm": "ka_GE", "iso1":"ka-GE", "iso2":"kat", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Kazakh", "icon":"/static/flags31x21pix/Kazakh[KK].png", "symbol":"KK", "xtm": "kk_KZ", "iso1":"kk-KZ", "iso2":"kaz", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Korean", "icon":"/static/flags31x21pix/Korean[KO].png", "symbol":"KO", "xtm": "ko_KR", "iso1":"ko-KR", "iso2":"kor", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Lithuanian", "icon":"/static/flags31x21pix/Lithuanian[LT].png", "symbol":"LT", "xtm": "lt_LT", "iso1":"lt-LT", "iso2":"lit", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Latvian", "icon":"/static/flags31x21pix/Latvian[LV].png", "symbol":"LV", "xtm": "lv_LV", "iso1":"lv-LV", "iso2":"lav", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Moldavian", "icon":"/static/flags31x21pix/Moldavian[MO].png", "symbol":"MO", "xtm": "mo_MD", "iso1":"mo-MD", "iso2":"mol", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Marathi", "icon":"/static/flags31x21pix/Marathi[MR].png", "symbol":"MR", "xtm": "mr_IN", "iso1":"mr-IN", "iso2":"mar", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Malay", "icon":"/static/flags31x21pix/Malay[MS].png", "symbol":"MS", "xtm": "ms_MY", "iso1":"ms-MY", "iso2":"msa", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Norwegian (Bokmaal)", "icon":"/static/flags31x21pix/Norwegian[NB].png", "symbol":"NB", "xtm": "nb_NO", "iso1":"nb-NO", "iso2":"nnb", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Punjabi", "icon":"/static/flags31x21pix/Punjabi[PA].png", "symbol":"PA", "xtm": "pa_PA", "iso1":"pa-PA", "iso2":"pan", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Polish", "icon":"/static/flags31x21pix/Polish[PL].png", "symbol":"PL", "xtm": "pl_PL", "iso1":"de", "iso2":"ger", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Portuguese (Brazil)", "icon":"/static/flags31x21pix/Portuguese[PT-BR].png", "symbol":"PT-BR", "xtm": "pt_BR", "iso1":"pt-BR", "iso2":"por-BR", "direction":"both", "crud": false, "active": true, "check": false,},
    {"lang":"Portuguese (Portugal)", "icon":"/static/flags31x21pix/Portuguese[PT-PT].png", "symbol":"PT-PT", "xtm": "pt_PT", "iso1":"pt-PT", "iso2":"por-PT", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Romanian", "icon":"/static/flags31x21pix/Romanian[RO].png", "symbol":"RO", "xtm": "ro_RO", "iso1":"ro-RO", "iso2":"rum", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Russian", "icon":"/static/flags31x21pix/Russian[RU].png", "symbol":"RU", "xtm": "ru_RU", "iso1":"ru-RU", "iso2":"rus", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Slovak", "icon":"/static/flags31x21pix/Slovak[SK].png", "symbol":"SK", "xtm": "sk_SK", "iso1":"sk-SK", "iso2":"slo","direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Slovenian", "icon":"/static/flags31x21pix/Slovenian[SL].png", "symbol":"SL", "xtm": "sl_SL", "iso1":"sl-SL", "iso2":"slv", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Serbian (Latin)", "icon":"/static/flags31x21pix/Serbian[SR-LA].png", "symbol":"SR-LA", "xtm": "sr_RS_Latn", "iso1":"sr-LA", "iso2":"scr", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Swedish (Sweden)", "icon":"/static/flags31x21pix/Swedish[SV-SE].png", "symbol":"SV-SE", "xtm": "sv_SE", "iso1":"sv-SE", "iso2":"swe-SE", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Telugu", "symbol":"TE", "icon":"/static/flags31x21pix/Telugu[TE].png", "xtm": "te_IN", "iso1":"te-IN", "iso2":"tel", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Thai", "icon":"/static/flags31x21pix/Thai[TH].png", "symbol":"TH", "xtm": "th_TH", "iso1":"th-TH", "iso2":"tai", "direction":"both", "crud": false, "active": true, "check": false},
    {"lang":"Turkmen", "icon":"/static/flags31x21pix/Turkmen[TK].png", "symbol":"TK", "xtm": "tk_TM", "iso1":"tk-TM", "iso2":"tuk", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Tagalog", "icon":"/static/flags31x21pix/Tagalog[TL].png", "symbol":"TL", "xtm": "tl_PH", "iso1":"tl-PH", "iso2":"tgl", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Turkish", "icon":"/static/flags31x21pix/Turkish[TR].png", "symbol":"TR", "xtm": "tr_TR", "iso1":"tr-TR", "iso2":"tur", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Ukrainian", "icon":"/static/flags31x21pix/Ukrainian[UK].png", "symbol":"UK", "xtm": "uk_UA", "iso1":"uk-UA", "iso2":"ukr", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Urdu", "icon":"/static/flags31x21pix/Urdu[UR].png", "symbol":"UR", "xtm": "ur_IN", "iso1":"ur-IN", "iso2":"urd", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Uzbek", "icon":"/static/flags31x21pix/Uzbek[UZ].png", "symbol":"UZ", "xtm": "uz", "iso1":"uz-UZ-Latn", "iso2":"uzb", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Vietnamese", "icon":"/static/flags31x21pix/Vietnamese[VI].png", "symbol":"VI", "xtm": "vi_VN", "iso1":"vi-VN", "iso2":"vie", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Chinese Simplified", "icon":"/static/flags31x21pix/ChineseSimplified[ZH-CN].png", "symbol":"ZH-CN", "xtm": "zh_VN", "iso1":"zh-CN", "iso2":"zho-CN", "direction":"in", "crud": false, "active": true, children: true},
    {"lang":"Chinese (China)", "icon":"/static/flags31x21pix/Chinese[ZH-CN].png", "symbol":"ZH-CN", "xtm": "zh_CN", "iso1":"zh-CN", "iso2":"zho-CN", "direction":"in", "crud": false, "check": false, "active": true, parent: "ZH-CN", china: "simplified"},
    {"lang":"Chinese (Singapore)", "icon":"/static/flags31x21pix/Chinese[ZH-SG].png", "symbol":"ZH-SG", "xtm": "zh_SG", "iso1":"zh-SG", "iso2":"zho-SG", "direction":"in", "crud": false, "check": false, "active": true, parent: "ZH-CN", china: "simplified"},
    {"lang":"Chinese Traditional", "icon":"/static/flags31x21pix/ChineseTraditional[ZH-CN].png", "symbol":"ZH-TW", "xtm": "zh_TW", "iso1":"zh-CN", "iso2":"zho-CN", "direction":"in", "crud": false, "active": true},
    {"lang":"Chinese (Hong Kong)", "icon":"/static/flags31x21pix/Chinese[ZH-HK].png", "symbol":"ZH-HK", "xtm": "zh_HK", "iso1":"zh-HK", "iso2":"zho-HK", "direction":"in", "crud": false, "check": false, "active": true, parent: "ZH-CN", china: "traditional"},
    {"lang":"Chinese (Macao)", "icon":"/static/flags31x21pix/Chinese[ZH-MO].png", "symbol":"ZH-MO", "xtm": "zh_TW", "iso1":"zh-MO", "iso2":"zho-MO", "direction":"in", "crud": false, "active": true, parent: "ZH-CN", china: "traditional"},
    {"lang":"Chinese (Taiwan)","icon":"/static/flags31x21pix/Chinese[ZH-TW].png", "symbol":"ZH-TW", "xtm": "goyu", "iso1":"zh-TW", "iso2":"zho-TW", "direction":"in", "crud": false, "check": false, "active": true, parent: "ZH-CN", china: "traditional"},
    {"lang":"Burmese", "icon":"/static/flags31x21pix/Burmese[BU].png", "symbol":"BU", "xtm": "", "iso1":"my", "iso2":"bur(B) mya(T)", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Filipino", "icon":"/static/flags31x21pix/Filipino[FIL].png", "symbol":"FIL", "xtm": "", "iso1":"", "iso2":"fil", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Haitian Creole", "icon":"/static/flags31x21pix/Haitian[HT].png", "symbol":"HT", "xtm": "", "iso1":"ht", "iso2":"hat", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Khmer", "icon":"/static/flags31x21pix/Khmer[KM].png", "symbol":"KM", "xtm": "", "iso1":"km", "iso2":"khm", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Kurdish (Arabic)", "icon":"/static/flags31x21pix/Kurdish[KU].png", "symbol":"KU", "xtm": "", "iso1":"ku", "iso2":"kur", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Lao", "icon":"/static/flags31x21pix/Lao[LO].png", "symbol":"LO", "xtm": "", "iso1":"lo", "iso2":"lao", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Maltese", "icon":"/static/flags31x21pix/Maltese[MT].png", "symbol":"MT", "xtm": "", "iso1":"mt", "iso2":"mlt", "direction":"in", "crud": false, "active": true, "check": false},
    {"lang":"Nepali", "icon":"/static/flags31x21pix/Nepali[NE].png", "symbol":"NE", "xtm": "", "iso1":"ne", "iso2":"nep", "direction":"in", "crud": false, "active": true, "check": false},
];

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
      "email" : "sakis@pangea-langs.com",
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
      "email" : "arans@pangea-langs.com",
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
    {title: "Translation", symbol: "translation", isStage1: true, isStage2: false, isEditor: true, isActive: true, calculationUnit: "Words"},
    {title: "Revising", symbol: "revising", isStage1: false, isStage2: true, isEditor: true, isActive: true, calculationUnit: "Words"},
    {title: "Editing", symbol: "editing", isStage1: true, isStage2: false, isEditor: true, isActive: true, calculationUnit: "Words"},
    {title: "QA", symbol: "qa", isStage1: true, isStage2: true, isEditor: true, isActive: true, calculationUnit: "Hours"},
    {title: "Copywriting", symbol: "copywriting", isStage1: true, isStage2: false, isEditor: true, isActive: true, calculationUnit: "Packages"},
    {title: "Proofreading", symbol: "proofreading", isStage1: true, isStage2: true, isEditor: true, isActive: true, calculationUnit: "Packages"},
    {title: "Graphic Design", symbol: "graphic_design", isStage1: true, isStage2: true, isEditor: false, isActive: true, calculationUnit: "Hours"},
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

const packagesDefault = [
    {name: "Up to 200", size: "200"},{name: "201 to 300", size: "300"},{name: "301 to 400", size: "400"},{name: "401 to 699", size: "700"},{name: "700 to 1000", size: "1000"},
]

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
    repeat: {text: "Repetitions", value: 0},
    repeat100: {text: "100%", value: 0},
    repeat50: {text: "50-74%", value: 0},
    repeat75: {text: "75-84%", value: 0},
    repeat85: {text: "85-94%", value: 0},
    repeat95: {text: "95-99%", value: 0},
    noMatch: {text: "No match", value: 1}
}

const discountChartsDefault = [
    {name: "Chart 1", isClientDefault: true, isVendorDefault: true, isActive: true, matrixes: {client: emptyMatrix, vendor: emptyMatrix}},
    {name: "Chart 2", isClientDefault: false, isVendorDefault: false, isActive: true, matrixes: {client: emptyMatrix, vendor: emptyMatrix}},
    {name: "Chart 3", isClientDefault: false, isVendorDefault: false, isActive: true, matrixes: {client: emptyMatrix, vendor: emptyMatrix}}
]

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
    packagesDefault,
    emptyMatrix,
    instructionsDefault,
    cancelReasonsDefault,
    discountChartsDefault,
    tierLqasDefault
};

module.exports = defaultValue;
