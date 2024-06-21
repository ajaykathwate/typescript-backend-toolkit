import { InferInsertModel, InferSelectModel, eq } from 'drizzle-orm';
import { db } from '../drizzle/db';
import { RoleType } from '../drizzle/enums';
import { users } from '../drizzle/schema';
import {
  InvalidCredentialseError,
  NotFoundError,
} from '../errors/errors.service';
import {
  ResetPasswordQueue,
  SetPasswordEmailQueue,
} from '../queues/email.queue';
import { UserType } from '../types';
import { createUser } from '../user/user.services';
import {
  generateResetPasswordLink,
  generateSetPasswordLink,
} from '../utils/api.utils';
import {
  JwtPayload,
  PasswordResetTokenPayload,
  SetPasswordTokenPayload,
  compareHash,
  hashPassword,
  signPasswordResetToken,
  signSetPasswordToken,
  signToken,
  verifyToken,
} from '../utils/auth.utils';
import {
  ChangePasswordSchemaType,
  ForgetPasswordSchemaType,
  LoginUserSchemaType,
  RegisterUserSchemaType,
  ResetPasswordSchemaType,
  SetPasswordSchemaType,
} from './auth.schema';

export const setPassword = async (payload: SetPasswordSchemaType) => {
  const user = await db.query.users.findFirst({
    where: eq(users.setPasswordToken, payload.token),
  });

  if (!user) {
    throw new Error('token is not valid or expired, please try again');
  }

  const tokenPayload = await verifyToken<SetPasswordTokenPayload>(
    payload.token,
  );

  if (payload.confirmPassword !== payload.password) {
    throw new Error('Password and confirm password must be same');
  }

  const hashedPassword = await hashPassword(payload.password);

  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, Number(tokenPayload.userId)))
    .execute();
};

export const resetPassword = async (payload: ResetPasswordSchemaType) => {
  const user = await db.query.users.findFirst({
    where: eq(users.passwordResetToken, payload.token),
  });

  if (!user) {
    throw new Error('token is not valid or expired, please try again');
  }

  const tokenPayload = await verifyToken<PasswordResetTokenPayload>(
    payload.token,
  );

  if (payload.confirmPassword !== payload.password) {
    throw new Error('Password and confirm password must be same');
  }

  const hashedPassword = await hashPassword(payload.password);

  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, Number(tokenPayload.userId)))
    .execute();
};

export const prepareSetPasswordAndSendEmail = async (
  user: UserType,
): Promise<void> => {
  const token = await signSetPasswordToken({
    email: user.email,
    userId: String(user.id),
  });

  await db
    .update(users)
    .set({ setPasswordToken: token })
    .where(eq(users.id, user.id))
    .execute();

  await SetPasswordEmailQueue.add(String(user.id), {
    email: String(user.email),
    name: String(user.firstName),
    passwordSetLink: generateSetPasswordLink(token),
  });
};

export const forgetPassword = async (
  payload: ForgetPasswordSchemaType,
): Promise<void> => {
  const user = await db.query.users.findFirst({
    where: eq(users.email, payload.email),
  });

  if (!user) {
    throw new Error("user doesn't exists");
  }

  const token = await signPasswordResetToken({
    email: user.email,
    userId: String(user.id),
  });

  await db
    .update(users)
    .set({ passwordResetToken: token })
    .where(eq(users.id, user.id))
    .execute();

  await ResetPasswordQueue.add(String(user.id), {
    email: user.email,
    userName: user.firstName,
    resetLink: generateResetPasswordLink(token),
  });
};

export const changePassword = async (
  userId: number,
  payload: ChangePasswordSchemaType,
): Promise<void> => {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });

  if (!user) {
    throw new NotFoundError('User is not found');
  }

  const isCurrentPassowordCorrect = await compareHash(
    user.password,
    payload.currentPassword,
  );

  if (!isCurrentPassowordCorrect) {
    throw new Error('current password is not valid');
  }

  const hashedPassword = await hashPassword(payload.newPassword);

  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, userId))
    .execute();
};

export const registerUser = async (
  payload: RegisterUserSchemaType,
): Promise<InferSelectModel<typeof users>> => {
  const user = await createUser({
    email: payload.email,
    dob: payload.dob,
    firstName: payload.firstName,
    lastName: payload.lastName,
    password: payload.password,
    phoneNo: payload.phoneNo,
    phoneCountry: payload.phoneCountry,
  });

  return user;
};

export const loginUser = async (
  payload: LoginUserSchemaType,
): Promise<string> => {
  const user = await db.query.users.findFirst({
    where: eq(users.email, payload.email),
  });

  if (!user || !(await compareHash(String(user.password), payload.password))) {
    throw new InvalidCredentialseError('Invalid email or password');
  }

  if (!user.isActive) {
    throw new Error('Your account is disabled');
  }

  const jwtPayload: JwtPayload = {
    sub: String(user.id),
    email: user.email,
    name: user.firstName,
    role: String(user.role) as RoleType,
  };

  const token = await signToken(jwtPayload);

  return token;
};
