// Starter content, carried over from the previous Alfa Solution website.
// Everything here is editable from the admin panel after seeding.

export const settings = {
  "site.general": {
    companyName: "Alfa Solution",
    tagline: "Websites, web apps and mobile products for growing businesses.",
    email: "nishant@alfasolution.net",
    phone: "+91 9315424622",
    whatsapp: "919315424622",
    address: "India",
    hours: "Mon–Sat, 10:00–19:00 IST",
    socials: [
      { label: "LinkedIn", href: "" },
      { label: "Instagram", href: "" },
      { label: "GitHub", href: "https://github.com/sumit9354800" },
    ],
  },
  "site.banner": {
    enabled: false,
    message: "Now booking projects for the next quarter.",
    linkLabel: "Plan your project",
    linkHref: "/contact",
  },
  "site.home": {
    heroHeadline: "We design and build websites that run real businesses.",
    heroSubheadline:
      "Alfa Solution is a design and engineering studio from India. We plan, design, build and maintain websites, web applications and mobile apps — and the systems behind them.",
    heroPrimaryLabel: "Start a project",
    heroPrimaryHref: "/contact",
    heroSecondaryLabel: "See live work",
    heroSecondaryHref: "/work",
    stats: [
      { value: "3+", label: "Years building for clients" },
      { value: "30+", label: "Projects delivered" },
      { value: "30+", label: "Businesses served" },
      { value: "98", label: "Lighthouse performance target" },
    ],
    introTitle: "Most business websites look fine and do nothing.",
    introBody:
      "They load slowly, can't be updated without a developer, and don't turn visitors into enquiries. We start from what the website has to do for your business — then design and engineer every page, form and admin screen around that.",
    process: [
      { title: "Discover", description: "We learn your business, audience and goals, and agree on what success looks like." },
      { title: "Define", description: "Sitemap, features, content plan and a fixed scope with a clear timeline and price." },
      { title: "Design", description: "Interface design for every key screen, reviewed with you on real devices." },
      { title: "Develop", description: "Production code, CMS, integrations and testing across browsers and devices." },
      { title: "Launch & support", description: "Deployment, analytics, search setup and ongoing maintenance after go-live." },
    ],
    ctaTitle: "Have a project in mind?",
    ctaBody: "Tell us what you need. We reply within one working day with next steps and a rough estimate.",
    ctaLabel: "Start a project",
    ctaHref: "/contact",
  },
  "site.about": {
    headline: "A small studio that works like an in-house product team.",
    intro:
      "Alfa Solution brings strategy, design and engineering together for businesses that need their digital presence to perform — not just exist.",
    storyTitle: "Built around ideas. Driven by purpose.",
    story:
      "Every business has a story worth telling and an opportunity worth exploring. We started Alfa Solution to give growing businesses the kind of digital team that larger companies take for granted: people who understand the business problem, design a clear solution, and engineer it properly.\n\nWe believe digital work should do more than look good. It should solve real problems, make things easier for people and support the way a business grows.",
    values: [
      { title: "Purpose first", description: "Every decision starts with understanding the real purpose behind a project and the value it should create." },
      { title: "Thoughtful design", description: "Great design is more than appearance. It should feel intuitive, useful and effortless to experience." },
      { title: "Quality always", description: "From the smallest detail to the final delivery, we focus on reliable, carefully crafted solutions." },
      { title: "Grow together", description: "Clear communication and lasting relationships built around shared goals." },
    ],
    images: ["/about/about-team.jpeg", "/about/about-workspace.jpeg", "/about/about-design.jpeg"],
  },
  "site.navigation": {
    header: [
      { label: "Services", href: "/services" },
      { label: "Work", href: "/work" },
      { label: "About", href: "/about" },
      { label: "Pricing", href: "/pricing" },
      { label: "Insights", href: "/blog" },
      { label: "Careers", href: "/careers" },
    ],
    ctaLabel: "Start a project",
    ctaHref: "/contact",
    footerColumns: [
      {
        title: "Studio",
        links: [
          { label: "About us", href: "/about" },
          { label: "Our team", href: "/team" },
          { label: "Careers", href: "/careers" },
          { label: "Contact", href: "/contact" },
        ],
      },
      {
        title: "Work",
        links: [
          { label: "Portfolio", href: "/work" },
          { label: "Live previews", href: "/work/live" },
          { label: "Insights", href: "/blog" },
          { label: "Pricing", href: "/pricing" },
        ],
      },
      {
        title: "Help",
        links: [
          { label: "FAQ", href: "/faq" },
          { label: "Privacy policy", href: "/privacy-policy" },
          { label: "Terms & conditions", href: "/terms" },
        ],
      },
    ],
    footerNote: "Design and engineering studio for websites, web applications and mobile apps.",
  },
  "site.seo": {
    defaultTitle: "Alfa Solution | Website & App Development Company in India",
    defaultDescription:
      "Alfa Solution designs and builds fast websites, web applications, B2B portals and mobile apps for growing businesses, with SEO and ongoing support.",
    keywords: [
      "website development company",
      "web application development",
      "mobile app development",
      "B2B portal development",
      "SEO services India",
      "Best Website Design Company in India",
    ],
    ogImage: "/images/og-image.jpg",
    pages: [
      { page: "/about", title: "About us", description: "Meet Alfa Solution — a design and engineering studio for websites, web apps and mobile apps." },
      { page: "/services", title: "Services", description: "Website development, web applications, mobile apps, UI/UX, e-commerce and SEO from Alfa Solution." },
      { page: "/work", title: "Our work", description: "Live websites and applications designed and built by Alfa Solution." },
      { page: "/pricing", title: "Pricing & packages", description: "Transparent website and app development packages. Pay online securely." },
      { page: "/blog", title: "Insights", description: "Practical articles on websites, product design, development and growth." },
      { page: "/careers", title: "Careers", description: "Join Alfa Solution. See open roles in design, engineering and growth." },
      { page: "/contact", title: "Contact", description: "Start your project with Alfa Solution. We reply within one working day." },
      { page: "/team", title: "Our team", description: "The people behind Alfa Solution." },
      { page: "/faq", title: "FAQ", description: "Answers to common questions about working with Alfa Solution." },
    ],
  },
  billing: {
    legalName: "Alfa Solution",
    gstin: "",
    address: "India",
    email: "nishant@alfasolution.net",
    phone: "+91 9315424622",
    taxRate: 18,
    taxLabel: "GST",
    sacCode: "998314",
    invoicePrefix: "ALFA",
    paymentTermsDays: 7,
    invoiceNotes: "Thank you for your business. Payments are non-refundable once work on the corresponding milestone has started.",
    bankDetails: "",
  },
};

export const legal = {
  privacy: `<h2>Who we are</h2><p>This website is operated by Alfa Solution ("we", "us"). This policy explains what personal information we collect through alfasolution.net, why we collect it and how we protect it.</p>
<h2>Information we collect</h2><ul><li><strong>Enquiries:</strong> your name, email, phone number, company and project details when you use our contact or enquiry forms.</li><li><strong>Job applications:</strong> your name, contact details, links, CV/resume and any information you choose to include.</li><li><strong>Payments:</strong> billing name, email, phone, address and GSTIN. Card, UPI and bank details are entered directly with our payment partner, Razorpay, and are never stored on our servers.</li><li><strong>Technical data:</strong> IP address, browser type and pages visited, used for security, spam prevention and analytics.</li></ul>
<h2>How we use it</h2><p>We use your information to respond to enquiries, deliver and invoice our services, assess job applications, prevent fraud and abuse, and improve this website. We do not sell your personal information.</p>
<h2>Sharing</h2><p>We share data only with service providers that help us run our business — hosting, email delivery, analytics and payment processing — and only as needed for those services, or when required by law.</p>
<h2>Retention</h2><p>Enquiries and client records are kept for as long as needed for the business relationship and legal, tax and accounting obligations. Job applications are kept for up to 12 months unless you ask us to delete them sooner.</p>
<h2>Your choices</h2><p>You can ask us to access, correct or delete your personal information by emailing us. We will respond within a reasonable time.</p>
<h2>Security</h2><p>Access to our admin systems is restricted, passwords are hashed, and data is transmitted over encrypted connections.</p>
<h2>Contact</h2><p>Questions about this policy can be sent to nishant@alfasolution.net.</p>`,
  terms: `<h2>Agreement</h2><p>By using this website or engaging Alfa Solution for services, you agree to these terms. A signed proposal or statement of work takes precedence over these terms where they differ.</p>
<h2>Services and scope</h2><p>Each project's scope, deliverables, timeline and price are agreed in writing before work begins. Work outside the agreed scope is quoted separately.</p>
<h2>Payments</h2><ul><li>Projects typically require an advance payment before work starts, with the remaining balance on the milestones in your proposal.</li><li>Online payments are processed securely by Razorpay. An invoice is issued automatically for every successful payment.</li><li>Prices are in Indian Rupees and exclude applicable taxes unless stated otherwise.</li><li>Advance payments are non-refundable once work on the corresponding milestone has started.</li></ul>
<h2>Client responsibilities</h2><p>You are responsible for providing content, approvals and access needed for the project on time, and for ensuring you have the rights to any material you supply.</p>
<h2>Intellectual property</h2><p>On full payment, ownership of the final deliverables created specifically for you transfers to you. We may retain rights to pre-existing tools, libraries and know-how, and may show the completed work in our portfolio unless agreed otherwise.</p>
<h2>Third-party services</h2><p>Hosting, domains, plugins and other third-party services are subject to their providers' terms and pricing.</p>
<h2>Limitation of liability</h2><p>To the extent permitted by law, our total liability for any claim relating to a project is limited to the amount paid for that project.</p>
<h2>Governing law</h2><p>These terms are governed by the laws of India.</p>
<h2>Contact</h2><p>Questions about these terms can be sent to nishant@alfasolution.net.</p>`,
};

export const services = [
  {
    slug: "website-development",
    title: "Website development",
    short_description: "Fast, responsive websites with a CMS your team can actually use — built to rank and convert.",
    description:
      "<p>We build fast, responsive and scalable websites that help businesses establish a strong online presence. From company websites to content-heavy platforms, every build includes a CMS, analytics and the technical SEO foundations search engines expect.</p>",
    image: "/service/web.jpeg",
    features: ["Business websites", "Custom website development", "Content management (CMS)", "Responsive design", "Technical SEO setup", "Maintenance & support"],
    deliverables: ["Sitemap and content plan", "Responsive interface design", "Production website with CMS", "Analytics & Search Console setup", "Launch and handover session"],
    process_steps: [
      { title: "Discovery", description: "Goals, audience, competitors and the pages you need." },
      { title: "Design", description: "Key screens designed and reviewed on desktop and mobile." },
      { title: "Build", description: "Development, CMS setup and content entry." },
      { title: "Launch", description: "Testing, deployment, analytics and search setup." },
    ],
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "MySQL"],
    starting_price: null,
  },
  {
    slug: "web-application-development",
    title: "Web application development",
    short_description: "Dashboards, portals and internal tools that replace spreadsheets and manual work.",
    description:
      "<p>Custom web applications built around how your business actually operates — client portals, admin dashboards, booking systems and workflow tools with secure authentication and role-based access.</p>",
    image: null,
    features: ["Admin dashboards", "Client & partner portals", "Role-based access", "Payment integration", "Reports and exports", "API integrations"],
    deliverables: ["Technical specification", "UX flows and interface design", "Production application", "Admin panel", "Documentation"],
    process_steps: [
      { title: "Specification", description: "Users, roles, workflows and data model." },
      { title: "Prototype", description: "Clickable flows for the critical journeys." },
      { title: "Build in sprints", description: "Working software reviewed every one to two weeks." },
      { title: "Launch & iterate", description: "Rollout, training and improvements from real use." },
    ],
    technologies: ["Next.js", "Node.js", "TypeScript", "MySQL", "REST APIs"],
    starting_price: null,
  },
  {
    slug: "app-development",
    title: "Mobile app development",
    short_description: "Android and iOS apps with reliable backends, admin panels and push notifications.",
    description:
      "<p>We develop user-focused mobile applications with reliable functionality, intuitive experiences and scalable architecture — helping businesses connect with customers and simplify everyday operations.</p>",
    image: "/service/app.jpeg",
    features: ["Android app development", "iOS app development", "Cross-platform apps", "Backend & admin panel", "API integration", "Store deployment support"],
    deliverables: ["App flows and interface design", "Android and/or iOS builds", "Backend and admin panel", "Store listing support", "Post-launch support"],
    process_steps: [
      { title: "Product scope", description: "Core features for the first release." },
      { title: "Design", description: "Screens and interactions tested on devices." },
      { title: "Develop", description: "App, backend and admin panel." },
      { title: "Release", description: "Testing, store submission and monitoring." },
    ],
    technologies: ["React Native", "Flutter", "Node.js", "REST APIs"],
    starting_price: null,
  },
  {
    slug: "ui-ux-design",
    title: "UI/UX design",
    short_description: "Interfaces that make products easier to use, understand and buy from.",
    description:
      "<p>Thoughtful digital interfaces and user experiences — from research and information architecture to high-fidelity design systems your developers can build from.</p>",
    image: "/about/about-design.jpeg",
    features: ["User research", "Information architecture", "Wireframes & prototypes", "Interface design", "Design systems", "Usability reviews"],
    deliverables: ["User flows", "Wireframes", "High-fidelity screens", "Component library", "Developer handoff"],
    process_steps: [
      { title: "Research", description: "Users, goals and friction points." },
      { title: "Structure", description: "Flows and wireframes." },
      { title: "Visual design", description: "Screens and design system." },
      { title: "Validate", description: "Prototype testing and refinement." },
    ],
    technologies: ["Figma", "Design systems", "Prototyping"],
    starting_price: null,
  },
  {
    slug: "ecommerce-development",
    title: "E-commerce development",
    short_description: "Online stores with smooth checkout, payment gateways and easy product management.",
    description:
      "<p>Flexible online stores designed to create smooth shopping experiences and simplify the buying journey, with product and order management your team can run day to day.</p>",
    image: null,
    features: ["Product & category management", "Cart and checkout", "Payment gateway integration", "Order management", "Shipping & tax setup", "Performance optimisation"],
    deliverables: ["Store design", "Product catalogue setup", "Payments and checkout", "Order admin", "Launch support"],
    process_steps: [
      { title: "Catalogue", description: "Products, variants and pricing rules." },
      { title: "Design", description: "Store, product and checkout pages." },
      { title: "Build", description: "Store, payments and order flows." },
      { title: "Launch", description: "Testing real orders end to end." },
    ],
    technologies: ["Next.js", "Razorpay", "MySQL"],
    starting_price: null,
  },
  {
    slug: "seo-digital-growth",
    title: "SEO & digital growth",
    short_description: "Technical SEO, content and analytics that bring in qualified enquiries.",
    description:
      "<p>Search engine optimisation and growth support — technical audits, on-page optimisation, local SEO, content planning and reporting tied to enquiries, not vanity metrics.</p>",
    image: null,
    features: ["Technical SEO audits", "On-page optimisation", "Local SEO", "Content strategy", "Analytics & reporting", "Core Web Vitals"],
    deliverables: ["SEO audit report", "Fix list and implementation", "Keyword and content plan", "Monthly reporting"],
    process_steps: [
      { title: "Audit", description: "Technical, content and competitor review." },
      { title: "Fix", description: "Speed, structure and on-page issues." },
      { title: "Grow", description: "Content and local presence." },
      { title: "Report", description: "Monthly results and next actions." },
    ],
    technologies: ["Google Search Console", "Google Analytics", "Schema markup"],
    starting_price: null,
  },
];

const img = (id) => `https://res.cloudinary.com/njq5pi5g/image/upload/${id}`;

export const portfolio = [
  {
    slug: "fostiima-business-school",
    title: "FOSTIIMA Business School",
    client_name: "FOSTIIMA Business School",
    category: "Institutional website",
    project_type: "client",
    service: "website-development",
    year: 2026,
    role: "Full-stack design & development",
    summary:
      "A modern institutional website for FOSTIIMA Business School covering programmes, admissions, placements, campus life, events, faculty and blogs — all managed from a custom CMS.",
    challenge:
      "Migrating and restructuring a large legacy institutional website into a modern Next.js architecture while preserving existing content, SEO-friendly URLs, media assets and legacy campaign links.",
    solution:
      "A component-driven Next.js architecture with reusable sections, Prisma and MySQL for dynamic content, Cloudinary media management, structured blog content and admin workflows for every content type.",
    results: "Legacy URLs preserved, content editable by the school's own team, and a responsive experience across devices.",
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Prisma", "MySQL", "Cloudinary"],
    features: ["Dynamic academic programmes", "Admissions sections", "Placement & recruiter showcase", "Faculty & campus information", "Blog & content management", "Legacy URL & SEO migration"],
    cover_image: img("v1790754959/Screenshot_2026-09-30_at_1.24.47_PM.png"),
    live_url: "https://fostiima.org/",
    repo_url: "https://github.com/sumit9354800/fostiima",
    is_featured: 1,
  },
  {
    slug: "mrtechycool",
    title: "MRTECHYCOOL",
    client_name: "MRTECHYCOOL",
    category: "Business website",
    project_type: "client",
    service: "website-development",
    year: 2026,
    role: "Lead full-stack development",
    summary:
      "A commercial platform for MRTECHYCOOL with digital service booking, a lead-generation pipeline and technical service catalogues with sub-second load times.",
    challenge: "Reaching a sub-1.2s LCP on mobile while integrating real-time enquiry booking with automated dispatch.",
    solution: "Server components with incremental revalidation, a lightweight SVG asset pipeline and streamlined API routes with server-side validation.",
    results: "Core Web Vitals scores of 98+ and a booking flow that routes enquiries automatically.",
    technologies: ["Next.js", "React", "Tailwind CSS", "Node.js", "MongoDB", "Express.js"],
    features: ["Automated lead booking", "Dynamic service catalogue", "Admin analytics dashboard", "SEO & Core Web Vitals 98+"],
    cover_image: img("v1788944433/techcool.png"),
    live_url: "https://www.mrtechycool.in/",
    repo_url: "https://github.com/sumit9354800/techcool",
    is_featured: 1,
  },
  {
    slug: "growje",
    title: "Growje",
    client_name: "Growje",
    category: "Corporate portal",
    project_type: "client",
    service: "website-development",
    year: 2024,
    role: "Full-stack web development",
    summary:
      "A high-conversion corporate portal for Growje supporting enterprise business solutions, client onboarding and digital marketing consulting.",
    challenge: "A responsive, high-performance portal with zero layout shift and custom interactive enquiry funnels.",
    solution: "Modular components, validated contact pathways with Zod and aggressive asset caching.",
    results: "A consistent experience from 360px to 1920px with a guided onboarding funnel.",
    technologies: ["React", "TypeScript", "Tailwind CSS", "Node.js", "MongoDB", "REST APIs"],
    features: ["Client onboarding funnel", "Responsive 360–1920px layouts", "Secure consultation booking"],
    cover_image: img("v1788944324/growje.png"),
    live_url: "https://growje.com/",
    repo_url: "https://github.com/sumit9354800/growje",
    is_featured: 1,
  },
  {
    slug: "india-travel-safari-goa",
    title: "India Travel Safari — Goa holidays",
    client_name: "India Travel Safari",
    category: "Campaign landing page",
    project_type: "client",
    service: "website-development",
    year: 2026,
    role: "Frontend engineering",
    summary:
      "A conversion-focused Goa holiday landing page with a cinematic hero, day-wise itinerary, package comparison, inclusions, FAQs and WhatsApp and call CTAs.",
    challenge: "Balancing strong visual storytelling, detailed itinerary information, pricing and lead-generation CTAs without overcrowding the page.",
    solution: "A structured mobile-first layout with itinerary cards, package highlighting, reusable CTA components and direct WhatsApp and phone conversion paths.",
    results: "A single focused page that carries visitors from inspiration to enquiry.",
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    features: ["Day-wise itinerary", "Premium vs standard comparison", "WhatsApp lead CTA", "Click-to-call", "FAQ section", "Google Tag Manager"],
    cover_image: img("v1791392566/Screenshot_2026-10-07_at_10.30.43_PM.png"),
    live_url: "https://travel.indiatravelsafari.com/",
    repo_url: "https://github.com/sumit9354800/goa-holiday",
    is_featured: 1,
  },
  {
    slug: "mx-sammy-crm",
    title: "MX SAMMY — B2B revenue CRM",
    client_name: null,
    category: "SaaS dashboard",
    project_type: "independent",
    service: "web-application-development",
    year: 2024,
    role: "Full-stack development",
    summary:
      "An enterprise B2B sales and revenue analytics CRM with real-time revenue tracking, conversion pipelines, customer lifetime metrics and interactive dashboards.",
    challenge: "Aggregating multi-source revenue streams into sub-second interactive analytics without client-side lag.",
    solution: "Memoised aggregation pipelines, modular dashboard cards and optimised client state.",
    results: "Smooth, interactive dashboards on large datasets.",
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Recharts", "Node.js", "MongoDB"],
    features: ["Revenue telemetry", "Lead conversion pipelines", "Financial charts", "Customer lifetime analytics"],
    cover_image: img("v1789039538/dashbord.png"),
    live_url: "https://dashboard-chi-inky-30.vercel.app/",
    repo_url: "https://github.com/sumit9354800/dashboard",
    is_featured: 0,
  },
  {
    slug: "stacked-3d",
    title: "STACKED — 3D web experience",
    client_name: null,
    category: "Creative 3D web",
    project_type: "independent",
    service: "website-development",
    year: 2024,
    role: "Creative frontend engineering",
    summary: "An interactive 3D web experiment exploring burger model choreography, lighting and real-time pointer physics.",
    challenge: "Holding 60 FPS on low-power phones while computing dynamic transforms and lighting passes.",
    solution: "Instanced geometry, memory pooling, throttled pointer listeners and memoised WebGL state.",
    results: "Smooth 3D interaction on mid-range mobile devices.",
    technologies: ["Three.js", "React", "GSAP", "Tailwind CSS", "TypeScript"],
    features: ["Custom shader lighting", "Spatial camera controls", "Procedural stacking", "Touch & pointer physics"],
    cover_image: img("v1788944464/burger-web.png"),
    live_url: "https://3-d-model-website-phi.vercel.app/",
    repo_url: "https://github.com/sumit9354800/3D-model-website",
    is_featured: 0,
  },
  {
    slug: "kiranago",
    title: "KiranaGo — grocery ordering",
    client_name: null,
    category: "Web application",
    project_type: "independent",
    service: "ecommerce-development",
    year: 2023,
    role: "Full-stack development",
    summary: "A hyperlocal grocery discovery and ordering platform connecting neighbourhood stores, catalogues and one-tap checkout.",
    challenge: "An ordering flow that works for users with very different levels of digital confidence.",
    solution: "High-contrast item tags and a streamlined one-tap checkout.",
    results: "A simple path from search to order on any phone.",
    technologies: ["React", "Node.js", "Express.js", "MongoDB", "Tailwind CSS"],
    features: ["Local store search", "Quick-add catalogue", "Order estimator", "Mobile-first layout"],
    cover_image: img("v1788944354/kirana.png"),
    live_url: "https://kirana-go-tau.vercel.app/",
    repo_url: "https://github.com/sumit9354800/kirana-go",
    is_featured: 0,
  },
  {
    slug: "freshcart-organics",
    title: "FreshCart Organics",
    client_name: null,
    category: "E-commerce application",
    project_type: "independent",
    service: "ecommerce-development",
    year: 2023,
    role: "Frontend & backend engineering",
    summary: "A farm-to-table organic produce store with category filters, seasonal badges, weight-based pricing and price breakdowns.",
    challenge: "Complex price-per-weight calculations combined with promotional discounts.",
    solution: "Deterministic, unit-tested pricing utilities.",
    results: "Accurate pricing across every combination of weight and promotion.",
    technologies: ["React", "JavaScript", "Node.js", "Express.js", "MongoDB", "Tailwind CSS"],
    features: ["Weight-based pricing", "Seasonal filters", "Customer reviews", "Receipt generator"],
    cover_image: img("v1788944300/freshcart.png"),
    live_url: "https://cloth-ecommerce-frontend.vercel.app/",
    repo_url: "https://github.com/sumit9354800/freshcart",
    is_featured: 0,
  },
];

const website = {
  basic: ["Up to 5 pages", "Responsive design", "Basic CMS", "Contact form", "WhatsApp & call buttons", "Basic SEO setup", "Google Maps", "Hosting, SSL & deployment", "7 days support"],
  pro: ["Up to 10 pages", "Custom UI/UX", "Advanced CMS", "Enquiry forms", "WhatsApp & click-to-call", "Advanced SEO", "Analytics & Search Console", "Performance optimisation", "Custom animations", "Hosting, SSL & deployment", "30 days support"],
  advanced: ["Up to 20 pages", "Premium custom UI/UX", "Advanced CMS", "E-commerce (up to 50 products)", "Cart, checkout & payment gateway", "Advanced SEO", "Analytics & Search Console", "Security configuration", "Hosting, SSL & deployment", "60 days support"],
};
const app = {
  basic: ["Android app", "Custom UI/UX", "User authentication", "Basic backend & admin panel", "API integration", "Push notifications", "App testing", "Deployment support", "30 days support"],
  pro: ["Android & iOS apps", "Custom UI/UX", "Role-based access", "Custom backend & admin panel", "REST API development", "Payment gateway", "Analytics dashboard", "Security configuration", "45 days support"],
  advanced: ["Android & iOS apps", "Scalable architecture", "Roles & permissions", "Enterprise admin panel", "Third-party integrations", "Email & WhatsApp automation", "Reports & dashboards", "Real-time features", "Security hardening & QA", "60 days support"],
};

// NOTE: prices below are placeholders — set real prices in Admin → Pricing before launch.
export const packages = [
  { slug: "website-basic", category: "website", name: "Website Basic", tagline: "A clean, reliable starter website for a professional online presence.", price: 14999, price_note: "one-time, excl. GST", features: website.basic, is_featured: 0, is_purchasable: 1, advance_percent: 50 },
  { slug: "website-pro", category: "website", name: "Website Pro", tagline: "A complete business website with custom design, CMS and stronger SEO.", price: 34999, price_note: "one-time, excl. GST", features: website.pro, is_featured: 1, is_purchasable: 1, advance_percent: 50 },
  { slug: "website-advanced", category: "website", name: "Website Advanced", tagline: "A premium experience with e-commerce and advanced functionality.", price: 69999, price_note: "one-time, excl. GST", features: website.advanced, is_featured: 0, is_purchasable: 1, advance_percent: 50 },
  { slug: "app-basic", category: "application", name: "App Basic", tagline: "A focused Android app with the essentials done properly.", price: null, price_note: "quoted on scope", features: app.basic, is_featured: 0, is_purchasable: 0, advance_percent: 40 },
  { slug: "app-pro", category: "application", name: "App Pro", tagline: "Android and iOS apps with a custom backend and admin panel.", price: null, price_note: "quoted on scope", features: app.pro, is_featured: 1, is_purchasable: 0, advance_percent: 40 },
  { slug: "app-advanced", category: "application", name: "App Advanced", tagline: "A scalable mobile product with integrations and automation.", price: null, price_note: "quoted on scope", features: app.advanced, is_featured: 0, is_purchasable: 0, advance_percent: 40 },
];

export const faqs = [
  ["General", "What services does Alfa Solution offer?", "Website design and development, web applications, mobile apps, UI/UX design, e-commerce and SEO. We can take a project from first idea to launch and support it afterwards."],
  ["Process", "How does a project work?", "We start by understanding your goals and requirements, then agree a fixed scope, timeline and price. Design and development happen in reviewed stages, and we keep you involved until launch."],
  ["Process", "How long does a project take?", "A standard business website usually takes 2–5 weeks. Web applications and mobile apps take longer depending on features. You get a timeline with your proposal."],
  ["General", "Can you redesign my existing website?", "Yes. We can redesign an existing site, improve its usability and speed, move it to a modern stack and add a CMS — while keeping your SEO and URLs intact."],
  ["General", "Will my website work on mobile?", "Every site we build is responsive and tested on phones, tablets, laptops and large desktop screens."],
  ["Support", "Do you provide support after launch?", "Yes. Every package includes a support period, and we offer ongoing maintenance, updates and improvements after that."],
  ["Payments", "How do payments work?", "Most projects start with an advance (usually 40–50%) and the balance on delivery milestones. You can pay online by UPI, card or net banking through Razorpay, and you receive a GST invoice automatically."],
  ["Payments", "Is online payment secure?", "Payments are processed by Razorpay. Your card or bank details are entered on Razorpay's secure checkout and never touch our servers. Every payment is verified on our server before it is marked as paid."],
  ["General", "How do I get started?", "Send us a message through the contact page with a few lines about your business and what you need. We reply within one working day."],
];

export const blogCategories = [
  { name: "Web development", slug: "web-development", description: "Building fast, maintainable websites and web apps." },
  { name: "Design", slug: "design", description: "Interface design, UX and visual identity." },
  { name: "Growth", slug: "growth", description: "SEO, analytics and turning visitors into enquiries." },
];

export const blogPosts = [
  {
    slug: "what-to-prepare-before-a-website-project",
    title: "What to prepare before you start a website project",
    excerpt: "Five things that make your website project faster, cheaper and far more likely to succeed — and none of them are technical.",
    category: "web-development",
    tags: ["Planning", "Websites"],
    is_featured: 1,
    content: `<p>Most website projects that run late or over budget don't fail on technology. They stall on decisions: what the site is for, what goes on each page, and who signs off. A little preparation removes most of that friction.</p>
<h2>1. Write down the one job of the website</h2><p>Is it to generate enquiries, sell products, recruit staff or reassure existing clients? Pick the primary job. Every design decision gets easier when the team agrees on it.</p>
<h2>2. List your pages, not your features</h2><p>A rough sitemap — Home, Services, each service, About, Work, Contact — is more useful than a list of features. It tells your design team the size of the project immediately.</p>
<h2>3. Gather real content early</h2><p>Your service descriptions, team bios, photos and client logos usually take longer to collect than the build itself. Start now, even if drafts are rough.</p>
<h2>4. Collect three sites you like — and why</h2><p>"I like how this one explains pricing" is far more useful than "make it modern". Specific references shorten the design stage.</p>
<h2>5. Decide who approves</h2><p>One decision-maker with clear authority keeps the project moving. Feedback from many people is welcome, but it should be consolidated before it reaches the team.</p>
<p>Ready with some of these? <a href="/contact">Tell us about your project</a> and we'll help with the rest.</p>`,
  },
  {
    slug: "website-or-web-application",
    title: "Do you need a website or a web application?",
    excerpt: "The difference affects your budget, timeline and team. Here's a simple way to decide.",
    category: "web-development",
    tags: ["Web apps", "Planning"],
    is_featured: 0,
    content: `<p>Businesses often ask for "a website" when what they need is a web application — or the other way round. The distinction matters because it changes the cost, the timeline and how the project is run.</p>
<h2>A website informs and persuades</h2><p>Its job is to explain who you are, what you offer and why someone should contact you. Content changes occasionally and is managed through a CMS. Most visitors are anonymous.</p>
<h2>A web application does work</h2><p>Users sign in, create or change data, and complete tasks: booking, ordering, approving, reporting. There are roles and permissions, business rules and usually integrations with other systems.</p>
<h2>A quick test</h2><ul><li>Do users need to log in? <strong>Application.</strong></li><li>Does it replace a spreadsheet or a manual process? <strong>Application.</strong></li><li>Is the main goal to be found on Google and get enquiries? <strong>Website.</strong></li></ul>
<p>Many businesses need both: a fast marketing website and a focused application behind it. We plan them together so they share design, data and login where it makes sense.</p>`,
  },
];

export const jobs = [
  {
    slug: "frontend-developer-nextjs",
    title: "Frontend developer (Next.js)",
    department: "Engineering",
    location: "India",
    employment_type: "full_time",
    work_mode: "hybrid",
    experience: "1–3 years",
    salary_range: null,
    summary: "Build fast, accessible interfaces for client websites and web applications using Next.js, React and TypeScript.",
    description: "<p>You'll work with our design and backend team to ship production websites and dashboards for clients across industries.</p>",
    responsibilities: ["Build responsive interfaces from design files", "Write clean, typed React and Next.js code", "Optimise performance and Core Web Vitals", "Work with the backend team on APIs and data"],
    requirements: ["Strong HTML, CSS and JavaScript fundamentals", "Experience with React and TypeScript", "Comfort with Tailwind CSS or similar", "A portfolio of live work"],
    status: "draft",
  },
];
