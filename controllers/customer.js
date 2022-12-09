// import axios from 'axios'
// import OAuthClient from 'intuit-oauth'
// // const oauthClient = new OAuthClient({
// //     clientId: process.env.ClientId,
// //     clientSecret: process.env.ClientSceret,
// //     environment: 'sandbox',
// //     redirectUri: 'http://localhost:5000/',
// //     logging: true  
// //   });

// // oauthClient
// //     .createToken('com.intuit.quickbooks.accounting')
// //     .then(function (authResponse) {
// //     console.log('The Token is  ' + JSON.stringify(authResponse.getJson()));
// //     })
// //     .catch(function (e) {
// //     console.error('The error message is :' + e.originalMessage);
// //     console.error(e);
// //     });
// let getToken  = async ()=>{
//     //  basic:QUJudVhleDhhblJJb2NIYlZDZ0FsUXNvVFhxaGlKYTYzbE1vRzB3eHgzcHFQdWRNNmw6Qlh1TFBJcGJEU0RKWWxreWNINFJ1Zm1CMTBQS3Azekw0bUlGT0loUg==
//     const headers = {
//         'Content-Type': 'application/x-www-form-urlencoded',
//         'Authorization': `Basic QUJudVhleDhhblJJb2NIYlZDZ0FsUXNvVFhxaGlKYTYzbE1vRzB3eHgzcHFQdWRNNmw6Qlh1TFBJcGJEU0RKWWxreWNINFJ1Zm1CMTBQS3Azekw0bUlGT0loUg==`,
//         'accept': 'application/json',
//       };
//     let body = new URLSearchParams({
//         grant_type: 'refresh_token',
//         refresh_token: 'AB11679044742kBwLp6kykU3RbAETYIdwBX1nEIjDsw8mz2KXE',
//       })
//       try{
//           let resp = await axios.post('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',body,headers)
//           console.log(resp)
//       }catch(e){
//         console.log(e)
//       }
// }
// getToken()

// export const getCustomerInvoices = async(req,res)=>{
//     try {
//         const resp = await axios.post('https://sandbox-quickbooks.api.intuit.com/v3/company/4620816365258631820/query?minorversion=65',"select * from invoice",{ 
//             headers:{
//                 Authorization:'Bearer '+ process.env.accessToken
//             }
//         })
//         return res.status(200).json({resp})
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({data:"error check console",error})
//     }
// }


import QuickBooks from 'node-quickbooks'
import tokenDb from '../tokenDB.js'
import qboFn from '../config/Auth.js'
// var qbo = new QuickBooks(process.env.ClientID,
//     process.env.ClientSceret,
//     tokenDb[0]?.accessToken,
//     true, // no token secret for oAuth 2.0
//     "4620816365258631820",
//     true, // use the sandbox?
//     true, // enable debugging?
//     null, // set minorversion, or null for the latest version
//     '2.0', //oAuth version
//     tokenDb[0]?.refresh_token //refresh token
//     );

export const getCustomerInvoices = async(req,res)=>{
    try{

        let invoiceObj = {
            Line: [
              {
                Amount: 10.00,
                DetailType: "SalesItemLineDetail",
                SalesItemLineDetail: {
                  ItemRef: {
                    value: "6",
                    name: "Consultancy"
                  },
                  Qty:1
                }
              }
            ],
            CustomerRef: {
              value: "58"
            },
            DueDate:"2023-02-04"
          }

          if(!qbo){
            return res.status(400).json({data:"quickbook instance is not inistialize",error:true})
          }

          let resp = await qbo.getInvoice(152,(err,resp)=>{
            // console.log('err',err)
            // console.log(resp)
            return res.status(200).json({data:resp,error:false})
          })
        //   return res.status(200).json({data:resp,error:false})
    }catch(e){
        // console.log(e)
        return res.status(500).json({data:e,error:true})
    }
}

export const createCustomer = (req,res)=>{
    try {
        let customer = {
            "BillAddr": {
                "Line1": "Teachers society",
                "City": "Karachi",
                "Country": "Pakistan",
                "CountrySubDivisionCode": "PK",
                "PostalCode": "35000"
            },
            "Notes": "Here are other details.",
            "DisplayName": "Node.JS",
            "PrimaryPhone": {
                "FreeFormNumber": "0332 0018802"
            },
            "PrimaryEmailAddr": {
                "Address": "mudassirsiddiqui277@gmail.com"
            }
        }
        const resp = qbo.createCustomer(customer,(err,resp)=>{
            if(err){
                return res.status(400).json({data:err,error:true})
            }
            return res.status(201).json({data:resp,error:false})
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({data:error, error:true})
    }
}

export const getAllCustomers = async (req,res)=>{
    try{
        // if(!qbo){
        //     return res.status(400).json({data:"qbo instance in not initialize"})
        // }
        let qbo = qboFn(tokenDb)
        console.log(tokenDb)
        if(tokenDb.length==0)return res.status(400).json({data:"qbo instance not initialized",error:true})
        qbo.findCustomers(
            {fetchAll:true}
            ,(err,resp)=>{
                if(err){
                    return res.status(400).json({data:err,error:true})
                }
                console.log('token which I am looking',tokenDb)
                return res.status(200).json({data:resp,error:false})
            })
    }catch(err){
        // console.log(err)
        return res.status(500).json({data:err, error:true})
    }
}

export const createInvoice = async(req,res)=>{
    try {
        let {customerId} = req.body

        if(!customerId){
            return res.status(400).json({data:'customer id is required feild', error:true})
        }
        
        let invoice = {
            "Line": [
              {
                "Amount": 40.00,
                "DetailType": "SalesItemLineDetail",
                "SalesItemLineDetail": {
                  "ItemRef": {
                    "value": "6",
                    "name": "Consultancy"
                  },
                  "Qty":7
                }
              }
            ],
            "CustomerRef": {
              "value": customerId
            },
            "DueDate":"2023-02-04"
          }

          qbo.getCustomer(customerId,(error,resp)=>{
            if(error){
                return res.status(400).json({data:'customer not found',error:true})
            }

            qbo.createInvoice(invoice,(error,resp)=>{
                if(error){
                    return res.status(400).json({data:'create Invoice error',error:true})
                }
                return res.status(200).json({data:resp,error:false})
            })

            // console.log('what: ',resp)
            // return res.status(200).json({data:resp,error:false})
        })
    } catch (error) {
        console.log(err)
        return res.status(500).json({data:err, error:true})
    }
}

export const getAllCustomerInvoices = async (req,res)=>{
    
    try {
        qbo.findInvoices([{CustomerRef:req.params.cId}],(err,resp)=>{
            if(err){
                return res.status(400).json({data:err, error:true})
            }
            // console.log(resp.QueryResponse.Invoice.length)
            let newArr = resp.QueryResponse.Invoice.sort((a,b)=>new Date(a.TxnDate).getTime() - new Date(b.TxnDate).getTime())
            return res.status(200).json({data:newArr, error:false})
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({data:error, error:true})
    }
}

export const getAllPayments = async(req,res)=>{
    try {
         qbo.findPayments({CustomerRef:req.params.pId},(err,resp)=>{
            if(err){
                return res.status(400).json({data:err, error:true})
            }
            console.log(resp.QueryResponse.Payment.length)
            let newArr = resp.QueryResponse.Payment.sort((a,b)=>new Date(a.TxnDate).getTime() - new Date(b.TxnDate).getTime())
            return res.status(200).json({data:newArr, error:false})
        })
    } catch (error) {
        
    }
}