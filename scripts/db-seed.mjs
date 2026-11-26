// Seeds starter content. Safe to run more than once: existing rows (matched by slug
// or key) are left untouched, so it never overwrites edits made in the admin panel.
// Usage: npm run db:seed
import { connect } from "./lib/db.mjs";
import * as data from "./seed-data.mjs";

const json = (value) => (value == null ? null : JSON.stringify(value));

async function main() {
  const db = await connect();
  const counts = {};
  const bump = (key, result) => {
    counts[key] = (counts[key] || 0) + (result?.affectedRows || 0);
  };

  try {
    for (const [key, value] of Object.entries(data.settings)) {
      const [r] = await db.execute("INSERT IGNORE INTO settings (setting_key, setting_value) VALUES (?, ?)", [key, json(value)]);
      bump("settings", r);
    }
    const [legal] = await db.execute("INSERT IGNORE INTO settings (setting_key, setting_value) VALUES (?, ?)", [
      "site.legal",
      json({ privacyHtml: data.legal.privacy, termsHtml: data.legal.terms, updatedAt: new Date().toISOString().slice(0, 10) }),
    ]);
    bump("settings", legal);

    for (const [index, s] of data.services.entries()) {
      const [r] = await db.execute(
        `INSERT IGNORE INTO services (slug, title, short_description, description, image, features, deliverables, process_steps, technologies, starting_price, sort_order, is_published)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [s.slug, s.title, s.short_description, s.description, s.image, json(s.features), json(s.deliverables), json(s.process_steps), json(s.technologies), s.starting_price, index + 1]
      );
      bump("services", r);
    }

    const [serviceRows] = await db.query("SELECT id, slug FROM services");
    const serviceId = Object.fromEntries(serviceRows.map((row) => [row.slug, row.id]));

    for (const [index, p] of data.portfolio.entries()) {
      const [r] = await db.execute(
        `INSERT IGNORE INTO portfolio_projects (slug, title, client_name, category, project_type, service_id, year, role, summary, challenge, solution, results,
           technologies, features, cover_image, live_url, repo_url, is_featured, is_published, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [p.slug, p.title, p.client_name, p.category, p.project_type, serviceId[p.service] ?? null, p.year, p.role, p.summary, p.challenge, p.solution, p.results,
          json(p.technologies), json(p.features), p.cover_image, p.live_url, p.repo_url, p.is_featured, index + 1]
      );
      bump("portfolio", r);
    }

    for (const [index, p] of data.packages.entries()) {
      const [r] = await db.execute(
        `INSERT IGNORE INTO pricing_packages (slug, category, name, tagline, price, price_note, features, is_featured, is_purchasable, advance_percent, sort_order, is_published)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [p.slug, p.category, p.name, p.tagline, p.price, p.price_note, json(p.features), p.is_featured, p.is_purchasable, p.advance_percent, index + 1]
      );
      bump("packages", r);
    }

    const [[faqCount]] = await db.query("SELECT COUNT(*) AS n FROM faqs");
    if (faqCount.n === 0) {
      for (const [index, [category, question, answer]] of data.faqs.entries()) {
        const [r] = await db.execute("INSERT INTO faqs (category, question, answer, sort_order, is_published) VALUES (?, ?, ?, ?, 1)", [category, question, answer, index + 1]);
        bump("faqs", r);
      }
    }

    for (const c of data.blogCategories) {
      const [r] = await db.execute("INSERT IGNORE INTO blog_categories (name, slug, description) VALUES (?, ?, ?)", [c.name, c.slug, c.description]);
      bump("blog categories", r);
    }
    const [categoryRows] = await db.query("SELECT id, slug FROM blog_categories");
    const categoryId = Object.fromEntries(categoryRows.map((row) => [row.slug, row.id]));

    for (const [index, post] of data.blogPosts.entries()) {
      const words = post.content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
      const [r] = await db.execute(
        `INSERT IGNORE INTO blog_posts (slug, title, excerpt, content, category_id, status, published_at, reading_minutes, is_featured)
         VALUES (?, ?, ?, ?, ?, 'published', UTC_TIMESTAMP() - INTERVAL ? DAY, ?, ?)`,
        [post.slug, post.title, post.excerpt, post.content, categoryId[post.category] ?? null, (index + 1) * 7, Math.max(1, Math.round(words / 220)), post.is_featured]
      );
      bump("blog posts", r);
      if (r.affectedRows) {
        for (const tag of post.tags) {
          const tagSlug = tag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          await db.execute("INSERT IGNORE INTO blog_tags (name, slug) VALUES (?, ?)", [tag, tagSlug]);
          const [[tagRow]] = await db.query("SELECT id FROM blog_tags WHERE slug = ?", [tagSlug]);
          await db.execute("INSERT IGNORE INTO blog_post_tags (post_id, tag_id) VALUES (?, ?)", [r.insertId, tagRow.id]);
        }
      }
    }

    for (const job of data.jobs) {
      const [r] = await db.execute(
        `INSERT IGNORE INTO job_openings (slug, title, department, location, employment_type, work_mode, experience, salary_range, summary, description, responsibilities, requirements, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [job.slug, job.title, job.department, job.location, job.employment_type, job.work_mode, job.experience, job.salary_range, job.summary, job.description, json(job.responsibilities), json(job.requirements), job.status]
      );
      bump("jobs", r);
    }

    console.log("Seed complete:", Object.entries(counts).map(([k, v]) => `${k} +${v}`).join(", "));
    console.log("Next: create your admin account with `npm run admin:create -- --email you@example.com --name \"Your Name\" --password \"…\"`");
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
