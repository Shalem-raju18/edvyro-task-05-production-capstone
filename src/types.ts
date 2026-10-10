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

export interface PlatformStats {
  totalInternships: number;
  activeInternships: number;
  totalApplications: number;
  categories: { category: string; count: number }[];
}

export interface SystemHealth {
  status: 'healthy' | 'unhealthy';
  version: string;
  service: string;
  timestamp: string;
  uptimeSeconds: number;
  database: {
    status: string;
    latencyMs: number;
    engine: string;
  };
  system: {
    nodeVersion: string;
    memoryRssMb: number;
    memoryHeapUsedMb: number;
  };
  security: {
    helmetActive: boolean;
    rateLimitingActive: boolean;
    bodyLimit: string;
  };
}
