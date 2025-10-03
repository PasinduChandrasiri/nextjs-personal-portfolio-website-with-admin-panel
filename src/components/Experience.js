import siteConfig from '../config';

export default function Experience() {
  const hasExperience = siteConfig.experience && siteConfig.experience.length > 0;
  if (!hasExperience) return null;
  return (
    <section id="experience" className="p-8 sm:p-12 md:p-16 lg:p-24">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-16 items-start">
        <div className="lg:col-span-4 mb-4 lg:mb-0">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl xl:text-7xl">
            Experience
          </h2>
          <div
            className="mt-2 h-1 w-20 rounded-full"
            style={{ backgroundColor: siteConfig.accentColor }}
          />
        </div>
        <div className="lg:col-span-8 relative">
          {siteConfig.experience.map((exp, index) => (
            <div key={index} className="relative mb-12 last:mb-0">
              {/* timeline dot */}
              <div
                className="absolute left-1/2 -top-2 z-20 h-4 w-4 -translate-x-1/2 rounded-full"
                style={{ backgroundColor: siteConfig.accentColor, borderColor: siteConfig.accentColor, borderWidth: 2 }}
              />
              {/* connecting line */}
              {index < siteConfig.experience.length - 1 && (
                <div className="absolute left-1/2 bottom-0 z-10 h-12 w-0.5 -translate-x-1/2 translate-y-full bg-gray-300" />
              )}
              {/* card */}
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">
                      {exp.title}
                    </h3>
                    <p className="text-base" style={{ color: siteConfig.accentColor }}>
                      {exp.company}
                    </p>
                  </div>
                  <span className="mt-2 text-xs text-gray-500 sm:mt-0 sm:text-sm">
                    {exp.dateRange}
                  </span>
                </div>
                <ul className="space-y-2">
                  {exp.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mt-2 mr-3 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                      <span className="text-sm text-gray-600 sm:text-base">
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}