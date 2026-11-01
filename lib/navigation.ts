export const pageLinks = [
    ['/shop', 'หน้าหลัก'], ['/games', 'ไอดีเกม'], ['/source-code', 'ซอร์สโค้ด'], ['/collections', 'คอลเลกชัน'], ['/saved', 'รายการบันทึก'], ['/cart', 'ตะกร้าสินค้า'], ['/orders', 'คำสั่งซื้อ'], ['/downloads', 'สินค้าของฉัน'], ['/notifications', 'การแจ้งเตือน'], ['/partners', 'พาร์ทเนอร์'], ['/partners/apply', 'สมัครพาร์ทเนอร์'], ['/partners/dashboard', 'สถานะพาร์ทเนอร์'], ['/account', 'บัญชีของฉัน'], ['/account/security', 'ความปลอดภัยบัญชี'], ['/support', 'ศูนย์ช่วยเหลือ'], ['/support/tickets', 'เรื่องติดต่อของฉัน'], ['/faq', 'คำถามที่พบบ่อย'], ['/about', 'เกี่ยวกับร้าน'], ['/contact', 'ติดต่อเรา'], ['/how-it-works', 'วิธีใช้งาน'], ['/showcase', 'ภาพและวิดีโอ'], ['/privacy', 'ความเป็นส่วนตัว'], ['/terms', 'ข้อกำหนดการใช้งาน'], ['/security', 'ความปลอดภัย'], ['/sitemap', 'แผนผังเว็บไซต์'], ['/login', 'เข้าสู่ระบบ'], ['/signup', 'สมัครสมาชิก'], ['/forgot-password', 'กู้คืนบัญชี'], ['/admin', 'จัดการร้าน'], ['/admin/products', 'จัดการสินค้า'], ['/admin/orders', 'ตรวจคำสั่งซื้อ'], ['/admin/support', 'ตอบเรื่องติดต่อ'], ['/admin/partners', 'ตรวจพาร์ทเนอร์'], ['/admin/settings', 'ตั้งค่าร้าน'],
] as const;
export function safeNextPath(value: unknown, fallback = '/shop'): string {
    if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\'))
        return fallback;
    try {
        const u = new URL(value, 'https://local.invalid');
        if (u.origin !== 'https://local.invalid')
            return fallback;
        const path = u.pathname.replace(/\/$/, '') || '/';
        const allowed = pageLinks.some(([p]) => p === path && !['/login', '/signup', '/forgot-password'].includes(p)) || /^\/(product|orders|support\/tickets)\/[a-zA-Z0-9-]+$/.test(path);
        return allowed ? path + u.search : fallback;
    }
    catch {
        return fallback;
    }
}
