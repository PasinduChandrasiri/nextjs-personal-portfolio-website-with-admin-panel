import { useEffect, useState } from 'react';
import siteConfig from '../config';
import ProjectCard from './ProjectCard';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';

export default function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // Listen to projects in realtime database. Data is stored under `/projects/{slug}`
    const projectsRef = ref(database, 'projects');
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert object of objects into array of projects. Each key is the slug.
        const list = Object.keys(data).map((key) => {
          const item = data[key];
          return {
            slug: key,
            ...item,
            // Use first image as thumbnail if available
            thumbnailUrl: item.images && item.images.length > 0 ? item.images[0] : undefined,
          };
        });
        setProjects(list);
      } else {
        // fallback to static projects from siteConfig if no data in DB
        const staticList = siteConfig.projects.map((p, idx) => ({
          ...p,
          slug: `project-${idx + 1}`,
          // Map link property from static config to externalLink for ProjectCard
          externalLink: p.link,
        }));
        setProjects(staticList);
      }
    });
    return () => unsubscribe();
  }, []);

  if (!projects.length) return null;
  return (
    <section id="projects" className="p-8 sm:p-12 md:p-16 lg:p-24">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-16 items-start">
        <div className="lg:col-span-4 mb-4 lg:mb-0">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl xl:text-7xl">
            Projects
          </h2>
          <div
            className="mt-2 h-1 w-20 rounded-full"
            style={{ backgroundColor: siteConfig.accentColor }}
          />
        </div>
        <div className="lg:col-span-8 space-y-8">
          {projects.map((project, index) => (
            <ProjectCard key={project.slug || project.name} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}