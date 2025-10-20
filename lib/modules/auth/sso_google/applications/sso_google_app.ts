import { User, UserInfoSsoGg } from "@/lib/models/user";
import { baseRepo } from "@/lib/modules/common/base_repo";
import { hashPassword } from "@/lib/utils/hash";

export const ssoGoogleApp = {
  async handleAfterSso(userInfo: UserInfoSsoGg): Promise<User> {
    // check exits
    const user = await baseRepo.getByField<User>(User, User.columns.email, userInfo.email);

    if (user) {
      user.is_sso = true; // Đánh dấu là user SSO
      user.avatar_url = userInfo.picture || user.avatar_url;
      user.name = userInfo.name || user.name; // Cập nhật tên nếu có
      user.sub = userInfo.sub || user.sub; // Cập nhật sub
      user.last_login_at = new Date().toISOString(); // Cập nhật last login
      const updateUser = await baseRepo.update(user);
      updateUser!.password_hash = ""; // Clear password for security
      return updateUser as User; // Trả về user đã cập nhật
    }

    // Tạo user mới từ SSO
    const newUserData = {
      email: userInfo.email,
      name: userInfo.name,
      sub: userInfo.sub,
      avatar_url: userInfo.picture,
      email_verified: userInfo.verified_email || false,
      provider: "google",
      provider_id: userInfo.sub,
      is_active: true,
      is_sso: true,
      password_hash: await hashPassword(userInfo.email + "2025"), // Generate secure password
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: new Date().toISOString(),
    };

    const newUser = new User(newUserData);
    const rs = await baseRepo.insert(newUser);
    return rs;
  },
};
