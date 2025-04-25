import { db } from "./index";
import * as schema from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    console.log("Starting database seeding...");
    
    // Check if we already have users
    const existingUsers = await db.query.users.findMany({
      limit: 1
    });
    
    if (existingUsers.length > 0) {
      console.log("Database already contains users, skipping seed to avoid duplicates");
      return;
    }
    
    // Create companies
    const buildRightPassword = await hashPassword("password123");
    const techManufacturingPassword = await hashPassword("password123");
    const globalLogisticsPassword = await hashPassword("password123");
    
    // Insert companies
    const [buildRight] = await db.insert(schema.users).values({
      username: "buildright",
      email: "operations@buildright.com",
      password: buildRightPassword,
      role: "company"
    }).returning();
    
    const [techManufacturing] = await db.insert(schema.users).values({
      username: "techmanufacturing",
      email: "contact@techmanufacturing.com",
      password: techManufacturingPassword,
      role: "company"
    }).returning();
    
    const [globalLogistics] = await db.insert(schema.users).values({
      username: "globallogistics",
      email: "info@globallogistics.com",
      password: globalLogisticsPassword,
      role: "company"
    }).returning();
    
    // Create company profiles
    const [buildRightProfile] = await db.insert(schema.profiles).values({
      userId: buildRight.id,
      name: "Axis Construction Inc.",
      description: "Leading construction company specializing in commercial building renovations.",
      location: "Austin, TX",
      contactEmail: "operations@buildright.com",
      contactPhone: "512-555-1234",
      website: "https://www.buildright.com",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    }).returning();
    
    const [techManufacturingProfile] = await db.insert(schema.profiles).values({
      userId: techManufacturing.id,
      name: "TechManufacturing Ltd.",
      description: "Innovative manufacturing company with a focus on technology and sustainability.",
      location: "Chicago, IL",
      contactEmail: "contact@techmanufacturing.com",
      contactPhone: "312-555-6789",
      website: "https://www.techmanufacturing.com",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg"
    }).returning();
    
    const [globalLogisticsProfile] = await db.insert(schema.profiles).values({
      userId: globalLogistics.id,
      name: "Global Logistics Co.",
      description: "Worldwide transportation and logistics services for businesses of all sizes.",
      location: "Denver, CO",
      contactEmail: "info@globallogistics.com",
      contactPhone: "720-555-4321",
      website: "https://www.globallogistics.com",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg"
    }).returning();
    
    // Add company profile details
    await db.insert(schema.companyProfiles).values({
      profileId: buildRightProfile.id,
      companySize: "51-200 employees",
      industry: "Construction",
      yearFounded: 2005
    });
    
    await db.insert(schema.companyProfiles).values({
      profileId: techManufacturingProfile.id,
      companySize: "201-500 employees",
      industry: "Manufacturing",
      yearFounded: 1998
    });
    
    await db.insert(schema.companyProfiles).values({
      profileId: globalLogisticsProfile.id,
      companySize: "501-1000 employees",
      industry: "Transportation & Logistics",
      yearFounded: 2001
    });
    
    // Create contractors
    const robertPassword = await hashPassword("password123");
    const mariaPassword = await hashPassword("password123");
    const davidPassword = await hashPassword("password123");
    const jamesPassword = await hashPassword("password123");
    
    const [robertJohnson] = await db.insert(schema.users).values({
      username: "robertjohnson",
      email: "robert@electricalservices.com",
      password: robertPassword,
      role: "contractor"
    }).returning();
    
    const [mariaRodriguez] = await db.insert(schema.users).values({
      username: "mariarodriguez",
      email: "maria@paintingservices.com",
      password: mariaPassword,
      role: "contractor"
    }).returning();
    
    const [davidChen] = await db.insert(schema.users).values({
      username: "davidchen",
      email: "david@plumbingservices.com",
      password: davidPassword,
      role: "contractor"
    }).returning();
    
    const [jamesWilson] = await db.insert(schema.users).values({
      username: "jameswilson",
      email: "james@constructionmgmt.com",
      password: jamesPassword,
      role: "contractor"
    }).returning();
    
    // Create contractor profiles
    const [robertProfile] = await db.insert(schema.profiles).values({
      userId: robertJohnson.id,
      name: "Robert Johnson",
      description: "Licensed electrical contractor with over 15 years of experience in industrial and commercial projects.",
      location: "Dallas, TX",
      contactEmail: "robert@electricalservices.com",
      contactPhone: "214-555-7890",
      website: "https://www.rjelectrical.com",
      avatar: "https://randomuser.me/api/portraits/men/75.jpg"
    }).returning();
    
    const [mariaProfile] = await db.insert(schema.profiles).values({
      userId: mariaRodriguez.id,
      name: "Maria Rodriguez",
      description: "Professional painting contractor specializing in commercial and residential projects.",
      location: "Miami, FL",
      contactEmail: "maria@paintingservices.com",
      contactPhone: "305-555-2468",
      website: "https://www.mariapaintingservices.com",
      avatar: "https://randomuser.me/api/portraits/women/26.jpg"
    }).returning();
    
    const [davidProfile] = await db.insert(schema.profiles).values({
      userId: davidChen.id,
      name: "David Chen",
      description: "Experienced plumbing contractor providing services for industrial facilities and large commercial buildings.",
      location: "Seattle, WA",
      contactEmail: "david@plumbingservices.com",
      contactPhone: "206-555-1357",
      website: "https://www.davidchenplumbing.com",
      avatar: "https://randomuser.me/api/portraits/men/52.jpg"
    }).returning();
    
    const [jamesProfile] = await db.insert(schema.profiles).values({
      userId: jamesWilson.id,
      name: "James Wilson",
      description: "Certified construction manager with extensive experience in overseeing large-scale industrial and commercial projects.",
      location: "Houston, TX",
      contactEmail: "james@constructionmgmt.com",
      contactPhone: "713-555-9876",
      website: "https://www.wilsoncm.com",
      avatar: "https://randomuser.me/api/portraits/men/36.jpg"
    }).returning();
    
    // Add contractor profile details
    await db.insert(schema.contractorProfiles).values({
      profileId: robertProfile.id,
      specialization: "Electrical Contractor",
      yearsOfExperience: 15,
      skills: ["Commercial", "Industrial", "Maintenance"],
      hourlyRate: 75.00
    });
    
    await db.insert(schema.contractorProfiles).values({
      profileId: mariaProfile.id,
      specialization: "Painting Contractor",
      yearsOfExperience: 12,
      skills: ["Commercial", "Residential", "Interior"],
      hourlyRate: 65.00
    });
    
    await db.insert(schema.contractorProfiles).values({
      profileId: davidProfile.id,
      specialization: "Plumbing Contractor",
      yearsOfExperience: 10,
      skills: ["Industrial", "Emergency", "Installation"],
      hourlyRate: 70.00
    });
    
    await db.insert(schema.contractorProfiles).values({
      profileId: jamesProfile.id,
      specialization: "Construction Manager",
      yearsOfExperience: 18,
      skills: ["Commercial", "Industrial", "Project Management"],
      hourlyRate: 85.00
    });
    
    // Create projects
    const [project1] = await db.insert(schema.projects).values({
      companyId: buildRight.id,
      title: "Commercial Building Renovation",
      description: "Complete renovation of a 3-story commercial building including electrical rewiring, plumbing updates, and interior remodeling.",
      category: "construction",
      location: "Austin, TX",
      budgetMin: 50000.00,
      budgetMax: 75000.00,
      duration: "2-3 months",
      status: "open"
    }).returning();
    
    const [project2] = await db.insert(schema.projects).values({
      companyId: techManufacturing.id,
      title: "Factory Electrical System Upgrade",
      description: "Comprehensive upgrade of electrical systems in manufacturing facility, including new distribution panels and energy-efficient lighting installation.",
      category: "electrical",
      location: "Chicago, IL",
      budgetMin: 20000.00,
      budgetMax: 35000.00,
      duration: "3-4 weeks",
      status: "open"
    }).returning();
    
    const [project3] = await db.insert(schema.projects).values({
      companyId: globalLogistics.id,
      title: "Office Building Transportation Services",
      description: "Long-term contract for transportation of goods between manufacturing plants and distribution centers on a weekly schedule.",
      category: "transportation",
      location: "Denver, CO",
      budgetMin: 5000.00, 
      budgetMax: 5000.00, // Fixed monthly rate
      duration: "12 months",
      status: "open"
    }).returning();
    
    // Create project requirements
    await db.insert(schema.projectRequirements).values([
      {
        projectId: project1.id,
        requirement: "Licensed and insured contractor required"
      },
      {
        projectId: project1.id,
        requirement: "Minimum 10 years experience in commercial renovations"
      },
      {
        projectId: project1.id,
        requirement: "Must provide own equipment and tools"
      },
      {
        projectId: project2.id,
        requirement: "Certified electrician with industrial experience"
      },
      {
        projectId: project2.id,
        requirement: "Experience with energy-efficient lighting systems"
      },
      {
        projectId: project3.id,
        requirement: "Commercial driver's license (CDL) required"
      },
      {
        projectId: project3.id,
        requirement: "Ability to commit to regular weekly schedule"
      }
    ]);
    
    // Add some bids
    const [bid1] = await db.insert(schema.bids).values({
      projectId: project1.id,
      contractorId: jamesWilson.id,
      amount: 65000.00,
      description: "Comprehensive renovation services with a team of experienced professionals. Will complete all aspects of the project including electrical, plumbing, and interior work.",
      deliveryTime: "2.5 months",
      status: "pending"
    }).returning();
    
    const [bid2] = await db.insert(schema.bids).values({
      projectId: project2.id,
      contractorId: robertJohnson.id,
      amount: 28500.00,
      description: "Complete electrical system upgrade with energy-efficient lighting installation. Will ensure minimal disruption to manufacturing operations.",
      deliveryTime: "3 weeks",
      status: "pending"
    }).returning();
    
    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
