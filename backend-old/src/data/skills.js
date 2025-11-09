// Static skills data - same for all users
export const skills = [
  // Programming Languages
  { id: 'javascript', name: 'JavaScript', category: 'Programming Languages', type: 'skill' },
  { id: 'python', name: 'Python', category: 'Programming Languages', type: 'skill' },
  { id: 'java', name: 'Java', category: 'Programming Languages', type: 'skill' },
  { id: 'php', name: 'PHP', category: 'Programming Languages', type: 'skill' },
  { id: 'csharp', name: 'C#', category: 'Programming Languages', type: 'skill' },
  { id: 'ruby', name: 'Ruby', category: 'Programming Languages', type: 'skill' },
  { id: 'go', name: 'Go', category: 'Programming Languages', type: 'skill' },
  { id: 'typescript', name: 'TypeScript', category: 'Programming Languages', type: 'skill' },
  { id: 'swift', name: 'Swift', category: 'Programming Languages', type: 'skill' },
  { id: 'kotlin', name: 'Kotlin', category: 'Programming Languages', type: 'skill' },
  
  // Web Technologies
  { id: 'html', name: 'HTML', category: 'Web Technologies', type: 'skill' },
  { id: 'css', name: 'CSS', category: 'Web Technologies', type: 'skill' },
  { id: 'react', name: 'React', category: 'Web Technologies', type: 'skill' },
  { id: 'vuejs', name: 'Vue.js', category: 'Web Technologies', type: 'skill' },
  { id: 'angular', name: 'Angular', category: 'Web Technologies', type: 'skill' },
  { id: 'nodejs', name: 'Node.js', category: 'Web Technologies', type: 'skill' },
  { id: 'expressjs', name: 'Express.js', category: 'Web Technologies', type: 'skill' },
  { id: 'nextjs', name: 'Next.js', category: 'Web Technologies', type: 'skill' },
  { id: 'django', name: 'Django', category: 'Web Technologies', type: 'skill' },
  { id: 'flask', name: 'Flask', category: 'Web Technologies', type: 'skill' },
  { id: 'laravel', name: 'Laravel', category: 'Web Technologies', type: 'skill' },
  
  // Databases
  { id: 'mysql', name: 'MySQL', category: 'Databases', type: 'skill' },
  { id: 'postgresql', name: 'PostgreSQL', category: 'Databases', type: 'skill' },
  { id: 'mongodb', name: 'MongoDB', category: 'Databases', type: 'skill' },
  { id: 'redis', name: 'Redis', category: 'Databases', type: 'skill' },
  { id: 'sqlite', name: 'SQLite', category: 'Databases', type: 'skill' },
  { id: 'oracle', name: 'Oracle DB', category: 'Databases', type: 'skill' },
  
  // Development Tools
  { id: 'git', name: 'Git', category: 'Development Tools', type: 'tool' },
  { id: 'docker', name: 'Docker', category: 'Development Tools', type: 'tool' },
  { id: 'kubernetes', name: 'Kubernetes', category: 'Development Tools', type: 'tool' },
  { id: 'jenkins', name: 'Jenkins', category: 'Development Tools', type: 'tool' },
  { id: 'webpack', name: 'Webpack', category: 'Development Tools', type: 'tool' },
  { id: 'vscode', name: 'VS Code', category: 'Development Tools', type: 'tool' },
  
  // Cloud Platforms
  { id: 'aws', name: 'AWS', category: 'Cloud Platforms', type: 'tool' },
  { id: 'google-cloud', name: 'Google Cloud', category: 'Cloud Platforms', type: 'tool' },
  { id: 'azure', name: 'Microsoft Azure', category: 'Cloud Platforms', type: 'tool' },
  { id: 'heroku', name: 'Heroku', category: 'Cloud Platforms', type: 'tool' },
  { id: 'digitalocean', name: 'DigitalOcean', category: 'Cloud Platforms', type: 'tool' },
  
  // Design Tools
  { id: 'figma', name: 'Figma', category: 'Design Tools', type: 'tool' },
  { id: 'photoshop', name: 'Adobe Photoshop', category: 'Design Tools', type: 'tool' },
  { id: 'illustrator', name: 'Adobe Illustrator', category: 'Design Tools', type: 'tool' },
  { id: 'xd', name: 'Adobe XD', category: 'Design Tools', type: 'tool' },
  { id: 'sketch', name: 'Sketch', category: 'Design Tools', type: 'tool' },
  { id: 'invision', name: 'InVision', category: 'Design Tools', type: 'tool' },
  { id: 'after-effects', name: 'After Effects', category: 'Design Tools', type: 'tool' },
  { id: 'premiere-pro', name: 'Premiere Pro', category: 'Design Tools', type: 'tool' },
  
  // Languages
  { id: 'english', name: 'English', category: 'Languages', type: 'language' },
  { id: 'spanish', name: 'Spanish', category: 'Languages', type: 'language' },
  { id: 'french', name: 'French', category: 'Languages', type: 'language' },
  { id: 'german', name: 'German', category: 'Languages', type: 'language' },
  { id: 'urdu', name: 'Urdu', category: 'Languages', type: 'language' },
  { id: 'hindi', name: 'Hindi', category: 'Languages', type: 'language' },
  { id: 'arabic', name: 'Arabic', category: 'Languages', type: 'language' },
  { id: 'chinese', name: 'Chinese', category: 'Languages', type: 'language' }
];

// Helper functions
export const getSkillById = (id) => {
  return skills.find(skill => skill.id === id);
};

export const getSkillsByType = (type) => {
  return skills.filter(skill => skill.type === type);
};

export const getSkillsByCategory = (category) => {
  return skills.filter(skill => skill.category === category);
};

export const getSkillCategories = () => {
  return [...new Set(skills.map(skill => skill.category))];
};
