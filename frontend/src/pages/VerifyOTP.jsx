import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { MailIcon, LoaderIcon, KeyIcon } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

function VerifyOTP() {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const { state } = useLocation();
    const navigate = useNavigate();
    const email = state?.email;

    const { verifyOTP, resendOTP, isVerifyingOTP, isResendingOTP } = useAuthStore();

    useEffect(() => {
        if (!email) {
            navigate("/signup");
        }
    }, [email, navigate]);

    const handleChange = (index, value) => {
        if (/^[0-9]$/.test(value) || value === "") {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            if (value !== "" && index < 5) {
                document.getElementById(`otp-${index + 1}`).focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && otp[index] === "" && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpString = otp.join("");
        if (otpString.length === 6) {
            const success = await verifyOTP({ email, otp: otpString });
            if (success) {
                navigate("/");
            }
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-4 bg-slate-900 overflow-y-auto">
            <div className="relative w-full max-w-2xl md:h-[600px] h-auto py-12">
                <BorderAnimatedContainer>
                    <div className="w-full flex flex-col items-center justify-center p-8">
                        <div className="w-full max-w-md">
                            {/* HEADING TEXT */}
                            <div className="text-center mb-8">
                                <div className="bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700/50">
                                    <KeyIcon className="w-10 h-10 text-cyan-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-200 mb-2">Verify Your Email</h2>
                                <p className="text-slate-400">
                                    We've sent a 6-digit code to <span className="text-cyan-400 font-medium">{email}</span>
                                </p>
                            </div>

                            {/* OTP INPUTS */}
                            <form onSubmit={handleVerify} className="space-y-8">
                                <div className="flex justify-between gap-2 md:gap-4">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            className="w-12 h-14 md:w-16 md:h-16 text-center text-2xl font-bold bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-all"
                                        />
                                    ))}
                                </div>

                                {/* VERIFY BUTTON */}
                                <button
                                    className="auth-btn w-full"
                                    type="submit"
                                    disabled={isVerifyingOTP || otp.join("").length !== 6}
                                >
                                    {isVerifyingOTP ? (
                                        <LoaderIcon className="w-full h-5 animate-spin text-center" />
                                    ) : (
                                        "Verify OTP"
                                    )}
                                </button>
                            </form>

                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-slate-900 md:bg-[#1e293b] text-slate-500">OR</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <p className="text-slate-400 text-sm text-center">
                                    Skip the code and verify instantly with your Google account
                                </p>
                                <div className="w-full flex justify-center">
                                    <GoogleLogin
                                        onSuccess={(credentialResponse) => {
                                            googleLogin(credentialResponse);
                                        }}
                                        onError={() => {
                                            toast.error("Google Verification Failed");
                                        }}
                                        theme="filled_black"
                                        shape="pill"
                                        text="continue_with"
                                        width="100%"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 text-center">
                                <p className="text-slate-400 text-sm">
                                    Didn't receive the code?{" "}
                                    <button
                                        onClick={() => resendOTP(email)}
                                        disabled={isResendingOTP}
                                        className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium disabled:opacity-50"
                                    >
                                        {isResendingOTP ? "Resending..." : "Resend OTP"}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </BorderAnimatedContainer>
            </div>
        </div>
    );
}

export default VerifyOTP;
