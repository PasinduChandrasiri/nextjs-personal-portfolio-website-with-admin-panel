import Link from 'next/link';

/**
 * Reusable project card component. Accepts a project object containing name,
 * description, skills, thumbnailUrl, slug and optional external link. If
 * `slug` is present, the card links internally to `/projects/[slug]`; if
 * `externalLink` is provided, it opens in a new tab. Otherwise the card is
 * static.
 */
export default function ProjectCard({ project, index }) {
  const Component = project.slug || project.externalLink ? 'a' : 'div';
  const linkProps = {};
  if (project.slug) {
    linkProps.href = `/projects/${project.slug}`;
  } else if (project.externalLink) {
    linkProps.href = project.externalLink;
    linkProps.target = '_blank';
    linkProps.rel = 'noopener noreferrer';
  }
  return (
    <Component
      {...linkProps}
      className={`group relative block rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all duration-300 hover:bg-white hover:shadow-xl hover:-translate-y-1`}
    >
      {project.slug || project.externalLink ? (
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
      ) : null}
      <div className="space-y-4">
        <div>
          <span className="font-mono text-sm" style={{ color: 'var(--accent-color)' }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className="mt-1 text-xl font-bold text-gray-900">
            {project.name}
          </h3>
        </div>
        {project.thumbnailUrl && (
          <div className="relative h-48 w-full overflow-hidden rounded-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.thumbnailUrl} alt={project.name} className="h-full w-full object-cover" />
          </div>
        )}
        <p className="text-base text-gray-600">
          {project.description}
        </p>
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
    </Component>
  );
}