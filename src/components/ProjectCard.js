import { motion } from 'framer-motion';

export default function ProjectCard({ project, index }) {
  const hasSkills = Array.isArray(project.skills) && project.skills.length > 0;

  const href = project.slug
    ? `/projects/${project.slug}`
    : project.externalLink || null;

  const isLink = Boolean(href);
  const isInternalProject = Boolean(project.slug);

  const onCardClick = () => {
    // Only store/restore scroll for internal project detail navigation
    if (isInternalProject && typeof window !== 'undefined') {
      sessionStorage.setItem('scrollPosition', String(window.scrollY));
      sessionStorage.setItem('restoreScroll', '1');
    }
  };

  const Wrapper = isLink ? 'a' : 'div';
  const linkProps = isLink
    ? {
      href,
      target: isInternalProject ? undefined : '_blank',
      rel: isInternalProject ? undefined : 'noopener noreferrer',
      onClick: onCardClick,
    }
    : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: (index ?? 0) * 0.05 }}
    >
      <Wrapper
        {...linkProps}
        className="group relative block rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all duration-300 hover:bg-white hover:shadow-xl hover:-translate-y-1"
      >
        <div className="space-y-4">
          <div>
            <span className="font-mono text-sm" style={{ color: 'var(--accent-color)' }}>
              {String((index ?? 0) + 1).padStart(2, '0')}
            </span>
            <h3 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
              {project.name ?? 'Untitled Project'}
            </h3>
          </div>

          {project.thumbnailUrl && (
            <div className="relative w-full overflow-hidden rounded-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.thumbnailUrl}
                alt={project.name ?? 'project'}
                className="w-full h-auto object-contain"
              />
            </div>
          )}

          {project.description && (
            <p className="text-base text-gray-600 sm:text-lg">
              {project.description}
            </p>
          )}

          {hasSkills && (
            <div className="flex flex-wrap gap-2 pt-2">
              {project.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-gray-900 px-3 py-1 text-xs sm:text-sm font-medium text-white"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </Wrapper>
    </motion.div>
  );
}
