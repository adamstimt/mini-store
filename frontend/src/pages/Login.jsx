import { useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '' });
    const navigate = useNavigate();

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: '', type: '' });
        }, 3000);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await API.post('/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            localStorage.setItem('token', response.data.access_token);
            
          
            const isAdmin = response.data.is_admin === true || email.toLowerCase().includes('admin'); 
            
            localStorage.setItem('is_admin', isAdmin ? 'true' : 'false');

            showNotification('Login mcha b njaḥ! 🚀', 'success');
            
            setTimeout(() => {
                if (isAdmin) {
                    navigate('/admin'); // Ddiha l l-Admin Panel
                } else {
                    navigate('/store'); // Ddiha l l-Store
                }
            }, 1000);

        } catch (err) {
            console.error(err);
            setError('Ghalat f l\'email wela l\'password! A-3awed tajreb.');
            showNotification('Erreur f l\'connexion!', 'error');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 relative font-sans px-4 sm:px-6 lg:px-8">
            {notification.message && (
                <div className={`fixed top-10 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl transition-all font-medium text-white flex items-center gap-2 animate-bounce ${
                    notification.type === 'error' ? 'bg-rose-500' : 'bg-emerald-600'
                }`}>
                    <span>{notification.type === 'error' ? '⚠️' : '🎉'}</span>
                    {notification.message}
                </div>
            )}

            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
                <div className="text-center mb-8">
                    <span className="text-4xl mb-2 inline-block">🔐</span>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Mini-Store Login</h2>
                    <p className="text-sm text-slate-500 mt-1">Dakhlel les informations ta3k bach t-connecta</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2">
                        <span className="text-lg">❌</span>
                        <div>
                            <strong className="font-semibold">Erreur:</strong> 
                            <span className="block mt-0.5">{error}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                        <input 
                            type="email" 
                            placeholder="adem@gmail.com" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full py-3.5 px-4 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:scale-[0.99] shadow-lg shadow-indigo-100 transition-all duration-200 mt-2"
                    >
                        Se Connecter 🚀
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                    Ma 3andkch compte? <a href="/register" className="text-indigo-600 font-semibold hover:underline">S'inscrire</a>
                </p>
            </div>
        </div>
    );
}