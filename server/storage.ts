import { db } from "@db";
import { eq, and, like, or, sql, desc, asc, gte, lte, isNull, not } from "drizzle-orm";
import { 
  InsertUser, 
  User, 
  users, 
  profiles, 
  companyProfiles, 
  contractorProfiles, 
  Project, 
  projects, 
  bids, 
  Bid, 
  contracts, 
  milestones,
  InsertProject, 
  InsertBid,
  InsertMilestone,
  Milestone
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "@db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User related methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(userId: number, updates: Partial<User>): Promise<User | undefined>;
  updateUserVerification(userId: number, isVerified: boolean): Promise<User | undefined>;
  deleteUser(userId: number): Promise<boolean>;
  
  // Admin related methods
  getAllUsers(options?: { page?: number; limit?: number; role?: string; search?: string }): Promise<User[]>;
  getUsersCount(options?: { role?: string; search?: string }): Promise<number>;
  getAdminCount(): Promise<number>;
  
  // Project related methods
  createProject(project: InsertProject): Promise<Project>;
  getProjects(filters?: { category?: string; status?: string; location?: string }): Promise<Project[]>;
  getProjectById(projectId: number): Promise<Project | undefined>;
  getProjectsByCompanyId(companyId: number): Promise<Project[]>;
  updateProjectStatus(projectId: number, status: string): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  
  // Bid related methods
  createBid(bid: InsertBid): Promise<Bid>;
  getBidsByProjectId(projectId: number): Promise<Bid[]>;
  getBidsByContractorId(contractorId: number): Promise<Bid[]>;
  updateBidStatus(bidId: number, status: string): Promise<Bid | undefined>;
  getBidById(bidId: number): Promise<Bid | undefined>;
  
  // Contract related methods
  createContract(contractData: any): Promise<any>;
  getContractById(contractId: number): Promise<any>;
  updateContractStatus(contractId: number, status: string): Promise<any>;
  getAllContracts(): Promise<any[]>;
  getActiveContractsByProjectId(projectId: number): Promise<any[]>;
  
  // Milestone related methods
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  getMilestonesByContractId(contractId: number): Promise<Milestone[]>;
  getMilestoneById(milestoneId: number): Promise<Milestone | undefined>;
  updateMilestone(milestoneId: number, updates: Partial<Milestone>): Promise<Milestone | undefined>;
  updateMilestoneStatus(milestoneId: number, updates: { status: string, [key: string]: any }): Promise<Milestone | undefined>;
  
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
  
  // Additional Bid methods
  async getBidById(bidId: number): Promise<Bid | undefined> {
    const result = await db.query.bids.findFirst({
      where: eq(bids.id, bidId)
    });
    return result;
  }
  
  // User management methods
  async updateUser(userId: number, updates: Partial<User>): Promise<User | undefined> {
    const [result] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return result;
  }
  
  async updateUserVerification(userId: number, isVerified: boolean): Promise<User | undefined> {
    // First get the user to check if they have a profile
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    // Update the profile's isVerified field
    await db
      .update(profiles)
      .set({ isVerified, updatedAt: new Date() })
      .where(eq(profiles.userId, userId));
    
    // Return the updated user with profile information
    return this.getUser(userId);
  }
  
  async deleteUser(userId: number): Promise<boolean> {
    try {
      // In a real application, we'd need to handle cascading deletes or use database triggers
      // Here we'll just delete the user directly
      const [result] = await db
        .delete(users)
        .where(eq(users.id, userId))
        .returning();
      
      return !!result;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }
  
  // Admin methods
  async getAllUsers(options?: { page?: number; limit?: number; role?: string; search?: string }): Promise<User[]> {
    const { page = 1, limit = 10, role, search } = options || {};
    const offset = (page - 1) * limit;
    
    let query = db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)],
      limit,
      offset
    });
    
    // Apply filters if provided
    if (role || search) {
      let conditions = [];
      
      if (role && role !== 'all') {
        conditions.push(eq(users.role, role));
      }
      
      if (search) {
        conditions.push(
          or(
            like(users.username, `%${search}%`),
            like(users.email, `%${search}%`)
          )
        );
      }
      
      if (conditions.length > 0) {
        query = db.query.users.findMany({
          where: (users) => conditions.reduce((acc, condition) => and(acc, condition)),
          orderBy: (users, { desc }) => [desc(users.createdAt)],
          limit,
          offset
        });
      }
    }
    
    return query;
  }
  
  async getUsersCount(options?: { role?: string; search?: string }): Promise<number> {
    const { role, search } = options || {};
    
    let conditions = [];
    
    if (role && role !== 'all') {
      conditions.push(eq(users.role, role));
    }
    
    if (search) {
      conditions.push(
        or(
          like(users.username, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }
    
    const whereClause = conditions.length > 0
      ? (users) => conditions.reduce((acc, condition) => and(acc, condition))
      : undefined;
    
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereClause)
      .execute();
    
    return result[0]?.count || 0;
  }
  
  async getAdminCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, 'admin'))
      .execute();
    
    return result[0]?.count || 0;
  }
  
  // Project methods
  async updateProjectStatus(projectId: number, status: string): Promise<Project | undefined> {
    const [result] = await db
      .update(projects)
      .set({ status, updatedAt: new Date() })
      .where(eq(projects.id, projectId))
      .returning();
    return result;
  }
  
  async getAllProjects(): Promise<Project[]> {
    return db.query.projects.findMany({
      orderBy: (projects, { desc }) => [desc(projects.createdAt)]
    });
  }
  
  // Contract methods
  async createContract(contractData: any): Promise<any> {
    const [result] = await db.insert(contracts).values(contractData).returning();
    return result;
  }
  
  async getContractById(contractId: number): Promise<any> {
    const result = await db.query.contracts.findFirst({
      where: eq(contracts.id, contractId),
      with: {
        bid: {
          with: {
            contractor: true
          }
        },
        project: {
          with: {
            company: true
          }
        }
      }
    });
    return result;
  }
  
  async updateContractStatus(contractId: number, status: string): Promise<any> {
    const [result] = await db
      .update(contracts)
      .set({ status, updatedAt: new Date() })
      .where(eq(contracts.id, contractId))
      .returning();
    return result;
  }
  
  async getAllContracts(): Promise<any[]> {
    return db.query.contracts.findMany({
      orderBy: (contracts, { desc }) => [desc(contracts.createdAt)],
      with: {
        bid: {
          with: {
            contractor: true
          }
        },
        project: {
          with: {
            company: true
          }
        }
      }
    });
  }
  
  async getActiveContractsByProjectId(projectId: number): Promise<any[]> {
    return db.query.contracts.findMany({
      where: (contracts) => 
        and(
          eq(contracts.status, 'active'),
          eq(contracts.project.id, projectId)
        ),
      with: {
        bid: true,
        project: true
      }
    });
  }
  
  // Milestone methods
  async createMilestone(milestone: InsertMilestone): Promise<Milestone> {
    const [result] = await db.insert(milestones).values({
      ...milestone,
      status: milestone.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return result;
  }
  
  async getMilestonesByContractId(contractId: number): Promise<Milestone[]> {
    return db.query.milestones.findMany({
      where: eq(milestones.contractId, contractId),
      orderBy: (milestones, { asc }) => [asc(milestones.order)]
    });
  }
  
  async getMilestoneById(milestoneId: number): Promise<Milestone | undefined> {
    return db.query.milestones.findFirst({
      where: eq(milestones.id, milestoneId)
    });
  }
  
  async updateMilestone(milestoneId: number, updates: Partial<Milestone>): Promise<Milestone | undefined> {
    const [result] = await db
      .update(milestones)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(milestones.id, milestoneId))
      .returning();
    return result;
  }
  
  async updateMilestoneStatus(milestoneId: number, updates: { status: string, [key: string]: any }): Promise<Milestone | undefined> {
    const { status, ...otherUpdates } = updates;
    
    const [result] = await db
      .update(milestones)
      .set({ 
        status, 
        ...otherUpdates,
        updatedAt: new Date() 
      })
      .where(eq(milestones.id, milestoneId))
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
