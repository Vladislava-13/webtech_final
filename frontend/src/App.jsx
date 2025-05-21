import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { UserProvider } from './contexts/UserContext';
import AppLayout from './layouts/AppLayout';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Test from './pages/Test';
import History from './pages/History';
import TestHistory from './pages/TestHistory';
import ApiKey from './pages/ApiKey';
import Instructions from './pages/Instructions';
import './services/i18n';


function App() {

  return (
    <>
      <Suspense fallback="loading">
        <UserProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/sign-in" element={<SignIn />} />
                <Route path="/sign-up" element={<SignUp />} />
                <Route path="/api-key" element={<ApiKey />} />
                <Route path="/history" element={<History />} />
                <Route path="/tests/:id" element={<TestHistory />} />
                <Route path="/instructions" element={<Instructions />} />
                <Route path="/test" element={<Test />} />
                <Route path="*" element={<Navigate to="/test" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </Suspense >
    </>
  )
}

export default App
