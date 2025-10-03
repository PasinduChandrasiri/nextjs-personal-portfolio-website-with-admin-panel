import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import useSettings from '../hooks/useSettings';
import ProjectCard from './ProjectCard';
import { motion } from 'framer-motion';

/**
 * Projects section. Fetches project entries from Firebase realtime
 * database and falls back to settings.projects if no data is found.
 * Animates the heading and each card.
 */
export default function Projects() {
  const settings = useSettings();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const projectsRef = ref(database, 'projects');
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map((key) => {
          const item = data[key];
          return {
            slug: key,
            ...item,
            thumbnailUrl:
              item.images && item.images.length > 0 ? item.images[0] : undefined,
          };
        });
        setProjects(list);
      } else {
        // fallback to static projects defined in settings
        const staticList = (settings.projects || []).map((p, idx) => ({
          slug: p.slug || `project-${idx + 1}`,
          name: p.name,
          description: p.description,
          skills: p.skills || [],
          images: p.images || [],
          fullDescription: p.fullDescription,
          externalLink: p.link || p.externalLink,
          thumbnailUrl: p.thumbnailUrl || (p.images && p.images[0]),
        }));
        setProjects(staticList);
      }
    });
    return () => unsubscribe();
  }, [settings.projects]);

  if (!projects.length) return null;
  const fade = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };
  return (
    <section id="projects" className="p-8 sm:p-12 md:p-16 lg:p-24">
      <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-16">
        <div className="mb-4 lg:col-span-4 lg:mb-0">
          <motion.h2
            variants={fade}
            initial="hidden"
            animate="visible"
            className="text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl xl:text-7xl"
          >
            Projects
          </motion.h2>
          <div
            className="mt-2 h-1 w-20 rounded-full"
            style={{ backgroundColor: settings.accentColor }}
          />
        </div>
        <div className="lg:col-span-8 space-y-8">
          {projects.map((project, index) => (
            <ProjectCard key={project.slug || project.name || index} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}