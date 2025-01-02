export const financial = {
  common: {
    save: 'Cadw',
    cancel: 'Canslo',
    delete: 'Dileu',
    edit: 'Golygu',
    view: 'Gweld',
    create: 'Creu',
    search: 'Chwilio',
    filter: 'Hidlo',
    status: 'Statws',
    actions: 'Gweithredoedd',
    loading: 'Yn llwytho...',
    noData: 'Dim data ar gael',
    error: 'Digwyddodd gwall',
    success: 'Gweithrediad llwyddiannus',
    confirm: 'Ydych chi\'n siŵr?',
    required: 'Mae\'r maes hwn yn ofynnol',
    invalidFormat: 'Fformat annilys'
  },
  accounts: {
    title: 'Siart Cyfrifon',
    newAccount: 'Cyfrif Newydd',
    accountDetails: 'Manylion y Cyfrif',
    accountCode: 'Cod Cyfrif',
    accountName: 'Enw\'r Cyfrif',
    accountType: 'Math o Gyfrif',
    balance: 'Balans',
    parent: 'Cyfrif Rhiant',
    status: {
      active: 'Gweithredol',
      inactive: 'Anweithredol'
    },
    types: {
      asset: 'Ased',
      liability: 'Rhwymedigaeth',
      equity: 'Ecwiti',
      revenue: 'Refeniw',
      expense: 'Treuliau'
    },
    validation: {
      codeExists: 'Mae\'r cod cyfrif yn bodoli eisoes',
      invalidCode: 'Fformat cod cyfrif annilys',
      invalidName: 'Mae angen enw\'r cyfrif',
      invalidType: 'Dewiswch fath o gyfrif'
    }
  },
  invoices: {
    title: 'Anfonebau',
    newInvoice: 'Anfoneb Newydd',
    invoiceDetails: 'Manylion yr Anfoneb',
    invoiceNumber: 'Rhif Anfoneb',
    issueDate: 'Dyddiad Cyhoeddi',
    dueDate: 'Dyddiad Dyledus',
    resident: 'Preswylydd',
    subtotal: 'Is-gyfanswm',
    tax: 'Treth',
    total: 'Cyfanswm',
    status: {
      draft: 'Drafft',
      sent: 'Anfonwyd',
      paid: 'Talwyd',
      overdue: 'Hwyr',
      cancelled: 'Wedi\'i ganslo',
      void: 'Annilys'
    },
    items: {
      description: 'Disgrifiad',
      quantity: 'Nifer',
      unitPrice: 'Pris yr Uned',
      taxRate: 'Cyfradd Treth',
      amount: 'Swm',
      addItem: 'Ychwanegu Eitem'
    },
    validation: {
      invalidNumber: 'Rhif anfoneb annilys',
      invalidDate: 'Dyddiad annilys',
      invalidResident: 'Dewiswch breswylydd',
      noItems: 'Mae angen o leiaf un eitem'
    }
  },
  payments: {
    title: 'Taliadau',
    newPayment: 'Taliad Newydd',
    paymentDetails: 'Manylion y Taliad',
    amount: 'Swm',
    method: 'Dull Talu',
    reference: 'Cyfeirnod',
    date: 'Dyddiad Talu',
    status: {
      pending: 'Yn aros',
      processing: 'Yn prosesu',
      completed: 'Wedi cwblhau',
      failed: 'Wedi methu',
      refunded: 'Wedi ad-dalu',
      cancelled: 'Wedi canslo'
    },
    methods: {
      directDebit: 'Debyd Uniongyrchol',
      card: 'Taliad Cerdyn',
      bankTransfer: 'Trosglwyddiad Banc',
      cash: 'Arian Parod',
      check: 'Siec'
    },
    validation: {
      invalidAmount: 'Swm annilys',
      invalidMethod: 'Dewiswch ddull talu',
      invalidDate: 'Dyddiad talu annilys'
    }
  },
  reports: {
    title: 'Adroddiadau Ariannol',
    balanceSheet: 'Mantolen',
    profitAndLoss: 'Elw a Cholled',
    cashFlow: 'Llif Arian',
    agedReceivables: 'Derbyniadau wedi Heneiddio',
    taxReport: 'Adroddiad Treth',
    dateRange: {
      start: 'Dyddiad Dechrau',
      end: 'Dyddiad Gorffen',
      thisMonth: 'Y Mis Hwn',
      lastMonth: 'Y Mis Diwethaf',
      thisQuarter: 'Y Chwarter Hwn',
      lastQuarter: 'Y Chwarter Diwethaf',
      thisYear: 'Eleni',
      lastYear: 'Y Llynedd',
      custom: 'Ystod Cyfaddas'
    },
    categories: {
      assets: 'Asedau',
      liabilities: 'Rhwymedigaethau',
      equity: 'Ecwiti',
      revenue: 'Refeniw',
      expenses: 'Treuliau',
      netIncome: 'Incwm Net'
    }
  },
  settings: {
    title: 'Gosodiadau Ariannol',
    sections: {
      organization: 'Sefydliad',
      invoicing: 'Anfonebu',
      payments: 'Taliadau',
      notifications: 'Hysbysiadau',
      compliance: 'Cydymffurfiaeth'
    },
    organization: {
      name: 'Enw\'r Sefydliad',
      fiscalYear: 'Dechrau\'r Flwyddyn Ariannol',
      currency: 'Arian Diofyn',
      taxNumber: 'Rhif Treth',
      registrationNumber: 'Rhif Cofrestru'
    },
    invoicing: {
      prefix: 'Rhagddodiad Rhif Anfoneb',
      terms: 'Telerau Talu Diofyn',
      dueDays: 'Dyddiau Dyledus Diofyn',
      notes: 'Nodiadau Anfoneb Diofyn'
    },
    payments: {
      methods: 'Dulliau Talu',
      gateway: 'Porth Talu',
      apiKey: 'Allwedd API',
      webhookSecret: 'Cyfrinach Webhook'
    },
    notifications: {
      invoiceGenerated: 'Anfoneb wedi\'i Gynhyrchu',
      paymentReceived: 'Taliad wedi\'i Dderbyn',
      paymentOverdue: 'Taliad yn Hwyr'
    },
    compliance: {
      dataRetention: 'Cyfnod Cadw Data',
      vatEnabled: 'TAW wedi\'i Alluogi',
      vatNumber: 'Rhif TAW'
    }
  }
};


