import prisma from '../lib/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
    const {name, email, password } = req.body;

    try {
        const existingUser = await  prisma.user.findUnique({
            where: { email}
        });

        if(existingUser) {
            return  res.status(400).json({ message: "User already exists"});
        }
        
        const hashedPassword = await  bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data:{
                name,
                email,
                password: hashedPassword,

            }


        });

        const token  = jwt.sign({ userId: user.id},
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "strict",
        });

        res.status(201).json({ 
            message: "Account created",
            user :{
                id: user.id,
                name:user.name,
                email: user.email
            }
        });


    } catch (error) {
       console.error("Signup error:", error.message);
       res.status(500).json({ message: "Server errror"}) 
    }

}


export const login = async (req, res) => {
    const { email, password } = req.body;

    try {

        if(!email || !password){
            return res.status(400).json({ message: "All fields are required"});
        }
        
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if(!user){
            return res.status(400).json({ message: "Invalid credentials"});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(400).json({message: "Invalid credentials"});
        }

        const token = jwt.sign({ userId: user.id},
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "strict",
        });

        res.json({
            message: "Logged in successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
}


export const logout =  async (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully"});
};