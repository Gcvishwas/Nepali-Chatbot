import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";
import './index.css'
import HomePage from './routes/Home/HomePage';
import SignInPage from './routes/SignIn/SignInPage';
import SignUpPage from './routes/SignUp/SignUpPage';
import DashboardPage from './routes/Dashboard/DashboardPage';
import ChatPage from './routes/Chat/ChatPage';
import RootLayout from './layouts/RootLayout/RootLayout';
import DashboardLayout from './layouts/DashboardLayout/DashboardLayout';

const router = createBrowserRouter([
  {element:<RootLayout/>,
children:[
  
  {
    path: "/",
    element: <HomePage/>,
  },
  {
    path: "/sign-in/*",
    element: <SignInPage/>,
  },
  {
    path: "/sign-up/*",
    element: <SignUpPage/>,
  },
  {
    element:<DashboardLayout/>,
    children:[
      
      
      {
        path: "/dashboard",
        element: <DashboardPage/>,
      },
      {
        path: "/dashboard/chats/:id",
        element: <ChatPage/>,
      },
    ]
  }
]
}
]);
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
