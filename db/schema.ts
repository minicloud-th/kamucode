import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const members = sqliteTable('members', {
  userId: text('user_id').primaryKey(), email: text('email').notNull(),
  displayName: text('display_name').notNull(),
  partnerInterest: integer('partner_interest',{mode:'boolean'}).notNull().default(false),
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
  email: text('email').notNull().unique(), emailVerified: integer('email_verified',{mode:'boolean'}).notNull().default(false),
  image: text('image'), createdAt: integer('created_at',{mode:'timestamp_ms'}).notNull(),
  updatedAt: integer('updated_at',{mode:'timestamp_ms'}).notNull(),
});
export const authSession = sqliteTable('auth_session', {
  id:text('id').primaryKey(), token:text('token').notNull().unique(), userId:text('user_id').notNull(),
  expiresAt:integer('expires_at',{mode:'timestamp_ms'}).notNull(), createdAt:integer('created_at',{mode:'timestamp_ms'}).notNull(),
  updatedAt:integer('updated_at',{mode:'timestamp_ms'}).notNull(), ipAddress:text('ip_address'),userAgent:text('user_agent'),
},table=>[index('auth_session_user_idx').on(table.userId)]);
export const authAccount=sqliteTable('auth_account',{
  id:text('id').primaryKey(),accountId:text('account_id').notNull(),providerId:text('provider_id').notNull(),userId:text('user_id').notNull(),
  accessToken:text('access_token'),refreshToken:text('refresh_token'),idToken:text('id_token'),scope:text('scope'),password:text('password'),
  accessTokenExpiresAt:integer('access_token_expires_at',{mode:'timestamp_ms'}),refreshTokenExpiresAt:integer('refresh_token_expires_at',{mode:'timestamp_ms'}),
  createdAt:integer('created_at',{mode:'timestamp_ms'}).notNull(),updatedAt:integer('updated_at',{mode:'timestamp_ms'}).notNull(),
},table=>[index('auth_account_user_idx').on(table.userId)]);
export const authVerification=sqliteTable('auth_verification',{
  id:text('id').primaryKey(),identifier:text('identifier').notNull(),value:text('value').notNull(),
  expiresAt:integer('expires_at',{mode:'timestamp_ms'}).notNull(),createdAt:integer('created_at',{mode:'timestamp_ms'}),updatedAt:integer('updated_at',{mode:'timestamp_ms'}),
},table=>[index('auth_verification_identifier_idx').on(table.identifier)]);
export const authRateLimit=sqliteTable('auth_rate_limit',{
  id:text('id').primaryKey(),key:text('key').notNull().unique(),count:integer('count').notNull(),lastRequest:integer('last_request').notNull(),
});
export const supportTickets=sqliteTable('support_tickets',{
  id:text('id').primaryKey(),userId:text('user_id').notNull(),email:text('email').notNull(),
  category:text('category').notNull(),subject:text('subject').notNull(),message:text('message').notNull(),
  status:text('status').notNull().default('open'),createdAt:integer('created_at').notNull(),
},table=>[index('support_ticket_user_idx').on(table.userId)]);
