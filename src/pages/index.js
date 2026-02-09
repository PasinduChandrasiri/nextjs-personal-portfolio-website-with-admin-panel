import Head from 'next/head';
import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Projects from '../components/Projects';
import Experience from '../components/Experience';
import Education from '../components/Education';
import Footer from '../components/Footer';
import useSettings from '../hooks/useSettings';
import { useEffect } from 'react';

export default function Home() {
  const settings = useSettings();

  useEffect(() => {
    // Restore scroll only if we explicitly asked to when leaving the page.
    const shouldRestore = sessionStorage.getItem('restoreScroll') === '1';
    const saved = sessionStorage.getItem('scrollPosition');

    if (shouldRestore && saved) {
      window.scrollTo(0, parseInt(saved, 10));
    }

    // Clear flags so a normal refresh always lands at the very top.
    sessionStorage.removeItem('restoreScroll');
    sessionStorage.removeItem('scrollPosition');
  }, []);

  return (
    <>
      <Head>
        <title>
          {settings.name ? `${settings.name} – ${settings.title || ''}` : 'Portfolio'}
        </title>
        <meta name="description" content={settings.description || 'Portfolio website'} />
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
