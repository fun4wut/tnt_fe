import Document, { DocumentContext, Head, Main, NextScript } from 'next/document'
import { Stylesheet, InjectionMode, resetIds } from '@fluentui/react'

class MyDocument extends Document {
  render() {
    return (
      <html>
        <Head>
          <style type="text/css" dangerouslySetInnerHTML={{ __html: this.props.styleTags }} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}

export async function getStaticProps({ renderPage }) {
  const stylesheet = Stylesheet.getInstance()
    stylesheet.setConfig({
        injectionMode: InjectionMode.none,
        namespace: 'server'
    });
    stylesheet.reset()
    resetIds()

    const page = renderPage((App) => (props) => <App {...props} />)

    return { ...page, styleTags: stylesheet.getRules(true) }
}

export default MyDocument

