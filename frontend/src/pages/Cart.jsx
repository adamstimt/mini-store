import { useState, useEffect } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
    const [cart, setCart] = useState([]);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(savedCart);
    }, []);

    const removeFromCart = (id) => {
        const updatedCart = cart.filter(item => item.id !== id);
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        showNotification('Article t-naha men l\'panier', 'success');
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: '', type: '' });
        }, 3000);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) {
            showNotification('L\'panier ta3k raho khawi!', 'error');
            return;
        }
        
        try {
            const orderItems = cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity || 1
            }));

            await API.post('/orders/', {
                items: orderItems
            });

            showNotification('Commandes t-passaw b njaḥ! 🚀', 'success');
            localStorage.removeItem('cart');
            setCart([]);
            
            setTimeout(() => {
                navigate('/my-orders');
            }, 1500);

        } catch (err) {
            console.error("Détails ta3 422 Error f Orders:", err.response?.data);
            const errorMsg = err.response?.data?.detail 
                ? JSON.stringify(err.response.data.detail) 
                : 'Ghalat f taakid l\'commande!';
            showNotification('Erreur: ' + errorMsg, 'error');
        }
    };

    const totalPrice = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

    return (
        <div className="min-h-screen bg-slate-50 relative font-sans">
            <Navbar cartCount={cart.length} />

            {/* Notification Toast */}
            {notification.message && (
                <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl transition-all font-medium text-white flex items-center gap-2 animate-bounce ${
                    notification.type === 'error' ? 'bg-rose-500' : 'bg-emerald-600'
                }`}>
                    <span>{notification.type === 'error' ? '⚠️' : '🎉'}</span>
                    {notification.message}
                </div>
            )}

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Panier d'Achats 🛒</h2>
                        <p className="text-sm text-slate-500 mt-1">Gérez vos articles avant de confirmer votre commande</p>
                    </div>
                    {cart.length > 0 && (
                        <span className="bg-indigo-50 text-indigo-700 font-semibold px-4 py-1.5 rounded-full text-sm border border-indigo-100">
                            {cart.length} {cart.length > 1 ? 'Articles' : 'Article'}
                        </span>
                    )}
                </div>

                {cart.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
                        <span className="text-6xl mb-4 inline-block">🛒</span>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">Votre panier est vide</h3>
                        <p className="text-slate-400 text-sm mb-6">Explorez le store pour ajouter des produits intéressants.</p>
                        <button 
                            onClick={() => navigate('/store')}
                            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                        >
                            Voir le Store 🛍️
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            {cart.map(item => (
                                <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition-all">
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-lg text-slate-800">{item.name}</h4>
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md font-medium">
                                                Qté: {item.quantity || 1}
                                            </span>
                                            <span className="text-indigo-600 font-bold">
                                                {item.price * (item.quantity || 1)} DA
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => removeFromCart(item.id)}
                                        className="px-4 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl text-sm font-semibold transition flex items-center gap-1.5"
                                    >
                                        <span>🗑️</span> Supprimer
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Checkout Summary Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
                            <div className="text-center sm:text-left">
                                <span className="text-sm text-slate-400 block font-medium">Montant Total à payer</span>
                                <span className="text-3xl font-extrabold text-slate-900">{totalPrice} <span className="text-lg font-bold text-indigo-600">DA</span></span>
                            </div>
                            <button 
                                onClick={handleCheckout}
                                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold transition shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                            >
                                <span>🚀</span> Confirmer la Commande
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}