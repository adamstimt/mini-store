import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ cartCount }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-6">
                <Link to="/store" className="text-2xl font-bold text-blue-600">Mini-Store 🛍️</Link>
                <Link to="/store" className="text-gray-600 hover:text-blue-600 font-medium">Accueil</Link>
                <Link to="/my-orders" className="text-gray-600 hover:text-blue-600 font-medium">Mes Commandes</Link>
                {/* <Link to="/add-product" className="text-gray-600 hover:text-blue-600 font-medium">+ Zid Produit</Link> */}
            </div>

            <div className="flex items-center space-x-4">
                <Link to="/cart" className="relative bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition">
                    🛒
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                            {cartCount}
                        </span>
                    )}
                </Link>
                <button 
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition font-medium"
                >
                    Déconnexion
                </button>
            </div>
        </nav>
    );
}