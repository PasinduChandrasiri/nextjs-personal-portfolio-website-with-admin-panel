import { motion } from 'framer-motion';

/**
 * Reusable project card component. Accepts a project object containing name,
 * description, skills, thumbnailUrl, slug and optional external link. If
 * `slug` is present, the card links internally to `/projects/[slug]`; if
 * `externalLink` is provided, it opens in a new tab. Otherwise the card is
 * static.
 */
export default function ProjectCard({ project, index }) {
  // Determine if the card links somewhere
  const isLink = Boolean(project.slug || project.externalLink);
  const href = project.slug ? `/projects/${project.slug}` : project.externalLink;

  // Motion variants for fade and hover effect
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const handleClick = () => {
    // Save current scroll position to sessionStorage for returning later
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('scrollPosition', String(window.scrollY));
    }
  };

  const CardContent = () => (
    <>
      {isLink && (
        <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white transition-all duration-300 group-hover:bg-gray-700">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 17l10-10M17 7H7M17 7v10" />
          </svg>
        </div>
      )}
      <div className="space-y-4">
        <div>
          <span className="font-mono text-sm" style={{ color: 'var(--accent-color)' }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
            {project.name}
          </h3>
        </div>
        {project.thumbnailUrl && (
          <div className="relative h-48 w-full overflow-hidden rounded-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.thumbnailUrl} alt={project.name} className="h-full w-full object-cover" />
          </div>
        )}
        {project.description && (
          <p className="text-base text-gray-600 sm:text-lg">
            {project.description}
          </p>
        )}
        {project.skills && project.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {project.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-gray-900 px-3 py-1 text-xs font-medium text-white transition-colors duration-300 group-hover:bg-gray-800 sm:text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );

  // Wrap content in appropriate element
  if (isLink) {
    return (
      <motion.a
        href={href}
        onClick={handleClick}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={cardVariants}
        className="group relative block rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl"
      >
        <CardContent />
      </motion.a>
    );
  }
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={cardVariants}
      className="group relative block rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl"
    >
      <CardContent />
    </motion.div>
  );
}