import jwt  from 'jsonwebtoken';
import { AccessTokenDTOSchema } from '@/schemas';
import { NextFunction, Request, Response } from 'express';
import prisma from '@/prisma';
const verifyToken = async(req:Request, res:Response, next:NextFunction)=>{
    try {
        // validate the request body
        const parseBody = AccessTokenDTOSchema.safeParse(req.body);
        if(!parseBody.success){
            return res.status(400).json({
                code: 400,
                message: parseBody.error.errors[0].message
            })
        };
        const {accessToken}= parseBody.data;

        const decoded = jwt.verify(accessToken, process.env.JWT_SECRETE as string);
        const user = await prisma.user.findUnique({
            where: {id: (decoded as any).userId},
            select: {id:true,email:true,name:true,role:true}
        });
        if(!user){
            return res.status(401).json({
                code: 401,
                message:"Unauthorized"
            })
        }
        return res.status(200).json({
            code: 200,
            message: 'Authorized',
            data: user
        })
    } catch (error) {
       next(error) 
    }
}
export default verifyToken;