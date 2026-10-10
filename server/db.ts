import { createClient, type Client } from '@libsql/client';
import fs from 'fs';
import path from 'path';

export interface Internship {
  id: number;
  title: string;
  company: string;
  location: string;
  work_type: 'Remote' | 'On-site' | 'Hybrid';
  category: 'Engineering' | 'Design' | 'Product' | 'Data & AI' | 'Cloud & DevOps' | 'Cybersecurity';
  stipend: string;
  duration: string;
  description: string;
  requirements: string[];
  skills: string[];
  deadline: string;
  status: 'Active' | 'Closed';
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: number;
  internship_id: number;
  internship_title?: string;
  company?: string;
  full_name: string;
  email: string;
  phone: string;
  college: string;
  graduation_year: number;
  resume_url: string;
  cover_letter?: string;
  status: 'Submitted' | 'Under Review' | 'Interview' | 'Accepted' | 'Rejected';
  created_at: string;
}

const dbUrl = process.env.DATABASE_URL || 'file:./data/internships.db';

// Ensure data directory exists if using local file path
if (dbUrl.startsWith('file:')) {
  const filePath = dbUrl.replace('file:', '');
  const dir = path.dirname(path.resolve(process.cwd(), filePath));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export const db: Client = createClient({
  url: dbUrl,
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

export async function initDatabase() {
  // Create internships table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS internships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT NOT NULL,
      work_type TEXT NOT NULL CHECK(work_type IN ('Remote', 'On-site', 'Hybrid')),
      category TEXT NOT NULL CHECK(category IN ('Engineering', 'Design', 'Product', 'Data & AI', 'Cloud & DevOps', 'Cybersecurity')),
      stipend TEXT NOT NULL,
      duration TEXT NOT NULL,
      description TEXT NOT NULL,
      requirements TEXT NOT NULL,
      skills TEXT NOT NULL,
      deadline TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Closed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create applications table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      internship_id INTEGER NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      college TEXT NOT NULL,
      graduation_year INTEGER NOT NULL,
      resume_url TEXT NOT NULL,
      cover_letter TEXT,
      status TEXT NOT NULL DEFAULT 'Submitted' CHECK(status IN ('Submitted', 'Under Review', 'Interview', 'Accepted', 'Rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(internship_id) REFERENCES internships(id) ON DELETE CASCADE
    );
  `);

  // Create indexes for fast filtering
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_internships_category ON internships(category);`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_internships_status ON internships(status);`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_applications_internship_id ON applications(internship_id);`);

  // Check if seeding is needed
  const countRes = await db.execute('SELECT COUNT(*) as count FROM internships');
  const count = Number(countRes.rows[0]?.count || 0);

  if (count === 0) {
    console.log('[DB] Seeding initial production-grade internship roles...');
    const seedData = [
      {
        title: 'Full Stack Software Engineer Intern',
        company: 'Veloce Cloud Systems',
        location: 'San Francisco, CA / Remote',
        work_type: 'Hybrid',
        category: 'Engineering',
        stipend: '$42/hr · Housing Assistance Included',
        duration: '12 Weeks (Summer 2026)',
        description: 'Join our Core Platform infrastructure team to design, build, and deploy customer-facing APIs and modern reactive frontends handling 20M+ daily events.',
        requirements: JSON.stringify([
          'Pursuing BS/MS in Computer Science, Software Engineering, or equivalent',
          'Proficiency with TypeScript, Node.js, Express, and React',
          'Understanding of relational database modeling (PostgreSQL/SQLite) and ACID transactions',
          'Familiarity with containerization (Docker) and RESTful API architecture'
        ]),
        skills: JSON.stringify(['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'REST APIs']),
        deadline: '2026-11-15',
        status: 'Active'
      },
      {
        title: 'Machine Learning & LLM Research Intern',
        company: 'Hyperion Intelligence Lab',
        location: 'Boston, MA / Remote',
        work_type: 'Remote',
        category: 'Data & AI',
        stipend: '$48/hr · Hardware Stipend',
        duration: '16 Weeks',
        description: 'Work alongside research scientists evaluating foundation model fine-tuning, retrieval-augmented generation (RAG) pipelines, and low-latency inference optimization.',
        requirements: JSON.stringify([
          'Strong proficiency in Python, PyTorch, and Hugging Face ecosystems',
          'Solid theoretical foundation in neural architectures and linear algebra',
          'Experience building vector indexing and embeddings pipelines',
          'Previous research publications or open-source AI contributions are a plus'
        ]),
        skills: JSON.stringify(['Python', 'PyTorch', 'Transformers', 'Vector DBs', 'RAG', 'MLOps']),
        deadline: '2026-11-20',
        status: 'Active'
      },
      {
        title: 'Product Design & Design Systems Intern',
        company: 'Canvas Craft Studio',
        location: 'New York, NY',
        work_type: 'On-site',
        category: 'Design',
        stipend: '$36/hr · Commuter Benefit',
        duration: '10 Weeks',
        description: 'Help refine our design system tokens, create accessible WCAG AAA component patterns, and conduct generative user research sessions with enterprise designers.',
        requirements: JSON.stringify([
          'Strong portfolio showcasing UI/UX systems thinking and prototyping craft',
          'Deep expertise with Figma components, auto-layout, and variables',
          'Knowledge of frontend implementation constraints (HTML5, Tailwind CSS, Accessibility)',
          'Clear presentation and user empathy interview skills'
        ]),
        skills: JSON.stringify(['Figma', 'Design Systems', 'WCAG Accessibility', 'User Research', 'Prototyping']),
        deadline: '2026-11-28',
        status: 'Active'
      },
      {
        title: 'Cloud DevOps & Site Reliability Intern',
        company: 'Aether Distributed Networks',
        location: 'Austin, TX / Remote',
        work_type: 'Hybrid',
        category: 'Cloud & DevOps',
        stipend: '$40/hr',
        duration: '12 Weeks',
        description: 'Construct resilient CI/CD release pipelines, implement Prometheus/Grafana telemetry alerts, and automate Kubernetes cluster deployment workflows.',
        requirements: JSON.stringify([
          'Experience with Linux systems administration, bash scripting, and networking fundamentals',
          'Hands-on exposure to AWS/GCP services and Terraform infrastructure as code',
          'Understanding of microservice observability and log aggregation',
          'Collaborative problem solver with high attention to production reliability'
        ]),
        skills: JSON.stringify(['Kubernetes', 'Terraform', 'AWS', 'CI/CD GitHub Actions', 'Linux', 'Prometheus']),
        deadline: '2026-12-05',
        status: 'Active'
      },
      {
        title: 'Associate Product Management Intern',
        company: 'Stride FinTech',
        location: 'Chicago, IL',
        work_type: 'Hybrid',
        category: 'Product',
        stipend: '$38/hr · Mentorship Program',
        duration: '12 Weeks',
        description: 'Drive feature specifications from zero to launch, analyze user retention cohorts with SQL analytics, and collaborate with engineering and legal stakeholders.',
        requirements: JSON.stringify([
          'Demonstrated track record of side projects, campus leadership, or venture initiatives',
          'Analytical mindset with capability to formulate hypotheses and test them with SQL/data',
          'Outstanding verbal and written communication skills',
          'Ability to translate complex user problems into crisp technical requirements'
        ]),
        skills: JSON.stringify(['Product Strategy', 'SQL Analytics', 'Wireframing', 'Agile Scrum', 'User Interviews']),
        deadline: '2026-11-30',
        status: 'Active'
      },
      {
        title: 'Cybersecurity Threat Detection Intern',
        company: 'Sentinel Guard Security',
        location: 'Washington, DC / Remote',
        work_type: 'Remote',
        category: 'Cybersecurity',
        stipend: '$44/hr · Security Clearance Support',
        duration: '14 Weeks',
        description: 'Investigate adversarial attack patterns, write custom detection rules for SIEM pipelines, and perform automated vulnerability scans on cloud infrastructure.',
        requirements: JSON.stringify([
          'Knowledge of OWASP Top 10 vulnerabilities and network security protocols',
          'Experience with Python scripting or Go for security tooling automation',
          'Familiarity with cloud identity and access management (IAM) best practices',
          'Relevant coursework or certifications (Security+, CEH) are advantageous'
        ]),
        skills: JSON.stringify(['OWASP Top 10', 'Python', 'SIEM / Splunk', 'Network Security', 'Vulnerability Assessment']),
        deadline: '2026-12-10',
        status: 'Active'
      }
    ];

    for (const item of seedData) {
      await db.execute({
        sql: `INSERT INTO internships (title, company, location, work_type, category, stipend, duration, description, requirements, skills, deadline, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          item.title,
          item.company,
          item.location,
          item.work_type,
          item.category,
          item.stipend,
          item.duration,
          item.description,
          item.requirements,
          item.skills,
          item.deadline,
          item.status
        ]
      });
    }

    // Seed one initial sample application to showcase application pipeline and tracking
    await db.execute({
      sql: `INSERT INTO applications (internship_id, full_name, email, phone, college, graduation_year, resume_url, cover_letter, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        1,
        'Alex Chen',
        'alex.chen@university.edu',
        '+1 (555) 234-5678',
        'University of California, Berkeley',
        2026,
        'https://github.com/alexchen-dev',
        'Excited to contribute to high-throughput distributed systems and modern web APIs.',
        'Under Review'
      ]
    });

    console.log('[DB] Database seeded successfully with production roles and tracking data.');
  }
}

// Database helper functions
export async function getInternships(filters: {
  search?: string;
  category?: string;
  work_type?: string;
  status?: string;
}) {
  let query = 'SELECT * FROM internships WHERE 1=1';
  const args: any[] = [];

  if (filters.status && filters.status !== 'all') {
    query += ' AND status = ?';
    args.push(filters.status);
  } else if (!filters.status) {
    // Default show active
    query += ' AND status = ?';
    args.push('Active');
  }

  if (filters.category && filters.category !== 'all') {
    query += ' AND category = ?';
    args.push(filters.category);
  }

  if (filters.work_type && filters.work_type !== 'all') {
    query += ' AND work_type = ?';
    args.push(filters.work_type);
  }

  if (filters.search && filters.search.trim()) {
    const term = `%${filters.search.trim().toLowerCase()}%`;
    query += ' AND (LOWER(title) LIKE ? OR LOWER(company) LIKE ? OR LOWER(description) LIKE ? OR LOWER(skills) LIKE ?)';
    args.push(term, term, term, term);
  }

  query += ' ORDER BY id DESC';

  const result = await db.execute({ sql: query, args });
  return result.rows.map(row => ({
    ...row,
    requirements: typeof row.requirements === 'string' ? JSON.parse(row.requirements) : row.requirements,
    skills: typeof row.skills === 'string' ? JSON.parse(row.skills) : row.skills,
  })) as unknown as Internship[];
}

export async function getInternshipById(id: number): Promise<Internship | null> {
  const result = await db.execute({
    sql: 'SELECT * FROM internships WHERE id = ?',
    args: [id]
  });

  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    ...row,
    requirements: typeof row.requirements === 'string' ? JSON.parse(row.requirements as string) : row.requirements,
    skills: typeof row.skills === 'string' ? JSON.parse(row.skills as string) : row.skills,
  } as unknown as Internship;
}

export async function createInternship(data: {
  title: string;
  company: string;
  location: string;
  work_type: string;
  category: string;
  stipend: string;
  duration: string;
  description: string;
  requirements: string[];
  skills: string[];
  deadline: string;
  status?: string;
}): Promise<Internship> {
  const result = await db.execute({
    sql: `INSERT INTO internships (title, company, location, work_type, category, stipend, duration, description, requirements, skills, deadline, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      data.title,
      data.company,
      data.location,
      data.work_type,
      data.category,
      data.stipend,
      data.duration,
      data.description,
      JSON.stringify(data.requirements),
      JSON.stringify(data.skills),
      data.deadline,
      data.status || 'Active'
    ]
  });

  const newId = Number(result.lastInsertRowid);
  const created = await getInternshipById(newId);
  return created!;
}

export async function updateInternship(id: number, data: Partial<{
  title: string;
  company: string;
  location: string;
  work_type: string;
  category: string;
  stipend: string;
  duration: string;
  description: string;
  requirements: string[];
  skills: string[];
  deadline: string;
  status: string;
}>): Promise<Internship | null> {
  const existing = await getInternshipById(id);
  if (!existing) return null;

  const updates: string[] = [];
  const args: any[] = [];

  const fields: Array<keyof typeof data> = [
    'title', 'company', 'location', 'work_type', 'category', 'stipend',
    'duration', 'description', 'deadline', 'status'
  ];

  for (const field of fields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      args.push(data[field]);
    }
  }

  if (data.requirements !== undefined) {
    updates.push('requirements = ?');
    args.push(JSON.stringify(data.requirements));
  }

  if (data.skills !== undefined) {
    updates.push('skills = ?');
    args.push(JSON.stringify(data.skills));
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  args.push(id);

  await db.execute({
    sql: `UPDATE internships SET ${updates.join(', ')} WHERE id = ?`,
    args
  });

  return await getInternshipById(id);
}

export async function deleteInternship(id: number): Promise<boolean> {
  const result = await db.execute({
    sql: 'DELETE FROM internships WHERE id = ?',
    args: [id]
  });
  return (result.rowsAffected || 0) > 0;
}

export async function createApplication(data: {
  internship_id: number;
  full_name: string;
  email: string;
  phone: string;
  college: string;
  graduation_year: number;
  resume_url: string;
  cover_letter?: string;
}): Promise<Application> {
  const result = await db.execute({
    sql: `INSERT INTO applications (internship_id, full_name, email, phone, college, graduation_year, resume_url, cover_letter, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Submitted')`,
    args: [
      data.internship_id,
      data.full_name,
      data.email,
      data.phone,
      data.college,
      data.graduation_year,
      data.resume_url,
      data.cover_letter || ''
    ]
  });

  const newId = Number(result.lastInsertRowid);
  const app = await getApplicationById(newId);
  return app!;
}

export async function getApplicationById(id: number): Promise<Application | null> {
  const result = await db.execute({
    sql: `SELECT a.*, i.title as internship_title, i.company 
          FROM applications a
          LEFT JOIN internships i ON a.internship_id = i.id
          WHERE a.id = ?`,
    args: [id]
  });

  if (result.rows.length === 0) return null;
  return result.rows[0] as unknown as Application;
}

export async function getApplications(filters?: { internship_id?: number; email?: string }): Promise<Application[]> {
  let query = `
    SELECT a.*, i.title as internship_title, i.company 
    FROM applications a
    LEFT JOIN internships i ON a.internship_id = i.id
    WHERE 1=1
  `;
  const args: any[] = [];

  if (filters?.internship_id) {
    query += ' AND a.internship_id = ?';
    args.push(filters.internship_id);
  }

  if (filters?.email) {
    query += ' AND LOWER(a.email) = ?';
    args.push(filters.email.trim().toLowerCase());
  }

  query += ' ORDER BY a.id DESC';

  const result = await db.execute({ sql: query, args });
  return result.rows as unknown as Application[];
}

export async function updateApplicationStatus(id: number, status: string): Promise<Application | null> {
  const validStatuses = ['Submitted', 'Under Review', 'Interview', 'Accepted', 'Rejected'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  const result = await db.execute({
    sql: 'UPDATE applications SET status = ? WHERE id = ?',
    args: [status, id]
  });

  if ((result.rowsAffected || 0) === 0) return null;
  return await getApplicationById(id);
}

export async function getStats() {
  const totalInternshipsRes = await db.execute('SELECT COUNT(*) as count FROM internships');
  const activeInternshipsRes = await db.execute("SELECT COUNT(*) as count FROM internships WHERE status = 'Active'");
  const totalAppsRes = await db.execute('SELECT COUNT(*) as count FROM applications');
  const categoryStatsRes = await db.execute('SELECT category, COUNT(*) as count FROM internships GROUP BY category');

  return {
    totalInternships: Number(totalInternshipsRes.rows[0]?.count || 0),
    activeInternships: Number(activeInternshipsRes.rows[0]?.count || 0),
    totalApplications: Number(totalAppsRes.rows[0]?.count || 0),
    categories: categoryStatsRes.rows.map(r => ({ category: String(r.category), count: Number(r.count) }))
  };
}
