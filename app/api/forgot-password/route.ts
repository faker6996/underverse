import { NextRequest } from "next/server";
import { sendMail } from "@/lib/utils/send-mail";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { createResponse } from "@/lib/utils/response";
import { ApiError } from "@/lib/utils/error";
import { baseRepo } from "@/lib/modules/common/base_repo";
import { User } from "@/lib/models/user";
import { ResetPasswordToken } from "@/lib/models/password_reset_token";
import { LOCALE } from "@/lib/constants/enum";
import { applyRateLimit, passwordResetRateLimit } from "@/lib/middlewares/auth-rate-limit";

/**
 * @swagger
 * /api/forgot-password:
 *   post:
 *     summary: Request password reset email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, locale]
 *             properties:
 *               email: { type: string, format: email }
 *               locale: { type: string, enum: [vi, en] }
 *     responses:
 *       200: { description: Email sent if user exists }
 *       400: { description: Validation error }
 */
async function handler(req: NextRequest) {
  // Apply rate limiting first
  await applyRateLimit(req, passwordResetRateLimit);
  
  const { email, locale } = await req.json();
  const user = await baseRepo.getByField<User>(User, User.columns.email, email);
  if (!user) throw new ApiError("Không tìm thấy người dùng", 404);

  const token = crypto.randomUUID();

  const resetPasswordToken = new ResetPasswordToken();
  resetPasswordToken.user_id = user.id;
  resetPasswordToken.token = token;
  resetPasswordToken.expires_at = new Date(Date.now() + 30 * 60 * 1000);

  await baseRepo.deleteAll(ResetPasswordToken);
  await baseRepo.insert<ResetPasswordToken>(resetPasswordToken);

  // Lấy locale từ URL
  const resetLink = `${process.env.FRONTEND_URL}/${locale}/reset-password?token=${token}`;

  const emailSubject = "Yêu cầu đặt lại mật khẩu cho tài khoản của bạn";
  const emailHtml = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
  <h2 style="color: #0056b3; text-align: center;">Yêu cầu đặt lại mật khẩu</h2>
  <p>Chào bạn,</p>
  <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Để tiếp tục, vui lòng nhấp vào nút bên dưới.</p>
  <p style="text-align: center; margin: 30px 0;">
    <a href="${resetLink}" style="background-color: #007bff; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Đặt lại mật khẩu</a>
  </p>
  <p>Liên kết này sẽ hết hạn sau <strong>30 phút</strong>.</p>
  <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.</p>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
  <p style="font-size: 0.9em; color: #777;">Nếu bạn gặp vấn đề khi nhấp vào nút, hãy sao chép và dán URL sau vào trình duyệt của bạn:</p>
  <p style="font-size: 0.9em; color: #777; word-break: break-all;">${resetLink}</p>
  <p style="margin-top: 20px;">Trân trọng,<br>Đội ngũ hỗ trợ</p>
</div>
`;

  await sendMail({
    to: email,
    subject: emailSubject,
    html: emailHtml,
  });

  return createResponse(null, "Đã gửi email đặt lại mật khẩu");
}

export const POST = withApiHandler(handler);
