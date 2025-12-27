import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Mail, Link2 } from 'lucide-react';

const ShareModal = ({ isOpen, onClose, formTitle, formId }) => {
    const [copied, setCopied] = useState(false);
    const [shareUrl, setShareUrl] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Get the current origin (works for both localhost and production)
            const origin = window.location.origin;
            const url = `${origin}/form/${formId}`;
            setShareUrl(url);
        }
    }, [isOpen, formId]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy link. Please copy manually.');
        });
    };

    const shareToWhatsApp = () => {
        const text = encodeURIComponent(`Check out this form: ${formTitle}\n\n${shareUrl}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const shareToFacebook = () => {
        const url = encodeURIComponent(shareUrl);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    };

    const shareToTwitter = () => {
        const text = encodeURIComponent(`Check out this form: ${formTitle}`);
        const url = encodeURIComponent(shareUrl);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    };

    const shareToLinkedIn = () => {
        const url = encodeURIComponent(shareUrl);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    };

    const shareViaEmail = () => {
        const subject = encodeURIComponent(`Check out this form: ${formTitle}`);
        const body = encodeURIComponent(`I'd like to share this form with you:\n\n${formTitle}\n\nFill it out here: ${shareUrl}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const shareViaNative = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: formTitle,
                    text: `Check out this form: ${formTitle}`,
                    url: shareUrl,
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error sharing:', err);
                }
            }
        } else {
            // Fallback to copy if native share is not available
            copyToClipboard();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Share2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Share Form</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Form Title */}
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Form Title</p>
                        <p className="text-lg font-semibold text-gray-900">{formTitle}</p>
                    </div>

                    {/* Share Link */}
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Share Link</p>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                                <Link2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <input
                                    type="text"
                                    value={shareUrl}
                                    readOnly
                                    className="flex-1 bg-transparent text-sm text-gray-700 outline-none truncate"
                                />
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4" />
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Social Media Sharing */}
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">Share via</p>
                        <div className="grid grid-cols-2 gap-3">
                            {/* WhatsApp */}
                            <button
                                onClick={shareToWhatsApp}
                                className="flex items-center justify-center gap-2 p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-colors font-medium border border-green-200"
                            >
                                <MessageCircle className="h-5 w-5" />
                                WhatsApp
                            </button>

                            {/* Facebook */}
                            <button
                                onClick={shareToFacebook}
                                className="flex items-center justify-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors font-medium border border-blue-200"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                                Facebook
                            </button>

                            {/* Twitter */}
                            <button
                                onClick={shareToTwitter}
                                className="flex items-center justify-center gap-2 p-4 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl transition-colors font-medium border border-sky-200"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                </svg>
                                Twitter
                            </button>

                            {/* LinkedIn */}
                            <button
                                onClick={shareToLinkedIn}
                                className="flex items-center justify-center gap-2 p-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors font-medium border border-indigo-200"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                                LinkedIn
                            </button>

                            {/* Email */}
                            <button
                                onClick={shareViaEmail}
                                className="flex items-center justify-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors font-medium border border-gray-200"
                            >
                                <Mail className="h-5 w-5" />
                                Email
                            </button>

                            {/* Native Share (Mobile) */}
                            {navigator.share && (
                                <button
                                    onClick={shareViaNative}
                                    className="flex items-center justify-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition-colors font-medium border border-purple-200"
                                >
                                    <Share2 className="h-5 w-5" />
                                    More
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
                    <p className="text-xs text-gray-500 text-center">
                        Anyone with this link can view and fill out your form
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;

