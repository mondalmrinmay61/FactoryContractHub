import { db } from "@db";
import { eq } from "drizzle-orm";
import { InsertUser, User, users, profiles, companyProfiles, contractorProfiles, Project, projects, bids, Bid, InsertProject, InsertBid } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "@db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createProject(project: InsertProject): Promise<Project>;
  getProjects(filters?: { category?: string; status?: string; location?: string }): Promise<Project[]>;
  getProjectById(projectId: number): Promise<Project | undefined>;
  getProjectsByCompanyId(companyId: number): Promise<Project[]>;
  
  createBid(bid: InsertBid): Promise<Bid>;
  getBidsByProjectId(projectId: number): Promise<Bid[]>;
  getBidsByContractorId(contractorId: number): Promise<Bid[]>;
  updateBidStatus(bidId: number, status: string): Promise<Bid | undefined>;
  
  sessionStore: session.SessionStore;
}

class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      tableName: 'session',
      createTableIfMissing: true
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id)
    });
    return result;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: eq(users.username, username)
    });
    return result;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: eq(users.email, email)
    });
    return result;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [result] = await db.insert(users).values(user).returning();
    return result;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [result] = await db.insert(projects).values(project).returning();
    return result;
  }

  async getProjects(filters?: { category?: string; status?: string; location?: string }): Promise<Project[]> {
    let query = db.query.projects.findMany({
      orderBy: (projects, { desc }) => [desc(projects.createdAt)]
    });
    
    if (filters) {
      const { category, status, location } = filters;
      let conditions = [];
      
      if (category) {
        conditions.push(eq(projects.category, category));
      }
      
      if (status) {
        conditions.push(eq(projects.status, status));
      }
      
      // Note: For location we'd typically use a LIKE or more sophisticated geo search
      // This is a simplification
      if (location) {
        conditions.push(eq(projects.location, location));
      }
      
      if (conditions.length > 0) {
        query = db.query.projects.findMany({
          where: () => conditions.reduce((acc, condition) => acc && condition)
        });
      }
    }
    
    return query;
  }

  async getProjectById(projectId: number): Promise<Project | undefined> {
    const result = await db.query.projects.findFirst({
      where: eq(projects.id, projectId)
    });
    return result;
  }

  async getProjectsByCompanyId(companyId: number): Promise<Project[]> {
    const result = await db.query.projects.findMany({
      where: eq(projects.companyId, companyId),
      orderBy: (projects, { desc }) => [desc(projects.createdAt)]
    });
    return result;
  }

  async createBid(bid: InsertBid): Promise<Bid> {
    const [result] = await db.insert(bids).values(bid).returning();
    return result;
  }

  async getBidsByProjectId(projectId: number): Promise<Bid[]> {
    const result = await db.query.bids.findMany({
      where: eq(bids.projectId, projectId),
      orderBy: (bids, { asc }) => [asc(bids.amount)]
    });
    return result;
  }

  async getBidsByContractorId(contractorId: number): Promise<Bid[]> {
    const result = await db.query.bids.findMany({
      where: eq(bids.contractorId, contractorId),
      orderBy: (bids, { desc }) => [desc(bids.createdAt)]
    });
    return result;
  }

  async updateBidStatus(bidId: number, status: string): Promise<Bid | undefined> {
    const [result] = await db
      .update(bids)
      .set({ status, updatedAt: new Date() })
      .where(eq(bids.id, bidId))
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
