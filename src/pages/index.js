import Head from 'next/head';
import { useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Projects from '../components/Projects';
import Experience from '../components/Experience';
import Education from '../components/Education';
import Footer from '../components/Footer';
import useSettings from '../hooks/useSettings';

export default function Home() {
  const settings = useSettings();
  useEffect(() => {
    // Restore scroll position if returning from a project details page
    const saved = sessionStorage.getItem('scrollPosition');
    if (saved) {
      window.scrollTo(0, parseInt(saved, 10));
      sessionStorage.removeItem('scrollPosition');
      return;
    }
    // Otherwise scroll to the About section on page load
    const aboutEl = document.getElementById('about');
    if (aboutEl) {
      aboutEl.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);
  return (
    <>
      <Head>
        <title>{`${settings.name} - ${settings.title}`}</title>
        <meta name="description" content={settings.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Header />
      <main>
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Education />
      </main>
      <Footer />
    </>
  );
}