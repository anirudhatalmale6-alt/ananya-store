/* ============================================================
   ANANYA · storefront engine (client-side, localStorage-backed)
   Powers cart, checkout, orders, auth, customer & admin dashboards.
   ============================================================ */
(function () {
  'use strict';

  const LS = {
    catalog: 'ananya_catalog_v1',
    cart: 'ananya_cart_v1',
    orders: 'ananya_orders_v1',
    users: 'ananya_users_v1',
    session: 'ananya_session_v1',
    seq: 'ananya_seq_v1',
    outbox: 'ananya_outbox_v1',
    logo: 'ananya_logo_v1',
    emailcfg: 'ananya_emailcfg_v1',
  };

  const read = (k, fallback) => {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  /* ---------- seed data ---------- */
  const SEED_CATEGORIES = [
    { id: 'c1', slug: 'kitchen-appliances', name: 'Kitchen Appliances', image: 'img/cat-mixer.png', description: 'Mixers, grinders & modern kitchen machines' },
    { id: 'c2', slug: 'brass-statues', name: 'Brass Statues', image: 'img/cat-statue.png', description: 'Handcrafted brass idols & figurines' },
    { id: 'c3', slug: 'temple-items', name: 'Temple Items', image: 'img/cat-lamp.png', description: 'Diyas, lamps & pooja essentials' },
    { id: 'c4', slug: 'hotel-kitchen', name: 'Hotel Kitchen', image: 'img/cat-range.png', description: 'Commercial-grade kitchen equipment' },
    { id: 'c5', slug: 'sowbhagya', name: 'Sowbhagya Brand', image: 'img/cat-sowbhagya.png', description: 'Genuine Sowbhagya appliances' },
    { id: 'c6', slug: 'cookware', name: 'Cookware & Utensils', image: 'img/offer-mixer.png', description: 'Everyday cookware & serving ware' },
  ];

  const P = (id, name, cat, price, sale, stock, imgs, desc, featured) => ({
    id, name, slug: slugify(name), categoryId: cat, price, salePrice: sale, stock,
    images: imgs, description: desc, featured: !!featured, rating: 4 + (id.charCodeAt(1) % 10) / 10,
  });

  const SEED_PRODUCTS = [
    P('p1', 'Sowbhagya Table Top Wet Grinder 2L', 'c1', 8990, 6990, 24, ['img/cat-mixer.png', 'img/offer-mixer.png'], 'Powerful 150W table-top wet grinder with conical stones for perfectly smooth batter. Ideal for idli & dosa lovers.', true),
    P('p2', 'Sowbhagya Mixer Grinder 750W (3 Jars)', 'c1', 5490, 4290, 40, ['img/offer-mixer.png', 'img/cat-mixer.png'], '750W copper motor mixer grinder with three stainless-steel jars. Handles wet, dry and chutney grinding with ease.', true),
    P('p3', 'Brass Standing Ganesha Idol 9"', 'c2', 3499, null, 15, ['img/cat-statue.png'], 'Hand-finished antique brass Ganesha idol, 9 inches tall. A serene centerpiece for your home mandir or living room.', true),
    P('p4', 'Brass Nataraja Statue 12"', 'c2', 6799, 5999, 8, ['img/cat-statue.png'], 'Intricately detailed brass Nataraja depicting Lord Shiva\'s cosmic dance. Museum-grade casting and hand polish.', false),
    P('p5', 'Brass Lakshmi-Ganesha Pair', 'c2', 4299, null, 20, ['img/cat-statue.png'], 'Auspicious pair of Lakshmi & Ganesha in solid brass, perfect for Diwali gifting and daily worship.', false),
    P('p6', 'Traditional Brass Deepam / Diya (Set of 2)', 'c3', 1299, 999, 60, ['img/cat-lamp.png', 'img/offer-lamp.png'], 'Classic South-Indian brass oil lamps. Beautifully turned stems with a warm, lasting shine.', true),
    P('p7', 'Kuthu Vilakku Brass Temple Lamp 15"', 'c3', 4999, 3999, 12, ['img/offer-lamp.png', 'img/cat-lamp.png'], 'Tall standing temple lamp (kuthu vilakku) in heavy brass, 15 inches. Radiates divine ambience during pooja.', true),
    P('p8', 'Brass Pooja Thali Set (7 Pieces)', 'c3', 2199, null, 33, ['img/cat-lamp.png'], 'Complete brass pooja thali with kumkum holder, bell, diya, spoon and accessories for daily rituals.', false),
    P('p9', 'Commercial Idli Steamer 48 Plates', 'c4', 12999, 10999, 6, ['img/cat-range.png', 'img/offer-range.png'], 'Stainless-steel commercial idli steamer, 48-plate capacity. Built for busy hotel & tiffin kitchens.', false),
    P('p10', 'Heavy-Duty 3-Burner Gas Range', 'c4', 24999, 21999, 4, ['img/offer-range.png', 'img/cat-range.png'], 'Robust three-burner commercial gas range with high-thermal-efficiency burners and a stainless frame.', true),
    P('p11', 'Sowbhagya Tilting Wet Grinder 10L', 'c4', 18490, 15990, 5, ['img/cat-mixer.png'], 'Commercial 10-litre tilting wet grinder for restaurants and catering. Effortless batter in bulk.', false),
    P('p12', 'Sowbhagya Instant Rice Cooker 1.8L', 'c5', 2799, 2199, 50, ['img/cat-sowbhagya.png'], 'Reliable 1.8L automatic rice cooker with keep-warm mode and durable non-stick bowl.', true),
    P('p13', 'Sowbhagya Induction Cooktop 2000W', 'c5', 3299, 2599, 28, ['img/cat-sowbhagya.png'], 'Energy-efficient 2000W induction cooktop with preset Indian menus and push-button controls.', false),
    P('p14', 'Sowbhagya Juicer Mixer Grinder', 'c5', 6290, null, 18, ['img/cat-sowbhagya.png', 'img/offer-mixer.png'], 'Versatile juicer + mixer grinder combo with a powerful motor and multiple jars for every prep task.', false),
    P('p15', 'Stainless Steel Cookware Set (5 Pcs)', 'c6', 3999, 3199, 22, ['img/offer-mixer.png'], 'Tri-ply stainless cookware set — kadai, sauce pans and lids with cool-touch handles.', true),
    P('p16', 'Brass Serving Bowl / Handi (Medium)', 'c6', 1599, null, 30, ['img/offer-mixer.png', 'img/cat-lamp.png'], 'Traditional brass serving handi with tin lining, ideal for authentic serving and gifting.', false),
    P('p17', 'Non-Stick Dosa Tawa 30cm', 'c6', 1199, 899, 45, ['img/offer-range.png'], 'Wide 30cm non-stick dosa tawa with even heat distribution for crisp, restaurant-style dosas.', false),
    P('p18', 'Brass Wall-Hanging Bell (Ghanti)', 'c3', 899, null, 38, ['img/cat-lamp.png'], 'Melodious solid-brass temple bell with ornate detailing for your pooja room entrance.', false),
  ];

  const SEED_USERS = [
    { id: 'u_admin', name: 'Store Admin', email: 'admin@ananya.com', password: 'admin123', role: 'admin', phone: '', address: '' },
    { id: 'u_cust', name: 'Priya Sharma', email: 'customer@ananya.com', password: 'customer123', role: 'customer', phone: '+91 98765 43210', address: '12, Anna Nagar, Chennai, Tamil Nadu 600040' },
  ];

  function slugify(s) {
    return String(s).toLowerCase().replace(/["'’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  /* ---------- init / seeding ---------- */
  function ensureSeed() {
    if (!read(LS.catalog)) write(LS.catalog, { categories: SEED_CATEGORIES, products: SEED_PRODUCTS });
    if (!read(LS.users)) write(LS.users, SEED_USERS);
    if (!read(LS.orders)) write(LS.orders, seedOrders());
    if (!read(LS.cart)) write(LS.cart, []);
    if (!read(LS.seq)) write(LS.seq, 1043);
  }

  function seedOrders() {
    // one historical order for the demo customer so the dashboard isn't empty
    return [{
      id: 'ANZ-1042',
      userId: 'u_cust',
      customer: { name: 'Priya Sharma', email: 'customer@ananya.com', phone: '+91 98765 43210' },
      shipping: { address: '12, Anna Nagar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600040' },
      items: [
        { id: 'p6', name: 'Traditional Brass Deepam / Diya (Set of 2)', price: 999, qty: 2, image: 'img/cat-lamp.png' },
        { id: 'p12', name: 'Sowbhagya Instant Rice Cooker 1.8L', price: 2199, qty: 1, image: 'img/cat-sowbhagya.png' },
      ],
      subtotal: 4197, shipping_fee: 0, total: 4197,
      payment: 'Cash on Delivery', status: 'delivered', placedAt: '2026-06-18T10:20:00Z',
    }];
  }

  function nextSeq() { const n = (read(LS.seq, 1043) + 1); write(LS.seq, n); return n; }

  /* ---------- catalog ---------- */
  const catalog = {
    all() { return read(LS.catalog, { categories: [], products: [] }); },
    save(c) { write(LS.catalog, c); },
    categories() { return this.all().categories; },
    products() { return this.all().products; },
    categoryBySlug(s) { return this.categories().find(c => c.slug === s); },
    categoryById(id) { return this.categories().find(c => c.id === id); },
    productById(id) { return this.products().find(p => p.id === id); },
    productBySlug(s) { return this.products().find(p => p.slug === s); },
    byCategory(id) { return this.products().filter(p => p.categoryId === id); },
    search(q) {
      q = (q || '').trim().toLowerCase();
      if (!q) return this.products();
      return this.products().filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (this.categoryById(p.categoryId)?.name.toLowerCase().includes(q)));
    },
    effectivePrice(p) { return (p.salePrice != null && p.salePrice < p.price) ? p.salePrice : p.price; },
    // admin mutations
    upsertProduct(prod) {
      const c = this.all();
      const i = c.products.findIndex(p => p.id === prod.id);
      if (i >= 0) c.products[i] = prod; else c.products.unshift(prod);
      this.save(c);
    },
    deleteProduct(id) { const c = this.all(); c.products = c.products.filter(p => p.id !== id); this.save(c); },
    upsertCategory(cat) {
      const c = this.all();
      const i = c.categories.findIndex(x => x.id === cat.id);
      if (i >= 0) c.categories[i] = cat; else c.categories.push(cat);
      this.save(c);
    },
    deleteCategory(id) { const c = this.all(); c.categories = c.categories.filter(x => x.id !== id); this.save(c); },
    newId(prefix) { return prefix + '_' + Math.abs(hashStr(prefix + read(LS.seq, 1) + JSON.stringify(this.products().length))).toString(36) + nextSeq().toString(36); },
  };

  function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; } return h; }

  /* ---------- cart ---------- */
  const cart = {
    items() { return read(LS.cart, []); },
    count() { return this.items().reduce((n, i) => n + i.qty, 0); },
    add(id, qty) {
      qty = Math.max(1, qty || 1);
      const items = this.items();
      const ex = items.find(i => i.id === id);
      const p = catalog.productById(id);
      if (!p) return;
      const max = p.stock;
      if (ex) ex.qty = Math.min(max, ex.qty + qty);
      else items.push({ id, qty: Math.min(max, qty) });
      write(LS.cart, items);
      refreshBadges();
    },
    setQty(id, qty) {
      const items = this.items();
      const it = items.find(i => i.id === id);
      if (!it) return;
      const p = catalog.productById(id);
      it.qty = Math.max(1, Math.min(p ? p.stock : qty, qty));
      write(LS.cart, items);
      refreshBadges();
    },
    remove(id) { write(LS.cart, this.items().filter(i => i.id !== id)); refreshBadges(); },
    clear() { write(LS.cart, []); refreshBadges(); },
    detailed() {
      return this.items().map(i => {
        const p = catalog.productById(i.id);
        if (!p) return null;
        const price = catalog.effectivePrice(p);
        return { id: p.id, name: p.name, image: p.images[0], price, qty: i.qty, line: price * i.qty, stock: p.stock, slug: p.slug };
      }).filter(Boolean);
    },
    subtotal() { return this.detailed().reduce((s, i) => s + i.line, 0); },
    shippingFee() { const s = this.subtotal(); return s === 0 || s >= 2000 ? 0 : 99; },
    total() { return this.subtotal() + this.shippingFee(); },
  };

  /* ---------- auth ---------- */
  const auth = {
    users() { return read(LS.users, []); },
    saveUsers(u) { write(LS.users, u); },
    current() { const id = read(LS.session); return id ? this.users().find(u => u.id === id) || null : null; },
    isAdmin() { const u = this.current(); return !!u && u.role === 'admin'; },
    login(email, password) {
      const u = this.users().find(x => x.email.toLowerCase() === String(email).toLowerCase() && x.password === password);
      if (!u) return { ok: false, error: 'Invalid email or password.' };
      write(LS.session, u.id); return { ok: true, user: u };
    },
    register({ name, email, password }) {
      const users = this.users();
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) return { ok: false, error: 'An account with this email already exists.' };
      const u = { id: 'u_' + nextSeq().toString(36), name, email, password, role: 'customer', phone: '', address: '' };
      users.push(u); this.saveUsers(users); write(LS.session, u.id); return { ok: true, user: u };
    },
    logout() { localStorage.removeItem(LS.session); },
    updateProfile(patch) {
      const users = this.users(); const cur = this.current(); if (!cur) return;
      Object.assign(cur, patch);
      const i = users.findIndex(u => u.id === cur.id); users[i] = cur; this.saveUsers(users);
    },
  };

  /* ---------- orders ---------- */
  const STATUS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const orders = {
    all() { return read(LS.orders, []); },
    save(o) { write(LS.orders, o); },
    forUser(uid) { return this.all().filter(o => o.userId === uid).sort((a, b) => b.placedAt.localeCompare(a.placedAt)); },
    byId(id) { return this.all().find(o => o.id === id); },
    create(order) { const all = this.all(); all.push(order); this.save(all); return order; },
    updateStatus(id, status, note) {
      const all = this.all(); const o = all.find(x => x.id === id);
      if (o) {
        const prev = o.status;
        o.status = status;
        o.history = o.history || [];
        o.history.push({ from: prev, to: status, note: note || '', at: nowISO() });
        o.updatedAt = nowISO();
        this.save(all);
        return { order: o, prev };
      }
      return null;
    },
    statuses() { return STATUS.slice(); },
  };

  /* ---------- helpers ---------- */
  const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');
  const qs = k => new URLSearchParams(location.search).get(k);
  const STATUS_STYLE = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
  };
  function fmtDate(iso) {
    try { const d = new Date(iso); return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch (e) { return iso; }
  }
  function fmtDateTime(iso) {
    try { return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return iso; }
  }
  function nowISO() { try { return new Date().toISOString(); } catch (e) { return '2026-07-10T00:00:00Z'; } }
  const titleCase = s => String(s || '').replace(/\b\w/g, c => c.toUpperCase());

  /* ---------- brand / logo ---------- */
  const brand = {
    logo() { return read(LS.logo, null); },
    setLogo(url) { if (url) write(LS.logo, url); else localStorage.removeItem(LS.logo); },
  };
  // Returns an <img> of the uploaded logo, or the supplied fallback markup (monogram + wordmark).
  function brandLockup(fallbackHTML, size) {
    const l = brand.logo();
    return l ? `<img src="${l}" alt="Ananya" data-logo style="height:${size || 52}px;width:auto;max-width:${(size || 52) * 3.4}px;object-fit:contain">` : fallbackHTML;
  }

  /* ---------- email notification templates ---------- */
  const EMAIL_DEFAULTS = { enabled: false, publicKey: '', serviceId: '', templateId: '', adminEmail: 'admin@ananya.com', adminName: 'Ananya Store Admin', fromName: 'Ananya' };

  function emailShell(heading, bodyHTML) {
    return `<div style="font-family:Poppins,Arial,sans-serif;max-width:600px;margin:0 auto;background:#faf5ec;border:1px solid #e7d4a3;border-radius:12px;overflow:hidden">
      <div style="background:#5c1616;color:#faf5ec;padding:20px 28px">
        <span style="display:inline-block;width:32px;height:32px;border:1px solid #d9b969;border-radius:50%;text-align:center;line-height:32px;color:#d9b969;font-family:Georgia,serif;font-weight:bold;vertical-align:middle">A</span>
        <span style="font-family:Georgia,serif;font-size:20px;letter-spacing:3px;vertical-align:middle;margin-left:8px">ANANYA</span>
      </div>
      <div style="padding:26px 28px">
        <h2 style="font-family:Georgia,serif;color:#5c1616;margin:0 0 14px;font-size:20px">${heading}</h2>
        ${bodyHTML}
      </div>
      <div style="background:#f2e8d6;color:#8a7a5c;padding:14px 28px;font-size:12px;text-align:center">Ananya — Where Tradition Meets Excellence · Authorized agent of Sowbhagya</div>
    </div>`;
  }
  function infoRow(label, val) { return `<p style="margin:3px 0;font-size:14px;color:#4b4b4b"><span style="color:#a08a5c">${label}:</span> <strong style="color:#5c1616">${val}</strong></p>`; }
  function orderItemsTable(o) {
    const rows = o.items.map(i => `<tr><td style="padding:6px 0;border-bottom:1px solid #eadfc4;color:#5c1616;font-size:14px">${esc(i.name)} <span style="color:#a08a5c">× ${i.qty}</span></td><td style="padding:6px 0;border-bottom:1px solid #eadfc4;text-align:right;color:#5c1616;font-size:14px;white-space:nowrap">${money(i.price * i.qty)}</td></tr>`).join('');
    return `<table style="width:100%;border-collapse:collapse;margin:8px 0 4px">${rows}
      <tr><td style="padding-top:10px;text-align:right;color:#5c1616;font-weight:bold">Total</td><td style="padding-top:10px;text-align:right;color:#5c1616;font-weight:bold;white-space:nowrap">${money(o.total)}</td></tr></table>`;
  }
  function buildOrderEmail(o, audience, at) {
    const forAdmin = audience === 'admin';
    const addr = `${esc(o.shipping.address)}, ${esc(o.shipping.city)}, ${esc(o.shipping.state)} - ${esc(o.shipping.pincode)}`;
    const heading = forAdmin ? 'New Order Received' : 'Your order is confirmed';
    const intro = forAdmin
      ? `<p style="font-size:14px;color:#4b4b4b">A new order has just been placed on the Ananya store.</p>`
      : `<p style="font-size:14px;color:#4b4b4b">Hi ${esc((o.customer.name || 'there').split(' ')[0])}, thank you for shopping with Ananya! We've received your order and it is now being processed.</p>`;
    const body = `${intro}
      <div style="background:#fff;border:1px solid #e7d4a3;border-radius:10px;padding:16px;margin:14px 0">
        ${infoRow('Order Number', '#' + o.id)}
        ${infoRow('Customer', esc(o.customer.name))}
        ${infoRow('Order Date', fmtDateTime(at))}
        ${infoRow('Payment', esc(o.payment))}
        ${infoRow('Current Status', titleCase(o.status))}
        ${forAdmin ? infoRow('Contact', esc(o.customer.email) + ' · ' + esc(o.customer.phone)) : ''}
      </div>
      <h3 style="font-family:Georgia,serif;color:#5c1616;font-size:16px;margin:16px 0 4px">Order Summary</h3>
      ${orderItemsTable(o)}
      <div style="margin-top:16px">${infoRow('Shipping To', addr)}</div>
      ${forAdmin
        ? `<p style="margin-top:18px"><a href="admin.html?tab=orders&order=${o.id}" style="background:#5c1616;color:#faf5ec;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:13px;display:inline-block">Manage Order</a></p>`
        : `<p style="margin-top:18px;font-size:13px;color:#8a7a5c">You can track your order anytime from your account dashboard. We'll email you as the status changes.</p>`}`;
    const subject = forAdmin ? `New order ${o.id} — ${money(o.total)}` : `Your Ananya order ${o.id} is confirmed`;
    const text = `${heading}\nOrder Number: ${o.id}\nCustomer: ${o.customer.name}\nOrder Date: ${fmtDateTime(at)}\nTotal: ${money(o.total)}\nStatus: ${titleCase(o.status)}\n\nItems:\n${o.items.map(i => `- ${i.name} x${i.qty} = ${money(i.price * i.qty)}`).join('\n')}\n\nShip to: ${o.shipping.address}, ${o.shipping.city}, ${o.shipping.state} - ${o.shipping.pincode}`;
    return { subject, html: emailShell(heading, body), text };
  }
  function buildStatusEmail(o, prev, next, note, audience, at) {
    const forAdmin = audience === 'admin';
    const heading = forAdmin ? 'Order Status Updated' : `Update on your order ${o.id}`;
    const intro = forAdmin
      ? `<p style="font-size:14px;color:#4b4b4b">The status of order #${o.id} has been changed.</p>`
      : `<p style="font-size:14px;color:#4b4b4b">Hi ${esc((o.customer.name || 'there').split(' ')[0])}, there's an update on your Ananya order.</p>`;
    const body = `${intro}
      <div style="background:#fff;border:1px solid #e7d4a3;border-radius:10px;padding:16px;margin:14px 0">
        ${infoRow('Order Number', '#' + o.id)}
        <p style="margin:8px 0;font-size:15px"><span style="color:#a08a5c">Status:</span> <span style="text-decoration:line-through;color:#a08a5c">${titleCase(prev)}</span> &nbsp;→&nbsp; <strong style="color:#5c1616">${titleCase(next)}</strong></p>
        ${infoRow('Date &amp; Time', fmtDateTime(at))}
        ${note ? infoRow('Remarks', esc(note)) : ''}
      </div>
      <h3 style="font-family:Georgia,serif;color:#5c1616;font-size:16px;margin:16px 0 4px">Order Summary</h3>
      ${orderItemsTable(o)}
      ${forAdmin ? '' : `<p style="margin-top:18px;font-size:13px;color:#8a7a5c">Track your order anytime from your account dashboard.</p>`}`;
    const subject = forAdmin ? `Order ${o.id}: ${titleCase(prev)} → ${titleCase(next)}` : `Your Ananya order ${o.id} is now ${titleCase(next)}`;
    const text = `${heading}\nOrder Number: ${o.id}\nPrevious Status: ${titleCase(prev)}\nNew Status: ${titleCase(next)}\nDate & Time: ${fmtDateTime(at)}${note ? `\nRemarks: ${note}` : ''}\nTotal: ${money(o.total)}`;
    return { subject, html: emailShell(heading, body), text };
  }

  /* ---------- notifications (records every email + optional real send via EmailJS) ---------- */
  const notify = {
    cfg() { return Object.assign({}, EMAIL_DEFAULTS, read(LS.emailcfg, {})); },
    saveCfg(patch) { write(LS.emailcfg, Object.assign(this.cfg(), patch)); },
    ready() { const c = this.cfg(); return !!(c.enabled && c.serviceId && c.templateId && c.publicKey); },
    outbox() { return read(LS.outbox, []); },
    clear() { write(LS.outbox, []); },
    _mark(id, delivery) { const box = this.outbox(); const e = box.find(x => x.id === id); if (e) { e.delivery = delivery; write(LS.outbox, box); } },
    _record(entry) { const box = this.outbox(); box.unshift(entry); write(LS.outbox, box.slice(0, 300)); this._send(entry); },
    _sdk(pk) {
      if (window.emailjs) return Promise.resolve(window.emailjs);
      return new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        s.onload = () => { try { window.emailjs.init({ publicKey: pk }); } catch (e) {} res(window.emailjs); };
        s.onerror = rej; document.head.appendChild(s);
      });
    },
    _send(entry) {
      const c = this.cfg();
      if (!this.ready()) return; // stays 'logged' — recorded in-app but not actually emailed
      this._sdk(c.publicKey).then(ej => ej.send(c.serviceId, c.templateId, {
        to_email: entry.to, to_name: entry.toName, subject: entry.subject,
        message: entry.text, message_html: entry.html, order_id: entry.orderId, from_name: c.fromName,
      }, { publicKey: c.publicKey })).then(() => this._mark(entry.id, 'sent')).catch(() => this._mark(entry.id, 'failed'));
    },
    _entry(o, audience, mail, kind) {
      const c = this.cfg();
      return {
        id: 'em_' + nextSeq().toString(36), orderId: o.id, kind, audience,
        to: audience === 'admin' ? c.adminEmail : o.customer.email,
        toName: audience === 'admin' ? c.adminName : (o.customer.name || ''),
        subject: mail.subject, html: mail.html, text: mail.text, at: nowISO(),
        delivery: this.ready() ? 'sending' : 'logged',
      };
    },
    orderPlaced(o) { const at = nowISO(); ['customer', 'admin'].forEach(a => this._record(this._entry(o, a, buildOrderEmail(o, a, at), 'placed'))); },
    statusChanged(o, prev, next, note) { const at = nowISO(); ['customer', 'admin'].forEach(a => this._record(this._entry(o, a, buildStatusEmail(o, prev, next, note, a, at), 'status'))); },
  };

  function toast(msg, kind) {
    let wrap = document.getElementById('toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.id = 'toast-wrap'; wrap.className = 'fixed top-5 right-5 z-[100] flex flex-col gap-2'; document.body.appendChild(wrap); }
    const t = document.createElement('div');
    const color = kind === 'error' ? 'bg-red-600' : 'bg-maroon';
    t.className = `toast ${color} text-cream text-sm font-medium px-4 py-3 rounded-xl shadow-lg flex items-center gap-2`;
    t.innerHTML = `<svg class="w-4 h-4 text-gold-light" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg><span>${msg}</span>`;
    wrap.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  /* ---------- shared layout ---------- */
  const NAV = [
    { label: 'Kitchen Appliances', slug: 'kitchen-appliances' },
    { label: 'Brass Statues', slug: 'brass-statues' },
    { label: 'Temple Items', slug: 'temple-items' },
    { label: 'Hotel Kitchen', slug: 'hotel-kitchen' },
    { label: 'Sowbhagya Brand', slug: 'sowbhagya' },
    { label: 'Offers', slug: '', extra: 'offers' },
  ];

  function headerHTML() {
    const u = auth.current();
    const cc = cart.count();
    const account = u
      ? `<a href="account.html" class="flex items-center gap-1.5 hover:text-gold-light transition"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>Hi, ${u.name.split(' ')[0]}</a>
         ${u.role === 'admin' ? '<a href="admin.html" class="hover:text-gold-light transition">Admin</a>' : ''}
         <a href="#" data-logout class="hover:text-gold-light transition">Logout</a>`
      : `<a href="login.html" class="flex items-center gap-1.5 hover:text-gold-light transition"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>Login / Register</a>`;

    const navLinks = NAV.map(n => {
      const href = n.extra === 'offers' ? 'shop.html?sale=1' : `shop.html?cat=${n.slug}`;
      return `<a href="${href}" class="py-3.5 text-[13px] font-semibold tracking-wide uppercase text-maroon hover:text-gold-dark transition-colors relative group">
        ${n.label}<span class="absolute left-0 -bottom-px h-0.5 w-0 bg-gold group-hover:w-full transition-all duration-300"></span></a>`;
    }).join('');

    const navLinksMobile = NAV.map(n => {
      const href = n.extra === 'offers' ? 'shop.html?sale=1' : `shop.html?cat=${n.slug}`;
      return `<a href="${href}" class="block px-2 py-2 text-sm font-medium text-maroon hover:text-gold-dark uppercase tracking-wide">${n.label}</a>`;
    }).join('');

    return `
    <div class="bg-maroon-dark text-cream/90 text-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9">
        <div class="flex items-center gap-2">
          <svg class="w-3.5 h-3.5 text-gold-light" fill="currentColor" viewBox="0 0 20 20"><path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v6.114A4.369 4.369 0 005 11c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v3.894A4.37 4.37 0 0015 10c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/></svg>
          <span class="tracking-wide">Welcome to Ananya &ndash; Where Tradition Meets Excellence</span>
        </div>
        <div class="hidden sm:flex items-center gap-5">${account}</div>
      </div>
    </div>
    <header class="bg-cream border-b border-gold/20 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-6 h-24">
          <a href="index.html" class="flex items-center gap-3 shrink-0">
            ${brandLockup(`<span class="relative flex items-center justify-center w-14 h-14 rounded-full border-2 border-gold bg-white shadow-sm">
              <span class="absolute inset-1 rounded-full border border-gold/40"></span>
              <span class="font-serif text-2xl font-bold text-gold-dark">A</span>
            </span>
            <span class="leading-none">
              <span class="block font-serif text-3xl font-bold tracking-[0.2em] text-gold-dark">ANANYA</span>
              <span class="block text-[10px] tracking-[0.35em] text-maroon/70 mt-1 uppercase">Tradition &middot; Quality &middot; Trust</span>
            </span>`, 60)}
          </a>
          <form data-search class="hidden md:flex flex-1 max-w-2xl mx-auto">
            <div class="relative w-full">
              <input type="text" name="q" placeholder="Search for products, categories..." class="w-full pl-5 pr-16 py-3 rounded-full bg-white border border-gold/40 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold shadow-sm">
              <button type="submit" class="absolute right-1.5 top-1/2 -translate-y-1/2 w-11 h-9 rounded-full bg-gold hover:bg-gold-dark text-white flex items-center justify-center transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </button>
            </div>
          </form>
          <div class="flex items-center gap-6 shrink-0">
            <a href="account.html" class="hidden lg:flex items-center gap-2 text-maroon hover:text-gold-dark transition">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              <span class="text-sm font-medium">Account</span>
            </a>
            <a href="cart.html" class="flex items-center gap-2 text-maroon hover:text-gold-dark transition">
              <span class="relative">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
                <span data-cart-badge class="absolute -top-2 -right-2 bg-gold text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">${cc}</span>
              </span>
              <span class="hidden sm:block text-sm font-medium leading-tight">My Cart</span>
            </a>
          </div>
        </div>
      </div>
      <nav class="border-t border-gold/20 bg-cream">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between">
            <div class="hidden md:flex items-center justify-between w-full">${navLinks}</div>
            <button class="md:hidden flex items-center gap-2 py-3 text-maroon font-semibold text-sm" onclick="document.getElementById('mobile-menu').classList.toggle('hidden')">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>Menu
            </button>
          </div>
          <div id="mobile-menu" class="md:hidden hidden pb-3">${navLinksMobile}
            <form data-search class="mt-2 flex"><input name="q" placeholder="Search..." class="field rounded-r-none"><button class="btn-gold rounded-l-none px-4">Go</button></form>
          </div>
        </div>
      </nav>
    </header>`;
  }

  function footerHTML() {
    const cats = catalog.categories().slice(0, 5).map(c => `<li><a href="shop.html?cat=${c.slug}" class="hover:text-gold-light transition">${c.name}</a></li>`).join('');
    return `
    <footer class="bg-maroon-dark text-cream/70 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div class="grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
          <div>
            <h5 class="text-gold-light font-semibold uppercase tracking-wider text-xs mb-4">Shop by Category</h5>
            <ul class="space-y-2.5">${cats}</ul>
          </div>
          <div>
            <h5 class="text-gold-light font-semibold uppercase tracking-wider text-xs mb-4">Customer Service</h5>
            <ul class="space-y-2.5">
              <li><a href="account.html" class="hover:text-gold-light transition">Track Order</a></li>
              <li><a href="#" class="hover:text-gold-light transition">Returns &amp; Refunds</a></li>
              <li><a href="#" class="hover:text-gold-light transition">Shipping Policy</a></li>
              <li><a href="#" class="hover:text-gold-light transition">FAQ's</a></li>
              <li><a href="#" class="hover:text-gold-light transition">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h5 class="text-gold-light font-semibold uppercase tracking-wider text-xs mb-4">Company</h5>
            <ul class="space-y-2.5">
              <li><a href="#" class="hover:text-gold-light transition">About Us</a></li>
              <li><a href="#" class="hover:text-gold-light transition">Our Story</a></li>
              <li><a href="#" class="hover:text-gold-light transition">Careers</a></li>
              <li><a href="#" class="hover:text-gold-light transition">Blog</a></li>
              <li><a href="#" class="hover:text-gold-light transition">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h5 class="text-gold-light font-semibold uppercase tracking-wider text-xs mb-4">Useful Links</h5>
            <ul class="space-y-2.5">
              <li><a href="#" class="hover:text-gold-light transition">Gift Cards &amp; Discounts</a></li>
              <li><a href="#" class="hover:text-gold-light transition">Terms &amp; Conditions</a></li>
              <li><a href="#" class="hover:text-gold-light transition">Bulk &amp; B2B</a></li>
              <li><a href="#" class="hover:text-gold-light transition">Corporate Enquiries</a></li>
            </ul>
          </div>
          <div>
            <h5 class="text-gold-light font-semibold uppercase tracking-wider text-xs mb-4">Follow Us</h5>
            <div class="flex gap-3 mb-6">
              <a href="#" class="w-9 h-9 rounded-full border border-gold/40 flex items-center justify-center text-gold-light hover:bg-gold hover:text-white transition"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898v-2.89h2.54V9.797c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg></a>
              <a href="#" class="w-9 h-9 rounded-full border border-gold/40 flex items-center justify-center text-gold-light hover:bg-gold hover:text-white transition"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
              <a href="#" class="w-9 h-9 rounded-full border border-gold/40 flex items-center justify-center text-gold-light hover:bg-gold hover:text-white transition"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
            </div>
            <h5 class="text-gold-light font-semibold uppercase tracking-wider text-xs mb-3">We Accept</h5>
            <div class="flex flex-wrap gap-2">
              <span class="px-2.5 py-1 rounded bg-cream text-maroon-dark text-[10px] font-bold tracking-wide">VISA</span>
              <span class="px-2.5 py-1 rounded bg-cream text-maroon-dark text-[10px] font-bold tracking-wide">MASTERCARD</span>
              <span class="px-2.5 py-1 rounded bg-cream text-maroon-dark text-[10px] font-bold tracking-wide">RuPay</span>
              <span class="px-2.5 py-1 rounded bg-cream text-maroon-dark text-[10px] font-bold tracking-wide">UPI</span>
            </div>
          </div>
        </div>
      </div>
      <div class="border-t border-gold/15">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-center text-xs text-cream/50">
          &copy; 2026 Ananya. All rights reserved. &nbsp;|&nbsp; Handcrafted with tradition. &nbsp;|&nbsp; Authorized agent of Sowbhagya.
        </div>
      </div>
    </footer>`;
  }

  function refreshBadges() {
    const c = cart.count();
    document.querySelectorAll('[data-cart-badge]').forEach(b => { b.textContent = c; });
  }

  function mountLayout() {
    const h = document.getElementById('site-header');
    const f = document.getElementById('site-footer');
    if (h) h.innerHTML = headerHTML();
    if (f) f.innerHTML = footerHTML();
    // wire search
    document.querySelectorAll('form[data-search]').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const q = form.querySelector('input[name="q"]').value.trim();
        location.href = 'shop.html?q=' + encodeURIComponent(q);
      });
    });
    // wire logout
    document.querySelectorAll('[data-logout]').forEach(a => a.addEventListener('click', e => {
      e.preventDefault(); auth.logout(); toast('Logged out'); setTimeout(() => location.href = 'index.html', 500);
    }));
  }

  /* ---------- product card (reusable) ---------- */
  function productCard(p) {
    const price = catalog.effectivePrice(p);
    const onSale = p.salePrice != null && p.salePrice < p.price;
    const off = onSale ? Math.round((1 - p.salePrice / p.price) * 100) : 0;
    const out = p.stock <= 0;
    return `
    <div class="card group overflow-hidden flex flex-col hover:shadow-lg hover:border-gold/40 transition-all duration-300">
      <a href="product.html?id=${p.id}" class="relative block bg-cream-dark/40 p-5 h-52 flex items-center justify-center">
        <img src="${p.images[0]}" alt="${esc(p.name)}" class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300">
        ${onSale ? `<span class="badge bg-maroon text-cream absolute top-3 left-3">${off}% OFF</span>` : ''}
        ${out ? `<span class="badge bg-stone-700 text-white absolute top-3 right-3">Out of stock</span>` : (p.stock <= 5 ? `<span class="badge bg-amber-100 text-amber-700 absolute top-3 right-3">Only ${p.stock} left</span>` : '')}
      </a>
      <div class="p-4 flex flex-col flex-1">
        <span class="text-[11px] uppercase tracking-wide text-gold-dark font-semibold">${esc(catalog.categoryById(p.categoryId)?.name || '')}</span>
        <a href="product.html?id=${p.id}"><h3 class="font-serif text-maroon text-[15px] leading-snug mt-1 mb-2 line-clamp-2 hover:text-gold-dark transition min-h-[2.6rem]">${esc(p.name)}</h3></a>
        <div class="flex items-center gap-1 text-gold-dark text-xs mb-3">
          ${stars(p.rating)}<span class="text-stone-400 ml-1">${p.rating.toFixed(1)}</span>
        </div>
        <div class="mt-auto flex items-end justify-between">
          <div>
            <span class="font-serif text-lg font-bold text-maroon">${money(price)}</span>
            ${onSale ? `<span class="text-xs text-stone-400 line-through ml-1">${money(p.price)}</span>` : ''}
          </div>
          <button data-add="${p.id}" ${out ? 'disabled' : ''} class="w-9 h-9 rounded-full bg-gold hover:bg-gold-dark disabled:opacity-40 text-white flex items-center justify-center transition shrink-0" title="Add to cart">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
          </button>
        </div>
      </div>
    </div>`;
  }

  function stars(r) {
    let out = '';
    for (let i = 1; i <= 5; i++) {
      const fill = i <= Math.round(r) ? 'currentColor' : 'none';
      out += `<svg class="w-3.5 h-3.5" fill="${fill}" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.5l2.02 4.09 4.51.66-3.26 3.18.77 4.5-4.04-2.12-4.03 2.12.77-4.5-3.27-3.18 4.52-.66z"/></svg>`;
    }
    return out;
  }

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  // delegate add-to-cart clicks globally
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-add]');
    if (btn) { cart.add(btn.getAttribute('data-add'), 1); toast('Added to cart'); }
  });

  /* ---------- expose ---------- */
  window.Ananya = {
    catalog, cart, auth, orders, brand, notify,
    money, qs, toast, fmtDate, fmtDateTime, nowISO, titleCase, slugify, esc,
    STATUS_STYLE, productCard, stars, brandLockup,
    mountLayout, refreshBadges,
    requireAuth(role) {
      const u = auth.current();
      if (!u || (role && u.role !== role)) { location.href = 'login.html?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search); return null; }
      return u;
    },
  };

  ensureSeed();
  document.addEventListener('DOMContentLoaded', () => { mountLayout(); if (window.PAGE_INIT) window.PAGE_INIT(); });
})();
