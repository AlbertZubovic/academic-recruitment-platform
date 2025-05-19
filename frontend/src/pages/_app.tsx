// src/pages/_app.tsx

/**
 * _app.tsx
 * This is the root of the application.
 * It wraps all pages with:
 * Chakra UI provider
 * Auth, Course, and Selection contexts
 * Global layout (header, footer, navbar)
 */

import { ChakraProvider } from "@chakra-ui/react";
import "@/styles/modules/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import Layout from "@/components/layout/Layout";
import { AuthProvider } from "@/context/AuthContext";
import { CourseProvider } from "@/context/CourseContext";
// import { SelectedApplicantsProvider } from "@/context/SelectedApplicantsContext";
// import { ApplicationProvider } from "@/context/ApplicationContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <ChakraProvider>
        <AuthProvider>
         <CourseProvider>
            {/*  <SelectedApplicantsProvider>
              <ApplicationProvider> */}
              <Layout Component={Component} pageProps={pageProps} />
            {/* </ApplicationProvider>
          </SelectedApplicantsProvider>*/}
        </CourseProvider> 
      </AuthProvider>
    </ChakraProvider>
    </>
  );
}
