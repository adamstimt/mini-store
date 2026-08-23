import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [activeTab, setActiveTab] = useState('orders');

    // =========================
    // PRODUCT FORM
    // =========================
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        description: '',
        category_id: '',
        stock: ''
    });

    // =========================
    // CATEGORY FORM
    // =========================
    const [newCategory, setNewCategory] = useState('');

    // =========================
    // IMAGE
    // =========================
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // =========================
    // GENERAL
    // =========================
    const [loading, setLoading] = useState(true);

    const [notification, setNotification] = useState({
        message: '',
        type: ''
    });

    const navigate = useNavigate();

    // ============================================================
    // NOTIFICATION
    // ============================================================

    const showNotification = (message, type = 'success') => {
        setNotification({
            message,
            type
        });

        setTimeout(() => {
            setNotification({
                message: '',
                type: ''
            });
        }, 3000);
    };

    // ============================================================
    // FETCH ADMIN DATA
    // ============================================================

    const fetchAdminData = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem('token');
            const isAdmin = localStorage.getItem('is_admin');

            if (!token || isAdmin !== 'true') {
                navigate('/');
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            let ordersData = [];
            let productsData = [];
            let categoriesData = [];

            // =========================
            // ORDERS
            // =========================

            try {
                const ordersRes = await API.get('/orders/', config);
                ordersData = ordersRes.data;
            } catch (e) {
                console.warn(
                    "Ma qderch y-jip les commandes:",
                    e
                );
            }

            // =========================
            // PRODUCTS
            // =========================

            try {
                const productsRes = await API.get(
                    '/admin/products/',
                    config
                );

                productsData = productsRes.data;
            } catch (e) {
                console.warn(
                    "Ma qderch y-jip les produits:",
                    e
                );
            }

            // =========================
            // CATEGORIES
            // =========================

            try {
                const categoriesRes = await API.get(
                    '/categories/',
                    config
                );

                categoriesData = categoriesRes.data;

                // If no selected category
                if (
                    categoriesData.length > 0 &&
                    !newProduct.category_id
                ) {
                    setNewProduct(prev => ({
                        ...prev,
                        category_id: categoriesData[0].id
                    }));
                }
            } catch (e) {
                console.warn(
                    "Ma qderch y-jip les catégories:",
                    e
                );
            }

            setOrders(ordersData);
            setProducts(productsData);
            setCategories(categoriesData);

        } catch (err) {
            console.error(
                "Ghalat f jazb données:",
                err
            );

            showNotification(
                "Erreur f jazb données ta3 l-admin!",
                "error"
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    // ============================================================
    // IMAGE SELECT
    // ============================================================

    const handleFileSelect = (e) => {
        const file = e.target.files[0];

        if (file) {
            setSelectedFile(file);
            setImagePreview(
                URL.createObjectURL(file)
            );
        }
    };

    // ============================================================
    // ADD CATEGORY
    // ============================================================

    const handleAddCategory = async (e) => {
        e.preventDefault();

        const categoryName = newCategory.trim();

        if (!categoryName) {
            showNotification(
                "Kteb smiya ta3 catégorie!",
                "error"
            );
            return;
        }

        try {
            const token = localStorage.getItem('token');

            const response = await API.post(
                '/categories/',
                {
                    name: categoryName
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const createdCategory = response.data;

            showNotification(
                `Catégorie "${createdCategory.name}" t-zadet b njaḥ! 🎉`,
                "success"
            );

            // Reset
            setNewCategory('');

            // Reload categories/products/orders
            await fetchAdminData();

            // Select the newly created category
            if (createdCategory?.id) {
                setNewProduct(prev => ({
                    ...prev,
                    category_id: createdCategory.id
                }));
            }

        } catch (err) {
            console.error(
                "Erreur création catégorie:",
                err.response?.data || err
            );

            const detail = err.response?.data?.detail;

            let errorMsg = "Ma qderch y-zid l-catégorie!";

            if (typeof detail === 'string') {
                errorMsg = detail;
            } else if (
                Array.isArray(detail) &&
                detail.length > 0
            ) {
                errorMsg =
                    detail[0].msg ||
                    JSON.stringify(detail[0]);
            }

            showNotification(
                errorMsg,
                "error"
            );
        }
    };

    // ============================================================
    // CHANGE ORDER STATUS
    // ============================================================

    const handleStatusChange = async (
        orderId,
        newStatus
    ) => {
        try {
            const token = localStorage.getItem('token');

            const response = await API.put(
                `/orders/${orderId}/status?new_status=${newStatus}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            showNotification(
                response.data.message ||
                    'Status t-badal b njaḥ! 🚀',
                'success'
            );

            fetchAdminData();

        } catch (err) {
            console.error(err);

            showNotification(
                'Ma qderch y-badal l-status!',
                'error'
            );
        }
    };

    // ============================================================
    // ADD PRODUCT
    // ============================================================

    const handleAddProduct = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');

            // =========================
            // CHECK CATEGORY
            // =========================

            if (!newProduct.category_id) {
                showNotification(
                    "Khayar une catégorie!",
                    "error"
                );
                return;
            }

            const categoryExists = categories.some(
                cat =>
                    String(cat.id) ===
                    String(newProduct.category_id)
            );

            if (!categoryExists) {
                showNotification(
                    "Cette catégorie n'existe pas!",
                    "error"
                );
                return;
            }

            // =========================
            // FORMDATA
            // =========================

            const formData = new FormData();

            formData.append(
                'name',
                newProduct.name
            );

            formData.append(
                'price',
                parseFloat(newProduct.price)
            );

            formData.append(
                'description',
                newProduct.description
            );

            formData.append(
                'category_id',
                parseInt(newProduct.category_id)
            );

            formData.append(
                'stock',
                parseInt(newProduct.stock) || 0
            );

            if (selectedFile) {
                formData.append(
                    'file',
                    selectedFile
                );
            }

            // =========================
            // API
            // =========================

            await API.post(
                '/admin/products/',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            showNotification(
                'Produit t-zad b njaḥ! 📦',
                'success'
            );

            // =========================
            // RESET PRODUCT FORM
            // =========================

            setNewProduct({
                name: '',
                price: '',
                description: '',
                category_id:
                    categories.length > 0
                        ? categories[0].id
                        : '',
                stock: ''
            });

            setSelectedFile(null);
            setImagePreview(null);

            // Reload
            fetchAdminData();

        } catch (err) {
            console.error(
                err.response?.data || err
            );

            let errorMsg =
                'Ma qderch y-zid l-produit!';

            const detail =
                err.response?.data?.detail;

            if (typeof detail === 'string') {
                errorMsg = detail;
            } else if (
                Array.isArray(detail) &&
                detail.length > 0
            ) {
                errorMsg =
                    detail[0].msg ||
                    JSON.stringify(detail[0]);
            }

            showNotification(
                errorMsg,
                'error'
            );
        }
    };

    // ============================================================
    // DELETE PRODUCT
    // ============================================================

    const handleDeleteProduct = async (
        productId
    ) => {
        try {
            const token =
                localStorage.getItem('token');

            await API.delete(
                `/admin/products/${productId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            showNotification(
                'Produit t-masah b njaḥ! 🗑️',
                'success'
            );

            fetchAdminData();

        } catch (err) {
            console.error(err);

            showNotification(
                'Ma qderch y-masah l-produit!',
                'error'
            );
        }
    };

    // ============================================================
    // LOGOUT
    // ============================================================

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('is_admin');

        navigate('/');
    };

    // ============================================================
    // STATS
    // ============================================================

    const totalRevenue = orders.reduce(
        (acc, order) =>
            acc +
            Number(
                order.total_price ||
                order.total ||
                0
            ),
        0
    );

    const pendingOrdersCount =
        orders.filter(
            o =>
                (o.status || 'Pending') ===
                'Pending'
        ).length;

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-indigo-400 font-semibold text-lg gap-3">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>

                Jari taḥmil l-Admin Panel... ⏳
            </div>
        );
    }

    // ============================================================
    // UI
    // ============================================================

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 lg:p-10 selection:bg-indigo-500 selection:text-white">

            {/* ================================================= */}
            {/* NOTIFICATION */}
            {/* ================================================= */}

            {notification.message && (
                <div
                    className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl font-medium text-white flex items-center gap-3 backdrop-blur-md animate-bounce border ${
                        notification.type === 'error'
                            ? 'bg-rose-600/90 border-rose-500'
                            : 'bg-emerald-600/90 border-emerald-500'
                    }`}
                >
                    <span className="text-xl">
                        {notification.type === 'error'
                            ? '⚠️'
                            : '🎉'}
                    </span>

                    <span>
                        {notification.message}
                    </span>
                </div>
            )}

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-slate-800">

                <div className="flex items-center gap-4">

                    <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20 text-2xl">
                        👑
                    </div>

                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-white">
                            Admin Dashboard Pro
                        </h1>

                        <p className="text-sm text-slate-400 mt-0.5">
                            Giri les commandes, les produits w les catégories ta3 l-store
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="px-5 py-2.5 text-sm font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-2xl transition-all duration-200 flex items-center gap-2"
                >
                    <span>Déconnexion</span>
                    🚪
                </button>
            </div>

            <div className="max-w-7xl mx-auto space-y-8">

                {/* ================================================= */}
                {/* STATS */}
                {/* ================================================= */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Orders */}
                    <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-slate-800 flex items-center gap-5 relative overflow-hidden group hover:border-indigo-500/50 transition-all">

                        <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl text-2xl border border-indigo-500/20">
                            📦
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                                Total Commandes
                            </p>

                            <h3 className="text-3xl font-extrabold text-white mt-1">
                                {orders.length}
                            </h3>
                        </div>
                    </div>

                    {/* Pending */}
                    <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-slate-800 flex items-center gap-5 relative overflow-hidden group hover:border-amber-500/50 transition-all">

                        <div className="p-4 bg-amber-500/10 text-amber-400 rounded-2xl text-2xl border border-amber-500/20">
                            ⏳
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                                Pending Orders
                            </p>

                            <h3 className="text-3xl font-extrabold text-white mt-1">
                                {pendingOrdersCount}
                            </h3>
                        </div>
                    </div>

                    {/* Revenue */}
                    <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-slate-800 flex items-center gap-5 relative overflow-hidden group hover:border-emerald-500/50 transition-all">

                        <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl text-2xl border border-emerald-500/20">
                            💰
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                                Chiffre d'Affaires
                            </p>

                            <h3 className="text-3xl font-extrabold text-white mt-1">
                                ${totalRevenue.toFixed(2)}
                            </h3>
                        </div>
                    </div>

                </div>

                {/* ================================================= */}
                {/* TABS */}
                {/* ================================================= */}

                <div className="flex gap-3 flex-wrap">

                    <button
                        onClick={() =>
                            setActiveTab('orders')
                        }
                        className={`px-6 py-3 rounded-2xl font-bold transition-all duration-200 flex items-center gap-2 ${
                            activeTab === 'orders'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500'
                                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                    >
                        <span>📋</span>
                        Les Commandes ({orders.length})
                    </button>

                    <button
                        onClick={() =>
                            setActiveTab('products')
                        }
                        className={`px-6 py-3 rounded-2xl font-bold transition-all duration-200 flex items-center gap-2 ${
                            activeTab === 'products'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500'
                                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                    >
                        <span>🛍️</span>
                        Gestion des Produits ({products.length})
                    </button>

                </div>

                {/* ================================================= */}
                {/* ORDERS */}
                {/* ================================================= */}

                {activeTab === 'orders' && (
                    <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-800 overflow-hidden">

                        <div className="p-6 border-b border-slate-800">
                            <h3 className="text-lg font-bold text-white">
                                Suivi ta3 Les Commandes
                            </h3>
                        </div>

                        <div className="overflow-x-auto">

                            <table className="w-full text-left border-collapse">

                                <thead>
                                    <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">

                                        <th className="p-4">
                                            ID
                                        </th>

                                        <th className="p-4">
                                            Photo
                                        </th>

                                        <th className="p-4">
                                            Client
                                        </th>

                                        <th className="p-4">
                                            Total
                                        </th>

                                        <th className="p-4">
                                            Status
                                        </th>

                                        <th className="p-4 text-center">
                                            Action
                                        </th>

                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">

                                    {orders.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="p-12 text-center text-slate-500 font-medium"
                                            >
                                                Ma kayen ḥatta commande! 📭
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map(order => (
                                            <tr
                                                key={order.id}
                                                className="hover:bg-slate-800/40 transition-colors"
                                            >

                                                <td className="p-4 font-bold text-indigo-400">
                                                    #{order.id}
                                                </td>

                                                <td className="p-4">

                                                    {order.image_url ? (
                                                        <a
                                                            href={order.image_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <img
                                                                src={order.image_url}
                                                                alt="Order proof"
                                                                className="w-12 h-12 object-cover rounded-xl border border-slate-700 hover:scale-105 transition shadow-sm"
                                                            />
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-slate-500 italic">
                                                            Ma kayenéch
                                                        </span>
                                                    )}

                                                </td>

                                                <td className="p-4 font-semibold text-slate-200">
                                                    Client #{order.user_id || 'N/A'}
                                                </td>

                                                <td className="p-4 font-semibold text-emerald-400">
                                                    ${order.total_price || order.total || '0.00'}
                                                </td>

                                                <td className="p-4">

                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                                            order.status === 'Delivered'
                                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                                : order.status === 'Cancelled'
                                                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                        }`}
                                                    >
                                                        {order.status || 'Pending'}
                                                    </span>

                                                </td>

                                                <td className="p-4 text-center">

                                                    <select
                                                        value={order.status || 'Pending'}
                                                        onChange={e =>
                                                            handleStatusChange(
                                                                order.id,
                                                                e.target.value
                                                            )
                                                        }
                                                        className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                                    >

                                                        <option value="Pending">
                                                            Pending ⏳
                                                        </option>

                                                        <option value="Processing">
                                                            Processing 🔄
                                                        </option>

                                                        <option value="Delivered">
                                                            Delivered ✅
                                                        </option>

                                                        <option value="Cancelled">
                                                            Cancelled ❌
                                                        </option>

                                                    </select>

                                                </td>

                                            </tr>
                                        ))
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>
                )}

                {/* ================================================= */}
                {/* PRODUCTS TAB */}
                {/* ================================================= */}

                {activeTab === 'products' && (

                    <div className="space-y-8">

                        {/* ================================================= */}
                        {/* CATEGORY MANAGEMENT */}
                        {/* ================================================= */}

                        <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-slate-800">

                            <div className="flex flex-col md:flex-row justify-between gap-5">

                                <div>
                                    <h3 className="text-lg font-bold text-white">
                                        📁 Gestion des Catégories
                                    </h3>

                                    <p className="text-sm text-slate-400 mt-1">
                                        Zid une catégorie jdida bach tban automatiquement f Store.
                                    </p>
                                </div>

                                <form
                                    onSubmit={handleAddCategory}
                                    className="flex flex-col sm:flex-row gap-3 w-full md:w-auto"
                                >

                                    <input
                                        type="text"
                                        placeholder="Ex: Vêtements"
                                        value={newCategory}
                                        onChange={e =>
                                            setNewCategory(
                                                e.target.value
                                            )
                                        }
                                        required
                                        className="w-full sm:w-72 px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-600 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                    />

                                    <button
                                        type="submit"
                                        className="px-6 py-3 font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-2xl transition shadow-lg shadow-indigo-600/30"
                                    >
                                        + Ajouter
                                    </button>

                                </form>

                            </div>

                            {/* CURRENT CATEGORIES */}

                            <div className="mt-6 flex flex-wrap gap-2">

                                {categories.length === 0 ? (
                                    <span className="text-sm text-slate-500">
                                        Ma kayen ḥatta catégorie.
                                    </span>
                                ) : (
                                    categories.map(category => (
                                        <span
                                            key={category.id}
                                            className="px-4 py-2 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-xl text-sm font-semibold"
                                        >
                                            {category.name}
                                        </span>
                                    ))
                                )}

                            </div>

                        </div>

                        {/* ================================================= */}
                        {/* PRODUCT FORM + PRODUCTS */}
                        {/* ================================================= */}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* ================================================= */}
                            {/* ADD PRODUCT */}
                            {/* ================================================= */}

                            <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-slate-800 h-fit">

                                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                                    <span>➕</span>
                                    Zid Produit Jdid
                                </h3>

                                <form
                                    onSubmit={handleAddProduct}
                                    className="space-y-4"
                                >

                                    {/* NAME */}

                                    <div>

                                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                            Smiya ta3 Produit
                                        </label>

                                        <input
                                            type="text"
                                            placeholder="Ex: T-Shirt Nike"
                                            value={newProduct.name}
                                            onChange={e =>
                                                setNewProduct({
                                                    ...newProduct,
                                                    name: e.target.value
                                                })
                                            }
                                            required
                                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-600 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                        />

                                    </div>

                                    {/* PRICE */}

                                    <div>

                                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                            Prix ($)
                                        </label>

                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="99.99"
                                            value={newProduct.price}
                                            onChange={e =>
                                                setNewProduct({
                                                    ...newProduct,
                                                    price: e.target.value
                                                })
                                            }
                                            required
                                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-600 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                        />

                                    </div>

                                    {/* STOCK */}

                                    <div>

                                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                            Quantité en stock
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            value={newProduct.stock}
                                            onChange={e =>
                                                setNewProduct({
                                                    ...newProduct,
                                                    stock: e.target.value
                                                })
                                            }
                                            placeholder="Quantité en stock"
                                            required
                                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-600 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                        />

                                    </div>

                                    {/* IMAGE */}

                                    <div>

                                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                            Khayar Tswira mel PC 📁
                                        </label>

                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer bg-slate-950 p-2 rounded-2xl border border-slate-800"
                                        />

                                        {imagePreview && (
                                            <div className="mt-3 flex items-center gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800">

                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-12 h-12 object-cover rounded-xl"
                                                />

                                                <span className="text-xs text-slate-400 truncate">
                                                    {selectedFile?.name}
                                                </span>

                                            </div>
                                        )}

                                    </div>

                                    {/* CATEGORY */}

                                    <div>

                                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                            Catégorie
                                        </label>

                                        <select
                                            value={newProduct.category_id}
                                            onChange={e =>
                                                setNewProduct({
                                                    ...newProduct,
                                                    category_id:
                                                        e.target.value
                                                })
                                            }
                                            required
                                            disabled={
                                                categories.length === 0
                                            }
                                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-slate-100 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                        >

                                            {categories.length === 0 ? (
                                                <option value="">
                                                    Aucune catégorie disponible
                                                </option>
                                            ) : (
                                                categories.map(
                                                    category => (
                                                        <option
                                                            key={category.id}
                                                            value={category.id}
                                                        >
                                                            {category.name}
                                                        </option>
                                                    )
                                                )
                                            )}

                                        </select>

                                        {categories.length === 0 && (
                                            <p className="text-xs text-rose-400 mt-2">
                                                Crée d'abord une catégorie ci-dessus.
                                            </p>
                                        )}

                                    </div>

                                    {/* DESCRIPTION */}

                                    <div>

                                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                            Description
                                        </label>

                                        <textarea
                                            rows="3"
                                            placeholder="Wassef l-produit..."
                                            value={
                                                newProduct.description
                                            }
                                            onChange={e =>
                                                setNewProduct({
                                                    ...newProduct,
                                                    description:
                                                        e.target.value
                                                })
                                            }
                                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-600 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                                        />

                                    </div>

                                    {/* SUBMIT */}

                                    <button
                                        type="submit"
                                        disabled={
                                            categories.length === 0
                                        }
                                        className={`w-full py-3 font-bold text-white rounded-2xl transition shadow-lg flex items-center justify-center gap-2 ${
                                            categories.length > 0
                                                ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                                                : 'bg-slate-700 cursor-not-allowed'
                                        }`}
                                    >
                                        <span>
                                            Ajouter Produit
                                        </span>
                                        🚀
                                    </button>

                                </form>

                            </div>

                            {/* ================================================= */}
                            {/* PRODUCTS LIST */}
                            {/* ================================================= */}

                            <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-800 overflow-hidden flex flex-col">

                                <div className="p-6 border-b border-slate-800">

                                    <h3 className="text-lg font-bold text-white">
                                        قائمة Produits
                                    </h3>

                                </div>

                                <div className="overflow-x-auto flex-1">

                                    <table className="w-full text-left border-collapse">

                                        <thead>

                                            <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">

                                                <th className="p-4 font-semibold">
                                                    Produit
                                                </th>

                                                <th className="p-4 font-semibold">
                                                    Catégorie
                                                </th>

                                                <th className="p-4 font-semibold">
                                                    Prix
                                                </th>

                                                <th className="p-4 font-semibold">
                                                    Stock
                                                </th>

                                                <th className="p-4 font-semibold text-center">
                                                    Action
                                                </th>

                                            </tr>

                                        </thead>

                                        <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">

                                            {products.length === 0 ? (

                                                <tr>
                                                    <td
                                                        colSpan="5"
                                                        className="p-12 text-center text-slate-500 font-medium"
                                                    >
                                                        Ma kayen ḥatta produit! 📦
                                                    </td>
                                                </tr>

                                            ) : (

                                                products.map(prod => {

                                                    const rawImage =
                                                        prod.image_url ||
                                                        prod.image ||
                                                        prod.photo ||
                                                        prod.file_path;

                                                    const imageUrl =
                                                        rawImage
                                                            ? rawImage.startsWith('http')
                                                                ? rawImage
                                                                : `http://127.0.0.1:8000/${rawImage.replace(/^\/+/, '')}`
                                                            : null;

                                                    const productCategory =
                                                        prod.category?.name ||
                                                        categories.find(
                                                            cat =>
                                                                String(cat.id) ===
                                                                String(
                                                                    prod.category_id
                                                                )
                                                        )?.name ||
                                                        'N/A';

                                                    return (
                                                        <tr
                                                            key={prod.id}
                                                            className="hover:bg-slate-800/40 transition-colors"
                                                        >

                                                            {/* PRODUCT */}

                                                            <td className="p-4">

                                                                <div className="flex items-center gap-3">

                                                                    {imageUrl ? (
                                                                        <img
                                                                            src={imageUrl}
                                                                            alt={prod.name}
                                                                            className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                                                                            onError={e => {
                                                                                e.target.style.display =
                                                                                    'none';
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-xs text-slate-500">
                                                                            📷
                                                                        </div>
                                                                    )}

                                                                    <div>

                                                                        <span className="font-bold text-white">
                                                                            {prod.name}
                                                                        </span>

                                                                        {prod.description && (
                                                                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                                                                                {prod.description}
                                                                            </p>
                                                                        )}

                                                                    </div>

                                                                </div>

                                                            </td>

                                                            {/* CATEGORY */}

                                                            <td className="p-4">

                                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                                                    {productCategory}
                                                                </span>

                                                            </td>

                                                            {/* PRICE */}

                                                            <td className="p-4 font-semibold text-emerald-400">
                                                                ${prod.price}
                                                            </td>

                                                            {/* STOCK */}

                                                            <td className="p-4 font-semibold text-indigo-300">
                                                                {prod.stock !== undefined
                                                                    ? prod.stock
                                                                    : 'N/A'}
                                                            </td>

                                                            {/* DELETE */}

                                                            <td className="p-4 text-center">

                                                                <button
                                                                    onClick={() =>
                                                                        handleDeleteProduct(
                                                                            prod.id
                                                                        )
                                                                    }
                                                                    className="px-3.5 py-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all"
                                                                >
                                                                    Supprimer 🗑️
                                                                </button>

                                                            </td>

                                                        </tr>
                                                    );
                                                })
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                        </div>

                    </div>
                )}

            </div>

        </div>
    );
}