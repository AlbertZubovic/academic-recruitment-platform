// src/pages/_app.tsx

import { ChakraProvider, createStandaloneToast } from "@chakra-ui/react";
import "@/styles/modules/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import Layout from "@/components/layout/Layout";
import { AuthProvider } from "@/context/AuthContext";
import { CourseProvider } from "@/context/CourseContext";
import { ApplicationProvider } from "@/context/ApplicationContext";
import { SelectedApplicantsProvider } from "@/context/SelectedApplicantsContext";
import { BlockedCandidatesProvider } from "@/context/BlockedCandidatesContext";
import { useEffect } from "react";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "@/lib/apollo-client";

const { ToastContainer, toast: globalToast } = createStandaloneToast();
export { globalToast };

// Load Apollo Client error messages in development
if (process.env.NODE_ENV !== "production") {
  import("@apollo/client/dev").then(({ loadErrorMessages, loadDevMessages }) => {
    loadDevMessages();
    loadErrorMessages();
  });
}

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (sessionStorage.getItem("showSavedToast") === "true") {
      globalToast({
        title: "Profile Saved",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom",
        containerStyle: { marginBottom: "10%" },
      });
      sessionStorage.removeItem("showSavedToast");
    }
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <ApolloProvider client={apolloClient}>
        <ChakraProvider>
          <AuthProvider>
            <CourseProvider>
              <BlockedCandidatesProvider>
                <ApplicationProvider>
                  <SelectedApplicantsProvider>
                    <Layout Component={Component} pageProps={pageProps} />
                    <ToastContainer />
                  </SelectedApplicantsProvider>
                </ApplicationProvider>
              </BlockedCandidatesProvider>
            </CourseProvider>
          </AuthProvider>
        </ChakraProvider>
      </ApolloProvider>
    </>
  );
}
