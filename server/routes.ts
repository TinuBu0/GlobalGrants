import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertApplicationSchema,
  insertContactMessageSchema,
  insertGrantSchema,
  insertCountrySchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Initialize countries if they don't exist
  await initializeCountries();

  // Initialize sample grants if they don't exist
  await initializeGrants();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public routes
  app.get('/api/countries', async (req, res) => {
    try {
      const countries = await storage.getActiveCountries();
      res.json(countries);
    } catch (error) {
      console.error("Error fetching countries:", error);
      res.status(500).json({ message: "Failed to fetch countries" });
    }
  });

  app.get('/api/grants', async (req, res) => {
    try {
      const { country, category } = req.query;
      
      let grants;
      if (country) {
        grants = await storage.getGrantsByCountry(country as string);
      } else if (category) {
        grants = await storage.getGrantsByCategory(category as string);
      } else {
        grants = await storage.getAllGrants();
      }
      
      res.json(grants);
    } catch (error) {
      console.error("Error fetching grants:", error);
      res.status(500).json({ message: "Failed to fetch grants" });
    }
  });

  app.get('/api/grants/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const grant = await storage.getGrantById(id);
      
      if (!grant) {
        return res.status(404).json({ message: "Grant not found" });
      }
      
      res.json(grant);
    } catch (error) {
      console.error("Error fetching grant:", error);
      res.status(500).json({ message: "Failed to fetch grant" });
    }
  });

  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getGrantStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Contact form
  app.post('/api/contact', async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.status(201).json({ message: "Message sent successfully", id: message.id });
    } catch (error) {
      console.error("Error creating contact message:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Check referral status (public)
  app.post('/api/check-referral', async (req, res) => {
    try {
      const { referralName } = req.body;
      
      if (!referralName || typeof referralName !== 'string') {
        return res.status(400).json({ message: "Referral name is required" });
      }
      
      const exists = await storage.checkReferralExists(referralName);
      res.json({ exists, autoQualified: exists });
    } catch (error) {
      console.error("Error checking referral:", error);
      res.status(500).json({ message: "Failed to check referral status" });
    }
  });

  // Protected routes
  app.get('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applications = await storage.getApplicationsByUser(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applicationData = insertApplicationSchema.parse(req.body);
      
      // Check if user has already applied to this grant
      const hasApplied = await storage.checkUserHasAppliedToGrant(userId, applicationData.grantId);
      if (hasApplied) {
        return res.status(400).json({ message: "You have already applied to this grant" });
      }
      
      // Check referral status
      let autoQualified = false;
      let hasReferral = false;
      
      if (applicationData.referralName && applicationData.referralName.trim()) {
        hasReferral = await storage.checkReferralExists(applicationData.referralName);
        autoQualified = hasReferral;
      }
      
      // Random qualification for non-referral applicants (70% chance)
      if (!autoQualified) {
        autoQualified = Math.random() > 0.3;
      }
      
      const application = await storage.createApplication({
        ...applicationData,
        userId,
        hasReferral,
        autoQualified,
        status: autoQualified ? 'qualified' : 'not_qualified',
      });
      
      res.status(201).json({ 
        application, 
        qualified: autoQualified,
        message: autoQualified 
          ? (hasReferral 
              ? "Application submitted! You are automatically qualified due to your referral." 
              : "Application submitted! You have been qualified for selection.")
          : "Application submitted. Unfortunately, you do not meet the current qualification criteria."
      });
    } catch (error) {
      console.error("Error creating application:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to submit application" });
    }
  });

  app.get('/api/applications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      const application = await storage.getApplicationById(id);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Check if the application belongs to the user
      if (application.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(application);
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({ message: "Failed to fetch application" });
    }
  });

  app.get('/api/awards', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const awards = await storage.getAwardsByUser(userId);
      res.json(awards);
    } catch (error) {
      console.error("Error fetching awards:", error);
      res.status(500).json({ message: "Failed to fetch awards" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function initializeCountries() {
  try {
    const countries = await storage.getAllCountries();
    if (countries.length === 0) {
      const defaultCountries = [
        { id: 'usa', name: 'United States', code: 'USA', currency: 'USD', flag: '🇺🇸', active: true },
        { id: 'uk', name: 'United Kingdom', code: 'GBR', currency: 'GBP', flag: '🇬🇧', active: true },
        { id: 'canada', name: 'Canada', code: 'CAN', currency: 'CAD', flag: '🇨🇦', active: true },
        { id: 'australia', name: 'Australia', code: 'AUS', currency: 'AUD', flag: '🇦🇺', active: true },
        { id: 'newzealand', name: 'New Zealand', code: 'NZL', currency: 'NZD', flag: '🇳🇿', active: true },
        { id: 'germany', name: 'Germany', code: 'DEU', currency: 'EUR', flag: '🇩🇪', active: true },
        { id: 'france', name: 'France', code: 'FRA', currency: 'EUR', flag: '🇫🇷', active: true },
        { id: 'japan', name: 'Japan', code: 'JPN', currency: 'JPY', flag: '🇯🇵', active: true },
        { id: 'southkorea', name: 'South Korea', code: 'KOR', currency: 'KRW', flag: '🇰🇷', active: true },
        { id: 'singapore', name: 'Singapore', code: 'SGP', currency: 'SGD', flag: '🇸🇬', active: true },
        { id: 'uae', name: 'United Arab Emirates', code: 'ARE', currency: 'AED', flag: '🇦🇪', active: true },
        { id: 'netherlands', name: 'Netherlands', code: 'NLD', currency: 'EUR', flag: '🇳🇱', active: true },
        { id: 'sweden', name: 'Sweden', code: 'SWE', currency: 'SEK', flag: '🇸🇪', active: true },
        { id: 'norway', name: 'Norway', code: 'NOR', currency: 'NOK', flag: '🇳🇴', active: true },
      ];

      for (const country of defaultCountries) {
        await storage.createCountry(country);
      }
      console.log('Initialized default countries');
    }
  } catch (error) {
    console.error('Error initializing countries:', error);
  }
}

async function initializeGrants() {
  try {
    const grants = await storage.getAllGrants();
    if (grants.length === 0) {
      const sampleGrants = [
        {
          title: 'Senior Citizens Support Grant',
          description: 'Comprehensive support for seniors covering healthcare, housing modifications, and daily living assistance.',
          category: 'seniors' as const,
          countryId: 'usa',
          minAmount: '15000',
          maxAmount: '35000',
          currency: 'USD',
          amountType: 'range',
          totalSpots: 750,
          availableSpots: 750,
          deadline: new Date('2025-06-30'),
          status: 'active' as const,
          eligibilityCriteria: 'Age 65 or older with demonstrated need for assistance',
          applicationInstructions: 'Submit age verification, medical records, and needs assessment',
        },
        {
          title: 'Emergency Financial Relief Grant',
          description: 'Immediate financial assistance for individuals and families facing unexpected hardships.',
          category: 'emergency' as const,
          countryId: 'uk',
          minAmount: '5000',
          maxAmount: '35000',
          currency: 'GBP',
          amountType: 'range',
          totalSpots: 9999,
          availableSpots: 9999,
          deadline: null,
          status: 'active' as const,
          eligibilityCriteria: 'Demonstrated financial hardship due to unexpected circumstances',
          applicationInstructions: 'Submit hardship documentation and proof of expenses',
        },
        {
          title: 'First Home Buyer Assistance Grant',
          description: 'Supporting first-time home buyers with down payment assistance and closing cost relief.',
          category: 'homebuyer' as const,
          countryId: 'australia',
          minAmount: '20000',
          maxAmount: '60000',
          currency: 'AUD',
          amountType: 'range',
          totalSpots: 1000,
          availableSpots: 1000,
          deadline: new Date('2025-03-31'),
          status: 'active' as const,
          eligibilityCriteria: 'First-time home buyers with household income under $150,000',
          applicationInstructions: 'Submit income verification, pre-approval letter, and property details',
        },
        {
          title: 'Healthcare Innovation Research Grant',
          description: 'Funding breakthrough medical research and healthcare technology development initiatives.',
          category: 'research' as const,
          countryId: 'canada',
          minAmount: '50000',
          maxAmount: '200000',
          currency: 'CAD',
          amountType: 'range',
          totalSpots: 150,
          availableSpots: 150,
          deadline: new Date('2025-02-28'),
          status: 'active' as const,
          eligibilityCriteria: 'Healthcare professionals or researchers with institutional affiliation',
          applicationInstructions: 'Submit research proposal, ethics approval, and team credentials',
        },
        {
          title: 'Small Business Innovation Grant',
          description: 'Empowering entrepreneurs and small business owners to scale their operations and create jobs.',
          category: 'business' as const,
          countryId: 'germany',
          minAmount: '10000',
          maxAmount: '50000',
          currency: 'EUR',
          amountType: 'range',
          totalSpots: 200,
          availableSpots: 200,
          deadline: new Date('2025-01-15'),
          status: 'active' as const,
          eligibilityCriteria: 'Small business with less than 50 employees',
          applicationInstructions: 'Submit business plan, financial statements, and growth projections',
        },
        {
          title: 'Higher Education Excellence Grant',
          description: 'Supporting outstanding students pursuing advanced degrees in STEM fields across universities.',
          category: 'education' as const,
          countryId: 'france',
          minAmount: '25000',
          maxAmount: '100000',
          currency: 'EUR',
          amountType: 'range',
          totalSpots: 500,
          availableSpots: 500,
          deadline: new Date('2025-12-31'),
          status: 'active' as const,
          eligibilityCriteria: 'Must be enrolled in a STEM program at an accredited university',
          applicationInstructions: 'Submit transcripts, research proposal, and recommendation letters',
        },
        {
          title: 'Community Housing Development Grant',
          description: 'Supporting community-based housing projects and affordable rental developments.',
          category: 'housing' as const,
          countryId: 'netherlands',
          minAmount: '100000',
          maxAmount: '500000',
          currency: 'EUR',
          amountType: 'range',
          totalSpots: 50,
          availableSpots: 50,
          deadline: new Date('2025-05-31'),
          status: 'active' as const,
          eligibilityCriteria: 'Non-profit organizations and community development entities',
          applicationInstructions: 'Submit project proposal, community impact assessment, and budget',
        },
        {
          title: 'Technology Innovation Startup Grant',
          description: 'Funding for innovative technology startups and digital transformation initiatives.',
          category: 'innovation' as const,
          countryId: 'singapore',
          minAmount: '20000',
          maxAmount: '150000',
          currency: 'SGD',
          amountType: 'range',
          totalSpots: 100,
          availableSpots: 100,
          deadline: new Date('2025-04-30'),
          status: 'active' as const,
          eligibilityCriteria: 'Technology startups less than 3 years old',
          applicationInstructions: 'Submit business plan, technology demo, and market analysis',
        },
      ];

      for (const grant of sampleGrants) {
        await storage.createGrant(grant);
      }
      console.log('Initialized sample grants');
    }
  } catch (error) {
    console.error('Error initializing grants:', error);
  }
}
