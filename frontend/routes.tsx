import { createBrowserRouter } from "react-router";
import { Landing } from "./pages/Landing";
import { Auth } from "./pages/Auth";
import { PatientDashboard } from "./pages/PatientDashboard";
import { ProviderDashboard } from "./pages/ProviderDashboard";
import { ReportRisk } from "./pages/ReportRisk";
import { Appointments } from "./pages/Appointments";
import { Education } from "./pages/Education";
import { Profile } from "./pages/Profile";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/auth",
    Component: Auth,
  },
  {
    path: "/patient-dashboard",
    Component: PatientDashboard,
  },
  {
    path: "/provider-dashboard",
    Component: ProviderDashboard,
  },
  {
    path: "/report-risk",
    Component: ReportRisk,
  },
  {
    path: "/appointments",
    Component: Appointments,
  },
  {
    path: "/education",
    Component: Education,
  },
  {
    path: "/profile",
    Component: Profile,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
