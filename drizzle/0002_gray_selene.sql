CREATE TABLE IF NOT EXISTS store_products (id TEXT PRIMARY KEY, name TEXT NOT NULL, kind TEXT NOT NULL, tag TEXT NOT NULL, description TEXT NOT NULL, image TEXT NOT NULL, price_cents INTEGER NOT NULL DEFAULT 0 CHECK(price_cents>=0), demo INTEGER NOT NULL DEFAULT 1, published INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS store_orders (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,product_id TEXT NOT NULL,product_name TEXT NOT NULL,price_cents INTEGER NOT NULL CHECK(price_cents>0),status TEXT NOT NULL DEFAULT 'pending',created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS store_orders_owner ON store_orders(user_id,created_at);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS store_inventory (id TEXT PRIMARY KEY,product_id TEXT NOT NULL,delivery_cipher TEXT NOT NULL,order_id TEXT UNIQUE,created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS store_inventory_available ON store_inventory(product_id,order_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS store_cart (user_id TEXT NOT NULL,product_id TEXT NOT NULL,created_at INTEGER NOT NULL,PRIMARY KEY(user_id,product_id));
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS store_settings (key TEXT PRIMARY KEY,value TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS store_notifications (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,title TEXT NOT NULL,body TEXT NOT NULL,href TEXT NOT NULL,is_read INTEGER NOT NULL DEFAULT 0,created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS store_notifications_owner ON store_notifications(user_id,created_at);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS member_avatars (user_id TEXT PRIMARY KEY,data TEXT NOT NULL,mime TEXT NOT NULL,updated_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS support_replies (id TEXT PRIMARY KEY,ticket_id TEXT NOT NULL,author_id TEXT NOT NULL,message TEXT NOT NULL,created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS support_replies_ticket ON support_replies(ticket_id,created_at);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS request_limits (key TEXT PRIMARY KEY,count INTEGER NOT NULL,expires_at INTEGER NOT NULL);
--> statement-breakpoint
--> statement-breakpoint
--> statement-breakpoint
