import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

type Tab = 'signin' | 'signup';
type Role = 'donor' | 'volunteer' | 'receiver';

const roleConfig = {
  donor: {
    label: 'Food Donor',
    icon: '🍱',
    description: 'Restaurants, homes, events with surplus food',
    color: '#16A34A'
  },
  volunteer: {
    label: 'Volunteer / Driver',
    icon: '🚴',
    description: 'Pick up and deliver food to receivers',
    color: '#3B82F6'
  },
  receiver: {
    label: 'Receiver / NGO',
    icon: '🏠',
    description: 'Shelters, NGOs, community food points',
    color: '#F97316'
  }
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('signin');
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<Role>('donor');
  const [loading, setLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Check WebAuthn support
  const biometricsSupported = 
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential
      .isUserVerifyingPlatformAuthenticatorAvailable === 'function';

  const navigateToDashboard = (role: string) => {
    if (role === 'volunteer') {
      navigate('/dashboard/volunteer', { replace: true });
    } else if (role === 'receiver') {
      navigate('/dashboard/receiver', { replace: true });
    } else if (role === 'donor') {
      navigate('/dashboard/donor', { replace: true });
    } else {
      // Unknown role — show error, do not redirect
      setError(`Unknown role "${role}". Please contact support.`);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError('Login failed. Please try again.');
      setLoading(false);
      return;
    }

    // 1. Wait for profile with retries (trigger may have slight delay)
    let userRole: string | null = null;
    let attempts = 0;

    const fetchRoleFromDB = async () => {
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();
      
      if (fetchError) console.warn('fetchRoleFromDB error:', fetchError);
      return profile?.role || null;
    };

    while (!userRole && attempts < 8) {
      userRole = await fetchRoleFromDB();
      if (userRole) break;
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }

    // 2. SELF-HEAL: If profile still missing, reconstruct from metadata
    if (!userRole) {
      console.log('Profile missing after retries, checking user_metadata...');
      const metadata = data.user.user_metadata || {};
      const foundRole = metadata.role;
      
      if (foundRole) {
        console.log('Role found in metadata:', foundRole, 'Attempting to repair profiles table...');
        const { error: repairError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email!,
          full_name: metadata.full_name || 'User',
          role: foundRole as 'donor' | 'volunteer' | 'receiver'
        });

        if (!repairError) {
          userRole = foundRole;
          console.log('Profile repair successful.');
        } else {
          console.error('Profile repair failed:', repairError.message);
        }
      }
    }

    if (!userRole) {
      console.error('CRITICAL: No role found for user', data.user.id, 'after all attempts.');
      setError('Account setup incomplete. Please try signing up again or contact support.');
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    console.log('Successfully resolved role:', userRole);

    // Final navigation based on verified role
    navigateToDashboard(userRole);
    setLoading(false);
  };

  const handleSignUp = async () => {
    if (!fullName.trim()) { setError('Please enter your full name'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    
    setLoading(true); 
    setError('');
    setSuccess('');
    
    // 1. Create the Auth user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email, 
      password,
      options: {
        data: { full_name: fullName, role }
      }
    });

    if (signUpError) { 
      setError(signUpError.message); 
      setLoading(false); 
      return; 
    }

    if (data.user) {
      // 2. ENSURE Profile: Definitively create or update the profile before navigating
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          role: role
        });

      if (profileError) {
        console.error('Profile creation error during signup:', profileError.message);
        // If we can't create the profile, we shouldn't proceed to let them "login"
        // as it will lead to the "Account setup incomplete" loop later
        setError('Error completing account setup. Please try again.');
        setLoading(false);
        return;
      }

      // 3. Check for immediate login (Confirm Email is OFF)
      if (data.session) {
        console.log('Signup and Profile created. Redirecting...');
        navigate(`/dashboard/${role}`);
        setLoading(false);
        return;
      }

      // 4. Default: User needs to confirm email
      setSuccess('Final step: Please check your email and verify your account to activate your profile.');
      setTab('signin');
    }
    
    setLoading(false);
  };

  const handleMagicLink = async () => {
    if (!email) { setError('Enter your email first'); return; }
    setMagicLoading(true); setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    });
    if (error) setError(error.message);
    else setSuccess('Magic link sent! Check your email inbox.');
    setMagicLoading(false);
  };

  const handleBiometric = async () => {
    setBiometricLoading(true); setError('');
    try {
      // Check if platform authenticator is available
      const available = await window.PublicKeyCredential
        .isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        setError('Biometric authentication not available on this device.');
        setBiometricLoading(false); return;
      }

      // Use Supabase's signInWithOtp as a bridge for WebAuthn
      // In production, integrate with a proper WebAuthn library
      // For hackathon: simulate with device biometrics prompt
      if (!email) { setError('Enter your email first for biometric login'); setBiometricLoading(false); return; }
      
      // Create credential request for biometric verification
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: 'required',
          rpId: window.location.hostname,
        }
      });

      if (credential) {
        // Credential verified by device biometrics
        // Fall through to magic link for session creation
        await supabase.auth.signInWithOtp({ email });
        setSuccess('Biometric verified! Check email for final sign-in link.');
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Biometric verification was cancelled or not allowed.');
      } else if (err.name === 'NotSupportedError') {
        setError('Biometric login not supported on this device/browser.');
      } else {
        setError('Biometric login failed. Please use email/password instead.');
      }
    }
    setBiometricLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0F172A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'absolute', width: 500, height: 500,
        borderRadius: '50%', top: -150, left: -100,
        background: 'radial-gradient(circle, rgba(22,163,74,0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', width: 400, height: 400,
        borderRadius: '50%', bottom: -100, right: -50,
        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%', maxWidth: 480,
        background: '#1E293B',
        border: '1px solid #334155',
        borderRadius: 20,
        padding: '40px',
        position: 'relative', zIndex: 1
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            gap: 8, marginBottom: 8
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#16A34A',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 18
            }}>🌱</div>
            <span style={{ color: '#F8FAFC', fontSize: 20, fontWeight: 800 }}>
              ZeroWaste <span style={{ color: '#16A34A' }}>AI</span>
            </span>
          </div>
          <p style={{ color: '#64748B', fontSize: 13 }}>
            Connecting surplus food to those in need
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', background: '#0F172A',
          borderRadius: 10, padding: 4, marginBottom: 28
        }}>
          {(['signin', 'signup'] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); setSignupStep(1); setError(''); setSuccess(''); }}
              style={{
                flex: 1, padding: '10px',
                borderRadius: 8, border: 'none', cursor: 'pointer',
                background: tab === t ? '#1E293B' : 'transparent',
                color: tab === t ? '#F8FAFC' : '#64748B',
                fontSize: 14, fontWeight: tab === t ? 700 : 400,
                boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
                transition: 'all 0.2s'
              }}>
              {t === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Error / Success */}
        {error && (
          <div style={{
            background: '#7F1D1D22', border: '1px solid #EF444444',
            borderRadius: 10, padding: '12px 16px',
            color: '#FCA5A5', fontSize: 13, marginBottom: 20
          }}>{error}</div>
        )}
        {success && (
          <div style={{
            background: '#14532D22', border: '1px solid #16A34A44',
            borderRadius: 10, padding: '12px 16px',
            color: '#86EFAC', fontSize: 13, marginBottom: 20
          }}>{success}</div>
        )}

        {/* SIGN UP — Role selector (Step 1) */}
        {tab === 'signup' && signupStep === 1 && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ color: '#F8FAFC', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Select Your Role</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {(Object.entries(roleConfig) as [Role, typeof roleConfig.donor][]).map(([key, cfg]) => (
                <div key={key} onClick={() => setRole(key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                    border: `2px solid ${role === key ? cfg.color : '#334155'}`,
                    background: role === key ? `${cfg.color}12` : '#0F172A',
                    transition: 'all 0.2s'
                  }}>
                  <span style={{ fontSize: 24 }}>{cfg.icon}</span>
                  <div>
                    <div style={{ color: '#F8FAFC', fontSize: 14, fontWeight: 700 }}>
                      {cfg.label}
                    </div>
                    <div style={{ color: '#64748B', fontSize: 12 }}>
                      {cfg.description}
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%',
                      border: `2px solid ${role === key ? cfg.color : '#334155'}`,
                      background: role === key ? cfg.color : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {role === key && (
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setSignupStep(2)}
              style={{
                width: '100%', padding: '14px',
                background: '#16A34A',
                border: 'none', borderRadius: 12,
                color: '#fff', fontSize: 16, fontWeight: 700,
                cursor: 'pointer', transition: 'background 0.2s'
              }}>
              Continue 👉
            </button>
          </div>
        )}

        {/* SIGN UP or SIGN IN — Form (Step 2) */}
        {(tab === 'signin' || (tab === 'signup' && signupStep === 2)) && (
          <div>
            {/* Step 2 Header with Back Button */}
            {tab === 'signup' && (
              <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between' }}>
                <button onClick={() => setSignupStep(1)}
                  style={{
                    background: 'none', border: 'none', color: '#94A3B8',
                    fontSize: 14, cursor: 'pointer', padding: 0,
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontWeight: 600
                  }}>
                  ← Back
                </button>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: `${roleConfig[role].color}22`,
                  border: `1px solid ${roleConfig[role].color}44`,
                  color: roleConfig[role].color,
                  padding: '4px 12px', borderRadius: 12,
                  fontSize: 12, fontWeight: 700
                }}>
                  {roleConfig[role].icon} {roleConfig[role].label}
                </div>
              </div>
            )}

            {/* Full name (signup only) */}
            {tab === 'signup' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: '#94A3B8', fontSize: 13, marginBottom: 8, display: 'block' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Your full name"
                  style={{
                    width: '100%', padding: '12px 16px',
                    background: '#0F172A', border: '1px solid #334155',
                    borderRadius: 10, color: '#F8FAFC', fontSize: 14,
                    outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#94A3B8', fontSize: 13, marginBottom: 8, display: 'block' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                onKeyDown={e => e.key === 'Enter' && tab === 'signin' && handleSignIn()}
                style={{
                  width: '100%', padding: '12px 16px',
                  background: '#0F172A', border: '1px solid #334155',
                  borderRadius: 10, color: '#F8FAFC', fontSize: 14,
                  outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24, position: 'relative' }}>
              <label style={{ color: '#94A3B8', fontSize: 13, marginBottom: 8, display: 'block' }}>
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={tab === 'signup' ? 'Min 8 characters' : 'Your password'}
                onKeyDown={e => e.key === 'Enter' && tab === 'signin' && handleSignIn()}
                style={{
                  width: '100%', padding: '12px 48px 12px 16px',
                  background: '#0F172A', border: '1px solid #334155',
                  borderRadius: 10, color: '#F8FAFC', fontSize: 14,
                  outline: 'none', boxSizing: 'border-box'
                }}
              />
              <button onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 14, top: 38,
                  background: 'none', border: 'none',
                  color: '#64748B', cursor: 'pointer', fontSize: 16
                }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            {/* Primary action button */}
            <button
              onClick={tab === 'signin' ? handleSignIn : handleSignUp}
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                background: loading ? '#334155' : '#16A34A',
                border: 'none', borderRadius: 12,
                color: '#fff', fontSize: 16, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: 16, transition: 'background 0.2s'
              }}>
              {loading ? 'Please wait...' : tab === 'signin' ? 'Sign In' : 'Create Account'}
            </button>

            {/* Divider */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16
            }}>
              <div style={{ flex: 1, height: 1, background: '#334155' }} />
              <span style={{ color: '#475569', fontSize: 12 }}>or continue with</span>
              <div style={{ flex: 1, height: 1, background: '#334155' }} />
            </div>

            {/* Magic link + Biometrics row */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              {/* Magic Link */}
              <button onClick={handleMagicLink} disabled={magicLoading}
                style={{
                  flex: 1, padding: '12px',
                  background: 'transparent',
                  border: '1px solid #334155',
                  borderRadius: 10, color: '#94A3B8',
                  fontSize: 13, fontWeight: 600,
                  cursor: magicLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8,
                  transition: 'border-color 0.2s'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#16A34A')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#334155')}>
                ✉️ {magicLoading ? 'Sending...' : 'Magic Link'}
              </button>

              {/* Biometrics */}
              {biometricsSupported && (
                <button onClick={handleBiometric} disabled={biometricLoading}
                  style={{
                    flex: 1, padding: '12px',
                    background: 'transparent',
                    border: '1px solid #334155',
                    borderRadius: 10, color: '#94A3B8',
                    fontSize: 13, fontWeight: 600,
                    cursor: biometricLoading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8,
                    transition: 'border-color 0.2s'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#3B82F6')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#334155')}>
                  🔐 {biometricLoading ? 'Verifying...' : 'Biometric'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer link */}
        <p style={{ textAlign: 'center', color: '#64748B', fontSize: 13 }}>
          {tab === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <span onClick={() => { setTab(tab === 'signin' ? 'signup' : 'signin'); setSignupStep(1); setError(''); }}
            style={{ color: '#16A34A', cursor: 'pointer', fontWeight: 600 }}>
            {tab === 'signin' ? 'Sign up free' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

// Resubmission commit update
