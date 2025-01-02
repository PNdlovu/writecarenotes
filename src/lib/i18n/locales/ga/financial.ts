export const financial = {
  common: {
    save: 'Sábháil',
    cancel: 'Cealaigh',
    delete: 'Scrios',
    edit: 'Cuir in Eagar',
    view: 'Féach',
    create: 'Cruthaigh',
    search: 'Cuardaigh',
    filter: 'Scagaire',
    status: 'Stádas',
    actions: 'Gníomhartha',
    loading: 'Ag lódáil...',
    noData: 'Níl aon sonraí ar fáil',
    error: 'Tharla earráid',
    success: 'D\'éirigh leis an oibríocht',
    confirm: 'An bhfuil tú cinnte?',
    required: 'Tá an réimse seo riachtanach',
    invalidFormat: 'Formáid neamhbhailí'
  },
  accounts: {
    title: 'Cairt na gCuntas',
    newAccount: 'Cuntas Nua',
    accountDetails: 'Sonraí an Chuntais',
    accountCode: 'Cód Cuntais',
    accountName: 'Ainm an Chuntais',
    accountType: 'Cineál Cuntais',
    balance: 'Iarmhéid',
    parent: 'Cuntas Tuismitheora',
    status: {
      active: 'Gníomhach',
      inactive: 'Neamhghníomhach'
    },
    types: {
      asset: 'Sócmhainn',
      liability: 'Dliteanas',
      equity: 'Cothromas',
      revenue: 'Ioncam',
      expense: 'Costas'
    },
    validation: {
      codeExists: 'Tá an cód cuntais ann cheana',
      invalidCode: 'Formáid chód cuntais neamhbhailí',
      invalidName: 'Tá ainm an chuntais riachtanach',
      invalidType: 'Roghnaigh cineál cuntais le do thoil'
    }
  },
  invoices: {
    title: 'Sonraisc',
    newInvoice: 'Sonrasc Nua',
    invoiceDetails: 'Sonraí an tSonraisc',
    invoiceNumber: 'Uimhir Sonraisc',
    issueDate: 'Dáta Eisiúna',
    dueDate: 'Dáta Dlite',
    resident: 'Cónaitheoir',
    subtotal: 'Fo-iomlán',
    tax: 'Cáin',
    total: 'Iomlán',
    status: {
      draft: 'Dréacht',
      sent: 'Seolta',
      paid: 'Íoctha',
      overdue: 'Thar téarma',
      cancelled: 'Cealaithe',
      void: 'Neamhbhailí'
    },
    items: {
      description: 'Cur Síos',
      quantity: 'Méid',
      unitPrice: 'Praghas Aonaid',
      taxRate: 'Ráta Cánach',
      amount: 'Méid',
      addItem: 'Cuir Mír Leis'
    },
    validation: {
      invalidNumber: 'Uimhir sonraisc neamhbhailí',
      invalidDate: 'Dáta neamhbhailí',
      invalidResident: 'Roghnaigh cónaitheoir le do thoil',
      noItems: 'Tá mír amháin ar a laghad riachtanach'
    }
  },
  payments: {
    title: 'Íocaíochtaí',
    newPayment: 'Íocaíocht Nua',
    paymentDetails: 'Sonraí na hÍocaíochta',
    amount: 'Méid',
    method: 'Modh Íocaíochta',
    reference: 'Tagairt',
    date: 'Dáta Íocaíochta',
    status: {
      pending: 'Ar Feitheamh',
      processing: 'Á Phróiseáil',
      completed: 'Críochnaithe',
      failed: 'Teipthe',
      refunded: 'Aisíoctha',
      cancelled: 'Cealaithe'
    },
    methods: {
      directDebit: 'Dochar Díreach',
      card: 'Íocaíocht Chárta',
      bankTransfer: 'Aistriú Bainc',
      cash: 'Airgead Tirim',
      check: 'Seic'
    },
    validation: {
      invalidAmount: 'Méid neamhbhailí',
      invalidMethod: 'Roghnaigh modh íocaíochta le do thoil',
      invalidDate: 'Dáta íocaíochta neamhbhailí'
    }
  },
  reports: {
    title: 'Tuarascálacha Airgeadais',
    balanceSheet: 'Clár Comhardaithe',
    profitAndLoss: 'Brabús agus Caillteanas',
    cashFlow: 'Sreabhadh Airgid',
    agedReceivables: 'Infháltais Aosaithe',
    taxReport: 'Tuarascáil Chánach',
    dateRange: {
      start: 'Dáta Tosaithe',
      end: 'Dáta Críochnaithe',
      thisMonth: 'An Mhí Seo',
      lastMonth: 'An Mhí Seo Caite',
      thisQuarter: 'An Ráithe Seo',
      lastQuarter: 'An Ráithe Seo Caite',
      thisYear: 'An Bhliain Seo',
      lastYear: 'An Bhliain Seo Caite',
      custom: 'Raon Saincheaptha'
    },
    categories: {
      assets: 'Sócmhainní',
      liabilities: 'Dliteanais',
      equity: 'Cothromas',
      revenue: 'Ioncam',
      expenses: 'Costais',
      netIncome: 'Glanioncam'
    }
  },
  settings: {
    title: 'Socruithe Airgeadais',
    sections: {
      organization: 'Eagraíocht',
      invoicing: 'Sonrascadh',
      payments: 'Íocaíochtaí',
      notifications: 'Fógraí',
      compliance: 'Comhlíonadh'
    },
    organization: {
      name: 'Ainm na hEagraíochta',
      fiscalYear: 'Tús na Bliana Airgeadais',
      currency: 'Airgeadra Réamhshocraithe',
      taxNumber: 'Uimhir Chánach',
      registrationNumber: 'Uimhir Chláraithe'
    },
    invoicing: {
      prefix: 'Réimír Uimhir Sonraisc',
      terms: 'Téarmaí Íocaíochta Réamhshocraithe',
      dueDays: 'Laethanta Dlite Réamhshocraithe',
      notes: 'Nótaí Sonraisc Réamhshocraithe'
    },
    payments: {
      methods: 'Modhanna Íocaíochta',
      gateway: 'Geata Íocaíochta',
      apiKey: 'Eochair API',
      webhookSecret: 'Rún Webhook'
    },
    notifications: {
      invoiceGenerated: 'Sonrasc Ginte',
      paymentReceived: 'Íocaíocht Faighte',
      paymentOverdue: 'Íocaíocht Thar Téarma'
    },
    compliance: {
      dataRetention: 'Tréimhse Coinneála Sonraí',
      vatEnabled: 'CBL Cumasaithe',
      vatNumber: 'Uimhir CBL'
    }
  }
};


