// Site configuration containing personal details and hard‑coded data.
// Replace the mock data below with your own information.

const siteConfig = {
  name: 'Pasindu Chandrasiri',
  title: 'Computer Engineering Undergraduate',
  description: 'Portfolio website for Pasindu Chandrasiri',
  accentColor: '#1d4ed8', // Tailwind blue-700
  social: {
    email: 'your-email@example.com',
    linkedin: 'https://linkedin.com/in/yourprofile',
    twitter: 'https://twitter.com/yourhandle',
    github: 'https://github.com/yourusername',
  },
  aboutMe:
    'I am a passionate Computer Engineering student exploring the intersections of hardware and software. This space will showcase my projects, experiences and what I am currently learning.',
  skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Firebase', 'Cloudinary'],
  experience: [
    {
      company: 'Tech Company',
      title: 'Intern Software Engineer',
      dateRange: 'Jan 2025 - Present',
      bullets: [
        'Collaborate on full‑stack features using React and Node.js',
        'Contributed to microservices interacting with Firebase and Cloudinary',
        'Led automation scripts that improved deployment efficiency',
      ],
    },
    {
      company: 'Student Project',
      title: 'Open Source Contributor',
      dateRange: '2023 - 2024',
      bullets: [
        'Contributed bug fixes and features to university open source projects',
        'Implemented responsive UI components using Tailwind CSS',
      ],
    },
  ],
  education: [
    {
      school: 'University of Colombo School of Computing',
      degree: 'BSc in Computer Engineering',
      dateRange: '2022 - Present',
      achievements: [
        'Dean’s List for academic excellence',
        'Led an IEEE student branch project on IoT',
      ],
    },
  ],
};

export default siteConfig;