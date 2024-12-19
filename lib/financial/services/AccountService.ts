import { Account, AccountType, Transaction, TransactionType } from '../types';
import { FinancialDB } from '../db';

export class AccountService {
  constructor(private db: FinancialDB) {}

  async createAccount(data: Omit<Account, 'id' | 'balance' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    return this.db.createAccount(data);
  }

  async getAccount(id: string): Promise<Account | null> {
    return this.db.getAccount(id);
  }

  async updateAccount(id: string, data: Partial<Account>): Promise<Account> {
    return this.db.updateAccount(id, data);
  }

  async deleteAccount(id: string): Promise<void> {
    const account = await this.getAccount(id);
    if (!account) {
      throw new Error(`Account not found: ${id}`);
    }

    if (account.balance !== 0) {
      throw new Error(`Cannot delete account with non-zero balance: ${id}`);
    }

    await this.db.deleteAccount(id);
  }

  async getAccountsByType(type: AccountType): Promise<Account[]> {
    return this.db.getAccountsByType(type);
  }

  async getAccountHierarchy(): Promise<Account[]> {
    return this.db.getAccountHierarchy();
  }

  async postTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const account = await this.getAccount(transaction.accountId);
    if (!account) {
      throw new Error(`Account not found: ${transaction.accountId}`);
    }

    // Create transaction
    const newTransaction = await this.db.createTransaction(transaction);

    // Update account balance
    const balanceChange = transaction.type === TransactionType.DEBIT ? 
      transaction.amount : -transaction.amount;
    
    await this.updateAccount(account.id, {
      balance: account.balance + balanceChange
    });

    return newTransaction;
  }

  async getAccountBalance(id: string): Promise<number> {
    const account = await this.getAccount(id);
    if (!account) {
      throw new Error(`Account not found: ${id}`);
    }
    return account.balance;
  }

  async validateAccountCode(code: string): Promise<boolean> {
    const account = await this.db.getAccount(code);
    return !account;
  }
}
