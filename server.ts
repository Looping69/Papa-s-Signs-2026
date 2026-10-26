import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import path from "path";
import fs from "fs";
import cors from "cors";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

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
    backgroundImage: "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&q=80"
  },
  stats: [
    { id: "01", title: "Mine Compliance", label: "SABS Standards" },
    { id: "02", title: "Fast Delivery", label: "Northern Cape Wide" },
    { id: "03", title: "Scale Experts", label: "Large Format Specialist" }
  ],
  gallery: [],
  services: [
    {
      id: 'advertising-signage',
      title: 'Advertising & Signage',
      description: 'High-impact visibility solutions for businesses of all sizes.',
      icon: 'Store',
      image: 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?auto=format&fit=crop&q=80'
    },
    {
      id: 'clothing-gifts',
      title: 'Clothing & Gifts',
      description: 'Branded apparel and custom gifts to build your brand identity.',
      icon: 'Shirt',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80'
    },
    {
      id: 'display-systems',
      title: 'Display Systems',
      description: 'Portable and professional display solutions for events.',
      icon: 'Layout',
      image: 'https://images.unsplash.com/photo-1531050171669-0101272b1ee7?auto=format&fit=crop&q=80'
    },
    {
      id: 'digital-printing',
      title: 'Digital Printing',
      description: 'Precision paper and material printing for everyday business needs.',
      icon: 'Printer',
      image: 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&q=80'
    },
    {
      id: 'building-branding',
      title: 'Building Branding',
      description: 'Transform your premises into a powerful branding tool.',
      icon: 'Factory',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80'
    },
    {
      id: 'road-safety',
      title: 'Road & Safety Signs',
      description: 'Compliant signage for mines, construction, and public roads.',
      icon: 'TriangleAlert',
      image: 'https://images.unsplash.com/photo-1542362567-b054cd13bd18?auto=format&fit=crop&q=80'
    },
    {
      id: 'vehicle-branding',
      title: 'Vehicle Branding',
      description: 'Mobile advertising that travels wherever you do.',
      icon: 'Car',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80'
    }
  ]
};

if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
      return;
    }

    cb(new Error("Only image and video uploads are allowed."));
  },
});

// API Routes
app.get("/api/config", (req, res) => {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: "Failed to read config" });
  }
});

app.post("/api/config", (req, res) => {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to save config" });
  }
});

app.post("/api/upload", (req, res) => {
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
app.use("/uploads", express.static(UPLOADS_DIR));

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built files
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
