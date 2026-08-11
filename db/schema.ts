import { sql } from "drizzle-orm";
import { check, index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const departments = sqliteTable("departments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull().unique(),
  region: text("region").notNull().default("National Capital Region"),
  slaDays: integer("sla_days").notNull().default(7),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  externalId: text("external_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  role: text("role").notNull().default("citizen"),
  departmentId: integer("department_id").references(() => departments.id),
  createdAt: text("created_at").notNull(),
});

export const complaints = sqliteTable("complaints", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  trackingId: text("tracking_id").notNull().unique(),
  citizenId: integer("citizen_id").notNull().references(() => users.id),
  category: text("category").notNull(),
  departmentId: integer("department_id").notNull().references(() => departments.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  locationText: text("location_text").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  status: text("status").notNull().default("submitted"),
  priority: text("priority").notNull().default("medium"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  resolvedAt: text("resolved_at"),
  slaDueAt: text("sla_due_at").notNull(),
}, (table) => [
  index("idx_complaints_citizen").on(table.citizenId),
  index("idx_complaints_department_status").on(table.departmentId, table.status),
  index("idx_complaints_resolved_public").on(table.status, table.resolvedAt).where(sql`${table.status} = 'resolved'`),
]);

export const complaintAttachments = sqliteTable("complaint_attachments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  complaintId: integer("complaint_id").notNull().references(() => complaints.id),
  objectKey: text("object_key").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull().default("image"),
  uploadedBy: integer("uploaded_by").notNull().references(() => users.id),
  uploadedAt: text("uploaded_at").notNull(),
}, (table) => [index("idx_attachments_complaint").on(table.complaintId)]);

export const statusHistory = sqliteTable("status_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  complaintId: integer("complaint_id").notNull().references(() => complaints.id),
  oldStatus: text("old_status"),
  newStatus: text("new_status").notNull(),
  remarks: text("remarks").notNull(),
  changedBy: integer("changed_by").notNull().references(() => users.id),
  changedAt: text("changed_at").notNull(),
}, (table) => [index("idx_history_complaint").on(table.complaintId, table.changedAt)]);

export const emailLogs = sqliteTable("email_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  complaintId: integer("complaint_id").notNull().references(() => complaints.id),
  recipient: text("recipient").notNull(),
  subject: text("subject").notNull(),
  status: text("status").notNull().default("queued"),
  sentAt: text("sent_at").notNull(),
});

export const feedback = sqliteTable("feedback", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  complaintId: integer("complaint_id").notNull().references(() => complaints.id).unique(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  submittedAt: text("submitted_at").notNull(),
}, (table) => [check("rating_between_1_and_5", sql`${table.rating} between 1 and 5`)]);

export const contactMessages = sqliteTable("contact_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  topic: text("topic").notNull(),
  trackingId: text("tracking_id"),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at").notNull(),
}, (table) => [index("idx_contact_messages_created_at").on(table.createdAt)]);
