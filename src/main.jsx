import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import './index.css'
import App from './App.jsx'

// Defer PostHog init until the browser is idle so it doesn't block first paint
const initPosthog = () => posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: 'https://eu.i.posthog.com',
  person_profiles: 'identified_only',
});
if ('requestIdleCallback' in window) {
  requestIdleCallback(initPosthog);
} else {
  setTimeout(initPosthog, 1000);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      <App />
    </PostHogProvider>
  </StrictMode>,
)
