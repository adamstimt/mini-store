import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Store from './pages/Store';
import AddProduct from './pages/AddProduct';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import AdminPanel from './pages/AdminPanel';

export default function App() {
    return (
        <Router>
            <Routes>
                {/* Auth Routes */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Main Store & User Routes */}
                <Route path="/store" element={<Store />} />
                <Route path="/add-product" element={<AddProduct />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/my-orders" element={<MyOrders />} />

                {/* Admin Dashboard */}
                <Route path="/admin" element={<AdminPanel />} />
            </Routes>
        </Router>
    );
}