import dotenv from 'dotenv'

dotenv.config()

// 
import express from 'express'
import rateLimit from 'express-rate-limit'
import cache from 'node-cache'

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:false}))

const limiter = rateLimit({
	windowMs: 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Apply the rate limiting middleware to all requests
// app.use(limiter)
let myCache = new cache()

app.get('/',limiter,(req,res)=>{
    try {
        let isinCache = myCache.get('server-check')
        console.log(isinCache)
        if(isinCache){
            console.log('from cache')
            return res.status(200).json(isinCache)
        }
        myCache.set('server-check',{data:"server is running fine.", error:false}, 10 * 60 * 10000 )

        return res.status(200).json({data:"server is running fine.", error:false})
    } catch (error) {
        console.log(error)
        return res.status(500).json({data:"their is error in server,check console", error:true})
    }
})

// auth
import {callbackUrl,getAuthUrl,getOauth,refreshToken} from './config/Auth.js'

app.get('/api/auth/getToken', getAuthUrl)
app.get('/api/auth/callback', callbackUrl)
app.get('/api/auth/getOauth',getOauth)
app.get('/api/auth/refreshToken',refreshToken)

import customerRoute from './routes/customerRoute.js'


app.use('/api/customers/', customerRoute)

let port = process.env.PORT
app.listen(port,()=>{
    console.log(`server running on port ${port}`)
})