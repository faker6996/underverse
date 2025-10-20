import { BaseRepo } from "@/lib/modules/common/base_repo";
import { RefreshToken } from "@/lib/models/refresh_token";
import { createHash } from "crypto";
import { safeQuery } from "@/lib/modules/common/safe_query";

class RefreshTokenRepository extends BaseRepo {
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async create(userId: number, token: string, expiresAt: Date): Promise<RefreshToken> {
    const tokenHash = this.hashToken(token);
    
    const refreshToken = new RefreshToken({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
      is_revoked: false
    });

    return await this.insert(refreshToken);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const tokenHash = this.hashToken(token);
    
    const result = await safeQuery(
      `SELECT * FROM ${RefreshToken.table} 
       WHERE token_hash = $1 AND expires_at > NOW() AND (is_revoked = FALSE OR is_revoked IS NULL)`,
      [tokenHash]
    );

    return result.rows.length > 0 ? new RefreshToken(result.rows[0]) : null;
  }

  async updateLastUsed(tokenId: number): Promise<RefreshToken | null> {
    const updated = await this.update<RefreshToken>(new RefreshToken({ id: tokenId, last_used_at: new Date().toISOString() }));
    return updated ? new RefreshToken(updated) : null;
  }

  async revokeToken(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    
    await safeQuery(
      `UPDATE ${RefreshToken.table} 
       SET is_revoked = TRUE 
       WHERE token_hash = $1`,
      [tokenHash]
    );
  }

  async revokeAllUserTokens(userId: number): Promise<void> {
    await safeQuery(
      `UPDATE ${RefreshToken.table} 
       SET is_revoked = TRUE 
       WHERE user_id = $1`,
      [userId]
    );
  }

  async findActiveTokensByUserId(userId: number): Promise<RefreshToken[]> {
    return await this.findManyByFields(RefreshToken, {
      user_id: userId,
      is_revoked: false
    }, {
      orderBy: ['created_at'],
      orderDirections: { created_at: 'DESC' },
      allowedOrderFields: ['created_at', 'last_used_at', 'id']
    });
  }

  async getAllTokens(): Promise<RefreshToken[]> {
    return await this.getAll(RefreshToken, {
      orderBy: ['created_at'],
      orderDirections: { created_at: 'DESC' },
      allowedOrderFields: ['created_at', 'last_used_at', 'expires_at', 'id']
    });
  }

  async getTokenById(id: number): Promise<RefreshToken | null> {
    return await this.getById(RefreshToken, id);
  }

  async deleteTokenById(id: number): Promise<void> {
    return await this.deleteById(RefreshToken, id);
  }

  async getUserTokenCount(userId: number): Promise<number> {
    // Use BaseRepo countWhere for complex condition (expires_at > NOW())
    return await this.countWhere(RefreshToken, `user_id = $1 AND (is_revoked = FALSE OR is_revoked IS NULL) AND expires_at > NOW()`, [userId]);
  }

  async cleanupExpiredTokens(): Promise<number> {
    const result = await safeQuery(
      `DELETE FROM ${RefreshToken.table} 
       WHERE expires_at < NOW() OR is_revoked = TRUE`
    );
    
    return result.rowCount ?? 0;
  }

  // Batch operations using BaseRepo
  async revokeMultipleTokens(tokenIds: number[]): Promise<void> {
    if (tokenIds.length === 0) return;
    await this.updateWhereIn(RefreshToken, { is_revoked: true }, 'id', tokenIds);
  }
}

export const refreshTokenRepo = new RefreshTokenRepository();
