// src/pages/_app.tsx
import { ChakraProvider, createStandaloneToast } from "@chakra-ui/react";
import "@/styles/modules/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import Layout from "@/components/layout/Layout";
import { AuthProvider } from "@/context/AuthContext";
import { CourseProvider } from "@/context/CourseContext";
import { ApplicationProvider } from "@/context/ApplicationContext"; // ← import
import { useEffect } from "react";

const { ToastContainer, toast: globalToast } = createStandaloneToast();
export { globalToast };

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

      <ChakraProvider>
        <AuthProvider>
          <CourseProvider>
            <ApplicationProvider>
              <Layout Component={Component} pageProps={pageProps} />
              <ToastContainer />
            </ApplicationProvider>
          </CourseProvider>
        </AuthProvider>
      </ChakraProvider>
    </>
  );
}
