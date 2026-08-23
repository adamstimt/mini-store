import { useState, useEffect } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

export default function AddProduct() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('10');
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '' });
    const navigate = useNavigate();

    useEffect(() => {
        API.get('/categories/')
            .then(res => {
                setCategories(res.data);
                if (res.data.length > 0) {
                    setCategoryId(res.data[0].id);
                }
            })
            .catch(err => {
                console.error("Ghalat f jazb les catégories:", err);
            });
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: '', type: '' });
        }, 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await API.post('/products/', {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock) || 0,
                category_id: parseInt(categoryId)
            });
            
            showNotification('Produit t-zadda b njaḥ! ✨', 'success');
            
            setTimeout(() => {
                navigate('/store');
            }, 1500);

        } catch (err) {
            console.error("Détails ta3 422 Error:", err.response?.data);
            const errorMsg = err.response?.data?.detail 
                ? JSON.stringify(err.response.data.detail) 
                : 'Ghalat f idaafat l\'produit.';
            setError(errorMsg);
            showNotification('Erreur f idaafat l\'produit!', 'error');
        }
    };

    const cartCount = JSON.parse(localStorage.getItem('cart'))?.length || 0;

    return (
        <div className="min-h-screen bg-slate-50 relative font-sans">
            <Navbar cartCount={cartCount} />

            {/* Notification Toast */}
            {notification.message && (
                <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl transition-all font-medium text-white flex items-center gap-2 animate-bounce ${
                    notification.type === 'error' ? 'bg-rose-500' : 'bg-emerald-600'
                }`}>
                    <span>{notification.type === 'error' ? '⚠️' : '🎉'}</span>
                    {notification.message}
                </div>
            )}

            <div className="flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-lg p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
                    
                    {/* Header */}
                    <div className="text-center mb-8">
                        <span className="text-4xl mb-2 inline-block">📦</span>
                        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Ajouter un Produit</h2>
                        <p className="text-sm text-slate-500 mt-1">Remplissez les détails pour ajouter un nouvel article au store</p>
                    </div>
                    
                    {/* Error Banner */}
                    {error && (
                        <div className="mb-6 p-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl overflow-x-auto flex items-start gap-2">
                            <span className="text-lg">❌</span>
                            <div>
                                <strong className="font-semibold">Erreur:</strong> 
                                <span className="block mt-0.5">{error}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Nom du produit</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                placeholder="Ex: T-shirt Oversized"
                                required 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                            <textarea 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                rows="3"
                                placeholder="Donnez plus de détails sur le produit..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Prix (DA)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={price} 
                                    onChange={(e) => setPrice(e.target.value)} 
                                    placeholder="0.00"
                                    required 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Stock Initial</label>
                                <input 
                                    type="number" 
                                    value={stock} 
                                    onChange={(e) => setStock(e.target.value)} 
                                    required 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Catégorie</label>
                            <select 
                                value={categoryId} 
                                onChange={(e) => setCategoryId(e.target.value)} 
                                required 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button 
                            type="submit" 
                            className="w-full py-3.5 px-4 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:scale-[0.99] shadow-lg shadow-indigo-100 transition-all duration-200 mt-2"
                        >
                            Ajouter le Produit 🚀
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}