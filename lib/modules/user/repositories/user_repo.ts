import { safeQuery } from "@/lib/modules/common/safe_query";
import { baseRepo } from "@/lib/modules/common/base_repo";
import { User } from "@/lib/models/user";
import { getCachedUser, cacheUser } from "@/lib/cache/user";

export const userRepo = {
  async getUserById(id: number): Promise<User | null> {
    // Try cache first
    const cachedUser = await getCachedUser(id);
    if (cachedUser) {
      return cachedUser;
    }

    // Fallback to database (use BaseRepo)
    const found = await baseRepo.getById<User>(User, id);
    const user = found ? new User(found) : null;

    // Cache the user if found
    if (user) {
      await cacheUser(user);
    }

    return user;
  },

  async searchByNameOrEmail(query: string): Promise<User[]> {
    const searchPattern = `%${query}%`;

    const sql = `
      SELECT id, name, email, avatar_url, created_at, updated_at
      FROM ${User.table}
      WHERE LOWER(name) LIKE LOWER($1) 
         OR LOWER(email) LIKE LOWER($2)
      ORDER BY 
        CASE 
          WHEN LOWER(name) = LOWER($3) THEN 1
          WHEN LOWER(email) = LOWER($4) THEN 2
          WHEN LOWER(name) LIKE LOWER($5) THEN 3
          WHEN LOWER(email) LIKE LOWER($6) THEN 4
          ELSE 5
        END,
        name ASC
      LIMIT 20
    `;

    const params = [
      searchPattern, // $1 - name LIKE pattern
      searchPattern, // $2 - email LIKE pattern
      query, // $3 - exact name match
      query, // $4 - exact email match
      `${query}%`, // $5 - name starts with
      `${query}%`, // $6 - email starts with
    ];

    const result = await safeQuery(sql, params);
    return result.rows.map((row) => new User(row));
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await baseRepo.getByField<User>(User, "email", email);

    // Cache user if found
    if (user && user.id) {
      await cacheUser(user);
    }

    return user;
  },

  async getAllOrGetById(id?: number): Promise<User | User[] | null> {
    if (id) {
      return await this.getUserById(id);
    } else {
      const sql = `SELECT * FROM ${User.table} ORDER BY created_at DESC`;
      const result = await safeQuery(sql);
      return result.rows.map((row) => new User(row));
    }
  },

  async searchUsersWithConversation(currentUserId: number, query: string): Promise<any[]> {
    const searchPattern = `%${query}%`;

    // Tách từ khóa để tìm kiếm linh hoạt hơn (VD: "nguyễn văn" → ["nguyễn", "văn"])
    const keywords = query.trim().toLowerCase().split(/\s+/);

    let whereConditions = ["LOWER(u.name) LIKE LOWER($3)", "LOWER(u.email) LIKE LOWER($4)"];

    let params = [
      currentUserId, // $1 - current user for conversation check
      currentUserId, // $2 - exclude current user from results
      searchPattern, // $3 - name LIKE pattern
      searchPattern, // $4 - email LIKE pattern
      query, // $5 - exact name match
      query, // $6 - exact email match
      `${query}%`, // $7 - name starts with
      `${query}%`, // $8 - email starts with
    ];

    // Thêm điều kiện tìm kiếm từng từ riêng biệt
    if (keywords.length > 1) {
      const keywordConditions = keywords.map((keyword, index) => {
        params.push(`%${keyword}%`);
        return `LOWER(u.name) LIKE LOWER($${params.length})`;
      });
      whereConditions.push(`(${keywordConditions.join(" AND ")})`);
    }

    const sql = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.avatar_url,
        c.id as conversation_id,
        CASE 
          WHEN c.id IS NOT NULL THEN true
          ELSE false
        END as has_conversation
      FROM ${User.table} u
      LEFT JOIN conversation_participants cp1 ON cp1.user_id = u.id
      LEFT JOIN conversation_participants cp2 ON cp2.conversation_id = cp1.conversation_id 
        AND cp2.user_id = $1
      LEFT JOIN conversations c ON c.id = cp1.conversation_id 
        AND c.is_group = false
      WHERE u.id != $2
        AND (${whereConditions.join(" OR ")})
      ORDER BY 
        has_conversation DESC,
        CASE 
          WHEN LOWER(u.name) = LOWER($5) THEN 1
          WHEN LOWER(u.email) = LOWER($6) THEN 2
          WHEN LOWER(u.name) LIKE LOWER($7) THEN 3
          WHEN LOWER(u.email) LIKE LOWER($8) THEN 4
          ELSE 5
        END,
        u.name ASC
      LIMIT 20
    `;

    const result = await safeQuery(sql, params);

    return result.rows.map((row) => ({
      conversation_id: row.conversation_id,
      is_group: false,
      other_user_id: row.id,
      other_user_name: row.name,
      avatar_url: row.avatar_url,
      other_is_online: false, // TODO: implement online status
      has_conversation: row.has_conversation,
      // Các field để tương thích với MessengerPreview
      name: row.name,
      last_message_content: null,
      last_message_at: null,
      last_message_sender: null,
      unread_count: 0,
    }));
  },

  async searchUsersForGroupInvite(currentUserId: number, query: string, groupId: number): Promise<User[]> {
    const searchPattern = `%${query}%`;

    const sql = `
      SELECT DISTINCT u.id, u.name, u.email, u.avatar_url, u.created_at, u.updated_at
      FROM ${User.table} u
      WHERE u.id != $1
        AND (LOWER(u.name) LIKE LOWER($2) OR LOWER(u.email) LIKE LOWER($3))
        AND u.id NOT IN (
          SELECT gm.user_id 
          FROM group_members gm 
          WHERE gm.group_id = $4
        )
      ORDER BY 
        CASE 
          WHEN LOWER(u.name) = LOWER($5) THEN 1
          WHEN LOWER(u.email) = LOWER($6) THEN 2
          WHEN LOWER(u.name) LIKE LOWER($7) THEN 3
          WHEN LOWER(u.email) LIKE LOWER($8) THEN 4
          ELSE 5
        END,
        u.name ASC
      LIMIT 20
    `;

    const params = [
      currentUserId, // $1 - exclude current user
      searchPattern, // $2 - name LIKE pattern
      searchPattern, // $3 - email LIKE pattern
      groupId, // $4 - group ID to exclude existing members
      query, // $5 - exact name match
      query, // $6 - exact email match
      `${query}%`, // $7 - name starts with
      `${query}%`, // $8 - email starts with
    ];

    const result = await safeQuery(sql, params);
    return result.rows.map((row) => new User(row));
  },
};
