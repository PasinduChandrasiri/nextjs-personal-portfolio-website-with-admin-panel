import useSettings from '../hooks/useSettings';
import { motion } from 'framer-motion';

/**
 * Experience timeline. Loops through experience items from settings and
 * renders each entry with a timeline dot. Animated using Framer Motion.
 */
export default function Experience() {
  const settings = useSettings();
  const experiences = settings.experience || [];
  if (!experiences.length) return null;
  const fade = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };
  return (
    <section id="experience" className="p-8 sm:p-12 md:p-16 lg:p-24">
      <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-16">
        <div className="mb-4 lg:col-span-4 lg:mb-0">
          <motion.h2
            variants={fade}
            initial="hidden"
            animate="visible"
            className="text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl xl:text-7xl"
          >
            Experience
          </motion.h2>
          <div
            className="mt-2 h-1 w-20 rounded-full"
            style={{ backgroundColor: settings.accentColor }}
          />
        </div>
        <div className="relative lg:col-span-8">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              initial="hidden"
              animate="visible"
              variants={fade}
              className="relative mb-12 last:mb-0"
            >
              {/* timeline dot */}
              <div
                className="absolute left-1/2 -top-2 z-20 h-4 w-4 -translate-x-1/2 rounded-full"
                style={{ backgroundColor: settings.accentColor, borderColor: settings.accentColor, borderWidth: 2 }}
              />
              {/* connecting line */}
              {index < experiences.length - 1 && (
                <div className="absolute left-1/2 bottom-0 z-10 h-12 w-0.5 -translate-x-1/2 translate-y-full bg-gray-300" />
              )}
              {/* card */}
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">
                      {exp.title}
                    </h3>
                    <p className="text-base" style={{ color: settings.accentColor }}>
                      {exp.company}
                    </p>
                  </div>
                  <span className="mt-2 text-xs text-gray-500 sm:mt-0 sm:text-sm">
                    {exp.dateRange}
                  </span>
                </div>
                <ul className="space-y-2">
                  {exp.bullets?.map((bullet, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mt-2 mr-3 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                      <span className="text-sm text-gray-600 sm:text-base">
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}