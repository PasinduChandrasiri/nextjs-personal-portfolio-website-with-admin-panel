import '../styles/globals.css';

/**
 * Custom App component.
 *
 * The portfolio now always renders in light mode. Dark‑mode logic has been
 * removed to simplify styling. All sections consume runtime settings via
 * the custom `useSettings` hook rather than relying solely on the static
 * site configuration.
 */
export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}