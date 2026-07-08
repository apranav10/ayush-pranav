export type SiteConfig = {
  site_name?: string;
  tagline?: string;
  hero_headline?: string;
  hero_headline_2?: string;
  hero_subheadline?: string;
  profile_photo_drive_id?: string;
  resume_drive_id?: string;
  availability?: string;
  linkedin_url?: string;
  email?: string;
  github_url?: string;
  testimonial_form_url?: string;
  meta_description?: string;
  google_analytics_id?: string;
  work_zone1_label?: string;
  work_zone2_label?: string;
  work_zone3_label?: string;
  edu_zone1_label?: string;
  edu_zone2_label?: string;
  edu_zone3_label?: string;
  edu_zone4_label?: string;
};

export type ContactPageConfig = {
  quote?: string;
  subtext?: string;
  booking_cta_label?: string;
  calendly_url?: string;
  location?: string;
  reply_time?: string;
  status?: string;
  closing_statement?: string;
};

export type ImpactMetric = {
  order?: number | string;
  value: string;
  label: string;
  context?: string;
};

export type Project = {
  id: string;
  title: string;
  subtitle: string;
  project_type: string;
  project_category?: string;
  tags: string;
  doc_id: string;
  cover_image_id?: string;
  cover_drive_id?: string;
  featured: boolean | string;
  status: string;
  order?: number | string;
  impact_metric?: string;
};

export type ExperienceRole = {
  id: string;
  company: string;
  role_title: string;
  type?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  logo_drive_id?: string;
  headline?: string;
  highlights?: string;
  extracurricular?: string;
  metrics?: string;
  order?: number | string;
};

export type EducationEntry = {
  id: string;
  institution: string;
  institution_rail?: string;
  program: string;
  degree_type?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  logo_drive_id?: string;
  summary?: string;
  credentials?: string;
  concentrations?: string;
  involvement?: string;
  honors?: string;
  beyond_academics?: string;
  order?: number | string;
};

export type WorkExperienceEntry = ExperienceRole & { _type: "work" };

export type EducationExperienceEntry = EducationEntry & { _type: "education" };

export type ExperienceEntry = WorkExperienceEntry | EducationExperienceEntry;

export type AboutSection = {
  order?: number | string;
  section_header: string;
  description: string;
  image_drive_id?: string;
};

export type Skill = {
  group: string;
  skill_name: string;
  project_id?: string;
  order?: number | string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  photo_drive_id?: string;
  approved: boolean | string;
  order?: number | string;
};

export type BeyondWorkItem = {
  id: string;
  drive_image_id: string;
  caption?: string;
  category?: string;
  story?: string;
  reflection?: string;
  aspect_ratio?: string;
  pinned?: boolean | string;
  approved: boolean | string;
};
