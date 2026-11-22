// The web app under test: a login and a checkout screen drawn in HTML. A picture, so hidden from
// assistive tech (the log and the summary say what happens). Each element the agent touches is a data-target.
export default function MockApp() {
  return (
    <div className="mock" aria-hidden="true">
      <div className="mock__bar">
        <span className="ui-dots"><i /><i /><i /></span>
        <span className="mock__url" data-mock-url>mock-shop.local/login</span>
      </div>
      <div className="mock__view" data-mock-view>
        <div className="mock__screen" data-screen="login">
          <div className="mock__form" data-target="login-form">
            <div className="mock__brand"><i />mock-shop</div>
            <div className="mock__h">Sign in</div>
            <div className="mock__field" data-target="login-email"><span>Email</span>ana@mail.test</div>
            <div className="mock__field" data-target="login-password"><span>Password</span>••••••••</div>
            <div className="mock__btn" data-target="login-submit">Sign in</div>
          </div>
        </div>
        <div className="mock__screen" data-screen="checkout">
          <div className="mock__form" data-target="checkout-form">
            <div className="mock__h">Checkout</div>
            <div className="mock__cart" data-target="cart-list">
              <div className="mock__item"><b>Canvas tote</b><span className="mock__qty" data-target="cart-qty">− 1 +</span><span>$24</span><span className="mock__x" data-target="cart-remove">×</span></div>
              <div className="mock__item"><b>Enamel mug</b><span className="mock__qty">− 2 +</span><span>$24</span><span className="mock__x">×</span></div>
            </div>
            <div className="mock__field" data-target="checkout-address"><span>Address</span>Jl. Veteran 8</div>
            <div className="mock__sum" data-target="cart-summary"><span>Total</span><b>$48.00</b></div>
            <div className="mock__pay">
              <span className="mock__ghost" />
              {/* the planted fault: the button sits 12 px right of the column (demo.css) */}
              <div className="mock__btn mock__btn--pay" data-target="pay-button">Pay $48.00</div>
              <span className="mock__circle" />
              <span className="mock__diff">+12 px</span>
            </div>
          </div>
        </div>
        <div className="mock__hl" data-mock-hl />
      </div>
    </div>
  );
}
