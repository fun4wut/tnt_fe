import * as React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';
import { Stylesheet, InjectionMode, resetIds } from '@fluentui/react';

export default class MyDocument extends Document {
  static getInitialProps({ renderPage }) {
    const stylesheet = Stylesheet.getInstance();
    stylesheet.setConfig({
        injectionMode: InjectionMode.none,
        namespace: 'server'
    });
    stylesheet.reset();
    resetIds();

    const page = renderPage((App) => (props) => <App {...props} />);

    return { ...page, styleTags: stylesheet.getRules(true) };
  }

  render() {
    return (
      <html>
        <Head>
        <link
          rel="stylesheet"
          href="https://static2.sharepointonline.com/files/fabric/office-ui-fabric-core/11.0.0/css/fabric.min.css"
        />
          <style type="text/css" dangerouslySetInnerHTML={{__html: this.props.styleTags}} />
        </Head>
        <body style={{backgroundColor: "#edebe9", display: "flex", justifyContent: "center", alignItems: "center"}}>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
