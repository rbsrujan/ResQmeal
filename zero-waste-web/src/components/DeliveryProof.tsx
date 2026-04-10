import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle2, ShieldCheck, X } from 'lucide-react';

interface DeliveryProofProps {
  donationId: string;
  onSuccess: () => void;
}

export const DeliveryProof = ({ donationId, onSuccess }: DeliveryProofProps) => {
  const [step, setStep] = useState<'otp' | 'success'>('otp');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const verifyOtp = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 4) return;
    
    setVerifying(true);
    try {
      const { data, error: fetchErr } = await supabase
        .from('donations')
        .select('delivery_otp')
        .eq('id', donationId)
        .single();

      if (fetchErr) throw fetchErr;

      if (data.delivery_otp === enteredOtp) {
        const { error: finalErr } = await supabase
          .from('donations')
          .update({
            otp_verified: true,
            status: 'delivered',
            pickup_status: 'delivered',
            delivered_at: new Date().toISOString()
          })
          .eq('id', donationId);

        if (finalErr) throw finalErr;
        setStep('success');
        setTimeout(onSuccess, 2000);
      } else {
        setError('Invalid OTP. Please ask the receiver for the correct code.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div style={{
      background: '#1E293B', border: '1px solid #334155',
      borderRadius: '20px', padding: '24px', position: 'relative',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      overflow: 'hidden'
    }}>
      {error && (
        <div style={{
          background: '#7F1D1D44', border: '1px solid #EF4444',
          color: '#FCA5A5', padding: '12px', borderRadius: '12px',
          marginBottom: '20px', fontSize: '13px', display: 'flex', justifyContent: 'space-between'
        }}>
          {error}
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={14}/></button>
        </div>
      )}


      {step === 'otp' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '60px', height: '60px', borderRadius: '50%', background: '#3B82F622',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', color: '#3B82F6'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h3 style={{ color: '#F8FAFC', marginBottom: '8px' }}>Delivery Verification</h3>
          <p style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '24px' }}>
            Ask the receiver for the 4-digit verification code shown on their dashboard.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="tel"
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                style={{
                  width: '50px', height: '60px', borderRadius: '12px',
                  background: '#0F172A', border: '1px solid #334155',
                  color: '#F8FAFC', fontSize: '24px', fontWeight: 800,
                  textAlign: 'center'
                }}
              />
            ))}
          </div>

          <button 
            onClick={verifyOtp}
            disabled={verifying}
            style={{
              width: '100%', padding: '16px', borderRadius: '14px',
              background: '#3B82F6', border: 'none', color: '#fff',
              fontWeight: 800, cursor: 'pointer', fontSize: '15px'
            }}
          >
            {verifying ? 'Verifying...' : 'Complete Delivery'}
          </button>
        </div>
      )}

      {step === 'success' && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', background: '#16A34A22',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', color: '#16A34A'
          }}>
            <CheckCircle2 size={48} className="animate-bounce" />
          </div>
          <h2 style={{ color: '#F8FAFC', marginBottom: '12px', fontSize: '24px', fontWeight: 800 }}>Delivery Confirmed!</h2>
          <p style={{ color: '#94A3B8', fontSize: '15px' }}>
            You've successfully delivered the meal. <br/>Thank you for your service! 🚴✨
          </p>
        </div>
      )}
    </div>
  );
};

// Resubmission commit update
