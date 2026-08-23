import { useEffect, useState } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';

export default function Store() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState('');

    // ============================================================
    // FETCH PRODUCTS + CATEGORIES
    // ============================================================

    const fetchStoreData = async () => {
        try {
            setLoading(true);

            const [prodRes, catRes] = await Promise.all([
                API.get('/products/'),
                API.get('/categories/')
            ]);

            console.log(
                'Products:',
                prodRes.data
            );

            console.log(
                'Categories:',
                catRes.data
            );

            setProducts(
                Array.isArray(prodRes.data)
                    ? prodRes.data
                    : []
            );

            setCategories(
                Array.isArray(catRes.data)
                    ? catRes.data
                    : []
            );

        } catch (err) {
            console.error(
                "Ghalat f jazb l'bayanat:",
                err
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStoreData();
    }, []);

    // ============================================================
    // ADD TO CART
    // ============================================================

    const addToCart = (product) => {
        const cart =
            JSON.parse(
                localStorage.getItem('cart')
            ) || [];

        const existingIndex =
            cart.findIndex(
                item =>
                    item.id === product.id
            );

        if (existingIndex > -1) {
            cart[existingIndex].quantity =
                (cart[existingIndex].quantity || 1) +
                1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }

        localStorage.setItem(
            'cart',
            JSON.stringify(cart)
        );

        window.dispatchEvent(
            new Event('storage')
        );

        setNotification(
            `T-zadda "${product.name}" lel panier! 🛒`
        );

        setTimeout(() => {
            setNotification('');
        }, 3000);
    };

    // ============================================================
    // GET PRODUCT CATEGORY ID
    // ============================================================

    const getProductCategoryId = (product) => {
        // Case 1:
        // category_id = 2
        if (
            product.category_id !== undefined &&
            product.category_id !== null &&
            typeof product.category_id !== 'object'
        ) {
            return product.category_id;
        }

        // Case 2:
        // category_id = { id: 2 }
        if (
            product.category_id &&
            typeof product.category_id === 'object'
        ) {
            return product.category_id.id;
        }

        // Case 3:
        // category = { id: 2, name: "Electronics" }
        if (product.category) {
            return product.category.id;
        }

        return null;
    };

    // ============================================================
    // GET PRODUCT CATEGORY NAME
    // ============================================================

    const getProductCategoryName = (product) => {
        // If backend sends category object
        if (product.category?.name) {
            return product.category.name;
        }

        // Otherwise find category locally
        const categoryId =
            getProductCategoryId(product);

        const category =
            categories.find(
                cat =>
                    String(cat.id) ===
                    String(categoryId)
            );

        return category?.name || null;
    };

    // ============================================================
    // FILTER PRODUCTS
    // ============================================================

    const filteredProducts =
        products.filter(product => {

            // =========================
            // SEARCH
            // =========================

            const search =
                searchQuery
                    .toLowerCase()
                    .trim();

            const productName =
                product.name
                    ?.toLowerCase() || '';

            const productDescription =
                product.description
                    ?.toLowerCase() || '';

            const matchesSearch =
                productName.includes(search) ||
                productDescription.includes(search);

            // =========================
            // CATEGORY
            // =========================

            if (
                selectedCategory === 'all'
            ) {
                return matchesSearch;
            }

            const productCategoryId =
                getProductCategoryId(
                    product
                );

            const matchesCategory =
                String(productCategoryId) ===
                String(selectedCategory);

            return (
                matchesSearch &&
                matchesCategory
            );
        });

    // ============================================================
    // CART COUNT
    // ============================================================

    const cartCount =
        JSON.parse(
            localStorage.getItem('cart')
        )?.length || 0;

    // ============================================================
    // UI
    // ============================================================

    return (
        <div className="min-h-screen bg-gray-50/50 relative selection:bg-indigo-500 selection:text-white">

            <Navbar cartCount={cartCount} />

            {/* ================================================= */}
            {/* NOTIFICATION */}
            {/* ================================================= */}

            {notification && (
                <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900/95 text-white backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl transition-all duration-300 font-medium flex items-center space-x-2 border border-gray-800">

                    <span className="text-emerald-400">
                        ✨
                    </span>

                    <span>
                        {notification}
                    </span>

                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* ================================================= */}
                {/* HEADER */}
                {/* ================================================= */}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-gray-200/60 pb-6">

                    <div>

                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Catalogue des Produits 🛍️
                        </h1>

                        <p className="text-sm text-gray-500 mt-1">
                            Découvrez notre sélection exclusive d'articles aux meilleurs prix.
                        </p>

                    </div>

                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm font-medium text-gray-600">

                        Total:

                        <span className="text-indigo-600 font-bold ml-1">
                            {filteredProducts.length}
                        </span>

                        <span className="ml-1">
                            produits
                        </span>

                    </div>

                </div>

                {/* ================================================= */}
                {/* SEARCH + CATEGORY FILTER */}
                {/* ================================================= */}

                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-10">

                    {/* SEARCH */}

                    <div className="relative flex-1">

                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                            🔍
                        </span>

                        <input
                            type="text"
                            placeholder="Rechercher un produit par nom ou description..."
                            value={searchQuery}
                            onChange={e =>
                                setSearchQuery(
                                    e.target.value
                                )
                            }
                            className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none transition text-sm text-gray-800"
                        />

                    </div>

                    {/* CATEGORY */}

                    <div className="sm:w-72">

                        <select
                            value={selectedCategory}
                            onChange={e =>
                                setSelectedCategory(
                                    e.target.value
                                )
                            }
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none transition text-sm text-gray-800 cursor-pointer"
                        >

                            <option value="all">
                                📁 Toutes les Catégories
                            </option>

                            {categories.map(
                                category => (
                                    <option
                                        key={
                                            category.id
                                        }
                                        value={
                                            category.id
                                        }
                                    >
                                        {category.name}
                                    </option>
                                )
                            )}

                        </select>

                    </div>

                </div>

                {/* ================================================= */}
                {/* PRODUCTS */}
                {/* ================================================= */}

                {loading ? (

                    <div className="flex justify-center items-center py-24">

                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>

                    </div>

                ) : filteredProducts.length === 0 ? (

                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">

                        <div className="text-4xl mb-3">
                            🔍
                        </div>

                        <h3 className="text-lg font-bold text-gray-800">
                            Aucun produit trouvé
                        </h3>

                        <p className="text-gray-500 text-sm mt-1">
                            Essayez de modifier vos termes de recherche ou de changer de catégorie.
                        </p>

                    </div>

                ) : (

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

                        {filteredProducts.map(
                            product => {

                                // =================================================
                                // IMAGE
                                // =================================================

                                const rawImage =
                                    product.image_url ||
                                    product.image ||
                                    product.photo ||
                                    product.file_path ||
                                    product.img;

                                let imageUrl = null;

                                if (rawImage) {

                                    if (
                                        rawImage.startsWith(
                                            'http'
                                        )
                                    ) {
                                        imageUrl =
                                            rawImage;
                                    } else {

                                        const cleanPath =
                                            rawImage
                                                .replace(
                                                    /^\/+/,
                                                    ''
                                                )
                                                .replace(
                                                    /^(static|uploads)\/?/,
                                                    ''
                                                );

                                        imageUrl =
                                            `http://127.0.0.1:8000/static/${cleanPath}`;
                                    }
                                }

                                // =================================================
                                // CATEGORY NAME
                                // =================================================

                                const categoryName =
                                    getProductCategoryName(
                                        product
                                    );

                                return (

                                    <div
                                        key={
                                            product.id
                                        }
                                        className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 flex flex-col justify-between overflow-hidden transition-all duration-300 transform hover:-translate-y-1 group"
                                    >

                                        {/* IMAGE */}

                                        <div className="w-full h-64 bg-gray-100 overflow-hidden relative">

                                            {imageUrl ? (

                                                <img
                                                    src={
                                                        imageUrl
                                                    }
                                                    alt={
                                                        product.name
                                                    }
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={e => {
                                                        e.target.style.display =
                                                            'none';
                                                    }}
                                                />

                                            ) : (

                                                <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400">
                                                    🖼️
                                                </div>

                                            )}

                                            {/* STOCK BADGE */}

                                            {product.stock !==
                                                undefined && (

                                                <span className="absolute top-3 right-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-indigo-700 shadow-sm z-10">
                                                    Stock:{' '}
                                                    {
                                                        product.stock
                                                    }
                                                </span>

                                            )}

                                        </div>

                                        {/* INFO */}

                                        <div className="p-6">

                                            <div className="flex justify-between items-start gap-4 mb-2">

                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                                    {
                                                        product.name
                                                    }
                                                </h3>

                                            </div>

                                            {/* CATEGORY BADGE */}

                                            {categoryName && (
                                                <div className="mb-3">

                                                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
                                                        📁{' '}
                                                        {
                                                            categoryName
                                                        }
                                                    </span>

                                                </div>
                                            )}

                                            {/* DESCRIPTION */}

                                            <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-4">
                                                {product.description ||
                                                    'Aucune description disponible pour ce produit.'}
                                            </p>

                                            {/* STOCK */}

                                            <div className="mt-2 text-sm">

                                                {product.stock >
                                                0 ? (

                                                    <span className="text-emerald-600 font-medium">
                                                        ✅ En stock:{' '}
                                                        {
                                                            product.stock
                                                        }{' '}
                                                        disponibles
                                                    </span>

                                                ) : (

                                                    <span className="text-red-600 font-bold">
                                                        ❌ Rupture de stock
                                                    </span>

                                                )}

                                            </div>

                                        </div>

                                        {/* FOOTER */}

                                        <div className="px-6 pb-6 pt-2 border-t border-gray-50 bg-gray-50/30 flex flex-col gap-4">

                                            <div className="flex justify-between items-center">

                                                <span className="text-xl font-black text-gray-900">

                                                    {
                                                        product.price
                                                    }

                                                    <span className="text-xs font-semibold text-gray-500 ml-1">
                                                        DA
                                                    </span>

                                                </span>

                                            </div>

                                            {/* ADD TO CART */}

                                            <button
                                                onClick={() =>
                                                    addToCart(
                                                        product
                                                    )
                                                }
                                                disabled={
                                                    product.stock <=
                                                    0
                                                }
                                                className={`w-full mt-2 py-3 px-4 rounded-xl shadow-md font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                                                    product.stock >
                                                    0
                                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 active:scale-[0.98]'
                                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                                }`}
                                            >

                                                <span>
                                                    {product.stock >
                                                    0
                                                        ? 'Ajouter au Panier'
                                                        : 'Indisponible'}
                                                </span>

                                                <span>
                                                    🛒
                                                </span>

                                            </button>

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>

                )}

            </div>

        </div>
    );
}