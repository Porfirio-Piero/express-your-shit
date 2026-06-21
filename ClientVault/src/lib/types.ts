export interface Client {
  id: string;
  name: string;
  email: string;
  projectType: string;
  status: 'complete' | 'pending' | 'overdue';
  createdAt: string;
  deadline: string;
  formId: string | null;
  shareLinkId: string | null;
  shareLinkExpires: string | null;
  documents: ClientDocument[];
  formSubmission: FormSubmission | null;
  activity: ActivityEntry[];
}

export interface ClientDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string | null;
  data?: string; // base64
}

export interface FormField {
  id: string;
  type: 'text' | 'paragraph' | 'document' | 'checkbox' | 'dropdown' | 'date' | 'number';
  label: string;
  helpText: string;
  required: boolean;
  options?: string[]; // for dropdown
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: FormField[];
  isDefault: boolean;
}

export interface FormSubmission {
  formId: string;
  submittedAt: string;
  values: Record<string, string | string[] | boolean>;
}

export interface ActivityEntry {
  id: string;
  type: 'document_uploaded' | 'form_submitted' | 'link_generated' | 'link_accessed' | 'status_changed' | 'created';
  description: string;
  timestamp: string;
}

export interface BrandSettings {
  businessName: string;
  primaryColor: string;
  secondaryColor: string;
  logoData: string | null;
  defaultFormId: string | null;
  linkExpirationDays: number; // 0 = never, 7, 30
  exportFormat: 'pdf' | 'csv' | 'both';
}

export const DEFAULT_BRAND: BrandSettings = {
  businessName: 'My Business',
  primaryColor: '#4F46E5',
  secondaryColor: '#E0E7FF',
  logoData: null,
  defaultFormId: null,
  linkExpirationDays: 30,
  exportFormat: 'both',
};

export const STATUS_COLORS: Record<string, string> = {
  complete: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  overdue: 'bg-red-100 text-red-800',
};

export const STATUS_ICONS: Record<string, string> = {
  complete: '✅',
  pending: '⏳',
  overdue: '🔴',
};

export const FIELD_TYPE_LABELS: Record<FormField['type'], string> = {
  text: 'Text Input',
  paragraph: 'Long Text',
  document: 'File Attachment',
  checkbox: 'Checkbox',
  dropdown: 'Dropdown',
  date: 'Date',
  number: 'Number',
};

export const DEFAULT_TEMPLATES: FormTemplate[] = [
  {
    id: 'tpl-design-brief',
    name: 'Design Brief',
    description: 'Collect brand assets, project goals, and creative direction from design clients.',
    category: 'Design',
    isDefault: true,
    fields: [
      { id: 'f1', type: 'text', label: 'Project Name', helpText: 'What is this project called?', required: true, options: undefined },
      { id: 'f2', type: 'paragraph', label: 'Project Goals', helpText: 'Describe the main objectives of this project.', required: true, options: undefined },
      { id: 'f3', type: 'document', label: 'Brand Guidelines', helpText: 'Upload your brand guide, style guide, or brand book.', required: false, options: undefined },
      { id: 'f4', type: 'document', label: 'Logo Files', helpText: 'Upload your logo in any format (SVG, PNG, AI).', required: true, options: undefined },
      { id: 'f5', type: 'document', label: 'Font Files', helpText: 'Upload any custom fonts used in your brand.', required: false, options: undefined },
      { id: 'f6', type: 'dropdown', label: 'Budget Range', helpText: 'Select your approximate budget.', required: true, options: ['Under $1,000', '$1,000 - $5,000', '$5,000 - $10,000', '$10,000+'] },
      { id: 'f7', type: 'date', label: 'Deadline', helpText: 'When do you need this completed?', required: true, options: undefined },
      { id: 'f8', type: 'text', label: 'Target Audience', helpText: 'Who is the primary audience?', required: false, options: undefined },
    ],
  },
  {
    id: 'tpl-dev-project',
    name: 'Development Project',
    description: 'Gather technical requirements, codebase access, and hosting details for development work.',
    category: 'Development',
    isDefault: true,
    fields: [
      { id: 'f1', type: 'text', label: 'Project Name', helpText: 'Name of the project or product.', required: true, options: undefined },
      { id: 'f2', type: 'dropdown', label: 'Tech Stack', helpText: 'Primary technology stack.', required: true, options: ['React/Next.js', 'Vue/Nuxt', 'Angular', 'Python/Django', 'Ruby on Rails', 'Other'] },
      { id: 'f3', type: 'paragraph', label: 'Project Description', helpText: 'Describe the project scope and requirements.', required: true, options: undefined },
      { id: 'f4', type: 'document', label: 'Existing Codebase', helpText: 'Upload a zip or share a repo link document.', required: false, options: undefined },
      { id: 'f5', type: 'document', label: 'Documentation', helpText: 'Upload any existing docs, specs, or wireframes.', required: false, options: undefined },
      { id: 'f6', type: 'text', label: 'Hosting Details', helpText: 'Where is this hosted or where should it be?', required: false, options: undefined },
      { id: 'f7', type: 'date', label: 'Target Launch Date', helpText: 'When should this go live?', required: true, options: undefined },
      { id: 'f8', type: 'number', label: 'Expected Users', helpText: 'How many users do you expect at launch?', required: false, options: undefined },
    ],
  },
  {
    id: 'tpl-marketing-campaign',
    name: 'Marketing Campaign',
    description: 'Capture target audience, channels, brand voice, and creative assets for campaigns.',
    category: 'Marketing',
    isDefault: true,
    fields: [
      { id: 'f1', type: 'text', label: 'Campaign Name', helpText: 'Name of the campaign.', required: true, options: undefined },
      { id: 'f2', type: 'paragraph', label: 'Target Audience', helpText: 'Describe the primary and secondary audiences.', required: true, options: undefined },
      { id: 'f3', type: 'dropdown', label: 'Primary Channel', helpText: 'Main marketing channel.', required: true, options: ['Social Media', 'Email', 'Paid Ads', 'Content/SEO', 'Influencer', 'Multi-channel'] },
      { id: 'f4', type: 'paragraph', label: 'Brand Voice', helpText: 'Describe the tone and personality for this campaign.', required: false, options: undefined },
      { id: 'f5', type: 'document', label: 'Creative Assets', helpText: 'Upload images, videos, or copy drafts.', required: false, options: undefined },
      { id: 'f6', type: 'text', label: 'Key KPIs', helpText: 'What metrics matter most?', required: true, options: undefined },
      { id: 'f7', type: 'date', label: 'Campaign Start Date', helpText: 'When should this campaign launch?', required: true, options: undefined },
      { id: 'f8', type: 'date', label: 'Campaign End Date', helpText: 'When should this campaign end?', required: false, options: undefined },
    ],
  },
  {
    id: 'tpl-consulting-engagement',
    name: 'Consulting Engagement',
    description: 'Collect scope, deliverables, meeting preferences, and access requirements for consulting.',
    category: 'Consulting',
    isDefault: true,
    fields: [
      { id: 'f1', type: 'text', label: 'Engagement Title', helpText: 'Name of the consulting engagement.', required: true, options: undefined },
      { id: 'f2', type: 'paragraph', label: 'Scope of Work', helpText: 'Describe what you need help with.', required: true, options: undefined },
      { id: 'f3', type: 'dropdown', label: 'Meeting Cadence', helpText: 'How often should we meet?', required: true, options: ['Weekly', 'Bi-weekly', 'Monthly', 'As-needed'] },
      { id: 'f4', type: 'paragraph', label: 'Expected Deliverables', helpText: 'What should the final output look like?', required: true, options: undefined },
      { id: 'f5', type: 'document', label: 'Access Requirements', helpText: 'Upload any documents about system access, permissions, or onboarding.', required: false, options: undefined },
      { id: 'f6', type: 'text', label: 'Key Stakeholders', helpText: 'Who are the main contacts?', required: false, options: undefined },
      { id: 'f7', type: 'date', label: 'Start Date', helpText: 'When should we begin?', required: true, options: undefined },
      { id: 'f8', type: 'number', label: 'Budget', helpText: 'Approximate budget for this engagement.', required: false, options: undefined },
    ],
  },
];