const defaultServices = [
  {
    sortIndex: 1,
    xtrf: 11,
    symbol: 'tr',
    formType: 'Translation',
    icon: '/static/services/Translation_Localization.png',
    'active': true,
    'crud': false,
    languageForm: 'Duo',
    projectType: 'regular',
    title: 'Translation',
    source: true,
    languages: {
      source: ['AR', 'BG', 'DA', 'DE', 'DE-DE', 'DE-AT', 'DE-CH', 'EL', 'EN', 'EN-GB', 'EN-US', 'ES-ES', 'ES-MX', 'ET', 'FA', 'FI', 'FR', 'FR-FR', 'FR-BE', 'HE', 'HY', 'ID', 'IS', 'MO', 'MR', 'MS', 'NL-NL', 'NL-BE', 'PA', 'PT-BR', 'SK', 'TH'],
      target: ['AR', 'BG', 'DA', 'DE', 'DE-DE', 'DE-AT', 'DE-CH', 'EL', 'EN', 'EN-GB', 'EN-US', 'ES-ES', 'ES-MX', 'ET', 'FA', 'FI', 'FR', 'FR-FR', 'FR-BE', 'HE', 'HY', 'ID', 'IS', 'MO', 'MR', 'MS', 'NL-NL', 'NL-BE', 'PA', 'PT-BR', 'SK', 'TH', 'AF', 'AR-EG', 'AR-MA', 'AR-SA', 'AZ-LN', 'BN-IN', 'BS', 'CS', 'ES-419', 'ES-AR', 'FR-CA', 'FR-CH', 'HI', 'HR', 'HU', 'IT', 'IT-IT', 'IT-CH', 'JA', 'KA', 'KK', 'KO', 'LT', 'LV', 'NB', 'NL', 'PL', 'PT-PT', 'RO', 'RU', 'SL', 'SR-LA', 'SV-SE', 'TE', 'TK', 'TL', 'TR', 'UK', 'UR', 'UZ', 'VI', 'ZH-CN', 'ZH-SG', 'ZH-HK', 'ZH-MO', 'ZH-TW']
    }
  },
  {
    sortIndex: 2,
    xtrf: 11,
    symbol: 'lo',
    formType: 'Translation',
    icon: '/static/services/Translation_Localization.png',
    'active': true,
    'crud': false,
    languageForm: 'Duo',
    projectType: 'regular',
    title: 'Localization',
    source: true,
    languages: {
      source: ['AR', 'BG', 'DA', 'DE', 'DE-DE', 'DE-AT', 'DE-CH', 'EL', 'EN', 'EN-GB', 'EN-US', 'ES-ES', 'ES-MX', 'ET', 'FA', 'FI', 'FR', 'FR-FR', 'FR-BE', 'HE', 'HY', 'ID', 'IS', 'MO', 'MR', 'MS', 'NL-NL', 'NL-BE', 'PA', 'PT-BR', 'SK', 'TH'],
      target: ['AR', 'BG', 'DA', 'DE', 'DE-DE', 'DE-AT', 'DE-CH', 'EL', 'EN', 'EN-GB', 'EN-US', 'ES-ES', 'ES-MX', 'ET', 'FA', 'FI', 'FR', 'FR-FR', 'FR-BE', 'HE', 'HY', 'ID', 'IS', 'MO', 'MR', 'MS', 'NL-NL', 'NL-BE', 'PA', 'PT-BR', 'SK', 'TH', 'AF', 'AR-EG', 'AR-MA', 'AR-SA', 'AZ-LN', 'BN-IN', 'BS', 'CS', 'ES-419', 'ES-AR', 'FR-CA', 'FR-CH', 'HI', 'HR', 'HU', 'IT', 'IT-IT', 'IT-CH', 'JA', 'KA', 'KK', 'KO', 'LT', 'LV', 'NB', 'NL', 'PL', 'PT-PT', 'RO', 'RU', 'SL', 'SR-LA', 'SV-SE', 'TE', 'TK', 'TL', 'TR', 'UK', 'UR', 'UZ', 'VI', 'ZH-CN', 'ZH-SG', 'ZH-HK', 'ZH-MO', 'ZH-TW']
    }
  },
  {
    sortIndex: 3,
    xtrf: 35,
    symbol: 'pr',
    icon: '/static/services/Translation_Localization.png',
    'active': true,
    'crud': false,
    languageForm: 'Duo',
    projectType: 'smart',
    title: 'Proofing',
    source: true,
    languages: {
      source: ['AR', 'BG', 'DA', 'DE', 'DE-DE', 'DE-AT', 'DE-CH', 'EL', 'EN', 'EN-GB', 'EN-US', 'ES-ES', 'ES-MX', 'ET', 'FA', 'FI', 'FR', 'FR-FR', 'FR-BE', 'HE', 'HY', 'ID', 'IS', 'MO', 'MR', 'MS', 'NL-NL', 'NL-BE', 'PA', 'PT-BR', 'SK', 'TH'],
      target: ['AR', 'BG', 'DA', 'DE', 'DE-DE', 'DE-AT', 'DE-CH', 'EL', 'EN', 'EN-GB', 'EN-US', 'ES-ES', 'ES-MX', 'ET', 'FA', 'FI', 'FR', 'FR-FR', 'FR-BE', 'HE', 'HY', 'ID', 'IS', 'MO', 'MR', 'MS', 'NL-NL', 'NL-BE', 'PA', 'PT-BR', 'SK', 'TH', 'AF', 'AR-EG', 'AR-MA', 'AR-SA', 'AZ-LN', 'BN-IN', 'BS', 'CS', 'ES-419', 'ES-AR', 'FR-CA', 'FR-CH', 'HI', 'HR', 'HU', 'IT', 'IT-IT', 'IT-CH', 'JA', 'KA', 'KK', 'KO', 'LT', 'LV', 'NB', 'NL', 'PL', 'PT-PT', 'RO', 'RU', 'SL', 'SR-LA', 'SV-SE', 'TE', 'TK', 'TL', 'TR', 'UK', 'UR', 'UZ', 'VI', 'ZH-CN', 'ZH-SG', 'ZH-HK', 'ZH-MO', 'ZH-TW']
    }
  },
  {
    sortIndex: 6,
    xtrf: 11,
    symbol: 'st',
    formType: 'Translation',
    icon: '/static/services/SEO_Blog_Management.png',
    'active': true,
    'crud': false,
    languageForm: 'Duo',
    projectType: 'regular',
    title: 'SEO Translation',
    source: true,
    languages: {
      source: ['AR', 'BG', 'DA', 'DE', 'DE-DE', 'DE-AT', 'DE-CH', 'EL', 'EN', 'EN-GB', 'EN-US', 'ES-ES', 'ES-MX', 'ET', 'FA', 'FI', 'FR', 'FR-FR', 'FR-BE', 'HE', 'HY', 'ID', 'IS', 'MO', 'MR', 'MS', 'NL-NL', 'NL-BE', 'PA', 'PT-BR', 'SK', 'TH'],
      target: ['AR', 'BG', 'DA', 'DE', 'DE-DE', 'DE-AT', 'DE-CH', 'EL', 'EN', 'EN-GB', 'EN-US', 'ES-ES', 'ES-MX', 'ET', 'FA', 'FI', 'FR', 'FR-FR', 'FR-BE', 'HE', 'HY', 'ID', 'IS', 'MO', 'MR', 'MS', 'NL-NL', 'NL-BE', 'PA', 'PT-BR', 'SK', 'TH', 'AF', 'AR-EG', 'AR-MA', 'AR-SA', 'AZ-LN', 'BN-IN', 'BS', 'CS', 'ES-419', 'ES-AR', 'FR-CA', 'FR-CH', 'HI', 'HR', 'HU', 'IT', 'IT-IT', 'IT-CH', 'JA', 'KA', 'KK', 'KO', 'LT', 'LV', 'NB', 'NL', 'PL', 'PT-PT', 'RO', 'RU', 'SL', 'SR-LA', 'SV-SE', 'TE', 'TK', 'TL', 'TR', 'UK', 'UR', 'UZ', 'VI', 'ZH-CN', 'ZH-SG', 'ZH-HK', 'ZH-MO', 'ZH-TW']
    }
  },
  {
    sortIndex: 8,
    xtrf: 12,
    symbol: 'qt',
    icon: '/static/services/QA_and_Testing.png',
    'active': true,
    'crud': false,
    languageForm: 'Duo',
    projectType: 'smart',
    title: 'QA and Testing',
    source: true,
    languages: {
      source: ['AR', 'BG', 'DA', 'DE', 'DE-DE', 'DE-AT', 'DE-CH', 'EL', 'EN', 'EN-GB', 'EN-US', 'ES-ES', 'ES-MX', 'ET', 'FA', 'FI', 'FR', 'FR-FR', 'FR-BE', 'HE', 'HY', 'ID', 'IS', 'MO', 'MR', 'MS', 'NL-NL', 'NL-BE', 'PA', 'PT-BR', 'SK', 'TH'],
      target: ['AR', 'BG', 'DA', 'DE', 'DE-DE', 'DE-AT', 'DE-CH', 'EL', 'EN', 'EN-GB', 'EN-US', 'ES-ES', 'ES-MX', 'ET', 'FA', 'FI', 'FR', 'FR-FR', 'FR-BE', 'HE', 'HY', 'ID', 'IS', 'MO', 'MR', 'MS', 'NL-NL', 'NL-BE', 'PA', 'PT-BR', 'SK', 'TH', 'AF', 'AR-EG', 'AR-MA', 'AR-SA', 'AZ-LN', 'BN-IN', 'BS', 'CS', 'ES-419', 'ES-AR', 'FR-CA', 'FR-CH', 'HI', 'HR', 'HU', 'IT', 'IT-IT', 'IT-CH', 'JA', 'KA', 'KK', 'KO', 'LT', 'LV', 'NB', 'NL', 'PL', 'PT-PT', 'RO', 'RU', 'SL', 'SR-LA', 'SV-SE', 'TE', 'TK', 'TL', 'TR', 'UK', 'UR', 'UZ', 'VI', 'ZH-CN', 'ZH-SG', 'ZH-HK', 'ZH-MO', 'ZH-TW']
    }
  },
  {
    sortIndex: 9,
    xtrf: 25,
    symbol: 'gl',
    icon: '/static/services/Localized_Graphic_Design.png',
    'active': true,
    'crud': false,
    languageForm: 'Duo',
    projectType: 'smart',
    title: 'Graphic Localization',
    source: true,
    languages: {
      source: ['AR', 'BG', 'DA', 'DE', 'DE-DE', 'DE-AT', 'DE-CH', 'EL', 'EN', 'EN-GB', 'EN-US', 'ES-ES', 'ES-MX', 'ET', 'FA', 'FI', 'FR', 'FR-FR', 'FR-BE', 'HE', 'HY', 'ID', 'IS', 'MO', 'MR', 'MS', 'NL-NL', 'NL-BE', 'PA', 'PT-BR', 'SK', 'TH'],
      target: ['AR', 'BG', 'DA', 'DE', 'DE-DE', 'DE-AT', 'DE-CH', 'EL', 'EN', 'EN-GB', 'EN-US', 'ES-ES', 'ES-MX', 'ET', 'FA', 'FI', 'FR', 'FR-FR', 'FR-BE', 'HE', 'HY', 'ID', 'IS', 'MO', 'MR', 'MS', 'NL-NL', 'NL-BE', 'PA', 'PT-BR', 'SK', 'TH', 'AF', 'AR-EG', 'AR-MA', 'AR-SA', 'AZ-LN', 'BN-IN', 'BS', 'CS', 'ES-419', 'ES-AR', 'FR-CA', 'FR-CH', 'HI', 'HR', 'HU', 'IT', 'IT-IT', 'IT-CH', 'JA', 'KA', 'KK', 'KO', 'LT', 'LV', 'NB', 'NL', 'PL', 'PT-PT', 'RO', 'RU', 'SL', 'SR-LA', 'SV-SE', 'TE', 'TK', 'TL', 'TR', 'UK', 'UR', 'UZ', 'VI', 'ZH-CN', 'ZH-SG', 'ZH-HK', 'ZH-MO', 'ZH-TW']
    }
  },
  {
    sortIndex: 4,
    xtrf: 13,
    symbol: 'co',
    icon: '/static/services/Marketing_Copywriting.png',
    'active': true,
    'crud': false,
    languageForm: 'Mono',
    projectType: 'smart',
    title: 'Copywriting',
    source: false,
    languages: {
      source: [],
      target: ['AR', 'AR-EG', 'AR-SA', 'AR-MA', 'DE', 'EN', 'EN-GB', 'EN-US', 'ES-ES', 'ES-419', 'ES-AR', 'ES-MX', 'FR', 'FR-FR', 'HE', 'IT', 'IT-IT', 'JA', 'NB', 'NL', 'NL-NL', 'PL', 'RU', 'SV-SE', 'TR']
    }
  },
  {
    sortIndex: 5,
    xtrf: 13,
    symbol: 'bl',
    icon: '/static/services/Market_Research.png',
    'active': true,
    'crud': false,
    languageForm: 'Mono',
    projectType: 'smart',
    title: 'Blogging',
    source: false,
    languages: {
      source: [],
      target: ['AR', 'AR-EG', 'AR-SA', 'AR-MA', 'DE', 'EN', 'EN-GB', 'EN-US', 'ES-ES', 'ES-419', 'ES-AR', 'ES-MX', 'FR', 'FR-FR', 'HE', 'IT', 'IT-IT', 'JA', 'NB', 'NL', 'NL-NL', 'PL', 'RU', 'SV-SE', 'TR']
    }
  },
  {
    sortIndex: 7,
    xtrf: 13,
    symbol: 'sw',
    icon: '/static/services/SEO_Blog_Management.png',
    'active': true,
    'crud': false,
    languageForm: 'Mono',
    projectType: 'smart',
    title: 'SEO Writing',
    source: false,
    languages: {
      source: [],
      target: ['AR', 'AR-EG', 'AR-SA', 'AR-MA', 'DE', 'EN', 'EN-GB', 'EN-US', 'ES-ES', 'ES-419', 'ES-AR', 'ES-MX', 'FR', 'FR-FR', 'HE', 'IT', 'IT-IT', 'JA', 'NB', 'NL', 'NL-NL', 'PL', 'RU', 'SV-SE', 'TR']
    }
  },
  {
    sortIndex: 10,
    xtrf: 11,
    symbol: 'ot',
    formType: 'Translation',
    icon: '/static/services/Official_Translations.png',
    'active': true,
    'crud': false,
    languageForm: 'Duo',
    projectType: 'regular',
    title: 'Official Translation',
    source: true,
    languages: {
      source: ['DE-CH', 'EL', 'EN', 'EN-GB', 'EN-US', 'ES-ES', 'ES-MX', 'FR', 'FR-FR', 'FR-BE', 'HE', 'NL-NL', 'NL-BE', 'PT-BR', 'TH'],
      target: ['DE', 'DE-DE', 'DE-AT', 'DE-CH', 'EL', 'EN', 'EN-GB', 'EN-US', 'ES-ES', 'ES-MX', 'FR', 'FR-FR', 'FR-BE', 'HE', 'NL-NL', 'NL-BE', 'PT-BR', 'ES-419', 'ES-AR', 'FR-CA', 'FR-CH', 'IT', 'IT-IT', 'IT-CH', 'NB', 'NL', 'PL', 'RO', 'RU']
    }
  },
];

module.exports = { defaultServices }
