import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScrollToBottom: () => void;
}

export function TermsDialog({ open, onOpenChange, onScrollToBottom }: TermsDialogProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 10; // 10px tolerance

    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
      onScrollToBottom();
    }
  };

  // Reset scroll state when dialog opens
  useEffect(() => {
    if (open) {
      setHasScrolledToBottom(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-slate-800 border-slate-600 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-400 flex items-center gap-2">
            <span className="text-3xl">📜</span>
            The Rulebook
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Please read these terms and conditions carefully. You must scroll to the bottom to proceed.
          </DialogDescription>
        </DialogHeader>
        
        <div
          ref={contentRef}
          className="space-y-4 text-sm text-slate-300 overflow-y-auto max-h-[60vh] pr-2"
          onScroll={handleScroll}
        >
          <section>
            <h4 className="font-semibold text-purple-300 mb-2">1. Acceptance of Terms</h4>
            <p className="mb-3">
              By accessing and using PLAY Barbados services, you accept and agree to be bound by the terms and provisions of this agreement.
            </p>
          </section>

          <section>
            <h4 className="font-semibold text-purple-300 mb-2">2. Digital Gift Card Terms & Conditions of Sale</h4>
            <div className="mb-3 space-y-4">
              <div>
                <h5 className="font-medium text-purple-200 mb-2">Definitions</h5>
                <div className="ml-2 space-y-2">
                  <p><strong>Gift Card:</strong> Any digital code, prepaid card, or stored-value product sold by PLAY Barbados.</p>
                  <p><strong>Vendor:</strong> The retailer or platform that issues/redeems the Gift Card.</p>
                  <p><strong>You / Customer:</strong> The purchaser or recipient.</p>
                  <p><strong>We / Us:</strong> PLAY Barbados, the seller/distributor.</p>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-purple-200 mb-2">User Accounts and Obligations</h5>
                <div className="ml-2 space-y-2">
                  <p>You agree not to use our services for any fraudulent, illegal, or unauthorized purposes.</p>
                  <p>You must be of legal age to use our services. If you are a minor, a parent or legal guardian must agree to these Terms on your behalf.</p>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-purple-200 mb-2">Purchase and Use of Digital Goods</h5>
                <div className="ml-2 space-y-2">
                  <p><strong>All sales are final.</strong> Unless otherwise required by law, purchases of Digital Goods are non-refundable and non-exchangeable.</p>
                  <p>We are not responsible for lost, stolen, or misused codes once they have been delivered to you.</p>
                  <p>Exceptions may apply if:</p>
                  <ul className="ml-4 space-y-1 list-disc">
                    <li>The code is redeemed in-store under the supervision of our staff.</li>
                    <li>An incorrect code was purchased and verified as unused and valid.</li>
                    <li>The code is defective and verified through our checks or confirmed by the Vendor.</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-purple-200 mb-2">Vendor Terms</h5>
                <div className="ml-2 space-y-2">
                  <p>Digital Goods are issued by third-party Vendors. Your use of these products is also subject to the Vendor's own terms and conditions, including any expiration dates or use restrictions.</p>
                  <p>You are responsible for reviewing the Vendor's terms before purchase or use.</p>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-purple-200 mb-2">Disclaimer of Vendor Liability</h5>
                <div className="ml-2 space-y-2">
                  <p>As a retailer, we are not the issuer of Digital Goods and are not responsible for the quality, legality, or any other aspect of the products/services provided by the Vendor.</p>
                  <p>You agree to seek remedies directly from the Vendor for issues related to their products.</p>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-purple-200 mb-2">Order Refusal & Fraud Prevention</h5>
                <div className="ml-2 space-y-2">
                  <p>We reserve the right to limit quantities, refuse orders, or cancel transactions suspected to be fraudulent or unauthorized.</p>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-purple-200 mb-2">Usage Restrictions</h5>
                <div className="ml-2 space-y-2">
                  <p>All codes are for <strong>personal use only</strong>—no reselling, sharing, or transferring without our written consent.</p>
                  <p>Some codes are region, currency, or platform-specific. Customers are responsible for requesting the correct code.</p>
                  <p>We are not responsible for errors caused by incorrect information you provide (e.g., wrong email, currency, product, or region).</p>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-purple-200 mb-2">Risk & Responsibility</h5>
                <div className="ml-2 space-y-2">
                  <p>Risk passes to you upon delivery. Treat codes like cash—lost, stolen, or misused codes will not be replaced.</p>
                  <p>We are not liable for Vendor-related issues or losses after delivery.</p>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-purple-200 mb-2">Reporting Issues</h5>
                <div className="ml-2 space-y-2">
                  <p>Report defective codes within 7 days of delivery.</p>
                  <p>Reports must be submitted via WhatsApp or our support website and include:</p>
                  <ul className="ml-4 space-y-1 list-disc">
                    <li>Your receipt</li>
                    <li>The full code</li>
                    <li>Matching username/ID</li>
                    <li>Screenshots of the error</li>
                  </ul>
                  <p>Once all required information is received, we will investigate the issue and determine the appropriate resolution based on our findings.</p>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-purple-200 mb-2">Fraud & Abuse</h5>
                <div className="ml-2 space-y-2">
                  <p>All codes are for <strong>legitimate use on Barbados-based accounts only.</strong></p>
                  <p>Codes sent, shared, or transferred outside Barbados are not eligible for support or replacement.</p>
                  <p>If you cannot provide local account information (username/email) showing the redemption attempt on a Barbados account, we cannot assist.</p>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-purple-200 mb-2">Username / Account ID Lock</h5>
                <div className="ml-2 space-y-2">
                  <p>All codes must be redeemed on the exact username or account ID you provided to us.</p>
                  <p>If your username changes, you must notify us before purchasing by email, WhatsApp, or in store so we can update our records.</p>
                  <p>We cannot provide support if the username/account ID does not match our records.</p>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-purple-200 mb-2">Privacy</h5>
                <div className="ml-2 space-y-2">
                  <p>We collect and share your information as needed to process orders, prevent fraud, provide support, and for marketing purposes.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h4 className="font-semibold text-purple-300 mb-2">3. Video Games & Accessories Policy</h4>
            <div className="mb-3 space-y-3">
              <p><strong>Warranty Period:</strong> 3 months on hardware and accessories only.</p>
              <div>
                <p><strong>Video Games:</strong></p>
                <ul className="ml-4 space-y-1 list-disc">
                  <li>Returns accepted within 14 days only if defective.</li>
                  <li>Non-defective returns are treated as trade-ins.</li>
                  <li>All returns require proof of purchase, original tags attached, and the item in the same condition as purchased.</li>
                  <li>Non-defective returns incur a 20% restocking fee (exceptions may apply).</li>
                  <li>Cash refunds only for defective items with a physical receipt; otherwise, store credit will be applied.</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h4 className="font-semibold text-purple-300 mb-2">4. Use License</h4>
            <p className="mb-3">
              Permission is granted to temporarily download one copy of materials (information or software) on PLAY Barbados's website for personal, non-commercial, transitory viewing only.
            </p>
          </section>

          <section>
            <h4 className="font-semibold text-purple-300 mb-2">5. Disclaimer</h4>
            <p className="mb-3">
              Materials on PLAY Barbados's website are provided on an "as is" basis. PLAY Barbados makes no warranties, expressed or implied, and disclaims all other warranties, including implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
            </p>
          </section>

          <section>
            <h4 className="font-semibold text-purple-300 mb-2">6. Limitations</h4>
            <p className="mb-3">
              In no event shall PLAY Barbados or its suppliers be liable for any damages (including loss of data or profit, or business interruption) arising from the use or inability to use our website materials.
            </p>
          </section>

          <section>
            <h4 className="font-semibold text-purple-300 mb-2">7. Links</h4>
            <p className="mb-3">
              PLAY Barbados is not responsible for the content of any linked sites. The inclusion of any link does not imply endorsement.
            </p>
          </section>

          <section>
            <h4 className="font-semibold text-purple-300 mb-2">8. Modifications</h4>
            <p className="mb-3">
              PLAY Barbados may revise these terms at any time without notice. By using our website, you agree to be bound by the then-current version.
            </p>
          </section>

          <section>
            <h4 className="font-semibold text-purple-300 mb-2">9. General Provisions</h4>
            <p className="mb-3">
              We reserve the right to modify these Terms at any time. Continued use of our services after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h4 className="font-semibold text-purple-300 mb-2">10. Governing Law</h4>
            <p className="mb-3">
              These terms are governed by and construed in accordance with the laws of Barbados, and you irrevocably submit to the exclusive jurisdiction of its courts.
            </p>
          </section>

          <div className="border-t border-slate-600 pt-4">
            <p className="text-xs text-slate-400 text-center">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <div className="mt-2 p-2 bg-purple-900/30 border border-purple-400/30 rounded text-center">
              {hasScrolledToBottom ? (
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-800 transform hover:scale-105"
                >
                  ✓ You have read the rulebook - Click to close
                </button>
              ) : (
                <p className="text-purple-300 text-sm font-medium">
                  Please scroll to the bottom to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
