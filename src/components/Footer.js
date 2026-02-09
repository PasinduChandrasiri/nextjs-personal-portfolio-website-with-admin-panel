import useSettings from '../hooks/useSettings';

/**
 * Footer component displaying contact links and simple navigation. Uses
 * settings for personal details and social links. Dark mode styling has
 * been removed to simplify the design.
 */
export default function Footer() {
  const settings = useSettings();
  const hasProjects = settings.projects && settings.projects.length > 0;
  const hasExperience = settings.experience && settings.experience.length > 0;
  const hasEducation = settings.education && settings.education.length > 0;
  return (
    <footer className="relative border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4">
            <h3 className="text-2xl font-bold text-gray-800">{settings.name}</h3>
            <p className="text-base text-gray-600">{settings.title}</p>
            <div className="flex gap-x-6">
              {/* Email */}
              {settings.social?.email && (
                <a
                  href={`mailto:${settings.social.email}`}
                  className="text-gray-600 transition-colors duration-300 hover:text-[var(--accent-color)]"
                  aria-label="Email"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 9V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </a>
              )}
              {/* LinkedIn */}
              {settings.social?.linkedin && (
                <a
                  href={settings.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="text-gray-600 transition-colors duration-300 hover:text-[var(--accent-color)]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              )}
              {/* Twitter */}
              {settings.social?.twitter && (
                <a
                  href={settings.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="text-gray-600 transition-colors duration-300 hover:text-[var(--accent-color)]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4l11.733 16h4.267L8.267 4H4z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20l6.768-6.768M13.228 10.772L20 4" />
                  </svg>
                </a>
              )}
              {/* GitHub */}
              {settings.social?.github && (
                <a
                  href={settings.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="text-gray-600 transition-colors duration-300 hover:text-[var(--accent-color)]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 1a11 11 0 00-3.47 21.5c.55.1.75-.24.75-.55v-2c-3.06.66-3.7-1.33-3.7-1.33a2.89 2.89 0 00-1.2-1.59c-.97-.65.08-.64.08-.64a2.28 2.28 0 011.67 1.13 2.29 2.29 0 003.15.9 2.3 2.3 0 01.68-1.43c-2.44-.28-5-1.22-5-5.43a4.25 4.25 0 011.14-3A3.94 3.94 0 017 4.95s.91-.29 3 .95a10.4 10.4 0 016 0c2.09-1.24 3-.95 3-.95a3.94 3.94 0 01.11 2.88 4.25 4.25 0 011.14 3c0 4.22-2.56 5.15-5 5.43a2.55 2.55 0 01.72 1.97v2.92c0 .31.2.66.76.55A11 11 0 0012 1z"
                    />
                  </svg>
                </a>
              )}
            </div>
          </div>
          <div className="hidden flex-col gap-4 md:flex md:items-end">
            <nav className="flex gap-x-8">
              <a href="#about" className="text-sm text-gray-600 hover:text-gray-800">
                About
              </a>
              {hasProjects && (
                <a href="#projects" className="text-sm text-gray-600 hover:text-gray-800">
                  Projects
                </a>
              )}
              {hasExperience && (
                <a href="#experience" className="text-sm text-gray-600 hover:text-gray-800">
                  Experience
                </a>
              )}
              {hasEducation && (
                <a href="#education" className="text-sm text-gray-600 hover:text-gray-800">
                  Education
                </a>
              )}
            </nav>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} {settings.name}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
      {/* Decorative pattern similar to the original design */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <svg
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-24 w-full text-gray-100"
        >
          <pattern id="footer-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path
              d="M0 50 Q 25 40, 50 50 T 100 50"
              stroke="currentColor"
              strokeWidth="0.5"
              fill="none"
              opacity="0.4"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#footer-pattern)" />
        </svg>
      </div>
    </footer>
  );
}