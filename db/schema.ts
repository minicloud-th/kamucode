import { sqliteTable, text, integer, index, primaryKey } from 'drizzle-orm/sqlite-core';
export const members = sqliteTable('members', {
    userId: text('user_id').primaryKey(), email: text('email').notNull(),
    displayName: text('display_name').notNull(),
    partnerInterest: integer('partner_interest', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at').notNull(),
});
export const partnerRequests = sqliteTable('partner_requests', {
    id: text('id').primaryKey(), userId: text('user_id').notNull(),
    shopName: text('shop_name').notNull(), category: text('category').notNull(),
    contact: text('contact').notNull(), message: text('message').notNull(),
    status: text('status').notNull().default('pending'), createdAt: integer('created_at').notNull(),
}, table => [index('partner_requests_user_idx').on(table.userId)]);
export const productInterests = sqliteTable('product_interests', {
    id: text('id').primaryKey(), userId: text('user_id').notNull(),
    productId: text('product_id').notNull(), createdAt: integer('created_at').notNull(),
}, table => [index('product_interests_user_idx').on(table.userId)]);
// Authentication tables are additive. Existing native-account records are retained.
export const authUser = sqliteTable('auth_user', {
    id: text('id').primaryKey(), name: text('name').notNull(),
    email: text('email').notNull().unique(), emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
    image: text('image'), createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});
export const authSession = sqliteTable('auth_session', {
    id: text('id').primaryKey(), token: text('token').notNull().unique(), userId: text('user_id').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(), createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(), ipAddress: text('ip_address'), userAgent: text('user_agent'),
}, table => [index('auth_session_user_idx').on(table.userId)]);
export const authAccount = sqliteTable('auth_account', {
    id: text('id').primaryKey(), accountId: text('account_id').notNull(), providerId: text('provider_id').notNull(), userId: text('user_id').notNull(),
    accessToken: text('access_token'), refreshToken: text('refresh_token'), idToken: text('id_token'), scope: text('scope'), password: text('password'),
    accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp_ms' }), refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(), updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
}, table => [index('auth_account_user_idx').on(table.userId)]);
export const authVerification = sqliteTable('auth_verification', {
    id: text('id').primaryKey(), identifier: text('identifier').notNull(), value: text('value').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(), createdAt: integer('created_at', { mode: 'timestamp_ms' }), updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
}, table => [index('auth_verification_identifier_idx').on(table.identifier)]);
export const authRateLimit = sqliteTable('auth_rate_limit', {
    id: text('id').primaryKey(), key: text('key').notNull().unique(), count: integer('count').notNull(), lastRequest: integer('last_request').notNull(),
});
export const supportTickets = sqliteTable('support_tickets', {
    id: text('id').primaryKey(), userId: text('user_id').notNull(), email: text('email').notNull(),
    category: text('category').notNull(), subject: text('subject').notNull(), message: text('message').notNull(),
    status: text('status').notNull().default('open'), createdAt: integer('created_at').notNull(),
}, table => [index('support_ticket_user_idx').on(table.userId)]);
export const storeProducts = sqliteTable('store_products', { id: text('id').primaryKey(), name: text('name').notNull(), kind: text('kind').notNull(), tag: text('tag').notNull(), description: text('description').notNull(), image: text('image').notNull(), priceCents: integer('price_cents').notNull().default(0), demo: integer('demo', { mode: 'boolean' }).notNull().default(true), published: integer('published', { mode: 'boolean' }).notNull().default(false), createdAt: integer('created_at').notNull() });
export const storeOrders = sqliteTable('store_orders', { id: text('id').primaryKey(), userId: text('user_id').notNull(), productId: text('product_id').notNull(), productName: text('product_name').notNull(), priceCents: integer('price_cents').notNull(), status: text('status').notNull().default('pending'), createdAt: integer('created_at').notNull() }, t => [index('store_orders_owner').on(t.userId, t.createdAt)]);
export const storeInventory = sqliteTable('store_inventory', { id: text('id').primaryKey(), productId: text('product_id').notNull(), deliveryCipher: text('delivery_cipher').notNull(), orderId: text('order_id').unique(), createdAt: integer('created_at').notNull() }, t => [index('store_inventory_available').on(t.productId, t.orderId)]);
export const storeCart = sqliteTable('store_cart', { userId: text('user_id').notNull(), productId: text('product_id').notNull(), createdAt: integer('created_at').notNull() }, t => [primaryKey({ columns: [t.userId, t.productId] })]);
export const storeSettings = sqliteTable('store_settings', { key: text('key').primaryKey(), value: text('value').notNull() });
export const storeNotifications = sqliteTable('store_notifications', { id: text('id').primaryKey(), userId: text('user_id').notNull(), title: text('title').notNull(), body: text('body').notNull(), href: text('href').notNull(), isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false), createdAt: integer('created_at').notNull() }, t => [index('store_notifications_owner').on(t.userId, t.createdAt)]);
export const memberAvatars = sqliteTable('member_avatars', { userId: text('user_id').primaryKey(), data: text('data').notNull(), mime: text('mime').notNull(), updatedAt: integer('updated_at').notNull() });
export const supportReplies = sqliteTable('support_replies', { id: text('id').primaryKey(), ticketId: text('ticket_id').notNull(), authorId: text('author_id').notNull(), message: text('message').notNull(), createdAt: integer('created_at').notNull() }, t => [index('support_replies_ticket').on(t.ticketId, t.createdAt)]);
export const requestLimits = sqliteTable('request_limits', { key: text('key').primaryKey(), count: integer('count').notNull(), expiresAt: integer('expires_at').notNull() });
