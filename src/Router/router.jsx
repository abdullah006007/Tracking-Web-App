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
import PaymentHistory from "../Pages/Dashborad/PaymentHistory/PaymentHistory";
import TrackParcel from "../Pages/Dashborad/TrackParcel/TrackParcel";
import BeComeRider from "../Pages/Dashborad/BecomeRider/BeComeRider";
import PendingRiders from "../Pages/Dashborad/PendingRiders/PendingRiders";
import ActiveRiders from "../Pages/Dashborad/ActiveRiders/ActiveRiders";
import UpdateProfile from "../Pages/Dashborad/UpdateProfile/UpdateProfile";
import AdminManagement from "../Pages/Dashborad/MakeAdmin/AdminManagement";
import Forbidden from "../Pages/Forbidden/Forbidden";
import AdminRoute from "../Routes/AdminRoute";
import AssignRider from "../Pages/Dashborad/AssignRider/AssignRider";



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
            path: 'forbidden',
            Component: Forbidden

        },

        {
            path:'beComeRider',
            element: <RrivateRooutes>
                <BeComeRider></BeComeRider>
            </RrivateRooutes>
        }
        ,
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
        },
        {
            path: 'paymentHistory',
            Component: PaymentHistory 
        },
        {
            path: 'track',
            Component: TrackParcel
        },
        {
            path: 'assign-rider',
            element: <AdminRoute>
                <AssignRider></AssignRider>
            </AdminRoute>

        },
        {
            path: 'pendingRiders',
            element: 
            <AdminRoute>
                <PendingRiders></PendingRiders>
            </AdminRoute>
        },
        {
            path: 'activeRiders',
            element:
            <AdminRoute>
                <ActiveRiders></ActiveRiders>
            </AdminRoute>
        }
        ,
        {
            path: 'update-profile',
            Component: UpdateProfile

        },
        {
            path: 'AdminManagement',          
            element: <AdminRoute>
                <AdminManagement></AdminManagement>
            </AdminRoute>
        }
    ]

  }
]);