import { useEffect, useState } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/orders/')
            .then(res => {
                setOrders(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Ghalat f jazb les commandes:", err);
                setLoading(false);
            });
    }, []);

    const cartCount = JSON.parse(localStorage.getItem('cart'))?.length || 0;

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar cartCount={cartCount} />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Mes Commandes 📦</h1>
                        <p className="text-sm text-slate-500 mt-1">Suivez l'état de vos commandes récentes</p>
                    </div>
                    {!loading && orders.length > 0 && (
                        <span className="bg-indigo-50 text-indigo-700 font-semibold px-4 py-1.5 rounded-full text-sm border border-indigo-100">
                            {orders.length} {orders.length > 1 ? 'Commandes' : 'Commande'}
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
                        <span className="text-4xl mb-3 inline-block animate-spin">⏳</span>
                        <p className="text-slate-500 font-medium">Jari tahmil les commandes...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
                        <span className="text-6xl mb-4 inline-block">📭</span>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">Aucune commande pour le moment</h3>
                        <p className="text-slate-400 text-sm">Vos commandes confirmées apparaîtront ici.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                                
                                {/* Order Header */}
                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-slate-400">Commande N°:</span>
                                        <span className="font-extrabold text-slate-800">#{order.id}</span>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                        order.status === 'Pending' 
                                            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    }`}>
                                        {order.status || 'Pending'}
                                    </span>
                                </div>

                                {/* Order Items */}
                                <div className="space-y-3 mb-6">
                                    {order.items && order.items.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center text-sm bg-slate-50 p-3 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-700">Produit ID: {item.product_id}</span>
                                                <span className="text-slate-400">•</span>
                                                <span className="text-slate-500">Qté: {item.quantity}</span>
                                            </div>
                                            <span className="font-bold text-slate-900">{item.price} DA</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Footer / Total */}
                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                    <span className="font-semibold text-slate-600">Montant Total:</span>
                                    <span className="text-xl font-extrabold text-indigo-600">{order.total_price} <span className="text-sm font-bold">DA</span></span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}