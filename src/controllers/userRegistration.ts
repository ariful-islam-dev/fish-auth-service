import { EMAIL_SERVICE, USER_SERVICE } from "../config";
import prisma from "../prisma";
import { UserCreateDTOSchema } from "../schemas";
import { generateVerificationCode } from "../utils/generateVerificationCode";
import axios from "axios";
import bcrypt from "bcryptjs";

const userRegistration = async (req, res, next) => {
  try {
    // validate the user request body
    const parseBody = UserCreateDTOSchema.safeParse(req.body);
    if (!parseBody.success) {
      return res.status(400).json({
        code: 400,
        message: parseBody.error.errors[0].message,
      });
    }

    // check ith the user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: parseBody.data.email,
      },
    });
    if (existingUser) {
      return res.status(400).json({
        code: 400,
        message: "user already exist",
      });
    }
    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(parseBody.data.password, salt);

    // create the auth user
    const user = await prisma.user.create({
      data: {
        ...parseBody.data,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        verified: true
      },
    });
    //create the user profile by calling the user service
    await axios.post(`${USER_SERVICE}/users`, {
      authUserId: user.id,
      name: user.name,
      email: user.email
    })
    
    // Generate verification code
    const code = generateVerificationCode();
    await prisma.verificationCode.create({
        data:{
            userId: user.id,
            code,
            expiresAt: new Date(Date.now()+1000*60*60*24), //24 hours
        }
    });

    await axios.post(`${EMAIL_SERVICE}/emails/send`, {
        recipient: user.email,
        subject: "Email Verification",
        body: `Your verification is ${code}`,
        source: 'user-registration'
    });

    return res.status(201).json({
        code: 201,
        message: "User created. Check your email for verification code",
        data: user
    })

  } catch (error) {
    next(error);
  }
};


export default userRegistration;