import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { router } from './Router/router.jsx';
import { RouterProvider } from 'react-router';
import 'aos/dist/aos.css';
import Aos from 'aos';
import 'leaflet/dist/leaflet.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


import AuthProvider from './Context/AuthContext/AuthProvider.jsx';




Aos.init()
const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className='max-w-7xl mx-auto'>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
        <RouterProvider router={router}></RouterProvider>
      </AuthProvider>
      </QueryClientProvider>
    </div>
  </StrictMode>,
)
