export type Product = {
    id: string;
    name: string;
    kind: 'game' | 'source';
    tag: string;
    description: string;
    image: string;
    priceCents: number;
    demo: boolean;
    published: boolean;
    stock: number;
    createdAt: number;
};
export type Me = {
    authenticated: boolean;
    registered: boolean;
    userId?: string;
    displayName?: string;
    email?: string;
    method?: string;
    emailVerified?: boolean;
    avatarUrl?: string;
    admin?: boolean;
    interests?: string[];
    applications?: {
        id: string;
        status: string;
        shopName: string;
    }[];
    unread?: number;
};
export type StoreOrder = {
    id: string;
    user_id: string;
    product_id: string;
    product_name: string;
    price_cents: number;
    status: 'pending' | 'paid' | 'cancelled';
    created_at: number;
    delivery?: string;
    customer?: string;
};
export type Ticket = {
    id: string;
    userId?: string;
    email: string;
    category: string;
    subject: string;
    message: string;
    status: string;
    createdAt: number;
    replies?: {
        id: string;
        message: string;
        created_at: number;
    }[];
};
export const statusLabel = (status: string) => ({ pending: 'รอตรวจสอบ', paid: 'ชำระเงินแล้ว', cancelled: 'ยกเลิก', approved: 'อนุมัติแล้ว', rejected: 'ไม่ผ่านการพิจารณา', superseded: 'แทนที่ด้วยใบสมัครใหม่', open: 'รอการตอบกลับ', closed: 'ปิดเรื่องแล้ว', answered: 'ตอบกลับแล้ว' }[status] || status);
export const money = (n: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 2 }).format(n / 100);
