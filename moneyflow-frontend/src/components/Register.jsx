import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { TrendingUp, User, Mail, Lock, ArrowRight, ShieldCheck, RefreshCw, Check, X } from 'lucide-react'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [otp, setOtp] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Password validation state
  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  })

  useEffect(() => {
    setValidations({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[@$!%*?&]/.test(password),
    })
  }, [password])

  const isPasswordValid = Object.values(validations).every(Boolean)

  const navigate = useNavigate()
  const API_URL = import.meta.env.VITE_API_URL

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!isPasswordValid) return setError('Password does not meet requirements')
    
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API_URL}/api/send-otp`, { email })
      setShowOtpInput(true)
      alert(res.data.msg)
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to send verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await axios.post(`${API_URL}/api/register`, {
        email,
        username,
        password,
        otp
      })
      alert('Registered successfully!')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.msg || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const ValidationItem = ({ label, isValid }) => (
    <div className={`flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider transition-colors ${isValid ? 'text-emerald-500' : 'text-zinc-600'}`}>
      {isValid ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
      {label}
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 font-sans selection:bg-emerald-500/30 px-4">
      <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-zinc-950 mb-6 shadow-xl shadow-emerald-500/20 -rotate-3">
            <TrendingUp size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {showOtpInput ? "Verify Identity" : "Create account"}
          </h1>
          <p className="text-zinc-500 text-sm mt-2 font-medium">
            {showOtpInput ? `Enter the code sent to ${email}` : "Join us and start tracking your flows"}
          </p>
        </div>

        <div className="glass-card p-8 bg-zinc-900/40 border-zinc-800/50 backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold uppercase tracking-widest text-center animate-pulse">
                {error}
            </div>
          )}

          {!showOtpInput ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-700 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-700 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-700 font-medium"
                    required
                  />
                </div>
                
                {/* Visual Password Feedback */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-3 pl-1">
                    <ValidationItem label="8+ Characters" isValid={validations.length} />
                    <ValidationItem label="One Uppercase" isValid={validations.uppercase} />
                    <ValidationItem label="One Lowercase" isValid={validations.lowercase} />
                    <ValidationItem label="One Number" isValid={validations.number} />
                    <ValidationItem label="One Special (@$!)" isValid={validations.special} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isPasswordValid}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black py-4 rounded-xl transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4 text-[10px] uppercase tracking-widest"
              >
                {loading ? "Sending Code..." : "Send Verification Code"}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
               <div className="space-y-4 text-center">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">6-Digit OTP</label>
                <div className="relative group">
                  <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    maxLength="6"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="000000"
                    className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl py-4 pl-12 pr-4 text-2xl font-black text-white tracking-[0.5em] focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-800 text-center"
                    required
                    autoFocus
                  />
                </div>
                <button 
                    type="button" 
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-[10px] font-black uppercase tracking-widest mx-auto mt-2 transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> {loading ? "Resending..." : "Resend Code"}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full bg-white hover:bg-zinc-100 text-zinc-950 font-black py-4 rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest"
              >
                {loading ? "Verifying..." : "Verify & Create Account"}
                {!loading && <ArrowRight size={16} />}
              </button>

              <button 
                type="button"
                onClick={() => setShowOtpInput(false)}
                className="w-full text-zinc-500 hover:text-white text-[9px] font-bold uppercase tracking-[0.2em] transition-colors"
              >
                  Go Back
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-10 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
