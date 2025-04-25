import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertProjectSchema, insertBidSchema, Project, Bid } from "@shared/schema";

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

  const httpServer = createServer(app);
  return httpServer;
}
