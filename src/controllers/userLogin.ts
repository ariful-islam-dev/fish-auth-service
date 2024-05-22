import  bcrypt  from 'bcryptjs';
import prisma from '../prisma';
import { UserLoginDTOSchema } from '../schemas';
import { NextFunction, Request, Response } from 'express';
import { LoginAttempt } from '@prisma/client';
import jwt from 'jsonwebtoken';

const userLogin = async(req:Request, res:Response, next: NextFunction) => {
  try{
    const ipAddress = req.headers["x-forwarded-for"] as string || req.ip || "";
    const userAgent = req.header['user-agent'] || "";

    const parsBody = UserLoginDTOSchema.safeParse(req.body);
    if(!parsBody.success){
        return res.status(400).json({
            code: 400,
            message: parsBody.error.errors[0].message
        })
    }
    // check if the user already exists
    const user = await prisma.user.findUnique({
        where: {
            email: parsBody.data.email
        }
    });

    if(!user){
        return res.status(400).json({code: 400, message: "Invalid credentials"})

    }

    // compare password
    const isMatch = await bcrypt.compare(
        parsBody.data.password,
        user.password
    )

    if(!isMatch){
        await createLoginHistory({
            userId: user.id,
            userAgent,
            ipAddress,
            attempt: "FAILED"
        })
    return res.status(400).json({
        code: 400,
        message: "Invalid credential"
    })
    }

    // check if the user is verified
    if(!user.verified){
        await createLoginHistory({
            userId: user.id,
            userAgent,
            ipAddress,
            attempt: "FAILED"
        });

        return res.status(400).json({
            code: 400,
            message: "user not verified"
        })
    }

    // check if the account is active
    if(user.status !== "ACTIVE"){
        await createLoginHistory({
            userId: user.id,
            userAgent,
            ipAddress,
            attempt: "FAILED"
        })

        return res.status(400).json({
            code: 400,
            message: `Your account is ${user.status.toLocaleLowerCase()}`
        })
    }

    // Generate access token
    const accessToken = jwt.sign(
        {userId:user.id, email:user.email, name:user.name, role:user.role},
        process.env.JWT_SECRETE ?? 'my_secrete_key',
        {expiresIn:"24h"}
    )
    await createLoginHistory({
        userId: user.id,
        userAgent,
        ipAddress,
        attempt:"SUCCESS"
    })
    return res.status(200).json({
        code: 200,
        message: 'Login Successfully',
        accessToken
    })
 }catch(err){
    next(err)
  }
}

type loginHistory = {
    userId: string;
    userAgent: string | undefined;
    ipAddress: string | undefined;
    attempt: LoginAttempt;
}

const createLoginHistory = async(info: loginHistory)=>{
    await prisma.loginHistory.create({
        data:{
            userId: info.userId,
            userAgent: info.userAgent,
            ipAddress: info.ipAddress,
            attempt: info.attempt
        }
    })
}

export default userLogin