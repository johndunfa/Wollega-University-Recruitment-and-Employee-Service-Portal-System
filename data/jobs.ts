export type Job = {
  id: number;
  title: string;
  organization: string;
  location: string;
  type: 'Full-time' | 'Internship' | 'Part-time';
  category: string;
  description?: string;
};

export const jobs: Job[] = [
  {
    id: 1,
    title: 'Frontend Developer',
    organization: 'Innovation Hub',
    location: 'Addis Ababa',
    type: 'Full-time',
    category: 'Tech',
    description: 'Develop and maintain web applications using React and Next.js.'
  },
  {
    id: 2,
    title: 'Intern - IT Support',
    organization: 'Innovation Hub',
    location: 'Remote',
    type: 'Internship',
    category: 'Tech',
    description: 'Assist with IT support tasks and troubleshooting.'
  },
  {
    id: 3,
    title: 'Administrative Assistant',
    organization: 'Innovation Hub',
    location: 'Addis Ababa',
    type: 'Full-time',
    category: 'Admin',
    description: 'Support office operations and administrative tasks.'
  },
  {
    id: 4,
    title: 'Finance Officer',
    organization: 'Innovation Hub',
    location: 'Addis Ababa',
    type: 'Full-time',
    category: 'Finance',
    description: 'Manage financial records and reporting.'
  },
  {
    id: 5,
    title: 'Remote Data Entry Clerk',
    organization: 'Innovation Hub',
    location: 'Remote',
    type: 'Part-time',
    category: 'Admin',
    description: 'Enter and manage data remotely.'
  },
  {
    id: 6,
    title: 'Backend Developer',
    organization: 'Innovation Hub',
    location: 'Addis Ababa',
    type: 'Full-time',
    category: 'Tech',
    description: 'Build and maintain backend services.'
  },
  {
    id: 7,
    title: 'Project Manager',
    organization: 'Innovation Hub',
    location: 'Addis Ababa',
    type: 'Full-time',
    category: 'Admin',
    description: 'Lead and manage project teams.'
  },
  {
    id: 8,
    title: 'Intern - Research Assistant',
    organization: 'Innovation Hub',
    location: 'Remote',
    type: 'Internship',
    category: 'Tech',
    description: 'Support research and data analysis.'
  },
  {
    id: 9,
    title: 'HR Specialist',
    organization: 'Innovation Hub',
    location: 'Addis Ababa',
    type: 'Full-time',
    category: 'Admin',
    description: 'Manage HR processes and recruitment.'
  },
  {
    id: 10,
    title: 'Accountant',
    organization: 'Innovation Hub',
    location: 'Addis Ababa',
    type: 'Full-time',
    category: 'Finance',
    description: 'Handle accounting and financial tasks.'
  }
]; 