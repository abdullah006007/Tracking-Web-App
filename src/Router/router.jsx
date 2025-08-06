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
import RiderRoute from "../Routes/RiderRoute";
import PendingDelivery from "../Pages/Dashborad/PendingDeliveries/PendingDelivery";
import TrackParcelPublic from "../Pages/Dashborad/TrackParcelPublic/TrackParcelPublic";
import About from "../Pages/About/About";
import Dash_Home from "../Pages/Dashborad/Home/Dash_Home";
import SendParcel from "../Pages/Dashborad/SendParcel/SendParcel";



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
            path: 'track-parcel',
            Component: TrackParcelPublic
        }
        ,
        {
            path: 'about',
            Component: About
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
            path: 'home',
            Component: Dash_Home

        },
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
            path: 'update-profile',
            Component: UpdateProfile

        },

        {
            path: 'pending-deliveries',
            element: <RiderRoute>
                <PendingDelivery></PendingDelivery>
            </RiderRoute>

        },




        // Admin only routes
        {
            path: 'assign-rider',
            element: <AdminRoute>
                <AssignRider></AssignRider>
            </AdminRoute>

        },



        {
            path: 'send-parcel',
            element: <AdminRoute>
                <SendParcel></SendParcel>
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
            path: 'AdminManagement',          
            element: <AdminRoute>
                <AdminManagement></AdminManagement>
            </AdminRoute>
        }
    ]

  }
]);