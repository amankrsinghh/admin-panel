import { AdminLayout, AdminGate } from "./Layout";
import { useHashRoute, matchRoute } from "./shared/router";
import { AdminLogin } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { AddProduct, ManageProducts } from "./pages/Products";
import { AdminOrders, AdminCustomRequests } from "./pages/OrdersRequests";
import { Settings } from "./pages/Settings";
import Categories from "./pages/Categories";
import { ToastHost } from "./shared/ui";

export default function App() {
  const { path } = useHashRoute();

  // Login page is shown without the gated layout
  if (path === "/login") {
    return (
      <>
        <ToastHost />
        <AdminLogin />
      </>
    );
  }

  let view: React.ReactNode;
  if (path === "/" || path === "")        view = <Dashboard />;
  else if (path === "/categories")        view = <Categories />;
  else if (path === "/add")               view = <AddProduct />;
  else if (path === "/products")          view = <ManageProducts />;
  else if (path === "/orders")            view = <AdminOrders />;
  else if (path === "/requests")          view = <AdminCustomRequests />;
  else if (path === "/settings")          view = <Settings />;
  else {
    const m = matchRoute("/edit/:id", path);
    if (m) view = <AddProduct editId={m.id} />;
    else view = <Dashboard />;
  }

  return (
    <>
      <ToastHost />
      <AdminGate>
        <AdminLayout>{view}</AdminLayout>
      </AdminGate>
    </>
  );
}
