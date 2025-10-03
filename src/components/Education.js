import siteConfig from '../config';

export default function Education() {
  const hasEducation = siteConfig.education && siteConfig.education.length > 0;
  if (!hasEducation) return null;
  return (
    <section id="education" className="p-8 sm:p-12 md:p-16 lg:p-24 bg-gray-50">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-16 items-start">
        <div className="lg:col-span-4 mb-4 lg:mb-0">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl xl:text-7xl">
            Education
          </h2>
          <div
            className="mt-2 h-1 w-20 rounded-full"
            style={{ backgroundColor: siteConfig.accentColor }}
          />
        </div>
        <div className="lg:col-span-8 space-y-8">
          {siteConfig.education.map((edu, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-5 md:p-6"
            >
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">
                    {edu.degree}
                  </h3>
                  <p className="text-base sm:text-lg" style={{ color: siteConfig.accentColor }}>
                    {edu.school}
                  </p>
                </div>
                <span className="mt-2 text-xs text-gray-500 sm:mt-0 sm:text-sm">
                  {edu.dateRange}
                </span>
              </div>
              <ul className="space-y-2">
                {edu.achievements.map((achievement, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mt-2 mr-3 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                    <span className="text-sm text-gray-600 sm:text-base">
                      {achievement}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}