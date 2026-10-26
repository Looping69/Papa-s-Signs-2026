// Author: Klaasvaakie ( |╲ )
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { attachAdminApi, localManagement } from './server/adminApi';
import { normalizeSiteConfig } from './shared/siteConfig';
import { createAdminAuth, isPrivateRequest } from './server/adminAuth';
import { fileURLToPath } from "url";
import { papas26Gallery, serviceImages, siteImages } from "./data/papas26Assets";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number.parseInt(process.env.PORT ?? "3000", 10);

app.use((req,res,next)=>{
  if(isPrivateRequest(req.originalUrl)){res.status(404).end();return;}
  next();
});
app.use(express.json({ limit: '2mb' }));
const adminAuth=createAdminAuth({credentialFile:path.join(__dirname,'.private','admin-auth.local')});
adminAuth.mount(app);

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Ensure config file exists
const CONFIG_FILE = path.join(__dirname, "config.json");
const DEFAULT_CONFIG = {
  hero: {
    title: "PRINTING EXPERTISE",
    subtitle: "EXPERTISE",
    description: "Kuruman's premier signage manufacturing hub. Specialized for the Mining & Construction sectors with national compliance.",
    backgroundImage: siteImages.hero
  },
  stats: [
    { id: "01", title: "Mine Compliance", label: "SABS Standards" },
    { id: "02", title: "Fast Delivery", label: "Northern Cape Wide" },
    { id: "03", title: "Scale Experts", label: "Large Format Specialist" }
  ],
  gallery: papas26Gallery,
  services: [
    {
      id: 'advertising-signage',
      title: 'Advertising & Signage',
      description: 'High-impact visibility solutions for businesses of all sizes.',
      icon: 'Store',
      image: serviceImages['advertising-signage']
    },
    {
      id: 'clothing-gifts',
      title: 'Clothing & Gifts',
      description: 'Branded apparel and custom gifts to build your brand identity.',
      icon: 'Shirt',
      image: serviceImages['clothing-gifts']
    },
    {
      id: 'display-systems',
      title: 'Display Systems',
      description: 'Portable and professional display solutions for events.',
      icon: 'Layout',
      image: serviceImages['display-systems']
    },
    {
      id: 'digital-printing',
      title: 'Digital Printing',
      description: 'Precision paper and material printing for everyday business needs.',
      icon: 'Printer',
      image: serviceImages['digital-printing']
    },
    {
      id: 'building-branding',
      title: 'Building Branding',
      description: 'Transform your premises into a powerful branding tool.',
      icon: 'Factory',
      image: serviceImages['building-branding']
    },
    {
      id: 'road-safety',
      title: 'Road & Safety Signs',
      description: 'Compliant signage for mines, construction, and public roads.',
      icon: 'TriangleAlert',
      image: serviceImages['road-safety']
    },
    {
      id: 'vehicle-branding',
      title: 'Vehicle Branding',
      description: 'Mobile advertising that travels wherever you do.',
      icon: 'Car',
      image: serviceImages['vehicle-branding']
    }
  ]
};

if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
} else {
  try {
    const currentConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    const hydratedConfig = normalizeSiteConfig(currentConfig, DEFAULT_CONFIG);

    if (JSON.stringify(currentConfig) !== JSON.stringify(hydratedConfig)) {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(hydratedConfig, null, 2));
    }
  } catch (error) {
    console.warn("Unable to hydrate the existing site config with local portfolio assets.", error);
  }
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname).toLowerCase());
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ((/^image\/(jpeg|png|webp|gif|avif)$/.test(file.mimetype) && ['.jpg','.jpeg','.png','.webp','.gif','.avif'].includes(ext)) || (/^video\/(mp4|webm|ogg|quicktime|x-m4v)$/.test(file.mimetype) && ['.mp4','.webm','.ogg','.mov','.m4v'].includes(ext))) {
      cb(null, true);
      return;
    }

    cb(new Error("Only image and video uploads are allowed."));
  },
});

attachAdminApi(app, {configFile: CONFIG_FILE, publicDir: path.join(__dirname,'public'), defaults: DEFAULT_CONFIG, auth:adminAuth});

app.post("/api/upload", localManagement, adminAuth.requireSession, (req, res) => {
  upload.single("image")(req, res, (error) => {
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  });
});

// Serve static files from public/uploads
app.use("/uploads", express.static(UPLOADS_DIR, {
  setHeaders: res => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
  }
}));

app.use('/api', (error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!error) return next();
  res.status(error.status === 413 ? 413 : 400).json({error: error.status === 413 ? 'Request is too large.' : 'Invalid API request.'});
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production" && !process.argv.includes('--production')) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true,fs:{deny:['.env','.env.*','*.{crt,pem}','**/.git/**','**/.private/**','**/*.local','**/config.json*']} },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built files
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("/{*path}", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
