import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { database } from '../../firebase';
import { ref, get } from 'firebase/database';
import useSettings from '../../hooks/useSettings';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import siteConfig from '../../config';

export default function ProjectDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const settings = useSettings();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    async function fetchProject() {
      // Attempt to get project from Firebase at /projects/{slug}
      try {
        const snapshot = await get(ref(database, `projects/${slug}`));
        const data = snapshot.val();
        if (data) {
          setProject({ slug, ...data });
        } else {
          // fallback: find project in static config by index slug pattern
          const found = siteConfig.projects
            .map((p, idx) => ({ ...p, slug: `project-${idx + 1}` }))
            .find((p) => p.slug === slug);
          if (found) setProject(found);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [slug]);

  if (loading) {
    return <p className="p-8 text-center">Loading...</p>;
  }
  if (!project) {
    return <p className="p-8 text-center">Project not found.</p>;
  }

  // Destructure project fields with sensible fallbacks
  const {
    name,
    fullDescription,
    description,
    images = [],
    skills = [],
    links = {},
    externalLinks = {},
  } = project;

  // Determine which object contains external links; prefer `links` used by admin panel
  const linkObject = links || externalLinks;

  return (
    <>
      <Head>
        <title>{`${project.name} | ${settings.name}`}</title>
      </Head>
      <main className="mx-auto max-w-5xl px-6 py-20">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          ← Back
        </button>
        <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
          {name}
        </h1>
        {/* Project description */}
        {description && (
          <p className="mb-8 text-base text-gray-600 sm:text-lg">
            {description}
          </p>
        )}
        {/* Image slider */}
        {images.length > 0 && (
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={10}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000 }}
            className="mb-8 rounded-lg shadow-md"
          >
            {images.map((url, idx) => (
              <SwiperSlide key={idx}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`${name} screenshot ${idx + 1}`}
                  className="h-64 w-full rounded-lg object-cover sm:h-96"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
        {/* Full description */}
        {fullDescription && (
          <div className="prose max-w-none">
            <p>{fullDescription}</p>
          </div>
        )}
        {/* Skills */}
        {skills.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-gray-900 px-3 py-1 text-xs font-medium text-white sm:text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
        {/* External links */}
        {linkObject && (
          <div className="mt-8 space-x-4">
            {linkObject.github && (
              <a
                href={linkObject.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded bg-gray-900 px-4 py-2 text-white transition-colors hover:bg-gray-700"
              >
                GitHub
              </a>
            )}
            {linkObject.linkedin && (
              <a
                href={linkObject.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded bg-gray-900 px-4 py-2 text-white transition-colors hover:bg-gray-700"
              >
                LinkedIn
              </a>
            )}
            {linkObject.demo && (
              <a
                href={linkObject.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded bg-gray-900 px-4 py-2 text-white transition-colors hover:bg-gray-700"
              >
                Demo
              </a>
            )}
          </div>
        )}
      </main>
    </>
  );
}