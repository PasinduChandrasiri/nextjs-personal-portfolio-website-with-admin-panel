import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useSettings from '../hooks/useSettings';

/**
 * Site header with a modern glassmorphism design. On desktop it shows a
 * centered horizontal navigation bar; on smaller screens a hamburger button
 * toggles a drop-down menu. The accent colour is pulled from runtime settings.
 */
export default function Header() {
  const settings = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);

  // Always show these sections; if DB is empty you still see the links
  const showProjects = true;
  const showExperience = true;
  const showEducation = true;

  // Close the mobile menu when the window is resized to a desktop width.
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Add a background blur on scroll for desktop.
  useEffect(() => {
    const header = document.getElementById('site-header');
    const onScroll = () => {
      if (window.scrollY > 50) {
        header?.classList.add('bg-white/60', 'shadow');
      } else {
        header?.classList.remove('bg-white/60', 'shadow');
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <header
      id="site-header"
      className="fixed top-0 z-50 m-3 backdrop-blur-lg bg-white/10 border-b border-gray-200 transition-all duration-300 left-0 w-auto rounded-lg p-1 md:left-1/2 md:w-[40%] md:max-w-5xl md:-translate-x-1/2 md:rounded-3xl md:py-4 md:px-0"
    >
      {/* Desktop navigation */}
      <nav className="mx-auto hidden max-w-7xl md:flex justify-center">
        <div className="flex items-center gap-8">
          <a href="#about" className="font-medium text-gray-700 hover:text-black">
            About
          </a>
          {showProjects && (
            <a href="#projects" className="font-medium text-gray-700 hover:text-black">
              Projects
            </a>
          )}
          {showExperience && (
            <a href="#experience" className="font-medium text-gray-700 hover:text-black">
              Experience
            </a>
          )}
          {showEducation && (
            <a href="#education" className="font-medium text-gray-700 hover:text-black">
              Education
            </a>
          )}
        </div>
      </nav>

      {/* Mobile hamburger */}
      <div className="flex items-left justify-left md:hidden">
        <button
          type="button"
          onClick={toggleMenu}
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-200 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label="Toggle menu"
        >
          <motion.div
            initial={false}
            animate={menuOpen ? 'open' : 'closed'}
            className="flex h-6 w-6 flex-col items-center justify-center gap-1.5"
          >
            <motion.span
              variants={{
                closed: { rotate: 0, y: 0 },
                open: { rotate: 45, y: 8 },
              }}
              transition={{ duration: 0.3 }} // Control animation speed
              className="block h-0.5 w-6 origin-center rounded-full bg-current"
            />
            <motion.span
              variants={{
                closed: { opacity: 1 },
                open: { opacity: 0 },
              }}
              transition={{ duration: 0.3 }}
              className="block h-0.5 w-6 rounded-full bg-current"
            />
            <motion.span
              variants={{
                closed: { rotate: 0, y: 0 },
                open: { rotate: -45, y: -8 },
              }}
              transition={{ duration: 0.3 }}
              className="block h-0.5 w-6 origin-center rounded-full bg-current"
            />
          </motion.div>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mt-1 rounded-lg border border-gray-200 bg-white p-4 shadow-md md:hidden">
          <ul className="space-y-2 text-center">
            <li>
              <a
                href="#about"
                className="block px-2 py-1 text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setMenuOpen(false)}
              >
                About
              </a>
            </li>
            {showProjects && (
              <li>
                <a
                  href="#projects"
                  className="block px-2 py-1 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={() => setMenuOpen(false)}
                >
                  Projects
                </a>
              </li>
            )}
            {showExperience && (
              <li>
                <a
                  href="#experience"
                  className="block px-2 py-1 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={() => setMenuOpen(false)}
                >
                  Experience
                </a>
              </li>
            )}
            {showEducation && (
              <li>
                <a
                  href="#education"
                  className="block px-2 py-1 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={() => setMenuOpen(false)}
                >
                  Education
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
