import '../styles/globals.css';
import dynamic from 'next/dynamic';

// Create a NextJS app component that properly renders both API routes 
// and our single-page client app
function MyApp({ Component, pageProps }) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page) => page);
  
  return getLayout(<Component {...pageProps} />);
}

export default MyApp;