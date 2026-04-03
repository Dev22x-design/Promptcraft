import '../styles/globals.css'
import Nav from '../components/Nav'
import { ToastContainer } from '../components/UI'
export default function App({ Component, pageProps }) {
  return (
    <>
      <Nav />
      <main className="page"><Component {...pageProps} /></main>
      <ToastContainer />
    </>
  )
}
