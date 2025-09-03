import { Suspense, lazy, useState } from 'react'
import { ThemeProvider } from './components/theme-provider';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { Toaster } from "@/components/ui/toaster"
import { Protected } from './pages/Protected';
import LogoAnimated from './components/LogoAnimated';
const Topbar = lazy(() => import('./components/Nav/topbar/Topbar'))
const Sidebar = lazy(() => import('./components/Nav/sidebar/Sidebar'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/register/register'))
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'))
const TnkersPro = lazy(() => import('./pages/TnkersPro/TnkersPro'))
const Tnkers = lazy(() => import('./pages/Tnkers'))
const Bookings = lazy(() => import('./pages/Bookings'))
const Support = lazy(() => import('./pages/Support'))
const SettingsScreen = lazy(() => import('./pages/settingsScreen/SettingsScreen'))
const Account = lazy(() => import('./pages/TnkersPro/account/Account'))
const Plans = lazy(() => import('./pages/Plans'))
const ReNewPlan = lazy(() => import('./pages/ReNewPlan'))

const Layout = () => {
  const [expanded, setExpanded] = useState(true)

  return (
    // light dark mode  is controlled by the theme provider in this file.
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="flex font-baloo2">
        <Sidebar expanded={expanded} setExpanded={setExpanded} />
        <div className={`w-full transition-all ${expanded ? "xl:pl-[250px]" : "xl:pl-[150px]"}`}>
          <Topbar />
          <div className="p-3 md:p-8 mt-6 md:mt-0">
            <Outlet />
          </div>
          <Toaster />
        </div>
      </div>
    </ThemeProvider>
  )
}

function App() {
  // these are the availbe routes for our app.
  const router = createBrowserRouter([
    {
      path: "/",
      // the Protected component redirect us to the login page if there is no user
      element: <Protected><Layout /></Protected>,
      children: [
        {
          path: '/',
          element: <Dashboard />
        },
        {
          path: '/pros',
          element: <TnkersPro />
        },
        {
          path: '/pros/:id',
          element: <Account />
        },
        {
          path: '/clients',
          element: <Tnkers />
        },
        {
          path: '/interventions',
          element: <Bookings />
        },
        {
          path: '/supprot',
          element: <Support />
        },
        {
          path: '/settings',
          element: <SettingsScreen />
        },
        {
          path: '/re-new-plan',
          element: <ReNewPlan />
        },
        {
          path: '*',
          element: <NotFound />
        },
      ]
    },
    {
      path: "/Plans",
      element: <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme"><Protected><Plans /><Toaster /></Protected></ThemeProvider>
    },
    {
      path: "/login",
      element: <Login />
    },
    {
      path: "/register",
      element: <><Register /> <Toaster /></>
    },
  ]);

  return (
    <Suspense fallback={<div className="relative hidden h-full max-h-screen dark:border-r lg:flex justify-center"><LogoAnimated /></div>}>
      <AuthContext>
        {/* Router will handle all of our routing logic and render the correct component based on the current url. */}
        <RouterProvider router={router} />
      </AuthContext>
    </Suspense>
  )
}

export default App
