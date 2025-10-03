import siteConfig from '../config';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <section id="about" className="p-8 sm:p-12 md:p-16 lg:p-24 bg-gray-50">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-16 items-start">
        <div className="lg:col-span-4 mb-4 lg:mb-0">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl xl:text-7xl">
            About Me
          </h2>
          <div
            className="mt-2 h-1 w-20 rounded-full"
            style={{ backgroundColor: siteConfig.accentColor }}
          />
        </div>
        <div className="lg:col-span-8 space-y-6">
          <p className="text-lg leading-relaxed text-gray-700 sm:text-xl md:text-2xl">
            {siteConfig.aboutMe}
          </p>
          <div className="pt-4">
            <div className="flex flex-wrap gap-3">
              {siteConfig.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 shadow-sm transition-colors duration-200 hover:bg-gray-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}