import { AppProps } from "next/app";
import "../styles/index.css";

import { SessionProvider } from "next-auth/react";
import { NextUIProvider } from "@nextui-org/react";

import Header from "../components/header";

function MyApp({ Component, pageProps }: AppProps) {
     return (
          <SessionProvider session={pageProps.session}>
               <NextUIProvider>
                    <Header />
                    <Component {...pageProps} />
               </NextUIProvider>
          </SessionProvider>
     );
}

export default MyApp;
