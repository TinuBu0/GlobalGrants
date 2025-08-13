import {
  users,
  countries,
  grants,
  applications,
  contactMessages,
  grantAwards,
  type User,
  type UpsertUser,
  type Country,
  type Grant,
  type Application,
  type ContactMessage,
  type GrantAward,
  type InsertCountry,
  type InsertGrant,
  type InsertApplication,
  type InsertContactMessage,
  type InsertGrantAward,
  type GrantWithCountry,
  type ApplicationWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(id: string, userData: UpsertUser): Promise<User>;
  
  // Country operations
  getAllCountries(): Promise<Country[]>;
  getActiveCountries(): Promise<Country[]>;
  createCountry(country: InsertCountry): Promise<Country>;
  
  // Grant operations
  getAllGrants(): Promise<GrantWithCountry[]>;
  getGrantById(id: string): Promise<GrantWithCountry | undefined>;
  getGrantsByCountry(countryId: string): Promise<GrantWithCountry[]>;
  getGrantsByCategory(category: string): Promise<GrantWithCountry[]>;
  createGrant(grant: InsertGrant): Promise<Grant>;
  updateGrant(id: string, updates: Partial<Grant>): Promise<Grant>;
  
  // Application operations
  getApplicationsByUser(userId: string): Promise<ApplicationWithDetails[]>;
  getApplicationsByGrant(grantId: string): Promise<Application[]>;
  getApplicationById(id: string): Promise<ApplicationWithDetails | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: string, updates: Partial<Application>): Promise<Application>;
  checkUserHasAppliedToGrant(userId: string, grantId: string): Promise<boolean>;
  checkReferralExists(referralName: string): Promise<boolean>;
  
  // Contact operations
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getAllContactMessages(): Promise<ContactMessage[]>;
  
  // Award operations
  createGrantAward(award: InsertGrantAward): Promise<GrantAward>;
  getAwardsByUser(userId: string): Promise<GrantAward[]>;
  
  // Statistics
  getGrantStats(): Promise<{
    totalGrantsDistributed: number;
    totalRecipients: number;
    totalCountries: number;
    successRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(id: string, userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        id,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Country operations
  async getAllCountries(): Promise<Country[]> {
    return await db.select().from(countries).orderBy(asc(countries.name));
  }

  async getActiveCountries(): Promise<Country[]> {
    return await db
      .select()
      .from(countries)
      .where(eq(countries.active, true))
      .orderBy(asc(countries.name));
  }

  async createCountry(country: InsertCountry): Promise<Country> {
    const [newCountry] = await db.insert(countries).values(country).returning();
    return newCountry;
  }

  // Grant operations
  async getAllGrants(): Promise<GrantWithCountry[]> {
    const results = await db
      .select()
      .from(grants)
      .leftJoin(countries, eq(grants.countryId, countries.id))
      .orderBy(desc(grants.createdAt));
    
    return results.map(result => ({
      ...result.grants,
      countries: result.countries,
    }));
  }

  async getGrantById(id: string): Promise<GrantWithCountry | undefined> {
    const [result] = await db
      .select()
      .from(grants)
      .leftJoin(countries, eq(grants.countryId, countries.id))
      .where(eq(grants.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.grants,
      countries: result.countries,
    };
  }

  async getGrantsByCountry(countryId: string): Promise<GrantWithCountry[]> {
    const results = await db
      .select()
      .from(grants)
      .leftJoin(countries, eq(grants.countryId, countries.id))
      .where(eq(grants.countryId, countryId))
      .orderBy(desc(grants.createdAt));
    
    return results.map(result => ({
      ...result.grants,
      countries: result.countries,
    }));
  }

  async getGrantsByCategory(category: string): Promise<GrantWithCountry[]> {
    const results = await db
      .select()
      .from(grants)
      .leftJoin(countries, eq(grants.countryId, countries.id))
      .where(eq(grants.category, category as any))
      .orderBy(desc(grants.createdAt));
    
    return results.map(result => ({
      ...result.grants,
      countries: result.countries,
    }));
  }

  async createGrant(grant: InsertGrant): Promise<Grant> {
    const [newGrant] = await db.insert(grants).values(grant).returning();
    return newGrant;
  }

  async updateGrant(id: string, updates: Partial<Grant>): Promise<Grant> {
    const [updatedGrant] = await db
      .update(grants)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(grants.id, id))
      .returning();
    return updatedGrant;
  }

  // Application operations
  async getApplicationsByUser(userId: string): Promise<ApplicationWithDetails[]> {
    const results = await db
      .select()
      .from(applications)
      .leftJoin(grants, eq(applications.grantId, grants.id))
      .leftJoin(countries, eq(grants.countryId, countries.id))
      .leftJoin(users, eq(applications.userId, users.id))
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.submittedAt));

    return results.map(result => ({
      ...result.applications,
      grant: {
        ...result.grants!,
        countries: result.countries,
      },
      user: result.users!,
    }));
  }

  async getApplicationsByGrant(grantId: string): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.grantId, grantId))
      .orderBy(desc(applications.submittedAt));
  }

  async getApplicationById(id: string): Promise<ApplicationWithDetails | undefined> {
    const [result] = await db
      .select()
      .from(applications)
      .leftJoin(grants, eq(applications.grantId, grants.id))
      .leftJoin(countries, eq(grants.countryId, countries.id))
      .leftJoin(users, eq(applications.userId, users.id))
      .where(eq(applications.id, id));

    if (!result) return undefined;

    return {
      ...result.applications,
      grant: {
        ...result.grants!,
        countries: result.countries,
      },
      user: result.users!,
    };
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db.insert(applications).values(application).returning();
    return newApplication;
  }

  async updateApplication(id: string, updates: Partial<Application>): Promise<Application> {
    const [updatedApplication] = await db
      .update(applications)
      .set(updates)
      .where(eq(applications.id, id))
      .returning();
    return updatedApplication;
  }

  async checkUserHasAppliedToGrant(userId: string, grantId: string): Promise<boolean> {
    const [result] = await db
      .select({ count: count() })
      .from(applications)
      .where(
        and(
          eq(applications.userId, userId),
          eq(applications.grantId, grantId)
        )
      );
    return result.count > 0;
  }

  async checkReferralExists(referralName: string): Promise<boolean> {
    const [result] = await db
      .select({ count: count() })
      .from(grantAwards)
      .leftJoin(users, eq(grantAwards.userId, users.id))
      .where(
        sql`CONCAT(${users.firstName}, ' ', ${users.lastName}) ILIKE ${'%' + referralName + '%'}`
      );
    return result.count > 0;
  }

  // Contact operations
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    return await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));
  }

  // Award operations
  async createGrantAward(award: InsertGrantAward): Promise<GrantAward> {
    const [newAward] = await db.insert(grantAwards).values(award).returning();
    return newAward;
  }

  async getAwardsByUser(userId: string): Promise<GrantAward[]> {
    return await db
      .select()
      .from(grantAwards)
      .where(eq(grantAwards.userId, userId))
      .orderBy(desc(grantAwards.awardedAt));
  }

  // Statistics
  async getGrantStats(): Promise<{
    totalGrantsDistributed: number;
    totalRecipients: number;
    totalCountries: number;
    successRate: number;
  }> {
    const [grantsDistributed] = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(${grantAwards.amount}), 0)` 
      })
      .from(grantAwards);

    const [recipients] = await db
      .select({ count: count() })
      .from(grantAwards);

    const [countriesCount] = await db
      .select({ count: count() })
      .from(countries)
      .where(eq(countries.active, true));

    const [totalApplications] = await db
      .select({ count: count() })
      .from(applications);

    const [selectedApplications] = await db
      .select({ count: count() })
      .from(applications)
      .where(eq(applications.status, 'selected'));

    const successRate = totalApplications.count > 0 
      ? (selectedApplications.count / totalApplications.count) * 100 
      : 0;

    return {
      totalGrantsDistributed: grantsDistributed.total,
      totalRecipients: recipients.count,
      totalCountries: countriesCount.count,
      successRate: Math.round(successRate),
    };
  }
}

export const storage = new DatabaseStorage();
