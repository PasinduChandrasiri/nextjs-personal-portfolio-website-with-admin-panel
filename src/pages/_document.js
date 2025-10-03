import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Custom Document. This file customizes the HTML document rendered on
 * the server. It includes a Google Fonts stylesheet for the IBM Plex
 * Mono font. Dark mode logic has been removed since the site only
 * supports a single light theme.
 */
export default function Document() {
  return (
    <Html>
      <Head>
        {/* Preconnect and load Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@100;200;300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}