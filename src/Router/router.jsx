import { createBrowserRouter } from "react-router";
import RootLayOut from "../LayOut/RootLayOut";
import Home from "../Pages/Home/Home.jsx/Home";
import AuthLayOut from "../LayOut/AuthLayOut";
import LogIn from "../Pages/Authentication/LogIn/LogIn";
import Register from "../Pages/Authentication/Register/Register";
import Coverage from "../Pages/Covarage/Coverage";
import RrivateRooutes from "../Routes/RrivateRooutes";
import Sendparcel from "../Pages/SendParcel/Sendparcel";
import DashboardLayout from "../LayOut/DashboardLayout";
import MyParcels from "../Pages/Dashborad/MyParcels/MyParcels";
import Payment from "../Pages/Dashborad/Payment/Payment";



export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayOut,
    children: [
        {
            index: true, 
            Component: Home
        },
        {
            path:"coverage",
            Component: Coverage,
            loader: ()=> fetch('./warehouses.json')
        },
        {
            path: 'sendParcel',
            element: <RrivateRooutes>
                <Sendparcel></Sendparcel>
            </RrivateRooutes>
        
        }

      
    ]
  },

  {
    path: "/",
    Component: AuthLayOut,
    children: [
        {
            path: 'login',
            Component: LogIn
        },
        {
            path: 'register',
            Component: Register
        }
    ]
  }

  ,
  {
    path: '/dashboard',
    element: <RrivateRooutes>
        <DashboardLayout></DashboardLayout>
    </RrivateRooutes>,
    children:[
        {

            path: 'myParcels',
            Component: MyParcels

        }
        ,
        {
            path: 'payment/:parcelId',
            Component: Payment
        }
    ]

  }
]);