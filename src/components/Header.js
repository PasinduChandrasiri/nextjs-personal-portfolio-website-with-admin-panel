import Link from 'next/link';
import siteConfig from '../config';

// Helper to determine which sections exist
const hasProjects = siteConfig.projects && siteConfig.projects.length > 0;
const hasExperience = siteConfig.experience && siteConfig.experience.length > 0;
const hasEducation = siteConfig.education && siteConfig.education.length > 0;

export default function Header() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 hidden md:block transition-all duration-300">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
        <ul className="flex items-center gap-8">
          <li>
            <a href="#about" className="font-medium text-gray-700 hover:text-black">
              About
            </a>
          </li>
          {hasProjects && (
            <li>
              <a href="#projects" className="font-medium text-gray-700 hover:text-black">
                Projects
              </a>
            </li>
          )}
          {hasExperience && (
            <li>
              <a href="#experience" className="font-medium text-gray-700 hover:text-black">
                Experience
              </a>
            </li>
          )}
          {hasEducation && (
            <li>
              <a href="#education" className="font-medium text-gray-700 hover:text-black">
                Education
              </a>
            </li>
          )}
        </ul>
      </nav>
      <style jsx>{`
        /* Add backdrop and transparency on scroll via JS in _app.js if desired */
      `}</style>
    </header>
  );
}