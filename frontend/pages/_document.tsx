// import { Html, Head, Main, NextScript } from "next/document";
// import Header from "../components/header";

// export default function Document() {
//      return (
//           <Html lang="en">
//                <Head />
//                <body>
//                     <Header />
//                     <Main />
//                     <NextScript />
//                </body>
//           </Html>
//      );
// }

import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
     static async getInitialProps(ctx) {
          const initialProps = await Document.getInitialProps(ctx);
          return { ...initialProps };
     }

     render() {
          return (
               <Html lang="en">
                    <Head />
                    <body>
                         <Main />
                         <NextScript />
                    </body>
               </Html>
          );
     }
}

export default MyDocument;
