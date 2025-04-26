// src/pages/_document.tsx

import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Charset*/}
        <meta charSet="UTF-8" />

        {/* Favicon*/}
        <link rel="icon" href="/favicon.ico" />

        {/* SEO & Meta */}
        <meta
          name="description"
          content="TeachTeam – RMIT Assignment 1 project for tutor hiring."
        />
        <meta name="author" content="Albert Zubovic & Andrew Goode" />
      </Head>

      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
