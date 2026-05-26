import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductCatalogPage from './pages/ProductCatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
const LoginPage = () => <div>Iniciar Sesión</div>;
const RegisterPage = () => <div>Registrarse</div>;
const ProductListPage = () => <div>Lista de Productos</div>;
const OrderHistoryPage = () => <div>Historial de Pedidos</div>;
const OrderDetailPage = () => <div>Detalle de Pedido</div>;
const NotFoundPage = () => <div>Página no encontrada</div>;

export default function App() {
  return (
    <Routes>
      <Route path="/iniciohome" element={<HomePage />} />
      <Route path="/catlogodeproductos" element={<ProductCatalogPage />} />
      <Route path="/detalledeproducto/:id" element={<ProductDetailPage />} />
      <Route path="/carritodecompras" element={<CartPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/productlist" element={<ProductListPage />} />
      <Route path="/productdetail/:id" element={<ProductDetailPage />} />
      <Route path="/orderhistory" element={<OrderHistoryPage />} />
      <Route path="/orderdetail/:id" element={<OrderDetailPage />} />
      <Route path="/" element={<Navigate to="/iniciohome" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
