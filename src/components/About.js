import useSettings from '../hooks/useSettings';
import { motion } from 'framer-motion';

/**
 * About section. Displays the aboutMe text and a list of skills. The
 * content comes from the runtime settings. Animations are applied to
 * headings, paragraphs and skill tags via Framer Motion.
 */
export default function About() {
  const settings = useSettings();
  const hasSkills = settings.skills && settings.skills.length > 0;
  // Simple variants for fade/slide animations
  const fadeVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
  };
  return (
    <section id="about" className="bg-gray-50 p-8 sm:p-12 md:p-16 lg:p-24">
      <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-16">
        <div className="mb-4 lg:col-span-4 lg:mb-0">
          <motion.h2
            variants={fadeVariant}
            initial="hidden"
            animate="visible"
            className="text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl xl:text-7xl"
          >
            About Me
          </motion.h2>
          <div
            className="mt-2 h-1 w-20 rounded-full"
            style={{ backgroundColor: settings.accentColor }}
          />
        </div>
        <div className="lg:col-span-8 space-y-6">
          <motion.p
            variants={fadeVariant}
            initial="hidden"
            animate="visible"
            className="text-lg leading-relaxed text-gray-700 sm:text-xl md:text-2xl"
          >
            {settings.aboutMe}
          </motion.p>
          {hasSkills && (
            <div className="pt-4">
              <div className="flex flex-wrap gap-3">
                {settings.skills.map((skill, index) => (
                  <motion.span
                    key={skill}
                    custom={index}
                    variants={fadeVariant}
                    initial="hidden"
                    animate="visible"
                    className="rounded-full bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 shadow-sm transition-colors duration-200 hover:bg-gray-300"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}