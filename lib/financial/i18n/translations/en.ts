export const en = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    create: 'Create',
    search: 'Search',
    filter: 'Filter',
    status: 'Status',
    actions: 'Actions',
    loading: 'Loading...',
    noData: 'No data available',
    error: 'An error occurred',
    success: 'Operation successful',
    confirm: 'Are you sure?',
    required: 'This field is required',
    invalidFormat: 'Invalid format'
  },
  accounts: {
    title: 'Chart of Accounts',
    newAccount: 'New Account',
    accountDetails: 'Account Details',
    accountCode: 'Account Code',
    accountName: 'Account Name',
    accountType: 'Account Type',
    balance: 'Balance',
    parent: 'Parent Account',
    status: {
      active: 'Active',
      inactive: 'Inactive'
    },
    types: {
      asset: 'Asset',
      liability: 'Liability',
      equity: 'Equity',
      revenue: 'Revenue',
      expense: 'Expense'
    },
    validation: {
      codeExists: 'Account code already exists',
      invalidCode: 'Invalid account code format',
      invalidName: 'Account name is required',
      invalidType: 'Please select an account type'
    }
  },
  invoices: {
    title: 'Invoices',
    newInvoice: 'New Invoice',
    invoiceDetails: 'Invoice Details',
    invoiceNumber: 'Invoice Number',
    issueDate: 'Issue Date',
    dueDate: 'Due Date',
    resident: 'Resident',
    subtotal: 'Subtotal',
    tax: 'Tax',
    total: 'Total',
    status: {
      draft: 'Draft',
      sent: 'Sent',
      paid: 'Paid',
      overdue: 'Overdue',
      cancelled: 'Cancelled',
      void: 'Void'
    },
    items: {
      description: 'Description',
      quantity: 'Quantity',
      unitPrice: 'Unit Price',
      taxRate: 'Tax Rate',
      amount: 'Amount',
      addItem: 'Add Item'
    },
    validation: {
      invalidNumber: 'Invalid invoice number',
      invalidDate: 'Invalid date',
      invalidResident: 'Please select a resident',
      noItems: 'At least one item is required'
    }
  },
  payments: {
    title: 'Payments',
    newPayment: 'New Payment',
    paymentDetails: 'Payment Details',
    amount: 'Amount',
    method: 'Payment Method',
    reference: 'Reference',
    date: 'Payment Date',
    status: {
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed',
      refunded: 'Refunded',
      cancelled: 'Cancelled'
    },
    methods: {
      directDebit: 'Direct Debit',
      card: 'Card Payment',
      bankTransfer: 'Bank Transfer',
      cash: 'Cash',
      check: 'Check'
    },
    validation: {
      invalidAmount: 'Invalid amount',
      invalidMethod: 'Please select a payment method',
      invalidDate: 'Invalid payment date'
    }
  },
  reports: {
    title: 'Financial Reports',
    availableReports: 'Available Reports',
    configuration: 'Report Configuration',
    dateRange: 'Date Range',
    format: 'Format',
    generate: 'Generate Report',
    email: 'Email Report',
    preview: 'Report Preview',
    generationStarted: 'Report generation started',
    types: {
      profitLoss: {
        name: 'Profit & Loss Statement',
        description: 'Comprehensive overview of revenue, expenses, and net income',
      },
      balanceSheet: {
        name: 'Balance Sheet',
        description: 'Snapshot of assets, liabilities, and equity',
      },
      cashFlow: {
        name: 'Cash Flow Statement',
        description: 'Analysis of cash inflows and outflows',
      },
      agedReceivables: {
        name: 'Aged Receivables',
        description: 'Analysis of outstanding invoices by age',
      },
      agedPayables: {
        name: 'Aged Payables',
        description: 'Analysis of outstanding payments by age',
      },
      compliance: {
        name: '{{ regulatoryBody }} Report',
        description: 'Regulatory compliance report',
      },
    },
    frequency: {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      annually: 'Annually',
    },
    status: {
      lastGenerated: 'Last Generated: {{ date }}',
      generating: 'Generating...',
      failed: 'Generation failed',
      completed: 'Completed',
    },
    dateRange: {
      start: 'Start Date',
      end: 'End Date',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      thisQuarter: 'This Quarter',
      lastQuarter: 'Last Quarter',
      thisYear: 'This Year',
      lastYear: 'Last Year',
      custom: 'Custom Range'
    },
    categories: {
      assets: 'Assets',
      liabilities: 'Liabilities',
      equity: 'Equity',
      revenue: 'Revenue',
      expenses: 'Expenses',
      netIncome: 'Net Income'
    }
  },
  settings: {
    title: 'Financial Settings',
    sections: {
      organization: 'Organization',
      invoicing: 'Invoicing',
      payments: 'Payments',
      notifications: 'Notifications',
      compliance: 'Compliance'
    },
    organization: {
      name: 'Organization Name',
      fiscalYear: 'Fiscal Year Start',
      currency: 'Default Currency',
      taxNumber: 'Tax Number',
      registrationNumber: 'Registration Number'
    },
    invoicing: {
      prefix: 'Invoice Number Prefix',
      terms: 'Default Payment Terms',
      dueDays: 'Default Due Days',
      notes: 'Default Invoice Notes'
    },
    payments: {
      methods: 'Payment Methods',
      gateway: 'Payment Gateway',
      apiKey: 'API Key',
      webhookSecret: 'Webhook Secret'
    },
    notifications: {
      invoiceGenerated: 'Invoice Generated',
      paymentReceived: 'Payment Received',
      paymentOverdue: 'Payment Overdue'
    },
    compliance: {
      dataRetention: 'Data Retention Period',
      vatEnabled: 'VAT Enabled',
      vatNumber: 'VAT Number'
    }
  },
  errors: {
    network: {
      offline: 'You are currently offline',
      syncFailed: 'Synchronization failed',
      retrying: 'Retrying...'
    },
    validation: {
      required: '{{field}} is required',
      invalid: 'Invalid {{field}}',
      minLength: '{{field}} must be at least {{min}} characters',
      maxLength: '{{field}} cannot exceed {{max}} characters',
      number: '{{field}} must be a number',
      positive: '{{field}} must be positive',
      date: '{{field}} must be a valid date',
      email: 'Invalid email address',
      phone: 'Invalid phone number'
    },
    permissions: {
      unauthorized: 'Unauthorized access',
      forbidden: 'Access forbidden',
      insufficientRights: 'Insufficient rights to perform this action'
    },
    system: {
      general: 'An error occurred. Please try again.',
      maintenance: 'System is under maintenance',
      timeout: 'Request timed out'
    }
  }
};
