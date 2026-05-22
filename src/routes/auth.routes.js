const { PrismaClient } = require('../../prisma/generated/prisma');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const {Router} = require('express');


const saltRounds = 10;
const router = Router();
const prisma = new PrismaClient();

router.post('/signup', async (req, res) => {
    try{
        const { email, password, name } = req.body;
if(!email) return res.status(400).json({ error: 'Email is required'});
if(!password) return res.status(400).json({ error: 'password is required'});
if(!name) return res.status(400).json({ error: 'username is required'});

const existingUser = await prisma.auth.findUnique({
    where:{ email }
});

if(existingUser) {
    return res.status(400).json({error: 'User with this email already exists'});
}
const hash = await bcrypt.hash(password, saltRounds);

const register = await prisma.auth.create({
        data: { email, name, password: hash }
    });

    const token = jwt.sign(
        {userId:register.id},
        process.env.JWT_SECRET_KEY,
        {expiresIn: '7d'}
    )
        return res.status(201).json({message:'Signup successful!', userId: register.id, token})
    }catch (error){
        console.error('Error on signup:', error);
        res.status(500).json({error: 'Internal server error'});
    }
});

router.post ('/login', async (req, res) => {
try {
    const { email, password } = req.body;
    const userDetail = await prisma.auth.findUnique({
        where: {email}
    });
    if(!userDetail) { return res.status(404).json({error:`user not found with email ${email}`})}

    const passwordValid = await bcrypt.compare(password, userDetail.password);
    if (!passwordValid) {
        return res.status(401).json({error:'Invalid Password'});
    }

    const token = jwt.sign(
        {userId: userDetail.id},
        process.env.JWT_SECRET_KEY,
        {expiresIn: '7d'}
    )
        res.status(200).json({ token, userId : userDetail.id });
} catch(error) {
    console.log("error on getting login data:", error);
    res.status(500).json({error: 'Failed to fetch user data'});
}
});

module.exports = router