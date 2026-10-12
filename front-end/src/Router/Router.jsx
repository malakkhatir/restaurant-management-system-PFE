import { createBrowserRouter } from "react-router-dom";
import Home from "../Pages/HomePage/Home.";
import Layouts from "../Components/Layouts/Layouts";
import NotFound from "../Pages/NotFoundPage/NotFound";
import Login from "../Pages/LoginPage/Login";
import Map from "../Pages/LocationMap/Map";
import Contact from "../Pages/ContactPage/Contact";
import About from "../Pages/AboutPage/About";
import Menu from "../Pages/MenuPage/Menu";
import Payment from "../Pages/paiement/paiemet";
import Ticket from "../Pages/Ticket/Ticket";
import Report from "../Pages/Utilisateurs/Admin/Rapports/Report";
import RegisterPage from "../Pages/RegisterPage/RegisterPage";
import Dashboard from "../Pages/Utilisateurs/Admin/Dashbord/Dashbord";
import HomeClient from "../Pages/Utilisateurs/Client/Home/HomeClient";
import HomeServants from "../Pages/Utilisateurs/Servants/Home/HomeServants";
import HomeAdmin from "../Pages/Utilisateurs/Admin/Home/HomeAdmin";
import FeedbackList from "../Pages/Utilisateurs/Admin/Feedbacks/Feedbacks";
import ProfileAdmin from "../Pages/Utilisateurs/Admin/Profile/ProfileAdmin";
import Reclamation from "../Pages/Utilisateurs/Admin/Reclamation/Reclamation";
import Fournisseur from "../Pages/Utilisateurs/Admin/Fournisseur/Fournisseur";
import Stock from "../Pages/Utilisateurs/Admin/Stock/Stock";
import FeedbackForm from "../Pages/FeedbacksPage/Feedbacks";
import Servants from "../Pages/Utilisateurs/Admin/Servants/Servants";
import Tables from "../Pages/Utilisateurs/Admin/Tables/Tables";
import Ventes from "../Pages/Utilisateurs/Admin/Vente/ventes";
import Menu2 from "../Pages/Utilisateurs/Admin/Menu/MenuAdmin";
import Categories from "../Pages/Utilisateurs/Admin/Categories/AdminCategories";
import StockDetails from "../Pages/Utilisateurs/Admin/Stock/StockDetails";
import ServantsDetails from "../Pages/Utilisateurs/Admin/Servants/ServantsDetails";
import Certificate from "../Pages/Utilisateurs/Admin/Servants/Certificate";
import FournisseurDetails from "../Pages/Utilisateurs/Admin/Fournisseur/FournisseurDetails";
import ProtectedRoute from "../Components/ProtectedRoute/ProtectedRoute";
import PublicRoute from "../Components/PublicRoute/PublicRoute";
import AuthGuard from "../Components/AuthGuard/AuthGuard";
import RoleGuard from "../Components/AuthGuard/RoleGuard";
import ClientRclamation from "../Pages/Utilisateurs/Client/Reclamation/ClientRclamation";
import Avis from "../Pages/Utilisateurs/Client/Avis/Avis";
import Reservation from "../Pages/Utilisateurs/Client/Reservation/Reservation";
import Commande from "../Pages/Utilisateurs/Client/Command/Commande";
import ProfileServant from "../Pages/Utilisateurs/Servants/Profile/ProfileServant";
import Commandelist from "../Pages/Utilisateurs/Client/Command/Commandelist";
import ProfileClient from "../Pages/Utilisateurs/Client/Profile/ProfileClient";
import AdminReservation from "../Pages/Utilisateurs/Admin/Reservation/ReservationAdmin";
import Orders from "../Pages/Utilisateurs/Admin/Orders/Orders";
import LivrisonsAdmin from "../Pages/Utilisateurs/Admin/Livrisons/LivrisonsAdmin";
import LivreursAdmin from "../Pages/Utilisateurs/Admin/Livreurs/LivreursAdim";
import HomeLivreur from "../Pages/Utilisateurs/Livreurs/Home/HomeLivreur";
import ProfileLivreur from "../Pages/Utilisateurs/Livreurs/Profile/ProfileLivreur";
import StatusLivreur from "../Pages/Utilisateurs/Livreurs/Status/StatusLivreur";
import LivrisonLivreur from "../Pages/Utilisateurs/Livreurs/Livrison/LivrisonLivreur";
import Historique from "../Pages/Utilisateurs/Livreurs/Histoirique/Historique";
import MenuLivreur from "../Pages/Utilisateurs/Livreurs/Menu/MenuLivreur";
import TablesServant from "../Pages/Utilisateurs/Servants/Tables/Tables";
import MenuServant from "../Pages/Utilisateurs/Servants/Menu/Menu";
import CommandesLocales from "../Pages/Utilisateurs/Servants/Commandes locales/CommandesLocales";
import CommandesEnLigne from "../Pages/Utilisateurs/Servants/Commandes en ligne/CommandesEnLigne";
import Livraisons from "../Pages/Utilisateurs/Servants/Livraisons/Livraisons";
import Reservationservant from "../Pages/Utilisateurs/Servants/Réservations/Reservation2";

const router = createBrowserRouter([
    {
        element: <Layouts />,
        children: [
            {
                path: "/",
                element: <Home />,
            },
            {
                path: '/login',
                element: <PublicRoute><Login /></PublicRoute>
            },
            {
                path: '/local',
                element: <Map />
            },
            {
                path: '/menu',
                element: <Menu />
            },
            {
                path: '/feedback',
                element: <FeedbackForm />
            },
            {
                path: "/contact",
                element: <Contact />,
            },
            {
                path: '/about',
                element: <About />
            },
            {
                path: '/register',
                element: <PublicRoute><RegisterPage /></PublicRoute>
            }
        ]
    },
    // Routes Admin
    {
        path: "/gerer/categories", 
        element: <AuthGuard><RoleGuard allowedRoles={['admin']}><Categories /></RoleGuard></AuthGuard>,
    },
    {
        path: "/gerer/menu",
        element: <AuthGuard><RoleGuard allowedRoles={['admin']}><Menu2 /></RoleGuard></AuthGuard>
    },
    {
        path: "/gerer/tables",
        element: <AuthGuard><RoleGuard allowedRoles={['admin']}><Tables /></RoleGuard></AuthGuard>
    },
    {
        path: "payment",
        element: <AuthGuard><Payment /></AuthGuard>
    },
    {
        path: "payment/:id",
        element: <AuthGuard><Payment /></AuthGuard>
    },
    {
        path: "/ticket/:id",
        element: <AuthGuard><Ticket /></AuthGuard>
    },
    {
        path: "/user/admin/rapports",
        element: <AuthGuard><RoleGuard allowedRoles={['admin']}><Report /></RoleGuard></AuthGuard>
    },
    {
        path: '/user/admin/dashboard',
        element: <AuthGuard><RoleGuard allowedRoles={['admin']}><Dashboard /></RoleGuard></AuthGuard>
    },
    {
        path: '/user/admin/ventes',
        element: <AuthGuard><RoleGuard allowedRoles={['admin']}><Ventes /></RoleGuard></AuthGuard>
    },
    {
        path: '/user/admin',
        element: <AuthGuard><RoleGuard allowedRoles={['admin']}><HomeAdmin /></RoleGuard></AuthGuard>
    },
    {
        path: '/user/admin/feedbacks',
        element: <AuthGuard><RoleGuard allowedRoles={['admin']}><FeedbackList /></RoleGuard></AuthGuard>
    },
    {
        path: '/user/admin/profile',
        element: <AuthGuard><RoleGuard allowedRoles={['admin']}><ProfileAdmin /></RoleGuard></AuthGuard>
    },
    {
        path: '/user/admin/reclamations',
        element: <AuthGuard><RoleGuard allowedRoles={['admin']}><Reclamation /></RoleGuard></AuthGuard>
    },
    {
        path: '/user/admin/fournisseur',
        element: <AuthGuard><RoleGuard allowedRoles={['admin']}><Fournisseur /></RoleGuard></AuthGuard>
    },
    {
        path: '/user/admin/stock',
        element: <AuthGuard><RoleGuard allowedRoles={['admin']}><Stock /></RoleGuard></AuthGuard>
    },
    {
        path: '/user/admin/servants',
        element: <AuthGuard><RoleGuard allowedRoles={['admin']}><Servants /></RoleGuard></AuthGuard>
    },
    {
        path: '/user/admin/tables',
        element: <AuthGuard><RoleGuard allowedRoles={['admin']}><Tables /></RoleGuard></AuthGuard>
    },
    {
        path: "/user/admin/categories",
        element: <AuthGuard><RoleGuard allowedRoles={['admin']}><Categories /></RoleGuard></AuthGuard>
    },
    {
        path: "/user/admin/menus",
        element: <AuthGuard><RoleGuard allowedRoles={['admin']}><Menu2 /></RoleGuard></AuthGuard>
    },
    {
        path: "/user/admin/stock/details/:id",
        element: <AuthGuard><RoleGuard allowedRoles={['admin']}><StockDetails /></RoleGuard></AuthGuard>
    },
    {
        path: "/user/admin/servants/details/:id",
        element: <AuthGuard><RoleGuard allowedRoles={['admin']}><ServantsDetails /></RoleGuard></AuthGuard>
    },
    {
        path: "/user/admin/servants/:id/certificate/:type",
        element: <AuthGuard><RoleGuard allowedRoles={['admin']}><Certificate /></RoleGuard></AuthGuard>
    },
    {
        path: '/user/admin/fournisseurs/details/:id',
        element: <AuthGuard><RoleGuard allowedRoles={['admin']}><FournisseurDetails /></RoleGuard></AuthGuard>
    },
    {
        path: '/user/admin/reservations',
        element: <AuthGuard><RoleGuard allowedRoles={['admin']}><AdminReservation /></RoleGuard></AuthGuard>
    },
    {
        path: '/user/admin/orders',
        element: <AuthGuard><RoleGuard allowedRoles={['admin']}><Orders /></RoleGuard></AuthGuard>
    },
    {
        path: '/user/admin/livrisons',
        element: <AuthGuard><RoleGuard allowedRoles={['admin']}><LivrisonsAdmin /></RoleGuard></AuthGuard>
    },
    {
        path: '/user/admin/livreurs',
        element: <AuthGuard><RoleGuard allowedRoles={['admin']}><LivreursAdmin /></RoleGuard></AuthGuard>
    },

    // Routes Client
    {
        path: '/user/client',
        element: <AuthGuard><RoleGuard allowedRoles={['client']}><HomeClient /></RoleGuard></AuthGuard>
    },
    {
        path: "/user/client/reclamation",
        element: <AuthGuard><RoleGuard allowedRoles={['client']}><ClientRclamation /></RoleGuard></AuthGuard>
    },
    {
        path: "/user/client/avis",
        element: <AuthGuard><RoleGuard allowedRoles={['client']}><Avis /></RoleGuard></AuthGuard>
    },
    {
        path: "/user/client/reservation",
        element: <AuthGuard><RoleGuard allowedRoles={['client']}><Reservation /></RoleGuard></AuthGuard>
    },
    {
        path: "/user/client/commande",
        element: <AuthGuard><RoleGuard allowedRoles={['client']}><Commande /></RoleGuard></AuthGuard>
    },
    {
        path: "/user/client/commandes",
        element: <AuthGuard><RoleGuard allowedRoles={['client']}><Commandelist /></RoleGuard></AuthGuard>
    },
    {
        path: "/user/client/profile",
        element: <AuthGuard><RoleGuard allowedRoles={['client']}><ProfileClient /></RoleGuard></AuthGuard>
    },

    // Routes Servant
    {
        path: '/user/servant',
        element: <AuthGuard><RoleGuard allowedRoles={['servant']}><HomeServants /></RoleGuard></AuthGuard>
    },
    {
        path: "/user/servant/profil",
        element: <AuthGuard><RoleGuard allowedRoles={['servant']}><ProfileServant /></RoleGuard></AuthGuard>
    },
    {
        path: '/user/servant/tables',
        element: <AuthGuard><RoleGuard allowedRoles={['servant']}><TablesServant /></RoleGuard></AuthGuard>
    },
    {
        path: '/user/servant/menu',
        element: <AuthGuard><RoleGuard allowedRoles={['servant']}><MenuServant /></RoleGuard></AuthGuard>
    },
    {
        path: '/user/servant/commandes-locales',
        element: <AuthGuard><RoleGuard allowedRoles={['servant']}><CommandesLocales /></RoleGuard></AuthGuard>
    },
    {
        path: "/user/servant/commandes-en-ligne",
        element: <AuthGuard><RoleGuard allowedRoles={['servant']}><CommandesEnLigne /></RoleGuard></AuthGuard>
    },
    {
        path: '/user/servant/livraisons',
        element: <AuthGuard><RoleGuard allowedRoles={['servant']}><Livraisons /></RoleGuard></AuthGuard>
    },
    {
        path: '/user/servant/reservations',
        element: <AuthGuard><RoleGuard allowedRoles={['servant']}><Reservationservant /></RoleGuard></AuthGuard>
    },

    // Routes Livreur
    {
        path: "/user/livreur",
        element: <AuthGuard><RoleGuard allowedRoles={['livreur']}><HomeLivreur /></RoleGuard></AuthGuard>
    },
    {
        path: "/user/livreur/profile",
        element: <AuthGuard><RoleGuard allowedRoles={['livreur']}><ProfileLivreur /></RoleGuard></AuthGuard>
    },
    {
        path: "/user/livreur/status",
        element: <AuthGuard><RoleGuard allowedRoles={['livreur']}><StatusLivreur /></RoleGuard></AuthGuard>
    },
    {
        path: "/user/livreur/livrisons",
        element: <AuthGuard><RoleGuard allowedRoles={['livreur']}><LivrisonLivreur /></RoleGuard></AuthGuard>
    },
    {
        path: "/user/livreur/historique",
        element: <AuthGuard><RoleGuard allowedRoles={['livreur']}><Historique /></RoleGuard></AuthGuard>
    },
    {
        path: "/user/livreur/menu",
        element: <AuthGuard><RoleGuard allowedRoles={['livreur']}><MenuLivreur /></RoleGuard></AuthGuard>
    },

    // Route 404
    {
        path: "*",
        element: <NotFound />
    }
]);

export default router;