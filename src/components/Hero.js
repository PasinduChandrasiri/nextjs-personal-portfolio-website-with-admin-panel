// components/Hero.js
import { motion } from 'framer-motion';
import useSettings from '../hooks/useSettings';
import backgroundImage from '../../public/background.jpg'; // parallax background

export default function Hero() {
  const settings = useSettings();

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const imageVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', stiffness: 260, damping: 20 },
    },
  };

  const profileImage = (settings.profileImage || '').trim();
  const initials =
    (settings.name || '')
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'PC';

  return (
    <section
      id="hero"
      className="relative isolate overflow-hidden bg-white pt-28 md:pt-36 min-h-screen"
      style={{ '--accent-color': settings.accentColor }}
    >
      <div
        className="absolute inset-0 -z-20 bg-fixed bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage.src})` }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(ellipse 800px 1200px at 0% 0%, ${settings.accentColor}40 0%, ${settings.accentColor}25 20%, ${settings.accentColor}10 40%, rgba(255, 255, 255, 0.3) 70%, rgba(255, 255, 255, 0.8) 90%, white 100%)`,
        }}
      />

      <motion.div
        className="mx-auto flex max-w-7xl flex-col items-center px-8 py-12 md:px-24 lg:px-32"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={imageVariants} className="mb-8">
          <div className="relative h-48 w-48 overflow-hidden rounded-full border-4 border-[var(--accent-color)] shadow-lg md:h-56 md:w-56 flex items-center justify-center bg-white">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile picture"
                className="h-full w-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
            ) : (
              <span
                aria-label="No profile image set"
                className="text-4xl md:text-5xl font-bold"
                style={{ color: settings.accentColor }}
              >
                {initials}
              </span>
            )}
          </div>
        </motion.div>

        <div className="space-y-6 text-center">
          <motion.h2 variants={itemVariants} className="text-xl font-bold tracking-tight text-gray-700 sm:text-2xl md:text-4xl">
            Hello! 👋
          </motion.h2>

          <motion.h1
            variants={itemVariants}
            className="text-4xl font-extrabold tracking-tight text-gray-800 sm:text-5xl md:text-6xl lg:text-7xl"
          >
            I'm <span style={{ color: settings.accentColor }}>{settings.name}</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto max-w-xl text-base font-medium text-gray-600 sm:text-lg md:text-xl"
          >
            {settings.title}
          </motion.p>

          <motion.div variants={itemVariants} className="mt-4 flex justify-center gap-4">
            {settings.social?.email && (
              <motion.a
                href={`mailto:${settings.social.email}`}
                className="text-gray-600 transition-colors duration-300 hover:text-[var(--accent-color)]"
                aria-label="Email"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 9V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </motion.a>
            )}

            {settings.social?.linkedin && (
              <motion.a
                href={settings.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-gray-600 transition-colors duration-300 hover:text-[var(--accent-color)]"
                whileHover={{ scale: 1.2, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </motion.a>
            )}

            {settings.social?.github && (
              <motion.a
                href={settings.social.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-gray-600 transition-colors duration-300 hover:text-[var(--accent-color)]"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1a11 11 0 00-3.47 21.5c.55.1.75-.24.75-.55v-2c-3.06.66-3.7-1.33-3.7-1.33a2.89 2.89 0 00-1.2-1.59c-.97-.65.08-.64.08-.64a2.28 2.28 0 011.67 1.13 2.29 2.29 0 003.15.9 2.3 2.3 0 01.68-1.43c-2.44-.28-5-1.22-5-5.43a4.25 4.25 0 011.14-3A3.94 3.94 0 017 4.95s.91-.29 3 .95a10.4 10.4 0 016 0c2.09-1.24 3-.95 3-.95a3.94 3.94 0 01.11 2.88 4.25 4.25 0 011.14 3c0 4.22-2.56 5.15-5 5.43a2.55 2.55 0 01.72 1.97v2.92c0 .31.2.66.76.55A11 11 0 0012 1z" />
                </svg>
              </motion.a>
            )}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
