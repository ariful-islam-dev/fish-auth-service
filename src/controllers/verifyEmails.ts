import { EMAIL_SERVICE } from '../config';
import prisma from '../prisma';
import { EmailVerificationSchema } from '../schemas';
import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
const verifyEmail = async(req:Request, res:Response, next:NextFunction)=>{
    try{
        // validate the req body
        const parseBody = EmailVerificationSchema.safeParse(req.body);
        if(!parseBody.success){
            return res.status(400).json({
                code: 400,
                message: parseBody.error.errors[0].message
            });
        }

        // check if the user with email exists
        const user = await prisma.user.findUnique({
            where: {email: parseBody.data.email}
        });

        if(!user){
            return res.status(400).json({
                code: 400,
                message: "User Not Found"
            })
        };

        // find the verification code
        const verificationCode = await prisma.verificationCode.findFirst({
            where:{
                userId: user.id,
                code: parseBody.data.code
            }
        });

        if(!verificationCode){
            return res.status(404).json({ code: 404, message: "Invalid verification code"})

        }

        // if the code has expired 
        if(verificationCode.expiresAt < new Date()){
            return res.status(400).json({
                code: 400,
                message: "Verification Code Expired"
            });

        }

        // update user status to verified
        await prisma.user.update({
            where: {id: user.id},
            data: {
                verified: true,
                status: "ACTIVE"
            }
        })

        // update verification status code
        await prisma.verificationCode.update({
            where: {id: verificationCode.id},
            data: {status:"USED", verifiedAt: new Date()}
        })

        // Send Success Email
        await axios.post(`${EMAIL_SERVICE}/emails/send`, {
            recipient: user.email,
            subject:"Email Verified",
            body:"Your email has been verified successfully",
            source: "verify-email"
        });

        return res.status(200).json({
            code: 200,
            message: "Email Verified Successfully"
        })
    }catch(err){
        next(err)
    }
}

export default verifyEmail