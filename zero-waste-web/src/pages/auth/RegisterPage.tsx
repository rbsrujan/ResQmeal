import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'donor' | 'volunteer' | 'receiver'>('donor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Create profile
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role
      });

      if (profileError) {
        setError('Error creating profile');
      } else {
        navigate(`/dashboard/${role}`);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8">
        <h2 className="text-3xl font-black text-white mb-2">Join the Mission</h2>
        <p className="text-slate-400 mb-8 text-sm">Create your ZeroWaste AI account</p>

        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl mb-6 text-sm">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
           <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Full Name</label>
            <input 
              type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 transition outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Email Address</label>
            <input 
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 transition outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Password</label>
            <input 
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 transition outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Role</label>
            <select 
              value={role} onChange={e => setRole(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 transition outline-none"
            >
              <option value="donor">Food Donor</option>
              <option value="volunteer">Volunteer / Driver</option>
              <option value="receiver">Receiver / NGO</option>
            </select>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
          >
            {loading ? 'Creating Account...' : 'Continue'}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-sm">
          Already have an account? <Link to="/login" className="text-emerald-500 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

// Resubmission commit update
