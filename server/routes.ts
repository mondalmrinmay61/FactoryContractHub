import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertProjectSchema, 
  insertBidSchema, 
  insertMilestoneSchema,
  Project, 
  Bid 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // === Project Routes ===
  
  // Get all projects with optional filters
  app.get("/api/projects", async (req: Request, res: Response) => {
    try {
      const { category, status, location } = req.query;
      const filters: { category?: string; status?: string; location?: string } = {};
      
      if (category && typeof category === 'string') filters.category = category;
      if (status && typeof status === 'string') filters.status = status;
      if (location && typeof location === 'string') filters.location = location;
      
      const projects = await storage.getProjects(filters);
      res.json(projects);
    } catch (error) {
      console.error("Error getting projects:", error);
      res.status(500).json({ message: "Failed to get projects" });
    }
  });
  
  // Get a specific project by ID
  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error getting project:", error);
      res.status(500).json({ message: "Failed to get project" });
    }
  });
  
  // Create a new project (protected, company only)
  app.post("/api/projects", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      if (req.user.role !== "company") {
        return res.status(403).json({ message: "Only companies can create projects" });
      }
      
      const parsedData = insertProjectSchema.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({ errors: parsedData.error.errors });
      }
      
      const newProject = await storage.createProject({
        ...parsedData.data,
        companyId: req.user.id
      });
      
      res.status(201).json(newProject);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });
  
  // Get projects by company ID
  app.get("/api/companies/:id/projects", async (req: Request, res: Response) => {
    try {
      const companyId = parseInt(req.params.id);
      if (isNaN(companyId)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }
      
      const projects = await storage.getProjectsByCompanyId(companyId);
      res.json(projects);
    } catch (error) {
      console.error("Error getting company projects:", error);
      res.status(500).json({ message: "Failed to get company projects" });
    }
  });
  
  // === Bid Routes ===
  
  // Get bids for a project
  app.get("/api/projects/:id/bids", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // If the user is not authenticated or is not the company that posted the project
      if (!req.isAuthenticated() || (req.user.role === "company" && req.user.id !== project.companyId)) {
        // Return limited bid information (count, average, etc.)
        const bids = await storage.getBidsByProjectId(projectId);
        const bidSummary = {
          count: bids.length,
          averageBid: bids.length > 0 ? bids.reduce((sum: number, bid: Bid) => sum + Number(bid.amount), 0) / bids.length : 0,
        };
        return res.json(bidSummary);
      }
      
      // Return full bid details for authorized users
      const bids = await storage.getBidsByProjectId(projectId);
      res.json(bids);
    } catch (error) {
      console.error("Error getting project bids:", error);
      res.status(500).json({ message: "Failed to get project bids" });
    }
  });
  
  // Create a bid on a project (protected, contractor only)
  app.post("/api/projects/:id/bids", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      if (req.user.role !== "contractor") {
        return res.status(403).json({ message: "Only contractors can create bids" });
      }
      
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.status !== "open") {
        return res.status(400).json({ message: "Project is not open for bidding" });
      }
      
      const parsedData = insertBidSchema.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({ errors: parsedData.error.errors });
      }
      
      const newBid = await storage.createBid({
        ...parsedData.data,
        projectId,
        contractorId: req.user.id
      });
      
      res.status(201).json(newBid);
    } catch (error) {
      console.error("Error creating bid:", error);
      res.status(500).json({ message: "Failed to create bid" });
    }
  });
  
  // Get bids by contractor ID
  app.get("/api/contractors/:id/bids", async (req: Request, res: Response) => {
    try {
      const contractorId = parseInt(req.params.id);
      if (isNaN(contractorId)) {
        return res.status(400).json({ message: "Invalid contractor ID" });
      }
      
      // Only allow the contractor to see their own bids
      if (!req.isAuthenticated() || req.user.id !== contractorId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const bids = await storage.getBidsByContractorId(contractorId);
      res.json(bids);
    } catch (error) {
      console.error("Error getting contractor bids:", error);
      res.status(500).json({ message: "Failed to get contractor bids" });
    }
  });
  
  // Update bid status (accept/reject) - Only for companies
  app.patch("/api/bids/:id/status", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      if (req.user.role !== "company") {
        return res.status(403).json({ message: "Only companies can update bid status" });
      }
      
      const bidId = parseInt(req.params.id);
      if (isNaN(bidId)) {
        return res.status(400).json({ message: "Invalid bid ID" });
      }
      
      const { status } = req.body;
      if (!status || !["accepted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedBid = await storage.updateBidStatus(bidId, status);
      if (!updatedBid) {
        return res.status(404).json({ message: "Bid not found" });
      }
      
      res.json(updatedBid);
    } catch (error) {
      console.error("Error updating bid status:", error);
      res.status(500).json({ message: "Failed to update bid status" });
    }
  });
  
  // === Contract and Milestone Routes ===
  
  // Get contract by ID
  app.get("/api/contracts/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const contractId = parseInt(req.params.id);
      if (isNaN(contractId)) {
        return res.status(400).json({ message: "Invalid contract ID" });
      }
      
      const contract = await storage.getContractById(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Verify if user has access to this contract
      if (
        req.user.role !== "admin" && 
        req.user.id !== contract.project?.companyId && 
        req.user.id !== contract.bid?.contractorId
      ) {
        return res.status(403).json({ message: "Unauthorized access to contract" });
      }
      
      res.json(contract);
    } catch (error) {
      console.error("Error getting contract:", error);
      res.status(500).json({ message: "Failed to get contract" });
    }
  });
  
  // Create contract (when company accepts a bid)
  app.post("/api/contracts", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      if (req.user.role !== "company") {
        return res.status(403).json({ message: "Only companies can create contracts" });
      }
      
      const { bidId, startDate, endDate } = req.body;
      
      if (!bidId) {
        return res.status(400).json({ message: "Bid ID is required" });
      }
      
      // Find the bid
      const bid = await storage.getBidById(parseInt(bidId));
      if (!bid) {
        return res.status(404).json({ message: "Bid not found" });
      }
      
      // Verify if the company owns the project that the bid is for
      const project = await storage.getProjectById(bid.projectId);
      if (!project || project.companyId !== req.user.id) {
        return res.status(403).json({ message: "You can only create contracts for your own projects" });
      }
      
      // Create the contract
      const contractData = {
        bidId: parseInt(bidId),
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        status: "active"
      };
      
      const newContract = await storage.createContract(contractData);
      
      // Update project status to in_progress
      await storage.updateProjectStatus(project.id, "in_progress");
      
      // Update bid status to accepted
      await storage.updateBidStatus(bid.id, "accepted");
      
      res.status(201).json(newContract);
    } catch (error) {
      console.error("Error creating contract:", error);
      res.status(500).json({ message: "Failed to create contract" });
    }
  });
  
  // Get milestones for a contract
  app.get("/api/contracts/:id/milestones", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const contractId = parseInt(req.params.id);
      if (isNaN(contractId)) {
        return res.status(400).json({ message: "Invalid contract ID" });
      }
      
      const contract = await storage.getContractById(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Verify if user has access to this contract
      if (
        req.user.role !== "admin" && 
        req.user.id !== contract.project?.companyId && 
        req.user.id !== contract.bid?.contractorId
      ) {
        return res.status(403).json({ message: "Unauthorized access to contract milestones" });
      }
      
      const milestones = await storage.getMilestonesByContractId(contractId);
      res.json(milestones);
    } catch (error) {
      console.error("Error getting contract milestones:", error);
      res.status(500).json({ message: "Failed to get contract milestones" });
    }
  });
  
  // Create milestone for a contract
  app.post("/api/contracts/:id/milestones", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      // Only companies and admins can create milestones
      if (req.user.role !== "company" && req.user.role !== "admin") {
        return res.status(403).json({ message: "Only companies and admins can create milestones" });
      }
      
      const contractId = parseInt(req.params.id);
      if (isNaN(contractId)) {
        return res.status(400).json({ message: "Invalid contract ID" });
      }
      
      const contract = await storage.getContractById(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // If user is a company, verify they own this contract
      if (req.user.role === "company" && req.user.id !== contract.project?.companyId) {
        return res.status(403).json({ message: "You can only create milestones for your own contracts" });
      }
      
      // Parse and validate milestone data
      const parsedData = insertMilestoneSchema.safeParse({
        ...req.body,
        contractId
      });
      
      if (!parsedData.success) {
        return res.status(400).json({ errors: parsedData.error.errors });
      }
      
      const newMilestone = await storage.createMilestone(parsedData.data);
      res.status(201).json(newMilestone);
    } catch (error) {
      console.error("Error creating milestone:", error);
      res.status(500).json({ message: "Failed to create milestone" });
    }
  });
  
  // Update milestone
  app.patch("/api/milestones/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const milestoneId = parseInt(req.params.id);
      if (isNaN(milestoneId)) {
        return res.status(400).json({ message: "Invalid milestone ID" });
      }
      
      // Get the milestone
      const milestone = await storage.getMilestoneById(milestoneId);
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      
      // Get the contract to check ownership
      const contract = await storage.getContractById(milestone.contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Only companies that own the contract or admins can update milestones
      if (req.user.role !== "admin" && (req.user.role !== "company" || req.user.id !== contract.project?.companyId)) {
        return res.status(403).json({ message: "You can only update milestones for your own contracts" });
      }
      
      // Update milestone data
      const updatedMilestone = await storage.updateMilestone(milestoneId, req.body);
      res.json(updatedMilestone);
    } catch (error) {
      console.error("Error updating milestone:", error);
      res.status(500).json({ message: "Failed to update milestone" });
    }
  });
  
  // Update milestone status
  app.patch("/api/milestones/:id/status", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in" });
      }
      
      const milestoneId = parseInt(req.params.id);
      if (isNaN(milestoneId)) {
        return res.status(400).json({ message: "Invalid milestone ID" });
      }
      
      // Get the milestone
      const milestone = await storage.getMilestoneById(milestoneId);
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      
      // Get the contract to check permissions
      const contract = await storage.getContractById(milestone.contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      const { status, notes, deliverableUrl } = req.body;
      
      if (!status || !["pending", "completed", "verified", "paid"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Validate if the user has permission to change to this status
      if (req.user.role === "contractor") {
        // Contractor can only mark as completed if currently pending
        if (milestone.status !== "pending" || status !== "completed") {
          return res.status(403).json({ message: "Contractors can only mark pending milestones as completed" });
        }
        
        // Verify contractor is part of this contract
        if (req.user.id !== contract.bid?.contractorId) {
          return res.status(403).json({ message: "You can only update milestones for your own contracts" });
        }
      } else if (req.user.role === "company") {
        // Companies can mark as verified if completed, or mark as paid if verified
        if (
          (milestone.status === "completed" && status !== "verified") &&
          (milestone.status === "verified" && status !== "paid")
        ) {
          return res.status(403).json({ message: "Companies can only verify completed milestones or mark verified milestones as paid" });
        }
        
        // Verify company owns this contract
        if (req.user.id !== contract.project?.companyId) {
          return res.status(403).json({ message: "You can only update milestones for your own contracts" });
        }
      } else if (req.user.role !== "admin") {
        return res.status(403).json({ message: "You don't have permission to update milestone status" });
      }
      
      // Update status and related fields
      const updateData: any = { status };
      if (notes) updateData.notes = notes;
      if (deliverableUrl) updateData.deliverableUrl = deliverableUrl;
      
      // Add timestamp for the status change
      if (status === "completed") updateData.completionDate = new Date();
      if (status === "verified") updateData.verificationDate = new Date();
      if (status === "paid") updateData.paymentDate = new Date();
      
      const updatedMilestone = await storage.updateMilestoneStatus(milestoneId, updateData);
      
      // Check if all milestones are completed, and update contract status if needed
      if (status === "paid") {
        const allMilestones = await storage.getMilestonesByContractId(contract.id);
        const allPaid = allMilestones.every((m: any) => m.status === "paid");
        
        if (allPaid) {
          // Mark contract as completed
          await storage.updateContractStatus(contract.id, "completed");
          
          // Check if this was the last active contract for the project
          const project = await storage.getProjectById(contract.project?.id);
          if (project) {
            const activeContracts = await storage.getActiveContractsByProjectId(project.id);
            if (activeContracts.length === 0) {
              // Mark project as completed
              await storage.updateProjectStatus(project.id, "completed");
            }
          }
        }
      }
      
      res.json(updatedMilestone);
    } catch (error) {
      console.error("Error updating milestone status:", error);
      res.status(500).json({ message: "Failed to update milestone status" });
    }
  });
  
  // === Admin Routes ===
  
  // Middleware to check if user is an admin
  const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }
    
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    next();
  };
  
  // Get all users (admin only)
  app.get("/api/admin/users", isAdmin, async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      const role = req.query.role as string;
      const search = req.query.search as string;
      
      const users = await storage.getAllUsers({ page, limit, role, search });
      const total = await storage.getUsersCount({ role, search });
      
      res.json({
        data: users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error("Error getting all users:", error);
      res.status(500).json({ message: "Failed to get users" });
    }
  });
  
  // Get user by ID (admin only)
  app.get("/api/admin/users/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  // Update user (admin only)
  app.patch("/api/admin/users/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const { username, email, role } = req.body;
      
      // Don't allow changing username or email to one that already exists
      if (username) {
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: "Username already taken" });
        }
      }
      
      if (email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: "Email already taken" });
        }
      }
      
      // Update user
      const updatedUser = await storage.updateUser(userId, { username, email, role });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Update user verification status (admin only)
  app.patch("/api/admin/users/:id/verify", isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const { isVerified } = req.body;
      if (typeof isVerified !== "boolean") {
        return res.status(400).json({ message: "isVerified must be a boolean" });
      }
      
      const updatedUser = await storage.updateUserVerification(userId, isVerified);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user verification:", error);
      res.status(500).json({ message: "Failed to update user verification" });
    }
  });
  
  // Delete user (admin only)
  app.delete("/api/admin/users/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if this is the last admin
      if (req.user.id === userId) {
        // Don't allow deleting yourself
        return res.status(400).json({ message: "Cannot delete yourself" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.role === "admin") {
        const adminCount = await storage.getAdminCount();
        if (adminCount <= 1) {
          return res.status(400).json({ message: "Cannot delete the last admin" });
        }
      }
      
      const success = await storage.deleteUser(userId);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete user" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  
  // Get all projects (admin only)
  app.get("/api/admin/projects", isAdmin, async (req: Request, res: Response) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error getting all projects:", error);
      res.status(500).json({ message: "Failed to get projects" });
    }
  });
  
  // Get all contracts (admin only)
  app.get("/api/admin/contracts", isAdmin, async (req: Request, res: Response) => {
    try {
      const contracts = await storage.getAllContracts();
      res.json(contracts);
    } catch (error) {
      console.error("Error getting all contracts:", error);
      res.status(500).json({ message: "Failed to get contracts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
